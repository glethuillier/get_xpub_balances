const util = require('util')
const bjs = require('bitcoinjs-lib')
const bip32 = require('bip32')
const rp = require('request-promise');
const sb = require('satoshi-bitcoin');

// Specify the xpub and the index of the address here
var xpub = 'xpub...'
var index = 0


var args = process.argv.slice(2);
if (typeof args[0] !== 'undefined' && typeof args[1] !== 'undefined') {
  xpub = args[0]
  index = parseInt(args[1])
}

const blockstreamAPI = 'https://blockstream.info/api/address/'
const blockchainAPI = 'https://blockchain.info/q/addressbalance/'

const AddressType = { "legacy" : 1, "native" : 2, "segwit" : 3 }
Object.freeze(AddressType)

function getAddressType(address) {
  if (address.startsWith('bc1')) {
    return AddressType.native
  }
  else if (address.startsWith('3')) {
    return AddressType.segwit
  }
  else {
    return AddressType.legacy
  }
}

function getURL(addressType, address) {
  var url

  switch(addressType) {
    case AddressType.native:
      url = blockstreamAPI.concat(address);
      break
    case AddressType.legacy:
      /* fallthrough */
    case AddressType.segwit:
      url = blockchainAPI.concat(address);
      break
  }

  return url
}

function extractBalance(addressType, response) {
  var balance

  switch(addressType) {
    case AddressType.native:
      const satoshis = response.chain_stats.funded_txo_sum
      balance = sb.toBitcoin(satoshis)
      break
    case AddressType.legacy:
      /* fallthrough */
    case AddressType.segwit:
      balance = sb.toBitcoin(response)
      break
  }

  return balance
}

function checkBalance(address, index) {
  var addressType = getAddressType(address);

  var options = {
      uri: getURL(addressType, address),
      json: true
  };

  rp(options)
    .then(function (response) {
      console.log('\n' + Object.keys(AddressType).find(key => AddressType[key] === addressType))
      console.log(address + " (" + index + "): " + extractBalance(addressType, response))
    })
    .catch(function (err) {
      console.log(address + " (" + index + ") [ERROR]: " + err)
    });
}

function checkXpub(xpub) {
  try {
    bip32.fromBase58(xpub)
  }
  catch (e) {
    throw new Error("INVALID XPUB: " + xpub + " is not a valid xpub");
  }
}

function getNativeSegwitAddress(xpub, index) {
  const { address } = bjs.payments.p2wpkh({
      pubkey: bip32
        .fromBase58(xpub)
        .derive(0)
        .derive(index).publicKey,
  });

  return address
}

function getLegacyAddress(xpub, index) {
  const { address } = bjs.payments.p2pkh({
    pubkey: bip32
      .fromBase58(xpub)
      .derive(0)
      .derive(index).publicKey,
  });

  return address
}

function getSegwitAddress(xpub, index) {
  const { address } = bjs.payments.p2sh({
    redeem: bjs.payments.p2wpkh({
      pubkey: bip32
        .fromBase58(xpub)
        .derive(0)
        .derive(index).publicKey,
    }),
  });

  return address
}

function getAddresses(xpub, index) {
  // Ensure that the xpub is a valid one
  checkXpub(xpub)

  var addresses = []

  addresses.push(getLegacyAddress(xpub, index))
  addresses.push(getNativeSegwitAddress(xpub, index))
  addresses.push(getSegwitAddress(xpub, index))

  return addresses
}


const addresses = getAddresses(xpub, index)
addresses.forEach(address => {
  checkBalance(address, index)
})
