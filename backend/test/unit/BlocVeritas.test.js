const { ethers } = require("hardhat");
const { expect, assert } = require("chai");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Test BlocVeritas contract", function () {

  async function deployContract() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const contract = await ethers.getContractFactory("BlocVeritas", owner);
    const deployedContract = await contract.deploy();

    let siret1 = "55327987900673";
    let siret2 = "60027987900673";
    let productRef1 = "ref1";
    let productRef2 = "ref2";

    return { deployedContract, owner, addr1, addr2, siret1, siret2, productRef1, productRef2 };
  }

  describe("Checking deployment process", function () {
    it("Should deploy BlocVeritas smart contract", async function () {
      const { deployedContract } = await loadFixture(deployContract);
      expect(await deployedContract.feedBackCount()).to.equal(0);
    });

    it("Should check if owner is the owner of the contract", async function () {
      const { deployedContract, owner } = await loadFixture(deployContract);
      expect(await deployedContract.owner()).to.equal(owner.address);
    });
  });

  describe("Test addCompagny function", async function () {
    it("Should add compagny", async function () {
      const { deployedContract, addr1, siret1} = await loadFixture(deployContract);
      await expect(
        deployedContract.addCompagny("BlocVeritas", "Paris", siret1, "0",addr1)
      )
        .to.emit(deployedContract, "CompagnyRegistered")
        .withArgs(siret1, addr1);
    });

    it("Should not add compagny if user is not the owner", async function () {
      const { deployedContract, addr1, addr2, siret1} = await loadFixture(deployContract);
        await expect(
          deployedContract.connect(addr1).addCompagny("BlocVeritas", "Paris", siret1, "0",addr2)
        ).to.be.revertedWithCustomError(
        deployedContract,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("Test addProduct function", async function () {
    it("Should add product", async function () {
      const { deployedContract, addr1, siret1, productRef1} = await loadFixture(deployContract);

      let transaction = await deployedContract.addCompagny("BlocVeritas", "Paris", siret1, "0",addr1);
      await transaction.wait();

        await expect(deployedContract.connect(addr1).addProduct(siret1, productRef1, "base_url"))
        .to.emit(deployedContract, "ProductRegistered")
        .withArgs(siret1, productRef1);

    });

    it("Should not add product if user is not a compagny owner", async function () {
      const { deployedContract, addr1, addr2, siret1, productRef1} = await loadFixture(deployContract);

      let transaction = await deployedContract.addCompagny("BlocVeritas", "Paris", siret1, "0",addr1);
      await transaction.wait();
      await expect(
        deployedContract.connect(addr2).addProduct(siret1, productRef1, "base_url")
      ).to.be.revertedWithCustomError(
        deployedContract,
        "AccessControlUnauthorizedAccount"
      );
    });
  });

  
  describe("Test addUserProduct function", async function () {
    it("Should assign product to the user", async function () {
      const { deployedContract, addr1, addr2, siret1, productRef1} = await loadFixture(deployContract);

      let transaction = await deployedContract.addCompagny("BlocVeritas", "Paris", siret1, "0", addr1);
      await transaction.wait();
      transaction = await deployedContract.connect(addr1).addProduct(siret1, productRef1, "base_url");
      await transaction.wait();

      const product = await deployedContract.getProductDetailsByRef(productRef1, siret1);
      const productId = product.productId;

      await expect(deployedContract.connect(addr1).addUserProduct(addr2, siret1, productId))
      .to.emit(deployedContract, "UserProductRegistered")
      .withArgs(addr2, siret1, productId);
    });


    it("Should not assign product to the user if user is not a compagny owner", async function () {
      const { deployedContract, addr1, addr2, siret1, productRef1} = await loadFixture(deployContract);

      let transaction = await deployedContract.addCompagny("BlocVeritas", "Paris", siret1, "0", addr1);
      await transaction.wait();
      transaction = await deployedContract.connect(addr1).addProduct(siret1, productRef1, "base_url");
      await transaction.wait();

      const product = await deployedContract.getProductDetailsByRef(productRef1, siret1);
      const productId = product.productId;

      await expect(
        deployedContract.connect(addr2).addUserProduct(addr2, siret1, productId)
      ).to.be.revertedWithCustomError(
        deployedContract,
        "AccessControlUnauthorizedAccount"
      ); 
    });

    it("Should be revert if compagny don't exist", async function () {
      const { deployedContract, addr1, addr2, siret1, siret2, productRef1} = await loadFixture(deployContract);

      let transaction = await deployedContract.addCompagny("BlocVeritas", "Paris", siret1, "0", addr1);
      await transaction.wait();
      transaction = await deployedContract.connect(addr1).addProduct(siret1, productRef1, "base_url");
      await transaction.wait();

      const product = await deployedContract.getProductDetailsByRef(productRef1, siret1);
      const productId = product.productId;

      await expect(
        deployedContract.connect(addr1).addUserProduct(addr2, siret2, productId)
      ).to.be.revertedWithCustomError(
        deployedContract,
        "Unauthorized"
      ); 
    });

    it("Should be revert if product don't exist", async function () {
      const { deployedContract, addr1, addr2, siret1, siret2, productRef1} = await loadFixture(deployContract);

      let transaction = await deployedContract.addCompagny("BlocVeritas", "Paris", siret1, "0", addr1);
      await transaction.wait();
  
      const productId = "0001";

      await expect(
        deployedContract.connect(addr1).addUserProduct(addr2, siret1, productId)
      ).to.be.revertedWith("This product don't exist");

    });
  });



  describe("Test addFeedback function", async function () {
    it("Should add feedback", async function () {
      const { deployedContract, addr1, addr2, siret1, productRef1} = await loadFixture(deployContract);

      let transaction = await deployedContract.addCompagny("BlocVeritas", "Paris", siret1, "0", addr1);
      await transaction.wait();
      transaction = await deployedContract.connect(addr1).addProduct(siret1, productRef1, "base_url");
      await transaction.wait();
      const product = await deployedContract.getProductDetailsByRef(productRef1, siret1);
      const productId = product.productId;
      transaction = await deployedContract.connect(addr1).addUserProduct(addr2, siret1, productId);
      await transaction.wait();

      const note = 5;
      const comment = "comment test"
      const purchaseDate = "1711753200"; // 30/03/2024
      const likeCount = 0;

      await expect(deployedContract.connect(addr2).addFeedback(addr2, siret1, productId, note, comment, purchaseDate, likeCount))
      .to.emit(deployedContract, "FeedbackRegistered")
      .withArgs(0, productId, note);
    });

    it("Should revert if compagny don't exist", async function () {
      const { deployedContract, addr1, addr2, siret1, siret2, productRef1} = await loadFixture(deployContract);

      let transaction = await deployedContract.addCompagny("BlocVeritas", "Paris", siret1, "0", addr1);
      await transaction.wait();
      transaction = await deployedContract.connect(addr1).addProduct(siret1, productRef1, "base_url");
      await transaction.wait();
      const product = await deployedContract.getProductDetailsByRef(productRef1, siret1);
      const productId = product.productId;
      transaction = await deployedContract.connect(addr1).addUserProduct(addr2, siret1, productId);
      await transaction.wait();

      const note = 5;
      const comment = "comment test"
      const purchaseDate = "1711753200"; // 30/03/2024
      const likeCount = 0;

      await expect(deployedContract.connect(addr2).addFeedback(addr2, siret2, productId, note, comment, purchaseDate, likeCount)).to.be.revertedWithCustomError(
        deployedContract,
        "Unauthorized"
      ); 
    });

    it("Should revert if product don't exist", async function () {
      const { deployedContract, addr1, addr2, siret1, productRef1} = await loadFixture(deployContract);

      let transaction = await deployedContract.addCompagny("BlocVeritas", "Paris", siret1, "0", addr1);
      await transaction.wait();
      transaction = await deployedContract.connect(addr1).addProduct(siret1, productRef1, "base_url");
      await transaction.wait();
      const product = await deployedContract.getProductDetailsByRef(productRef1, siret1);
      const productId = product.productId;
      transaction = await deployedContract.connect(addr1).addUserProduct(addr2, siret1, productId);
      await transaction.wait();

      const note = 5;
      const comment = "comment test"
      const purchaseDate = "1711753200"; // 30/03/2024
      const likeCount = 0;

      await expect(deployedContract.connect(addr2).addFeedback(addr2, siret1, 123, note, comment, purchaseDate, likeCount)).to.be.revertedWith("This product don't exist");
    });
    
  });


  describe("Test getProductDetailsByRef function", async function () {
    it("Should get the product by ref and compagny Id (siret)", async function () {
      const { deployedContract, addr1, siret1, productRef1} = await loadFixture(deployContract);

      let transaction = await deployedContract.addCompagny("BlocVeritas", "Paris", siret1, "0", addr1);
      await transaction.wait();
      transaction = await deployedContract.connect(addr1).addProduct(siret1, productRef1, "base_url");
      await transaction.wait();
      const product = await deployedContract.getProductDetailsByRef(productRef1, siret1);
      const productRef = product.productRef;
      assert(productRef.toString() === productRef1);
    });
  });



  describe("Test getUserIdsProductsToRate function", async function () {
    it("Should get all product of the customer", async function () {
      const { deployedContract, addr1, addr2, siret1, productRef1} = await loadFixture(deployContract);

      let transaction = await deployedContract.addCompagny("BlocVeritas", "Paris", siret1, "0", addr1);
      await transaction.wait();
      transaction = await deployedContract.connect(addr1).addProduct(siret1, productRef1, "base_url");
      await transaction.wait();
      let product = await deployedContract.getProductDetailsByRef(productRef1, siret1);
      const productId = product.productId;
      transaction = await deployedContract.connect(addr1).addUserProduct(addr2, siret1, productId);
      await transaction.wait();
      product = await deployedContract.connect(addr2).getUserIdsProductsToRate();
      const userAddress = product[0].userAddress;
      assert(userAddress == addr2.address);
    });

    it("Should not get all product if user is not customer", async function () {
      const { deployedContract, addr1, addr2, siret1, productRef1} = await loadFixture(deployContract);

      let transaction = await deployedContract.addCompagny("BlocVeritas", "Paris", siret1, "0", addr1);
      await transaction.wait();
      transaction = await deployedContract.connect(addr1).addProduct(siret1, productRef1, "base_url");
      await transaction.wait();
      let product = await deployedContract.getProductDetailsByRef(productRef1, siret1);
      const productId = product.productId;
      transaction = await deployedContract.connect(addr1).addUserProduct(addr2, siret1, productId);
      await transaction.wait();

      await expect(deployedContract.connect(addr1).getUserIdsProductsToRate()).to.be.revertedWith("Your are not a customer");

    });
  });

  
  describe("Test getProductDetailsById function", async function () {
    it("Should get the product by id", async function () {
      const { deployedContract, addr1, siret1, productRef1} = await loadFixture(deployContract);

      let transaction = await deployedContract.addCompagny("BlocVeritas", "Paris", siret1, "0", addr1);
      await transaction.wait();
      transaction = await deployedContract.connect(addr1).addProduct(siret1, productRef1, "base_url");
      await transaction.wait();
      let product = await deployedContract.getProductDetailsByRef(productRef1, siret1);
      const productId = product.productId;
      product = await deployedContract.getProductDetailsById(productId);
      const compagnyId = product.compagnyId;

      assert(compagnyId == siret1);
    });
  });


  describe("Test productExist function", async function () {
    it("Should return true if product exist", async function () {
      const { deployedContract, addr1, siret1, productRef1} = await loadFixture(deployContract);

      let transaction = await deployedContract.addCompagny("BlocVeritas", "Paris", siret1, "0", addr1);
      await transaction.wait();
      transaction = await deployedContract.connect(addr1).addProduct(siret1, productRef1, "base_url");
      await transaction.wait();
      let product = await deployedContract.getProductDetailsByRef(productRef1, siret1);
      const productId = product.productId;
      expect(await deployedContract.productExist(productId)).to.equal(true);
    });

    it("Should revert if user is not the owner", async function () {
      const { deployedContract, addr1, siret1, productRef1} = await loadFixture(deployContract);

      let transaction = await deployedContract.addCompagny("BlocVeritas", "Paris", siret1, "0", addr1);
      await transaction.wait();
      transaction = await deployedContract.connect(addr1).addProduct(siret1, productRef1, "base_url");
      await transaction.wait();
      let product = await deployedContract.getProductDetailsByRef(productRef1, siret1);
      const productId = product.productId;
      await expect(deployedContract.connect(addr1).productExist(productId)).to.be.revertedWithCustomError(deployedContract,"OwnableUnauthorizedAccount");

    });
  });



  describe("Test getAllProducts function", async function () {
    it("Should return all products", async function () {
      const { deployedContract, addr1, siret1, productRef1} = await loadFixture(deployContract);

      let transaction = await deployedContract.addCompagny("BlocVeritas", "Paris", siret1, "0", addr1);
      await transaction.wait();
      transaction = await deployedContract.connect(addr1).addProduct(siret1, productRef1, "base_url");
      await transaction.wait();
      let product = await deployedContract.getAllProducts();
      const productRef = product[0].productRef;
      assert(productRef == productRef1);
    });

    it("Should revert if user is not the owner", async function () {
      const { deployedContract, addr1, siret1, productRef1} = await loadFixture(deployContract);

      let transaction = await deployedContract.addCompagny("BlocVeritas", "Paris", siret1, "0", addr1);
      await transaction.wait();
      transaction = await deployedContract.connect(addr1).addProduct(siret1, productRef1, "base_url");
      await transaction.wait();
      await expect(deployedContract.connect(addr1).getAllProducts()).to.be.revertedWithCustomError(deployedContract,"OwnableUnauthorizedAccount");
    });
  });



});
