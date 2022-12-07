const Web3 = require('web3');

// arbitrum does not provide websocket connection, usealchemy instead
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3Alch = createAlchemyWeb3(
    process.env.ARBITRUM_API_URL_WSS,
)

const BridgeLocal = require('../artifacts/contracts/Bridge.sol/Bridge.json');


const BridgeContract = require('../artifacts/contracts/Bridge.sol/Bridge.json');

const web3 = new Web3("wss://goerli.infura.io/ws/v3/5b37e612a4a9423db4bca98d18b84371");
const web3arbitrum = new Web3('https://arbitrum-goerli.infura.io/v3/5b37e612a4a9423db4bca98d18b84371');
const bridge = new web3.eth.Contract(BridgeContract.abi, process.env.GOERLI_CONTRACT_ADDRESS, { from: "0x58373aD18bB235d3cD6Ae43D2B922be9f4D43Ca3" });
const bridgearbitrumSubscriber = new web3Alch.eth.Contract(BridgeContract.abi, process.env.ARBITRUM_CONTRACT_ADDRESS, { from: "0x58373aD18bB235d3cD6Ae43D2B922be9f4D43Ca3" });

const bridgearbitrum = new web3arbitrum.eth.Contract(BridgeContract.abi, process.env.ARBITRUM_CONTRACT_ADDRESS, { from: "0x58373aD18bB235d3cD6Ae43D2B922be9f4D43Ca3" });
const wallet = web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);

async function main() {
    bridge.events.ClaimTokens(function (error, event) {
        if (error) {
            console.error(error);
        } else {
            console.log(event);
            minting(event);
        }
    });
    bridgearbitrumSubscriber.events.Mint(function (error, event) {
        if (error) {
            console.error(error);
        } else {
            console.log("TOKEN MINTED");
            console.log(event);
        }
    });
}

async function minting(event) {
    try {
        gasAmount = await bridgearbitrum.methods.mint(process.env.ARBITRUM_TOKEN_CONTRACT_ADDRESS,
            event.returnValues.from,
            event.returnValues.amount,
            event.returnValues.nonce).estimateGas({ from: wallet.address });

        const tx = {
            from: wallet.address,
            to: process.env.ARBITRUM_CONTRACT_ADDRESS,
            gas: gasAmount,
            value: 0,
            data: bridgearbitrum.methods.mint(
                process.env.ARBITRUM_TOKEN_CONTRACT_ADDRESS,
                event.returnValues.from,
                event.returnValues.amount,
                event.returnValues.nonce
            ).encodeABI()
        };
        const signPromise = web3arbitrum.eth.accounts.signTransaction(tx, process.env.PRIVATE_KEY);

        signPromise.then((signedTx) => {
            const sentTx = web3arbitrum.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
            sentTx.on("receipt", receipt => {
                console.log("receipt: " + receipt);
                confirmClaimEvent(event, bridge, web3, process.env.GOERLI_CONTRACT_ADDRESS);
            });
            sentTx.on("error", err => {
                console.log("error: " + err);
            });
            sentTx.on("confirmation", number, receipt => {
                console.log("Confirm minting...");

            });
            console.log("test");
        }).catch((err) => {
            console.log("error: " + err);
        });


    } catch (error) {
        console.error(error);
    }
}

async function confirmClaimEvent(event, contract, provider, contractAddress) {

    gasAmount = await contract.methods.confirmClaim(event.returnValues.trxId).estimateGas({ from: wallet.address });
    const tx = {
        from: wallet.address,
        to: contractAddress,
        gas: gasAmount,
        value: 0,
        data: contract.methods.confirmClaim(event.returnValues.trxId).encodeABI()
    };
    const signPromise = provider.eth.accounts.signTransaction(tx, process.env.PRIVATE_KEY);
    signPromise.then((signedTx) => {
        const sentTx = provider.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
        sentTx.on("receipt", receipt => {
            console.log("receipt: " + receipt);

        });
        sentTx.on("error", err => {
            console.log("error: " + err);
        });
        sentTx.on("confirmation", receipt => {
            console.log("receipt: " + receipt);

        });
    }).catch((err) => {
        console.log("error: " + err);
    });

}
main();