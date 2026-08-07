const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with: ${deployer.address}`);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Deployer balance: ${hre.ethers.formatEther(balance)} MATIC\n`);

  // --- Use existing InvoiceRegistry ---
  const registryAddress = "0x5D492d264bb60245C4e954280c9c1dB75beB097C";
  console.log(`✅ Using already deployed InvoiceRegistry at: ${registryAddress}`);
  const InvoiceRegistry = await hre.ethers.getContractFactory("InvoiceRegistry");
  const registry = InvoiceRegistry.attach(registryAddress);


  // --- Deploy EscrowFactory ---
  console.log("Deploying EscrowFactory...");
  const EscrowFactory = await hre.ethers.getContractFactory("EscrowFactory");
  const escrowFactory = await EscrowFactory.deploy(deployer.address, {
    gasPrice: hre.ethers.parseUnits("30", "gwei")
  });
  await escrowFactory.waitForDeployment();
  const escrowFactoryAddress = await escrowFactory.getAddress();
  console.log(`✅ EscrowFactory deployed to: ${escrowFactoryAddress}`);
  console.log(`   PolygonScan: https://amoy.polygonscan.com/address/${escrowFactoryAddress}\n`);

  // --- Wire them up ---
  console.log("Wiring contracts together...");
  const tx1 = await registry.setAuthorizedUpdater(escrowFactoryAddress);
  await tx1.wait();
  const tx2 = await escrowFactory.setRegistry(registryAddress);
  await tx2.wait();
  console.log("✅ Contracts wired together successfully.\n");

  console.log("---------------------------------------------------");
  console.log("Add these to your backend/.env and frontend/.env:");
  console.log(`VITE_NFT_CONTRACT_ADDRESS=${registryAddress}`);
  console.log(`VITE_ESCROW_FACTORY_ADDRESS=${escrowFactoryAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
