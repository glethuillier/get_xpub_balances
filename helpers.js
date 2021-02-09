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


function logProgress(addressType, account, index, item) {
  const derivationPath = String("m/" + account + "/" + index)
  var balance = String(item.balance)
  const address = item.address.padEnd(34, ' ')
  const fundedSum = String(item.funded_sum).padEnd(10, ' ')
  const spentSum = String(item.spent_sum).padEnd(10, ' ')
  const progress = 
      chalk.italic(addressType.padEnd(16, ' '))
        .concat(derivationPath.padEnd(12, ' '))
        .concat(address.padEnd(46, ' '))
        .concat(balance.padEnd(16, ' '))
        .concat("+" + fundedSum).concat(" (").concat(item.funded_count).concat(") ") // funded tx
        .concat("\t-")
        .concat(spentSum).concat(" (").concat(item.spent_count).concat(") ") // spent tx
  
    console.log("  ".concat(progress))
  }

function showSummary(addressType, value) {
  const balance = String(value.balance).padEnd(12, ' ')
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

      if (txs_count < 2) {
        status = status.concat(" tx")
      }
      else {
        status = status.concat(" txs")
      }
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

module.exports = { getJson, logProgress, logTotal: showSummary, logStatus }