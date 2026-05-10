/**
 * Ethereum Service — Hash Anchoring via HerbVerification.sol
 *
 * Active only when ETHEREUM_ENABLED=true in .env.
 * Connects to a local Hardhat node (or any EVM-compatible chain).
 *
 * Operations:
 *   - anchorHash(herbId, herbData)  — compute SHA-256 of herb data, store on-chain
 *   - verifyHash(herbId)            — check if hash exists on-chain
 *   - getStoredHash(herbId)         — retrieve the stored hash
 */

const crypto = require('crypto');

let ethers;
try {
  ethers = require('ethers');
} catch (e) {
  console.warn('[Ethereum] ethers not available:', e.message);
}

// HerbVerification.sol ABI (only the functions we need)
const CONTRACT_ABI = [
  'function storeHash(string herbId, bytes32 hash) external',
  'function verifyHash(string herbId) external view returns (bytes32)',
  'function getTimestamp(string herbId) external view returns (uint256)',
  'function exists(string herbId) external view returns (bool)',
  'event HashStored(string herbId, bytes32 hash, uint256 timestamp)'
];

class EthereumService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.isConnected = false;
  }

  /**
   * Connect to the Ethereum node and contract.
   */
  async connect() {
    if (!ethers) {
      console.warn('[Ethereum] ethers.js not available');
      return;
    }

    if (process.env.ETHEREUM_ENABLED !== 'true') {
      return;
    }

    const rpcUrl = process.env.ETHEREUM_RPC_URL || 'http://localhost:8545';
    const contractAddress = process.env.ETHEREUM_CONTRACT_ADDRESS;
    const privateKey = process.env.ETHEREUM_PRIVATE_KEY;

    if (!contractAddress) {
      console.warn('[Ethereum] CONTRACT_ADDRESS not set, skipping connection');
      return;
    }

    try {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.signer = new ethers.Wallet(privateKey, this.provider);
      this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, this.signer);
      this.isConnected = true;
      console.log('✅ Connected to Ethereum at', rpcUrl);
    } catch (err) {
      console.error('[Ethereum] Connection failed:', err.message);
      this.isConnected = false;
    }
  }

  /**
   * Compute SHA-256 hash of herb data and store it on the smart contract.
   * Returns the hex hash string.
   */
  async anchorHash(herbId, herbData) {
    if (!this.isConnected) await this.connect();
    if (!this.contract) return '';

    try {
      // Create a deterministic hash of the herb data
      const dataStr = JSON.stringify({
        herbId: herbData.herbId || herbId,
        name: herbData.name,
        status: herbData.status,
        collectorEmail: herbData.collectorEmail,
        location: herbData.location,
        quantity: herbData.quantity
      });

      const hash = '0x' + crypto.createHash('sha256').update(dataStr).digest('hex');

      // Store on-chain
      const tx = await this.contract.storeHash(herbId, hash);
      await tx.wait();

      console.log(`[Ethereum] Hash anchored for ${herbId}: ${hash}`);
      return hash;
    } catch (err) {
      console.error(`[Ethereum] anchorHash failed for ${herbId}:`, err.message);
      throw err;
    }
  }

  /**
   * Check if a hash exists on-chain for the given herb.
   */
  async verifyHash(herbId) {
    if (!this.isConnected) await this.connect();
    if (!this.contract) return false;

    try {
      const exists = await this.contract.exists(herbId);
      return exists;
    } catch (err) {
      console.error(`[Ethereum] verifyHash failed for ${herbId}:`, err.message);
      return false;
    }
  }

  /**
   * Get the stored hash for a herb.
   */
  async getStoredHash(herbId) {
    if (!this.isConnected) await this.connect();
    if (!this.contract) return null;

    try {
      const hash = await this.contract.verifyHash(herbId);
      const timestamp = await this.contract.getTimestamp(herbId);
      return {
        hash: hash,
        timestamp: Number(timestamp)
      };
    } catch (err) {
      console.error(`[Ethereum] getStoredHash failed for ${herbId}:`, err.message);
      return null;
    }
  }
}

// Export a singleton instance
module.exports = new EthereumService();
