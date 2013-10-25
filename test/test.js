"use strict"

var createTriangulation = require("../delaunay.js")

require("tape")(function(t) {

  var tri = createTriangulation(2, 
    [[0,0],[0,1],[1,0],[0.5,0.5],[1,1]])
  console.log(tri.cells, tri.points)

  t.end()
})