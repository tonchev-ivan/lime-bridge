import { ethers } from "hardhat";

async function main() {
  const Token = await ethers.getContractFactory("MyToken");
  const token = await Token.deploy(process.env.TOKEN_NAME, process.env.TOKEN_SYMBOL, process.env.BRIDGE_ADMIN_ADDRESS);
  console.log(
        'Token deployed',
      );

  console.log("Token address:", token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
