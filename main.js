const bjs = require('bitcoinjs-lib')
const bip32 = require('bip32')
const sb = require('satoshi-bitcoin')
const chalk = require('chalk')
const helpers = require('./helpers')

var xpub = 'xpub...'
var index = undefined

var args = process.argv.slice(2)
if (typeof args[0] !== 'undefined') {
  xpub = args[0]
}

if (typeof args[1] !== 'undefined') {
  index = parseInt(args[1])
}

const blockstreamAPI = 'https://blockstream.info/api/address/'
const blockchainBalanceAPI = 'https://blockchain.info/balance?active='
const blockchainFullAPI = 'https://blockchain.info/multiaddr?active='

const AddressType = { LEGACY: "legacy", NATIVE: "native SegWit", SEGWIT: "SegWit", LEGACY_OR_SEGWIT: "legacy/SegWit" }
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

function getURI(address) {
  var url

  switch(getAddressType(address)) {
    // native SegWit:
    // blockstream API
    case AddressType.NATIVE:
      url = blockstreamAPI.concat(address)
      break

    // legacy and SegWit: 
    // blockchain.info API
    case AddressType.LEGACY:
      /* fallthrough */
    case AddressType.SEGWIT:
      url = blockchainBalanceAPI.concat(address)
      break
  }

  return url
}

function extractBalance(addressType, address, response) {
  var balance
  var inSatoshis = false

  switch(addressType) {
    // native SegWit:
    // blockstream API returns the balance in satoshis
    // using ['chain_stats']['funded_txo_sum'] path
    case AddressType.NATIVE:
      balance = response.chain_stats.funded_txo_sum
      inSatoshis = true
      break

    // legacy and SegWit:
    // blockchain.info API returns the balance in satoshis
    // directly (root of the response)
    case AddressType.LEGACY:
      /* fallthrough */
    case AddressType.SEGWIT:
      balance = response.final_balance || response[address].final_balance
      inSatoshis = true
      break
  }

  // catch invalid balances (NaN)
  if (isNaN(balance)) {
    return chalk.red("[NaN] " + JSON.stringify(response))
  }

  // the balance is expected to be displayed in bitcoins
  if (inSatoshis) {
    return sb.toBitcoin(balance)
  }
  else {
    return balance
  }
}

function checkBalance(address, index) {
  const addressType = getAddressType(address)
  const body = helpers.getJson(getURI(address))
  const balance = extractBalance(addressType, address, body)

  return {
    balance: balance
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

// // for legacy and SegWit, just use the blockchain.info API
// // that automatically returns this kind of information
// function getTotalBalanceForLegacyAndSegWit(xpub) {
//   const body = helpers.getJson(blockchainFullAPI + xpub)
//   var address = undefined
//   var balance = 0
//   var addressType = AddressType.LEGACY && AddressType.SEGWIT

//   const txs = body.txs

//   // if there are transactions, fetch:
//   //  - balance
//   //  - address type
//   //  - max index used
//   if (Array.isArray(txs) && txs.length > 0) {
//     address = txs[0].inputs[0].prev_out.addr
//     addressType = getAddressType(address)
//     balance = extractBalance(addressType.type, address, body.addresses[0])
//     const maxIndex = body.addresses[0].account_index - 1

//     helpers.logProgress(addressType.string, maxIndex, "multiple addresses", {balance: balance})
//   }
  
//   return {
//     balance: balance,
//     addressType: addressType.string,
//     txs: txs.length
//   }
// }

function updateInfos(infos, addressType, value) {
  if(!infos.get(addressType)) {
    infos.set(addressType, value)
  }
  else {
    infos.get(addressType).balance += value.balance
  }
}

function getLegacyOrSegWitInfos(xpub) {
  console.log(chalk.italic("Fetching legacy/SegWit infos..."))

  const baseUrl = blockchainFullAPI.concat(xpub).concat("&offset=")

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
  console.log(chalk.italic("Scanning Native Segwit addresses..."))

  var txs = []
  var totalBalance = 0

  for(var account = 0; account < 10 ; ++account) {
    for(var index = 0; index < 1000; ++index) {
      const address = getAddress(addressType, xpub, account, index)
      const res = helpers.getJson(blockstreamAPI + address)

      const txs_count = res.chain_stats.tx_count
      const balance = res.chain_stats.funded_txo_sum
      const funded_count = res.chain_stats.funded_txo_count
      const spent_count = res.chain_stats.spent_txo_count
      const funded_sum = res.chain_stats.funded_txo_sum
      const spent_sum = res.chain_stats.spent_txo_sum

      totalBalance += funded_sum
      totalBalance -= spent_sum

      if (txs_count == 0) {
        if (index == 0) {
          console.log(chalk.italic("xpub explored"))
          return {
            balance: sb.toBitcoin(totalBalance),
            txs_count: txs.size,
            txs: txs
          } 
        }

        console.log(chalk.italic("account " + account + " explored"))
        break
      }

      var tx = {
        address: res.address,
        balance: balance,
        funded_count: funded_count,
        funded_sum: funded_sum,
        spent_count: spent_count,
        spent_sum: spent_sum,
        txs_count: txs_count
      }
      
      helpers.logProgress(addressType, account, index, tx)

      txs.push(tx)
    }
  }
}

checkXpub(xpub)

console.log(
  "Addresses derived from "
    .concat(xpub.substr(0, 20))
    .concat("...\n")
  )

let infos = new Map();

if (typeof(index) === 'undefined') {
  // Option A: no index has been provided:
  //  - retrieve info for legacy/SegWit
  //  - scan Native SegWit addresses
  const legacyOrSegwit = getLegacyOrSegWitInfos(xpub)
  updateInfos(infos, AddressType.LEGACY_OR_SEGWIT, legacyOrSegwit)

  if (legacyOrSegwit.txs_count == 0) {
    console.log(
      chalk.italic(
        "No transaction found for legacy or SegWit addresses. Scanning Native SegWit..."
      ))
    const nativeSegwit = scanAddresses(AddressType.NATIVE, xpub)
    updateInfos(infos, AddressType.NATIVE, nativeSegwit)
  }
  else {
    console.log(
      chalk.italic(
        "Transactions found on legacy or SegWit: Native Segwit skipped"
      ))
  }
}
else {
  // Option B: an index has been provided:
  // derive all addresses at that index and check
  // their respective balances
  [
    getLegacyAddress(xpub, index), 
    getSegWitAddress(xpub, index), 
    getNativeSegWitAddress(xpub, index)
  ].forEach(address => {
    const balance = checkBalance(address, index)
    const addressType = getAddressType(address).string
    helpers.logProgress(addressType, index, address, balance)
    updateInfos(infos, addressType, balance)
  })
}

console.log(chalk.bold("\nTotal balances"))

for (var [addressType, value] of infos.entries()) {
  helpers.logTotal(addressType, value)
}
