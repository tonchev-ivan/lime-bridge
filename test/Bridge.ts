import { expect } from "chai";
import hre from "hardhat";

describe("Bridge", function () {
    let bridgeContract: any;
    let coinContract: any;
    let owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await hre.ethers.getSigners();
        bridgeContract = await (await hre.ethers.getContractFactory("Bridge")).deploy(owner.address);
        coinContract = await (await hre.ethers.getContractFactory("LimeTestToken")).deploy(bridgeContract.address);
    });

    it("Should burn a coin", async function () {
        await bridgeContract.mint(coinContract.address, owner.address, 100, 0);
        await bridgeContract.burn(coinContract.address, 1, 1);

        expect((await bridgeContract.getTransfers()).length).to.equal(1);
    });

    it("Should mint a coin", async function () {
        await bridgeContract.mint(coinContract.address, owner.address, 100, 0);

        expect(await coinContract.balanceOf(owner.address)).to.equal(100);
    });

    it("Should mint a coin only once per burn", async function () {
        await bridgeContract.mint(coinContract.address, owner.address, 100, 0)
        await expect(bridgeContract.mint(coinContract.address, owner.address, 100, 0)).to.be.revertedWith('transfer already processed');
    });

    it("Only owner can mint", async function () {
        await expect(bridgeContract.connect(addr1).mint(coinContract.address, addr1.address, 100, 0)).to.be.revertedWith('only bridge api can mint');
    });

    it("Should initiate claim", async function () {
        await bridgeContract.mint(coinContract.address, owner.address, 100, 0);
        await bridgeContract.burn(coinContract.address, 1, 1);

        await expect(bridgeContract.initiateClaim(0))
            .to.emit(bridgeContract, "ClaimTokens")
            .withArgs(0, coinContract.address, owner.address, 1, 1, 0);
    });

    it("Should not initiate claim for non existing transfer", async function () {
        await expect(bridgeContract.initiateClaim(0)).to.be.revertedWith('there is no transfer with this id');
    });

    it("Should not initiate claim for claimed transfers", async function () {
        await bridgeContract.mint(coinContract.address, owner.address, 100, 0);
        await bridgeContract.burn(coinContract.address, 1, 1);
        await bridgeContract.confirmClaim(0);
        
        await expect(bridgeContract.initiateClaim(0)).to.be.revertedWith('transfer already claimed');
    });

    it("Should confirm claimed transfers", async function () {
        await bridgeContract.mint(coinContract.address, owner.address, 100, 0);
        await bridgeContract.burn(coinContract.address, 1, 1);
        await bridgeContract.confirmClaim(0);
        let transfers = await bridgeContract.getTransfers();
        expect(transfers[0].claimed).to.equal(true);
    });

    it("Should confirm non existing transfers", async function () {
        await expect(bridgeContract.confirmClaim(0)).to.be.revertedWith('there is no transfer with this id');
    });

    it("Should not confirm claimed transfers", async function () {
        await bridgeContract.mint(coinContract.address, owner.address, 100, 0);
        await bridgeContract.burn(coinContract.address, 1, 1);
        await bridgeContract.confirmClaim(0);
        await expect(bridgeContract.confirmClaim(0)).to.be.revertedWith('transfer already claimed');

    });

    it("Only owner can confirm claim", async function () {
        await expect(bridgeContract.connect(addr1).confirmClaim(0)).to.be.revertedWith('only bridge api can confirm');
    });

    it("Only bridge can mint", async function () {
        await expect(coinContract.mint(owner.address, 1)).to.be.revertedWith('only bridge contract can mint');
    });

    it("Only bridge can burn", async function () {
        await expect(coinContract.burn(owner.address, 1)).to.be.revertedWith('only bridge contract can burn');
    });
});