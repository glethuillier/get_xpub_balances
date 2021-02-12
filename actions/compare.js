const { getAddressType, getAddress } = require('./address');
const { showComparisonResult } = require('../display')

const chalk = require('chalk');

function partialMatch(provided, derived) {
    for(var i = 0; i < derived.length; ++i) {
        const p = provided.toUpperCase()[i]

        if (p == '?') {
            continue;
        }

        if (p !== derived.toUpperCase()[i]) {
            return false;
        }
    }

    return true;
}

function search(xpub, providedAddress, range) {
    const addressType = getAddressType(providedAddress);

    const partialSearch = providedAddress.includes('?');

    for (var account = range.account_min; account < range.account_max; ++account) {
        for (var index = range.index_min; index < range.index_max; ++index) {
            const generatedAddress = getAddress(addressType, xpub, account, index);

            const derivationPath = 
                "m/"
                    .concat(account)
                    .concat("/")
                    .concat(index)
            
            const status =
                range.type.padEnd(18, ' ')
                    .concat(derivationPath.padEnd(14, ' '))
                    .concat(generatedAddress)

            if (generatedAddress.toUpperCase() === providedAddress.toUpperCase()) {

                console.log(chalk.green(status)); 

                return {
                    account: account,
                    index: index
                }
            }

            if (partialSearch && partialMatch(providedAddress, generatedAddress)) {
                console.log(chalk.blueBright(status));
                
                return {
                    partial: generatedAddress,
                    account: account,
                    index: index
                }
            }

            console.log(status);  
        }
    }

    return {};
}

function run(xpub, address) {
    const quickSearchRange = {
        type: 'quick search',
        account_min: 0,
        account_max: 4,
        index_min: 0,
        index_max: 1000
    };

    var result = search(xpub, address, quickSearchRange);

    if (Object.keys(result).length === 0) {

        const deepSearchRange = {
            type: 'deep search',
            account_min: 0,
            account_max: 1000,
            index_min: 0,
            index_max: 100000
        };

        result = search(xpub, address, deepSearchRange);
    }

    showComparisonResult(xpub, address, result);
}

module.exports = { run }