const mongoose = require('mongoose')
const Polynomial = require('polynomial')
const eigs = require('mathjs').eigs
const Morph = require('./morph')
// import { eigs } from 'mathjs'
// graph is given only name and booleanArray when init, all other values are calculated internally

const graphSchema = new mongoose.Schema({
  name: { type: String, index: true },
  size: { type: Number, required: true, index: true },
  rank: { type: Number, required: true },
  booleanMatrix: [[Boolean]],
  binaryRepresentation: { type: String, required: true, unique: true },
  base10Representation: { type: Number, required: true },
  morphIdentified: { type: mongoose.Schema.Types.ObjectId, ref: 'Morph'},
  pseudoSkewSymmetryScore: Number,
  phylogeny: {
    composition: { type: mongoose.Schema.Types.ObjectId, ref: 'Composition'},
    tuple: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Graph'}
    ]
  },
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

graphSchema.pre('validate', function (next) {
  // console.log('before validating', this)
  const nonSquareError = nonSquare(this.booleanMatrix)
  if (nonSquareError) {
    next(nonSquareError)
    return
  }
  const isSymmetricError = isSymmetric(this.booleanMatrix)
  if (!isSymmetricError) {
    next(isSymmetricError)
  }
  this.size = this.booleanMatrix.length
  this.rank = determineRank(this.booleanMatrix)
  console.log('rank=' + this.rank + ' size=' + this.size)
  if (this.rank !== 3 && this.size !== 4) next('Not rank three and bigger than N=4')
  this.binaryRepresentation = findBinaryRepresentation(this.booleanMatrix)
  this.base10Representation = parseInt(this.binaryRepresentation, 2)
  this.pseudoSkewSymmetryScore = pseudoSkewSymmetryScore(this.booleanMatrix)
  next()
})

graphSchema.method('classify', function (cb) {
  console.log('classifying graph %s', this.id)
  const characteristicPolynomial = findCharacteristicEquation(this.booleanMatrix)
  const characteristicPolynomialString = characteristicPolynomial.toString()
  Morph.findOne({ characteristicPolynomialString }).populate('bestExample').select('-image').exec((err, existingMorph) => {
    if (err) {
      console.log(err)
      return
    }
    if (!existingMorph) {
      const newMorph = new Morph({
        name: '',
        size: this.size,
        characteristicPolynomial: characteristicPolynomial,
        characteristicPolynomialString: characteristicPolynomialString,
        characteristicPolynomialHtml: prettyPrintPolynomial(characteristicPolynomial),
        approximateEigenvalues: findEigenValues(this.booleanMatrix),
        bestExample: this._id,
        notes: ''
      })
      newMorph.save((err, savedNewMorph) => {
        if (err) {
          console.log(err)
          return
        }
        console.log('new morph', savedNewMorph)
        this.morphIdentified = savedNewMorph._id
        this.save((err, graphAfter) => {
          if (err) console.log(err)
          if (!graphAfter) console.log('failed to save')
          cb()
        })
      })
    } else {
      // need to improve 'best example' here
      if (this.pseudoSkewSymmetryScore < existingMorph.bestExample.pseudoSkewSymmetryScore) {
        existingMorph.bestExample = this._id
      }
      existingMorph.exampleCount++
      existingMorph.save((err, updatedMorph) => {
        if (err) {
          console.log(err)
          return
        }
        console.log('updated morph', updatedMorph)
        this.morphIdentified = updatedMorph._id
        this.save((err, graphAfter) => {
          if (err) console.log(err)
          if (!graphAfter) console.log('failed to save')
          cb()
        })
      })
    }
  })
})

function findBinaryRepresentation (booleanMatrix) {
  let arrayOfBooleans = []
  for (let i = 0; i < booleanMatrix.length - 1; i++) { // i is for rows
    const partialRow = booleanMatrix[i].slice(i + 1)
    arrayOfBooleans = arrayOfBooleans.concat(partialRow)
  }
  // console.log('array of booleans', arrayOfBooleans)
  return arrayOfBooleans.map(b => b ? '1' : '0').join('')
}

function prettyPrintPolynomial (poly) {
  // console.log(poly)
  let prettyHtml = ''
  const polynomial = poly.coeff
  for (const power in polynomial) {
    // console.log('power', power)
    const coeff = polynomial[power]
    // console.log('coefficient', coeff)
    let html = ''
    if (power !== '0') {
      if (coeff === 1) html = `+&lambda;<sup>${power === '1' ? '' : power}</sup>`
      else if (coeff === -1) html = `-&lambda;<sup>${power === '1' ? '' : power}</sup>`
      else html = `${coeff > 0 ? '+' : ''}${coeff}&lambda;<sup>${power === '1' ? '' : power}</sup>`
    }
    else  html = (coeff > 0 ? '+' : '') + coeff // for regular numbers
    prettyHtml = html + prettyHtml
  }
  // console.log('prettyHtml', prettyHtml)
  if (prettyHtml.charAt(0) === '+') prettyHtml = prettyHtml.substring(1)
  return prettyHtml + ' = 0'
}

function findCharacteristicEquation (matrix) {
  const polynomialMatrix = createPolynomialMatrix(matrix)
  return detByLaplace(polynomialMatrix)
 }

function detByLaplace(polyMatrix) {
  // console.log('polynomial matrix from which to take determinant', polyMatrix)
  if (polyMatrix.length === 2) { // 2x2 easy to calculate, also escape condition
    const ad = polyMatrix[0][0].mul(polyMatrix[1][1])
    const bc = polyMatrix[0][1].mul(polyMatrix[1][0])
    return ad.sub(bc) // ad - bc, polynomial object, not number
  }
  // if not 2x2 we need to break it up into submatrices
  const topRow = polyMatrix[0].map((el, index) => {
    if (el.toString() === '0') {
      // console.log('excepted a zero prefix')
      return {
        prefix: 0,
        subMatrix: null
      }
    }
    const subMatrix = []
    for (let i = 1; i < polyMatrix.length; i++) {  // i is for rows, we ignore the first one, containing our coefficients
      const row = []
      for (let j = 0; j < polyMatrix[i].length; j++) { // j is for columns
        if (j !== index) row.push(polyMatrix[i][j]) // don't take from our column
      }
      subMatrix.push(row)
    }
    
    return {
      prefix: el.mul(new Polynomial([index % 2 ? -1 : 1])), // switch sign for odd numbers
      subMatrix
    }
  })
  // console.log('topRow', topRow)
  let polynomialSum = new Polynomial([0])
  topRow.forEach(ob => {
    // console.log('prefix', ob.prefix.toString())
    if (ob.prefix !== 0) {
      let partialSum = ob.prefix.mul(detByLaplace(ob.subMatrix))
      polynomialSum = polynomialSum.add(partialSum)
    }
  }) // topRow now list of polynomials
  return polynomialSum
}

function createPolynomialMatrix (matrix) {
  // console.log('before createPolynomialMatrix', matrix)
  const polynomialMatrix = []
  for (let i = 0; i < matrix.length; i++) {  // i is for rows
    const row = []
    for (let j = 0; j < matrix[i].length; j++) { // j is for columns
      let element = new Polynomial([0])
      if (matrix[i][j]) element = new Polynomial([1])
      if (i === j) element = new Polynomial([0, -1])
      row.push(element)
    }
    polynomialMatrix.push(row)
  }
  // console.log('after createPolynomialMatrix', polynomialMatrix)
  return polynomialMatrix
}

function findEigenValues (matrix) {
  const numericalMatrix = []
  for (let i = 0; i < matrix.length; i++) {  // i is for rows
    const row = []
    for (let j = 0; j < matrix[i].length; j++) { // j is for columns
      row.push(matrix[i][j] ? 1: 0)
    }
    numericalMatrix.push(row)
  }
  // console.log('matrix', matrix)
  // console.log('numericalMatrix', numericalMatrix)
  // console.log('eigenvalues', eigs(numericalMatrix, { eigenvectors: false }))
  return eigs(numericalMatrix, { eigenvectors: false }).values.sort((a,b) => a - b)
}

function determineRank (booleanMatrix) {
  let maximumRank  = 0
  for (let i = 0; i < booleanMatrix.length; i++) {
    let rowRank = 0
    for (let j = 0; j < booleanMatrix[i].length; j++) {
      if (booleanMatrix[i][j]) rowRank++
    }
    if (rowRank > maximumRank) maximumRank = rowRank
  }
  for (let i = 0; i < booleanMatrix.length; i++) {
    let rowRank = 0
    for (let j = 0; j < booleanMatrix[i].length; j++) {
      if (booleanMatrix[j][i]) rowRank++
    }
    if (rowRank > maximumRank) maximumRank = rowRank
  }
  return maximumRank
}

function nonSquare (booleanMatrix) {
  const sizeFirstRow = booleanMatrix.length
  for ( let i = 0; i < sizeFirstRow; i ++ ) {
    if (booleanMatrix[i].length !== sizeFirstRow) {
      return new Error('matrix is not square')
    }
  }
}

function isSymmetric (booleanMatrix) {
  const A = booleanMatrix
  const n = booleanMatrix.length
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      if (A[i][j] !== A[j][i])
        return new Error('matrix is not symmetric')
    }
  }
  return true
}

function pseudoSkewSymmetryScore (booleanMatrix) {
  const A = booleanMatrix
  const n = booleanMatrix.length
  let score = 0
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i; j++) {
     score += Math.abs(A[i][j] - A[n - j - 1][n - i - 1])
    }
  }
  return score
}
graphSchema.virtual('relationsObject').get(function() {
   /*
    { 0 : {
            1 : true,
            4: true,
            5: true
          },
      1: {
            0: true,
            7: true,
            9:true
          }
      ...
    }
    */
    const relationsObject = {}
    for (let j = 0; j < this.booleanMatrix.length; j++ ) {
      for (let i = 0; i < this.booleanMatrix[j].length; i++) {
        if (this.booleanMatrix[j][i]) {
          if (typeof relationsObject[j] !== 'object' ) {
            relationsObject[j] = {}
          }
          relationsObject[j][i] = true
        }
      }
    }
    totalPredictedCompliantGraphs(this.size)
    function totalPredictedCompliantGraphs (size) {
      let graphs = 0
      for (let i = size; i >= 0; i--) {
        graphs += ( Math.ceil(1, i - 1 ) * Math.ceil(1, i - 2) * Math.ceil(1, i - 3) )
      }
      // console.log('totalCompliantGraphs', graphs)
      return graphs
    }
    return relationsObject
})

graphSchema.virtual('relationArray').get(function() {
  /*
   [
  [ 0, 5 ], [ 0, 10 ], [ 0, 11 ],
  [ 1, 4 ], [ 1, 6 ],  [ 1, 7 ],
  [ 2, 5 ], [ 2, 8 ],  [ 2, 11 ],
  [ 3, 5 ], [ 3, 8 ],  [ 3, 10 ],
  [ 4, 6 ], [ 4, 7 ],  [ 6, 7 ],
  [ 8, 9 ], [ 9, 10 ], [ 9, 11 ]
]
   */
   const relationArray = []
   for (let j = 0; j < this.booleanMatrix.length; j++ ) {
     for (let i = 0; i < this.booleanMatrix[j].length; i++) {
       if (i > j) {
         if (this.booleanMatrix[j][i]) {
          relationArray.push([j, i])
         }
       }
     }
    }

   return relationArray
})

const Graph = mongoose.model('Graph', graphSchema)

module.exports = Graph
