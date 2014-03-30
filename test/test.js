"use strict"

var createTriangulation = require("../delaunay.js")

require("tape")(function(t) {

  var tri = createTriangulation(2)

  tri.insert([0,0])
  tri.insert([0,1])
  tri.insert([1,0])

  console.log(tri.cells)
  console.log(tri.points)

  t.end()
})