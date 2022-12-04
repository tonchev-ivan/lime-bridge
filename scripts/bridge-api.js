const BridgeLocal = require('../artifacts/contracts/Bridge.sol/Bridge.json');

async function main() {
    const contractAddressGoerli = '0xE0e2A18B611067cb5CA1E549c3E55cAf85086f82';
    const contractAddressArbitrum = '0x944987212E9AE913d35BC09b0B899C6bFa68D8F9';

    
    const EtherscanProvider = hre.ethers.providers.EtherscanProvider;
    const network = hre.ethers.providers.getNetwork("goerli");
    provider = new EtherscanProvider(network, process.env.ETHERSCAN_API_KEY);
    const contractAddress = contractAddressGoerli;
    privateKey = process.env.PRIVATE_KEY;
    const wallet = new hre.ethers.Wallet(privateKey, provider);
    const goerliBridge = new hre.ethers.Contract(contractAddress, BridgeLocal.abi, wallet);

    const network1 = hre.ethers.providers.getNetwork("arbitrum-goerli");
    provider = new EtherscanProvider(network1, process.env.ARBI_API_KEY);
    const contractAddress1 = contractAddressArbitrum;
    privateKey = process.env.PRIVATE_KEY;
    const wallet1 = new hre.ethers.Wallet(privateKey, provider);
    const arbitrumBridge = new hre.ethers.Contract(contractAddress1, BridgeLocal.abi, wallet1);
    var tokenAddressArbitrum = '0x714dE63FBE27598d042eae13361c09B060969f15';


    goerliBridge.on('ClaimTokens', (trxId, _tokenAddress, from, amount, chainId, nonce) => {
        console.log(trxId, _tokenAddress, from, amount, chainId, nonce);

        try {
            console.log(claimToken(trxId));

            console.log(mintToken(tokenAddressArbitrum, from, amount, nonce + 2));
        } catch (e) {
            console.log(e);
        }
    });
    async function mintToken(_tokenAddress, from, amount, nonce) {
        const estimatedGasLimit = await arbitrumBridge.estimateGas.mint(_tokenAddress, from, amount, nonce)
        const approveTxUnsigned = await arbitrumBridge.populateTransaction.mint(_tokenAddress, from, amount, nonce);
        approveTxUnsigned.gasLimit = estimatedGasLimit;
        approveTxUnsigned.gasPrice = await provider.getGasPrice();
        approveTxUnsigned.nonce = await provider.getTransactionCount(contractAddressArbitrum);
        approveTxUnsigned.nonce += 5;

        const approveTxSigned = await wallet1.signTransaction(approveTxUnsigned);
        const submittedTx = await provider.sendTransaction(approveTxSigned);
        const approveReceipt = await submittedTx.wait();
        console.log(approveReceipt);
    }
    async function claimToken(trxId) {
        await goerliBridge.confirmClaim(parseInt(trxId));
    }

}
main();