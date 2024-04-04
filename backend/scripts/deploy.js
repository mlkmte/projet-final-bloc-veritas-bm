const hre = require("hardhat");

async function main() {
  
  const BlocVeritas = await hre.ethers.deployContract("BlocVeritas");

  await BlocVeritas.waitForDeployment();

  console.log(
    `BlocVeritas deployed to ${BlocVeritas.target}`
  );
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
