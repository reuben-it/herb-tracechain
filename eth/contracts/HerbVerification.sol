// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title HerbVerification
 * @dev Stores SHA-256 hashes of herb supply chain data for public verification.
 *      Part of the Herb-Tracechain hybrid blockchain system.
 *      Fabric stores the full data; this contract anchors a tamper-proof hash.
 */
contract HerbVerification {
    address public owner;

    struct HashRecord {
        bytes32 dataHash;
        uint256 timestamp;
        bool exists;
    }

    // herbId => HashRecord
    mapping(string => HashRecord) private records;

    // Count of total records
    uint256 public recordCount;

    event HashStored(string indexed herbId, bytes32 hash, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Store a SHA-256 hash for a given herb ID. Owner only.
     * @param herbId The unique herb identifier
     * @param hash The SHA-256 hash of the herb's supply chain data
     */
    function storeHash(string calldata herbId, bytes32 hash) external onlyOwner {
        records[herbId] = HashRecord({
            dataHash: hash,
            timestamp: block.timestamp,
            exists: true
        });
        recordCount++;
        emit HashStored(herbId, hash, block.timestamp);
    }

    /**
     * @dev Retrieve the stored hash for a herb. Public.
     * @param herbId The unique herb identifier
     * @return The stored SHA-256 hash
     */
    function verifyHash(string calldata herbId) external view returns (bytes32) {
        require(records[herbId].exists, "No record found for this herb ID");
        return records[herbId].dataHash;
    }

    /**
     * @dev Get the timestamp when the hash was stored.
     * @param herbId The unique herb identifier
     * @return Unix timestamp
     */
    function getTimestamp(string calldata herbId) external view returns (uint256) {
        require(records[herbId].exists, "No record found for this herb ID");
        return records[herbId].timestamp;
    }

    /**
     * @dev Check whether a record exists for a given herb ID.
     * @param herbId The unique herb identifier
     * @return True if record exists
     */
    function exists(string calldata herbId) external view returns (bool) {
        return records[herbId].exists;
    }
}
