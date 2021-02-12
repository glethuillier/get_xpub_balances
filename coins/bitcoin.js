const { BITCOIN_API } = require('../settings');
const helpers = require('../helpers');

// returns the basic stats related to an address:
// its balance, funded and spend sums and counts
function getStats(address) {
    const res = helpers.getJSON(BITCOIN_API + address.toString());
  
    const funded_sum = res.chain_stats.funded_txo_sum;
    const spent_sum = res.chain_stats.spent_txo_sum;
    const balance = funded_sum - spent_sum;
  
    const stats = {
      txs_count: res.chain_stats.tx_count,
      funded: {
        count: res.chain_stats.funded_txo_count,
        sum: funded_sum
      },
      spent: {
        count: res.chain_stats.spent_txo_count,
        sum: spent_sum
      }
    }
  
    address.setStats(stats);
    address.setBalance(balance);
}

// transforms raw transactions associated with an address
// into an array of processed transactions:
// [ { blockHeight, txid, ins: [ { address, value }... ], outs: [ { address, value }...] } ]
function getTxs(address) {
    // 1. fetch raw transactions
    const url = BITCOIN_API.concat(address.toString()).concat("/txs");
    const rawTxs = helpers.getJSON(url);

    // 2. parse raw transactions
    var txs = [];

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

module.exports = { getStats, getTxs }