// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

import "./Address2DItems.sol";

import "hardhat/console.sol";

contract CarBarContract is
    Initializable,
    ERC1155Upgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    AccessControlUpgradeable,
    Address2DItems
{
    bytes32 private constant SUPER_OWNER_ROLE = keccak256("SUPER_OWNER_ROLE");
    bytes32 private constant OWNER_ROLE = keccak256("OWNER_ROLE");

    address private _superOwner;
    address private _owner;

    using StringsUpgradeable for uint32;
    using StringsUpgradeable for uint256;

    function initialize(address superOwner_, address usdtTokenAddress) public initializer {
        __ERC1155_init("");
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        _usdtToken = IERC20(usdtTokenAddress);

        _superOwner = superOwner_;
        _grantRole(SUPER_OWNER_ROLE, _superOwner);

        _owner = _msgSender();
        _grantRole(OWNER_ROLE, _owner);
    }

    string public name;
    string public symbol;

    IERC20 private _usdtToken;

    uint8 public constant TOKEN_UNIT = 1;
    uint32 public constant TIME_GAP = 72 hours;

    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _collectionCounter;

    mapping(uint32 => CollectionItem) private _collectionItems;
    mapping(uint32 => mapping(uint32 => TokenItem)) private _tokenItems;

    uint32 private _superOwnerPermissionTimeLimit;

    struct CollectionItem {
        uint32 collectionId;
        string collectionName;
        uint32 tokenCount;
        uint256 price;
        uint32 expiryDate;
    }

    enum Sold {
        None,
        Transfer,
        TokenSold
    }

    struct TokenItem {
        uint32 tokenId;
        address owner;
        uint32 expiryDate;
        Sold sold;
    }

    event CollectionItemCreated(
        uint32 indexed tokenId,
        string name,
        uint32 tokenCount,
        uint256 price,
        uint256 expiryDate
    );

    event TokenSold(
        uint32 indexed collectionId,
        uint32 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        uint32 timestamp
    );

    event TokenUpdated(uint32 indexed collectionId, uint32 indexed tokenId, uint32 timestamp);

    modifier onlySuperOwnerOrOwner() {
        require(
            hasRole(SUPER_OWNER_ROLE, _msgSender()) || hasRole(OWNER_ROLE, _msgSender()),
            "Only superOwner or owner has right to call this function"
        );
        _;
    }

    modifier onlySuperOwnerOrPermittedOwner() {
        require(
            isSuperOwnerOrPermittedOwner(_msgSender()),
            "Only superOwner or owner who has permission can call this function"
        );
        _;
    }

    modifier onlyFilledCollection(uint32 collectionId) {
        (bool success, ) = getValidFreeId(superOwner(), collectionId);
        require(success, "The collection must have at least 1 available token");
        _;
    }

    modifier onlyActualCollection(uint32 collectionId) {
        CollectionItem memory collection = fetchCollection(collectionId);
        require(
            block.timestamp <= collection.expiryDate,
            "Collection expiration must be greater than the current time"
        );
        _;
    }

    function checkActualToken(
        uint32 collectionId,
        uint32 tokenId,
        uint32 timeOffset
    ) private view returns (bool) {
        TokenItem memory token = fetchToken(collectionId, tokenId);
        return token.expiryDate <= timeOffset || block.timestamp <= token.expiryDate - timeOffset;
    }

    modifier onlyActualToken(
        uint32 collectionId,
        uint32 tokenId,
        uint32 timeOffset
    ) {
        TokenItem memory token = fetchToken(collectionId, tokenId);
        require(
            checkActualToken(collectionId, tokenId, timeOffset),
            "Token expiration must be more than a certain period from the current time"
        );
        _;
    }

    modifier onlyTokenOnwer(uint32 collectionId, uint32 tokenId) {
        TokenItem memory token = fetchToken(collectionId, tokenId);
        address sender = _msgSender();
        require(
            token.owner == sender ||
                isApprovedForAll(token.owner, sender) ||
                (sender == owner() && token.owner == superOwner()),
            "You must be owner of this token or approved"
        );
        _;
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlySuperOwnerOrPermittedOwner {}

    function setOwner(address newOwner) public onlySuperOwnerOrPermittedOwner {
        _revokeRole(OWNER_ROLE, owner());
        _owner = newOwner;
        _grantRole(OWNER_ROLE, _owner);
    }

    function superOwner() public view returns (address) {
        return _superOwner;
    }

    function owner() public view returns (address) {
        return _owner;
    }

    function giveSuperOwnerPermissionToOwner(
        uint32 hourLimit
    ) external onlySuperOwnerOrPermittedOwner {
        _superOwnerPermissionTimeLimit = uint32(block.timestamp) + hourLimit * 3600;
    }

    function superOwnerPermissionTimeLimit() external view returns (uint32) {
        return _superOwnerPermissionTimeLimit;
    }

    function isSuperOwnerOrPermittedOwner(address account) internal view returns (bool) {
        return
            hasRole(SUPER_OWNER_ROLE, account) ||
            (hasRole(OWNER_ROLE, account) && block.timestamp < _superOwnerPermissionTimeLimit);
    }

    function hasOwnerSuperOwnerPermission() public view returns (bool) {
        return isSuperOwnerOrPermittedOwner(owner());
    }

    function balanceOf(address account, uint256 id) public view override returns (uint256) {
        uint256 balance = super.balanceOf(account, id);

        if (balance > 0) {
            return getValidAmount(account, uint32(id));
        }

        return balance;
    }

    function setName(string memory newName) public onlySuperOwnerOrPermittedOwner {
        name = newName;
    }

    function setSymbol(string memory newSymbol) public onlySuperOwnerOrPermittedOwner {
        symbol = newSymbol;
    }

    function setURI(string memory newUri) external onlySuperOwnerOrPermittedOwner {
        _setURI(newUri);
    }

    function getUSDTaddress() external view returns (address) {
        return address(_usdtToken);
    }

    function createCollection(
        string memory collectionName,
        uint32 tokenCount,
        uint256 price,
        uint32 expiryDate
    ) external onlySuperOwnerOrPermittedOwner returns (uint32) {
        uint32 collectionId = uint32(_collectionCounter.current());
        _mint(superOwner(), collectionId, tokenCount * TOKEN_UNIT, "");
        createCollectionItem(collectionId, collectionName, tokenCount, price, expiryDate);
        _createTokens(collectionId, tokenCount);
        _collectionCounter.increment();
        return collectionId;
    }

    function updateCollection(
        uint32 collectionId,
        string memory collectionName
    ) external onlySuperOwnerOrOwner returns (CollectionItem memory) {
        CollectionItem storage collection = _collectionItems[collectionId];
        collection.collectionName = collectionName;
        return collection;
    }

    function createCollectionItem(
        uint32 collectionId,
        string memory collectionName,
        uint32 tokenCount,
        uint256 price,
        uint32 expiryDate
    ) private returns (CollectionItem memory) {
        require(price > 0, "Price must be greater than zero");
        _collectionItems[collectionId] = CollectionItem(
            collectionId,
            collectionName,
            tokenCount,
            price,
            expiryDate
        );
        emit CollectionItemCreated(collectionId, collectionName, tokenCount, price, expiryDate);
        return _collectionItems[collectionId];
    }

    function getCollectionCount() public view returns (uint32) {
        return uint32(_collectionCounter.current());
    }

    //ToDo: add owner parameter
    function _createTokens(uint32 collectionId, uint32 tokenCount) private {
        address sender = superOwner();
        for (uint32 i = 0; i < tokenCount; i++) {
            TokenItem memory token = TokenItem(i, sender, 0, Sold.None);
            _tokenItems[collectionId][i] = token;
            pushFreeId(sender, collectionId, i);
        }
    }

    function updateToken(
        uint32 collectionId,
        uint32 tokenId,
        uint32 expiryDate
    ) external onlySuperOwnerOrOwner returns (TokenItem memory) {
        TokenItem storage token = _tokenItems[collectionId][tokenId];
        token.expiryDate = expiryDate;

        if (expiryDate == 0) {
            pushFreeId(token.owner, collectionId, tokenId);
        }

        return token;
    }

    function buyToken(
        uint32 collectionId
    ) external nonReentrant onlyFilledCollection(collectionId) onlyActualCollection(collectionId) {
        CollectionItem memory collection = fetchCollection(collectionId);
        uint256 amount = collection.price;
        address superOwner_ = address(superOwner());
        address sender = _msgSender();

        require(
            _usdtToken.allowance(sender, address(this)) >= amount,
            "User must allow to use of funds"
        );
        require(_usdtToken.balanceOf(sender) >= amount, "User must have funds");

        (bool success, uint32 tokenId) = getValidFreeId(superOwner_, collectionId);

        if (!success) {
            revert("Couldn't find valid free id");
        }

        TokenItem storage token = _tokenItems[collectionId][tokenId];
        _transferToken(token.owner, sender, collectionId, tokenId, Sold.TokenSold);

        _usdtToken.transferFrom(sender, address(this), amount);

        emit TokenSold(collectionId, tokenId, superOwner_, sender, amount, uint32(block.timestamp));
    }

    function _transferToken(
        address from,
        address to,
        uint32 collectionId,
        uint32 tokenId,
        Sold sold
    ) private returns (TokenItem memory) {
        TokenItem storage token = _tokenItems[collectionId][tokenId];
        token.owner = to;
        token.sold = sold;
        _safeTransferFrom(from, to, collectionId, TOKEN_UNIT, "");
        transferFreeId(from, to, collectionId, tokenId);
        return token;
    }

    function _transferToken(
        address from,
        address to,
        uint32 collectionId,
        uint32 tokenId
    ) private returns (TokenItem memory) {
        TokenItem storage token = _tokenItems[collectionId][tokenId];
        token.owner = to;
        _safeTransferFrom(from, to, collectionId, TOKEN_UNIT, "");
        transferFreeId(from, to, collectionId, tokenId);
        return token;
    }

    function transferToken(
        address from,
        address to,
        uint32 collectionId,
        uint32 tokenId
    )
        public
        onlyTokenOnwer(collectionId, tokenId)
        onlyActualCollection(collectionId)
        onlyActualToken(collectionId, tokenId, TIME_GAP)
        returns (TokenItem memory)
    {
        return _transferToken(from, to, collectionId, tokenId, Sold.Transfer);
    }

    // Uncomment this function if you want to give owner permission to list in NFT-marketplaces (OpenSea, NFTrade)
    // function _setApprovalForAll(
    //     address owner_,
    //     address operator,
    //     bool approved
    // ) internal virtual override {
    //     address finalOwner = owner_;
    //     if (isSuperOwnerOrPermittedOwner(_msgSender())) {
    //         finalOwner = superOwner();
    //     }
    //     super._setApprovalForAll(finalOwner, operator, approved);
    // }

    function getValidAmount(address user, uint32 collectionId) private view returns (uint32) {
        uint32[] memory freeIds = fetchFreeIds(user, collectionId);
        uint32 tokenId = 0;
        uint32 amount = 0;

        for (uint32 i = 0; i < freeIds.length; i++) {
            tokenId = freeIds[i];
            if (checkActualToken(collectionId, tokenId, TIME_GAP)) {
                amount++;
            }
        }

        return amount;
    }

    function getValidFreeId(address user, uint32 collectionId) private view returns (bool, uint32) {
        uint32[] memory freeIds = fetchFreeIds(user, collectionId);
        uint32 tokenId;

        for (uint32 i = 0; i < freeIds.length; i++) {
            tokenId = freeIds[i];
            if (checkActualToken(collectionId, tokenId, TIME_GAP)) {
                return (true, tokenId);
            }
        }

        return (false, 0);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory /*data*/
    ) public override {
        uint32 collectionId = uint32(id);

        for (uint32 i = 0; i < amount; i++) {
            (bool success, uint32 tokenId) = getValidFreeId(from, collectionId);

            if (!success) {
                revert("Couldn't find valid free id");
            }

            transferToken(from, to, collectionId, tokenId);
        }
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public override {
        require(ids.length == amounts.length, "Length of ids, amounts should be the correct");

        for (uint32 i = 0; i < ids.length; i++) {
            safeTransferFrom(from, to, ids[i], amounts[i], data);
        }
    }

    function withdraw(
        address to,
        uint256 amount
    ) external onlySuperOwnerOrPermittedOwner nonReentrant {
        require(to != address(0), "Incorrect address");
        require(
            _usdtToken.balanceOf(address(this)) >= amount,
            "Contract must have sufficient funds"
        );

        _usdtToken.transfer(to, amount);
    }

    function fetchCollection(uint32 collectionId) public view returns (CollectionItem memory) {
        CollectionItem memory collection = _collectionItems[collectionId];
        return collection;
    }

    function fetchCollections() external view returns (CollectionItem[] memory) {
        uint32 collectionItemCount = uint32(_collectionCounter.current());
        CollectionItem[] memory collections = new CollectionItem[](collectionItemCount);
        for (uint32 i = 0; i < collectionItemCount; i++) {
            collections[i] = _collectionItems[i];
        }
        return collections;
    }

    function fetchTokens(uint32 collectionId) external view returns (TokenItem[] memory) {
        CollectionItem memory collection = fetchCollection(collectionId);
        uint32 tokenItemCount = collection.tokenCount;
        TokenItem[] memory tokens = new TokenItem[](tokenItemCount);
        for (uint32 i = 0; i < tokenItemCount; i++) {
            tokens[i] = _tokenItems[collectionId][i];
        }
        return tokens;
    }

    function fetchToken(
        uint32 collectionId,
        uint32 tokenId
    ) public view returns (TokenItem memory) {
        return _tokenItems[collectionId][tokenId];
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return string.concat(super.uri(tokenId), tokenId.toString(), ".json");
    }

    function contractURI() public view returns (string memory) {
        return string.concat(super.uri(0), "contract.json");
    }

    // The following functions are overrides required by Solidity.
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155Upgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
