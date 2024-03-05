
const Composition = require('../models/composition')
const Graph = require('../models/graph')
const Tuple = require('../models/tuple')
const Morph = require('../models/morph')
const { composition } = require('mathjs')
var Compositions4x4 = []
var FundamentalModes4x4 = []
var Tuples4x4 = []
var Tuples2x2 = []
var Morphs = []

exports.afterConnectionTasks = function () {
  find4x4Compositions()
  find4x4FundamentalModes()
  find2Tuples()
  find4Tuples()
  findAllMorphs()

  setTimeout(function () {
    // import16x16Graphs(3)
    classifyNextUnclassifiedGraph()
    // importAllFundamentalModes()
    // create2x2Compositions()
    // importAllTwoTuples()
    // compose8x8Graphs()
  }, 1000)
  
  
  // updateExampleCount()
  // setInterval(classifyNextGraph, 500)
  
 // anything we need to run once, like imports

  // importFirstFourCompositions()
  // importAllFourTuples()
}

exports.home = (req, res) => {
  return res.render('layout', { title: 'What is an adjacency graph?', view: 'home', compositions: Compositions4x4, fundamentalModes: FundamentalModes4x4})
}

exports.getMorphs = (req, res) => {
  return res.render('layout', { title: 'What Morphs Exist', view: 'morphs', morphs: Morphs })
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
      console.log('classified')
      classifyNextUnclassifiedGraph()
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
  // console.log('Graph Controller connected')
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

function compose8x8Graphs () {
  let TwoByTwoComposition = {}
  let i = 0

  function createGraph () {
    const tuple = Tuples2x2[i]
    const newGraph = TwoByTwoComposition.compose(tuple)
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



  Composition.findOne({ size: 2}).exec((err, composition) => {
    if (err) {
      console.log(err)
      return
    }
    if (!composition) {
      console.log('no 2x2 composition found')
      return
    }
    TwoByTwoComposition = composition
    createGraph()
  })
}
