const mongoose = require('mongoose');

const kvSchema = new mongoose.Schema(
  {
    key: { type: String, default: '' },
    value: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const requestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: 'Untitled Request',
    },

    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      default: 'GET',
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    headers: {
      type: [kvSchema],
      default: [],
    },

    params: {
      type: [kvSchema],
      default: [],
    },

    body: {
      type: {
        type: String,
        enum: ['none', 'json', 'form-data', 'x-www-form-urlencoded', 'raw'],
        default: 'none',
      },
      content: {
        type: String,
        default: '',
      },
    },

    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Request = mongoose.model('Request', requestSchema);
module.exports = Request;