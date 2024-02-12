const FourTuples = require('./fourTuples')
const Composition = require('../models/composition')
const Graph = require('../models/graph')
const Tuple = require('../models/tuple')
const Morph = require('../models/morph')
var Compositions4x4 = []
var FundamentalModes4x4 = []
var Tuples4x4 = []
var Morphs = []

exports.afterConnectionTasks = function () {
  find4x4Compositions()
  find4x4FundamentalModes()
  find4Tuples()
  findAllMorphs()
  // updateExampleCount()
  // setInterval(updateExampleCount, 1000)
  // classifyNextGraph()
  // setInterval(classifyNextGraph, 500)
  // setTimeout(import16x16Graphs, 1000)
 // anything we need to run once, like imports
//  importAllFundamentalModes()
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

exports.getComposeFundamentalModes = (req, res) => {
  const tupleId = req.params.tupleId
  const compositionId = req.params.compositionId
  Tuple.findById(tupleId).exec((err, tuple) => {
    if (err) {
      console.log(err)
      return res.render('layout', {view : 'error'}).status(404)
    }
    if (!tuple) {
      // console.log('missing tuple')
      return res.render('layout', {view : 'error'}).status(404)
    }
    
    // console.log('using tuple', tuple)
    Composition.findById(compositionId).exec((err, composition) => {
      if (err) {
        console.log(err)
        return res.render('layout', {view : 'error'}).status(404)
      }
      if (!composition) {
        console.log('missing composition')
        return res.render('layout', {view : 'error'}).status(404)
      }
      // console.log('using composition', composition)
      const composedMatrix = composeFundamentalModes(composition, tuple)
      console.log('composedMatrix', composedMatrix)
      return res.render('layout', { view: 'graph', title: 'A Composition', graph: composedMatrix, width: 400 })
    })
  })
}

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

/* initialization functions */

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
    FundamentalModes4x4 = fundamentalModes
  })
}

function find4Tuples () {
  Tuple.find({ size: 4}).exec((err, tuples) => {
    if (err) {
      console.log(err)
      return
    }
    Tuples4x4 = tuples
    // console.log(tuples)
  })
}

function findAllMorphs () {
  Morph.find().populate('example').exec((err, morphs) => {
    if (err) {
      console.log(err)
      return
    }
    // morphs = morphs.map(m => {
    //   const ob = m.toObject()
    //   ob.examples = ob.examples.length
    //   return ob
    // })
    Morphs = morphs
    // console.log('Morphs', Morphs)
  })
}

/* Archive of functions used to develop this list */
/* eslint-disable */

function updateExampleCount () {
  Morph.findOne({ exampleCount: { $exists: false }}).exec((err, morph) => {
    if (err) {
      console.log(err)
      return
    }
    if (!morph) {
      console.log('all morphs updated')
      return
    }
    console.log(morph.examples)
    morph.exampleCount = morph.examples.length
    morph.example = morph.examples[0]
    morph.examples = []
    morph.save((err, updatedMorph) => {
      if (err) {
        console.log(err)
        return
      }
      console.log('morph updated', updatedMorph)
    })
  })
}
function classifyNextGraph () {
  Graph.findOne({ morphIdentified: {$exists: false }}).exec((err, graph) => {
    if (err) {
      console.log(err)
      return
    }
    if (!graph) {
      console.log('end of graphs, all classified')
      process.exit()
    }
    console.log('found graph with polynomial ' + graph.characteristicPolynomialString)
    Morph.findOne({ characteristicPolynomialString: graph.characteristicPolynomialString }).exec((err, existingMorph) => {
      if (err) {
        console.log(err)
        return
      }
      if (!existingMorph) {
        const newMorph = new Morph({
          name: '',
          size: graph.size,
          characteristicPolynomial: graph.characteristicPolynomial,
          characteristicPolynomialString: graph.characteristicPolynomialString,
          characteristicPolynomialHtml: graph.characteristicPolynomialHtml,
          approximateEigenvalues: graph.approximateEigenvalues,
          examples: [graph._id],
          notes: ''
        })
        newMorph.save((err, savedNewMorph) => {
          if (err) {
            console.log(err)
            return
          }
          console.log('new morph', savedNewMorph)
          graph.morphIdentified = savedNewMorph._id
          graph.save((err) => console.log)
        })
      } else {
        existingMorph.examples.push(graph._id)
        existingMorph.save((err, updatedMorph) => {
          if (err) {
            console.log(err)
            return
          }
          console.log('updated morph', updatedMorph)
          graph.morphIdentified = updatedMorph._id
          graph.save((err) => console.log)
        })
      }
    })
    
  })
}

function import16x16Graphs () {
  let compositionNumber = 3
  let tupleNumber = 0
  import16x16Graph(tupleNumber, compositionNumber)
  function import16x16Graph (tupleNumber, compositionNumber) {
    console.log('composting tuple number ' + tupleNumber + ' with compositionNumber ' + compositionNumber)
    const tuple = Tuples4x4[tupleNumber]
    const composition = Compositions4x4[compositionNumber]
    const composedGraph = composeFundamentalModes(composition, tuple)
    // console.log('composedMatrix', composedMatrix)
    composedGraph.save((err, after) => {
      if (err) console.log(err)
      console.log('afterSave', after)
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
