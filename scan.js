const sb = require('satoshi-bitcoin');
const chalk = require('chalk');

const helpers = require('./helpers');
const { Address, getAddress, checkXpub } = require('./address');
const { AddressType, blockchainAPI, blockstreamAPI, MAX_EXPLORATION } = require('./settings');

// Option 1: one arg -> xpub
var args = process.argv.slice(2);
if (typeof args[0] === 'undefined') {
  console.log("Missing xpub");
  exit(1);
}

const xpub = args[0];
checkXpub(xpub);

var account, index;
// Option 2: three args -> xpub account index
if (typeof args[2] !== 'undefined') {
  account = parseInt(args[1]);
  index = parseInt(args[2]);
}

// get stats (balance, txs sum and count) for an address
function getStats(address) {
  const res = helpers.getJson(blockstreamAPI + address.toString());
  const stats = res.chain_stats;

  const funded = stats.funded_txo_sum;
  const spent = stats.spent_txo_sum;
  
  const balance = funded - spent;

  address.setBalance(balance);
  address.setStats({
    funded_sum: sb.toBitcoin(funded),
    spent_sum: sb.toBitcoin(spent)
  })

  helpers.displayAddress(address);

  return {
    totalBalance: sb.toBitcoin(balance)
  };
}

function updateSummary(summary, addressType, value) {
  if(!summary.get(addressType)) {
    summary.set(addressType, value);
  }
  else {
    summary.get(addressType).totalBalance += value.totalBalance;
  }
}

function getLegacyOrSegWitInfos(xpub) {

  scanAddresses(AddressType.LEGACY, xpub);
  scanAddresses(AddressType.SEGWIT, xpub);

  helpers.logStatus("Fetching legacy/SegWit infos...\n");

  const baseUrl = blockchainAPI.concat(xpub).concat("&offset=");

  var balance = 0;
  var uniqueTxs = new Set(); 

  // iterate over blockchain.info endpoint offset
  // in order to get all transactions hashs
  // and make them uniques
  for(var offset = 0; offset < 1000; offset += 10) {
    const url = baseUrl.concat(offset);
    const res = helpers.getJson(url);

    // retrieve the balance once
    if (offset == 0) {
      res.addresses.forEach(item => balance += item.final_balance);
    }

    const txs = res.txs;

    // no txs found: 
    // no need to continue increasing the offset
    if (txs.length === 0) {
      break;
    }

    txs.forEach(tx => uniqueTxs.add(tx.hash));
  }

  return {
    totalBalance: sb.toBitcoin(balance),
    txsCount: uniqueTxs.size,
  };
}

function getsentTx(ownAddresses, knownAddresses, address) {
  const res = helpers.getJson(blockstreamAPI.concat(address.toString()).concat("/txs"));

  var sentAmount = 0;
  var recipientAddresses = [];
  var outTxs = [];

  res.forEach(tx => {
    tx.vout.forEach(vout => {
      outTxs.push(vout);
    })
  })

  // are all out addresses internal ones?
  const selfSent = outTxs.every(v => ownAddresses.includes(v.scriptpubkey_address));

  if (selfSent) { 
    // edge case: self-sent transaction
    sentAmount = outTxs[0].value;
  }
  else { 
    // common case: sent to external address
    for (var i = 0; i < outTxs.length; ++i) {
      const outAddress = outTxs[i].scriptpubkey_address;

      // is it a known address?
      const knownAddress = knownAddresses.includes(outAddress);

      if (!knownAddress) {
        // sent to unknown address
        sentAmount = outTxs[i].value;
        recipientAddresses.push(outAddress);
        break
      }
      else {
        // remove one instance of known external address at a time
        // to take into account subsequent funds sent to the same external address
        knownAddresses = knownAddresses.filter(a => a !== outAddress);
      }
    }
  }

  address.setSent(sb.toBitcoin(sentAmount), selfSent)

  if (sentAmount > 0) {
    helpers.displayAddress(address)
  }

  return {
    recipientAddresses: recipientAddresses
  };
}

// generate addresses associated with the xpub
function generateOwnAddresses(addressType, xpub) {
  var changeAddresses = [];

  for(var index = 0; index < 10000; ++index) {
    changeAddresses.push(getAddress(addressType, xpub, 0, index));
    changeAddresses.push(getAddress(addressType, xpub, 1, index));
  }

  return changeAddresses;
}

// scan all active addresses
function scanAddresses(addressType, xpub) {
  helpers.logStatus("Scanning ".concat(chalk.bold(addressType)).concat(" addresses..."));

  var ownAddresses = generateOwnAddresses(addressType, xpub);
  var knownAddresses = ownAddresses;
  var txs = [];
  var totalBalance = 0;
  var noTxCounter = 0;

  for(var account = 0; account < 2; ++account) {
    helpers.logStatus("- scanning account " + account + " -");

    for(var index = 0; index < 1000; ++index) {
      const address = new Address(addressType, xpub, account, index)
      const res = helpers.getJson(blockstreamAPI + address.toString());

      const txsCount = res.chain_stats.tx_count;
      //const total_received = res.chain_stats.funded_txo_sum;
      const funded_count = res.chain_stats.funded_txo_count;
      const spent_count = res.chain_stats.spent_txo_count;
      const funded_sum = res.chain_stats.funded_txo_sum;
      const spent_sum = res.chain_stats.spent_txo_sum;

      if (txsCount == 0) {
        noTxCounter++;

        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(chalk.yellow("  (probing m/" + account + "/" + index + ")"));

        if (noTxCounter >= MAX_EXPLORATION) {
          // if at account X index Y there is no transaction,
          // all active addresses for account X have been explored: break
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          helpers.logStatus("- account " + account + " fully scanned -");
          break;
        }

        continue;
      }
      else {
        noTxCounter = 0;
      }

      const currentBalance = funded_sum - spent_sum;

      totalBalance += currentBalance;

      // check sent transactions
      var sentTx = {} 
      if (spent_count > 0) {
        sentTx = getsentTx(ownAddresses, knownAddresses, address);
        knownAddresses = knownAddresses.concat(sentTx.recipientAddresses);
      }

      address.setBalance(sb.toBitcoin(currentBalance));

      var tx = {
        funded_count: funded_count,
        funded_sum: sb.toBitcoin(funded_sum),
        spent_count: spent_count,
        spent_sum: sb.toBitcoin(spent_sum),
        txsCount: txsCount,
      };

      address.setStats(tx)
      
      helpers.displayAddress(address);

      //txs.push(tx);
    }
  }

  helpers.logStatus(addressType.concat(" addresses scanned\n"));

  return {
    totalBalance: totalBalance,
    // TODO: return also txsCount
  }
}

let summary = new Map();

if (typeof(index) === 'undefined') {
  // Option A: no index has been provided:
  //  - retrieve stats for legacy/SegWit
  //  - scan Native SegWit addresses
  const legacyOrSegwit = getLegacyOrSegWitInfos(xpub);
  updateSummary(summary, AddressType.LEGACY_OR_SEGWIT, legacyOrSegwit);

  const nativeSegwit = scanAddresses(AddressType.NATIVE, xpub);
  updateSummary(summary, AddressType.NATIVE, nativeSegwit);
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
