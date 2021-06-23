const { BlockChain, Transaction } = require('./blockchain');

let brianCoin = new BlockChain();
brianCoin.createTransaction(new Transaction('address1', 'address2', 100));
brianCoin.createTransaction(new Transaction('address2', 'address1', 50));

console.log('\n Starting the miner...');
brianCoin.minePendingTransaction('xaviers address');

console.log('\n Balance of xavier is ', brianCoin.getBalanceofAddress('xaviers address'))

console.log('\n Starting the miner again...');
brianCoin.minePendingTransaction('xaviers address');

console.log('\n Balance of xavier is ', brianCoin.getBalanceofAddress('xaviers address'))
