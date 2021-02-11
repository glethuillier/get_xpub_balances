const request = require('sync-request');
const chalk = require('chalk');
const sb = require('satoshi-bitcoin');

const { AddressType } = require('./settings');
const { getSortedTransactions } = require('./transactions')

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
  const addressStats = address.getStats();

  const balance = String(sb.toBitcoin(address.getBalance()));
  const fundedSum = String(sb.toBitcoin(addressStats.funded.sum));

  // _type_  path  address ...
  var stats = 
    chalk.italic(addressType.padEnd(16, ' '))
      .concat(derivationPath.padEnd(12, ' '))
      .concat(address.toString().padEnd(46, ' '))
      .concat(balance.padEnd(16, ' '))
      .concat("+").concat(fundedSum.padEnd(10, ' ')).concat(" ←")

  // optional: spent sum
  if (typeof(addressStats.spent) !== 'undefined' && addressStats.spent.sum > 0) {
    const spentSum = String(sb.toBitcoin(addressStats.spent.sum));

    stats =
      stats
        .concat("\t-")
        .concat(spentSum.padEnd(10, ' '))
        .concat(" →");
  }

  console.log("  ".concat(stats))
}

function displaySortedAddresses(addresses) {
  console.log(chalk.bold("\nTransactions History").concat(chalk.redBright(" (beta feature)")));

  const txs = getSortedTransactions(addresses);

  txs.forEach(tx => {
    const amount = String(sb.toBitcoin(tx.amount));

    status = 
      chalk.grey(tx.blockHeight)
      .concat("\t")
      .concat(tx.address.toString())
      .concat("\t")
      .concat(amount.padEnd(12, ' '))

    if (amount >= 0) {
      status = status.concat(" ←");
    }
    else {
      status = status.concat(" →");
    }

    console.log(status);
  })

  console.log(chalk.bold("\nNumber of transactions"));
  console.log(chalk.whiteBright(txs.length))
}

function showSummary(addressType, value) {
  const balance = String(sb.toBitcoin(value.balance));
  
  if (balance == 0) {
    console.log(
      chalk.grey(
        addressType.padEnd(16, ' ')
          .concat(balance.padEnd(12, ' '))
      )
    );
  }
  else {
    console.log(
      chalk.whiteBright(
        addressType.padEnd(16, ' ')
      )
      .concat(
        chalk.greenBright(balance.padEnd(12, ' '))
      )
    );
  }
}

function logStatus(status) {
  console.log(chalk.dim(status));
}

module.exports = { getJson, showSummary, logStatus, displayAddress, displaySortedAddresses }