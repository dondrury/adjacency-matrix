
const Composition = require('../models/composition')
const Graph = require('../models/graph')
const _ = require('lodash')
// const Tuple = require('../models/tuple')
// const Morph = require('../models/morph')
// const { composition } = require('mathjs')
// const { count } = require('../models/morph')
// const eigs = require('mathjs').eigs


exports.afterConnectionTasks = function () {
  setTimeout(function () {
    console.log('graph controller after connection tasks')
    // findAllGraphsOfSizeAndRank(6, 4) // let's try to do this by inverting down from existing
    // symmetricalGraphSearch(6, 10367) // this is for symmetrical graphs only
    classifyNextUnclassifiedGraph()
    // processNextUnprocessedMorph()
    // Graph.findOne({ size: 4, rank: 3 }).then(function (graph) {
    //   // const searchOutput = graph.depthFirstSearchForClosedPaths()
    //   // const searchOutput = graph.breadthFirstSearchForClosedPaths()
    //   const allLightPaths = graph.findAllClosedPaths(0,6)
    //   console.log({allLightPaths})
    // }) // this does work, but isn't minimal
  }, 1000)
}

// function createLongestWalk (graph) { // lets not pass over a node already visited
//   const orderedPairs = _.clone(graph.relationArray)
//   console.log(graph)
//   const initalPair = orderedPairs.shift()
//   console.log(initalPair)
//   const walk = {
//     nodesVisited: [initalPair[0]],
//     relation: [initalPair]
//   }
//   console.log(walk)

//   function takeNextStep () {

//   }

// }

// function colorGraph (graph) { // via relations array
//   const orderedPairs = _.clone(graph.relationArray)
//   const colors = {}
//   console.log(graph)
//   createAndCompleteColor()

//   function createAndCompleteColor () {
//     console.log('orderedPairs', orderedPairs)
//     console.log('colors', colors)
//     if (orderedPairs.length === 0) return // escape condition no ordered pairs left
//     const colorNumber = Object.keys(colors).length
//     colors[colorNumber] = []
//     colors[colorNumber].push(orderedPairs.shift())
//     completeNextColorStep()
   
//     function completeNextColorStep () {
//       const firstPair = colors[colorNumber][0]
//       const lastPair = colors[colorNumber][colors[colorNumber].length - 1]
//       console.log('startingElement of sequential relation',firstPair[0])
//       console.log('endingElement of sequential relation', lastPair[1])
//       if (firstPair[0] === lastPair[1]) { // we've finished a cycle, this is the escape condition fo a cycle
//         console.log('A color-walk has been completed')
//         return 
//       }
//       colorWalk: for (let i = 0; i < orderedPairs.length; i++) {
//         const testPair = orderedPairs[i]
//         if (testPair[0] === lastPair[1]) { //we have a match for the next step
//           colors[colorNumber].push(orderedPairs.splice(i, 1)[0])
//           console.log('orderedPairs', orderedPairs)
//           console.log('colors', colors)
//           completeNextColorStep()
//           break colorWalk
//         }
//         if (i === orderedPairs.length - 1) throw new Error('An color-walk failed to terminate')
//       }
//     }
//    // now that we've completed a color-walk,
//     createAndCompleteColor()
//   }
 
// }




exports.getGraph = (req, res) => {
  const id = req.params.id
  Graph.findById(id).exec((err, graph) => {
    if (err) {
      console.log(err)
      return
    }
    // console.log(graph.allLightPaths)

    return res.render('layout', { title: 'Graph ' + graph.name, view: 'graph', graph, width: 300 })
  })
}

exports.getGraphSurvey = (req, res) => {
  const id = req.params.id
  Graph.findById(id)
    // .populate('phylogeny.composition')
    .populate('morphIdentified')
    .exec((err, graph) => {
      if (err) {
        console.log(err)
        return
      }
      const uniqueClosedPaths = graph.getHistogramOfClosedPaths()
      // const uniqueClosdedPaths = graph.findAllUniqueClosedPathsStartingAt(1)
      const powerSeries = graph.createPowerSeries({
        // normalize: true,
        // iterations: 20
      })
         
      // console.log('powerSeries', powerSeries)
      return res.render('layout', { title: 'Graph ' + graph.name, view: 'graphSurvey', graph, powerSeries })
    })
}

exports.getGraphEventHorizon = (req, res) => {
  const id = req.params.id
  Graph.findById(id)
    // .populate('phylogeny.composition')
    .populate('morphIdentified')
    .exec((err, graph) => {
      if (err) {
        console.log(err)
        return
      }
      return res.render('layout', { title: 'Event Horizon View of ' + graph.name, view: 'eventHorizon', graph, width: 700 })
    })
}

// exports.getComposingModes = (req, res) => {
//   // console.log({ compositions: Compositions4x4})
//   return res.render('layout', { title: 'Composing Fundamental Modes', view: 'composingModes', compositions: Compositions4x4 })
// }

exports.getComposition = (req, res) => {
  Composition.findById(req.params.id).exec((err, composition) => {
    if (err) {
      console.log(err)
      return res.render('layout', {view : 'error'}).status(404)
    }
    return res.render('layout', { title: composition.name, view: 'composition', composition})
  })
}

// exports.getFourTuples = (req, res) => {
//   return res.render('layout', { view: 'fourTuples', title: 'All Four-Tuples', tuples: Tuples4x4, compositions: Compositions4x4 })
// }

// exports.getFundamentalModes = (req, res) => {
//   return res.render('layout', { view: 'fundamentalModes', title: 'Fundamental Modes', fundamentalModes: FundamentalModes4x4 })
// }

// exports.getFundamentalMode = (req, res) => {
//   const number = req.params.number
//   // console.log('get fundamental mode ', number)
//   Graph.findOne({ base10Representation: number}).exec((err, fundamentalMode) => {
//     if (err) {
//       console.log(err)
//       return res.render('layout', {view : 'error'}).status(404)
//     }
//     // console.log('fundamentalModes', fundamentalModes)
//     return res.render('layout', { view: 'fundamentalMode', title: 'Fundamental Mode ' + number, fundamentalMode })
//   })
// }

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

function rankAllPossibleRowsOfSize(size) {
  // console.log('generatingAllPossibleRowsOfSizeAndRank', { size })
  const allPossibleRowsByRank = {}
  for (let i = 0; i <= size; i++ ) {
    allPossibleRowsByRank[i] = []
  }
  for (let i = 0; i < Math.pow(2, size); i++) {
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

function findAllGraphsOfSizeAndRank (size, rank, i = 0) {
  const allPossibleRowsByRank = rankAllPossibleRowsOfSize(size)
  const allPossibleRows = allPossibleRowsByRank[rank]
  console.log('findAllGraphsOfSizeAndRank', { allPossibleRows, size, rank })
  // maybe try constructing from rows directly, instead of starting with the binaryString
  // okay we need to iterate a counting in base (allPossibleRows.length) accross an array like this
  // [0, 0, 0, 14, 12, 3]
  const exitValue = Math.pow(allPossibleRows.length, size)
  console.log({exitValue})
  // let i = 0
  createMatrixIterativelyFromAllPossibleRows()

  function createMatrixIterativelyFromAllPossibleRows () {
    if (i === exitValue) {
      console.log('createMatrixIterativelyFromAllPossibleRows finished at ' + exitValue)
      return
    }
    const sourceBase = 10
    const iteratorDigits = i.toString(sourceBase).split('').map(n => Number(n))
    const destinationBase = allPossibleRows.length
    const newBaseDigits = baseConvertBigInt(iteratorDigits, sourceBase, destinationBase)
    const prependArrayOfZeroes = (new Array(size - newBaseDigits.length)).fill(0)
    const arrayOfRowIndexes = prependArrayOfZeroes.concat(newBaseDigits) // now it's the correct length
    // console.log({iteratorDigits, sourceBase, destinationBase, newBaseDigits, prependArrayOfZeroes, arrayOfRowIndexes})
    let binaryString = ''
    const booleanMatrix = arrayOfRowIndexes.map(rowIndex => {
      const rowAsString = allPossibleRows[rowIndex]
      binaryString += rowAsString
      const rowAsBooleanArray = rowAsString.split('').map(character => character === '1')
      return rowAsBooleanArray
    })
    // console.log({binaryString, booleanMatrix})
    console.log(`Total progress in this space = ${100 * i / exitValue}%\ni=${i} (${binaryString})\nis a candidate for consistent rank, calculating...`)
    const graph = new Graph({
      name: 'Iteratively by Possible Rows ' + i,
      binaryString,
      booleanMatrix
    })
    graph.save((err, savedGraph) => {
      if (err) console.log(err)
      if (savedGraph) console.log('saved graph' , savedGraph)
      
      i++
      setTimeout(createMatrixIterativelyFromAllPossibleRows, 0)
    })
  }
}


function baseConvertBigInt(digits, srcb, destb){
  // https://gist.github.com/antimatter15/2bf0fcf5b924b4387174d5f84f35277c
  // arbitrary base conversion function
  // By Kevin Kwok (antimatter15@gmail.com)
  // Released under MIT License in 2021 
  let val = 0n
  srcb = BigInt(srcb)
  destb = BigInt(destb)
  for(let i = 0; i < digits.length; i++){
      val = val * srcb + BigInt(digits[i])
  }
  let res = []
  while(val !== 0n){
      res.unshift(Number(val % destb))
      val = val / destb
  }
  return res
}

function symmetricalGraphSearch (n, i = 0) { // this is for symmetrical graphs only
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

