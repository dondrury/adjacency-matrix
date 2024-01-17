const mongoose = require('mongoose')

const matrixSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  size: { type: Number, required: true, index: true },
  rank: { type: Number, required: true },
  booleanArray: [[Boolean]],
  jpgString: { type: String },
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

const Graph = mongoose.model('Matrix', matrixSchema)

module.exports = Graph
