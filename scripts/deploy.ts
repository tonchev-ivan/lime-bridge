import { ethers } from "hardhat";

async function main() {

  const Bridge = await ethers.getContractFactory("Bridge");
  const bridge = await Bridge.deploy(process.env.BRIDGE_ADMIN_ADDRESS);
  console.log(
    'Bridge deployed',
  );

  console.log("Bridge address:", bridge.address);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
