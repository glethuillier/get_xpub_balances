# Get balances from Xpub

![XPUB](./logo.png)

From an xpub, get the balances of Bitcoin legacy, native SegWit, and SegWit accounts (Mainnet only).

## Install

`$ npm i`

## Usage

### Scan all active addresses

`$ node main.js <xpub>`

(Example: `$ node main.js xpub6C...44dXs7p`)

### Scan for a specific account and an index

`$ node main.js <xpub> <account> <index>`

(Example: `$ node main.js xpub6C...44dXs7p 0 10` [addresses at index 10 for account 0])

## Output

All derived addresses are displayed with the corresponding balance _in bitcoins_. 

If an address has a non-zero balance, it is displayed in blue. If it has a zero balance, in grey. If the balance is erroneous (not a number) or if the request fails, it is displayed in red.

## Operation mode

The tool derives addresses from the xpub (by scanning accounts and indices) and displays, if appropriate, each derived address with its correspond type (legacy, SegWit, or native Segwit), its current balance, as well as its funded and spent transactions (amount and count).

## Example

```
```