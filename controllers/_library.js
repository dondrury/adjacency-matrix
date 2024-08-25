/* Library of old functions, may be useful */
function createFundamentalModes (size, i = 0) {
  console.log('creating fundamental modes at size ' + size)
  const elementCount = size * size
  const totalModes = Math.pow(2, elementCount)
  console.log('expecting ' + totalModes + ' graphs')
  // const minimumIndexForRankOtherThanZero = Math.pow(2, size * (size - 1))
  let minimumIndexForRankOtherThanZero = 0
  for (let j = 0; j < size; j++) {
    const contributionToMinimum = Math.pow(2, size * j)
    minimumIndexForRankOtherThanZero += contributionToMinimum
  }
  console.log({minimumIndexForRankOtherThanZero})
  console.log({asString: minimumIndexForRankOtherThanZero.toString(2).padStart(elementCount, '0')})
  // some indexes are preceeded with so many zeros they can't be rank other than zero
  i = i === 0 ? i : Math.max(i, minimumIndexForRankOtherThanZero) // no reason to start prior to minimum worthwhile, but zero does need to be included
  const allZerosRowString = (new Array(size)).fill('0').join('')
  const allOnesRowString = (new Array(size)).fill('1').join('')
  // console.log({allOnesRowString, allZerosRowString})
  createFundamentalMode(i)
  function createFundamentalMode () {
    if (i >= totalModes) {
      console.log('all done with creating fundamental modes at size ' + size)
      return
    }
    const binaryString = i.toString(2).padStart(elementCount, '0')
    // first check if all of first row or second row are ones
    for (let j = 0; j < size; j++) {
      let rowString = binaryString.slice(j * size, (j + 1) * size)
      // console.log({ i, binaryString, rowString, j})
      if (rowString === allZerosRowString || rowString === allOnesRowString) {
        // console.log('skipping', { i, binaryString, rowString, j})
        i++
        setTimeout(createFundamentalMode, 0)
        return
      }
    }
    // now check to see if it has the correct amount of 1s in the whole array, should be divisible by size
    let binaryArray = binaryString.split('') 
    let relationCount = 0
    binaryArray.forEach(function (el) {
      if (el === '1') relationCount++
    })
    
    if (relationCount % size === 0) { // this is a candidate for consistent rank
      console.log(`Total progress in this space = ${100 * i / totalModes}%\ni=${i} (${binaryString})\nis a candidate for consistent rank, calculating...`)
      const graph = new Graph({
        name: 'Fundamental Mode ' + i,
        binaryString
      })
      graphAfter = graph.createFromBinaryString(binaryString)
      graph.save((err, savedGraph) => {
        if (err) console.log(err)
        if (savedGraph) console.log('saved graph' , savedGraph)
        
        i++
        setTimeout(createFundamentalMode, 0)
      })
    } else { // not a candidate
      i++
      setTimeout(createFundamentalMode, 0)
    }
    
   
  }
}



function importFirstFourCompositions () {
  const Compositions = require('./compositions')
  for (let i = 0; i < Compositions.length; i ++) {
    // let i = 3
    const composition = new Composition({
      name: '4x4 Composition ' + i,
      numericMatrix: Compositions[i]
    })
    console.log('composition before', composition)
    composition.save((err, compositionAfter) => {
      if (err) {
        console.log(err)
        return
      }
      console.log('done, compositionAfter', compositionAfter)
    })
  }
}

function importAllFourTuples () {
  const FourTuples = require('./fourTuples')
  let i = 0
  nextFourTuple()
  function nextFourTuple() {
    if (i > FourTuples.length - 1) return
    console.log('attemting the ' + i + 'th tuple')
    const fourTuple = FourTuples[i]
    console.log('fourTuple before', fourTuple)
    const tuple = new Tuple({
      numberArray: fourTuple
    })
    // tuple.numberArray = [20,10,12,21]
    tuple.save((err, tupleAfter) => {
      if (err) {
        console.log(err)
        i++
        nextFourTuple()
        return
      }
      console.log('tuple after', tupleAfter)
      i++
      nextFourTuple()
    })
  }
}

function importAllTwoTuples () {
  const twoTuples = require('./twoTuples')
  let i = 0
  nextTuple()
  function nextTuple() {
    if (i > twoTuples.length - 1) return
    console.log('attemting the ' + i + 'th two tuple')
    const TwoTuple = twoTuples[i]
    console.log('TwoTuple before', TwoTuple)
    const tuple = new Tuple({
      numberArray: TwoTuple
    })
    // tuple.numberArray = [20,10,12,21]
    tuple.save((err, tupleAfter) => {
      if (err) {
        console.log(err)
        i++
        nextTuple()
        return
      }
      console.log('tuple after', tupleAfter)
      i++
      nextTuple()
    })
  }
}

function importAllThreeTuples () {
  const threeTuples = require('./threeTuples')
  let i = 0
  nextTuple()
  function nextTuple() {
    if (i > threeTuples.length - 1) return
    console.log('attemting the ' + i + 'th three tuple')
    const ThreeTuple = threeTuples[i]
    console.log('threeTuple before', ThreeTuple)
    const tuple = new Tuple({
      numberArray: ThreeTuple
    })
    // tuple.numberArray = [20,10,12,21]
    tuple.save((err, tupleAfter) => {
      if (err) {
        console.log(err)
        i++
        nextTuple()
        return
      }
      console.log('tuple after', tupleAfter)
      i++
      nextTuple()
    })
  }
}

function create2x2Compositions () {
  console.log('create 2x2 compositions, only one though')
  const comp = new Composition({
    numericMatrix: [
      [0, 1],
      [1, 0]
    ],
    name: '2x2 Compositon'
  })
  comp.save((err, composition) => {
    if (err) {
      console.log(err)
    }
    if (composition) {
      console.log('composition', composition)
    }
  })
}

function create3x3Compositions () {
  console.log('create 3x3 compositions, only one though')
  const comp = new Composition({
    numericMatrix: [
      [0, 1, 2],
      [1, 2, 0],
      [2, 0, 1]
    ],
    name: '3x3 Compositon'
  })
  comp.save((err, composition) => {
    if (err) {
      console.log(err)
    }
    if (composition) {
      console.log('composition', composition)
    }
  })
}

function compose8x8Graphs () {
  let TwoByTwoComposition = {}
  let i = 0

  function createGraph () {
    const tuple = Tuples2x2[i]
    // console.log('compose8x8graph', tuple, TwoByTwoComposition)
    const newGraph = TwoByTwoComposition.compose(tuple)
    newGraph.save((err, graph) => {
      if (err) {
        console.log(err)
        return
      }
      if (!graph) {
        console.log('no new graph')
        return
      }
      console.log('graph saved', graph)
      i++
      createGraph()
    })
  }

  Composition.findOne({ size: 2}).exec((err, composition) => {
    if (err) {
      console.log(err)
      return
    }
    if (!composition) {
      console.log('no 2x2 composition found')
      return
    }
    // console.log('3 composition found,', composition)
    TwoByTwoComposition = composition

    createGraph()
  })
}

function compose12x12Graphs () {
  let Composition3x3 = {}
  let i = 0

  function createGraph () {
    const tuple = Tuples3x3[i]
    const newGraph = Composition3x3.compose(tuple)
    newGraph.save((err, graph) => {
      if (err) {
        console.log(err)
        return
      }
      if (!graph) {
        console.log('new graph created')
        return
      }
      i++
      createGraph()
    })
  }

  Composition.findOne({ size: 3}).exec((err, composition) => {
    if (err) {
      console.log(err)
      return
    }
    if (!composition) {
      console.log('no 3x3 composition found')
      return
    }
    // console.log('3 composition found,', composition)
    Composition3x3 = composition

    createGraph()
  })
}

function processNextUnprocessedMorph () {
  Morph.findOne({ processed: { $exists: false } }).populate('bestExample').exec((err, unprocessedMorph) => {
    if (err) {
      console.log(err)
      return
    }
    if (!unprocessedMorph) {
      console.log('all morphs processed, stopping search')
      return
    }
    
    let approximateEigenvalues = []
    let selfReferences = countSelfReferences(unprocessedMorph.bestExample.booleanMatrix)
    let symmetrical = isSymmetric(unprocessedMorph.bestExample.booleanMatrix)
    if (symmetrical) approximateEigenvalues = findEigenValues(unprocessedMorph.bestExample.booleanMatrix)
    unprocessedMorph.isSymmetric = symmetrical
    unprocessedMorph.selfReferences = selfReferences
    unprocessedMorph.approximateEigenvalues = approximateEigenvalues
    unprocessedMorph.processed = true
    unprocessedMorph.save((err, processedMorph) => {
      if (err) {
        console.log(err)
        return
      } 
      if (processedMorph) {
        console.log({
          binaryStringUnprocessedGraph: unprocessedMorph.bestExample.binaryString,
          symmetrical,
          selfReferences,
          approximateEigenvalues
        })
        setTimeout(processNextUnprocessedMorph, 50)
        return
      }
      console.log('all morphs processed')
    })
  })

  // temporary use
  function countSelfReferences (booleanMatrix) { // temporary
    const size = booleanMatrix.length
    let selfReferences = 0
    for (let i = 0; i < size; i++) {
      if (booleanMatrix[i][i]) selfReferences++
    }
    return selfReferences
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
    let eigenvalues = []
    try {
      eigenvalues = eigs(numericalMatrix, { eigenvectors: false }).values.sort((a,b) => a - b)
    } catch (e) {
      console.log(e)
    }
    return eigenvalues
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
}

function find4x4Compositions () {
  Composition.find({ size: 4 }).sort({ base10Representation: 1 }).exec((err, compositions) => {
    if (err) {
      console.log(err)
      return
    }
    console.log('initilizing with %s compositions', compositions.length)
    // console.log(compositions)
    Compositions4x4 = compositions
  })
}

function find4x4FundamentalModes () {
  Graph.find({ size: 4 }).sort({ base10Representation: 1 }).exec((err, fundamentalModes) => {
    if (err) {
      console.log(err)
      return
    }
    console.log('initilizing with %s fundamental modes', fundamentalModes.length)
    FundamentalModes4x4 = fundamentalModes
  })
}

function find4Tuples () {
  Tuple.find({ size: 4}).exec((err, tuples) => {
    if (err) {
      console.log(err)
      return
    }
    console.log('initilizing with %s four tuples', tuples.length)
    Tuples4x4 = tuples
    // console.log(tuples)
  })
}

function find2Tuples () {
  Tuple.find({ size: 2}).exec((err, tuples) => {
    if (err) {
      console.log(err)
      return
    }
    console.log('initilizing with %s two tuples', tuples.length)
    Tuples2x2 = tuples
    // console.log(tuples)
  })
}

function find3Tuples () {
  Tuple.find({ size: 3}).exec((err, tuples) => {
    if (err) {
      console.log(err)
      return
    }
    console.log('initilizing with %s three tuples', tuples.length)
    Tuples3x3 = tuples
    // console.log(tuples)
  })
}

function findAllMorphs () {
  Morph.find().populate('bestExample').sort('size').exec((err, morphs) => {
    if (err) {
      console.log(err)
      return
    }
    console.log('initilizing with %s morphs', morphs.length)
    Morphs = morphs
    // console.log('Morphs', Morphs)
  })
}

/* Archive of functions used to develop this list */
/* eslint-disable */



function import16x16Graphs (compositionNumber) {
  let collisions = 0
  let tupleNumber = 0
  import16x16Graph(tupleNumber, compositionNumber)
  function import16x16Graph (tupleNumber, compositionNumber) {
    console.log('composting tuple number ' + tupleNumber + ' with compositionNumber ' + compositionNumber)
    console.log('%s tuples present to choose from', Tuples4x4.length)
    const tuple = Tuples4x4[tupleNumber]
    const composition = Compositions4x4[compositionNumber]
    if (!tuple) {
      console.log('tuple ' + tupleNumber + ' does not exist, exiting')
      return
    }
    const composedGraph = composition.compose(tuple)
    // console.log('composedMatrix', composedMatrix)
    composedGraph.save((err, after) => {
      if (err) {
        console.log(err)
        console.log('regarding tuple ', tuple)
        console.log('and composition ', composition)
        collisions++
        console.log('this is the %sth collision', collisions)
      }
      if (after) {
        console.log('afterSave', after.name)
      }
      
      tupleNumber++
      import16x16Graph(tupleNumber, compositionNumber)
    })
  }
}

function importAllFundamentalModes () {
  console.log('Graph Controller connected')
  const FundamentalModes = require('./fundamentalModes')
  for (let i = 0; i < FundamentalModes.length; i++) {
    const graph = new Graph({
      name: 'Fundamental Mode ' + i,
      booleanMatrix: FundamentalModes[i]
    })
    // console.log(graph)
    graph.save((err, savedGraph) => {
      if (err) console.log(err)
      console.log('saved graph' , savedGraph)
    })
  }
}