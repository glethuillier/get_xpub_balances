# Get balances from Xpub

Get the balances of Bitcoin addresses derivated from an xpub at a specific index (supported: legacy, native Segwit, and Segwit)

The balances are displayed in Bitcoin.

## Prerequisite

`$ npm i`

## Configure

In `main.js`, set the `xpub` and `index` variables.

## Run

`$ node main.js`

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
