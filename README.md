# Get balances from Xpub

![XPUB](./logo.png)

Get the balances of Bitcoin addresses derivated from an xpub at a specific index (supported: legacy, native Segwit, and Segwit)

The balances are displayed in Bitcoin.

## Prerequisite

`$ npm i`

## Configure (optional)

In `main.js`, set the `xpub` and `index` variables.

## Run

When xpub and index are hardcoded:
`$ node main.js`

To override the hardcoded xpub and index:
`$ node main.js <xpub> <index>`

(Example: `$ node main.js xpub6C...44dXs7p 10`)

## Output

All derived addresses are displayed with the corresponding balance.

```
{Address type}
{Address} ({index}): {balance in bitcoin}
```

## Example

```
$ node main.js 

segwit
3PCsnjgr21tAHvU1K4FJ667wWKgVAYH15T (16): 0

native_segwit
bc1qec9qh7dvk85dq2z8dy0sw3mxm6vezd9qp9v7qy (16): 0.00141249

legacy
1KnSEacMBQzNK5vrNjDLXd8d8T4LpmPccM (16): 0
```
