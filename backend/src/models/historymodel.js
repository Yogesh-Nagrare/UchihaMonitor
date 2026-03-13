const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      required: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    headers: {
      type: Object,
      default: {},
    },

    params: {
      type: Object,
      default: {},
    },

    body: {
      type: String, // raw string (JSON stringified)
      default: '',
    },

    response: {
      status: { type: Number, default: null },
      statusText: { type: String, default: '' },
      data: { type: String, default: '' }, // response body as string
      headers: { type: Object, default: {} },
    },

    duration: {
      type: Number, // ms
      default: null,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const History = mongoose.model('History', historySchema);
module.exports = History;