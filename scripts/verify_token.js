const hre = require("hardhat");
async function main() {

    await hre.run("verify:verify", {
        address: process.env.ARBITRUM_TOKEN_CONTRACT_ADDRESS,
        constructorArguments: ["0x944987212E9AE913d35BC09b0B899C6bFa68D8F9"],
    });
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })