'use strict'
// const adjacencyGraph = require('./adjacencyGraph')
const cytoscapeVisualization = require('./cytoscapeVisualization')
const eventHorizon = require('./eventHorizon')
const morphsDataTable = require('./morphsDataTable')
const coherenceChart = require('./coherenceChart')
// const acousticModel = require('./acousticModel')

document.addEventListener('DOMContentLoaded', () => {
  console.log('Start')
  morphsDataTable.init()
  cytoscapeVisualization.init()
  eventHorizon.init()
  // acousticModel.init()
})