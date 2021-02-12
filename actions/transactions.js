const { VERBOSE, BITCOIN_NETWORK, LITECOIN_NETWORK } = require('../settings')
const bitcoin = require('../coins/bitcoin')

function getStats(address) {
    switch(global.network) {
        case BITCOIN_NETWORK:
            bitcoin.getStats(address);
            break;
        case LITECOIN_NETWORK:
            // TODO(litecoin)
            console.log('Not implemented yet');
            break;
    }
}

function getTransactions(address, derivedAddresses) {
    preprocessTransactions(address);
    processFundedTransactions(address);
    processSentTransactions(address, derivedAddresses);
}

// transforms raw transactions associated with an address
// into an array of processed transactions:
// [ { blockHeight, txid, ins: [ { address, value }... ], outs: [ { address, value }...] } ]
function preprocessTransactions(address) {
    switch(global.network) {
        case BITCOIN_NETWORK:
            bitcoin.getTxs(address);
            break;
        case LITECOIN_NETWORK:
            // TODO(litecoin)
            console.log('Not implemented yet');
            process.exit(1);
            break;
    }
}

// process amounts received
function processFundedTransactions(address) {
    // if change address: no funded txs
    if (address.getDerivation().account === 1) {
        address.setFunded([]);
        return;
    }

    const txs = address.getTxs();
    var funded = [];

    txs.forEach(tx => {
        tx.outs.forEach(out => {
            // select tx where address is in tx out
            if (out.address == address.toString()) {
                funded.push({
                    txid: tx.txid,
                    blockHeight: tx.blockHeight,
                    amount: out.value
                })
            }
        })
    })

    address.setFunded(funded);

    if (VERBOSE) {
        console.log('FUNDED\t', address.getFunded());
    }
}

// process amounts sent to relevant addresses
function processSentTransactions(address, derivedAddresses) {
    const txs = address.getTxs();
    var sent = []

    for(var i = 0; i < txs.length; ++i) {
        const tx = txs[i];
        const ins = tx.ins;
        const outs = tx.outs;
        const txid = tx.txid;

        // exclude addresses not present in txs ins
        if (!ins.some(transaction => transaction.address === address.toString())) {
            continue;
        }

        outs.forEach(out => {
            // exclude internal (i.e. change) addresses
            if (!derivedAddresses.internal.includes(out.address)) {
                sent.push({
                    txid: txid,
                    blockHeight: tx.blockHeight,
                    amount: out.value
                });
            }

            // TODO: self-sent (derivedAddresses.external)
        })
    }

    address.setSent(sent);

    if (VERBOSE) {
        console.log('SENT\t', address.getSent());
    }
}

// Sort transactions by block time
// (reversed ordering)
function getSortedTransactions(...addresses) {
    var txs = [], processedTxs = [];

    [].concat.apply([], addresses).forEach(address => {
  
        address.funded.forEach(tx => {
            txs.push(
            {
                address: address,
                amount: tx.amount,
                blockHeight: tx.blockHeight,
            }
            )
        });
    
        address.sent.forEach(tx => {  
            // only process a given txid once
            if (!processedTxs.includes(tx.txid)) {
    
            txs.push(
                {
                address: address,
                amount: -1 * tx.amount, // make it a negative number
                blockHeight: tx.blockHeight,
                }
            );
    
            processedTxs.push(tx.txid);
            }
        });
      
    });
  
    // reverse chronological order (based on block time)
    txs = txs.sort(function(a, b) {
      return b.blockHeight - a.blockHeight;
    });

    return txs;
}

// eslint-disable-next-line no-unused-vars
function showTransactions(address) {
    console.dir(address.getTxs(), { depth: null });
}

module.exports = { getStats, getTransactions, getSortedTransactions }