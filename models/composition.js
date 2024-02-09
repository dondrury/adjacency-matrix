const mongoose = require('mongoose')

const compositionSchema = new mongoose.Schema({
  name: { type: String, index: true, required: true },
  size: { type: Number, required: true },
  rank: Number,
  numericMatrix: [[Number]],
  base10Representation: { type: Number, index: true, required: true, unique: true },
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
  // console.log('prior to save', this)
  const checkFirstRowError = checkFirstRow(this.numericMatrix)
  if (checkFirstRowError) {
    next(checkFirstRowError)
    return
  }
  const checkValidCompositonError = checkValidComposition(this.numericMatrix)
  if (checkValidCompositonError) {
    next(checkValidCompositonError)
    return
  }
  this.rank = determineRank(this.numericMatrix)
  this.base10Representation = findBase10Representation(this.numericMatrix)
  next()
})

function checkFirstRow (numericMatrix) {
  const firstRow = numericMatrix[0]
  for (let i = 0; i < firstRow.length; i++) {
    // index should equal the value of the element
    if (firstRow[i] !== i) {
      return Error('not a composition matrix, first row elements not equal to their indeces')
    }
  }
}

function checkValidComposition (numericMatrix) {
  let orderedArray = (new Array(numericMatrix.length)).fill(0)
  orderedArray = orderedArray.map((el, i) => i)
  const ascendingStringWithCommas = orderedArray.join(',') // 0,1,2,3,...
  // console.log('ascendingStringWithCommas', ascendingStringWithCommas)
  for (let i = 0; i < numericMatrix.length; i++) { // check that rows contain each index
    const rowString = (numericMatrix[i].map(el => el)).sort().join(',') // make a shallow copy
    // console.log('rowString', rowString)
    if (ascendingStringWithCommas !== rowString) {
      return new Error('not a composition matrix, a row contains duplicate elements')
    }
  }
  for (let i = 0; i < numericMatrix.length; i++) { // i is rows
    let column = []
    for (let j = 0; j < numericMatrix[i].length; j++) { // j is columns
      column.push(numericMatrix[i][j])
    }
    const columnString = column.sort().join(',')
    // console.log('columnString', columnString)
    if (ascendingStringWithCommas !== columnString) {
      return new Error('not a composition matrix, a column contains duplicate elements')
    }
  }
}

function findBase10Representation (numericMatrix) {
  console.log('findBase10Representation numericMatrix', numericMatrix)
  let arrayOfCoefficients = []
  for (let i = 0; i < numericMatrix.length - 1; i++) { // i is for rows
    const partialRow = numericMatrix[i].slice(i + 1)
    arrayOfCoefficients = arrayOfCoefficients.concat(partialRow)
  }
  // console.log('array of coefficients', arrayOfCoefficients)
  let base10Representation = 0
  for (let i = 0; i < arrayOfCoefficients.length; i++) { // first coefficient gets highest power of two
    const term = arrayOfCoefficients[i] * Math.pow(2, arrayOfCoefficients.length - 1 - i)
    // console.log(`term${i}`, term)
    base10Representation += term
  }
  return base10Representation
}

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