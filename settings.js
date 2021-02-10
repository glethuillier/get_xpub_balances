const AddressType = { LEGACY: "legacy", NATIVE: "native", SEGWIT: "SegWit", LEGACY_OR_SEGWIT: "legacy/SegWit", ALL: "all"};
Object.freeze(AddressType);

// blockchain.info API to retrieve the number of txs for a legacy or SegWit xpub
const blockchainAPI = 'https://blockchain.info/multiaddr?active=';

// blockstream API to retrieve stats related to a given address
// (less rate limited than the blockchain.info one)
const blockstreamAPI = 'https://blockstream.info/api/address/';

const MAX_EXPLORATION = 20;

module.exports = { AddressType, blockchainAPI, blockstreamAPI, MAX_EXPLORATION }