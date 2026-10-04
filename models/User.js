const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// In-memory fallback repository for zero-downtime local testing when MongoDB is disconnected
const inMemoryUsers = [];

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: '/images/default-avatar.png',
    },
    company: {
      type: String,
      default: 'Food Tech Labs',
    },
    role: {
      type: String,
      enum: ['Packaging Technologist', 'Food Scientist', 'QA Director', 'Operations Manager', 'Researcher'],
      default: 'Packaging Technologist',
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password helper
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Fallback helper class for when MongoDB connection is not active
class MockUserModel {
  constructor(data) {
    this._id = data._id || 'mock_user_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    this.name = data.name;
    this.email = (data.email || '').toLowerCase().trim();
    this.password = data.password;
    this.avatar = data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=0D8ABC&color=fff`;
    this.company = data.company || 'Food Tech Labs';
    this.role = data.role || 'Packaging Technologist';
    this.createdAt = data.createdAt || new Date();
  }

  async save() {
    if (this.password && !this.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    const idx = inMemoryUsers.findIndex(u => u.email === this.email);
    if (idx >= 0) {
      inMemoryUsers[idx] = this;
    } else {
      inMemoryUsers.push(this);
    }
    return this;
  }

  async comparePassword(candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
  }

  static async findOne(query) {
    if (mongoose.connection.readyState === 1) {
      return mongoose.model('User').findOne(query);
    }
    if (query.email) {
      const found = inMemoryUsers.find(u => u.email.toLowerCase() === query.email.toLowerCase());
      return found ? new MockUserModel(found) : null;
    }
    if (query._id) {
      const found = inMemoryUsers.find(u => u._id.toString() === query._id.toString());
      return found ? new MockUserModel(found) : null;
    }
    return null;
  }

  static async findById(id) {
    if (mongoose.connection.readyState === 1) {
      return mongoose.model('User').findById(id);
    }
    const found = inMemoryUsers.find(u => u._id.toString() === id.toString());
    return found ? new MockUserModel(found) : null;
  }

  static async create(data) {
    if (mongoose.connection.readyState === 1) {
      return mongoose.model('User').create(data);
    }
    const instance = new MockUserModel(data);
    await instance.save();
    return instance;
  }
}

let UserModel;
try {
  UserModel = mongoose.model('User', UserSchema);
} catch (e) {
  UserModel = mongoose.model('User');
}

// Wrapper that intelligently uses Mongoose or MockUserModel if DB is disconnected
const UserProxy = new Proxy(UserModel, {
  get(target, prop) {
    if (mongoose.connection.readyState !== 1) {
      if (prop in MockUserModel) {
        return MockUserModel[prop];
      }
    }
    return target[prop];
  },
  construct(target, args) {
    if (mongoose.connection.readyState !== 1) {
      return new MockUserModel(...args);
    }
    return new target(...args);
  }
});

module.exports = UserProxy;
