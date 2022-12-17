const hre = require("hardhat");
async function main() {

    await hre.run("verify:verify", {
        address: process.env.TOKEN_ADDRESS,
        constructorArguments: [process.env.TOKEN_NAME, process.env.TOKEN_SYMBOL, process.env.BRIDGE_ADMIN_ADDRESS],
    });
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })