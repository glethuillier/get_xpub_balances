# Get balances from Xpub

![XPUB](./logo.png)

From an xpub, get the balances of Bitcoin legacy, native SegWit, and SegWit accounts (by account+index or by active status).

## Install

`$ npm i`

## Usage

### Scan for a specific account and an index

`$ node scan.js <xpub> <account> <index>`

(Example: `$ node scan.js xpub6C...44dXs7p 0 10` [addresses at account `0`, index `10`])

### Scan all active addresses

`$ node scan.js <xpub>`

(Example: `$ node scan.js xpub6C...44dXs7p`)

## Output

All relevant derived addresses are displayed with the corresponding balance _in bitcoins_. 

## Operation mode

The tool derives addresses from the xpub (by scanning by accounts and indices) and displays, if appropriate, each derived address with its correspond type (legacy, SegWit, or native Segwit), its current balance, as well as its funded and spent transactions (amount and count).

## Example 1: specific account and index

Scan addresses derived from account `0` and index `42`:

```
$ node main.js xpub6CMDks...9N1gz1ZT 0 42
  legacy          m/0/42      1PpU8iyuDVyB98LAHdxvrs3HKRfZNia823            0.00000599      +0.00000599 (1) 	-0          (0)
  SegWit          m/0/42      3LvCwwuDgV7K3gePVRYcBTrTANWxXHgxkC            0               +0          (0) 	-0          (0)
  native          m/0/42      bc1qlfx00yjwz0zht89u5f0ly5fu0vxrzps4ldna2e    0               +0          (0) 	-0          (0)

Total balances
legacy	0.00000599
SegWit	0
native	0
```

## Example 2: full scan

```
$ node main.js xpub6CMDks...9N1gz1ZT
Scanning legacy addresses...
- scanning account 0 -
  legacy          m/0/0       1MZbRqZGpiSWGRLg8DUdVrDKHwNe1oesUZ            0               +0.00920923 (9) 	-0.00920923 (9)
  legacy          m/0/1       1LD1pARePgXXyZA1J3EyvRtB82vxENs5wQ            0               +0.0008     (1) 	-0.0008     (1)
  legacy          m/0/2       1MfeDvj5AUBG4xVMrx1xPgmYdXQrzHtW5b            0               +0.0001     (1) 	-0.0001     (1)
  legacy          m/0/3       1GgX4cGLiqF9p4Sd1XcPQhEAAhNDA4wLYS            0               +0.00004    (1) 	-0.00004    (1)
  legacy          m/0/4       1Q2Bv9X4yCTNn1P1tmFuWpijHvT3xYt3F             0               +0.0003     (1) 	-0.0003     (1)
  legacy          m/0/5       1G7g5zxfjWCSJRuNKVasVczrZNowQRwbij            0               +0.0007     (1) 	-0.0007     (1)
  legacy          m/0/6       1MFjwXsibXbvVzkE4chJrhbczDivpbbVTE            0               +0.00001    (1) 	-0.00001    (1)
  legacy          m/0/7       1HFzpigeFDZGp45peU4NAHLgyMxiGj1GzT            0               +0.0001     (1) 	-0.0001     (1)
  legacy          m/0/8       17xsjFyLgbWrjauC8F5hyaaaWdf6L6Y6L4            0               +0.00001    (1) 	-0.00001    (1)
  legacy          m/0/9       1Hc7EofusKsUrNPhbp1PUMkH6wfDohfDBd            0               +0.000054   (2) 	-0.000054   (2)
  legacy          m/0/10      1Mj9jzHtAyVvM9Y274LCcfLBBBfwRiDK9V            0               +0.00291258 (4) 	-0.00291258 (4)
  legacy          m/0/11      1Ng5FPQ1rUbEHak8Qcjy6BRJhjF1n3AVR6            0               +0.0003     (1) 	-0.0003     (1)
  legacy          m/0/12      145Tdk8ntZQa5kgyLheL835z6yukHjbEKF            0               +0.00001    (1) 	-0.00001    (1)
  legacy          m/0/13      16hG8pC6D4gRmRvfHT3zHGcED9FMocN4hG            0               +0.00001    (1) 	-0.00001    (1)
  legacy          m/0/14      1NQd72r3kUESTAMvDjaJU1Gk842HPcPVQQ            0               +0.00082047 (1) 	-0.00082047 (1)
  legacy          m/0/15      1JiBkCdhc3P4by29kLzraz4CuwjAvTA96H            0               +0.0005     (1) 	-0.0005     (1)
  legacy          m/0/16      1MXLmPcLRoQAWZqfgxtvhvUWLDQ3We2sUJ            0               +0.0001241  (1) 	-0.0001241  (1)
  legacy          m/0/17      1DRCwCw8HjeRsRi4wyfJzqgBeNBJTdvvx1            0               +0.0001     (1) 	-0.0001     (1)
  legacy          m/0/18      1NTG6NWQq1DZYZf8VQ58FBGGDwA9deM7Aq            0               +0.0002     (1) 	-0.0002     (1)
  legacy          m/0/19      1JMbu32pdVu6FvKbmrJMTSJSWFcJJ47JtY            0               +0.0004818  (1) 	-0.0004818  (1)
  legacy          m/0/20      13ZLzktrPVDGjaoPpqvWrxhXko7UAXFJHQ            0               +0.0001     (1) 	-0.0001     (1)
  legacy          m/0/21      19rpjEgDaPUwkeyuD7JHKUkTyxFHAmnorm            0               +0.001      (1) 	-0.001      (1)
  legacy          m/0/22      1D2R9GQu541rmUKY5kz6gjWuX2kfEusRre            0               +0.0001     (1) 	-0.0001     (1)
  legacy          m/0/23      1B3g4WxFBJtPh6azgQdRs5f7zwXhcocELc            0               +0.0001     (1) 	-0.0001     (1)
  legacy          m/0/24      12AdRB44ctyTaQiLgthz7WMFJ7dFNornmA            0               +0.007      (5) 	-0.007      (5)
  legacy          m/0/25      1KHyosZPVXxVBaQ7qtRjPUWWt911rAkfg6            0               +0.001      (1) 	-0.001      (1)
  legacy          m/0/26      1KConohwqXnB87BYpp2n7GfrPRhPqa471a            0               +0.01       (1) 	-0.01       (1)
  legacy          m/0/27      1BGCPcrzx3G48eY7vhpc7UEtJbpXW3mZ1t            0               +0.002      (2) 	-0.002      (2)
  legacy          m/0/28      14er8aopUkpX4KcL9rx7GU2t8zbFANQyC3            0               +0.0001     (1) 	-0.0001     (1)
  legacy          m/0/29      1LPR9mGFJrWkiMPj2HWfnBA5weEeKV2arY            0               +0.01       (1) 	-0.01       (1)
  legacy          m/0/30      15M1GcHsakzQtxkVDcw92siMk3c3Ap3C5h            0               +0.002      (1) 	-0.002      (1)
  legacy          m/0/31      1GWfouhfoTHctEeUCMd1tcF2cdkfuaSXdh            0               +0.001      (1) 	-0.001      (1)
  legacy          m/0/32      1CyAcL6Kd5pWzFucQE2Ev527FEQ9dTtPJ1            0               +0.007      (1) 	-0.007      (1)
  legacy          m/0/33      1AxhDoozM9VfsktCKVN7kp6UkaqVq65rHF            0               +0.00133    (2) 	-0.00133    (2)
  legacy          m/0/34      1Aj3Gi1j5UsvZh4ccjaqdnogPMWy54Z5ii            0               +0.001      (1) 	-0.001      (1)
  legacy          m/0/35      13riErZjkiZs6VKraoGPqgzoiZXEpV6cxn            0               +0.0005     (1) 	-0.0005     (1)
  legacy          m/0/36      1AUaUCK3YPmCEuXoEXvrx7V8dbBiEuV6MJ            0               +0.0001     (1) 	-0.0001     (1)
  legacy          m/0/37      18GZkK6K4shNU5gn5Xq5kxsxe2m8SnZYWq            0.0001          +0.0001     (1) 	-0          (0)
  legacy          m/0/38      1Dwn3hfJH4Zc55jz5VBbS7gHwpGVQUTjf4            0.0000116       +0.0000116  (2) 	-0          (0)
  legacy          m/0/39      13FqsiC4NjC1gNDP161ksgjvczVCXa2TFo            0.0000059       +0.0000059  (1) 	-0          (0)
  legacy          m/0/40      1BGziiv637ADYCjw6E7wWSU4BM6QFMtJfo            0.00000548      +0.00000548 (1) 	-0          (0)
  legacy          m/0/41      18LQFsr3jn8kXrxmuULeoaRXdp65TLv6hV            0.00005         +0.00005    (1) 	-0          (0)
  legacy          m/0/42      1PpU8iyuDVyB98LAHdxvrs3HKRfZNia823            0.00000599      +0.00000599 (1) 	-0          (0)
  legacy          m/0/43      13JxFJBKomvPfappmta2WRtcLEP5XyAT4H            0.00001         +0.00001    (1) 	-0          (0)
  legacy          m/0/44      1NPfqkDPvMGgxLKUDa2A7ZqWPKmqt9XRq2            0.00001         +0.00001    (1) 	-0          (0)
  legacy          m/0/45      1MJoktBjXxBPb4z9zbUrXi9TmgBAznaZ6T            0.00001         +0.00001    (1) 	-0          (0)
  legacy          m/0/46      1MVBD7t3Z3K1FJQJMTnCsqUtGYHyzSFQnp            0.00000555      +0.00000555 (1) 	-0          (0)
  legacy          m/0/47      1Jn7jWAvjDhMciNr4bkSGicoDTp9H7j56Z            0.0001          +0.0001     (1) 	-0          (0)
  legacy          m/0/48      1D65ikpjskSxVF281oGPG9dPAyA4MR1P4o            0               +0.01064201 (1) 	-0.01064201 (1)
  legacy          m/0/49      1Lk2id2XjyDin3x2bZfBov8aDThLUfMLYZ            0.00000548      +0.00000548 (1) 	-0          (0)
  legacy          m/0/50      15B3dzc1dyfXQnLFB8TFYA57cM1Wp2cWpj            0.000022        +0.000022   (1) 	-0          (0)
  legacy          m/0/51      1PW7pfMjkDokLWbDSBNQnzofTLtJpJYYev            0               +0.003      (1) 	-0.003      (1)
  legacy          m/0/52      1oRqgKMVBbzZ9HNaVvkbB6pa1U29FRqMw             0               +0.0027     (1) 	-0.0027     (1)
- account 0 fully scanned -
- scanning account 1 -
  legacy          m/1/0       14eG2cJfZVwsHwdW1wyo3fk3JbiaNmfED8            0               +0.00048644 (1) 	-0.00048644 (1)
  legacy          m/1/1       1LK8UbiRwUzC8KFEbMKvgbvriM9zLMce3C            0               +0.00009434 (1) 	-0.00009434 (1)
  legacy          m/1/2       1DpXpo2AHPUDuEDwZQxPBDUQFoTCZq4MTx            0               +0.00000554 (1) 	-0.00000554 (1)
  legacy          m/1/3       1MZUSc45A17e6i1c6wFvhu7QsyM7NnrVhx            0               +0.00029434 (1) 	-0.00029434 (1)
  legacy          m/1/4       17LFpTGbwaqshMptppdxwKRUv6nKT72KtF            0               +0.00013998 (1) 	-0.00013998 (1)
  legacy          m/1/5       1xovLg3Q812CcHEr6VVeew5tdpom7sWXC             0               +0.00001668 (1) 	-0.00001668 (1)
  legacy          m/1/6       12rrzETcSQQj9yTAjfqDyHSHD5azFzUjb7            0               +0.00004842 (1) 	-0.00004842 (1)
  legacy          m/1/7       1LqBdb2CBWzmsPcDwcUA6okmsNBp3CTJi6            0               +0.0000262  (1) 	-0.0000262  (1)
  legacy          m/1/8       1DXxmtwVFuR1VQXmyx225bZZb1sCZnwmQ             0               +0.0001193  (1) 	-0.0001193  (1)
  legacy          m/1/9       1Fa7B4c81q3fMyaYGsgYiL6HWnb21VfQsD            0               +0.0000506  (1) 	-0.0000506  (1)
  legacy          m/1/10      13Pn9G3Rbj5fcCEGqKsCf6vjeZ6acTXigt            0               +0.00030013 (1) 	-0.00030013 (1)
  legacy          m/1/11      1PAYGrtBWhDBWoeWJYEh4Un4nQNPEok3Qi            0               +0.00022159 (1) 	-0.00022159 (1)
  legacy          m/1/12      1MCZn89J8XTNieSxnfBTLqKYYuk3o1g4e8            0               +0.00001093 (1) 	-0.00001093 (1)
  legacy          m/1/13      1NMAxSfgg7yYuxZf3GyTZBexqXP4U6oVQi            0               +0.0007557  (1) 	-0.0007557  (1)
  legacy          m/1/14      13iyReN3ddXG5hUEeB1u83V93Vi7bFf812            0               +0.00006822 (1) 	-0.00006822 (1)
  legacy          m/1/15      1Gc9RPSeeu5ZvUYLt7pJEABjQtZAvLUhod            0               +0.00035202 (1) 	-0.00035202 (1)
  legacy          m/1/16      13MQomMuCFUHysqMbTRpVio419qN2psheX            0               +0.00017508 (1) 	-0.00017508 (1)
  legacy          m/1/17      1Gc4rDLkDMMbyH2SKvFcZ5MLeNzX5mNXsU            0               +0.00002762 (1) 	-0.00002762 (1)
  legacy          m/1/18      1FNXG94xg9jtx4G4vpN43jJXVfLAxEAHhR            0               +0.00000641 (1) 	-0.00000641 (1)
  legacy          m/1/19      1LsLT9bgDi7S7Mz5PVRxQd4P9oMejurrc7            0               +0.00019654 (1) 	-0.00019654 (1)
  legacy          m/1/20      1FqJD7Lgxx23SgGZtSmurA956dAR11jgt4            0               +0.00004908 (1) 	-0.00004908 (1)
  legacy          m/1/21      1FmgyXHGavoPVyJWoa7aBFB6cxg4N7sWUq            0               +0.0008794  (1) 	-0.0008794  (1)
  legacy          m/1/22      15RZWUB8XuA6rC8dZCYQxFpzb1iF64QAgv            0               +0.00059663 (1) 	-0.00059663 (1)
  legacy          m/1/23      1MwFFKfSmBWrXuBEKMVpqwLkoyKdWhZun9            0               +0.0018794  (1) 	-0.0018794  (1)
  legacy          m/1/24      19h8ywKwB5pbbk4XpPVtREXKrkWXWLZ7iz            0               +0.00095932 (1) 	-0.00095932 (1)
  legacy          m/1/25      13LtcXYQsoNgjuWhtbtVSATGArXnSf3esp            0               +0.00033617 (1) 	-0.00033617 (1)
  legacy          m/1/26      1GMjWKBYRDKL1KTv7df4Zqaa1bJTv71nnS            0               +0.00014351 (1) 	-0.00014351 (1)
  legacy          m/1/27      1E91GMqzeru3YdmSNbZCEXwX3T4q9KBxhy            0               +0.0007052  (1) 	-0.0007052  (1)
  legacy          m/1/28      1ExYkNVyFw4r3K7VWJvv4uv5FARw5c4AA5            0               +0.00989038 (1) 	-0.00989038 (1)
  legacy          m/1/29      1EpAtZdpZRUbc8sjuHaHC64KLwiAuu34hK            0               +0.00090125 (1) 	-0.00090125 (1)
  legacy          m/1/30      1UWpKYAhcUR5ZHjT1SthCUgqyFKAQPoMp             0               +0.00795254 (1) 	-0.00795254 (1)
  legacy          m/1/31      1N4sjE8GAXWakR5kvwpNGuifxg5StQnpeL            0               +0.00690508 (1) 	-0.00690508 (1)
  legacy          m/1/32      1PiPnh29bozu8KRtY63kQwuwgNvCmrLKzh            0               +0.00072779 (1) 	-0.00072779 (1)
  legacy          m/1/33      1LotHBQM5yepma4zpzTAefC8uAQkdc54fJ            0               +0.00053963 (1) 	-0.00053963 (1)
  legacy          m/1/34      17ydqAVJ5jJtcJoiTMbFG2nB85N4aMK1F             0               +0.00029499 (1) 	-0.00029499 (1)
  legacy          m/1/35      1Kf4tk15k8ptH3fenr4YfhxkwybugDwgAx            0               +0.000544   (1) 	-0.000544   (1)
  legacy          m/1/36      1GkpCTu3e3QbW9RX8gVQjKhtGYfhmTFmh3            0               +0.00029342 (1) 	-0.00029342 (1)
  legacy          m/1/37      1JqGnRDuVik3rHzEnbzfFaw5e9ZQk7F7fN            0               +0.0065836  (1) 	-0.0065836  (1)
  legacy          m/1/38      1GCuefqh3sALnnXGQYixz6wL9gj1vtmyZN            0               +0.00065966 (1) 	-0.00065966 (1)
  legacy          m/1/39      1E6vigkckGBe2DgZffMnhagTp21F62XP1U            0               +0.00348416 (1) 	-0.00348416 (1)
  legacy          m/1/40      1MrDHHDcFcBrDt8UD3X5QoFTWbR5vxCFLJ            0               +0.0002953  (1) 	-0.0002953  (1)
  legacy          m/1/41      1JKpXKrL9U1T1wXG12MgbQCow6H9mKtCLP            0               +0.0002772  (1) 	-0.0002772  (1)
  legacy          m/1/42      12LpQCX1cJP5Ajdrq57X4wcyD35VMqGFEP            0               +0.0021655  (1) 	-0.0021655  (1)
  legacy          m/1/43      1FQSGUcFMTYmGV6r2255z94ga1v6DHkPj2            0               +0.00084684 (1) 	-0.00084684 (1)
  legacy          m/1/44      17ngTwNNz3QJD57PdvTSnjnKQwR9sfEhM3            0               +0.0005683  (1) 	-0.0005683  (1)
  legacy          m/1/45      1ETQMXwqMCoW7f5MT5A6aqionaD3ijdk3i            0               +0.0002423  (1) 	-0.0002423  (1)
  legacy          m/1/46      1HCojkXWkZdKhUqaZUo42TFZJ2F51QgtXe            0.00009834      +0.00009834 (1) 	-0          (0)
  legacy          m/1/47      1Bb3otA9GSw5GKgT6Cf7ga5RcaCUXeuSxR            0               +0.01049813 (1) 	-0.01049813 (1)
  legacy          m/1/48      1C5BY8jcY9syKfRDukr9QLKNwyk4UUE15q            0               +0.00998965 (1) 	-0.00998965 (1)
  legacy          m/1/49      1JsKSey5xxAxpAtJvF3e8QwZky4db4pqfs            0               +0.00981467 (1) 	-0.00981467 (1)
  legacy          m/1/50      18dUXoFCoX4e1zXUU4uxoZYdbhx1g3LAM8            0               +0.00963291 (1) 	-0.00963291 (1)
  legacy          m/1/51      1AYnQDyvE7W9ZrqJJHDFVvshEJv4Jmq7H6            0               +0.00939013 (1) 	-0.00939013 (1)
  legacy          m/1/52      1AibY1bqijVFQkkWZ6oe1qsBV18cJQgzc8            0               +0.00914549 (1) 	-0.00914549 (1)
  legacy          m/1/53      19WCcD5Wj1Ca2biheB6gHiiqaTS8gamGfR            0               +0.00704153 (1) 	-0.00704153 (1)
  legacy          m/1/54      1KWnS3VFQotgqTDKFaAsLWmmeD5vqZdjJ9            0               +0.00593757 (1) 	-0.00593757 (1)
  legacy          m/1/55      1AJnWBkLYGubHj7n5iCHKHTd5N7CgXw7WG            0               +0.00364829 (1) 	-0.00364829 (1)
  legacy          m/1/56      14c7hUJzyDqksPcTRSJpaTPin4nnZpmaiV            0               +0.0013672  (1) 	-0.0013672  (1)
- account 1 fully scanned -
- scanning account 2 -
legacy addresses scanned

Scanning SegWit addresses...
- scanning account 0 -
SegWit addresses scanned

Fetching legacy/SegWit infos...

Scanning native addresses...
- scanning account 0 -
native addresses scanned


Summary
legacy/SegWit	0.00044034  	118 txs
native	0
```