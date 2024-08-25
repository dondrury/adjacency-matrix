const mongoose = require('mongoose')

const morphSchema = new mongoose.Schema({
  name: { type: String, index: true },
  size: { type: Number, required: true, index: true },
  rank: { type: Number, required: true, index: true },
  characteristicPolynomial: Object,
  characteristicPolynomialString: { type: String, required: true, index: true, unique: true },
  characteristicPolynomialHtml: String,
  isSymmetric: Boolean,
  selfReferences: Number,
  // processed: Boolean,
  approximateEigenvalues: [Number],
  image: String,
  exampleCount: { type: Number, default: 1 },
  bestExample: { type: mongoose.Schema.Types.ObjectId, ref: 'Graph'},
  superpositionMatrix: [[Number]],
  superpositionMatrixCount: Number, // this is a parity check to make sure that we have exampleCount === superpositionMatrixCount
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

morphSchema.pre('validate', function (next) {
  next()
})

morphSchema.method('updateSuperPositionMatrix', function (cb) {
  // This is also a time to do some clean-up and make sure that we have the correct example count, to account for errors during creation
  const Graph = require('./graph')
  console.log('updateSuperPositionMatrix for morph with characteristic polynomial ' + this.characteristicPolynomialString)
  Graph.find({ morphIdentified: this._id }).exec((err, myGraphs) => {
    if (err) {
      console.log(err)
      return
    }
    if (!myGraphs) {
      console.log('no graphs found for morph %s, this should not be possible. Error!', this._id)
      return
    }
    console.log('morph %s has %s exampleCount and %s graphs were found', this._id, this.exampleCount, myGraphs.length)
    this.exampleCount = myGraphs.length
    this.superpositionMatrix = (new Array(this.size)).fill((new Array(this.size)).fill(0)) // raw numeric matrix nxn
    myGraphs.forEach(g => {
      for (let j = 0; j < this.size; j++) { // rows
        for (let i = 0; i < this.size; i++) { // columns
          this.superpositionMatrix[j][i] += (g.booleanMatrix[j][i] ? 1 : 0)
        }
      }
    })
    this.save((err, morphAfter) => {
      if (err) console.log(err)
      if (cb) cb()
    })
    
  })
  
})




const Morph = mongoose.model('Morph', morphSchema)

module.exports = Morph
