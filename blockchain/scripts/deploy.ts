import { ethers, artifacts } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy SampleToken
  const sampleTokenFactory = await ethers.getContractFactory("SampleToken");
  const sampleToken = await sampleTokenFactory.deploy("Sample Token", "STK", ethers.parseUnits("1000000", 18));
  await sampleToken.waitForDeployment();
  const sampleTokenAddress = await sampleToken.getAddress();
  console.log("SampleToken deployed to:", sampleTokenAddress);

  // Deploy UniswapClone
  const uniswapCloneFactory = await ethers.getContractFactory("UniswapClone");
  const uniswapClone = await uniswapCloneFactory.deploy();
  await uniswapClone.waitForDeployment();
  const uniswapCloneAddress = await uniswapClone.getAddress();
  console.log("UniswapClone deployed to:", uniswapCloneAddress);

  // Save contract addresses to .env file
  const envFilePath = path.resolve(__dirname, "..", ".env");
  let envContent = "";
  if (fs.existsSync(envFilePath)) {
    envContent = fs.readFileSync(envFilePath, "utf-8");
  }

  const newEnvContent = [
    `NEXT_PUBLIC_SAMPLE_TOKEN_ADDRESS=${sampleTokenAddress}`,
    `NEXT_PUBLIC_UNISWAP_CLONE_ADDRESS=${uniswapCloneAddress}`
  ];

  const lines = envContent.split('\n');
  const updatedLines = lines.filter(line =>
    !line.startsWith("NEXT_PUBLIC_SAMPLE_TOKEN_ADDRESS=") &&
    !line.startsWith("NEXT_PUBLIC_UNISWAP_CLONE_ADDRESS=")
  );

  fs.writeFileSync(envFilePath, updatedLines.concat(newEnvContent).join("\n"));
  console.log(`Contract addresses saved to ${envFilePath}`);

  // Copy ABIs to Next.js app
  const abiDir = path.resolve(__dirname, "..", "..", "src", "app", "abis");

  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  // Get artifact using artifacts directly instead of hre
  const sampleTokenArtifact = await artifacts.readArtifact("SampleToken");
  fs.writeFileSync(
    path.join(abiDir, "SampleToken.json"),
    JSON.stringify(sampleTokenArtifact.abi, null, 2)
  );
  console.log("SampleToken ABI copied to src/app/abis/SampleToken.json");

  const uniswapCloneArtifact = await artifacts.readArtifact("UniswapClone");
  fs.writeFileSync(
    path.join(abiDir, "UniswapClone.json"),
    JSON.stringify(uniswapCloneArtifact.abi, null, 2)
  );
  console.log("UniswapClone ABI copied to src/app/abis/UniswapClone.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });