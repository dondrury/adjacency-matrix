
const Composition = require('../models/composition')
const Graph = require('../models/graph')
const Tuple = require('../models/tuple')
const Morph = require('../models/morph')
const { composition } = require('mathjs')
var Compositions4x4 = []
var FundamentalModes4x4 = []
var Tuples4x4 = []
var Tuples2x2 = []
var Tuples3x3 = []
var Morphs = []

exports.afterConnectionTasks = function () {
  find4x4Compositions()
  find4x4FundamentalModes()
  // find2Tuples()
  // find3Tuples()
  // find4Tuples()
  findAllMorphs()
  // rankAllPossibleRowsOfSize(8)
  setTimeout(function () {
    findAllGraphsOfSizeAndRank(6, 2)
  //  createFundamentalModes(6, 1104317344) // last stopped at 1104317344

    // importAllTwoTuples()
    // importAllThreeTuples()
    // importAllFourTuples()
   
    // importAllFundamentalModes()
    
    // create2x2Compositions()
    // create3x3Compositions()
    // importFirstFourCompositions()

    // compose8x8Graphs()
    // compose12x12Graphs()
    // import16x16Graphs(0)
    // import16x16Graphs(1)
    // import16x16Graphs(2)
    // import16x16Graphs(3)

    // exhaustiveSearch(6, 10367) // this is for symmetrical graphs only
    // const graph = new Graph({ size: 10 })
    // console.log('graph', graph)
    // const graphAfter = graph.createWithBinaryRepresentation('0001011010011001111100100000')
    // console.log('graphAfter', graphAfter)
    classifyNextUnclassifiedGraph()
  
    
    
   
  }, 1000)
}


exports.home = (req, res) => {
  return res.render('layout', { title: 'What is an adjacency graph?', view: 'home', compositions: Compositions4x4, fundamentalModes: FundamentalModes4x4})
}

exports.getAllSpaces = (req, res) => {
  return res.render('layout', { title: 'What Morphs Exist', view: 'spaces', morphs: Morphs })
}

exports.getMorphs = (req, res) => { // /morph/size/:size/rank/:rank
  const size = Number(req.params.size)
  const rank = Number(req.params.rank)
  // console.log(size, rank)
  Morph.find({size, rank}).populate('bestExample').sort('size').exec((err, morphs) => {
    if (err) {
      console.log(err)
      return
    }
    Graph.count({size, rank}).exec((err, counted) => {
      if (err) {
        console.log(err)
        return
      }
      return res.render('layout', { title: 'What Morphs Exist', view: 'morphs', morphs, size, rank, graphsInSpace: counted })
    })
    
  })
}

exports.postEditMorph = (req, res) => {
  const id = req.params.id
  Morph.findById(id).populate('bestExample').exec((err, morph) => {
    if (err) {
      console.log(err)
      return
    }
    morph.name = req.body.name
    morph.save((err, morphAfter) => {
      return res.redirect('/morphs/edit/' + id)
    })
  })
}

exports.postEditSaveImageMorph = (req, res) => {
  const id = req.params.id
  Morph.findById(id).populate('bestExample').exec((err, morph) => {
    if (err) {
      console.log(err)
      return
    }
    morph.image = req.body.imageSrc
    morph.save((err, morphAfter) => {
      return res.redirect('/morphs/edit/' + id)
    })
  })
}

exports.getGraph = (req, res) => {
  const id = req.params.id
  Graph.findById(id).exec((err, graph) => {
    if (err) {
      console.log(err)
      return
    }
    return res.render('layout', { title: 'Graph ' + graph.name, view: 'graph', graph, width: 300 })
  })
}

exports.getGraphLineage = (req, res) => {
  const id = req.params.id
  Graph.findById(id)
    .populate('phylogeny.composition')
    .populate('morphIdentified')
  .exec((err, graph) => {
    if (err) {
      console.log(err)
      return
    }
    const tuple = graph.phylogeny.tuple
    // console.log(tuple)
    Graph.find({ _id: tuple}).populate('morphIdentified').exec((err, tupleContents) => {
      if (err) {
        console.log(err)
        return
      }
      // console.log(tupleContents)
      graph.phylogeny.tuple = tupleContents
      // console.log(graph.phylogeny.tuple[0])
      return res.render('layout', { title: 'Graph ' + graph.name, view: 'graphLineage', graph })
    })
    
    
  })
}

exports.getEditMorph = (req, res) => {
  const id = req.params.id
  Morph.findById(id).populate('bestExample').exec((err, morph) => {
    if (err) {
      console.log(err)
      return
    }
    // console.log(morph)
    Graph.find({ morphIdentified: id }).select('name').exec((err, graphs) => {
      if (err) {
        console.log(err)
        return
      }
      // console.log(graphs)
      return res.render('layout', { title: 'Morph ' + id, view: 'editMorph', morph, graphs })
    })
  })
  
}

exports.getComposingModes = (req, res) => {
  // console.log({ compositions: Compositions4x4})
  return res.render('layout', { title: 'Composing Fundamental Modes', view: 'composingModes', compositions: Compositions4x4 })
}

exports.getComposition = (req, res) => {
  Composition.findById(req.params.id).exec((err, composition) => {
    if (err) {
      console.log(err)
      return res.render('layout', {view : 'error'}).status(404)
    }
    return res.render('layout', { title: composition.name, view: 'composition', composition})
  })
}

exports.getFourTuples = (req, res) => {
  return res.render('layout', { view: 'fourTuples', title: 'All Four-Tuples', tuples: Tuples4x4, compositions: Compositions4x4 })
}

exports.getFundamentalModes = (req, res) => {
  return res.render('layout', { view: 'fundamentalModes', title: 'Fundamental Modes', fundamentalModes: FundamentalModes4x4 })
}

exports.getFundamentalMode = (req, res) => {
  const number = req.params.number
  // console.log('get fundamental mode ', number)
  Graph.findOne({ base10Representation: number}).exec((err, fundamentalMode) => {
    if (err) {
      console.log(err)
      return res.render('layout', {view : 'error'}).status(404)
    }
    // console.log('fundamentalModes', fundamentalModes)
    return res.render('layout', { view: 'fundamentalMode', title: 'Fundamental Mode ' + number, fundamentalMode })
  })
}

/* initialization functions */

function classifyNextUnclassifiedGraph () {
  Graph.findOne({ morphIdentified: {$exists: false } }).exec((err, unclassifiedGraph) => {
    if (err) {
      console.log(err)
      return
    }
    if (!unclassifiedGraph) {
      console.log('all graphs classified, stopping search')
      return
    }
    unclassifiedGraph.classify(() => {
      console.log('classified' )
      setTimeout(classifyNextUnclassifiedGraph, 0)
      // classifyNextUnclassifiedGraph()
    })
  })
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

function exhaustiveSearch (n, i = 0) { // this is for symmetrical graphs only
  const binaryArrayLength = (n * (n - 1)) / 2
  const exitNumber = Math.pow(2, binaryArrayLength)
  const RelationsRequired = ( 3 * n ) / 2
  createAndTestGraph()
  function createAndTestGraph () {
    const binaryString = i.toString(2).padStart(binaryArrayLength, '0')
    // console.log('binaryString', binaryString)
    let binaryArray = binaryString.split('')
    let relationCount = 0
    binaryArray.forEach(function (el) {
      if (el === '1') relationCount++
    })
    if (relationCount === RelationsRequired) {
      console.log('found one at i=', i, 100 * i / exitNumber, 'percent finished')
      let matrix = []
      for (let j = 0; j < n; j++) {
        let rowArray = (new Array(j + 1).fill(false))
        for (let k = 0; j + k < n - 1; k++) {
          rowArray.push(binaryArray.pop() === '1')
        }
        matrix.push(rowArray)
      }
      // console.log(matrix) // matrix created, upper right only
      for (let j = 0; j < n; j++ ) {
        for (let k = j; k < n; k++) {
          matrix[k][j] = matrix[j][k]
        }
      }
      // console.log('matrix after')
      // console.log(matrix)
      const newGraph = new Graph({
        name: 'exhaustive search #' + i,
        booleanMatrix: matrix,
        binaryString
      })
      newGraph.save((err, graph) => {
        if (err) {
          console.log(err)
        }
        if (graph) {
          console.log(graph)
        }
      })
    }
    i++
    if (i < exitNumber) setTimeout(createAndTestGraph, 0)
  }

}

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

function rankAllPossibleRowsOfSize(size) {
  // console.log('generatingAllPossibleRowsOfSizeAndRank', { size })
  const allPossibleRowsByRank = {}
  for (let i = 0; i <= size; i++ ) {
    allPossibleRowsByRank[i] = []
  }
  for (i = 0; i < Math.pow(2, size); i++) {
    const binaryString = i.toString(2).padStart(size, '0')
    // console.log('binaryString ' + binaryString)
    const binaryArray = binaryString.split('')
    let onesCount = 0
    binaryArray.forEach(function (el) {
      if (el === '1') onesCount++
    })
    // console.log({binaryString, onesCount})
    allPossibleRowsByRank[onesCount].push(binaryString)
  }
  // console.log(allPossibleRowsByRank)
  return allPossibleRowsByRank
}

function findAllGraphsOfSizeAndRank (size, rank) {
  /* Error 8-6-24 needs sorted
  { binaryString: '001100001100001100001100001100001100' } inconsistent rank
  { binaryString: '000101000011000011000011000011000011000011' } Error: matrix is not square
  */
  const allPossibleRowsByRank = rankAllPossibleRowsOfSize(size)
  const allPossibleRows = allPossibleRowsByRank[rank]
  console.log('findAllModesOfRankAndSize', { allPossibleRows, size, rank })
  const iteratingArray = (new Array(size)).fill(0)
  // const exitCondition = (new Array(size)).fill(allPossibleRows.length)
  // console.log({iteratingArray})
  constructBinaryStringsRecursively()

  function constructBinaryStringsRecursively() {
    let binaryString = ''
    iteratingArray.forEach(v => {
      binaryString += allPossibleRows[v]
    }) // getting matrix not square
    console.log({iteratingArray, binaryString})
    const graph = new Graph({
      name: 'Created by Iterating on Possible Rows',
      binaryString
    })
    graph.createFromBinaryString(binaryString)
    graph.save((err, savedGraph) => {
      if (err) console.log({binaryString}, err)
      if (savedGraph) console.log('saved graph' , savedGraph)
      // here we need to "iterate" the array of indexes, and start the recursion again
      iterateArrayAndKeepGoing()
    })
  }

  function iterateArrayAndKeepGoing () {
    console.log('before', {iteratingArray})
    for (let i = 0; i < iteratingArray.length; i++) {
      if (iteratingArray[i] === allPossibleRows.length - 1) {
        if (i === iteratingArray.length - 1 ) { // exit condition
           console.log('exit on', {iteratingArray})
           return
        }
        iteratingArray[i + 1]++ // then all before have to also zero

        console.log('after if (iteratingArray[i] >= allPossibleRows.length - 1)', {iteratingArray})
        setTimeout(constructBinaryStringsRecursively, 1000)
        return
      } else {
        iteratingArray[i]++
        console.log('after else', {iteratingArray})
        setTimeout(constructBinaryStringsRecursively, 1000)
        return
      }
    }
  }

}

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
