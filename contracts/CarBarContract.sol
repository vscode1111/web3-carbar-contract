// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "./Address2DItems.sol";

import "hardhat/console.sol";

contract CarBarContract is
    Initializable,
    ERC1155Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    Address2DItems
{
    using StringsUpgradeable for uint256;

    function initialize(address usdtTokenAddress) public initializer {
        __ERC1155_init("");
        __Ownable_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        _usdtToken = IERC20(usdtTokenAddress);
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

    //Unused. Delete it in next contract deployment
    string _temp;

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

    modifier onlyFilledCollection(uint32 collectionId) {
        require(
            balanceOf(owner(), collectionId) >= 1,
            "The collection must have at least 1 available token"
        );
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
        return token.expiryDate == 0 || block.timestamp <= token.expiryDate - timeOffset;
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

        require(
            token.owner == _msgSender() || isApprovedForAll(token.owner, _msgSender()),
            "You must be owner of this token or approved"
        );
        _;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function balanceOf(address account, uint256 id) public view override returns (uint256) {
        uint256 balance = super.balanceOf(account, id);

        if (balance > 0) {
            return getValidAmount(account, uint32(id));
        }

        return balance;
    }

    function setName(string memory newName) public onlyOwner {
        name = newName;
    }

    function setSymbol(string memory newSymbol) public onlyOwner {
        symbol = newSymbol;
    }

    function setURI(string memory newUri) external onlyOwner {
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
    ) external onlyOwner returns (uint32) {
        uint32 collectionId = uint32(_collectionCounter.current());
        _mint(_msgSender(), collectionId, tokenCount * TOKEN_UNIT, "");
        createCollectionItem(collectionId, collectionName, tokenCount, price, expiryDate);
        _createTokens(collectionId, tokenCount);
        _collectionCounter.increment();
        return collectionId;
    }

    function updateCollection(
        uint32 collectionId,
        string memory collectionName
    ) external onlyOwner returns (CollectionItem memory) {
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

    function _createTokens(uint32 collectionId, uint32 tokenCount) private {
        address owner = _msgSender();
        for (uint32 i = 0; i < tokenCount; i++) {
            TokenItem memory token = TokenItem(i, owner, 0, Sold.None);
            _tokenItems[collectionId][i] = token;
            pushFreeId(owner, collectionId, i);
        }
    }

    function updateToken(
        uint32 collectionId,
        uint32 tokenId,
        uint32 expiryDate
    ) external onlyOwner returns (TokenItem memory) {
        TokenItem storage token = _tokenItems[collectionId][tokenId];
        token.expiryDate = expiryDate;

        if (expiryDate == 0) {
            pushFreeId(token.owner, collectionId, tokenId);
        } else {
            // removeFreeIdByTokenId(token.owner, collectionId, tokenId);
        }

        return token;
    }

    function callEventTransferSingle(
        address operator,
        address from,
        address to,
        uint256 id,
        uint256 value
    ) external onlyOwner {
        emit TransferSingle(operator, from, to, id, value);
    }

    function buyToken(
        uint32 collectionId
    ) external nonReentrant onlyFilledCollection(collectionId) onlyActualCollection(collectionId) {
        CollectionItem memory collection = fetchCollection(collectionId);
        uint256 amount = collection.price;
        address owner = address(owner());
        address sender = _msgSender();

        require(
            _usdtToken.allowance(sender, address(this)) >= amount,
            "User must allow to use of funds"
        );
        require(_usdtToken.balanceOf(sender) >= amount, "User must have funds");

        uint32 tokenId = getFreeId(owner, collectionId, 0);

        TokenItem storage token = _tokenItems[collectionId][tokenId];
        _transferToken(token.owner, sender, collectionId, tokenId);

        _usdtToken.transferFrom(sender, address(this), amount);

        token.sold = Sold.TokenSold;

        emit TokenSold(collectionId, tokenId, owner, sender, amount, uint32(block.timestamp));
    }

    function _transferToken(
        address from,
        address to,
        uint32 collectionId,
        uint32 tokenId
    ) private returns (TokenItem memory) {
        TokenItem storage token = _tokenItems[collectionId][tokenId];
        token.owner = to;
        token.sold = Sold.Transfer;
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
        return _transferToken(from, to, collectionId, tokenId);
    }

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

    function getValidFreeId(
        address user,
        uint32 collectionId
    ) private view onlyFilledFreeIds(user, collectionId, 0) returns (bool, uint32) {
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

    function withdraw(address to, uint256 amount) external onlyOwner nonReentrant {
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
}
