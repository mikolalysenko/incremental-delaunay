"use strict"

var tape = require("tape")
var createTriangulation = require("../delaunay.js")

tape("2d delaunay", function(t) {

  var tri = createTriangulation(2)

  tri.insert([0,0])
  tri.insert([0,1])
  tri.insert([1,0])

  t.equals(tri.points.length, 6)

  t.end()
})
