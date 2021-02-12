const { LITECOIN_API } = require('../settings');
const helpers = require('../helpers');

// returns the basic stats related to an address:
// its balance, funded and spend sums and counts
function getStats(address) {
    const res = helpers.getJSON(LITECOIN_API.concat(address.toString()));
  
    const funded_sum = res.total_received;
    const spent_sum = res.total_sent;
    const balance = funded_sum - spent_sum;
  
    const stats = {
      txs_count: res.n_tx,
      funded: {
        count: undefined, // TODO
        sum: funded_sum
      },
      spent: {
        count: undefined, // TODO
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
    const url = LITECOIN_API.concat(address.toString()).concat("/full");
    const rawTxs = helpers.getJSON(url);

    // 2. parse raw transactions
    var txs = [];

    rawTxs.txs.forEach(tx => {
        const blockHeight = tx.block_height;

        var ins = [], outs = [];

        tx.inputs.forEach(vin => {
            const value = vin.output_value;
            vin.addresses.forEach(address => {
                ins.push({
                    address: address,
                    value: value
                })
            })
        })

        tx.outputs.forEach(vout => {
            const value = vout.value;
            vout.addresses.forEach(address => {
                outs.push({
                    address: address,
                    value: value
                })
            })
        })

        txs.push({
            blockHeight: blockHeight,
            txid: tx.hash,
            ins: ins,
            outs: outs
        })

    });

    address.setTxs(txs);
}

module.exports = { getStats, getTxs }