const cytoscape = require('cytoscape')

function init() {
  console.log('started cytoscape visualization')
  // Array.from(document.getElementsByClassName('cytoscape-visualization')).forEach(create)
  Array.from(document.getElementsByClassName('graph-container')).forEach(prepare)
}

function prepare(el, i) {
  const matrix = JSON.parse(el.dataset.matrix)
  const button = el.querySelector('button')
  if (!button) return
  const container = el.querySelector('div.cytoscape-visualization')
  // const svg = el.querySelector('svg')
  button.onclick = function () {
    const cy = visualize(matrix, container)
    container.style.display = 'block'
    if (window.location.pathname.indexOf('/morphs/edit/') !== -1) {
      const saveButtonEl = el.querySelector('button[name="saveImage"]')
      saveButtonEl.style.display = 'block'
      cy.on('render', function() {
        const imageSrc = cy.png({ full: true, maxWidth: 300, maxHeight: 300 })
        // console.log('imageSrc', imageSrc)
        el.querySelector('input[name="imageSrc"]').value = imageSrc
        console.log('wireframe rendered and image loaded into form')
      })
      
    }
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
  return cytoscape({
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