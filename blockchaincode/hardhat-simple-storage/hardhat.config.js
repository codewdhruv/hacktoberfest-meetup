require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()
require('@nomiclabs/hardhat-etherscan');
require('./tasks/block-number')
require('hardhat-gas-reporter');
require("solidity-coverage")
const GORELI_RPC_URL=process.env.GORELI_RPC_URL || "https://eth-goreli" ;
const PRIVATE_KEY=process.env.PRIVATE_KEY||"0xkey";
const ETHERSCAN_API_KEY=process.env.ETHERSCAN_API_KEY || "key" ;
const COINMARKETCAP_API_KEY= process.env.COINMARKETCAP_API_KEY || "key";
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork:"hardhat",
  networks:{
    goreli:{
      url:GORELI_RPC_URL,
      accounts:[PRIVATE_KEY],
      chainId:5,
    },
    localhost:{
      url:'http://127.0.0.1:8545/',
      chainId:31337,
    }
  },
  solidity: "0.8.8",
  etherscan:{
    apiKey:ETHERSCAN_API_KEY,
  },
  gasReporter:{
    enabled:true,
    outputFile:"gas-report.txt",
    noColors:true,
    currency:"USD",
    coinmarketcap:COINMARKETCAP_API_KEY
  }
};
