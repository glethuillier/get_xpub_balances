# Xpub Scan

![XPUB](./logo.png)

Given a master public key (xpub, tlub), get the balances of its derived legacy, native SegWit, and SegWit addresses, or check whether an address has been derived from it.

## Features

![Example](./demo_balance.gif)

* Privacy Friendly: master public keys are never sent over the Internet: only their derived addresses are 
* Derives specific addresses (by account+index) or all active ones
* Search if a given address has been derived from a given master public key
* Supports legacy, SegWit, and Native Segwit

## Install

`$ npm i`

## Usage 1. Check balances

*In the following instructions, the generic `xpub` term is used to designate a master public key. It can be substituted with another type of supported public key, such as `Ltub` (Litecoin).*

### Scan for a specific account and an index

`$ node scan.js <xpub> <account> <index>`

Example: 
`$ node scan.js xpub6C...44dXs7p 0 10` [addresses at account `0`, index `10`]

### Scan all active addresses

`$ node scan.js <xpub>`

Example: 
`$ node scan.js xpub6C...44dXs7p`

## Usage 2. Check address against xpub

*Check if an address has been derived from a master public key.*

### Perfect match

`$ node scan.js <xpub> <address>`

### Partial match

Add `?` where there is uncertainty about a character in the address. For instance: `1MYaYeZhDp?m3YtvqBMXQQN??YCz?7NqgF`

## Docker

Build: `$ docker build -t xpubscan .`

Run: `$ docker run xpubscan <xpub> [optional: <args>]`

## Operation mode

The tool derives addresses from the master public key (by scanning by accounts and indices) and displays, if appropriate, each derived address with its correspond type (legacy, SegWit, or native Segwit), its current balance, as well as its funded and spent transactions (amount and count).

## Interface

When an analysis is performed, 3 elements are displayed in the following order:
* The analysis of each derived active address (type, path, address, current balance, total in `←`, total out `→`)
* The transactions ordered by date (date, block number, address, in `←` | out `→` | sent to self `↺`)
* A summary: total number of transactions and total balance by address type
