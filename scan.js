const chalk = require('chalk');

const helpers = require('./helpers');
const { Address, getAddress, checkXpub } = require('./address');
const { AddressType, blockstreamAPI, MAX_EXPLORATION } = require('./settings');
const { getTransactions } = require('./transactions')

// Option 1: one arg -> xpub
var args = process.argv.slice(2);
if (typeof args[0] === 'undefined') {
  console.log("Missing xpub");
  exit(1);
}

const xpub = args[0];
checkXpub(xpub);
const ownAddresses = generateOwnAddresses(xpub);

var account, index;
// Option 2: three args -> xpub account index
if (typeof args[2] !== 'undefined') {
  account = parseInt(args[1]);
  index = parseInt(args[2]);
}

// generate addresses associated with the xpub
function generateOwnAddresses(xpub) {
  var external = [], internal = [];

  [
      AddressType.LEGACY,
      AddressType.SEGWIT,
      AddressType.NATIVE
  ]
  .forEach(addressType => {
      for(var index = 0; index < 10000; ++index) {
          external.push(getAddress(addressType, xpub, 0, index));
          internal.push(getAddress(addressType, xpub, 1, index));
      }
  });

  return {
    external: external,
    internal: internal,
    all: internal.concat(external)
  };
}

function updateSummary(summary, addressType, value) {
  if(!summary.get(addressType)) {
    summary.set(addressType, value);
  }
  else {
    summary.get(addressType).totalBalance += value.totalBalance;
    summary.get(addressType).addresses.concat(value.addresses);
  }
}

function getLegacyOrSegWitStats(xpub) {

  const legacy = scanAddresses(AddressType.LEGACY, xpub);
  const segwit = scanAddresses(AddressType.SEGWIT, xpub);

  const totalBalance = legacy.totalBalance + segwit.totalBalance

  return {
    totalBalance: totalBalance,
    addresses: legacy.addresses.concat(segwit.addresses)
  };
}

function getStats(address) {
  const res = helpers.getJson(blockstreamAPI + address.toString());

  const funded_sum = res.chain_stats.funded_txo_sum;
  const spent_sum = res.chain_stats.spent_txo_sum;
  const balance = funded_sum - spent_sum;

  const stats = {
    txs_count: res.chain_stats.tx_count,
    funded_count: res.chain_stats.funded_txo_count,
    spent_count: res.chain_stats.spent_txo_count,
    funded_sum: funded_sum,
    spent_sum: spent_sum,
    balance: balance
  }

  address.setStats(stats);
}

// scan all active addresses
function scanAddresses(addressType, xpub) {
  helpers.logStatus("Scanning ".concat(chalk.bold(addressType)).concat(" addresses..."));

  var totalBalance = 0, noTxCounter = 0;
  var addresses = []

  for(var account = 0; account < 2; ++account) {
    const typeAccount = account == 0 ? "external" : "internal";

    helpers.logStatus("- scanning " + chalk.italic(typeAccount) + " addresses -");

    for(var index = 0; index < 1000; ++index) {
      const address = new Address(addressType, xpub, account, index)

      getStats(address);

      const addressStats = address.getStats();

      if (addressStats.txs_count == 0) {
        noTxCounter++;

        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(chalk.yellow("  (probing m/" + account + "/" + index + "...)"));

        // TODO: ensure that we can skip account 1
        if (account == 1 || noTxCounter >= MAX_EXPLORATION) {
          // if at account X index Y there is no transaction,
          // all active addresses for account X have been explored: break
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          helpers.logStatus("- " + chalk.italic(typeAccount) + " addresses scanned -");
          break;
        }

        continue;
      }
      else {
        noTxCounter = 0;
      }

      getTransactions(address, ownAddresses);

      totalBalance += addressStats.balance;

      address.setBalance(addressStats.balance);

      var tx = {
        funded: {
          count: addressStats.funded_count,
          sum: addressStats.funded_sum,
        },
        spent: {
          count: addressStats.spent_count,
          sum: addressStats.spent_sum,
        },
        txsCount: addressStats.txs_count
      };

      address.setStats(tx);
      
      helpers.displayAddress(address);

      addresses.push(address)      
    }
  }

  helpers.logStatus(addressType.concat(" addresses scanned\n"));

  return {
    totalBalance: totalBalance, // in satoshis
    addresses: addresses
    // TODO: return number of txs
  }
}

let summary = new Map();

if (typeof(index) === 'undefined') {
  console.log(chalk.bold("\nActive addresses"))
  // Option A: no index has been provided:
  //  - retrieve stats for legacy/SegWit
  //  - scan Native SegWit addresses
  const legacyOrSegwit = getLegacyOrSegWitStats(xpub);
  updateSummary(summary, AddressType.LEGACY_OR_SEGWIT, legacyOrSegwit);

  const nativeSegwit = scanAddresses(AddressType.NATIVE, xpub);
  updateSummary(summary, AddressType.NATIVE, nativeSegwit);

  helpers.displaySortedAddresses(legacyOrSegwit.addresses.concat(nativeSegwit.addresses)) // TODO: varargs
}
else {
  // Option B: an index has been provided:
  // derive all addresses at that account and index; then
  // check their respective balances
  [
    AddressType.LEGACY,
    AddressType.SEGWIT,
    AddressType.NATIVE
  ].forEach(addressType => {
    const address = new Address(addressType, xpub, account, index);
    const balance = getStats(address);

    updateSummary(summary, addressType, balance);
  })
}

console.log(chalk.bold("\nSummary"));

for (var [addressType, value] of summary.entries()) {
  helpers.showSummary(addressType, value);
}
