const { LITECOIN_API } = require('../settings');
const helpers = require('../helpers');

// returns the basic stats related to an address:
// its balance, funded and spend sums and counts
function getStats(address) {
    const res = helpers.getJSON(LITECOIN_API.concat(address.toString()));
  
    const funded_sum = parseFloat(res.data.received_value);
    const balance = parseFloat(res.data.balance);
    const spent_sum = funded_sum - balance;

    const stats = {
      txs_count: res.data.total_txs,
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
    address.setRawTxs(res.data.txs);
}

// transforms raw transactions associated with an address
// into an array of processed transactions:
// [ { blockHeight, txid, ins: [ { address, value }... ], outs: [ { address, value }...] } ]
function getTxs(address) {
    // 1. get raw transactions
    const rawTxs = address.getRawTxs();

    // 2. parse raw transactions
    var txs = [];

    rawTxs.forEach(tx => {
        const blockHeight = tx.block_no;

        var ins = [], outs = [];

        if (tx.incoming != undefined) {   
            tx.incoming.inputs.forEach(vin => {       
                ins.push({
                    address: vin.address,
                    value: parseFloat(tx.incoming.value)
                })
            })
        }

        if (tx.outgoing != undefined) {
            tx.outgoing.outputs.forEach(vout => {     
                outs.push({
                    address: vout.address,
                    value: parseFloat(vout.value)
                })
            })
        }

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