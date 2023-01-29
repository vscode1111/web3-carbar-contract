// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "hardhat/console.sol";

contract AddressItems {
    mapping(address => mapping(uint32 => AddressItem)) private _addressItems;

    uint32 constant MAP_OFFSET = 1000;

    struct AddressItem {
        uint32[] freeIds;
        mapping(uint32 => uint32) map;
    }

    modifier onlyFilledFreeIds(
        address user,
        uint32 collectionId,
        uint32 index
    ) {
        require(filledCheck(user, collectionId, index), "There is no free tokenId");
        _;
    }

    function filledCheck(
        address user,
        uint32 collectionId,
        uint32 index
    ) private view returns (bool) {
        return _addressItems[user][collectionId].freeIds.length > index;
    }

    function fetchFreeIds(address user, uint32 collectionId) public view returns (uint32[] memory) {
        return _addressItems[user][collectionId].freeIds;
    }

    function removeItem(AddressItem storage addressItem, uint32 index) internal {
        if (index >= addressItem.freeIds.length) return;

        for (uint i = index; i < addressItem.freeIds.length - 1; i++) {
            addressItem.freeIds[i] = addressItem.freeIds[i + 1];

            uint32 tokenId = addressItem.freeIds[i];
            addressItem.map[tokenId] = uint32(i + MAP_OFFSET);
        }
        addressItem.freeIds.pop();
    }

    function getFreeId(
        address user,
        uint32 collectionId,
        uint32 index
    ) internal view onlyFilledFreeIds(user, collectionId, index) returns (uint32) {
        return _addressItems[user][collectionId].freeIds[index];
    }

    function removeFreeId(address user, uint32 collectionId, uint32 index) internal {
        if (!filledCheck(user, collectionId, index)) return;
        AddressItem storage addressItem = _addressItems[user][collectionId];
        uint32 tokenId = addressItem.freeIds[index];
        delete _addressItems[user][collectionId].map[tokenId];
        removeItem(addressItem, index);
    }

    function findRawIndex(
        address user,
        uint32 collectionId,
        uint32 tokenId
    ) private view returns (uint32) {
        return _addressItems[user][collectionId].map[tokenId];
    }

    function findCorrectIndex(
        address user,
        uint32 collectionId,
        uint32 tokenId
    ) private view returns (uint32) {
        return _addressItems[user][collectionId].map[tokenId] - MAP_OFFSET;
    }

    function removeFreeIdByTokenId(address user, uint32 collectionId, uint32 tokenId) internal {
        if (!filledCheck(user, collectionId, 0)) return;
        AddressItem storage addressItem = _addressItems[user][collectionId];
        uint32 index = findCorrectIndex(user, collectionId, tokenId);
        delete _addressItems[user][collectionId].map[tokenId];
        removeItem(addressItem, index);
    }

    function pushFreeId(address user, uint32 collectionId, uint32 tokenId) internal {
        if (findRawIndex(user, collectionId, tokenId) != 0) return;
        AddressItem storage addressItem = _addressItems[user][collectionId];
        uint32 index = uint32(addressItem.freeIds.length + MAP_OFFSET);
        addressItem.map[tokenId] = index;
        addressItem.freeIds.push(tokenId);
    }

    function transferFreeId(
        address from,
        address to,
        uint32 collectionId,
        uint32 tokenId
    ) internal {
        removeFreeIdByTokenId(from, collectionId, tokenId);
        pushFreeId(to, collectionId, tokenId);
    }
}
