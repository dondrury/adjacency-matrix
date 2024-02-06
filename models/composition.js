const mongoose = require('mongoose')

const compositionSchema = new mongoose.Schema({
  name: { type: String, index: true, required: true },
  size: { type: Number, required: true },
  rank: Number,
  numericMatrix: [[Number]],
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

compositionSchema.pre('validate', function (next) {
  // console.log('before validating', this)
  const nonSquareError = nonSquare(this.numericMatrix)
  if (nonSquareError) {
    next(nonSquareError)
    return
  }
  this.size = this.numericMatrix.length
  this.rank = determineRank(this.numericMatrix)
  // console.log('prior to save', this)
  next()
})

function determineRank (numericMatrix) {
  let maximumRank  = 0
  for (let i = 0; i < numericMatrix.length; i++) {
    let rowRank = 0
    for (let j = 0; j < numericMatrix[i].length; j++) {
      if (typeof numericMatrix[i][j] === 'number' && numericMatrix[i][j] > 0) rowRank++
    }
    if (rowRank > maximumRank) maximumRank = rowRank
  }
  for (let i = 0; i < numericMatrix.length; i++) {
    let rowRank = 0
    for (let j = 0; j < numericMatrix[i].length; j++) {
      if (typeof numericMatrix[i][j] === 'number' && numericMatrix[i][j] > 0) rowRank++
    }
    if (rowRank > maximumRank) maximumRank = rowRank
  }
  return maximumRank
}

function nonSquare (numericMatrix) {
  const sizeFirstRow = numericMatrix.length
  for ( let i = 0; i < sizeFirstRow; i ++ ) {
    if (numericMatrix[i].length !== sizeFirstRow) {
      return new Error('matrix is not square')
    }
  }
}

const Composition = mongoose.model('Composition', compositionSchema)

module.exports = Composition