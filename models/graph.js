const mongoose = require('mongoose')
const Polynomial = require('polynomial')
const _ = require('lodash')
// const Morph = require('./morph')
const MathJS = require('mathjs')
// graph is given only name and booleanArray when init, all other values are calculated internally

const graphSchema = new mongoose.Schema({
  name: { type: String, index: true },
  size: { type: Number, required: true, index: true },
  rank: { type: Number, required: true, index: true },
  booleanMatrix: [[Boolean]],
  binaryString: { type: String, required: true, unique: true },
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

graphSchema.method('getHistogramOfClosedPaths', function () {
  const relationsObject = createRelationsObject(this)
  const uniqueClosedPaths = findAllUniqueClosedPathsStartingAt(relationsObject, 0)
  // console.log({uniqueClosedPaths})
  const histogram = {}
  uniqueClosedPaths.forEach(p => {
    const pathLength = p.length
    if (histogram[pathLength]) {
      histogram[pathLength].push(p)
    } else {
      histogram[pathLength] = []
      histogram[pathLength].push(p)
    }
  })
  console.log({histogram})
  return histogram
})

function findAllUniqueClosedPathsStartingAt (relationsObject, startingIndex) {
  const worldPaths = [[startingIndex]]
  const closedPaths = []
  appendWorldPath(worldPaths[0])

  function appendWorldPath (pathArray) { // start with the array children
    const lastElement = pathArray[pathArray.length - 1]
    const connectedElements = Object.keys(relationsObject[lastElement]).map(el => 1 * el)
    // console.log('connectedElements', connectedElements)
    for (const i in connectedElements) {
      const newPathArray = pathArray.map(x => 1 * x)
      const newElement = connectedElements[i]
      const indexOfNewElement = newPathArray.indexOf(newElement)
      // console.log({indexOfNewElement})
      if (indexOfNewElement === -1) {// still walking, never visited this element before
        newPathArray.push(newElement)
        worldPaths.push(newPathArray)
        appendWorldPath(newPathArray)
      } else {  // this element already in the array at known position, closed path!
        // console.log('closed path %s, closing on element %s, with index %s', newPathArray, newElement, indexOfNewElement)
        const closedPath = newPathArray.slice(indexOfNewElement)
        // console.log({closedPath})
        closedPaths.push(closedPath)
      }
    }
   }
  // console.log({closedPaths})
  const uniqueClosedPaths = filterUniquePaths(closedPaths)
  return uniqueClosedPaths
}

function filterUniquePaths (paths) {
  const uniquePaths = []
  const seenPaths = {}
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i]
    const pathKey = path.join(',') // convert to string, cuz it's unique isn't it
    if (!seenPaths[pathKey]) { // seri
      uniquePaths.push(path)
      seenPaths[pathKey] = true
    }
  }
  return uniquePaths
}


function createRelationsObject (graph) {
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
    for (let j = 0; j < graph.booleanMatrix.length; j++ ) {
      for (let i = 0; i < graph.booleanMatrix[j].length; i++) {
        if (graph.booleanMatrix[j][i]) {
          if (typeof relationsObject[j] !== 'object' ) {
            relationsObject[j] = {}
          }
          relationsObject[j][i] = true
        }
      }
    }
    // console.log({relationsObject})
    return relationsObject
}


// graphSchema.method('breadthFirstSearchForClosedPaths', function () { // walk every possible, non-repeating path.
//   // let's try to do this from only the booleanMatrix
//   console.log('depth first search of ')
  
//   const booleanMatrix = this.booleanMatrix
//   console.log(booleanMatrix)
//   const paths = []
//   walk([0])

//   function walk (path) {
//     const currentNode = path[path.length - 1]
//      console.log(`walk([${path}])`)
//     console.log({currentNode})
//     const possibleNextStepsRow = booleanMatrix[currentNode]
//     console.log({possibleNextStepsRow})
//     // console.log({paths})
//     for (let i = 0; i < possibleNextStepsRow.length; i++) {
//       if (possibleNextStepsRow[i] === true) { // 'i' is a node name we can continue our walk towards
//         console.log({currentNode, considering: i})
//         if (i === path[0]) { // the next node would loop back around to the first step of the path!
//           path.push('closes!')
//           console.log({paths})
//           return
//         }
//         if (path.includes(i)) { // if the next node has already been visited, but is not the start of the path, terminate
//           path.push(i)
//           path.push('terminates')
//           console.log({paths})
//           return
//         } else { // we can take another step towards 'i'
//            const newPath = _.clone(path)
//            newPath.push(i)
//            paths.push(newPath)
//            console.log({paths})
//            walk(newPath)
//         }
//       }
//     }
//   }
// })

graphSchema.method('createPowerSeries', function (options) {
  // console.log('createPowerSeries on this matrix', this.booleanMatrix)
  var numericalMatrix
  var iterations = this.size
  if (typeof options.normalize === 'boolean' && options.normalize === true)
    numericalMatrix = normalizeNumericalMatrix(createNumericalMatrix(this.booleanMatrix))
  else
    numericalMatrix = createNumericalMatrix(this.booleanMatrix)
  if (typeof options.iterations === 'number')
    iterations = options.iterations
  const powerSeries = [numericalMatrix]
  for (let i = 1; i < iterations; i++) {
    const product = multiplySquareMatrices(numericalMatrix, powerSeries[powerSeries.length - 1])
    // const difference = subtractMatrices(product, powerSeries[powerSeries.length - 1])
    // console.log('product', product)
    // powerSeries.push(difference)
    powerSeries.push(product)
  }
  return powerSeries
})

function multiplySquareMatrices (A, B) {
  if (A.length !== B.length) throw new Error('different size square matrices cant be multiplied')
  // var productMatrix = (new Array(A.length)).fill((new Array(A.length)).fill(null))
  var productMatrix = []
  // console.log(productMatrix)
  for (let i = 0; i < A.length; i++) { // is is row number of A
    let productRow = []
    for (let j = 0; j < A.length; j++) { // j is the column number of B
      const rowOfA = A[i]
      const colOfB = (new Array(A.length)).fill(null).map((v,k) => B[j][k])
      // console.log({rowOfA})
      // console.log({colOfB})
      let dotProduct = 0
      for (let k = 0; k < rowOfA.length; k++) {
        dotProduct += (rowOfA[k] * colOfB[k])
      }
      productRow.push(dotProduct)
    }
    productMatrix.push(productRow)
  }
  //  console.log(productMatrix)
  return productMatrix
}

function addMatrices (A,B) {
  if (A.length !== B.length) throw new Error('different size square matrices cant be multiplied')
  var sumMatrix = []
  for (let i = 0; i < A.length; i++) { // is is row number of A
    const sumRow = (new Array(A.length)).fill(null).map((v,k) => A[i][k] + B[i][k])
    sumMatrix.push(sumRow)
  }
  return sumMatrix
}

function subtractMatrices (A,B) {
  if (A.length !== B.length) throw new Error('different size square matrices cant be multiplied')
  var sumMatrix = []
  for (let i = 0; i < A.length; i++) { // is is row number of A
    const sumRow = (new Array(A.length)).fill(null).map((v,k) => A[i][k] - B[i][k])
    sumMatrix.push(sumRow)
  }
  return sumMatrix
}

function createNumericalMatrix (booleanMatrix) {
  const numericalMatrix = []
  for (let i = 0; i < booleanMatrix.length; i++) {  // i is for rows
    const row = []
    for (let j = 0; j < booleanMatrix[i].length; j++) { // j is for columns
      const elementValue = booleanMatrix[i][j] ? 1: 0
      row.push(elementValue)
    }
    numericalMatrix.push(row)
  }
  return numericalMatrix
}

function normalizeNumericalMatrix (numericalMatrix) {
  const cheapRank = numericalMatrix[0].reduce((a,c) => a + c) // cheap rank is just the sum of the first row
  // console.log({cheapRank})
  const normalizedNumericalMatrix = []
  for (let i = 0; i < numericalMatrix.length; i++) {  // i is for rows
    const row = []
    for (let j = 0; j < numericalMatrix[i].length; j++) { // j is for columns
      const elementValue = numericalMatrix[i][j]
      row.push(elementValue / cheapRank)
    }
    normalizedNumericalMatrix.push(row)
  }
  return normalizedNumericalMatrix
}

graphSchema.method('createFromBinaryString', function (binaryString) {
  // console.log({ binaryString})
  this.size = Math.sqrt(binaryString.length)
  this.booleanMatrix = []
  for (let i = 0; i < this.size; i++) {  // i is for rows
    const row = binaryString.substring(i * this.size, (i + 1) * this.size).split('').map(char => char === '1')
    // console.log(row)
    this.booleanMatrix.push(row)
  }
  this.binaryString = binaryString
  return this
})

graphSchema.pre('validate', function (next) {
  // console.log('before validating', this)
  const nonSquareError = nonSquare(this.booleanMatrix)
  if (nonSquareError) {
    next(nonSquareError)
    return
  }

  this.size = this.booleanMatrix.length
  this.rank = determineRank(this.booleanMatrix)
  if (typeof this.rank !== 'number' ) next('inconsistent rank')
  this.pseudoSkewSymmetryScore = pseudoSkewSymmetryScore(this.booleanMatrix)
  next()
})

graphSchema.method('classify', function (cb) {
  const Morph = require('./morph')
  console.log('classifying graph %s', this.id)
  const characteristicPolynomial = findCharacteristicEquation(this.booleanMatrix)
  const characteristicPolynomialString = characteristicPolynomial.toString()
  // console.log(characteristicPolynomialString)
  Morph.findOne({ characteristicPolynomialString }).populate('bestExample').select('-image').exec((err, existingMorph) => {
    if (err) {
      console.log(err)
      return
    }
    if (!existingMorph) {
      let approximateEigenvalues = []
      let symmetrical = isSymmetric(this.booleanMatrix)
      if (symmetrical) approximateEigenvalues = findEigenValues(this.booleanMatrix)
      const newMorph = new Morph({
        name: '',
        size: this.size,
        rank: this.rank,
        isSymmetric: symmetrical,
        selfReferences: countSelfReferences(this.booleanMatrix),
        approximateEigenvalues,
        characteristicPolynomial: characteristicPolynomial,
        characteristicPolynomialString: characteristicPolynomialString,
        characteristicPolynomialHtml: prettyPrintPolynomial(characteristicPolynomial),
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
  // console.log('eigenvalues', MathJS.eigs(numericalMatrix, { eigenvectors: false }))
  let eigenvalues = []
  try {
    eigenvalues = MathJS.eigs(numericalMatrix, { eigenvectors: false }).values.sort((a,b) => a - b)
  } catch (e) {
    console.log(e)
  }
  return eigenvalues
}

// function findBinaryRepresentation (booleanMatrix) {
//   let arrayOfBooleans = []
//   for (let i = 0; i < booleanMatrix.length - 1; i++) { // i is for rows
//     const partialRow = booleanMatrix[i].slice(i + 1)
//     arrayOfBooleans = arrayOfBooleans.concat(partialRow)
//   }
//   // console.log('array of booleans', arrayOfBooleans)
//   return arrayOfBooleans.map(b => b ? '1' : '0').join('')
// }

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
  // console.log(prettyHtml, typeof prettyHtml)
  if (prettyHtml === '') prettyHtml = '0'
  return prettyHtml + ' = 0'
}

function findCharacteristicEquation (matrix) {
  const polynomialMatrix = createPolynomialMatrix(matrix)
  if (matrix.length === 1) {
    return new Polynomial([matrix[0][0] ? 1 : 0, -1])
  }
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
      element = new Polynomial([matrix[i][j] ? 1 : 0, i === j ? -1 : 0])
      row.push(element)
    }
    polynomialMatrix.push(row)
  }
  // console.log('after createPolynomialMatrix', polynomialMatrix)
  return polynomialMatrix
}



function determineRank (booleanMatrix) {
  let rowRank  = []
  for (let i = 0; i < booleanMatrix.length; i++) {
    let rank = 0
    for (let j = 0; j < booleanMatrix[i].length; j++) {
      if (booleanMatrix[i][j]) rank++
    }
    rowRank.push(rank)
    if (i > 0 && rowRank[i] !== rowRank[i - 1]) {
      console.log('inconsistent adjascent row ranks, exiting determineRank')
      return null
    }
  }
  let columnRank = []
  for (let i = 0; i < booleanMatrix.length; i++) {
    let rank = 0
    for (let j = 0; j < booleanMatrix[i].length; j++) {
      if (booleanMatrix[j][i]) rank++
    }
    columnRank.push(rank)
    if (i > 0 && rowRank[i] !== rowRank[i - 1]) {
      console.log('inconsistent adjascent column ranks, exiting determineRank')
      return null
    }
  }
  // console.log(booleanMatrix)
  // console.log(rowRank)
  // console.log(columnRank)
  const testRank = rowRank[0]
  // console.log({ testRank})
  if (rowRank.every(el => el === testRank) && columnRank.every(el => el === testRank) ) {
    console.log('consistent rank of ' + testRank)
    return testRank
  }
  return null // will throw error
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
        return false
    }
  }
  return true
}

function countSelfReferences (booleanMatrix) {
  const size = booleanMatrix.length
  let selfReferences = 0
  for (let i = 0; i < size; i++) {
    if (booleanMatrix[i][i]) selfReferences++
  }
  return selfReferences
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
        if (this.booleanMatrix[j][i]) {
        relationArray.push([j, i])
        }
     }
    }

   return relationArray
})


const Graph = mongoose.model('Graph', graphSchema)

module.exports = Graph
