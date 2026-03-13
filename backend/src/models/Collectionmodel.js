const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    isShared: {
      type: Boolean,
      default: false,
    },

    // sparse index = only indexes documents where shareToken is NOT null
    // this allows multiple documents to have shareToken: null
    shareToken: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

const Collection = mongoose.model('Collection', collectionSchema);
module.exports = Collection;