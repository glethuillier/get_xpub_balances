const request = require('sync-request');
const chalk = require('chalk');

const { AddressType } = require('./settings');

function getJson(url) {
    const res = request('GET', url);
  
    if (res.statusCode != 200) {
      throw new Error(
        "GET REQUEST ERROR: "
          .concat(url)
          .concat(", Status Code: ")
          .concat(res.statusCode)
        );
    }
  
    return JSON.parse(res.getBody('utf-8'));
  }

function displayAddress(address) {
  const addressType = address.getType()
  const account = address.getDerivation().account
  const index = address.getDerivation().index

  const derivationPath = String("m/".concat(account).concat("/").concat(index));

  // _type_  path  address ...
  var stats = 
    chalk.italic(addressType.padEnd(16, ' '))
      .concat(derivationPath.padEnd(12, ' '))
      .concat(address.toString().padEnd(46, ' '))

  if (typeof(address.getBalance()) !== 'undefined') {
    // option 1: display balance and txs stats
    const balance = String(address.getBalance())
    const fundedSum = String(address.getStats().funded_sum).padEnd(10, ' ');
    //const spentSum = String(address.getStats().spent_sum).padEnd(10, ' ');

    stats = 
      stats
        .concat("+" + fundedSum.padEnd(10, ' ')).concat(" ←") // funded tx
        //.concat("\t-")
        //.concat(spentSum).concat(" (").concat(address.getStats().spent_count).concat(") "); // spent tx
        .concat("\t\t" + balance)
  }
  else if (typeof(address.getSent()) !== 'undefined' && address.getSent().amount > 0) {
    // option 2: display sent amount
    stats =
      stats
        .concat("-")
        .concat(String(address.getSent().amount).padEnd(10, ' '))
      
    if (address.getSent().self) {
      stats = stats.concat(" ↺");
    }
    else {
      stats = stats.concat(" →");
    }
  }

  console.log("  ".concat(stats))
}

function showSummary(addressType, value) {
  const balance = String(value.totalBalance).padEnd(12, ' ');
  const txsCount = value.txsCount;

  const type = chalk.italic(addressType);

  var status = 
    type
      .concat("\t")
      .concat(balance);

  if (typeof(txsCount) !== 'undefined') {
    status = status
      .concat("\t")
      .concat(txsCount);

      if (txsCount < 2) {
        status = status.concat(" tx");
      }
      else {
        status = status.concat(" txs");
      }
  }
  
  if (balance == 0) {
    console.log(chalk.grey(status));
  }
  else {
    console.log(chalk.blueBright(status));
  }
}

function logStatus(status) {
  console.log(chalk.dim(status));
}

module.exports = { getJson, showSummary, logStatus, displayAddress }