// GENERAL
// -------
const VERBOSE = false;

// CHECK BALANCES
// --------------

const BITCOIN_API = 'https://blockstream.info/api/address/';

// TODO(litecoin)
// eslint-disable-next-line no-unused-vars
const LITECOIN_API = 'https://api.blockcypher.com/v1/ltc/main/addrs/'

// max number of addresses to probe when checking a possible gap between derivation indices
// (that is: range of indices not used for derivation)
const MAX_EXPLORATION = 20;

// number of addresses to pre-generate (used for transactions analysis)
const ADDRESSES_PREGENERATION = 2000;


// XPUB <> ADDRESS COMPARISON
// --------------------------

// scope of the derivation for the comparison
const DERIVATION_SCOPE = {
  
  // _quick search_
  // the common range from which addresses
  // are generally derived
  quick_search: {
    account: {
      min: 0,
      max: 4
    },
    index: {
      min: 0,
      max: 1000
    }
  },

  // _deep search_
  // an extended range for a deeper analysis,
  // initiated when quick search fails
  deep_search: {
    account: {
      min: 0,
      max: 1000
    },
    index: {
      min: 0,
      max: 100000
    }
  }
}


// DERIVATION PARAMETERS
// ---------------------

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


const AddressType = { 
  LEGACY: "Legacy",
  NATIVE: "Native SegWit",
  SEGWIT: "SegWit",
  LEGACY_OR_SEGWIT: "Legacy/SegWit",
  ALL: "All"
};
  
Object.freeze(AddressType);

module.exports = { 
    AddressType, 
    BITCOIN_API, 
    MAX_EXPLORATION, 
    VERBOSE, 
    ADDRESSES_PREGENERATION,
    BITCOIN_NETWORK,
    LITECOIN_NETWORK,
    DERIVATION_SCOPE
}