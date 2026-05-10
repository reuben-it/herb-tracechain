const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function getContract() {
  const certPath = process.env.ADMIN_CERT;
  const keyDir = process.env.ADMIN_KEY_DIR;
  const keyFiles = fs.readdirSync(keyDir);
  const keyPath = path.join(keyDir, keyFiles[0]);

  const cert = fs.readFileSync(certPath).toString();
  const key = fs.readFileSync(keyPath).toString();

  const wallet = await Wallets.newInMemoryWallet();
  await wallet.put('admin', {
    credentials: { certificate: cert, privateKey: key },
    mspId: 'Org1MSP',
    type: 'X.509'
  });

  const tlsCert = fs.readFileSync(process.env.PEER_TLS_CERT).toString();

  const org2TlsCert = fs.readFileSync('/workspaces/herb-tracechain/fabric-samples/test-network/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt').toString();

  const connectionProfile = {
    name: 'herb-tracechain',
    version: '1.0.0',
    client: { organization: 'Org1', connection: { timeout: { peer: { endorser: '300' } } } },
    organizations: {
      Org1: { mspid: 'Org1MSP', peers: ['peer0.org1.example.com'] },
      Org2: { mspid: 'Org2MSP', peers: ['peer0.org2.example.com'] }
    },
    peers: {
      'peer0.org1.example.com': {
        url: 'grpcs://localhost:7051',
        tlsCACerts: { pem: tlsCert },
        grpcOptions: { 'ssl-target-name-override': 'peer0.org1.example.com' }
      },
      'peer0.org2.example.com': {
        url: 'grpcs://localhost:9051',
        tlsCACerts: { pem: org2TlsCert },
        grpcOptions: { 'ssl-target-name-override': 'peer0.org2.example.com' }
      }
    },
    channels: {
      mychannel: {
        orderers: ['orderer.example.com'],
        peers: {
          'peer0.org1.example.com': {
            endorsingPeer: true,
            chaincodeQuery: true,
            ledgerQuery: true,
            eventSource: true
          },
          'peer0.org2.example.com': {
            endorsingPeer: true,
            chaincodeQuery: false,
            ledgerQuery: false,
            eventSource: false
          }
        }
      }
    },
    orderers: {
      'orderer.example.com': {
        url: 'grpcs://localhost:7050',
        tlsCACerts: { path: '/workspaces/herb-tracechain/fabric-samples/test-network/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem' },
        grpcOptions: { 'ssl-target-name-override': 'orderer.example.com' }
      }
    }
  };

  const gateway = new Gateway();
  await gateway.connect(connectionProfile, {
    wallet,
    identity: 'admin',
    discovery: { enabled: false, asLocalhost: true }
  });

  const network = await gateway.getNetwork(process.env.FABRIC_CHANNEL);
  const contract = network.getContract(process.env.FABRIC_CHAINCODE);

  return { contract, gateway };
}

async function submitTx(fcn, ...args) {
  const { contract, gateway } = await getContract();
  try {
    const result = await contract.submitTransaction(fcn, ...args).catch(err => {
  console.error('FULL ERROR:', JSON.stringify(err, null, 2));
  console.error('ERROR MESSAGE:', err.message);
  if (err.responses) err.responses.forEach(r => console.error('PEER RESPONSE:', JSON.stringify(r)));
  throw err;
});
    return result.toString();
  } finally {
    gateway.disconnect();
  }
}

async function evaluateTx(fcn, ...args) {
  const { contract, gateway } = await getContract();
  try {
    const result = await contract.evaluateTransaction(fcn, ...args);
    return result.toString();
  } finally {
    gateway.disconnect();
  }
}

module.exports = { submitTx, evaluateTx };