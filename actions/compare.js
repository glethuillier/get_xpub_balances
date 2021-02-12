const { getAddressType, getAddress } = require('./address');
const { showComparisonResult } = require('../display')

const chalk = require('chalk');

function search(xpub, address, range) {
    const addressType = getAddressType(address);

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

            if (generatedAddress.toUpperCase() === address.toUpperCase()) {

                console.log(chalk.green(status)); 

                return {
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
    const addressType = getAddressType(address);

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