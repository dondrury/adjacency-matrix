const cytoscape = require('cytoscape')

function init() {
  console.log('started cytoscape visualization')
  Array.from(document.getElementsByClassName('cytoscape-visualization')).forEach(create)
}

function create(el, i) {
  console.log('visualizing from elememt', el)
  const matrix = JSON.parse(el.dataset.matrix)
  console.log('matrix', matrix)
  el.style.width = '600px'
  el.style.height = '600px'
  el.style.border = '2px solid black'
  const nodes = []
  for ( let i = 0; i < matrix.length; i++) {
    nodes.push({
      data: { id: i.toString() }
    })
  }
  const connections = []
  for (let i = 0; i < matrix.length; i++) {  // i is for rows
    for (let j = 0; j < matrix[i].length; j++) { // j is for columns
      if ( j > i && matrix[i][j]) { // above the diagonal, and "true"
        connections.push({
          data: {
            id: i + ',' + j,
            source: i.toString(),
            target: j.toString()
          }
        })
      }
    }
  }
  console.log('nodes', nodes)
  console.log('connections', connections)
  var cy = cytoscape({
    container: el, // container to render in
    elements: nodes.concat(connections),
    // elements: [ // list of graph elements to start with
    //   { // node a
    //     data: { id: 'a' }
    //   },
    //   { // node b
    //     data: { id: 'b' }
    //   },
    //   { // node a
    //     data: { id: 'c' }
    //   },
    //   { // node b
    //     data: { id: 'd' }
    //   },
    //   { // edge ab
    //     data: { id: 'ab', source: 'a', target: 'b' }
    //   },
    //   { // edge ab
    //     data: { id: 'bc', source: 'b', target: 'c' }
    //   },
    //   { // edge ab
    //     data: { id: 'ca', source: 'c', target: 'a' }
    //   }
    // ],
    style: [ // the stylesheet for the graph
      {
        selector: 'node',
        style: {
          'background-color': '#666',
          'label': 'data(id)'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 3,
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'none',
          'curve-style': 'bezier'
        }
      }
    ],
    layout: {
      name: 'cose',
      // rows: 1
    }
  })
}

exports.init = init