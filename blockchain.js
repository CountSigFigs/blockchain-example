const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey){

        //checks to see if from address matches the user's public key
        if (signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error('You cannot sign transactions for other wallets')
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid(){
        if (this.fromAddress === null) return true;

        if (!this.signature || this.signature.length === 0){
            throw new Error('No signature in this transaction')
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
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

    hasValidTransactions(){
        for (let tx of this.transactions){
            if (!tx.isValid()){
                return false;
            }
        }

        return true;
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

    addTransaction(transcation){

        if (!transcation.fromAddress || !transcation.toAddress){
            throw new Error('Transaction must have a from and to address')
        }

        if (!transcation.isValid()){
            throw new Error('Cannot add invalid transaction to chain')
        }

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
    isChainValid() {
        // Check if the Genesis block hasn't been tampered with by comparing
        // the output of createGenesisBlock with the first block on our chain
        const realGenesis = JSON.stringify(this.createGenesisBlock());
    
        if (realGenesis !== JSON.stringify(this.chain[0])) {
          return false;
        }
    
        // Check the remaining blocks on the chain to see if there hashes and
        // signatures are correct
        for (let i = 1; i < this.chain.length; i++) {
          const currentBlock = this.chain[i];
    
          if (!currentBlock.hasValidTransactions()) {
            return false;
          }
    
          if (currentBlock.hash !== currentBlock.calculateHash()) {
              console.log(currentBlock.hash)
              console.log(currentBlock.calculateHash())
            return false;
          }
        }
    
        return true;
      }
}

module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;



