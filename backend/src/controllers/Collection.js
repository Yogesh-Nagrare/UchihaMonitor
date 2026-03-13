const Collection = require('../models/Collectionmodel');
const Request = require('../models/request');
const crypto = require('crypto');

// ── Create Collection ─────────────────────────────────────────────────────────
const createCollection = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Collection name is required.' });
    }

    const collection = await Collection.create({
      name: name.trim(),
      description: description?.trim() || '',
      owner: req.user._id,
    });

    return res.status(201).json({ success: true, collection });
  } catch (err) {
    console.error('❌ createCollection:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get All My Collections ────────────────────────────────────────────────────
const getCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, collections });
  } catch (err) {
    console.error('❌ getCollections:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get Single Collection ─────────────────────────────────────────────────────
const getCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }

    // Also return its requests
    const requests = await Request.find({ collectionId: req.params.id }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, collection, requests });
  } catch (err) {
    console.error('❌ getCollection:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Update Collection ─────────────────────────────────────────────────────────
const updateCollection = async (req, res) => {
  try {
    const { name, description } = req.body;

    const collection = await Collection.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { name: name?.trim(), description: description?.trim() },
      { new: true, runValidators: true }
    );

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }

    return res.status(200).json({ success: true, collection });
  } catch (err) {
    console.error('❌ updateCollection:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Delete Collection ─────────────────────────────────────────────────────────
const deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }

    // Delete all requests inside this collection
    const deleted = await Request.deleteMany({ collection: req.params.id });

    return res.status(200).json({
      success: true,
      message: `Collection and ${deleted.deletedCount} request(s) deleted.`,
    });
  } catch (err) {
    console.error('❌ deleteCollection:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Share Collection (generate share token) ───────────────────────────────────
const shareCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }

    if (!collection.shareToken) {
      collection.shareToken = crypto.randomBytes(24).toString('hex');
    }

    collection.isShared = true;
    await collection.save();

    // ← Frontend URL not backend URL
    const frontendUrl = process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : process.env.CLIENT_URL;

    return res.status(200).json({
      success: true,
      message: 'Collection is now shared.',
      shareToken: collection.shareToken,
      shareUrl: `${frontendUrl}/shared/${collection.shareToken}`,
    });
  } catch (err) {
    console.error('❌ shareCollection:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
// ── Unshare Collection ────────────────────────────────────────────────────────
const unshareCollection = async (req, res) => {
  try {
    const collection = await Collection.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { isShared: false, shareToken: null },
      { new: true }
    );

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }

    return res.status(200).json({ success: true, message: 'Collection is now private.' });
  } catch (err) {
    console.error('❌ unshareCollection:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── View Shared Collection (public, no auth) ──────────────────────────────────
const getSharedCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({
      shareToken: req.params.token,
      isShared: true,
    }).populate('owner', 'firstName emailId');

    if (!collection) {
      return res.status(404).json({ 
        success: false, 
        message: 'Shared collection not found or no longer shared.' 
      });
    }

   const requests = await Request.find({ collectionId: collection._id }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, collection, requests });
  } catch (err) {
    console.error('❌ getSharedCollection:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
const importCollection = async (req, res) => {
  try {
    const data = req.body

    // Support both minipostman format and Postman v2.1 format
    let name, description, requests

    if (data.info?.source === 'Uchiha Monitor') {
      // Our own export format
      name = data.collection.name
      description = data.collection.description || ''
      requests = data.requests

    } else if (data.info?._postman_id || data.info?.schema?.includes('postman')) {
      // Postman v2.1 format
      name = data.info.name
      description = data.info.description || ''

      const flattenItems = (items = []) => {
        const result = []
        for (const item of items) {
          if (item.request) {
            // It's a request
            const req = item.request
            const urlObj = typeof req.url === 'string'
              ? { raw: req.url }
              : req.url || {}

            result.push({
              name: item.name,
              method: req.method || 'GET',
              url: urlObj.raw || '',
              headers: (req.header || []).map((h) => ({
                key: h.key,
                value: h.value,
                enabled: !h.disabled,
              })),
              params: (urlObj.query || []).map((q) => ({
                key: q.key,
                value: q.value,
                enabled: !q.disabled,
              })),
              body: req.body
                ? {
                    type: req.body.mode === 'raw' ? 'raw' : req.body.mode || 'none',
                    content: req.body.raw || '',
                  }
                : { type: 'none', content: '' },
              description: item.request.description || '',
            })
          } else if (item.item) {
            // It's a folder — flatten recursively
            result.push(...flattenItems(item.item))
          }
        }
        return result
      }

      requests = flattenItems(data.item)
    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported format. Export from Postman as Collection v2.1 JSON.',
      })
    }

    // Create collection
    const collection = await Collection.create({
      name: name || 'Imported Collection',
      description,
      owner: req.user._id,
    })

    // Create all requests
    const created = await Promise.all(
      requests.map((r) =>
        Request.create({
          name: r.name || 'Untitled',
          method: r.method || 'GET',
          url: r.url || '',
          headers: r.headers || [],
          params: r.params || [],
          body: r.body || { type: 'none', content: '' },
          description: r.description || '',
          collectionId: collection._id,
          owner: req.user._id,
        })
      )
    )

    return res.status(201).json({
      success: true,
      message: `Imported ${created.length} requests into "${collection.name}"`,
      collection,
      requests: created,
    })
  } catch (err) {
    console.error('❌ importCollection:', err)
    return res.status(500).json({ success: false, message: err.message })
  }
}

const exportCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.id,
      owner: req.user._id,
    })
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found.' })
    }

    const requests = await Request.find({
      collectionId: collection._id,
      owner: req.user._id,
    }).sort({ createdAt: 1 })

    const exported = {
      info: {
        name: collection.name,
        description: collection.description || '',
        exportedAt: new Date().toISOString(),
        version: '1.0',
        source: 'Uchiha Monitor',
      },
      collection: {
        _id: collection._id,
        name: collection.name,
        description: collection.description,
      },
      requests: requests.map((r) => ({
        name: r.name,
        method: r.method,
        url: r.url,
        headers: r.headers,
        params: r.params,
        body: r.body,
        description: r.description || '',
      })),
    }

    res.setHeader('Content-Type', 'application/json')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${collection.name.replace(/\s+/g, '_')}_collection.json"`
    )
    return res.status(200).json(exported)
  } catch (err) {
    console.error('❌ exportCollection:', err)
    return res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = {
  createCollection,
  getCollections,
  getCollection,
  updateCollection,
  deleteCollection,
  shareCollection,
  unshareCollection,
  getSharedCollection,
  importCollection,
  exportCollection,
};