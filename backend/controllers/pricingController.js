const LongStayDiscountRule = require('../models/LongStayDiscountRule');
const PricingSetting = require('../models/PricingSetting');

// Pricing controller

// Public endpoint: return active long-stay rules and current weekend surcharge
const getPublicPricing = async (req, res) => {
  try {
    // Get active rules sorted by minDays asc so front-end can show them clearly
    const rules = await LongStayDiscountRule.find({ active: true }).sort({ minDays: 1 });

    // Get latest pricing setting (weekend surcharge)
    const setting = await PricingSetting.findOne({}).sort({ updatedAt: -1 });

    res.status(200).json({ longStayRules: rules, weekendSurchargeRate: setting?.weekendSurchargeRate || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: list all rules (including inactive)
const getAllLongStayRules = async (req, res) => {
  try {
    const rules = await LongStayDiscountRule.find({}).sort({ minDays: 1 });
    res.status(200).json(rules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: create a rule
const createLongStayRule = async (req, res) => {
  try {
    const { minDays, discountRate, active } = req.body;

    if (!minDays || discountRate === undefined) {
      return res.status(400).json({ message: 'minDays and discountRate are required' });
    }

    const rule = await LongStayDiscountRule.create({ minDays, discountRate, active: active !== false });
    res.status(201).json(rule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Admin: update a rule
const updateLongStayRule = async (req, res) => {
  try {
    const rule = await LongStayDiscountRule.findById(req.params.id);
    if (!rule) return res.status(404).json({ message: 'Rule not found' });

    const { minDays, discountRate, active } = req.body;
    if (minDays !== undefined) rule.minDays = minDays;
    if (discountRate !== undefined) rule.discountRate = discountRate;
    if (active !== undefined) rule.active = active;

    const updated = await rule.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Admin: delete a rule
const deleteLongStayRule = async (req, res) => {
  try {
    const rule = await LongStayDiscountRule.findById(req.params.id);
    if (!rule) return res.status(404).json({ message: 'Rule not found' });

    await LongStayDiscountRule.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Rule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: get current weekend surcharge
const getWeekendSurcharge = async (req, res) => {
  try {
    const setting = await PricingSetting.findOne({}).sort({ updatedAt: -1 });
    res.status(200).json({ weekendSurchargeRate: setting?.weekendSurchargeRate || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: update weekend surcharge (create if missing)
const updateWeekendSurcharge = async (req, res) => {
  try {
    const { weekendSurchargeRate, active } = req.body;
    if (weekendSurchargeRate === undefined) return res.status(400).json({ message: 'weekendSurchargeRate is required' });

    // Use upsert-like behaviour: if no doc exists, create one
    let setting = await PricingSetting.findOne({}).sort({ updatedAt: -1 });
    if (!setting) {
      setting = await PricingSetting.create({ weekendSurchargeRate, active: active !== false });
    } else {
      setting.weekendSurchargeRate = weekendSurchargeRate;
      if (active !== undefined) setting.active = active;
      await setting.save();
    }

    res.status(200).json(setting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getPublicPricing,
  getAllLongStayRules,
  createLongStayRule,
  updateLongStayRule,
  deleteLongStayRule,
  getWeekendSurcharge,
  updateWeekendSurcharge,
};

