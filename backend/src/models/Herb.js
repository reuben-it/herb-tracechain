const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema({
  stage: {
    type: String,
    enum: ['HARVESTED', 'PROCESSED', 'PACKAGED', 'DISTRIBUTED', 'VERIFIED'],
    required: true
  },
  timestamp: {
    type: String,  // ISO 8601
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'current', 'future'],
    required: true
  },
  txId: {
    type: String,
    default: ''
  }
}, { _id: false });

const herbSchema = new mongoose.Schema({
  herbId: {
    type: String,
    unique: true,
    required: [true, 'Herb ID is required'],
    index: true
  },

  // Basic info
  name: {
    type: String,
    required: [true, 'Herb name is required'],
    trim: true
  },
  species: {
    type: String,
    default: '',
    trim: true
  },
  location: {
    type: String,
    default: '',
    trim: true
  },
  quantity: {
    type: String,
    default: ''
  },
  unit: {
    type: String,
    default: 'kg'
  },
  notes: {
    type: String,
    default: ''
  },
  harvestDate: {
    type: String,
    default: ''
  },

  // Status
  status: {
    type: String,
    enum: ['HARVESTED', 'IN_TRANSIT', 'PROCESSING', 'PACKAGED', 'DISTRIBUTED', 'VERIFIED'],
    default: 'HARVESTED'
  },

  // Actor references
  collectorId: { type: String, default: '' },
  collectorEmail: { type: String, default: '' },
  processorId: { type: String, default: '' },
  processorEmail: { type: String, default: '' },

  // Processing / packaging / distribution details
  batchId: { type: String, default: '' },
  packageId: { type: String, default: '' },
  distId: { type: String, default: '' },
  processingMethod: { type: String, default: '' },
  duration: { type: String, default: '' },
  temperature: { type: String, default: '' },
  packageSize: { type: String, default: '' },
  packageType: { type: String, default: '' },
  expiryDate: { type: String, default: '' },
  distributionDate: { type: String, default: '' },
  recipientEmail: { type: String, default: '' },

  // Blockchain references
  fabricTxIds: { type: [String], default: [] },
  ethereumHash: { type: String, default: '' },
  fabricSynced: { type: Boolean, default: false },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'failed'],
    default: 'pending'
  },

  // Timeline for frontend display
  timeline: {
    type: [timelineEventSchema],
    default: []
  }
}, {
  timestamps: true  // adds createdAt, updatedAt automatically
});

// Text search index for admin search
herbSchema.index({ name: 'text', species: 'text', herbId: 'text' });

module.exports = mongoose.model('Herb', herbSchema);
