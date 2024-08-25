
function init() {
  // Array.from(document.getElementsByClassName('cytoscape-visualization')).forEach(create)
  if (document.getElementById('morphsDataTable') && window.morphsObject) {
    console.log('morphsDataTable')
    console.log(morphsObject)
    create()
  }
}

function create () {
  const dataSet = []
  morphsObject.forEach(m => {
    const morph = [
      m.id,
      m.characteristicPolynomialHtml,
      m.size,
      m.isSymmetric,
      m.selfReferences,
      m.rank,
      m.image
    ]
    dataSet.push(morph)
  })
  const table = new DataTable('#morphsDataTable', {
      columns: [
        { title: 'ID', 
          render:  function (id) {
            return `<a href="/morphs/edit/${id}" target="_blank">${id}</a>`
          }
        },
        { title: 'Characteristic Polynomial'},
        { title: 'Size' },
        { title: 'isSymmetric' },
        { title: 'selfReferences' },
        { title: 'Rank' },  
        { title: 'Image',
          render: function (imageData) {
            return `<img src="${imageData}" width="50px"/>`
          }
        }
      ],
      data: dataSet,
      paging: false
  });
}

exports.init = init