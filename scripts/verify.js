const hre = require("hardhat");
async function main() {

    await hre.run("verify:verify", {
        address: process.env.ARBITRUM_CONTRACT_ADDRESS,
        constructorArguments: ["0x58373aD18bB235d3cD6Ae43D2B922be9f4D43Ca3"],
    });
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })