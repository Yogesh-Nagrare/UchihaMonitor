const Environment = require('../models/envirnmodel');

// ── Create Environment ────────────────────────────────────────────────────────
const createEnvironment = async (req, res) => {
  try {
    const { name, variables } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Environment name is required.' });
    }

    const environment = await Environment.create({
      name: name.trim(),
      variables: variables || [],
      owner: req.user._id,
    });

    return res.status(201).json({ success: true, environment });
  } catch (err) {
    console.error('❌ createEnvironment:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get All My Environments ───────────────────────────────────────────────────
const getEnvironments = async (req, res) => {
  try {
    const environments = await Environment.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, environments });
  } catch (err) {
    console.error('❌ getEnvironments:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get Single Environment ────────────────────────────────────────────────────
const getEnvironment = async (req, res) => {
  try {
    const environment = await Environment.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!environment) {
      return res.status(404).json({ success: false, message: 'Environment not found.' });
    }

    return res.status(200).json({ success: true, environment });
  } catch (err) {
    console.error('❌ getEnvironment:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Update Environment ────────────────────────────────────────────────────────
const updateEnvironment = async (req, res) => {
  try {
    const { name, variables } = req.body;

    const environment = await Environment.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { name: name?.trim(), variables },
      { new: true, runValidators: true }
    );

    if (!environment) {
      return res.status(404).json({ success: false, message: 'Environment not found.' });
    }

    return res.status(200).json({ success: true, environment });
  } catch (err) {
    console.error('❌ updateEnvironment:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Delete Environment ────────────────────────────────────────────────────────
const deleteEnvironment = async (req, res) => {
  try {
    const environment = await Environment.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!environment) {
      return res.status(404).json({ success: false, message: 'Environment not found.' });
    }

    return res.status(200).json({ success: true, message: 'Environment deleted.' });
  } catch (err) {
    console.error('❌ deleteEnvironment:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Set Active Environment ────────────────────────────────────────────────────
// Only one environment can be active at a time per user
const setActiveEnvironment = async (req, res) => {
  try {
    // Deactivate all user's environments first
    await Environment.updateMany({ owner: req.user._id }, { isActive: false });

    // Activate the selected one
    const environment = await Environment.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { isActive: true },
      { new: true }
    );

    if (!environment) {
      return res.status(404).json({ success: false, message: 'Environment not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `"${environment.name}" is now the active environment.`,
      environment,
    });
  } catch (err) {
    console.error('❌ setActiveEnvironment:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get Active Environment ────────────────────────────────────────────────────
const getActiveEnvironment = async (req, res) => {
  try {
    const environment = await Environment.findOne({
      owner: req.user._id,
      isActive: true,
    });

    if (!environment) {
      return res.status(200).json({ success: true, environment: null, message: 'No active environment.' });
    }

    return res.status(200).json({ success: true, environment });
  } catch (err) {
    console.error('❌ getActiveEnvironment:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createEnvironment,
  getEnvironments,
  getEnvironment,
  updateEnvironment,
  deleteEnvironment,
  setActiveEnvironment,
  getActiveEnvironment,
};