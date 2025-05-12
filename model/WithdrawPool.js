const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WithdrawPoolSchema = new Schema({
  user: {
    type: String,
    required: true
  },
  reward: {
    type: Number,
    required: true
  },
  txHash : {
    type: String,
    default : null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  timestamp:{
    type: Date,
    default: Date.now
  }
});
WithdrawPoolSchema.index(
  { user: 1, reward: 1, nonce: 1, txHash: 1 },
  { unique: true }
);

const WithdrawPool = mongoose.model('WithdrawPool', WithdrawPoolSchema);

module.exports = WithdrawPool;