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

contract CarBarContractNew is
    Initializable,
    ERC1155Upgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    AccessControlUpgradeable,
    Address2DItems
{
    bytes32 public constant SUPER_OWNER_ROLE = keccak256("SUPER_OWNER_ROLE");
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");

    address private _superOwner;
    address private _owner;

    string public name;
    string public symbol;

    IERC20 private _usdtToken;

    CountersUpgradeable.Counter private _collectionCounter;

    function initialize() public initializer {
        __ERC1155_init("");
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
    }

    function _authorizeUpgrade(address newImplementation) internal override {}

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

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155Upgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
