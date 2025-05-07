import { ethers, artifacts } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy TokenFactory
  const TokenFactory = await ethers.getContractFactory("TokenFactory");
  const tokenFactory = await TokenFactory.deploy();
  await tokenFactory.waitForDeployment();
  const tokenFactoryAddress = await tokenFactory.getAddress();
  console.log("TokenFactory deployed to:", tokenFactoryAddress);

  // Save contract address to .env file
  const envFilePath = path.resolve(__dirname, "..", ".env");
  let envContent = "";
  if (fs.existsSync(envFilePath)) {
    envContent = fs.readFileSync(envFilePath, "utf-8");
  }

  const newEnvContent = `NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS=${tokenFactoryAddress}`;

  const lines = envContent.split('\n');
  const updatedLines = lines.filter(line =>
    !line.startsWith("NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS=")
  );

  fs.writeFileSync(envFilePath, updatedLines.concat(newEnvContent).join("\n"));
  console.log(`TokenFactory address saved to ${envFilePath}`);

  // Copy ABI to Next.js app
  const abiDir = path.resolve(__dirname, "..", "..", "src", "app", "abis");

  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  const tokenFactoryArtifact = await artifacts.readArtifact("TokenFactory");
  fs.writeFileSync(
    path.join(abiDir, "TokenFactory.json"),
    JSON.stringify(tokenFactoryArtifact.abi, null, 2)
  );
  console.log("TokenFactory ABI copied to src/app/abis/TokenFactory.json");

  const customTokenArtifact = await artifacts.readArtifact("CustomToken");
  fs.writeFileSync(
    path.join(abiDir, "CustomToken.json"),
    JSON.stringify(customTokenArtifact.abi, null, 2)
  );
  console.log("CustomToken ABI copied to src/app/abis/CustomToken.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });