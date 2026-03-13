const History = require('../models/historymodel');

const MAX_HISTORY = 100; // max entries per user

// ── Log a Request (called automatically from frontend after firing) ────────────
const logHistory = async (req, res) => {
  try {
    const { method, url, headers, params, body, response, duration } = req.body;

    if (!method || !url) {
      return res.status(400).json({ success: false, message: 'method and url are required.' });
    }

    const entry = await History.create({
      method,
      url,
      headers: headers || {},
      params: params || {},
      body: body || '',
      response: response || {},
      duration: duration || null,
      owner: req.user._id,
    });

    // Keep only last MAX_HISTORY entries per user — delete oldest beyond limit
    const count = await History.countDocuments({ owner: req.user._id });
    if (count > MAX_HISTORY) {
      const oldest = await History.find({ owner: req.user._id })
        .sort({ createdAt: 1 })
        .limit(count - MAX_HISTORY)
        .select('_id');
      const ids = oldest.map((h) => h._id);
      await History.deleteMany({ _id: { $in: ids } });
    }

    return res.status(201).json({ success: true, entry });
  } catch (err) {
    console.error('❌ logHistory:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get My History ────────────────────────────────────────────────────────────
const getHistory = async (req, res) => {
  try {
    const { limit = 50, page = 1, method, search } = req.query;

    const filter = { owner: req.user._id };
    if (method) filter.method = method.toUpperCase();
    if (search) filter.url = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [history, total] = await Promise.all([
      History.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      History.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      history,
    });
  } catch (err) {
    console.error('❌ getHistory:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get Single History Entry ──────────────────────────────────────────────────
const getHistoryEntry = async (req, res) => {
  try {
    const entry = await History.findOne({ _id: req.params.id, owner: req.user._id });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'History entry not found.' });
    }

    return res.status(200).json({ success: true, entry });
  } catch (err) {
    console.error('❌ getHistoryEntry:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Delete Single Entry ───────────────────────────────────────────────────────
const deleteHistoryEntry = async (req, res) => {
  try {
    const entry = await History.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'History entry not found.' });
    }

    return res.status(200).json({ success: true, message: 'Entry deleted.' });
  } catch (err) {
    console.error('❌ deleteHistoryEntry:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Clear All History ─────────────────────────────────────────────────────────
const clearHistory = async (req, res) => {
  try {
    const result = await History.deleteMany({ owner: req.user._id });
    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} history entries cleared.`,
    });
  } catch (err) {
    console.error('❌ clearHistory:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  logHistory,
  getHistory,
  getHistoryEntry,
  deleteHistoryEntry,
  clearHistory,
};