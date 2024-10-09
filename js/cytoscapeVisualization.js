const cytoscape = require('cytoscape')

function init() {
  console.log('started cytoscape visualization')
  // Array.from(document.getElementsByClassName('cytoscape-visualization')).forEach(create)
  Array.from(document.getElementsByClassName('graph-container')).forEach(prepare)
}

function prepare(el, i) {
  const matrix = JSON.parse(el.dataset.matrix)
  const colored = el.dataset.colored === 'true'
  console.log('colored', el.dataset.colored)
  const button = el.querySelector('button')
  if (!button) return
  const container = el.querySelector('div.cytoscape-visualization')
  // const svg = el.querySelector('svg')
  button.onclick = function () {
    const cy = visualize(matrix, container, colored)
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

function visualize (matrix, container, colored) {

  const halfLength = Math.floor(matrix.length / 2)
  function elementNumbering (k) {
    if (k >= halfLength) {
      return k - halfLength + 1
    } else {
      return k - halfLength
    }
  }

  function gender (k) {
    return Math.sign(elementNumbering(k)) === -1 ? 'M' : 'F'
  }

  const nodes = []
  for ( let i = 0; i < matrix.length; i++) {
    nodes.push({
      data: { 
        id: elementNumbering(i).toString(),
        gender: gender(i)
      }
    })
  }
  
  const connections = []
  for (let i = 0; i < matrix.length; i++) {  // i is for rows
    for (let j = 0; j < matrix[i].length; j++) { // j is for columns
      if (matrix[i][j] && matrix[j][i]) { // symmetrical, "undirected edge"
        const x = elementNumbering(Math.min(i, j))
        const y = elementNumbering(Math.max(i, j)) // y > x
        connections.push({
          data: {
            id: x + '<=>' + y,
            source: x.toString(),
            target: y.toString(),
            directed: false
          }
        })
      } else if (matrix[i][j]) { // "directed edge"
        const x = elementNumbering(i)
        const y = elementNumbering(j)
        connections.push({
          data: {
            id: x + '=>' + y,
            source: x.toString(),
            target: y.toString(),
            directed: true,
            color: gender(i)
          }
        })
      }
    }
  }
  console.log('nodes', nodes)
  console.log('connections', connections)
  return cytoscape({
    container: container, // container to render in
    elements: nodes.concat(connections),
    style: [ // the stylesheet for the graph
      {
        selector: 'node',
        style: {
          'background-color': '#666',
          'label': colored ? 'data(id)' : ''
        }
      },
      {
        selector: 'node[gender = "M"]',
        style: {
          'background-color': colored ? 'blue' : '#666'
        }
      },
      {
        selector: 'node[gender = "F"]',
        style: {
          'background-color': colored ? 'red' : '#666'
        }
      },
      {
        selector: 'edge', // selector for "undirected (symmetrical) connections"
        style: {
          'curve-style': 'bezier',
          'width': 3,
          'target-arrow-shape': 'triangle',
          'loop-direction' : '0deg',
          'loop-sweep' : '-45deg'
        }
      },
      {
        selector: 'edge[?directed]',
        style: {
          'target-arrow-shape': 'triangle'
        }
      },
      {
        selector: 'edge[color = "M"]',
        style: {
          'line-color':  colored ? 'blue' : 'darkgrey',
          'target-arrow-color': colored ? 'blue' : 'darkgrey'
        }
      },
      {
        selector: 'edge[color = "F"]',
        style: {
          'line-color': colored ? 'red' : 'darkgrey', 
          'target-arrow-color': colored ? 'red' : 'darkgrey'
        }
      },
      // {
      //   selector: 'edge[color = "FM"]',
      //   style: {
      //     'line-color': '#dc267f',
      //     'target-arrow-color': '#dc267f'
      //   }
      // },
      // {
      //   selector: 'edge[color = "FF"]',
      //   style: {
      //     'line-color': '#fe6100',
      //     'target-arrow-color': '#fe6100'
      //   }
      // },
      {
        selector: 'edge[!directed]', // selector for "undirected (symmetrical) connections"
        style: {
          'line-color': '#000000',
          'target-arrow-color': '#000000',
          'target-arrow-shape': 'none',
        }
      },
    ],
    layout: {
      name: 'cose',
      // Called on `layoutready`
      ready: function(){},

      // Called on `layoutstop`
      stop: function(){},

      // Whether to animate while running the layout
      // true : Animate continuously as the layout is running
      // false : Just show the end result
      // 'end' : Animate with the end result, from the initial positions to the end positions
      animate: true,

      // Easing of the animation for animate:'end'
      animationEasing: undefined,

      // The duration of the animation for animate:'end'
      animationDuration: undefined,

      // A function that determines whether the node should be animated
      // All nodes animated by default on animate enabled
      // Non-animated nodes are positioned immediately when the layout starts
      animateFilter: function ( node, i ){ return true; },


      // The layout animates only after this many milliseconds for animate:true
      // (prevents flashing on fast runs)
      animationThreshold: 250,

      // Number of iterations between consecutive screen positions update
      refresh: 20,

      // Whether to fit the network view after when done
      fit: true,

      // Padding on fit
      padding: 5,

      // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      boundingBox: undefined,

      // Excludes the label when calculating node bounding boxes for the layout algorithm
      nodeDimensionsIncludeLabels: false,

      // Randomize the initial positions of the nodes (true) or use existing positions (false)
      randomize: false,

      // Extra spacing between components in non-compound graphs
      componentSpacing: 40,

      // Node repulsion (non overlapping) multiplier
      nodeRepulsion: function( node ){ return 2048; },

      // Node repulsion (overlapping) multiplier
      nodeOverlap: 4,

      // Ideal edge (non nested) length
      idealEdgeLength: function( edge ){ return 32; },

      // Divisor to compute edge forces
      edgeElasticity: function( edge ){ return 32; },

      // Nesting factor (multiplier) to compute ideal edge length for nested edges
      nestingFactor: 1.2,

      // Gravity force (constant)
      gravity: 1,

      // Maximum number of iterations to perform
      numIter: 1000,

      // Initial temperature (maximum node displacement)
      initialTemp: 1000,

      // Cooling factor (how the temperature is reduced between consecutive iterations
      coolingFactor: 0.99,

      // Lower temperature threshold (below this point the layout will end)
      minTemp: 1.0
    }
  })
}



exports.init = init