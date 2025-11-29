import crypto, { hash } from "crypto";
import { hasSubscribers } from "diagnostics_channel";
import fs from "fs"
import path from "path";

class Block{
    constructor(index, timestamp, data, priviousHash = "") {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.priviousHash = priviousHash;
        this.hash = this.calculateHash();
    }

    calculateHash(){
        return crypto
        .createHash("sha256")
        .update(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data))
        .digest("hex");
    }
}

class Blockchain {
    constructor({persisFile = null} = {}) {
        this.chain = [];
        this.persisFile = persisFile ? path.resolve(persisFile) : null;
        this.chain.push(this.createGenesisBlock());
        if(this.persisFile) this._tryLoadFromFile();
    }

    createGenesisBlock() {
        return new Block(0, Date.now(), {info: "Genesis Block"}, "0" );
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    addBlock(data){
        const index = this.chain.length
        const timestamp = Date.now();
        const priviousHash = this.getLatestBlock().hash
        const newBlock = new Block(index, timestamp, data, priviousHash)
        this.chain.push(newBlock);
        if(this.persisFile) this._saveToFile();
        return newBlock;
    }
    isChainValid(){
        for(let i = 1; i < this.chain.length; i++){
            const current = this.chain[i]
            const privious = this.chain[i-1]

            if(current.hash !== current.calculateHash()) return false;
            if(current.priviousHash !== privious.hash) return false;
        }
        return true;
    }
    getChain(){
        return this.chain
    }
    getBlockByIndex(index){
        return this.chain[index] ?? null;
    }
    findBlockByHash(){
        return this.chain((b) => b.hash == hash) ?? null;
    }
}









export const blockchain = new Blockchain();
export { Block, Blockchain };