const mongoose = require('mongoose')
const Graph = require('./graph')
var FundamentalModes4x4 = [] 
Graph.find({ size: 4 }).sort({ base10Representation: 1 }).exec((err, fundamentalModes) => {
  if (err) {
    console.log(err)
    return
  }
  console.log('composition engine initializing with %s fundamental modes', fundamentalModes.length)
  FundamentalModes4x4 = fundamentalModes
})


const compositionSchema = new mongoose.Schema({
  name: { type: String, index: true, required: true },
  size: { type: Number, required: true },
  stringRepresentation: { type: String, required: true, unique: true },
  rank: Number,
  numericMatrix: { type: [[Number]], required: true },
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
  this.stringRepresentation = JSON.stringify(this.numericMatrix)
  this.rank = determineRank(this.numericMatrix)
  next()
})

compositionSchema.method('compose', function (tuple) {
  // console.log('from method' , tuple)
  // console.log(this)
  const composedGraph = composeFundamentalModes(this, tuple)
  // console.log(composedGraph)
  return composedGraph
})

function composeFundamentalModes (compositionObject, tupleObject) {
  const composition = compositionObject.numericMatrix
  const tuple = tupleObject.numberArray
  // console.log('composition', composition)
  // console.log('tuple', tuple)
  const composed = []
  for (let i = 0; i < composition.length; i++) {
    const row = []
    for (let j = 0; j < composition[i].length; j++) {
      if (composition[i][j] === false) {
        row.push(FundamentalModes4x4[0])
        // console.log('composed mode 0', FundamentalModes[0])
      } else {
        const indexOfTuple = composition[i][j]
        const modeNumber = tuple[indexOfTuple]
        // console.log('composed mode ' + modeNumber, FundamentalModes4x4[modeNumber].booleanMatrix)
        row.push(FundamentalModes4x4[modeNumber].booleanMatrix)
      }
    }
    composed.push(row)
  }
  const booleanMatrix = flattenNestedMatrix(composed)
  const newGraph = new Graph({
    name: '[' + tuple.toString() + '] via ' + compositionObject.name,
    phylogeny: {
      composition: compositionObject._id,
      tuple: tuple.map(value => FundamentalModes4x4[value]._id) // graph ids for later
    },
    booleanMatrix
  })
  // console.log('newGraph', newGraph)
  return newGraph
}

function flattenNestedMatrix (composed) {
  const flattened = []
  for (let i = 0; i < composed.length; i++) { // row of composed
    for (let m = 0; m < 4; m++) { // m is choice of row in sub-matrix
      let flattenedRow = []
      for (let j = 0; j < composed.length; j++) { // j is column of composed matrix
        const subRow = composed[i][j][m]
        flattenedRow = flattenedRow.concat(subRow)
      }
      flattened.push(flattenedRow)
    }
  }
  // console.log('flattened', flattened)
  return flattened
}

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