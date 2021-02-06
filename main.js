const util = require('util')
const bjs = require('bitcoinjs-lib')
const bip32 = require('bip32')
const rp = require('request-promise')
const sb = require('satoshi-bitcoin')
const chalk = require('chalk');

// Specify the xpub and the index of the address here
var xpub = 'xpub...'
var index = 0


var args = process.argv.slice(2)
if (typeof args[0] !== 'undefined' && typeof args[1] !== 'undefined') {
  xpub = args[0]
  index = parseInt(args[1])
}

const blockstreamAPI = 'https://blockstream.info/api/address/'
const blockchainAPI = 'https://blockchain.info/q/addressbalance/'

const AddressType = { "legacy" : 1, "native" : 2, "SegWit" : 3 }
Object.freeze(AddressType)

function getAddressType(address) {
  if (address.startsWith('bc1')) {
    return AddressType.native
  }
  else if (address.startsWith('3')) {
    return AddressType.SegWit
  }
  else if (address.startsWith('1')) {
    return AddressType.legacy
  }
  else {
    throw new Error(
      "INVALID ADDRESS: "
        .concat(address)
        .concat(" is not a valid address")
      )
  }
}

function getURI(addressType, address) {
  var url

  switch(addressType) {
    // native SegWit:
    // blockstream API
    case AddressType.native:
      url = blockstreamAPI.concat(address);
      break

    // legacy and SegWit: 
    // blockchain.info API
    case AddressType.legacy:
      /* fallthrough */
    case AddressType.SegWit:
      url = blockchainAPI.concat(address);
      break
  }

  return url
}

function extractBalance(addressType, response) {
  var balance

  switch(addressType) {
    // native SegWit:
    // blockstream API returns the balance in satoshis
    // using ['chain_stats']['funded_txo_sum'] path
    case AddressType.native:
      const satoshis = response.chain_stats.funded_txo_sum
      balance = sb.toBitcoin(satoshis)
      break

    // legacy and SegWit:
    // blockchain.info API returns the balance in satoshis
    // directly (at the root of the response)
    case AddressType.legacy:
      /* fallthrough */
    case AddressType.SegWit:
      balance = sb.toBitcoin(response)
      break
  }

  return balance
}

function checkBalance(address) {
  var addressType = getAddressType(address);

  // Type: 
  // key of enum corresponding to addressType
  const type = chalk.italic(
    Object
      .keys(AddressType)
      .find(key => AddressType[key] === addressType)
    )

  var options = {
      uri: getURI(addressType, address),
      json: true
  };

  rp(options)
    .then(function (response) {
      const balance = extractBalance(addressType, response)
      const status = type
        .concat("\t").concat(address)
        .concat(": ").concat(balance)

      // differenciate zero from non-zero balances
      // using grey v. blue colors
      if (balance == 0) {
        console.log(chalk.grey(status))
      }
      else {
        console.log(chalk.blueBright(status))
      }
    })
    .catch(function (err) {
      const error = type
        .concat("\t").concat(address)
        .concat(" [ERROR]: ").concat(err)

      console.log(chalk.red(error))
    });
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

function getAddresses(xpub, index) {
  // ensure that the xpub is a valid one
  checkXpub(xpub)

  var addresses = []

  addresses.push(getLegacyAddress(xpub, index))
  addresses.push(getNativeSegWitAddress(xpub, index))
  addresses.push(getSegWitAddress(xpub, index))

  return addresses
}

console.log(
  "Addresses derived from xpub "
    .concat(xpub.substr(0, 20))
    .concat("... at index ")
    .concat(index).concat("\n")
  )

getAddresses(xpub, index).forEach(address => {
  checkBalance(address)
})
