const FourTuples = require('./fourTuples')
const FundamentalModes = require('./fundamentalModes')
const Compositions = require('./compositions')

exports.home = (req, res) => {
  return res.render('layout', { title: 'What is an adjacency graph?', view: 'home' })
}

exports.getComposingModes = (req, res) => {
  return res.render('layout', { title: 'Composing Fundamental Modes', view: 'composingModes', Compositions, FundamentalModes })
}

exports.getFourTuples = (req, res) => {
  return res.render('layout', { view: 'fourTuples', title: 'All Four-Tuples', FourTuples })
}

exports.getFundamentalModes = (req, res) => {
  return res.render('layout', { view: 'fundamentalModes', title: 'Fundamental Modes', FundamentalModes })
}

exports.getFourthComposition = (req, res) => {
  const compositionNumber = req.params.compositionNumber
  const modeNumber = req.params.modeNumber
  console.log(`Composed C4,${compositionNumber}(${modeNumber})`)
  const composition = Compositions[compositionNumber]
  const mode = FundamentalModes[modeNumber]


  return res.status(200).send()
}

// exports.getGraph = (req, res) => {
//   const name = req.query.name || req.params.name
//   const graph = new Graph({ name: name })
//   return res.render('layout', { title: '', view: 'graph', graph })
// }

// exports.newGraph = (req, res) => {
//   const graph = new Graph({ name: '0,0,0,0,0,0,0,0,0,0,0,0', notes: '' })
//   return res.render('layout', { title: 'New Graph', view: 'graph', graph })
// }

// exports.saveGraph = (req, res) => {
//   // console.log('req.body', req.body)
//   if (typeof req.body.name != 'string' || req.body.name.length === 0) return
//   const name = req.body.name.trim()
//   const graph = new Graph({
//     name
//   })
//   console.log(graph)
//   graph.save((err, savedGraph) => {
//     if (err) {
//       console.log(err)
//       return res.render('layout', {view: 'error', error: err })
//     }
//     return res.render('layout', {view: 'home', title: 'Saved Graph ' + name})
//   })
// }

// exports.getAllGraphs = (req, res) => {
//   Graph.find().exec((err, graphs) => {
//     if (err) {
//       return res.render('layout', {view: 'error', error: err.msg })
//     }
//     // console.log('allGraphs', graphs)
//     return res.render('layout', { view: 'allGraphs', title:'All Graphs', graphs})
//   })
// }

// exports.getGraphFromSubstring = (req, res) => {
//   if (typeof req.body.name != 'string' || req.body.name.length === 0) return
//   Graph.find({ name: { $regex: req.body.name }}).exec((err, graphs) => {
//     if (err) {
//       return res.render('layout', {view: 'error', error: err.msg })
//     }
//     // console.log('allGraphs', graphs)
//     return res.render('layout', { view: 'allGraphs', title:'Graphs including substring ' + req.body.name, graphs})
//   })
// }