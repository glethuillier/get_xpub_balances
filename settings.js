const AddressType = { LEGACY: "Legacy", NATIVE: "Native SegWit", SEGWIT: "SegWit", LEGACY_OR_SEGWIT: "Legacy/SegWit", ALL: "all"};
Object.freeze(AddressType);

// blockstream API to retrieve stats related to a given address
// (less rate limited than the blockchain.info one)
const bitcoinAPI = 'https://blockstream.info/api/address/';

// TODO(litecoin)
const litecoinAPI = 'https://api.blockcypher.com/v1/ltc/main/addrs/'

// max number of addresses to probe when checking a possible gap between derivation indices
// (that is: range of indices not used for derivation)
const MAX_EXPLORATION = 20;

// number of addresses to pre-generate (used for transactions analysis)
const ADDRESSES_PREGENERATION = 2000;

const VERBOSE = false;


const BITCOIN_NETWORK = {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bech32: 'bc',
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4,
    },
    pubKeyHash: 0x00,
    scriptHash: 0x05,
    wif: 0x80,
  };

// TODO(litecoin)
const LITECOIN_NETWORK = {
    messagePrefix: '\x19Litecoin Signed Message:\n',
    bech32: 'ltc',
    bip32: {
      public: 0x019da462,
      private: 0x019d9cfe
    },
    pubKeyHash: 0x30,
    scriptHash: 0x32,
    wif: 0xb0
  }

module.exports = { 
    AddressType, 
    bitcoinAPI, 
    MAX_EXPLORATION, 
    VERBOSE, 
    ADDRESSES_PREGENERATION,
    BITCOIN_NETWORK,
    LITECOIN_NETWORK
}