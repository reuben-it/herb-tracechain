/**
 * Fabric Service — Hyperledger Fabric Gateway Integration
 *
 * Active only when FABRIC_ENABLED=true in .env.
 * Connects to the Fabric test-network peers and invokes chaincode functions.
 *
 * When running locally on Windows without Docker/Fabric, all methods
 * are no-ops and return null. The herb routes handle this gracefully
 * by writing to MongoDB regardless of Fabric availability.
 */

let Gateway, Wallets;
try {
  const fabricNetwork = require('fabric-network');
  Gateway = fabricNetwork.Gateway;
  Wallets = fabricNetwork.Wallets;
} catch (e) {
  // fabric-network may not be installed in all environments
  console.warn('[Fabric] fabric-network not available:', e.message);
}

const path = require('path');
const fs = require('fs');

class FabricService {
  constructor() {
    this.gateway = null;
    this.network = null;
    this.contract = null;
    this.isConnected = false;
  }

  /**
   * Connect to the Fabric gateway.
   * Call this once at startup or on first transaction.
   */
  async connect() {
    if (!Gateway || !Wallets) {
      console.warn('[Fabric] SDK not available, skipping connection');
      return;
    }

    if (process.env.FABRIC_ENABLED !== 'true') {
      return;
    }

    try {
      const ccpPath = path.resolve(process.env.FABRIC_CONNECTION_PROFILE);
      if (!fs.existsSync(ccpPath)) {
        console.error('[Fabric] Connection profile not found:', ccpPath);
        return;
      }

      const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
      const walletPath = path.resolve(process.env.FABRIC_WALLET_PATH || './wallet');
      const wallet = await Wallets.newFileSystemWallet(walletPath);

      // Check for admin identity in wallet
      const identity = await wallet.get('admin');
      if (!identity) {
        console.error('[Fabric] Admin identity not found in wallet at', walletPath);
        console.error('[Fabric] Run the enrollAdmin script first');
        return;
      }

      this.gateway = new Gateway();
      await this.gateway.connect(ccp, {
        wallet,
        identity: 'admin',
        discovery: { enabled: true, asLocalhost: true }
      });

      const channelName = process.env.FABRIC_CHANNEL || 'mychannel';
      const chaincodeName = process.env.FABRIC_CHAINCODE || 'herbcc';

      this.network = await this.gateway.getNetwork(channelName);
      this.contract = this.network.getContract(chaincodeName);
      this.isConnected = true;

      console.log('✅ Connected to Fabric network');
    } catch (err) {
      console.error('[Fabric] Connection failed:', err.message);
      this.isConnected = false;
    }
  }

  /**
   * Submit a transaction (write) to the chaincode.
   * Returns the transaction ID on success, null on failure.
   */
  async submitTransaction(functionName, ...args) {
    if (!this.isConnected) {
      await this.connect();
    }

    if (!this.contract) {
      console.warn(`[Fabric] Not connected, skipping ${functionName}`);
      return null;
    }

    try {
      console.log(`[Fabric] Submitting: ${functionName}(${args.join(', ')})`);
      const result = await this.contract.submitTransaction(functionName, ...args);
      const txId = this.contract.createTransaction(functionName).getTransactionId?.() || '';
      console.log(`[Fabric] ${functionName} success`);
      return txId;
    } catch (err) {
      console.error(`[Fabric] ${functionName} failed:`, err.message);
      throw err;
    }
  }

  /**
   * Evaluate a transaction (read-only query) against the chaincode.
   * Returns the parsed result or null.
   */
  async evaluateTransaction(functionName, ...args) {
    if (!this.isConnected) {
      await this.connect();
    }

    if (!this.contract) {
      console.warn(`[Fabric] Not connected, skipping ${functionName}`);
      return null;
    }

    try {
      console.log(`[Fabric] Querying: ${functionName}(${args.join(', ')})`);
      const result = await this.contract.evaluateTransaction(functionName, ...args);
      const parsed = JSON.parse(result.toString());
      return parsed;
    } catch (err) {
      console.error(`[Fabric] ${functionName} query failed:`, err.message);
      throw err;
    }
  }

  /**
   * Disconnect from the gateway.
   */
  disconnect() {
    if (this.gateway) {
      this.gateway.disconnect();
      this.isConnected = false;
      console.log('[Fabric] Disconnected');
    }
  }
}

// Export a singleton instance
module.exports = new FabricService();
