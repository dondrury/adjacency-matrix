'use strict'
// const adjacencyGraph = require('./adjacencyGraph')
const cytoscapeVisualization = require('./cytoscapeVisualization')
const stateSpace3DModel = require('./stateSpace3DModel')
const morphsDataTable = require('./morphsDataTable')

document.addEventListener('DOMContentLoaded', () => {
  console.log('Start')
  morphsDataTable.init()
  cytoscapeVisualization.init()
  stateSpace3DModel.init()
})