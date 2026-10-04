const User = require('../models/User');
const Recommendation = require('../models/Recommendation');
const mlService = require('../services/mlService');
const authController = require('./authController');

exports.issueToken = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = authController.issueJWT(user);
    return res.json({
      success: true,
      token,
      tokenType: 'Bearer',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.recommend = async (req, res) => {
  try {
    const raw = req.body || {};
    const normalized = {
      commodity_name: (raw.commodity_name || raw.commodity_type || 'API Analyzed Commodity').trim(),
      commodity_type: raw.commodity_type || 'Dry & Dehydrated Goods',
      moisture_content: parseFloat(raw.moisture_content != null ? raw.moisture_content : 12.0),
      fat_content: parseFloat(raw.fat_content != null ? raw.fat_content : 2.0),
      ph: parseFloat(raw.ph != null ? raw.ph : 6.5),
      respiration_rate: raw.respiration_rate || 'None',
      shelf_life_days: parseInt(raw.shelf_life_days != null ? raw.shelf_life_days : 60, 10),
      storage_temp: parseFloat(raw.storage_temp != null ? raw.storage_temp : 20.0),
      humidity: parseFloat(raw.humidity != null ? raw.humidity : 50.0),
      storage_type: raw.storage_type || 'Ambient',
      transport_conditions: raw.transport_conditions || 'Standard Ambient',
      packaging_type: raw.packaging_type || 'Stand-Up Pouch (Doypack)',
      packaging_size: raw.packaging_size || 'Retail Standard (250g - 500g)',
      map_required: raw.map_required || 'Yes',
    };

    const mlResult = await mlService.getRecommendation(normalized);

    let savedRecord = null;
    if (req.user) {
      savedRecord = await Recommendation.create({
        user: req.user._id,
        commodityName: normalized.commodity_name,
        commodityType: normalized.commodity_type,
        inputs: {
          moistureContent: normalized.moisture_content,
          fatContent: normalized.fat_content,
          ph: normalized.ph,
          respirationRate: normalized.respiration_rate,
          desiredShelfLifeDays: normalized.shelf_life_days,
          storageTemp: normalized.storage_temp,
          humidity: normalized.humidity,
          storageType: normalized.storage_type,
          transportConditions: normalized.transport_conditions,
          packagingType: normalized.packaging_type,
          packagingSize: normalized.packaging_size,
          mapRequired: normalized.map_required,
        },
        recommendation: {
          recommendedMaterial: mlResult.recommendation.recommended_material,
          materialCategory: mlResult.recommendation.material_category,
          polymerType: mlResult.recommendation.polymer_type,
          recyclingCode: mlResult.recommendation.recycling_code,
          ecoRating: mlResult.recommendation.eco_rating,
          suitabilityScore: mlResult.recommendation.suitability_score,
          carbonSavingsPct: mlResult.recommendation.carbon_savings_pct,
          barrierRequirements: mlResult.recommendation.barrier_requirements,
          structuralSpecs: mlResult.recommendation.structural_specs,
          mapGasRatios: mlResult.recommendation.map_gas_ratios,
          chemistryBreakdown: mlResult.recommendation.chemistry_breakdown,
          tradeoffs: mlResult.recommendation.tradeoffs,
          compatibilityScore: mlResult.recommendation.compatibility_score,
          smartDisposable: mlResult.recommendation.smart_disposable,
          economics: mlResult.recommendation.economics,
        },
      });
    }

    return res.json({
      success: true,
      data: mlResult,
      recordId: savedRecord ? savedRecord._id : null,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const items = await Recommendation.find({ user: req.user._id });
    return res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getRecommendationById = async (req, res) => {
  try {
    const item = await Recommendation.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) {
      return res.status(404).json({ success: false, error: 'Recommendation not found or access unauthorized' });
    }
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
