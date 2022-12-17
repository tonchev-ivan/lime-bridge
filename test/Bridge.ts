import { expect } from "chai";
import { providers } from "ethers";
import hre from "hardhat";
const { waffle, ethers } = require('hardhat');
const MyToken = require('../artifacts/contracts/MyToken.sol/MyToken.json');

async function getSignature(_tokenAddress: string, _chainId: number, customerAddress: string, _bridgeAddress: string, _amount: BigInt, _deadline: number, _wallet: ethers.Wallet) {

    const TokenContract = new hre.ethers.Contract(_tokenAddress, MyToken.abi, _wallet);
    const nonce = await TokenContract.nonces(_wallet.address);

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
    const signature = await ethers.provider.send('eth_signTypedData_v4', [customerAddress, data]);

    const signatureSplit = hre.ethers.utils.splitSignature(signature);

    return { v: signatureSplit.v, r: signatureSplit.r, s: signatureSplit.s };

}

describe("Bridge", function () {
    let bridgeContract: any;
    let coinContract: any;
    let owner, addr1, addr2, chainId;

    beforeEach(async function () {
        [owner, addr1, addr2] = await hre.ethers.getSigners();
        bridgeContract = await (await hre.ethers.getContractFactory("Bridge")).deploy(owner.address);
        coinContract = await (await hre.ethers.getContractFactory("MyToken")).deploy('LINK', 'LINK', owner.address);
        chainId = (await ethers.provider.getNetwork()).chainId;
        await coinContract.mint(owner.address, 1000);
        await coinContract.mint(bridgeContract.address, 1000);

    });

    it("Should lock tokens", async function () {
        const deadline = Date.now() + 60 * 20;
        const { v, r, s } = await getSignature(coinContract.address, chainId, owner.address, bridgeContract.address, BigInt(100), deadline, owner);

        // get block timestamp
        const block = await ethers.provider.getBlock();
        const blockTimestamp = block.timestamp;

        await expect(bridgeContract.lockTokens(coinContract.address, 100, chainId, deadline, v, r, s))
            .to.emit(bridgeContract, "TokensLocked")
            .withArgs(coinContract.address, owner.address, chainId, 90, blockTimestamp + 1);
    });

    it("Should not lock tokens without amount", async function () {
        const deadline = Date.now() + 60 * 20;
        const { v, r, s } = await getSignature(coinContract.address, chainId, owner.address, bridgeContract.address, BigInt(100), deadline, owner);

        await expect(bridgeContract.lockTokens(coinContract.address, 0, chainId, deadline, v, r, s))
            .to.be.revertedWith('Amount is required');
    });

    it("Should unlock tokens", async function () {
        // get block timestamp
        const block = await ethers.provider.getBlock();
        const blockTimestamp = block.timestamp;

        await expect(bridgeContract.unlockTokens(chainId, coinContract.address, owner.address, 100))
            .to.emit(bridgeContract, "TokensUnlocked")
            .withArgs(owner.address, 100, blockTimestamp + 1);
    });

    it("Should not unlock tokens unless gateway is requesting", async function () {
        await expect(bridgeContract.connect(addr1).unlockTokens(chainId, coinContract.address, owner.address, 100))
            .to.be.revertedWith('Only gateway can execute this function');
    });

    it("Should mint tokens", async function () {
        await bridgeContract.createToken(chainId, "0x162A433068F51e18b7d13932F27e66a3f99E6890", 'WLINK', 'WLINK');
        const wrappedTokenAddress = (await bridgeContract.getWrappedTokensArray())[0].wrappedTokenAddress;
        // get block timestamp
        const block = await ethers.provider.getBlock();
        const blockTimestamp = block.timestamp;

        await expect(bridgeContract.mint(chainId, owner.address, 100, wrappedTokenAddress))
            .to.emit(bridgeContract, "Mint")
            .withArgs(owner.address, wrappedTokenAddress, 100, blockTimestamp + 1);
    });

    it("Should not mint tokens unless gateway is requesting", async function () {
        await expect(bridgeContract.mint(chainId, owner.address, 100, "0x162A433068F51e18b7d13932F27e66a3f99E6890"))
            .to.be.revertedWith('No such token exists');
    });

    it("Should not mint tokens unless gateway is requesting", async function () {
        await expect(bridgeContract.connect(addr1).mint(chainId, owner.address, 100, "0x162A433068F51e18b7d13932F27e66a3f99E6890"))
            .to.be.revertedWith('Only gateway can execute this function');
    });

    it("Should claim wrapped tokens", async function () {
        await bridgeContract.createToken(chainId, "0x162A433068F51e18b7d13932F27e66a3f99E6890", 'WLINK', 'WLINK');
        const wrappedTokenAddress = (await bridgeContract.getWrappedTokensArray())[0].wrappedTokenAddress;
        await bridgeContract.mint(chainId, owner.address, 100, wrappedTokenAddress);
        // get block timestamp
        const block = await ethers.provider.getBlock();
        const blockTimestamp = block.timestamp;

        await expect(bridgeContract.claimTokens(0))
            .to.emit(bridgeContract, "TokensClaimed")
            .withArgs(0, owner.address, 100, blockTimestamp + 1);
    });

    it("Should claim native tokens", async function () {
        await bridgeContract.unlockTokens(chainId, coinContract.address, owner.address, 100);
        // get block timestamp
        const block = await ethers.provider.getBlock();
        const blockTimestamp = block.timestamp;

        await expect(bridgeContract.claimTokens(0))
            .to.emit(bridgeContract, "TokensClaimed")
            .withArgs(0, owner.address, 100, blockTimestamp + 1);
    });

    it("Should not claim tokens if tokens were not locked or minted", async function () {
        await expect(bridgeContract.claimTokens(0))
            .to.be.revertedWith('Transaction does not exist');

        await bridgeContract.unlockTokens(chainId, coinContract.address, owner.address, 100);

        await expect(bridgeContract.claimTokens(1))
            .to.be.revertedWith('Transaction does not exist');
    });

    it("Should not claim tokens twice", async function () {
        await bridgeContract.unlockTokens(chainId, coinContract.address, owner.address, 100);
        // get block timestamp
        const block = await ethers.provider.getBlock();
        const blockTimestamp = block.timestamp;

        await expect(bridgeContract.claimTokens(0))
            .to.emit(bridgeContract, "TokensClaimed")
            .withArgs(0, owner.address, 100, blockTimestamp + 1);
        await expect(bridgeContract.claimTokens(0))
            .to.be.revertedWith('Already claimed');
    });

    it("Should burn tokens", async function () {
        await bridgeContract.createToken(chainId, "0x162A433068F51e18b7d13932F27e66a3f99E6890", 'WLINK', 'WLINK');
        const wrappedTokenAddress = (await bridgeContract.getWrappedTokensArray())[0].wrappedTokenAddress;
        await bridgeContract.mint(chainId, owner.address, 100, wrappedTokenAddress);
        bridgeContract.claimTokens(0);

        const deadline = Date.now() + 60 * 20;
        const { v, r, s } = await getSignature(wrappedTokenAddress, chainId, owner.address, bridgeContract.address, BigInt(10), deadline, owner);

        // get block timestamp
        const block = await ethers.provider.getBlock();
        const blockTimestamp = block.timestamp;

        await expect(bridgeContract.burn(wrappedTokenAddress, 10, 99, deadline, v, r, s))
            .to.emit(bridgeContract, "Burn")
            .withArgs(wrappedTokenAddress, owner.address, 99, 10, blockTimestamp + 1);
    });

    it("Should fail burning tokens", async function () {
        const deadline = Date.now() + 60 * 20;
        const { v, r, s } = await getSignature(coinContract.address, chainId, owner.address, bridgeContract.address, BigInt(0), deadline, owner);

        await expect(bridgeContract.burn(coinContract.address, 0, 99, deadline, v, r, s))
            .to.be.revertedWith('Amount is required');

        await expect(bridgeContract.burn(coinContract.address, 1, 99, deadline, v, r, s))
            .to.be.revertedWith('No such token');
    });

    it("Should create tokens unless gateway is requesting", async function () {
        await expect(bridgeContract.connect(addr1).createToken(chainId, "0x162A433068F51e18b7d13932F27e66a3f99E6890", 'Test', 'Test'))
            .to.be.revertedWith('Only gateway can execute this function');
    });

    it("Should get wrapped token", async function () {
        await bridgeContract.createToken(chainId, "0x162A433068F51e18b7d13932F27e66a3f99E6890", 'WLINK', 'WLINK');
        const wrappedTokenAddress = (await bridgeContract.getWrappedTokensArray())[0].wrappedTokenAddress;
        const wrappedToken = await bridgeContract.getWrappedToken(wrappedTokenAddress);
        expect(wrappedToken).to.equal(wrappedTokenAddress);
    });

    it("Should get user transactions", async function () {
        await bridgeContract.createToken(chainId, "0x162A433068F51e18b7d13932F27e66a3f99E6890", 'WLINK', 'WLINK');
        const wrappedTokenAddress = (await bridgeContract.getWrappedTokensArray())[0].wrappedTokenAddress;
        await bridgeContract.mint(chainId, owner.address, 100, wrappedTokenAddress);

        const transactions = await bridgeContract.getUserTransactions(owner.address);
        expect(transactions.length).to.equal(1);
        expect(transactions[0].amount).to.equal(100);
        expect(transactions[0].fromChainId).to.equal(chainId);
        expect(transactions[0].toChainId).to.equal(chainId);
        expect(transactions[0].tokenAddress).to.equal(wrappedTokenAddress);
    });

    it("Should collect fees", async function () {
        const deadline = Date.now() + 60 * 20;
        const { v, r, s } = await getSignature(coinContract.address, chainId, owner.address, bridgeContract.address, BigInt(100), deadline, owner);

        await bridgeContract.lockTokens(coinContract.address, 100, chainId, deadline, v, r, s);

        const balanceBefore = await coinContract.balanceOf(owner.address);
        await bridgeContract.collectFees(coinContract.address);
        const balanceAfter = await coinContract.balanceOf(owner.address);

        expect(Number(balanceAfter)).to.equal(Number(balanceBefore) + 10);
    });

    it("Should collect fees only if owner initiatet the request", async function () {
        expect(bridgeContract.connect(addr1).collectFees(coinContract.address)).to.be.revertedWith('only gateway can execute this function');
    });

    it("Should collect fees only if fees were collected", async function () {
        expect(bridgeContract.collectFees(coinContract.address)).to.be.revertedWith('No fees collected');
    });

    it("Should mint tokens only if owner initiatet the request", async function () {
        expect(coinContract.connect(addr1).mint(owner.address, 100)).to.be.revertedWith('only gateway can execute this function');
    });
});