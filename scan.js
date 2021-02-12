const chalk = require('chalk');

const helpers = require('./helpers');
const display = require('./display');

const { Address, getAddress } = require('./address');
const { AddressType, MAX_EXPLORATION, ADDRESSES_PREGENERATION } = require('./settings');
const { getStats, getTransactions } = require('./transactions')

// Option 1: one arg -> xpub
var args = process.argv.slice(2);
if (typeof args[0] === 'undefined') {
  console.log("Missing xpub");
  exit(1);
}

const xpub = args[0];

helpers.checkXpub(xpub);
const ownAddresses = generateOwnAddresses(xpub);

var account, index;
// Option 2: three args -> xpub account index
if (typeof args[2] !== 'undefined') {
  account = parseInt(args[1]);
  index = parseInt(args[2]);
}

// generate addresses associated with the xpub
function generateOwnAddresses(xpub) {
  display.transientLine(chalk.grey("pre-generating addresses..."));

  var external = [], internal = [];

  [
      AddressType.LEGACY,
      AddressType.SEGWIT,
      AddressType.NATIVE
  ]
  .forEach(addressType => {
      for(var index = 0; index < ADDRESSES_PREGENERATION; ++index) {
          external.push(getAddress(addressType, xpub, 0, index));
          internal.push(getAddress(addressType, xpub, 1, index));
      }
  });

  display.transientLine(/* delete line about addresses pre-generation */);

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
    summary.get(addressType).balance += value.balance;
    summary.get(addressType).addresses.concat(value.addresses);
  }
}

function getLegacyOrSegWitStats(xpub) {

  const legacy = scanAddresses(AddressType.LEGACY, xpub);
  const segwit = scanAddresses(AddressType.SEGWIT, xpub);

  const totalBalance = legacy.balance + segwit.balance

  return {
    balance: totalBalance,
    addresses: legacy.addresses.concat(segwit.addresses)
  };
}

// scan all active addresses
function scanAddresses(addressType, xpub) {
  const network = helpers.getNetwork(xpub);

  display.logStatus("Scanning ".concat(chalk.bold(addressType)).concat(" addresses..."));

  var totalBalance = 0, noTxCounter = 0;
  var addresses = []

  for(var account = 0; account < 2; ++account) {
    const typeAccount = account == 0 ? "external" : "internal";

    display.logStatus("- scanning " + chalk.italic(typeAccount) + " addresses -");

    noTxCounter = 0;

    for(var index = 0; index < 1000; ++index) {
      const address = new Address(network, addressType, xpub, account, index)
      display.displayAddress(address);

      const status = noTxCounter === 0 ? "analyzing" : "probing address gap"
      process.stdout.write(chalk.yellow(status + "..."));

      getStats(address);

      const addressStats = address.getStats();

      if (addressStats.txs_count == 0) {
        noTxCounter++;
        display.transientLine(/* delete address */);

        if (account == 1 || noTxCounter >= MAX_EXPLORATION) {
          // TODO: extend logic to account numbers > 1
          display.transientLine(/* delete last probing info */);
          display.logStatus("- " + chalk.italic(typeAccount) + " addresses scanned -");
          break;
        }

        continue;
      }
      else {
        noTxCounter = 0;
      }

      getTransactions(address, ownAddresses);

      totalBalance += address.getBalance();

      var tx = {
        funded: {
          count: addressStats.funded.count,
          sum: addressStats.funded.sum,
        },
        spent: {
          count: addressStats.spent.count,
          sum: addressStats.spent.sum,
        },
        txsCount: addressStats.txs_count
      };
      
      display.displayAddress(address);

      address.setStats(tx);

      addresses.push(address)      
    }
  }

  display.logStatus(addressType.concat(" addresses scanned\n"));

  return {
    balance: totalBalance, // in satoshis
    addresses: addresses
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

  display.displaySortedAddresses(legacyOrSegwit.addresses.concat(nativeSegwit.addresses))
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

    getStats(address);

    display.displayAddress(address);
    
    updateSummary(summary, addressType, address);
  })
}

console.log(chalk.bold("\nSummary"));

for (var [addressType, value] of summary.entries()) {
  display.showSummary(addressType, value);
}
