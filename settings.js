const AddressType = { LEGACY: "Legacy", NATIVE: "Native SegWit", SEGWIT: "SegWit", LEGACY_OR_SEGWIT: "Legacy/SegWit", ALL: "all"};
Object.freeze(AddressType);

// blockstream API to retrieve stats related to a given address
// (less rate limited than the blockchain.info one)
const blockstreamAPI = 'https://blockstream.info/api/address/';

// max number of addresses to probe when checking a possible gap between derivation indices
// (that is: range of indices not used for derivation)
const MAX_EXPLORATION = 20;

const VERBOSE = false;

module.exports = { VERBOSE, AddressType, blockstreamAPI, MAX_EXPLORATION }