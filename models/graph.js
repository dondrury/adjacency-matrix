const mongoose = require('mongoose')

const graphSchema = new mongoose.Schema({
  size: { type: String, unique: true, required: true },
  adjacencyMatrix: [[Number]],
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

const Graph = mongoose.model('Graph', graphSchema)

module.exports = Graph
