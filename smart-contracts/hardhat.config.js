require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type {import('hardhat/config').HardhatUserConfig} */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun",
    },
  },
  networks: {
    hardhat: {},
    polygonAmoy: {
      url: process.env.AMOY_RPC_URL || process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : (process.env.CONTRACT_OWNER_PRIVATE_KEY ? [process.env.CONTRACT_OWNER_PRIVATE_KEY] : []),
    }
  },
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com"
        }
      }
    ]
  }
};
