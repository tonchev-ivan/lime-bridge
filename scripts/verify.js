const hre = require("hardhat");
async function main() {

    await hre.run("verify:verify", {
        address: process.env.BRIDGE_ADDRESS,
        constructorArguments: [process.env.BRIDGE_ADMIN_ADDRESS],
        
    });
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })