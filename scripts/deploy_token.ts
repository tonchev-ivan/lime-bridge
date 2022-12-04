import { ethers } from "hardhat";

async function main() {
  const LimeTestToken = await ethers.getContractFactory("LimeTestToken");
  const token = await LimeTestToken.deploy("0x944987212E9AE913d35BC09b0B899C6bFa68D8F9");

  console.log(
    'Bridge deployed',
  );

  console.log("Token address:", token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
