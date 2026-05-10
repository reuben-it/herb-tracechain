const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying HerbVerification contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

  const HerbVerification = await ethers.getContractFactory("HerbVerification");
  const contract = await HerbVerification.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\n✅ HerbVerification deployed to:", address);
  console.log("\nAdd this to your backend .env file:");
  console.log(`ETHEREUM_CONTRACT_ADDRESS=${address}`);
  console.log(`ETHEREUM_PRIVATE_KEY=${deployer.address === "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" ? "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" : "<your-private-key>"}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
