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
  const addressStats = address.getStats()

  // _type_  path  address ...
  var stats = 
    chalk.italic(addressType.padEnd(16, ' '))
      .concat(derivationPath.padEnd(12, ' '))
      .concat(address.toString().padEnd(46, ' '))

    // show balance
    if (typeof(address.getBalance()) !== 'undefined') {
      // option 1: display balance and txs stats
      const balance = String(address.getBalance()).padEnd(16, ' ');
      
      //const spentSum = String(address.getStats().spent_sum).padEnd(10, ' ');
    

      const fundedSum = String(address.getStats().funded.amount).padEnd(10, ' ');
      stats = 
          stats
            .concat(balance)
            .concat("+" + fundedSum).concat(" ←") // funded tx
            //.concat("\t-")
            //.concat(spentSum).concat(" (").concat(address.getStats().spent_count).concat(") "); // spent tx
  }

  // stats
  if (typeof(addressStats) !== 'undefined' && typeof(addressStats.sent.amount) !== 'undefined' && addressStats.sent.amount > 0) {
    // option 2: display sent amount
    stats =
      stats
        .concat("\t-")
        .concat(String(addressStats.sent.amount).padEnd(10, ' '))
      
    if (addressStats.sent.self) {
      stats = stats.concat(" ↺");
    }
    else {
      stats = stats.concat(" →");
    }
  }

  console.log("  ".concat(stats))
}

function displaySortedAddresses(addresses) {
  console.log(chalk.bold("\nSorted Addresses"));

  var dates = []

  addresses.forEach(address => {
    address.stats.funded.txs.forEach(tx => {
      dates.push(
        {
          address: address,
          amount: tx.amount,
          date: tx.date,
          type: 'funded'
        }
      )
    })

    const sentDate = address.stats.sent.date
    if (sentDate != undefined) {
      dates.push(
        {
          address: address,
          amount: -1 * (address.stats.sent.amount),
          date: sentDate,
          type: 'sent'
        }
      )
    }
  })

  // handle amounts in same block



  dates = dates.sort(function(a, b) {
    return b.date - a.date;
  });

  dates.forEach(item => {
    const amount = item.amount;

    status = 
      chalk.grey(item.date)
      .concat("\t")
      .concat(item.address.toString())
      .concat("\t")
      .concat(String(amount).padEnd(10, ' '))

    if (amount >= 0) {
      status = status.concat(" ←");
    }
    else {
      status = status.concat(" →");
    }

    console.log(status);
  })
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

module.exports = { getJson, showSummary, logStatus, displayAddress, displaySortedAddresses }