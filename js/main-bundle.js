'use strict'
// const adjacencyGraph = require('./adjacencyGraph')
const cytoscapeVisualization = require('./cytoscapeVisualization')
const spectralGraph = require('./spectralGraph')
document.addEventListener('DOMContentLoaded', () => {
  console.log('Start')
  spectralGraph.init()
  cytoscapeVisualization.init()
})