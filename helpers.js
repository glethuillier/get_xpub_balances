const request = require('sync-request');
const chalk = require('chalk')

function getJson(url) {
    const res = request('GET', url)
  
    if (res.statusCode != 200) {
      throw new Error(
        "GET REQUEST ERROR: "
          .concat(url)
          .concat(", Status Code: ")
          .concat(res.statusCode)
        )
    }
  
    return JSON.parse(res.getBody('utf-8'))
  }


function logProgress(addressType, account, index, tx) {
  const progress = 
      chalk.italic(addressType)
        .concat("\tM/").concat(account).concat("/").concat(index) // derivation path
        .concat("\t").concat(tx.address).concat(": ") // address
        .concat(tx.balance) // balance
        .concat("\t\ttxs: -").concat(tx.funded_sum).concat(" (").concat(tx.funded_count).concat(") ") // funded tx
        .concat("\t+").concat(tx.spent_sum).concat(" (").concat(tx.spent_count).concat(") ") // spent tx
  
    console.log(progress)
  }

function logTotal(addressType, value) {

  const balance = value.balance
  const txs_count = value.txs_count

  const type = chalk.italic(addressType)

  if (Object.keys(value).length === 0) {
    var status = 
    type
      .concat("\t(skipped)")

    console.log(chalk.grey(status)) 
    return
  }

  var status = 
    type
      .concat("\t")
      .concat(balance)

  if (typeof(txs_count) !== 'undefined') {
    status = status
      .concat("\t")
      .concat(txs_count)
      .concat(" txs")
  }
  
  if (balance == 0) {
    console.log(chalk.grey(status))
  }
  else {
    console.log(chalk.blueBright(status))
  }
}

function logStatus(status) {
  console.log(chalk.dim(status))
}

module.exports = { getJson, logProgress, logTotal, logStatus }