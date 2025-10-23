const PHI = 1.618033988749894
function init() {
  console.log('started event horizon')
  Array.from(document.getElementsByClassName('event-horizon-container')).forEach(create)
}

function create(el) {
  const matrix = JSON.parse(el.dataset.matrix)
  // console.log(matrix) // still boolean
  const canvas = el.querySelector('canvas')
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    console.error('canvas context not supported')
    return
  }
  const canvasWidth = canvas.width
  const canvasHeight = canvas.height
  const arcLengthIncrement = 2 * Math.PI / matrix.length
  // console.log('size', canvasWidth, canvasHeight)
  const xOffset = x => x + (canvasWidth / 2)
  const yOffset = y => - y + (canvasHeight / 2)
  let r = 200 / (matrix.length * PHI)
  const horizons = []
  // for (let i = 0; i < matrix.length + 1; i++) {
  //   const horizonElements = drawCenteredHorizonByRadius(r, i)
  //   horizons.push(horizonElements)
  //   r *= PHI
  //   if (i > 0) drawArrowsBetweenHorizons(horizons[i - 1], horizons[i])
  // }
  // console.log(horizons)
  let i = 0
  drawNextHorizonWithArrows()

  function drawNextHorizonWithArrows () {
    if (i > matrix.length) return
    const horizonElements = drawCenteredHorizonByRadius(r, i)
    horizons.push(horizonElements)
    r *= PHI
    if (i > 0) drawArrowsBetweenHorizons(horizons[i - 1], horizons[i])
    i++
    setTimeout(drawNextHorizonWithArrows, 2000)
  }

  function drawArrowsBetweenHorizons(before, after) {
    // console.log(before, after)
    before.forEach((startNode, i) => {
      after.forEach((endNode, j) => {
        if (matrix[i][j]) {
          const fromx = startNode.x
          const fromy = startNode.y
          const tox = endNode.x
          const toy = endNode.y
          // console.log(i, j)
          // console.log('matrix[i][j]', matrix[i][j])
          // console.log('matrix[j][i]', matrix[j][i])
          let color = matrix[i][j] === matrix[j][i] ? '#707070' : '#C0C0C0' // darker for symmetries
          color = i === j ? 'red' : color
          const arrowWidth = i === j ? 5 : 3
          drawArrow(fromx, fromy, tox, toy, arrowWidth, color)
        }
      })
    })
  }


  // horizons.forEach(drawArrows)
  // function drawArrows (horizon, n) {
  //   if (n >= horizons.length - 1) return
  //   const nextHorizon = horizons[n + 1]
  //   // console.log('nextHorizon', nextHorizon)
  //   horizon.forEach((startNode, i) => {
  //     nextHorizon.forEach((endNode, j) => {
  //       if (matrix[i][j]) {
  //         const fromx = startNode.x
  //         const fromy = startNode.y
  //         const tox = endNode.x
  //         const toy = endNode.y
  //         console.log(i, j)
  //         console.log('matrix[i][j]', matrix[i][j])
  //         console.log('matrix[j][i]', matrix[j][i])
  //         let color = matrix[i][j] === matrix[j][i] ? '#707070' : '#C0C0C0' // darker for symmetries
  //         color = i === j ? 'red' : color
  //         const arrowWidth = i === j ? 5 : 3
  //         drawArrow(fromx, fromy, tox, toy, arrowWidth, color)
  //       }
  //     })
  //   })
  // }




  function drawCenteredHorizonByRadius (radius, t) {
    const x = xOffset(0)
    const y = yOffset(0)
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI, true)
    ctx.lineWidth = 1
    ctx.strokeStyle = 'lightgrey'
    ctx.stroke()
    const nodes = []
    // let arcLength = t * arcLengthIncrement // to make the eigenvalue shift for each iteration on the bigest ring
    let arcLength = 0
    for (let i = 0; i < matrix.length; i++) {
      const element =  { // r cos arc - r sin arc
        x: xOffset(radius * Math.cos(arcLength)),
        y: yOffset(radius * Math.sin(arcLength))
      }
      nodes.push(element)
      arcLength += arcLengthIncrement
    }
    nodes.forEach(drawNode)
    // console.log(nodes)
    function drawNode (node, i) { // node : { x: 12.2, y: 123.43 }
      const x = node.x
      const y = node.y
      ctx.beginPath()
      ctx.arc(x, y, 2, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.font = '14px serif'
      // ctx.fillText(`n=${i}, t=${t}`, xOffset(node.x + 5), yOffset(node.y))
      ctx.fillText(i, x + 5, y)
    }
    return nodes
    // horizon elements (nodes) in zero coordinates [ {x: 1.12312, y: 211.23} , ... ]
  }

  function drawArrow(fromx, fromy, tox, toy, arrowWidth, color){
    //variables to be used when creating the arrow
    var headlen = 10
    var angle = Math.atan2(toy-fromy,tox-fromx)
 
    ctx.save()
    ctx.strokeStyle = color
 
    //starting path of the arrow from the start square to the end square
    //and drawing the stroke
    ctx.beginPath()
    ctx.moveTo(fromx, fromy)
    ctx.lineTo(tox, toy)
    ctx.lineWidth = arrowWidth
    ctx.stroke()
 
    //starting a new path from the head of the arrow to one of the sides of
    //the point
    ctx.beginPath()
    ctx.moveTo(tox, toy)
    ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),
               toy-headlen*Math.sin(angle-Math.PI/7))
 
    //path from the side point of the arrow, to the other side point
    ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),
               toy-headlen*Math.sin(angle+Math.PI/7))
 
    //path from the side point back to the tip of the arrow, and then
    //again to the opposite side point
    ctx.lineTo(tox, toy)
    ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),
               toy-headlen*Math.sin(angle-Math.PI/7))
 
    //draws the paths created above
    ctx.stroke()
    ctx.restore()
  }
}

  // function drawArrow(fromx, fromy, tox, toy) {
  //   console.log('drawArrow', arguments)
  //   var headlen = 8 // length of head in pixels
  //   var dx = tox - fromx
  //   var dy = toy - fromy
  //   var angle = Math.atan2(dy, dx)
  //   ctx.beginPath()
  //   ctx.lineWidth = 1
  //   ctx.strokeStyle = 'grey'
  //   ctx.moveTo(fromx, fromy)
  //   ctx.lineTo(tox, toy)
  //   ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6))
  //   ctx.moveTo(tox, toy)
  //   ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6))
  //   ctx.stroke()
  // }

exports.init = init