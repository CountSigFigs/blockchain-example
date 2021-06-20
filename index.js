const SHA256 = require('crypto-js/sha256');

class Transaction {
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

class Block {
    constructor(
        timestamp, //when block was created
        transactions, //any type of data associated with block ie details of transcation
        previousHash = '' //string that contains the hash of the block before this one
        ) {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash
        this.hash = this.calculateHash();
        this.nonce = 0;
    }
    //takes info from block and runs it through a hash and returns hash
    calculateHash(){
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString()
    }

    //controls how long it takes to add a new block
    mineBlock(difficulty){
        while(this.hash.substring(0,difficulty) !== Array(difficulty + 1).join("0")){
            this.hash = this.calculateHash();
            this.nonce++;
        }
        console.log("Block minded: " + this.hash)
    }
}

class BlockChain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    //generate gensis block manually
    createGenesisBlock(){
        return new Block('01/01/2017', 'Gensis block', '0')
    }

    getLatestBlock(){
        return this.chain[this.chain.length-1];
    } 
    
    minePendingTransaction(miningRewardAddress){
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined');
        this.chain.push(block);
         
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    createTransaction(transcation){
        this.pendingTransactions.push(transcation);
    }

    getBalanceofAddress(address){
        let balance = 0;

        for (const block of this.chain){
            for (const trans of block.transactions){
                if (trans.fromAddress === address){
                    balance -= trans.amount;
                }

                if (trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }
    //checks for integity of chain
    isChainValid(){
        for ( let i =1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            //if the hash doesn't match up with the actual data being hash then hash is not valid
            if ( currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            // if previous hash does not match the previous block's hash then something is wrong
            if ( currentBlock.previousHash !== previousBlock.hash) {
                return false
            }

            return true;
        }
    }
}

let brianCoin = new BlockChain();
brianCoin.createTransaction(new Transaction('address1', 'address2', 100));
brianCoin.createTransaction(new Transaction('address2', 'address1', 50));

console.log('\n Starting the miner...');
brianCoin.minePendingTransaction('xaviers address');

console.log('\n Balance of xavier is ', brianCoin.getBalanceofAddress('xaviers address'))

console.log('\n Starting the miner again...');
brianCoin.minePendingTransaction('xaviers address');

console.log('\n Balance of xavier is ', brianCoin.getBalanceofAddress('xaviers address'))


