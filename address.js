const bjs = require('bitcoinjs-lib');
const bip32 = require('bip32');

const { AddressType } = require('./settings');
const helpers = require('./helpers');
const { blockstreamAPI } = require('./settings');

class Address {
    constructor(type, xpub, account, index) {
      this.xpub = xpub;
      this.address = getAddress(type, xpub, account, index);
      this.type = type;
      this.account = account;
      this.index = index;
    }

    getXpub() {
      return this.xpub;
    }

    fetchRawTxs() {
      this.rawTxs = fetchTxs(this.address);
    }

    setTxs(txs) {
      this.txs = txs;
    }
  
    setBalance(balance) {
        this.balance = balance;
    }
  
    setStats(stats) {
      this.stats = stats;
    }

    setFunded(funded) {
      this.funded = funded;
    }

    getFunded() {
      return this.funded;
    }

    setSent(sent) {
      this.sent = sent;
    }

    getSent() {
      return this.sent;
    }
  
    toString() {
      return this.address;
    }
  
    getType() {
      return this.type;
    }
  
    getDerivation() {
      return {
        account: this.account,
        index: this.index
      }
    }
  
    getBalance() {
      return this.balance;
    }
  
    getStats() {
      return this.stats
    }

    getRawTxs() {
      return this.rawTxs;
    }

    getTxs() {
      return this.txs;
    }
  }

function fetchTxs(address) {
  return helpers.getJson(blockstreamAPI.concat(address.toString()).concat("/txs"))
}

// derive legacy address at account and index positions
function getLegacyAddress(xpub, account, index) {
    const { address } = bjs.payments.p2pkh({
      pubkey: bip32
        .fromBase58(xpub)
        .derive(account)
        .derive(index).publicKey,
    });
  
    return address;
  }
  
  // derive native SegWit at account and index positions
  function getNativeSegWitAddress(xpub, account, index) {
    const { address } = bjs.payments.p2wpkh({
        pubkey: bip32
          .fromBase58(xpub)
          .derive(account)
          .derive(index).publicKey,
    });
  
    return address;
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
    });
  
    return address;
  }
  
  function getAddress(addressType, xpub, account, index) {
    switch(addressType) {
      case AddressType.LEGACY:
        return getLegacyAddress(xpub, account, index);
      case AddressType.SEGWIT:
        return getSegWitAddress(xpub, account, index);
      case AddressType.NATIVE:
        return getNativeSegWitAddress(xpub, account, index);
      case AddressType.ALL:
        return [
            {
                type: AddressType.LEGACY,
                address: getLegacyAddress(xpub, account, index)
            },
            {
                type: AddressType.SEGWIT,
                address: getSegWitAddress(xpub, account, index)
            },
            {
                type: AddressType.NATIVE,
                address: getNativeSegWitAddress(xpub, account, index)
            }
        ];
    }
  }

  // ensure that the xpub is a valid one
function checkXpub(xpub) {
    try {
      bip32.fromBase58(xpub);
    }
    catch (e) {
      throw new Error("INVALID XPUB: " + xpub + " is not a valid xpub");
    }
  }

// infer address type from its syntax
function getAddressType(address) {
    if (address.startsWith('bc1')) {
      return AddressType.NATIVE;
    }
    else if (address.startsWith('3')) {
      return AddressType.SEGWIT;
    }
    else if (address.startsWith('1')) {
      return AddressType.LEGACY;
    }
    else {
      throw new Error(
        "INVALID ADDRESS: "
          .concat(address)
          .concat(" is not a valid address")
        );
    }
  }

  module.exports = { Address, getAddress, checkXpub }