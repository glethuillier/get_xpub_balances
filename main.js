const bjs = require('bitcoinjs-lib')
const bip32 = require('bip32')
const sb = require('satoshi-bitcoin')
const chalk = require('chalk')
const helpers = require('./helpers')

var xpub = 'xpub...'
var index = undefined
var account = undefined

var args = process.argv.slice(2)
if (typeof args[0] !== 'undefined') {
  xpub = args[0]
}

if (typeof args[2] !== 'undefined') {
  account = parseInt(args[1])
  index = parseInt(args[2])
}

const blockstreamAPI = 'https://blockstream.info/api/address/'
const blockchainAPI = 'https://blockchain.info/multiaddr?active='

const AddressType = { LEGACY: "legacy", NATIVE: "native", SEGWIT: "SegWit", LEGACY_OR_SEGWIT: "legacy/SegWit" }
Object.freeze(AddressType)

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

function checkBalance(address, index) {
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

function checkXpub(xpub) {
  try {
    bip32.fromBase58(xpub)
  }
  catch (e) {
    throw new Error("INVALID XPUB: ".concat(xpub).concat(" is not a valid xpub"))
  }
}

function getNativeSegWitAddress(xpub, account, index) {
  const { address } = bjs.payments.p2wpkh({
      pubkey: bip32
        .fromBase58(xpub)
        .derive(account)
        .derive(index).publicKey,
  })

  return address
}

function getLegacyAddress(xpub, account, index) {
  const { address } = bjs.payments.p2pkh({
    pubkey: bip32
      .fromBase58(xpub)
      .derive(account)
      .derive(index).publicKey,
  })

  return address
}

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

function updateInfos(infos, addressType, value) {
  if(!infos.get(addressType)) {
    infos.set(addressType, value)
  }
  else {
    infos.get(addressType).balance += value.balance
  }
}

function getLegacyOrSegWitInfos(xpub) {

  scanAddresses(AddressType.LEGACY, xpub)
  scanAddresses(AddressType.SEGWIT, xpub)

  helpers.logStatus("Fetching legacy/SegWit infos...\n")

  const baseUrl = blockchainAPI.concat(xpub).concat("&offset=")

  var balance = 0
  var uniqueTxs = new Set(); 

  for(var offset = 0; offset < 1000; offset += 10) {
    const url = baseUrl.concat(offset)
    const res = helpers.getJson(url)

    if (offset == 0) {
      res.addresses.forEach(item => balance += item.final_balance)
    }
    const txs = res.txs

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

function scanAddresses(addressType, xpub) {
  helpers.logStatus("Scanning ".concat(chalk.bold(addressType)).concat(" addresses..."))

  var txs = []
  var totalBalance = 0

  for(var account = 0; account < 10 ; ++account) {
    helpers.logStatus("- scanning account " + account + " -")

    for(var index = 0; index < 1000; ++index) {
      const address = getAddress(addressType, xpub, account, index)
      const res = helpers.getJson(blockstreamAPI + address)

      const txs_count = res.chain_stats.tx_count
      const total_received = res.chain_stats.funded_txo_sum
      const funded_count = res.chain_stats.funded_txo_count
      const spent_count = res.chain_stats.spent_txo_count
      const funded_sum = res.chain_stats.funded_txo_sum
      const spent_sum = res.chain_stats.spent_txo_sum

      if (txs_count == 0) {
        if (index == 0) {
          helpers.logStatus(addressType.concat(" addresses scanned\n"))
          return {
            balance: sb.toBitcoin(totalBalance),
            txs_count: txs.size,
            txs: txs
          } 
        }

        helpers.logStatus("- account " + account + " fully scanned -")
        break
      }

      var currentBalance = 0
      currentBalance += funded_sum
      currentBalance -= spent_sum

      totalBalance += currentBalance

      var tx = {
        address: res.address,
        balance: sb.toBitcoin(currentBalance),
        funded_count: funded_count,
        funded_sum: sb.toBitcoin(funded_sum),
        spent_count: spent_count,
        spent_sum: sb.toBitcoin(spent_sum),
        txs_count: txs_count
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
  //  - retrieve info for legacy/SegWit
  //  - scan Native SegWit addresses
  const legacyOrSegwit = getLegacyOrSegWitInfos(xpub)
  updateInfos(infos, AddressType.LEGACY_OR_SEGWIT, legacyOrSegwit)

  const nativeSegwit = scanAddresses(AddressType.NATIVE, xpub)
  updateInfos(infos, AddressType.NATIVE, nativeSegwit)
}
else {
  // Option B: an index has been provided:
  // derive all addresses at that index and check
  // their respective balances
  [
    getLegacyAddress(xpub, account, index), 
    getSegWitAddress(xpub, account, index), 
    getNativeSegWitAddress(xpub, account, index)
  ].forEach(address => {
    const balance = checkBalance(address, index)
    const addressType = getAddressType(address)
    helpers.logProgress(addressType, account, index, balance)
    updateInfos(infos, addressType, balance)
  })
}

// function logProgress(addressType, account, index, tx)

console.log(chalk.bold("\nTotal balances"))

for (var [addressType, value] of infos.entries()) {
  helpers.logTotal(addressType, value)
}
