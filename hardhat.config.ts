import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config();


const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    hardhat: {},
    goerli: {
      allowUnlimitedContractSize: true,
      url: process.env.GOERLI_API_URL,
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    },
    arbitrumGoerli: {
      allowUnlimitedContractSize: true,
      url: process.env.ARBITRUM_API_URL,
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    },
  },
  etherscan: {
    apiKey: {
      goerli: process.env.ETHERSCAN_API_KEY,
      arbitrumGoerli: process.env.ARBI_API_KEY,
    },
  },
};

export default config;
