const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Herb = require('../models/Herb');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const fabricService = require('../services/fabricService');
const ethereumService = require('../services/ethereumService');

const router = express.Router();

// =============================================================================
// Helper: build timeline array based on current herb status
// =============================================================================
function buildTimeline(herb) {
  const stages = ['HARVESTED', 'PROCESSED', 'PACKAGED', 'DISTRIBUTED', 'VERIFIED'];
  // Map internal chaincode statuses to frontend stage names
  const statusToStage = {
    'HARVESTED': 'HARVESTED',
    'IN_TRANSIT': 'HARVESTED',     // IN_TRANSIT is between HARVESTED and PROCESSED
    'PROCESSING': 'PROCESSED',
    'PACKAGED': 'PACKAGED',
    'DISTRIBUTED': 'DISTRIBUTED',
    'VERIFIED': 'VERIFIED'
  };

  const currentStage = statusToStage[herb.status] || 'HARVESTED';
  const currentIdx = stages.indexOf(currentStage);

  return stages.map((stage, idx) => {
    let status;
    if (idx < currentIdx) {
      status = 'completed';
    } else if (idx === currentIdx) {
      status = herb.status === 'VERIFIED' ? 'completed' : 'current';
    } else {
      status = 'future';
    }

    // Use actual timestamps from the herb timeline if available
    const existing = herb.timeline?.find(t => t.stage === stage);
    return {
      stage,
      timestamp: existing?.timestamp || new Date().toISOString(),
      status,
      txId: existing?.txId || ''
    };
  });
}

// =============================================================================
// Helper: format herb for frontend response
// =============================================================================
function formatHerbResponse(herb) {
  return {
    id: herb.herbId,
    herbId: herb.herbId,
    name: herb.name,
    species: herb.species,
    status: herb.status === 'IN_TRANSIT' ? 'HARVESTED' :
            herb.status === 'PROCESSING' ? 'PROCESSED' : herb.status,
    harvestDate: herb.harvestDate,
    location: herb.location,
    quantity: herb.quantity,
    unit: herb.unit,
    notes: herb.notes,
    collectorEmail: herb.collectorEmail,
    processorEmail: herb.processorEmail,
    ethereumHash: herb.ethereumHash,
    verificationStatus: herb.verificationStatus,
    timeline: buildTimeline(herb),
    fabricSynced: herb.fabricSynced
  };
}

// =============================================================================
// POST /herbs/harvest — Record a new herb harvest
// Auth: collector
// =============================================================================
router.post('/harvest', authenticate, authorize('collector', 'admin'), async (req, res, next) => {
  try {
    const { name, species, location, quantity, harvestDate } = req.body;

    if (!name || !location || !quantity) {
      return res.status(400).json({ message: 'Missing required fields: name, location, quantity' });
    }

    const herbId = `herb-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();

    // Create herb in MongoDB
    const herb = await Herb.create({
      herbId,
      name,
      species: species || '',
      location,
      quantity,
      unit: req.body.unit || 'kg',
      notes: req.body.notes || '',
      harvestDate: harvestDate || now.split('T')[0],
      status: 'HARVESTED',
      collectorId: req.user.id,
      collectorEmail: req.user.email,
      timeline: [{
        stage: 'HARVESTED',
        timestamp: now,
        status: 'current',
        txId: ''
      }]
    });

    // Attempt Fabric sync
    if (process.env.FABRIC_ENABLED === 'true') {
      try {
        const txId = await fabricService.submitTransaction(
          'RecordHarvest',
          herbId, req.user.id, name, location, quantity, req.body.unit || 'kg', req.body.notes || ''
        );
        herb.fabricSynced = true;
        herb.fabricTxIds.push(txId);
        herb.timeline[0].txId = txId;
        await herb.save();
      } catch (fabricErr) {
        console.error('[Fabric] RecordHarvest failed:', fabricErr.message);
        // Operation still succeeds via MongoDB
      }
    }

    // Attempt Ethereum anchoring
    if (process.env.ETHEREUM_ENABLED === 'true') {
      try {
        const hash = await ethereumService.anchorHash(herbId, herb);
        herb.ethereumHash = hash;
        herb.verificationStatus = 'verified';
        await herb.save();
      } catch (ethErr) {
        console.error('[Ethereum] anchorHash failed:', ethErr.message);
      }
    }

    res.status(201).json({
      herbId: herb.herbId,
      message: 'Herb harvested successfully'
    });
  } catch (err) {
    next(err);
  }
});

// =============================================================================
// POST /herbs/transfer — Transfer herb to processor
// Auth: collector
// =============================================================================
router.post('/transfer', authenticate, authorize('collector', 'admin'), async (req, res, next) => {
  try {
    const { herbId, recipientEmail, notes } = req.body;

    if (!herbId || !recipientEmail) {
      return res.status(400).json({ message: 'herbId and recipientEmail are required' });
    }

    const herb = await Herb.findOne({ herbId });
    if (!herb) {
      return res.status(404).json({ message: 'Herb not found' });
    }

    if (herb.status !== 'HARVESTED') {
      return res.status(400).json({ message: `Herb is in ${herb.status} status, cannot transfer` });
    }

    // Find the processor user
    const processor = await User.findOne({ email: recipientEmail.toLowerCase().trim() });
    if (!processor) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    const now = new Date().toISOString();

    // Update herb
    herb.status = 'IN_TRANSIT';
    herb.processorId = processor._id.toString();
    herb.processorEmail = processor.email;
    herb.notes = notes || herb.notes;

    // Update timeline
    const harvestedEntry = herb.timeline.find(t => t.stage === 'HARVESTED');
    if (harvestedEntry) harvestedEntry.status = 'completed';
    // IN_TRANSIT is between HARVESTED and PROCESSED, so mark as in-progress
    herb.timeline.push({
      stage: 'PROCESSED',
      timestamp: now,
      status: 'current',
      txId: ''
    });

    // Fabric sync
    if (process.env.FABRIC_ENABLED === 'true') {
      try {
        const txId = await fabricService.submitTransaction(
          'TransferToProcessor', herbId, processor._id.toString()
        );
        herb.fabricTxIds.push(txId);
        herb.fabricSynced = true;
      } catch (fabricErr) {
        console.error('[Fabric] TransferToProcessor failed:', fabricErr.message);
      }
    }

    await herb.save();
    res.json({ message: 'Herb transferred successfully' });
  } catch (err) {
    next(err);
  }
});

// =============================================================================
// POST /herbs/process — Record processing of herb
// Auth: processor
// =============================================================================
router.post('/process', authenticate, authorize('processor', 'admin'), async (req, res, next) => {
  try {
    const { herbId, processingMethod, duration, temperature, notes } = req.body;

    if (!herbId) {
      return res.status(400).json({ message: 'herbId is required' });
    }

    const herb = await Herb.findOne({ herbId });
    if (!herb) {
      return res.status(404).json({ message: 'Herb not found' });
    }

    if (herb.status !== 'IN_TRANSIT' && herb.status !== 'HARVESTED') {
      return res.status(400).json({ message: `Herb is in ${herb.status} status, cannot process` });
    }

    const now = new Date().toISOString();
    const batchId = `BATCH-${uuidv4().slice(0, 6).toUpperCase()}`;

    herb.status = 'PROCESSING';
    herb.batchId = batchId;
    herb.processingMethod = processingMethod || '';
    herb.duration = duration || '';
    herb.temperature = temperature || '';
    herb.notes = notes || herb.notes;
    if (!herb.processorId) {
      herb.processorId = req.user.id;
      herb.processorEmail = req.user.email;
    }

    // Update timeline
    herb.timeline.forEach(t => {
      if (t.status === 'current') t.status = 'completed';
    });
    const existing = herb.timeline.find(t => t.stage === 'PROCESSED');
    if (existing) {
      existing.timestamp = now;
      existing.status = 'current';
    } else {
      herb.timeline.push({ stage: 'PROCESSED', timestamp: now, status: 'current', txId: '' });
    }

    // Fabric sync
    if (process.env.FABRIC_ENABLED === 'true') {
      try {
        const txId = await fabricService.submitTransaction('ProcessHerb', herbId, batchId);
        herb.fabricTxIds.push(txId);
        herb.fabricSynced = true;
      } catch (fabricErr) {
        console.error('[Fabric] ProcessHerb failed:', fabricErr.message);
      }
    }

    await herb.save();
    res.json({ message: 'Processing recorded successfully' });
  } catch (err) {
    next(err);
  }
});

// =============================================================================
// POST /herbs/package — Record packaging of herb
// Auth: processor
// =============================================================================
router.post('/package', authenticate, authorize('processor', 'admin'), async (req, res, next) => {
  try {
    const { herbId, packageSize, packageType, quantity, expiryDate } = req.body;

    if (!herbId) {
      return res.status(400).json({ message: 'herbId is required' });
    }

    const herb = await Herb.findOne({ herbId });
    if (!herb) {
      return res.status(404).json({ message: 'Herb not found' });
    }

    if (herb.status !== 'PROCESSING') {
      return res.status(400).json({ message: `Herb is in ${herb.status} status, cannot package` });
    }

    const now = new Date().toISOString();
    const packageId = `PKG-${uuidv4().slice(0, 6).toUpperCase()}`;

    herb.status = 'PACKAGED';
    herb.packageId = packageId;
    herb.packageSize = packageSize || '';
    herb.packageType = packageType || '';
    if (quantity) herb.quantity = quantity;
    herb.expiryDate = expiryDate || '';

    // Update timeline
    herb.timeline.forEach(t => {
      if (t.status === 'current') t.status = 'completed';
    });
    herb.timeline.push({ stage: 'PACKAGED', timestamp: now, status: 'current', txId: '' });

    // Fabric sync
    if (process.env.FABRIC_ENABLED === 'true') {
      try {
        const txId = await fabricService.submitTransaction('PackageHerb', herbId, packageId);
        herb.fabricTxIds.push(txId);
        herb.fabricSynced = true;
      } catch (fabricErr) {
        console.error('[Fabric] PackageHerb failed:', fabricErr.message);
      }
    }

    await herb.save();
    res.json({ message: 'Packaging recorded successfully' });
  } catch (err) {
    next(err);
  }
});

// =============================================================================
// POST /herbs/distribute — Record distribution of herb
// Auth: processor
// =============================================================================
router.post('/distribute', authenticate, authorize('processor', 'admin'), async (req, res, next) => {
  try {
    const { herbId, recipientEmail, distributionDate, notes } = req.body;

    if (!herbId) {
      return res.status(400).json({ message: 'herbId is required' });
    }

    const herb = await Herb.findOne({ herbId });
    if (!herb) {
      return res.status(404).json({ message: 'Herb not found' });
    }

    if (herb.status !== 'PACKAGED') {
      return res.status(400).json({ message: `Herb is in ${herb.status} status, cannot distribute` });
    }

    const now = new Date().toISOString();
    const distId = `DIST-${uuidv4().slice(0, 6).toUpperCase()}`;

    herb.status = 'DISTRIBUTED';
    herb.distId = distId;
    herb.recipientEmail = recipientEmail || '';
    herb.distributionDate = distributionDate || now.split('T')[0];
    herb.notes = notes || herb.notes;

    // Update timeline
    herb.timeline.forEach(t => {
      if (t.status === 'current') t.status = 'completed';
    });
    herb.timeline.push({ stage: 'DISTRIBUTED', timestamp: now, status: 'current', txId: '' });

    // Fabric sync
    if (process.env.FABRIC_ENABLED === 'true') {
      try {
        const txId = await fabricService.submitTransaction('DistributeHerb', herbId, distId);
        herb.fabricTxIds.push(txId);
        herb.fabricSynced = true;
      } catch (fabricErr) {
        console.error('[Fabric] DistributeHerb failed:', fabricErr.message);
      }
    }

    // Ethereum anchoring on distribution (final step before verification)
    if (process.env.ETHEREUM_ENABLED === 'true') {
      try {
        const hash = await ethereumService.anchorHash(herbId, herb);
        herb.ethereumHash = hash;
        herb.verificationStatus = 'verified';
      } catch (ethErr) {
        console.error('[Ethereum] anchorHash failed:', ethErr.message);
      }
    }

    await herb.save();
    res.json({ message: 'Distribution recorded successfully' });
  } catch (err) {
    next(err);
  }
});

// =============================================================================
// GET /herbs/my-herbs — Get herbs belonging to current user
// Auth: any authenticated
// =============================================================================
router.get('/my-herbs', authenticate, async (req, res, next) => {
  try {
    const userEmail = req.user.email;
    const herbs = await Herb.find({
      $or: [
        { collectorEmail: userEmail },
        { processorEmail: userEmail }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      herbs: herbs.map(formatHerbResponse)
    });
  } catch (err) {
    next(err);
  }
});

// =============================================================================
// GET /herbs/in-progress — Get herbs currently in processing pipeline
// Auth: processor
// =============================================================================
router.get('/in-progress', authenticate, authorize('processor', 'admin'), async (req, res, next) => {
  try {
    const herbs = await Herb.find({
      status: { $in: ['IN_TRANSIT', 'PROCESSING', 'HARVESTED'] },
      $or: [
        { processorEmail: req.user.email },
        { processorEmail: '' },  // herbs not yet assigned to a processor
        { processorEmail: { $exists: false } }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      herbs: herbs.map(herb => ({
        id: herb.herbId,
        name: herb.name,
        species: herb.species,
        status: herb.status,
        receivedDate: herb.harvestDate,
        currentStage: herb.status
      }))
    });
  } catch (err) {
    next(err);
  }
});

// =============================================================================
// GET /herbs/all — Get all herbs (admin dashboard)
// Auth: admin
// =============================================================================
router.get('/all', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    // Status filter
    if (status && status !== 'all') {
      // Map frontend status names to internal statuses
      const statusMap = {
        'HARVESTED': ['HARVESTED'],
        'PROCESSED': ['IN_TRANSIT', 'PROCESSING'],
        'PACKAGED': ['PACKAGED'],
        'DISTRIBUTED': ['DISTRIBUTED'],
        'VERIFIED': ['VERIFIED']
      };
      const mapped = statusMap[status] || [status];
      filter.status = { $in: mapped };
    }

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { name: searchRegex },
        { species: searchRegex },
        { herbId: searchRegex }
      ];
    }

    const herbs = await Herb.find(filter).sort({ createdAt: -1 });

    res.json({
      herbs: herbs.map(formatHerbResponse)
    });
  } catch (err) {
    next(err);
  }
});

// =============================================================================
// GET /herbs/verify/:herbId — Public herb verification (no auth required)
// =============================================================================
router.get('/verify/:herbId', async (req, res, next) => {
  try {
    const { herbId } = req.params;
    const herb = await Herb.findOne({ herbId });

    if (!herb) {
      return res.status(404).json({ message: 'Herb not found' });
    }

    // Look up collector and processor names
    let collectorName = '';
    let processorName = '';

    if (herb.collectorId) {
      const collector = await User.findById(herb.collectorId);
      if (collector) collectorName = collector.name;
    }
    if (herb.processorId) {
      const processor = await User.findById(herb.processorId);
      if (processor) processorName = processor.name;
    }

    // If Ethereum is enabled, verify the hash on-chain
    let ethereumVerified = false;
    if (process.env.ETHEREUM_ENABLED === 'true' && herb.ethereumHash) {
      try {
        ethereumVerified = await ethereumService.verifyHash(herbId);
      } catch (ethErr) {
        console.error('[Ethereum] verifyHash failed:', ethErr.message);
      }
    }

    res.json({
      herb: {
        ...formatHerbResponse(herb),
        collectorName,
        processorName,
        ethereumVerified
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
