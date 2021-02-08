# Get balances from Xpub

![XPUB](./logo.png)

Get the balances of Bitcoin legacy, native SegWit, and SegWit addresses derivated from an xpub at a specific index (Mainnet only).

## Prerequisite

`$ npm i`

## Configure (optional)

In `main.js`, set the `xpub` and `index` variables.

## Run

### Option A: addresses at a specific index

`$ node main.js <xpub> <index>`

(Example: `$ node main.js xpub6C...44dXs7p 10`)

### Option B: all active addresses

`$ node main.js <xpub>`

(Example: `$ node main.js xpub6C...44dXs7p`)

## Output

All derived addresses are displayed with the corresponding balance _in bitcoins_. 

If an address has a non-zero balance, it is displayed in blue. If it has a zero balance, in grey. If the balance is erroneous (not a number) or if the request fails, it is displayed in red.

```
_{address type}_ {address}: {balance in bitcoin} [or {error message}]
```

## Example

![EXAMPLE](./example.png)