import { ethers } from "hardhat";
const BridgeContract = require('../artifacts/contracts/Bridge.sol/Bridge.json');
const MyToken = require('../artifacts/contracts/MyToken.sol/MyToken.json');

const provider = new ethers.providers.JsonRpcProvider(process.env.GOERLI_API_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const bridge = new ethers.Contract(process.env.GOERLI_CONTRACT_ADDRESS, BridgeContract.abi, wallet);

const provider2 = new ethers.providers.JsonRpcProvider(process.env.ARBITRUM_API_URL);
const wallet2 = new ethers.Wallet(process.env.PRIVATE_KEY, provider2);
const bridge2 = new ethers.Contract(process.env.ARBITRUM_CONTRACT_ADDRESS, BridgeContract.abi, wallet2);

/**
 * @dev This class is used to store the information of a wrapped token
 * @param mainAddress The address of the token on the main network
 * @param mainChainId The chainId of the main network
 * @param wrappedAddress The address of the wrapped token on the side network
 * @param wrappedChainId The chainId of the side network
 */
class BridgedToken {
    mainAddress: string;
    mainChainId: number;
    wrappedAddress: string;
    wrappedChainId: number;
    constructor(mainAddress: string, mainChainId: number, wrappedAddress: string, wrappedChainId: number) {
        this.mainAddress = mainAddress;
        this.mainChainId = mainChainId;
        this.wrappedAddress = wrappedAddress;
        this.wrappedChainId = wrappedChainId;
    }
}

/**
 * @dev This class is used to store the information of a supported network
 * @param chainId The chainId of the network
 * @param contract The contract of the bridge on the network
 * @param bridgedTokens The list of bridged tokens on the network
 * @param wallet The wallet of the gateway on the network
 */
class SupportedNetwork {
    chainId: number;
    contract: ethers.Contract;
    bridgedTokens: BridgedToken[];
    wallet: ethers.Wallet;
    constructor(chainId: number, contract: ethers.Contract, bridgedTokens: BridgedToken[], wallet: ethers.Wallet) {
        this.chainId = chainId;
        this.contract = contract;
        this.bridgedTokens = bridgedTokens;
        this.wallet = wallet;
    }
}

/**
 * @dev This variable stores the list of supported networks
 */
let supportedNetworks = [
    new SupportedNetwork(5, bridge, [], wallet),
    new SupportedNetwork(421613, bridge2, [], wallet2),
];

/**
 * @dev This variable stores log colors for the console
 */
let logColors = {
    "CYAN": "\x1b[36m%s\x1b[0m",
    "BLUE": "\x1b[34m%s\x1b[0m",
    "PURPLE": "\x1b[35m%s\x1b[0m",
    "ORANGE": "\x1b[33m%s\x1b[0m",
}

async function main() {
    for (let i = 0; i < supportedNetworks.length; i++) {
        supportedNetworks[i].contract.on("TokensLocked", async (_tokenAddress: string,
            requester: string,
            _targetChainId: string,
            amount: string,
            timestamp: string) => {
            eventLog(logColors.BLUE, "TokensLocked");
            console.log(logColors.BLUE, "\ntoken address: " + _tokenAddress + "\nrequester: " + requester + "\ntargetChainId: " + _targetChainId + "\namount: " + amount + "\ntimestamp " + timestamp);

            if (await supportedNetworks[i].contract.getWrappedToken(_tokenAddress) === "0x0000000000000000000000000000000000000000") {
                /* non wrapped token
                 * mint tokens on target chain 
                 */
                await mintWrappedToken(supportedNetworks[i], _targetChainId, _tokenAddress, amount, requester);
            } else {
                /* wrapped token
                 * burn tokens on this chain */
                const deadline = Date.now() + 20 * 60;
                const { v, r, s } = await getPermitSignature(
                    supportedNetworks[i].wallet,
                    _tokenAddress,
                    supportedNetworks[i].contract.address,
                    amount,
                    deadline
                );

                await supportedNetworks[i].contract.burn(_tokenAddress, BigInt(amount), _targetChainId, deadline, v, r, s);
                /* after that unlock tokens on target chain */
            }
        });

        supportedNetworks[i].contract.on("Burn", async (
            _wrappedTokenAddress: string, sender: string, _targetChainId: string, amount: string, timestamp: string) => {
            eventLog(logColors.ORANGE, "Burn");

            /* unlock tokens on target chain */
            unlockTokens(_wrappedTokenAddress, _targetChainId, supportedNetworks[i], sender, amount);
        }
        );

        /* following events are not needed for the demo, they are used only for testing purpose */

        supportedNetworks[i].contract.on("Mint", async (
            _receiver: string, _wrappedTokenAddress: string, amount: string, timestamp: string) => {
            eventLog(logColors.CYAN, "Mint");
            console.log(logColors.CYAN, "\nreceiver: " + _receiver + "\nwrappedTokenAddress: " + _wrappedTokenAddress + "\namount: " + amount + "\ntimestamp: " + timestamp);
        }
        );

        supportedNetworks[i].contract.on("TokensUnlocked", async (
            _requester: string, _bridgedAmount: string, timestamp: string) => {
            eventLog(logColors.PURPLE, "TokensUnlocked Event");
            console.log(logColors.PURPLE, "\nrequester: " + _requester + "\n_bridgedAmount: " + _bridgedAmount + "\ntimestamp: " + timestamp);
        }
        );

    }

}

/**
 * Unlock tokens on target chain
 * 
 * @function
 * @name unlockTokens
 * @param {string} _wrappedTokenAddress - address of wrapped token
 * @param {string} _targetChainId - target chain id
 * @param {SupportedNetwork} currentNetwork - current network
 * @param {string} sender - sender address
 * @param {string} amount - amount of tokens to unlock
 * @returns {Promise<void>}
 * 
 * @example
 * unlockTokens("0x0000000000000000000000000000000000000000", "31337", mainNetwork, "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "1000000000000000000");
 */
async function unlockTokens(_wrappedTokenAddress: string, _targetChainId: string, currentNetwork: SupportedNetwork, sender: string, amount: string) {
    const destinationNetwork = supportedNetworks.find((network) => network.chainId === Number(_targetChainId));
    if (!destinationNetwork) {
        console.log(logColors.ORANGE, "Unsupported network " + _targetChainId);
        return;
    }
    var bridgedTokens = await currentNetwork.contract.getWrappedTokensArray();
    var token = bridgedTokens.find((token: { chainId: number; originalTokenAddress: string; wrappedTokenAddress: any }) => Number(token.chainId) === destinationNetwork.chainId && token.wrappedTokenAddress === _wrappedTokenAddress);
    if (!token) {
        console.log(logColors.ORANGE, "Token not found");
        return;
    }
    console.log(logColors.ORANGE, token);
    console.log(logColors.ORANGE, "unlocking tokens");
    await destinationNetwork.contract.unlockTokens(currentNetwork.chainId, token.originalTokenAddress, sender, amount);
}

/**
 * Mint wrapped token on target chain
 * 
 * @function
 * @name mintWrappedToken
 * @param {SupportedNetwork} initiatorNetwork
 * @param {string} _targetChainId
 * @param {string} _tokenAddress
 * @param {string} _amount
 * @param {string} requester
 * @returns {Promise<void>}
 * @throws {Error}
 * @example
 * await mintWrappedToken(supportedNetworks[i], _targetChainId, _tokenAddress, amount, requester);
 * 
 */
async function mintWrappedToken(initiatorNetwork: SupportedNetwork, _targetChainId: string, _tokenAddress: string, _amount: string, requester: string) {
    const destinationNetwork = supportedNetworks.find((network) => network.chainId === Number(_targetChainId));
    if (!destinationNetwork) {
        console.log(logColors.CYAN, "Unsupported network " + _targetChainId);
        return;
    }
    // find if token is bridged to this destination network
    var bridgedTokenObject = destinationNetwork.bridgedTokens.find((token) => token.mainAddress === _tokenAddress && token.mainChainId === initiatorNetwork.chainId && token.wrappedChainId === Number(_targetChainId));

    if (!bridgedTokenObject) {
        console.log(logColors.CYAN, "Update wrapped token from contract...");

        var bridgedTokens = await destinationNetwork.contract.getWrappedTokensArray();
        var token = bridgedTokens.find((token: { chainId: number; originalTokenAddress: string; wrappedTokenAddress: any }) => Number(token.chainId) === initiatorNetwork.chainId && token.originalTokenAddress === _tokenAddress);
        if (!token) {
            console.log(logColors.CYAN, "Token not bridged to network " + _targetChainId);
            console.log(logColors.CYAN, "Bridging...");
            const tokenContract = new ethers.Contract(_tokenAddress, MyToken.abi, initiatorNetwork.wallet);
            const tokenName = await tokenContract.name();
            const tokenSymbol = await tokenContract.symbol();
            console.log(logColors.CYAN, "Token name " + tokenName + " symbol " + tokenSymbol);
            await destinationNetwork.contract.createToken(initiatorNetwork.chainId, _tokenAddress, "Wrapped " + tokenName, "W" + tokenSymbol);
            console.log(logColors.CYAN, "Created token: Wrapped " + tokenName);
            bridgedTokens = await destinationNetwork.contract.getWrappedTokensArray();

            token = bridgedTokens.find((token: { chainId: any; originalTokenAddress: string; wrappedTokenAddress: any }) => token.chainId.toNumber() === initiatorNetwork.chainId && token.originalTokenAddress === _tokenAddress);
        }
        console.log(logColors.CYAN, "Bridged token address " + token);
        // caching bridged token
        destinationNetwork.bridgedTokens.push(new BridgedToken(_tokenAddress, initiatorNetwork.chainId, token.wrappedTokenAddress, Number(_targetChainId)));
        bridgedTokenObject = destinationNetwork.bridgedTokens.find((token) => token.mainAddress === _tokenAddress && token.mainChainId === initiatorNetwork.chainId && token.wrappedChainId === Number(_targetChainId));
    }
    await destinationNetwork.contract.mint(initiatorNetwork.chainId, requester, _amount, bridgedTokenObject?.wrappedAddress);
}

function eventLog(color: string, eventName: string) {
    console.log(color, "=============Event " + eventName + "================");
}

/**
 * Function to get permit signature
 * @param {ethers.Wallet} _wallet - wallet to sign
 * @param {string} _tokenAddress - token address
 * @param {string} spender - spender address
 * @param {string} value - value to approve
 * @param {number} deadline - deadline
 * @returns {Promise<string>} - signature
 * @example
 * const signature = await getPermitSignature(wallet, tokenAddress, spender, value, deadline);
 */
async function getPermitSignature(_wallet: any, _tokenAddress: string, spender: any, value: string, deadline: number) {
    const token = new ethers.Contract(_tokenAddress, MyToken.abi, _wallet);

    const [nonce, name, version, chainId] = await Promise.all([
        token.nonces(_wallet.address),
        token.name(),
        "1",
        _wallet.getChainId(),
    ])

    return ethers.utils.splitSignature(
        await _wallet._signTypedData(
            {
                name,
                version,
                chainId,
                verifyingContract: token.address,
            },
            {
                Permit: [
                    {
                        name: "owner",
                        type: "address",
                    },
                    {
                        name: "spender",
                        type: "address",
                    },
                    {
                        name: "value",
                        type: "uint256",
                    },
                    {
                        name: "nonce",
                        type: "uint256",
                    },
                    {
                        name: "deadline",
                        type: "uint256",
                    },
                ],
            },
            {
                owner: _wallet.address,
                spender,
                value,
                nonce,
                deadline,
            }
        )
    )
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
