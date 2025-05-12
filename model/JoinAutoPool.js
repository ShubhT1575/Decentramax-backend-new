const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JoinAutoPoolSchema = new Schema({
    user: {
    type: String,
    required: true, 

  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  txHash: { type: String, required: true, },
  block: { type: Number, required: true },
  timestamp: { type: Number, required: true },
});

JoinAutoPoolSchema.index(
  { user: 1, txHash: 1 },
  { unique: true }
);

const JoinAutoPool = mongoose.model('JoinAutoPool', JoinAutoPoolSchema);

module.exports = JoinAutoPool;
