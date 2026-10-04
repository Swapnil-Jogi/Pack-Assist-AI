const mongoose = require('mongoose');

// In-memory fallback list
const inMemoryRecommendations = [];

const RecommendationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.Mixed, // Supports ObjectId or mock user string ID
      ref: 'User',
      required: true,
    },
    commodityName: {
      type: String,
      required: true,
      trim: true,
      default: 'Custom Food Commodity',
    },
    commodityType: {
      type: String,
      required: true,
    },
    inputs: {
      moistureContent: { type: Number, required: true, default: 12.0 },
      fatContent: { type: Number, required: true, default: 2.0 },
      ph: { type: Number, required: true, default: 6.5 },
      respirationRate: { type: String, required: true, default: 'None' },
      desiredShelfLifeDays: { type: Number, required: true, default: 60 },
      storageTemp: { type: Number, required: true, default: 20.0 },
      humidity: { type: Number, required: true, default: 50.0 },
      storageType: { type: String, required: true, default: 'Ambient' },
      transportConditions: { type: String, required: true, default: 'Standard Ambient' },
      packagingType: { type: String, default: 'Stand-Up Pouch (Doypack)' },
      packagingSize: { type: String, default: 'Retail Standard (250g - 500g)' },
      mapRequired: { type: String, default: 'Yes' },
    },
    recommendation: {
      recommendedMaterial: { type: String, required: true },
      materialCategory: { type: String },
      polymerType: { type: String },
      recyclingCode: { type: String },
      ecoRating: { type: String },
      suitabilityScore: { type: Number },
      carbonSavingsPct: { type: Number },
      barrierRequirements: {
        otr: { type: Number },
        wvtr: { type: Number },
        category: { type: String },
      },
      structuralSpecs: {
        recommendedThicknessMicrons: { type: Number },
        tensileStrengthMpa: { type: Number },
        sealInitiationTempC: { type: Number },
      },
      mapGasRatios: {
        co2Pct: { type: Number },
        o2Pct: { type: Number },
        n2Pct: { type: Number },
      },
      chemistryBreakdown: {
        polymerStructure: { type: String },
        barrierMechanics: { type: String },
        degradationPrevention: { type: String },
        regulatoryCompliance: { type: String },
      },
      tradeoffs: { type: Array, default: [] },
      compatibilityScore: {
        overall: { type: Number, default: 94 },
        rating: { type: String, default: 'High Compatibility' },
        moistureMatch: { type: Number, default: 95 },
        oxygenMatch: { type: Number, default: 92 },
        chemicalInertness: { type: Number, default: 96 },
        thermalMechanical: { type: Number, default: 90 },
        acidLipidTolerance: { type: Number, default: 94 },
        summary: { type: String },
      },
      smartDisposable: {
        recommendedMethod: { type: String, default: 'Industrial Composting / Circular Recycling' },
        wasteStream: { type: String, default: 'Green / Organics Bin' },
        safetyScore: { type: Number, default: 95 },
        protectionScore: { type: Number, default: 92 },
        costScore: { type: Number, default: 85 },
        sustainabilityScore: { type: Number, default: 90 },
        disposalInstructions: { type: String },
        environmentalImpact: { type: String },
        alternativeMaterials: { type: Array, default: [] },
      },
    },
  },
  { timestamps: true }
);

class MockRecommendationModel {
  constructor(data) {
    this._id = data._id || 'rec_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    this.user = data.user;
    this.commodityName = data.commodityName || 'Custom Food Commodity';
    this.commodityType = data.commodityType;
    this.inputs = data.inputs || {};
    this.recommendation = data.recommendation || {};
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    const idx = inMemoryRecommendations.findIndex(r => r._id === this._id);
    if (idx >= 0) {
      inMemoryRecommendations[idx] = this;
    } else {
      inMemoryRecommendations.unshift(this);
    }
    return this;
  }

  static async find(query = {}) {
    if (mongoose.connection.readyState === 1) {
      return mongoose.model('Recommendation').find(query).sort({ createdAt: -1 });
    }
    let results = [...inMemoryRecommendations];
    if (query.user) {
      results = results.filter(r => String(r.user) === String(query.user) || String(r.user?._id) === String(query.user));
    }
    return {
      sort: () => results,
      populate: () => ({ sort: () => results }),
      limit: (n) => results.slice(0, n),
      lean: () => results,
    };
  }

  static async findOne(query = {}) {
    if (mongoose.connection.readyState === 1) {
      return mongoose.model('Recommendation').findOne(query);
    }
    const found = inMemoryRecommendations.find(r => {
      let match = true;
      if (query._id && String(r._id) !== String(query._id)) match = false;
      if (query.user && String(r.user) !== String(query.user) && String(r.user?._id) !== String(query.user)) match = false;
      return match;
    });
    return found ? new MockRecommendationModel(found) : null;
  }

  static async findOneAndDelete(query = {}) {
    if (mongoose.connection.readyState === 1) {
      return mongoose.model('Recommendation').findOneAndDelete(query);
    }
    const idx = inMemoryRecommendations.findIndex(r => {
      let match = true;
      if (query._id && String(r._id) !== String(query._id)) match = false;
      if (query.user && String(r.user) !== String(query.user) && String(r.user?._id) !== String(query.user)) match = false;
      return match;
    });
    if (idx >= 0) {
      const removed = inMemoryRecommendations.splice(idx, 1);
      return removed[0];
    }
    return null;
  }

  static async findById(id) {
    if (mongoose.connection.readyState === 1) {
      return mongoose.model('Recommendation').findById(id);
    }
    const found = inMemoryRecommendations.find(r => String(r._id) === String(id));
    return found ? new MockRecommendationModel(found) : null;
  }

  static async countDocuments(query = {}) {
    if (mongoose.connection.readyState === 1) {
      return mongoose.model('Recommendation').countDocuments(query);
    }
    if (query.user) {
      return inMemoryRecommendations.filter(r => String(r.user) === String(query.user)).length;
    }
    return inMemoryRecommendations.length;
  }

  static async findByIdAndDelete(id) {
    if (mongoose.connection.readyState === 1) {
      return mongoose.model('Recommendation').findByIdAndDelete(id);
    }
    const idx = inMemoryRecommendations.findIndex(r => String(r._id) === String(id));
    if (idx >= 0) {
      const removed = inMemoryRecommendations.splice(idx, 1);
      return removed[0];
    }
    return null;
  }

  static async create(data) {
    if (mongoose.connection.readyState === 1) {
      return mongoose.model('Recommendation').create(data);
    }
    const instance = new MockRecommendationModel(data);
    await instance.save();
    return instance;
  }
}

let RecommendationModel;
try {
  RecommendationModel = mongoose.model('Recommendation', RecommendationSchema);
} catch (e) {
  RecommendationModel = mongoose.model('Recommendation');
}

const RecommendationProxy = new Proxy(RecommendationModel, {
  get(target, prop) {
    if (mongoose.connection.readyState !== 1) {
      if (prop in MockRecommendationModel) {
        return MockRecommendationModel[prop];
      }
    }
    return target[prop];
  },
  construct(target, args) {
    if (mongoose.connection.readyState !== 1) {
      return new MockRecommendationModel(...args);
    }
    return new target(...args);
  }
});

module.exports = RecommendationProxy;
