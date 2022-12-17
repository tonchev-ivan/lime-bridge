// define contract ABI
const contractAbi = [{ "inputs": [{ "internalType": "address", "name": "_gateway", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "_tokenAddress", "type": "address" }, { "indexed": true, "internalType": "address", "name": "requester", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_targetChainId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "name": "Burn", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "_tokenAddress", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "name": "Mint", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "_transactionId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "requester", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "name": "TokensClaimed", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "_tokenAddress", "type": "address" }, { "indexed": true, "internalType": "address", "name": "requester", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_targetChainId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "name": "TokensLocked", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "requester", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "name": "TokensUnlocked", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "_wrappedTokenAddress", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "uint256", "name": "_targetChainId", "type": "uint256" }, { "internalType": "uint256", "name": "_deadline", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "burn", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_transactionId", "type": "uint256" }], "name": "claimTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_tokenAddress", "type": "address" }], "name": "collectFees", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "chainId", "type": "uint256" }, { "internalType": "address", "name": "originalTokenAddress", "type": "address" }, { "internalType": "string", "name": "_name", "type": "string" }, { "internalType": "string", "name": "_symbol", "type": "string" }], "name": "createToken", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }], "name": "getUserTransactions", "outputs": [{ "components": [{ "internalType": "uint256", "name": "fromChainId", "type": "uint256" }, { "internalType": "uint256", "name": "toChainId", "type": "uint256" }, { "internalType": "address", "name": "tokenAddress", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bool", "name": "claimed", "type": "bool" }], "internalType": "struct Bridgev2.Transaction[]", "name": "", "type": "tuple[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_wrappedTokenAddress", "type": "address" }], "name": "getWrappedToken", "outputs": [{ "internalType": "contract MyToken", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getWrappedTokensArray", "outputs": [{ "components": [{ "internalType": "uint256", "name": "chainId", "type": "uint256" }, { "internalType": "address", "name": "originalTokenAddress", "type": "address" }, { "internalType": "address", "name": "wrappedTokenAddress", "type": "address" }], "internalType": "struct Bridgev2.WrappedToken[]", "name": "", "type": "tuple[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_tokenAddress", "type": "address" }, { "internalType": "uint256", "name": "_bridgedAmount", "type": "uint256" }, { "internalType": "uint256", "name": "_targetChainId", "type": "uint256" }, { "internalType": "uint256", "name": "_deadline", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "lockTokens", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_initiatorChainId", "type": "uint256" }, { "internalType": "address", "name": "_receiver", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "address", "name": "_wrappedTokenAddress", "type": "address" }], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_initiatorChainId", "type": "uint256" }, { "internalType": "address", "name": "_tokenAddress", "type": "address" }, { "internalType": "address", "name": "_requester", "type": "address" }, { "internalType": "uint256", "name": "_bridgedAmount", "type": "uint256" }], "name": "unlockTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "userTransactions", "outputs": [{ "internalType": "uint256", "name": "fromChainId", "type": "uint256" }, { "internalType": "uint256", "name": "toChainId", "type": "uint256" }, { "internalType": "address", "name": "tokenAddress", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bool", "name": "claimed", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "wrappedTokensArray", "outputs": [{ "internalType": "uint256", "name": "chainId", "type": "uint256" }, { "internalType": "address", "name": "originalTokenAddress", "type": "address" }, { "internalType": "address", "name": "wrappedTokenAddress", "type": "address" }], "stateMutability": "view", "type": "function" }];
const tokenAbi = [{ "inputs": [{ "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "address", "name": "_gateway", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "inputs": [], "name": "DOMAIN_SEPARATOR", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "burn", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "burnFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" }], "name": "increaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "nonces", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "permit", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }];
// Source code to interact with smart contract
const web3 = new Web3(Web3.givenProvider);
// web3 provider with fallback for old version
window.addEventListener('load', async () => {
  // New web3 provider
  if (window.ethereum) {
    window.web3 = new Web3(ethereum);
    try {
      // ask user for permission
      await ethereum.enable();
      // user approved permission
      window.provider = new ethers.providers.Web3Provider(window.ethereum);
      window.contract = new ethers.Contract(contractAddress[window.ethereum.networkVersion.toString()], contractAbi, window.provider.getSigner());
      window.contract.on("TokensLocked", async (_tokenAddress,
        requester,
        _targetChainId,
        amount,
        timestamp) => {
        alert("TokensLocked");
        // enable button transfer
        $("#transfer").removeClass('disabled');

      });
    } catch (error) {
      // user rejected permission
      console.log('user rejected permission');
    }
  }
  // Old web3 provider
  else if (window.web3) {
    window.web3 = new Web3(web3.currentProvider);
    // no need to ask for permission
  }
  // No web3 provider
  else {
    console.log('No web3 provider detected');
  }
});

// contractAddress and abi are setted after contract deploy
const contractAddress = {
  "5": "0x00451c48e10CA9fCca521Ed47ecB282BBADda5d1",
  "421613": "0x788CC630c0D9f5e1475259Bf7Bd418EF1dDAb51A"
};

// network
var metamaskNetworkId;
web3.eth.net.getId(function (err, networkId) {
  metamaskNetworkId = networkId;
  $('#network').val('')
  $("#network option[value='" + metamaskNetworkId + "']").attr("disabled", "disabled");
});

async function loadTrxs() {
  var sender = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];
  return await window.contract.getUserTransactions(sender);
}
const supportedNetworks = {
  '5': 'Goerli Testnet',
  '421613': 'Arbitrum Goerli'
};
const ethscanLinks = {
  '5': 'https://goerli.etherscan.io/tx/',
  '421613': 'https://explorer.arbitrum.io/#/tx/'
}

/**
 * This function is called when the user clicks on the transfer button
 * It will call the lockTokens function of the smart contract
 */
async function transfer() {
  var amount = $("#amount").val();
  var tokenAddressId = $("#address").val();
  var destinationChainId = $("#network").val();
  var deadline = Date.now() + 60 * 20;
  var sender = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];
  var sign = await getSignature(
    tokenAddressId,
    window.ethereum.networkVersion,
    sender,
    contractAddress[metamaskNetworkId],
    ethers.utils.parseUnits(amount, 18).toBigInt(),
    deadline,
    window.provider.getSigner()
  );
  try {
    var tx = await window.contract.lockTokens(tokenAddressId, ethers.utils.parseUnits(amount, 18).toBigInt().toString(), destinationChainId, deadline, sign.v, sign.r, sign.s);
    $("#transfer").addClass('disabled');
    await tx.wait();
    alert("TokensLocked");
  } catch (e) {
    console.log(e);
    alert("Error: " + e.message);
  }
  $("#transfer").addClass('enabled');
}

/**
 * This function is required to sign the permit, since MetaMask does not expose wallet and private keys, we need to sign the message their way
 * Reference Guide how to sign message with MetaMask https://docs.metamask.io/guide/signing-data.html#signing-data
 */
async function getSignature(_tokenAddress, _chainId, customerAddress, _bridgeAddress, _amount, _deadline) {
  const TokenContract = new ethers.Contract(_tokenAddress, tokenAbi, window.provider.getSigner());
  const nonce = await TokenContract.nonces(customerAddress);

  const EIP712Domain = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
  ];

  const domain = {
    name: await TokenContract.name(),
    version: '1',
    chainId: _chainId,
    verifyingContract: _tokenAddress,
  };

  const Permit = [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ];

  const message = {
    owner: customerAddress,
    spender: _bridgeAddress,
    value: _amount.toString(),
    nonce: nonce.toHexString(),
    deadline: _deadline,
  };

  const data = JSON.stringify({
    types: {
      EIP712Domain,
      Permit,
    },
    domain,
    primaryType: 'Permit',
    message,
  });
  const signature = await provider.send('eth_signTypedData_v4', [customerAddress, data]);

  const signatureSplit = ethers.utils.splitSignature(signature);

  return { v: signatureSplit.v, r: signatureSplit.r, s: signatureSplit.s };

}

function claim(id) {
  window.contract.claimTokens(id);
  $("#button-" + id).addClass('disabled');
}

async function getGasPrice() {
  var gasPrice = await window.provider.getFeeData()

  return ethers.BigNumber.from(gasPrice.maxPriorityFeePerGas).toNumber() * 1.1;
}
