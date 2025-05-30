'use strict'
// const adjacencyGraph = require('./adjacencyGraph')
const cytoscapeVisualization = require('./cytoscapeVisualization')
const eventHorizon = require('./eventHorizon')
const morphsDataTable = require('./morphsDataTable')

document.addEventListener('DOMContentLoaded', () => {
  console.log('Start')
  morphsDataTable.init()
  cytoscapeVisualization.init()
  eventHorizon.init()
})