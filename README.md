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

All derived addresses are displayed with the corresponding balance. If an address has a non-zero balance, it is displayed in green. If not, in grey.

```
{Address type}
{Address} ({index}): {balance in bitcoin}
```

## Example

```
$ node main.js xpub6C2qnauS...R44dXs7p 0
Addresses derived from xpub xpub6C2qnauSiRRR8UG9... at index 0

legacy  13eyfkTuBqqLmHRdhoDdvFQB61WB68LvLr: 0
segwit  3JkPDYMkUoDW9654mNaJ9YcJrGpGv3fEjx: 0
native  bc1qr500ysrg653aaplftaac753srtt2jwtfvcr5vt: 0.00027278
```
