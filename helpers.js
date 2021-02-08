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


function logProgress(addressType, index, address, balance) {

    if (address === undefined) {
        address = "(multiple addresses)"
    }
    const progress = 
      chalk.italic(addressType)
        .concat("\t")
        .concat(index)
        .concat("\t")
        .concat(address)
        .concat(": ")
        .concat(balance)
  
    console.log(chalk.grey(progress))
  }

function logTotal(addressType, balance) {

    if (typeof(addressType) === 'undefined') {
        return
    }

    const type = chalk.italic(addressType)
    const status = 
      type
        .concat("\t")
        .concat(balance)
  
    if (balance == 0) {
      console.log(chalk.grey(status))
    }
    else {
      console.log(chalk.blueBright(status))
    }
  }

module.exports = { getJson, logProgress, logTotal }