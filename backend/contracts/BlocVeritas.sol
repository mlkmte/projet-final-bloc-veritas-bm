// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @notice Error for unauthorized user
error Unauthorized(string msg);

/// @title BlocVeritas contract
/// @author Bafode MINTE
/// @notice Post reviews rating in the blockchain
/// @dev This contract was deployed with solidity v0.8.20, use openzeppelin contract for Ownable and AccessControl
contract BlocVeritas is Ownable, AccessControl {
    /// @notice User as compagny owner
    /// @dev Define compagny owner role
    bytes32 public constant COMPAGNY_OWNER_ROLE =
        keccak256("COMPAGNY_OWNER_ROLE");

    /// @title Compagny structure
    /// @notice Structure used to store informations about  Compagny
    /// @dev The subscriptionType attribute allows to know the type of subscription
    /// @dev The isValid attribute allows to know by exemple id compagny exist
    struct Compagny {
        string name;
        string city;
        uint256 siret;
        uint256 subscriptionType;
        uint256 nbReview;
        uint256 average;
        bool isValid;
        address compagnyOwnerAddress;
    }

    /// @title Product structure
    /// @notice Structure used to store informations about Product
    /// @dev purchaseDate will be convert to timestemp
    struct Product {
        uint256 productId;
        uint256 compagnyId;
        string productRef;
        string url;
    }

    /// @title UserProduct structure
    /// @notice Structure used to check if user can put a review by compagny and product
    /// @dev If allowed attribute is true the user is allowed to put a review
    struct UserProduct {
        address userAddress;
        uint256 compagnyId;
        uint256 productId;
        bool allowed;
    }

    /// @title Feedback structure
    /// @notice Structure used to store informations about Feedback
    /// @dev If "allowed" attribute is true the feedback will displaying
    /// @dev createdAt for assign current date
    struct Feedback {
        address userAddress;
        uint256 compagnyId;
        uint256 productId;
        uint256 note;
        string comment;
        uint256 purchaseDate;
        uint256 createdAt;
        uint256 likeCount;
        bool allowed;
    }

    /// @notice Mapping array to store all companies
    mapping(uint256 => Compagny) compagnies;

    /// @notice Mapping array to store all companies owners
    /// @dev "address" is compagny owner address
    /// @dev "uint256" is compagny ID (siret)
    mapping(address => uint256) compagniesOwner;

    /// @notice Mapping array to store all products
    /// @dev "uint256" is product ID
    mapping(uint256 => bool) products;

    /// @notice Mapping array to store all customers
    /// @dev "address" is customer address
    mapping(address => bool) customers;

    /// @notice Variable stores the list of feedbacks
    Feedback[] feedbackArray;
    UserProduct[] usersProductsArray;
    Product[] productsArray;

    /// @notice Get the feedback number of the smart contract
    uint256 public feedBackCount;

    /// @notice All events to emit
    /// @param compagnyOwnerAddr The compagny owner address
    /// @param compagnyId The compagny ID attached to the owner compagny
    event CompagnyOwnerRegistered(
        address compagnyOwnerAddr,
        uint256 compagnyId
    );
    /// @notice Emits when a compagny is registered
    /// @param compagnyId The compagny ID (siret)
    event CompagnyRegistered(uint256 compagnyId, address ownerAddr);
    /// @notice Emits when a user product is registered
    /// @param compagnyId The compagny ID (siret)
    /// @param productId the block.timestamp
    event UserProductRegistered(
        address addr,
        uint256 compagnyId,
        uint256 productId
    );
    /// @notice Emits when a product is registered
    /// @param compagnyId The compagny ID (siret)
    event ProductRegistered(uint256 compagnyId, string productRef);
    /// @notice Emits when a user feedback is registered
    /// @param feedbackId The feedback ID from array
    /// @dev "createdAt" to be convert in the front
    event FeedbackRegistered(
        uint256 feedbackId,
        uint256 productId,
        uint256 note
    );

    /// @notice Creates a new BlocVeritas contract
    /// @dev use Ownable and role DEFAULT_ADMIN_ROLE from Openzeppelin
    constructor() Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @notice Modifier check if compagny exist
    modifier onlyIfCompagnyExist(uint256 _compagnyId) {
        if (compagnies[_compagnyId].isValid == false) {
            revert Unauthorized("This compagny don't exist");
        }
        _;
    }

    /// @notice Modifier check if product exist
    modifier onlyIfProductExist(uint256 _productId) {
        require(products[_productId] == true, "This product don't exist");
        _;
    }

    /// @notice Modifier check if user is a customer
    modifier onlyCustomer() {
        require(customers[msg.sender] == true, "Your are not a customer");
        _;
    }

    /// @notice Modifier to allowed only user of this contract
    // modifier onlyUserOfContract() {
    //     if (msg.sender != owner() && !hasRole(COMPAGNY_OWNER_ROLE, msg.sender) && customers[msg.sender] == false) {
    //         revert Unauthorized("Your are not allowed");
    //     }
    //     _;
    // }

    /// @notice Add compagny
    /// @param _siret As compagny id
    function addCompagny(
        string calldata _name,
        string calldata _city,
        uint256 _siret,
        uint256 _subscriptionType,
        address _ownerAddr
    ) external onlyOwner {
        compagnies[_siret].name = _name;
        compagnies[_siret].city = _city;
        compagnies[_siret].siret = _siret;
        compagnies[_siret].subscriptionType = _subscriptionType;
        compagnies[_siret].compagnyOwnerAddress = _ownerAddr;
        compagnies[_siret].isValid = true;
        compagniesOwner[_ownerAddr] = _siret;
        grantRole(COMPAGNY_OWNER_ROLE, _ownerAddr);
        emit CompagnyRegistered(_siret, _ownerAddr);
    }

    /// @notice Add a compagny product
    /// @dev block.timestamp to get unique id
    function addProduct(
        uint256 _compagnyId,
        string calldata _productRef,
        string calldata _url
    ) external onlyRole(COMPAGNY_OWNER_ROLE) onlyIfCompagnyExist(_compagnyId) {
        bool isExist = compagnyProductExist(_productRef, _compagnyId);
        if (isExist) {
            revert Unauthorized(
                "This product ref already exist for this compagny"
            );
        }

        Product memory product;
        uint256 productId = block.timestamp;

        products[productId] = true;

        product.productId = productId;
        product.compagnyId = _compagnyId;
        product.productRef = _productRef;
        product.url = _url;
        productsArray.push(product);
        emit ProductRegistered(_compagnyId, _productRef);
    }

    /// @notice Add user for rating
    /// @dev onlyRole() modifier from openzeppelin
    function addUserProduct(
        address _addr,
        uint256 _compagnyId,
        uint256 _productId
    )
        external
        onlyRole(COMPAGNY_OWNER_ROLE)
        onlyIfCompagnyExist(_compagnyId)
        onlyIfProductExist(_productId)
    {
        UserProduct memory theUserProduct;
        theUserProduct.userAddress = _addr;
        theUserProduct.compagnyId = _compagnyId;
        theUserProduct.productId = _productId;
        theUserProduct.allowed = true;
        usersProductsArray.push(theUserProduct);
        customers[_addr] = true;
        emit UserProductRegistered(_addr, _compagnyId, _productId);
    }

    /// @notice Add customer feedback
    function addFeedback(
        address _userAddress,
        uint256 _compagnyId,
        uint256 _productId,
        uint256 _note,
        string calldata _comment,
        uint256 _purchaseDate,
        uint256 _likeCount
    ) external onlyIfCompagnyExist(_compagnyId) onlyIfProductExist(_productId) {
        uint256 indexUserProdArr = getIndexInUsersProductsArray(
            _userAddress,
            _compagnyId,
            _productId
        );
        Feedback memory feedback;
        feedback.userAddress = _userAddress;
        feedback.compagnyId = _compagnyId;
        feedback.productId = _productId;
        feedback.note = _note;
        feedback.comment = _comment;
        feedback.purchaseDate = _purchaseDate;
        feedback.createdAt = block.timestamp;
        feedback.likeCount = _likeCount;
        feedback.allowed = true;
        feedbackArray.push(feedback);
        uint256 id = feedbackArray.length - 1;
        usersProductsArray[indexUserProdArr].allowed = false;
        feedBackCount++;
        emit FeedbackRegistered(id, _productId, _note);
    }

    /// @notice Get user product to rate.
    /// @dev return objects with this attributes : userAddress, compagnyId, productId, allowed
    function getUserIdsProductsToRate()
        external
        view
        onlyCustomer
        returns (UserProduct[] memory)
    {
        uint256 longueurTableau = usersProductsArray.length;
        UserProduct[] memory userProducts = new UserProduct[](longueurTableau);
        for (uint256 i = 0; i < longueurTableau; i++) {
            if (
                usersProductsArray[i].allowed == true &&
                usersProductsArray[i].userAddress == msg.sender
            ) {
                userProducts[i] = usersProductsArray[i];
            }
        }
        return userProducts;
    }

    /// @notice Get index of userProductArray
    /// @dev return the index
    function getIndexInUsersProductsArray(
        address _addrs,
        uint256 _compagnyId,
        uint256 _productId
    ) internal view returns (uint256) {
        uint256 longueurTableau = usersProductsArray.length;
        uint256 index;
        for (uint256 i = 0; i < longueurTableau; i++) {
            if (
                usersProductsArray[i].compagnyId == _compagnyId &&
                usersProductsArray[i].userAddress == _addrs &&
                usersProductsArray[i].productId == _productId
            ) {
                index = i;
            }
        }
        return index;
    }

    /// @notice Get product details with product id
    /// @dev return objects with this attributes : productRef, RefcompagnyId, productId, url
    function getProductDetailsById(
        uint256 _productId
    ) external view returns (Product memory) {
        uint256 longueurTableau = productsArray.length;
        Product memory product;
        for (uint256 i = 0; i < longueurTableau; i++) {
            if (productsArray[i].productId == _productId) {
                product = productsArray[i];
            }
        }
        return product;
    }

    /// @notice Get product details by compagny and ref
    /// @dev return objects with this attributes : compagnyId, productId, url
    function getProductDetailsByRef(
        string calldata _productRef,
        uint256 _compagnyId
    ) external view returns (Product memory) {
        uint256 longueurTableau = productsArray.length;
        Product memory product;
        for (uint256 i = 0; i < longueurTableau; i++) {
            if (
                keccak256(abi.encodePacked((productsArray[i].productRef))) ==
                keccak256(abi.encodePacked((_productRef))) &&
                productsArray[i].compagnyId == _compagnyId
            ) {
                product = productsArray[i];
            }
        }
        return product;
    }

    /// @notice if product exist by compagny
    /// @dev return true or false
    function compagnyProductExist(
        string calldata _productRef,
        uint256 _compagnyId
    ) internal view returns (bool) {
        uint256 longueurTableau = productsArray.length;
        bool exist;
        for (uint256 i = 0; i < longueurTableau; i++) {
            if (
                keccak256(abi.encodePacked((productsArray[i].productRef))) ==
                keccak256(abi.encodePacked((_productRef))) &&
                productsArray[i].compagnyId == _compagnyId
            ) {
                exist = true;
            }
        }
        return exist;
    }

    /// @notice Check if product exist from products array
    function productExist(
        uint256 _productId
    ) external view onlyOwner returns (bool) {
        return products[_productId];
    }

    /// @notice Check if user is a compagny owner
    /// @dev return if of compagny
    function isAcompagnyOwner() external view returns (uint256) {
        return compagniesOwner[msg.sender];
    }

    function isAcustomer() external view returns (bool) {
        return customers[msg.sender];
    }

    /// @notice Get all products
    function getAllProducts()
        external
        view
        onlyOwner
        returns (Product[] memory)
    {
        return productsArray;
    }

    /// @notice Get all company products
    function getAllCompagnyProducts(
        uint256 _compagnyId
    ) external view onlyRole(COMPAGNY_OWNER_ROLE) returns (Product[] memory) {
        uint256 longueurTableau = productsArray.length;
        Product[] memory productsArr = new Product[](longueurTableau);
        for (uint256 i = 0; i < longueurTableau; i++) {
            if (productsArray[i].compagnyId == _compagnyId) {
                productsArr[i] = productsArray[i];
            }
        }
        return productsArr;
    }

    /// @notice like feedback
    function likeFeedback(uint256 _feedbackId) external {
        feedbackArray[_feedbackId].likeCount++;
    }

    /// @notice Get all feedback
    function getAllFeedback() external view returns (Feedback[] memory) {
        return feedbackArray;
    }
}
