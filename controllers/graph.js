const FourTuples = require('./fourTuples')
const FundamentalModes = require('./fundamentalModes')
const Compositions = require('./compositions')
const Composition = require('../models/composition')
const Graph = require('../models/graph')


exports.afterConnectionTasks = function () {
 // anything we need to run once, like imports
//  importAllFundamentalModes()
  // importFirstFourCompositions()
}

exports.home = (req, res) => {
  return res.render('layout', { title: 'What is an adjacency graph?', view: 'home'})
}

exports.getComposingModes = (req, res) => {
  Composition.find({ size: 4 }).exec((err, compositions) => {
    if (err) {
      console.log(err)
      return res.render('layout', {view: 'error'}).status(404)
    }
    // console.log(compositions)
    return res.render('layout', { title: 'Composing Fundamental Modes', view: 'composingModes', compositions, Compositions })
  })
 
}

exports.getFourTuples = (req, res) => {
  return res.render('layout', { view: 'fourTuples', title: 'All Four-Tuples', FourTuples })
}

exports.getFundamentalModes = (req, res) => {
  Graph.find({ size: 4 }).sort({ base10Representation: 1 }).exec((err, fundamentalModes) => {
    if (err) {
      console.log(err)
      return res.render('layout', {view : 'error'}).status(404)
    }
    // console.log('fundamentalModes', fundamentalModes)
    return res.render('layout', { view: 'fundamentalModes', title: 'Fundamental Modes', fundamentalModes })
  })
}

exports.getFundamentalMode = (req, res) => {
  const number = req.params.number
  console.log('get fundamental mode ', number)
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
    const composition = new Composition({
      name: '4x4 Composition ' + i,
      numericMatrix: Compositions[i]
    })
    composition.save((err, compositionAfter) => {
      if (err) {
        console.log(err)
        return
      }
      console.log('done, compositionAfter', compositionAfter)
    })
  }
}