const chalk = require('chalk');
const util = require('util')
const { exit } = require('process');
const { VERBOSE } = require('./settings')

function getTransactions(address, ownAddresses) {
    address.fetchRawTxs();
    preprocessTransactions(address);
    processFundedTransactions(address);

    processSentTransactions(address, ownAddresses);
}

// transforms raw transactions associated with an address
// into an array of processed transactions:
// [ { blocktime, txid, ins: [ { address, value }... ], outs: [ { address, value }...] } ]
function preprocessTransactions(address) {
    var txs = [];

    const rawTxs = address.getRawTxs();

    rawTxs.forEach(tx => {
        const blockTime = tx.status.block_time;

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
            blockTime: blockTime,
            txid: tx.txid,
            ins: ins,
            outs: outs
        })

    });

    // Example
    // [
    //     {
    //       blockTime: 1599829892,
    //       ins: [ { address: '1BwEdNZ7r8drLGbkxhinCLd1RDxNAnq3Z5', value: 50000 } ],
    //       outs: [
    //         { address: '1JKb34BANEtLLgpwGFm8CF6BdoE9soez8a', value: 10000 },
    //         { address: '183NM6MWjT3fNCtYp3dAa9g51iiW9TghFn', value: 20338 }
    //       ]
    //     },
    //     {
    //       blockTime: 1597083248,
    //       ins: [
    //         {
    //           address: 'bc1qeppkveqf7hp60s6nyya8t42ml5zhfe5mv8z502',
    //           value: 51885
    //         },
    //         {
    //           address: 'bc1qv76etu0vq80kezpfvydm5hle2uvzsdqfwgy24c',
    //           value: 15906
    //         },
    //         {
    //           address: 'bc1q94qxdwuzqkwkj3e6kjg2j3jlgvsxawtqh3hrgj',
    //           value: 10000
    //         }
    //       ],
    //       outs: [ { address: '1BwEdNZ7r8drLGbkxhinCLd1RDxNAnq3Z5', value: 50000 } ]
    //     }
    //   ]

    address.setTxs(txs);
}

function showTransactions(address) {
    console.dir(address.getTxs(), { depth: null });
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
                    blockTime: tx.blockTime,
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
                    blockTime: tx.blockTime,
                    amount: out.value
                });
            }

            // TODO: self: ownAddress.external
        })
    }

    address.setSent(sent);

    if (VERBOSE) {
        console.log('SENT\t', address.getSent());
    }
}

// Sort transactions by block time
// (reversed sort)
function getSortedTransactions(addresses) {
    var txs = [], processedTxs = [];

    addresses.forEach(address => {
  
      address.getFunded().forEach(tx => {
        txs.push(
          {
            address: address,
            amount: tx.amount,
            blockTime: tx.blockTime,
            type: 'funded'
          }
        )
      });
  
      address.getSent().forEach(tx => {  
        // only process a given txid once
        if (!processedTxs.includes(tx.txid)) {
  
          txs.push(
            {
              address: address,
              amount: -1 * tx.amount,
              blockTime: tx.blockTime,
              type: 'funded'
            }
          );
  
          processedTxs.push(tx.txid);
        }
      });
      
    });
  
    // reverse chronological order (based on block time)
    txs = txs.sort(function(a, b) {
      return b.blockTime - a.blockTime;
    });

    return txs;
}

module.exports = { getTransactions, getSortedTransactions }