
require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()




const PRIVATE_KEY=process.env.PRIVATE_KEY;
const GORELI_RPC_URL=process.env.GORELI_RPC_URL;

const ETHERSCAN_API_KEY=process.env.ETHERSCAN_API_KEY

const COINMARKETCAP_API_KEY=process.env.COINMARKETCAP_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork:"hardhat",
  networks:{
    hardhat:{
      chainId:31337,
      blockConfirmations:1,
    },
    goerli:{
      chainId:5,
      blockConfirmations:6,
      url:GORELI_RPC_URL,
      accounts:[PRIVATE_KEY],
    }

  },
  solidity: "0.8.7",
  namedAccounts:{
    deployer:{
      default:0
    },
    users:{
      default:1
    }
  }
  ,
  gasReporter:{
    enabled:false,
    outputFile:"gas-report.txt",
    noColors:true,
    currency:"USD",
    coinmarketcap:COINMARKETCAP_API_KEY
  },
  etherscan:{
    apiKey:ETHERSCAN_API_KEY
  },
};
