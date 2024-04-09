
function init() {
  console.log('started spectral graph')
  // Array.from(document.getElementsByClassName('cytoscape-visualization')).forEach(create)
  Array.from(document.getElementsByClassName('spectral-graph')).forEach(prepare)
}

function prepare (el, i) {
  // const eigenEls = Array.from(el.querySelectorAll('.eigenvalue'))
  // console.log(eigenEls)
  // eigenEls.forEach((el) => {
  //   eigenEls.forEach((otherEig) => {
  //     if (el.style.bottom === otherEig.style.bottom) {
  //       el.style.bottom = (parseInt(el.style.bottom.replace('px',''), 10) + 10 ) + 'px'
  //     }
  //   })
  // })
}

exports.init = init