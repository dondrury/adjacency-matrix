'use strict'
// const adjacencyGraph = require('./adjacencyGraph')
const cytoscapeVisualization = require('./cytoscapeVisualization')
const morphsDataTable = require('./morphsDataTable')
document.addEventListener('DOMContentLoaded', () => {
  console.log('Start')
  morphsDataTable.init()
  cytoscapeVisualization.init()
})