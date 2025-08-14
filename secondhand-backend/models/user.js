// User schema
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// hash password helper
userSchema.methods.setPassword = async function(password) {
  this.passwordHash = await bcrypt.hash(password, 10)
}

// password check helper
userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.passwordHash)
}

module.exports = mongoose.models.User || mongoose.model('User', userSchema)
