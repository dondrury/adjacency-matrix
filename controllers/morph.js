const Morph = require('../models/morph')
const Graph = require('../models/graph')

exports.afterConnectionTasks = function () {
  setTimeout(function () {
   console.log('morph controller after connection tasks')
  //  updateAllSuperpositionMatrices() // this also serves to update "exampleCount to match actual matrices. During the search process some errors caused double counting"
  }, 1000)
}


function updateAllSuperpositionMatrices () {
  Morph.find().exec((err, allMorphs) => {
    if (err) {
      console.log(err)
      return
    }
    console.log('updateAllSuperpositionMatrices has found %s morphs', allMorphs.length)
    let i = 0
    updateNextSuperpositionMatrix()
    function updateNextSuperpositionMatrix () {
      if (i === allMorphs.length) {
        console.log('updateAllSuperpositionMatrices is done')
        return
      }
      allMorphs[i].updateSuperPositionMatrix(() => {
        i++
        setTimeout(updateNextSuperpositionMatrix, 0)
      })
    }
  })
}

exports.getMorphsTableView = (req, res) => {
  Morph.find().exec((err, morphs) => {
    if (err || !morphs) {
      console.log(err)
      return
    }
    return res.render('layout', { title: 'Morphs Table View', view: 'morphsTableView', morphs })
  })
}

exports.getMorphs = (req, res) => { 
  const size = Number(req.params.size)
  const rank = Number(req.params.rank)
  // console.log(size, rank)
  Morph.find({size, rank}).populate('bestExample').sort('selfReferences -isSymmetric').exec((err, morphs) => {
    if (err) {
      console.log(err)
      return
    }
    Graph.count({size, rank}).exec((err, counted) => {
      if (err) {
        console.log(err)
        return
      }
      return res.render('layout', { title: 'What Morphs Exist', view: 'morphs', morphs, size, rank, graphsInSpace: counted })
    })
  })
}

exports.postEditMorph = (req, res) => {
  const id = req.params.id
  Morph.findById(id).populate('bestExample').exec((err, morph) => {
    if (err) {
      console.log(err)
      return
    }
    morph.name = req.body.name
    morph.save((err, morphAfter) => {
      return res.redirect('/morphs/edit/' + id)
    })
  })
}


exports.postEditSaveImageMorph = (req, res) => {
  const id = req.params.id
  Morph.findById(id).populate('bestExample').exec((err, morph) => {
    if (err) {
      console.log(err)
      return
    }
    morph.image = req.body.imageSrc
    morph.save((err, morphAfter) => {
      return res.redirect('/morphs/edit/' + id)
    })
  })
}


exports.getEditMorph = (req, res) => {
  const id = req.params.id
  Morph.findById(id).populate('bestExample').exec((err, morph) => {
    if (err) {
      console.log(err)
      return
    }
    // console.log(morph)
    Graph.find({ morphIdentified: id }).select('name pseudoSkewSymmetryScore').sort('pseudoSkewSymmetryScore').exec((err, graphs) => {
      if (err) {
        console.log(err)
        return
      }
      // console.log(graphs)
      return res.render('layout', { title: 'Morph ' + id, view: 'editMorph', morph, graphs })
    })
  })
  
}
