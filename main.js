const bjs = require('bitcoinjs-lib')
const bip32 = require('bip32')
const sb = require('satoshi-bitcoin')
const chalk = require('chalk')
const helpers = require('./helpers')

var xpub = 'xpub...'
var index = undefined
var account = undefined

// Option 1: one arg -> xpub
var args = process.argv.slice(2)
if (typeof args[0] !== 'undefined') {
  xpub = args[0]
}

// Option 2: three args -> xpub account index
if (typeof args[2] !== 'undefined') {
  account = parseInt(args[1])
  index = parseInt(args[2])
}

// blockchain.info API to retrieve the number of txs for a legacy or SegWit xpub
const blockchainAPI = 'https://blockchain.info/multiaddr?active='

// blockstream API to retrieve stats related to a given address
// (less rate limited than the blockchain.info one)
const blockstreamAPI = 'https://blockstream.info/api/address/'

const AddressType = { LEGACY: "legacy", NATIVE: "native", SEGWIT: "SegWit", LEGACY_OR_SEGWIT: "legacy/SegWit" }
Object.freeze(AddressType)

// infer address type from its syntax
function getAddressType(address) {
  var type = undefined

  if (address.startsWith('bc1')) {
    type = AddressType.NATIVE
  }
  else if (address.startsWith('3')) {
    type = AddressType.SEGWIT
  }
  else if (address.startsWith('1')) {
    type = AddressType.LEGACY
  }
  else {
    throw new Error(
      "INVALID ADDRESS: "
        .concat(address)
        .concat(" is not a valid address")
      )
  }

  return type
}

// get stats (balance, txs sum and count) for an address
function getStats(address) {
  const res = helpers.getJson(blockstreamAPI + address)
  const stats = res.chain_stats

  const funded = stats.funded_txo_sum
  const spent = stats.spent_txo_sum
  
  const balance = funded - spent

  return {
    address: res.address,
    balance: sb.toBitcoin(balance),
    funded_count: stats.funded_txo_count,
    funded_sum: sb.toBitcoin(funded),
    spent_count: stats.spent_txo_count,
    spent_sum: sb.toBitcoin(spent)
  }
}

// ensure that the xpub is a valid one
function checkXpub(xpub) {
  try {
    bip32.fromBase58(xpub)
  }
  catch (e) {
    throw new Error("INVALID XPUB: ".concat(xpub).concat(" is not a valid xpub"))
  }
}

// derive legacy address at account and index positions
function getLegacyAddress(xpub, account, index) {
  const { address } = bjs.payments.p2pkh({
    pubkey: bip32
      .fromBase58(xpub)
      .derive(account)
      .derive(index).publicKey,
  })

  return address
}

// derive native SegWit at account and index positions
function getNativeSegWitAddress(xpub, account, index) {
  const { address } = bjs.payments.p2wpkh({
      pubkey: bip32
        .fromBase58(xpub)
        .derive(account)
        .derive(index).publicKey,
  })

  return address
}

// derive SegWit at account and index positions
function getSegWitAddress(xpub, account, index) {
  const { address } = bjs.payments.p2sh({
    redeem: bjs.payments.p2wpkh({
      pubkey: bip32
        .fromBase58(xpub)
        .derive(account)
        .derive(index).publicKey,
    }),
  })

  return address
}

function getAddress(addressType, xpub, account, index) {
  switch(addressType) {
    case AddressType.LEGACY:
      return getLegacyAddress(xpub, account, index)
      break
    case AddressType.SEGWIT:
      return getSegWitAddress(xpub, account, index)
      break
    case AddressType.NATIVE:
      return getNativeSegWitAddress(xpub, account, index)
      break
  }
}

function updateSummary(summary, addressType, value) {
  if(!summary.get(addressType)) {
    summary.set(addressType, value)
  }
  else {
    summary.get(addressType).balance += value.balance
  }
}

function getLegacyOrSegWitInfos(xpub) {

  scanAddresses(AddressType.LEGACY, xpub)
  scanAddresses(AddressType.SEGWIT, xpub)

  helpers.logStatus("Fetching legacy/SegWit infos...\n")

  const baseUrl = blockchainAPI.concat(xpub).concat("&offset=")

  var balance = 0
  var uniqueTxs = new Set(); 

  // iterate over blockchain.info endpoint offset
  // in order to get all transactions hashs
  // and make them uniques
  for(var offset = 0; offset < 1000; offset += 10) {
    const url = baseUrl.concat(offset)
    const res = helpers.getJson(url)

    // retrieve the balance once
    if (offset == 0) {
      res.addresses.forEach(item => balance += item.final_balance)
    }

    const txs = res.txs

    // no txs found: 
    // no need to continue increasing the offset
    if (txs.length == 0) {
      break
    }

    txs.forEach(tx => uniqueTxs.add(tx.hash))
  }

  return {
    balance: sb.toBitcoin(balance),
    txs_count: uniqueTxs.size,
    txs: uniqueTxs
  }
}

function getSentTx(ownAddresses, knownAddresses, address) {
  const res = helpers.getJson(blockstreamAPI.concat(address).concat("/txs"))

  var sentAmount = 0
  var recipientAddresses = []
  var outTxs = []

  res.forEach(tx => {
    tx.vout.forEach(vout => {
      outTxs.push(vout)
    })
  })

  // are all out addresses internal ones?
  const sentToSelf = outTxs.every(v => ownAddresses.includes(v.scriptpubkey_address))

  if (sentToSelf) { 
    // edge case: self-sent transaction
    sentAmount = outTxs[0].value
  }
  else { 
    // common case: sent to external address
    for (var i = 0; i < outTxs.length; ++i) {
      const outAddress = outTxs[i].scriptpubkey_address

      // is it a known address?
      const knownAddress = knownAddresses.includes(outAddress)

      if (!knownAddress) {
        // sent to unknown address
        sentAmount = outTxs[i].value
        recipientAddresses.push(outAddress)
        break
      }
      else {
        // remove one instance of known external address at a time
        // to take into account subsequent funds sent to the same external address
        knownAddresses = knownAddresses.filter(a => a !== outAddress)
      }
    }
  }

  return {
    sent: sentAmount,
    sentToSelf: sentToSelf,
    addresses: recipientAddresses
  }
}

// generate addresses associated with the xpub
function generateOwnAddresses(addressType, xpub) {
  var changeAddresses = []

  for(var index = 0; index < 10000; ++index) {
    changeAddresses.push(getAddress(addressType, xpub, 0, index))
    changeAddresses.push(getAddress(addressType, xpub, 1, index))
  }

  return changeAddresses
}

// scan all active addresses
function scanAddresses(addressType, xpub) {
  helpers.logStatus("Scanning ".concat(chalk.bold(addressType)).concat(" addresses..."))

  var ownAddresses = generateOwnAddresses(addressType, xpub)
  var knownAddresses = ownAddresses
  var txs = []
  var totalBalance = 0

  for(var account = 0; account < 2 ; ++account) {
    helpers.logStatus("- scanning account " + account + " -")

    for(var index = 0; index < 1000; ++index) {
      const address = getAddress(addressType, xpub, account, index)
      const res = helpers.getJson(blockstreamAPI + address)

      const txs_count = res.chain_stats.tx_count
      //const total_received = res.chain_stats.funded_txo_sum
      const funded_count = res.chain_stats.funded_txo_count
      const spent_count = res.chain_stats.spent_txo_count
      const funded_sum = res.chain_stats.funded_txo_sum
      const spent_sum = res.chain_stats.spent_txo_sum

      if (txs_count == 0) {
        if (index == 0) {
          // if at account X index 0 there is no transaction,
          // all active addresses have been explored: return
          helpers.logStatus(addressType.concat(" addresses scanned\n"))
          return {
            balance: sb.toBitcoin(totalBalance),
            txs_count: txs.size,
            txs: txs
          } 
        }

        // if at account X index Y there is no transaction,
        // all active addresses for account X have been explored: break
        helpers.logStatus("- account " + account + " fully scanned -")
        break
      }

      const currentBalance = funded_sum - spent_sum

      // TODO?: totalBalance could be compared with the stat
      // returned by blockchain.info API
      // totalBalance += currentBalance

      // check sent transactions
      var sentTX = {} 
      if (spent_count > 0) {
        sentTX = getSentTx(ownAddresses, knownAddresses, address)
        knownAddresses = knownAddresses.concat(sentTX.addresses)
      }

      const sent = sentTX.sent || 0

      var tx = {
        address: res.address,
        balance: sb.toBitcoin(currentBalance),
        funded_count: funded_count,
        funded_sum: sb.toBitcoin(funded_sum),
        spent_count: spent_count,
        spent_sum: sb.toBitcoin(spent_sum),
        txs_count: txs_count,
        sent: sb.toBitcoin(sent),
        sentToSelf: sentTX.sentToSelf
      }
      
      helpers.logProgress(addressType, account, index, tx)

      txs.push(tx)
    }
  }
}

checkXpub(xpub)

let infos = new Map();

if (typeof(index) === 'undefined') {
  // Option A: no index has been provided:
  //  - retrieve stats for legacy/SegWit
  //  - scan Native SegWit addresses
  const legacyOrSegwit = getLegacyOrSegWitInfos(xpub)
  updateSummary(infos, AddressType.LEGACY_OR_SEGWIT, legacyOrSegwit)

  const nativeSegwit = scanAddresses(AddressType.NATIVE, xpub)
  updateSummary(infos, AddressType.NATIVE, nativeSegwit)
}
else {
  // Option B: an index has been provided:
  // derive all addresses at that account and index; then
  // check their respective balances
  [
    getLegacyAddress(xpub, account, index), 
    getSegWitAddress(xpub, account, index), 
    getNativeSegWitAddress(xpub, account, index)
  ].forEach(address => {

    const balance = getStats(address)
    const addressType = getAddressType(address)

    helpers.logProgress(addressType, account, index, balance)
    updateSummary(infos, addressType, balance)

  })
}

console.log(chalk.bold("\nSummary"))

for (var [addressType, value] of infos.entries()) {
  helpers.logTotal(addressType, value)
}
