const bjs = require('bitcoinjs-lib')
const bip32 = require('bip32')
const sb = require('satoshi-bitcoin')
const chalk = require('chalk')
const helpers = require('./helpers')

var xpub = 'xpub...'
var index = undefined

// limit to the derivation of Native SegWit addresses:
// when a balance == 0 sequentially in this limit,
// the exploration is terminated
const maxExploration = 10

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

const AddressType = { "legacy" : 1, "native" : 2, "SegWit" : 3 }
Object.freeze(AddressType)


function getAddressType(address) {
  var type = undefined

  if (address.startsWith('bc1')) {
    type = AddressType.native
  }
  else if (address.startsWith('3')) {
    type = AddressType.SegWit
  }
  else if (address.startsWith('1')) {
    type = AddressType.legacy
  }
  else {
    throw new Error(
      "INVALID ADDRESS: "
        .concat(address)
        .concat(" is not a valid address")
      )
  }

  const typeAsString = Object
    .keys(AddressType)
    .find(key => AddressType[key] === type) 

  return {
    type: type, 
    string: typeAsString
  }
}

function getURI(address) {
  var url

  switch(getAddressType(address).type) {
    // native SegWit:
    // blockstream API
    case AddressType.native:
      url = blockstreamAPI.concat(address)
      break

    // legacy and SegWit: 
    // blockchain.info API
    case AddressType.legacy:
      /* fallthrough */
    case AddressType.SegWit:
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
    case AddressType.native:
      balance = response.chain_stats.funded_txo_sum
      inSatoshis = true
      break

    // legacy and SegWit:
    // blockchain.info API returns the balance in satoshis
    // directly (root of the response)
    case AddressType.legacy:
      /* fallthrough */
    case AddressType.SegWit:
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
  const balance = extractBalance(addressType.type, address, body)

  return balance
}

function checkXpub(xpub) {
  try {
    bip32.fromBase58(xpub)
  }
  catch (e) {
    throw new Error("INVALID XPUB: ".concat(xpub).concat(" is not a valid xpub"))
  }
}

function getNativeSegWitAddress(xpub, index) {
  const { address } = bjs.payments.p2wpkh({
      pubkey: bip32
        .fromBase58(xpub)
        .derive(0)
        .derive(index).publicKey,
  })

  return address
}

function getLegacyAddress(xpub, index) {
  const { address } = bjs.payments.p2pkh({
    pubkey: bip32
      .fromBase58(xpub)
      .derive(0)
      .derive(index).publicKey,
  })

  return address
}

function getSegWitAddress(xpub, index) {
  const { address } = bjs.payments.p2sh({
    redeem: bjs.payments.p2wpkh({
      pubkey: bip32
        .fromBase58(xpub)
        .derive(0)
        .derive(index).publicKey,
    }),
  })

  return address
}

function getAddress(addressType, xpub, index) {
  switch(addressType) {
    case AddressType.legacy:
      return getLegacyAddress(xpub, index);
      break
    case AddressType.native:
      return getNativeSegWitAddress(xpub, index)
      break
    case AddressType.SegWit:
      return getSegWitAddress(xpub, index)
      break
  }
}

// for legacy and SegWit, just use the blockchain.info API
// that automatically returns this kind of information
function getTotalBalanceForLegacyAndSegWit(xpub) {
  const body = helpers.getJson(blockchainFullAPI + xpub)
  var address = undefined
  var balance = 0
  var addressType = undefined

  const txs = body.txs

  // if there are transactions, fetch:
  //  - balance
  //  - address type
  //  - max index used
  if (Array.isArray(txs) && txs.length > 0) {
    address = txs[0].inputs[0].prev_out.addr
    addressType = getAddressType(address)
    balance = extractBalance(addressType.type, address, body.addresses[0])
    const maxIndex = body.addresses[0].account_index - 1

    helpers.logProgress(addressType.string, maxIndex, undefined, balance)
  }
  
  return {
    balance: balance,
    addressType: addressType
  }
}

// for native SegWit, derive addresses up to a certain point
// and check each balance
function getTotalBalanceForNative(xpub) {
  var totalBalance = 0
  var emptyBalance = 0
  
  for(var index = 0; index < maxExploration; ++index) {
    const address = getAddress(AddressType.native, xpub, index)
    const currentBalance = checkBalance(address, index)
  
    if (currentBalance == 0) {
      // if exploration limit is reached, terminate it
      if (emptyBalance >= maxExploration) {
          break
      }
  
      emptyBalance++
    }

      helpers.logProgress("native", index, address, currentBalance)
      totalBalance += currentBalance
      emptyBalance = 0
    }

  return totalBalance
}

function updateBalances(balances, addressType, currentBalance) {
  if(!balances.get(addressType)) {
    balances.set(addressType, {balance: currentBalance})
  }
  else {
    balances.get(addressType).balance += currentBalance;
  }
}


checkXpub(xpub)

console.log(
  "Addresses derived from "
    .concat(xpub.substr(0, 20))
    .concat("...\n")
  )

let balances = new Map();

if (typeof(index) === 'undefined') {
  // Option A: no index has been provided:
  //  - check all active legacy and SegWit addresses
  //  - explore Native SegWit addresses up to a certain point
  const legacyAndSegWit = getTotalBalanceForLegacyAndSegWit(xpub)
  updateBalances(balances, legacyAndSegWit.addressType, legacyAndSegWit.balance)
  updateBalances(balances, "native", getTotalBalanceForNative(xpub))
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
    updateBalances(balances, addressType, balance)
  })
}

console.log(chalk.bold("\nTotal balances"))

for (var [addressType, value] of balances.entries()) {
  helpers.logTotal(addressType, value.balance)
}
