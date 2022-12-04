import { ethers } from "hardhat";

async function main() {
  const Bridge = await ethers.getContractFactory("Bridge");
  const bridge = await Bridge.deploy("0x58373aD18bB235d3cD6Ae43D2B922be9f4D43Ca3");

  console.log(
    'Bridge deployed',
  );

  console.log("Token address:", bridge.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
