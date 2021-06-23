const { BlockChain, Transaction } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('b0758db2443f2a0686c1524ae580631358d873e848bd0da4f49b1e1f4cd7d8ce');
const myWalletAddress = myKey.getPublic('hex');

let brianCoin = new BlockChain();

brianCoin.minePendingTransaction(myWalletAddress);

const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
brianCoin.addTransaction(tx1);

console.log('\n Starting the miner...');
brianCoin.minePendingTransaction(myWalletAddress);

console.log('\n Balance of Brian is ', brianCoin.getBalanceofAddress(myWalletAddress));
console.log('is chain valid', brianCoin.isChainValid());

