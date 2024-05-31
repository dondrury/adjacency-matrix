const mongoose = require('mongoose')

const morphSchema = new mongoose.Schema({
  name: { type: String, index: true },
  size: { type: Number, required: true, index: true },
  rank: { type: Number, required: true, index: true },
  characteristicPolynomial: Object,
  characteristicPolynomialString: { type: String, required: true, index: true, unique: true },
  characteristicPolynomialHtml: String,
  // approximateEigenvalues: [Number],
  exactEigenvalues: [String],
  image: String,
  exampleCount: { type: Number, default: 1 },
  bestExample: { type: mongoose.Schema.Types.ObjectId, ref: 'Graph'},
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

const Morph = mongoose.model('Morph', morphSchema)

module.exports = Morph
