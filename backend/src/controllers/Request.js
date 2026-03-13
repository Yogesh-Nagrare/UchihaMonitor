const Request = require('../models/request');
const Collection = require('../models/Collectionmodel');

const verifyCollection = async (collectionId, userId) => {
  return await Collection.findOne({ _id: collectionId, owner: userId });
};

// ── Create Request ────────────────────────────────────────────────────────────
const createRequest = async (req, res) => {
  try {
    const { name, method, url, headers, params, body, collectionId } = req.body;

    if (!url || !url.trim()) {
      return res.status(400).json({ success: false, message: 'URL is required.' });
    }
    if (!collectionId) {
      return res.status(400).json({ success: false, message: 'collectionId is required.' });
    }

    const collection = await verifyCollection(collectionId, req.user._id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }

    const request = await Request.create({
      name: name?.trim() || 'Untitled Request',
      method: method || 'GET',
      url: url.trim(),
      headers: headers || [],
      params: params || [],
      body: body || { type: 'none', content: '' },
      collectionId,   // ← matches your model field name exactly
      owner: req.user._id,
    });

    return res.status(201).json({ success: true, request });
  } catch (err) {
    console.error('❌ createRequest:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get All Requests in a Collection ─────────────────────────────────────────
const getRequests = async (req, res) => {
  try {
    const { collectionId } = req.params;

    const collection = await verifyCollection(collectionId, req.user._id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }

    const requests = await Request.find({
      collectionId,        // ← matches your model
      owner: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, requests });
  } catch (err) {
    console.error('❌ getRequests:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get Single Request ────────────────────────────────────────────────────────
const getRequest = async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    return res.status(200).json({ success: true, request });
  } catch (err) {
    console.error('❌ getRequest:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Update Request ────────────────────────────────────────────────────────────
const updateRequest = async (req, res) => {
  try {
    const { name, method, url, headers, params, body } = req.body;

    const request = await Request.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { name, method, url, headers, params, body },
      { new: true, runValidators: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    return res.status(200).json({ success: true, request });
  } catch (err) {
    console.error('❌ updateRequest:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Delete Request ────────────────────────────────────────────────────────────
const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    return res.status(200).json({ success: true, message: 'Request deleted.' });
  } catch (err) {
    console.error('❌ deleteRequest:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequest,
  updateRequest,
  deleteRequest,
};