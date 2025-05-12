const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GlobalDownlineIncomeSchema = new Schema({
  sender: {
    type: String,
    required: true, 

  },
  receiver: {
    type: String,
    required: true
  },
  reward: {
    type: Number,
    required: true
  },
  level: {
    type: Number,
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

GlobalDownlineIncomeSchema.index(
  { sender: 1, receiver: 1, reward: 1, level : 1, txHash: 1 },
  { unique: true }
);

const GlobalDownlineIncome = mongoose.model('GlobalDownlineIncome', GlobalDownlineIncomeSchema);

module.exports = GlobalDownlineIncome;
