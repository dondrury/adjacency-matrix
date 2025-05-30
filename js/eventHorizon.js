const PHI = 1.618033988749894
function init() {
  console.log('started event horizon')
  Array.from(document.getElementsByClassName('event-horizon-container')).forEach(create)
}

function create(el) {

  const matrix = JSON.parse(el.dataset.matrix)
  console.log(matrix) // still boolean
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
  const yOffset = y => y + (canvasHeight / 2)
  let r = 7
  const horizons = []
  for (let i = 0; i < matrix.length * 2; i++) {
    const horizonElements = drawCenteredHorizonByRadius(r, i)
    horizons.push(horizonElements)
    r *= PHI
  }
  console.log(horizons)

  drawArrows()

  function drawArrows () {

  }

  function drawArrow(fromx, fromy, tox, toy) {
    var headlen = 10; // length of head in pixels
    var dx = tox - fromx;
    var dy = toy - fromy;
    var angle = Math.atan2(dy, dx);
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
  }

  function drawCenteredHorizonByRadius (radius, t) {
    const x = xOffset(0)
    const y = yOffset(0)
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI, true)
    ctx.stroke()
    const nodes = []
    let arcLength = 0
    for (let i = 0; i < matrix.length; i++) {
      const element =  { // r cos arc - r sin arc
        x: radius * Math.cos(arcLength),
        y: -1 * radius * Math.sin(arcLength)
      }
      nodes.push(element)
      arcLength += arcLengthIncrement
    }
    nodes.forEach(drawNode)
    // console.log(nodes)
    function drawNode (node, i) { // node : { x: 12.2, y: 123.43 }
      const x = xOffset(node.x)
      const y = yOffset(node.y)
      ctx.beginPath()
      ctx.arc(x, y, 2, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.font = '14px serif'
      // ctx.fillText(`n=${i}, t=${t}`, xOffset(node.x + 5), yOffset(node.y))
      ctx.fillText(i, xOffset(node.x + 5), yOffset(node.y))
    }
    return nodes
    // horizon elements (nodes) in zero coordinates [ {x: 1.12312, y: 211.23} , ... ]
  }



}

exports.init = init