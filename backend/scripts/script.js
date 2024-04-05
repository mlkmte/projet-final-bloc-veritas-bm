const hre = require("hardhat");

async function main() {
  // récuperation du contrat
  const BlocVeritas = await ethers.getContractFactory("BlocVeritas");

  // connexion au contrat déployé
  const blocveritas = BlocVeritas.attach(
    "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  );


  // opérations sur le contrat
  let transaction = await blocveritas.addCompagny(
    "Apple",
    "Paris",
    "36252187900034",
    "0",
    "0x71bE63f3384f5fb98995898A86B02Fb2426c5788"
  );
  transaction.wait();
  console.log(transaction);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
