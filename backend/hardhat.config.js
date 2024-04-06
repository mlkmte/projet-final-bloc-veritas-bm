require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

const PK = process.env.PK || "";
const ALCHEMY= process.env.ALCHEMY || "";
const ETHERSCAN = process.env.ETHERSCAN || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks:{
    localhost:{
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia : {
      url: ALCHEMY ,
      chainId: 11155111, //Chain id de sepolia
      accounts: [`0x${PK}`]
    }
  },
  solidity: "0.8.20",
  etherscan:{
    apiKey:{
      sepolia:ETHERSCAN
    }
  }
};