// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CarBarContract is
    Initializable,
    ERC1155Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable
{
    function initialize(address usdtTokenAddress) public initializer {
        __ERC1155_init("");
        __Ownable_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        _usdtToken = IERC20(usdtTokenAddress);
    }

    IERC20 private _usdtToken;

    uint8 public constant TOKEN_UNIT = 1;

    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _collectionCounter;

    mapping(uint32 => CollectionItem) private _collectionItems;
    mapping(uint32 => CountersUpgradeable.Counter) private _collectionCounters;
    mapping(uint32 => mapping(uint32 => TokenItem)) private _tokenItems;

    struct CollectionItem {
        uint32 collectionId;
        string name;
        string url;
        uint32 tokenCount;
        uint256 price;
        uint32 expiryDate;
    }

    struct TokenItem {
        uint32 tokenId;
        address owner;
        uint32 expiryDate;
        bool sold;
    }

    event CollectionItemCreated(
        uint32 indexed tokenId,
        string name,
        string url,
        uint32 tokenCount,
        uint256 price,
        uint256 expiryDate
    );

    event TokenSold(uint32 indexed collectionId, uint32 indexed tokenId, address seller, address owner, uint256 price);

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function getUSDTaddress() external view returns (address) {
        return address(_usdtToken);
    }

    // TODO: Temp function for testing. It should remove in PROD
    function initCollections(uint32 tokenCount) public onlyOwner {
        uint32 expiryDate = 1703980800;
        createCollection(
            "Tesla Model 3 Stnd (1 Day)",
            "https://carbar.io/nft/Tesla_Model_3_Stnd.png",
            tokenCount,
            160000000000000000000,
            expiryDate
        );
        createCollection(
            "Tesla Model 3 Prfm (1 Day)",
            "https://carbar.io/nft/Tesla_Model_3_Prfm.png",
            tokenCount,
            100000000000000000000,
            expiryDate
        );
        createCollection(
            "Tesla Model Y (1 Day)",
            "https://carbar.io/nft/Tesla_Y.png",
            tokenCount,
            160000000000000000000,
            expiryDate
        );
    }

    function createCollection(
        string memory name,
        string memory url,
        uint32 tokenCount,
        uint256 price,
        uint32 expiryDate
    ) public onlyOwner returns (uint32) {
        uint32 collectionId = uint32(_collectionCounter.current());
        _mint(_msgSender(), collectionId, tokenCount * TOKEN_UNIT, "");
        createCollectionItem(collectionId, name, url, tokenCount, price, expiryDate);
        createItemTokens(collectionId, tokenCount);
        _collectionCounter.increment();
        return collectionId;
    }

    function updateCollection(
        uint32 collectionId,
        string memory name,
        string memory url
    ) public onlyOwner returns (CollectionItem memory) {
        CollectionItem memory collection = fetchCollection(collectionId);
        collection.name = name;
        collection.url = url;
        return
            createCollectionItem(
                collection.collectionId,
                collection.name,
                collection.url,
                collection.tokenCount,
                collection.price,
                collection.expiryDate
            );
    }

    function createCollectionItem(
        uint32 collectionId,
        string memory name,
        string memory url,
        uint32 tokenCount,
        uint256 price,
        uint32 expiryDate
    ) private returns (CollectionItem memory) {
        require(price > 0, "Price must be at least 1");
        _collectionItems[collectionId] = CollectionItem(collectionId, name, url, tokenCount, price, expiryDate);
        emit CollectionItemCreated(collectionId, name, url, tokenCount, price, expiryDate);
        return _collectionItems[collectionId];
    }

    function getCollectionCount() public view returns (uint32) {
        return uint32(_collectionCounter.current());
    }

    function createItemTokens(uint32 collectionId, uint32 tokenCount) private {
        address owner = _msgSender();
        uint32 expiryDate = 0;
        bool sold = false;
        for (uint32 i = 0; i < tokenCount; i++) {
            createTokenItem(collectionId, i, owner, expiryDate, sold);
        }
    }

    function createTokenItem(uint32 collectionId, uint32 tokenId, address owner, uint32 expiryDate, bool sold) private {
        _tokenItems[collectionId][tokenId] = TokenItem(tokenId, owner, expiryDate, sold);
    }

    function buyToken(uint32 collectionId, uint256 amount) public nonReentrant {
        CollectionItem memory collection = fetchCollection(collectionId);
        address owner = address(owner());
        address sender = _msgSender();

        require(collection.price == amount, "Price should be correct to NFT collection");
        require(_usdtToken.allowance(sender, address(this)) >= amount, "User must allow the use of funds");
        require(balanceOf(owner, collectionId) >= 1, "The collection must have at least 1 available token");

        _safeTransferFrom(owner, sender, collectionId, TOKEN_UNIT, "");

        CountersUpgradeable.Counter storage counter = _collectionCounters[collectionId];

        uint32 tokenId = uint32(counter.current());

        TokenItem memory token = fetchToken(collectionId, tokenId);
        token.owner = sender;
        token.sold = true;
        createTokenItem(collectionId, token.tokenId, token.owner, token.expiryDate, token.sold);

        counter.increment();

        _usdtToken.transferFrom(sender, address(this), amount);

        emit TokenSold(collectionId, tokenId, owner, sender, amount);
    }

    function withdraw(address to, uint256 amount) public onlyOwner nonReentrant {
        require(_usdtToken.balanceOf(address(this)) >= amount, "Contract must have sufficient funds");

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

    function fetchToken(uint32 collectionId, uint32 tokenId) public view returns (TokenItem memory) {
        return _tokenItems[collectionId][tokenId];
    }
}
