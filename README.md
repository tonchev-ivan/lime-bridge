# EVM Token Bridge

Welcome to the EVM Token Bridge repository!

This repository contains the code for an EVM (Ethereum Virtual Machine) Token Bridge, which allows for the transfer of tokens between different EVM-based blockchain networks.

## Features

- Transfer tokens between EVM-based networks without the need to sell and re-buy
- Easy-to-use user interface
- Cryptographically secure transfer process

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you can run the EVM Token Bridge, you will need to have the following software installed:

- [Node.js](https://nodejs.org/en/download/)
- [Hardhat](https://hardhat.org/getting-started/#installation)
- [MetaMask](https://metamask.io/download.html)

### Installation

1. Clone this repository to your local machine:
    
```shell
git clone https://github.com/tonchev-ivan/lime-bridge.git
```

2. Install the dependencies

```shell
npm install
```

3. Start hardhat nodes

```shell
npx hardhat node
npx hardhat node --port 8546
```
4. Setup private keys in .env file and update values (providing correct addresses for Arbitrum and Goerli networks will allow you deploy, connect and test the bridge on those networks)

```shell
cp .env.example .env
```

5. Deploy contracts on both networks and update addresses in .env file

```shell
npx hardhat run --network localhost scripts/deploy.ts
```

6. Deploy token on one of the networks
    
```shell
npx hardhat run --network localhost scripts/deploy-token.ts
```

7. Rune the bridge
    
```shell
npx hardhat run .\scripts\bridge.ts
```

8. Run the frontend
    
```shell
cd /BridgeFE && npm run start
```
9. The user interface should now be available at http://localhost:3300

## Usage

To use the EVM Token Bridge, follow these steps:

1. Connect to the desired EVM-based networks using the user interface.
2. Deposit the tokens you want to transfer on the source network.
3. Change the network to the destination network.
4. Claim the tokens on the destination network.

## Running the tests

To run the tests, run the following command:

```shell
npx hardhat test
```

## Test coverage

To run the tests with coverage, run the following command:

```shell
npx hardhat coverage
```
