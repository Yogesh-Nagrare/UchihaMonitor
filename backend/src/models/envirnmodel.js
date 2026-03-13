const mongoose = require('mongoose');

const variableSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const environmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    variables: {
      type: [variableSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: false,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Environment = mongoose.model('Environment', environmentSchema);
module.exports = Environment;