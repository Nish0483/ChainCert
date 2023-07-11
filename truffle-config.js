const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();
const mnemonic = process.env.MNEMONIC;
const privateKey = process.env.ALCHEMY_API;

module.exports = {
  networks: {
    sepolia: {
      provider: () => new HDWalletProvider(mnemonic,privateKey),
      network_id:11155111, //sepolia netwok_id
      gasPrice: 36510211118, // Gas price in wei (adjust to your needs)
      confirmations: 2, // this is a must field
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true ,
      gas: 8000000 
    },
  },
  compilers: {
    solc: {
      version: "0.8.0", // Solidity compiler version
    },
  },
};
