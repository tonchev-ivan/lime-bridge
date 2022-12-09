const Web3 = require('web3');

// arbitrum does not provide websocket connection, usealchemy instead
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3Alch = createAlchemyWeb3(
    process.env.ARBITRUM_API_URL_WSS,
)

const BridgeContract = require('../artifacts/contracts/Bridge.sol/Bridge.json');

const web3 = new Web3("wss://goerli.infura.io/ws/v3/5b37e612a4a9423db4bca98d18b84371");
const web3arbitrum = new Web3('https://arbitrum-goerli.infura.io/v3/5b37e612a4a9423db4bca98d18b84371');
const bridge = new web3.eth.Contract(BridgeContract.abi, process.env.GOERLI_CONTRACT_ADDRESS, { from: "0x58373aD18bB235d3cD6Ae43D2B922be9f4D43Ca3" });
const bridgearbitrumSubscriber = new web3Alch.eth.Contract(BridgeContract.abi, process.env.ARBITRUM_CONTRACT_ADDRESS, { from: "0x58373aD18bB235d3cD6Ae43D2B922be9f4D43Ca3" });

const bridgearbitrum = new web3arbitrum.eth.Contract(BridgeContract.abi, process.env.ARBITRUM_CONTRACT_ADDRESS, { from: "0x58373aD18bB235d3cD6Ae43D2B922be9f4D43Ca3" });
const wallet = web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);
const tokenAddress = [
    {
        'name': 'LTT',
        'network': '5',
        'address': '0x7aC74cc3eE165B715C190ebcB2a33D429f297614'
    },
    {
        'name': 'LTT',
        'network': '42161',
        'address': '0x714dE63FBE27598d042eae13361c09B060969f15'
    }
];
async function main() {
    bridge.events.ClaimTokens(function (error, event) {
        if (error) {
            console.error(error);
        } else {
            console.log(event);
            minting(event, web3, web3arbitrum, bridge, bridgearbitrum, process.env.GOERLI_CONTRACT_ADDRESS, process.env.ARBITRUM_CONTRACT_ADDRESS);
        }
    });

    bridgearbitrumSubscriber.events.ClaimTokens(function (error, event) {
        if (error) {
            console.error(error);
        } else {
            console.log(event);
            minting(event, web3arbitrum, web3, bridgearbitrum, bridge, process.env.ARBITRUM_CONTRACT_ADDRESS, process.env.GOERLI_CONTRACT_ADDRESS);
        }
    });
}

async function minting(event, sourceProvider, destinationProvider, sourceContract, destinationContract, sourceContractAddress, destinationContractAddress) {
    try {
        const destinationProviderId = await destinationProvider.eth.net.getId()

        const tokenName = tokenAddress.filter(function (e) { return e.address == event.returnValues.token })[0].name
        const destinationTokenAddress = tokenAddress.filter(function (e) { return e.name == tokenName && e.network == destinationProviderId })[0].address
        gasAmount = await destinationContract.methods.mint(
            destinationTokenAddress,
            event.returnValues.from,
            event.returnValues.amount,
            event.returnValues.nonce).estimateGas({ from: wallet.address });
        const tx = {
            from: wallet.address,
            to: destinationContractAddress,
            gas: gasAmount,
            value: 0,
            data: destinationContract.methods.mint(
                destinationTokenAddress,
                event.returnValues.from,
                event.returnValues.amount,
                event.returnValues.nonce
            ).encodeABI()
        };
        const signPromise = destinationProvider.eth.accounts.signTransaction(tx, process.env.PRIVATE_KEY);
        signPromise.then((signedTx) => {
            const sentTx = destinationProvider.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
            sentTx.on("receipt", receipt => {
                console.log("receipt: " + receipt);
                confirmClaimEvent(event, sourceContract, sourceProvider, sourceContractAddress);
            });
            sentTx.on("error", err => {
                console.log("error: " + err);
            });
            sentTx.on("confirmation", number, receipt => {
                console.log("Confirm minting...");

            });
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