const request = require('sync-request');
const bip32 = require('bip32');

const { BITCOIN_NETWORK, LITECOIN_NETWORK } = require('./settings');

function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

function getJSON(url, attempts = 0) {
  
  if (attempts > 5) {
    throw new Error(
      "GET REQUEST ERROR: "
        .concat(url)
        .concat(", Status Code: ")
        .concat(res.statusCode)
      );
  }

  const res = request('GET', url);
  
  if (res.statusCode != 200) {
    sleep(1000).then(() => {
      getJSON(url, attempts++);
    });
  }

  if (attempts > 0) {
    temporarilyDisplay(/* delete last error message */);
  }
  
  return JSON.parse(res.getBody('utf-8'));
}

// ensure that the xpub is a valid one
// and select the relevant network
function checkXpub(xpub) {
  try {
    bip32.fromBase58(xpub, getNetwork(xpub));
  }
  catch (e) {
    throw new Error("INVALID XPUB: " + xpub + " is not a valid xpub");
  }
}

function getNetwork(xpub) {
  const prefix = xpub.substring(0, 4);

  if (prefix === 'xpub') {
    return BITCOIN_NETWORK;
  }
  else if (prefix === 'Ltub') {
    return LITECOIN_NETWORK;
  }

  throw new Error("INVALID XPUB: " + xpub + " has not a valid prefix");
}

module.exports = { 
  getNetwork,
  checkXpub, 
  getJSON
}