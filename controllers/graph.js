const FourTuples = require('./fourTuples')
const Composition = require('../models/composition')
const Graph = require('../models/graph')
const Tuple = require('../models/tuple')
var Compositions4x4 = []
var FundamentalModes4x4 = []
var Tuples4x4 = []


exports.afterConnectionTasks = function () {
  find4x4Compositions()
  find4x4FundamentalModes()
 // anything we need to run once, like imports
//  importAllFundamentalModes()
  // importFirstFourCompositions()
  // importAllFourTuples()
}

exports.home = (req, res) => {
  return res.render('layout', { title: 'What is an adjacency graph?', view: 'home', compositions: Compositions4x4, fundamentalModes: FundamentalModes4x4})
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
  return res.render('layout', { view: 'fourTuples', title: 'All Four-Tuples', FourTuples })
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

exports.getFourByFourComposition = (req, res) => {
  const compositionNumber = req.params.compositionNumber
  const fourTupleNumber = req.params.fourTupleNumber
  console.log(`Composed C4,${compositionNumber}(${fourTupleNumber})`)
  const Composition = Compositions[compositionNumber]
  const Tuple = FourTuples[fourTupleNumber]
  const composedMatrix = composeTuple(Composition, Tuple)
  // console.log('composedMatrix', composedMatrix)
  return res.render('layout', { view: 'fourByFourComposition', title: 'Fundamental Modes', composedMatrix, Composition, Tuple, compositionNumber, fourTupleNumber, FundamentalModes })
}

function composeTuple (composition, tuple) {
  const composed = []
  for (let i = 0; i < composition.length; i++) {
    const row = []
    for (let j = 0; j < composition[i].length; j++) {
      if (composition[i][j] === false) {
        row.push(FundamentalModes[0])
        // console.log('composed mode 0', FundamentalModes[0])
      } else {
        const indexOfTriple = composition[i][j]
        const modeNumber = tuple[indexOfTriple]
        // console.log('composed mode ' + modeNumber, FundamentalModes[modeNumber])
        row.push(FundamentalModes[modeNumber])
      }
    }
    composed.push(row)
  }
  return flattenNestedMatrix(composed)
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

/* Archive of functions used to develop this list */
/* eslint-disable */
function importAllFundamentalModes () {
  // console.log('Graph Controller connected')
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

function find4x4Compositions () {
  Composition.find({ size: 4 }).sort({ base10Representation: 1 }).exec((err, compositions) => {
    if (err) {
      console.log(err)
      return
    }
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
    // console.log('fundamentalModes', fundamentalModes)
    FundamentalModes4x4 = fundamentalModes
  })
}