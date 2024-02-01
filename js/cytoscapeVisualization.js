const cytoscape = require('cytoscape')

function init() {
  console.log('started cytoscape visualization')
  // Array.from(document.getElementsByClassName('cytoscape-visualization')).forEach(create)
  Array.from(document.getElementsByClassName('matrix-svg-container')).forEach(prepare)
}

function prepare(el, i) {
  // console.log('matrix svg element', el)
  const matrix = JSON.parse(el.dataset.matrix)
  // console.log('matrix', matrix)
  const button = el.querySelector('button')
  if (!button) return
  // console.log('button', button)
  const container = el.querySelector('div.cytoscape-visualization')
  // console.log('container', container)
  const svg = el.querySelector('svg')
  button.onclick = function () {
    container.style.display = container.style.display === 'none' ? 'inline-block' : 'none'
    if (container.style.display === 'inline-block') {
      visualize(matrix, container)
      button.innerText = 'Show as Matrix'
    } else {
      container.innerHTML = ''
      button.innerText = 'Show as Wireframe'
    }
    svg.style.display = svg.style.display === 'none' ? 'inline-block' : 'none'
  }
}

function visualize (matrix, container) {
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
  // console.log('nodes', nodes)
  // console.log('connections', connections)
  cytoscape({
    container: container, // container to render in
    elements: nodes.concat(connections),
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