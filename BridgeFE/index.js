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
console.log(window.web3.currentProvider)

// // contractAddress and abi are setted after contract deploy
var contractAddress = {
    "5": "0xE0e2A18B611067cb5CA1E549c3E55cAf85086f82",
    "421613": "0x944987212E9AE913d35BC09b0B899C6bFa68D8F9"
};

// define contract ABI
var abi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_bridge",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "trxId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "destinationChainId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "nonce",
                "type": "uint256"
            }
        ],
        "name": "ClaimTokens",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "Mint",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "bridgeApi",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_destinationChainId",
                "type": "uint256"
            }
        ],
        "name": "burn",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            }
        ],
        "name": "confirmClaim",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTransfers",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "destinationTokenAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "destinationChainId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "claimed",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint256",
                        "name": "nonce",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct Bridge.Transfer[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            }
        ],
        "name": "initiateClaim",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_token",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "otherChainNonce",
                "type": "uint256"
            }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "nonce",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "trxs",
        "outputs": [
            {
                "internalType": "address",
                "name": "destinationTokenAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "destinationChainId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "claimed",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "nonce",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "usedNonces",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// network
var metamaskNetworkId;
web3.eth.net.getId(function (err, networkId) {
    metamaskNetworkId = networkId;
    $('#network').val('')
    $("#network option[value='" + metamaskNetworkId + "']").attr("disabled", "disabled");
});

//contract instance
contract = new web3.eth.Contract(abi, contractAddress[metamaskNetworkId]);
// Accounts
var account;

web3.eth.getAccounts(function (err, accounts) {
    if (err != null) {
        alert("Error retrieving accounts.");
        return;
    }
    if (accounts.length == 0) {
        alert("No account found! Make sure the Ethereum client is configured properly.");
        return;
    }
    account = accounts[0];
    console.log('Account: ' + account);
    web3.eth.defaultAccount = account;
});

var transactions = [];
function loadTrxs() {
    contract.options.address = contractAddress[metamaskNetworkId];

    contract.methods.getTransfers().call({ from: account }, function (error, result) {
        if (error == null) {
            transactions = result;
            if (typeof fillTable === "function") {
                fillTable();
            }
        }
    });
}

var supportedTokens = {
    '5': { 'LTT': '0x7aC74cc3eE165B715C190ebcB2a33D429f297614' },
    '421613': { 'LTT': '0x714dE63FBE27598d042eae13361c09B060969f15' },
};
var supportedNetworks = {
    '5': 'Goerli Testnet',
    '421613': 'Arbitrum Goerli'
};

var ethscanLinks = {
    '5': 'https://goerli.etherscan.io/tx/',
    '421613': 'https://explorer.arbitrum.io/#/tx/'
}

//Smart contract functions
function transfer() {
    contract.options.address = contractAddress[metamaskNetworkId];

    var amount = $("#amount").val();
    var tokenAddressId = $("#address").val();
    // catch the error
    contract.methods.burn(supportedTokens[metamaskNetworkId][tokenAddressId], amount, 11).send({ from: account })
        .on('transactionHash', function (hash) {
            console.log('hash', ethscanLinks[metamaskNetworkId] + hash);
            alert("Transaction: " + ethscanLinks[metamaskNetworkId] + hash);
        })
        .on('receipt', function (receipt) {
            console.log('receipt', receipt);
        })
        .on('confirmation', function (confirmationNumber, receipt) {
            console.log(receipt.Status.Value);
            // alert("Transaction confirmed");
        })
        .on('error', function (error) {
            var text = error.message.split("VM Exception while processing transaction:")[1];
            $("#error").html(text.substring(0, text.indexOf(',') - 1));
        });

    $("#amount").val('');
    $("#to").val('');
}

function claim(id) {
    contract.options.address = contractAddress[metamaskNetworkId];

    contract.methods.initiateClaim(id).send({ from: account })
        .on('receipt', function (receipt) {
            console.log('receipt', receipt);
        })
        .on('confirmation', function (confirmationNumber, receipt) {
            console.log(receipt.Status.Value);
            alert("Transaction confirmed");
        })
        .on('error', function (error) {
            var text = error.message.split("VM Exception while processing transaction:")[1];
            $("#error").html(text.substring(0, text.indexOf(',') - 1));
        });

}
