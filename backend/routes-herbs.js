const express = require('express');
const { submitTx, evaluateTx } = require('./fabric');
const { authMiddleware, requireRole } = require('./middleware');

const router = express.Router();
const ethereumService = require('./ethereumService');

// Helper — transform chaincode Herb object to frontend shape
function transformHerb(raw) {
  let herb;
  try { herb = JSON.parse(raw); } catch { return null; }

  const statusMap = {
    'HARVESTED':   'HARVESTED',
    'IN_TRANSIT':  'IN_TRANSIT',
    'PROCESSING':  'PROCESSING',
    'PACKAGED':    'PACKAGED',
    'DISTRIBUTED': 'DISTRIBUTED'
  };

  const allStages = ['HARVESTED', 'PROCESSED', 'PACKAGED', 'DISTRIBUTED', 'VERIFIED'];
  const currentStatus = statusMap[herb.status] || herb.status;
  const currentIndex = allStages.indexOf(currentStatus);

  const timeline = allStages.map((stage, i) => ({
    stage,
    timestamp: herb.updatedAt || herb.harvestDate || new Date().toISOString(),
    status: i < currentIndex ? 'completed' : i === currentIndex ? 'current' : 'future'
  }));

  return {
    id: herb.herbId,
    name: herb.herbName,
    species: herb.species || (herb.notes && herb.notes.match(/Species:([^ ]+)/) ? herb.notes.match(/Species:([^ ]+)/)[1] : ''),
    harvestDate: (herb.harvestDate && herb.harvestDate !== '') ? herb.harvestDate : ((herb.notes && herb.notes.match(/Date:([\d-]+)/)) ? herb.notes.match(/Date:([\d-]+)/)[1] : ''),
    status: currentStatus,
    location: herb.location || '',
    collectorEmail: herb.collectorId || '',
    processorEmail: herb.processorId || '',
    receivedDate: herb.timestamp || '',
    ethereumHash: herb.txHash || '',
    verificationStatus: currentStatus === 'DISTRIBUTED' ? 'verified' : 'pending',
    notes: herb.notes || '',
    timeline
  };
}

// POST /herbs/harvest
router.post('/harvest', authMiddleware, requireRole('collector'), async (req, res) => {
  try {
    const { name, species, location, quantity, harvestDate } = req.body;
    const herbId = `H${Date.now()}`;
    const collectorId = req.user.fabricId;
    const notes = `Species:${species || 'N/A'} Date:${harvestDate || 'N/A'}`;

    await submitTx('RecordHarvest', herbId, collectorId, name, location, quantity, 'kg', notes);
    try { await ethereumService.anchorHash(herbId, { herbId, name, location, quantity, collectorEmail: collectorId, status: 'HARVESTED' }); } catch(e) { console.warn('[ETH] anchor failed:', e.message); }
    res.status(201).json({ herbId, message: 'Herb harvested successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /herbs/transfer
router.post('/transfer', authMiddleware, requireRole('collector'), async (req, res) => {
  try {
    const { herbId, recipientEmail, notes } = req.body;
    await submitTx('TransferToProcessor', herbId, recipientEmail);
    res.json({ message: 'Herb transferred successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /herbs/my-herbs
router.get('/my-herbs', authMiddleware, async (req, res) => {
  try {
    const raw = await evaluateTx('QueryAllHerbs');
    const all = JSON.parse(raw);
    const herbs = all
      .filter(h => h.collectorId === req.user.fabricId)
      .map(h => transformHerb(JSON.stringify(h)))
      .filter(Boolean);
    res.json({ herbs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /herbs/process
router.post('/process', authMiddleware, requireRole('processor'), async (req, res) => {
  try {
    const { herbId, processingMethod, duration, temperature, notes } = req.body;
    const batchId = `B${Date.now()}`;
    const details = `${processingMethod} ${duration}h ${temperature}C ${notes || ''}`;
    await submitTx('ProcessHerb', herbId, batchId);
    res.json({ message: 'Processing recorded successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /herbs/package
router.post('/package', authMiddleware, requireRole('processor'), async (req, res) => {
  try {
    const { herbId, packageSize, packageType, quantity, expiryDate } = req.body;
    const packageId = `PKG${Date.now()}`;
    const details = `${packageType} ${packageSize} qty:${quantity} exp:${expiryDate}`;
    await submitTx('PackageHerb', herbId, packageId, details);
    res.json({ message: 'Packaging recorded successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /herbs/distribute
router.post('/distribute', authMiddleware, requireRole('processor'), async (req, res) => {
  try {
    const { herbId, recipientEmail, distributionDate, notes } = req.body;
    const distId = `D${Date.now()}`;
    await submitTx('DistributeHerb', herbId, distId);
    try { await ethereumService.anchorHash(herbId, { herbId, status: 'DISTRIBUTED' }); } catch(e) { console.warn('[ETH] anchor failed:', e.message); }
    res.json({ message: 'Distribution recorded successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /herbs/in-progress
router.get('/in-progress', authMiddleware, requireRole('processor'), async (req, res) => {
  try {
    const raw = await evaluateTx('QueryByStatus', 'IN_TRANSIT');
    const herbs = JSON.parse(raw).map(h => transformHerb(JSON.stringify(h))).filter(Boolean);
    res.json({ herbs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /herbs/all
router.get('/all', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const raw = await evaluateTx('QueryAllHerbs');
    let herbs = JSON.parse(raw).map(h => transformHerb(JSON.stringify(h))).filter(Boolean);

    if (req.query.status && req.query.status !== 'all') {
      herbs = herbs.filter(h => h.status === req.query.status);
    }
    if (req.query.search) {
      const s = req.query.search.toLowerCase();
      herbs = herbs.filter(h =>
        h.name.toLowerCase().includes(s) ||
        h.id.toLowerCase().includes(s)
      );
    }

    res.json({ herbs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /herbs/verify/:herbId  (public)
router.get('/verify/:herbId', async (req, res) => {
  try {
    const raw = await evaluateTx('QueryHerb', req.params.herbId);
    const herb = transformHerb(raw);
    if (!herb) return res.status(404).json({ message: 'Herb not found' });
    res.json({ herb });
  } catch (err) {
    res.status(404).json({ message: 'Herb not found' });
  }
});

// GET /herbs/ready-to-package
router.get('/ready-to-package', authMiddleware, requireRole('processor'), async (req, res) => {
  try {
    const raw = await evaluateTx('QueryByStatus', 'PROCESSING');
    const herbs = JSON.parse(raw).map(h => transformHerb(JSON.stringify(h))).filter(Boolean);
    res.json({ herbs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /herbs/ready-to-distribute
router.get('/ready-to-distribute', authMiddleware, requireRole('processor'), async (req, res) => {
  try {
    const raw = await evaluateTx('QueryByStatus', 'PACKAGED');
    const herbs = JSON.parse(raw).map(h => transformHerb(JSON.stringify(h))).filter(Boolean);
    res.json({ herbs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;