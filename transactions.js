const { VERBOSE } = require('./settings')

function getTransactions(address, ownAddresses) {
    address.fetchRawTxs();
    preprocessTransactions(address);
    processFundedTransactions(address);
    processSentTransactions(address, ownAddresses);
}

// transforms raw transactions associated with an address
// into an array of processed transactions:
// [ { blockHeight, txid, ins: [ { address, value }... ], outs: [ { address, value }...] } ]
function preprocessTransactions(address) {
    var txs = [];

    const rawTxs = address.getRawTxs();

    rawTxs.forEach(tx => {
        const blockHeight = tx.status.block_height;

        var ins = [], outs = [];

        tx.vin.forEach(vin => {
            ins.push({
                address: vin.prevout.scriptpubkey_address,
                value: vin.prevout.value
            })
        })

        tx.vout.forEach(vout => {
            outs.push({
                address: vout.scriptpubkey_address,
                value: vout.value
            })
        })

        txs.push({
            blockHeight: blockHeight,
            txid: tx.txid,
            ins: ins,
            outs: outs
        })

    });

    address.setTxs(txs);
}

// process amounts received
function processFundedTransactions(address) {
    // if change address: no funded txs
    if (address.getDerivation().account === 1) {
        address.setFunded([]);
        return;
    }

    const txs = address.getTxs();
    var funded = []

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
function processSentTransactions(address, ownAddresses) {
    const txs = address.getTxs();
    var sent = []

    //showTransactions(address)

    for(var i = 0; i < txs.length; ++i) {
        const tx = txs[i];
        const ins = tx.ins;
        const outs = tx.outs;
        const txid = tx.txid;

        // exclude addresses not present in txs ins
        if (!ins.some(el => el.address === address.toString())) {
            continue;
        }

        outs.forEach(out => {
            // exclude change addresses
            if (!ownAddresses.internal.includes(out.address)) {
                sent.push({
                    txid: txid,
                    blockHeight: tx.blockHeight,
                    amount: out.value
                });
            }

            // TODO: self (ownAddress.external)
        })
    }

    address.setSent(sent);

    if (VERBOSE) {
        console.log('SENT\t', address.getSent());
    }
}

// Sort transactions by block time
// (reversed ordering)
function getSortedTransactions(addresses) {
    var txs = [], processedTxs = [];

    addresses.forEach(address => {
  
      address.getFunded().forEach(tx => {
        txs.push(
          {
            address: address,
            amount: tx.amount,
            blockHeight: tx.blockHeight,
          }
        )
      });
  
      address.getSent().forEach(tx => {  
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

function showTransactions(address) {
    console.dir(address.getTxs(), { depth: null });
}

module.exports = { getTransactions, getSortedTransactions }