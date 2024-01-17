const mongoose = require('mongoose')

const compositionSchema = new mongoose.Schema({
  name: { type: String, index: true, required: true },
  size: { type: Number, required: true },
  numberArray: [[Number]],
  notes: { type: String }
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  },
  timestamps: true
})

const Composition = mongoose.model('Composition', compositionSchema)

module.exports = Composition