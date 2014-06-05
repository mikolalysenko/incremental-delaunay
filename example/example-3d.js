"use strict"

var shell = require("gl-now")({tickRate:2})
var camera = require("game-shell-orbit-camera")(shell)
var mat4 = require("gl-matrix").mat4
var createSimplicialComplex = require("gl-simplicial-complex")
var triangulation = require("../delaunay.js")(3)
var sc = require("simplicial-complex")
var createAxes = require("gl-axes")

var mesh, axes

function finiteVertex(c) {
  return (c[0] > 3) && (c[1] > 3)
}


var tt = -1.0
function updateTriangulation() {
  var randPoint = [ 2*Math.random()-1, 2*Math.random()-1, 2*Math.random()-1 ]

  //var randPoint = [tt,tt,tt]
  //tt += 0.1
  triangulation.insert(randPoint)
  var cells = sc.skeleton(triangulation.cells, 1)//.filter(finiteVertex)
  var points = triangulation.points
  for(var i=4; i<points.length; ++i) {
    cells.push([i])
  }
  mesh.update({
    cells: cells,
    positions: points,
    pointSize: 5,
    meshColor: [0,0,0]
  })
}

shell.on("gl-init", function() {
  var gl = shell.gl
  gl.enable(gl.DEPTH_TEST)
  mesh = createSimplicialComplex(gl, {cells: [], positions: []})
  axes = createAxes(shell.gl, {bounds: [[-1,-1,-1],[1,1,1]], tickSpacing: [0.1,0.1,0.1], gridColor:[0.5,0.5,0.5]})
  //setInterval(updateTriangulation, 2000)
})

shell.on("tick", function() {
  if(shell.press("space")) {
    updateTriangulation()
  }
})

shell.on("gl-render", function() {
  var cameraParameters = {
    view: camera.view(),
    projection: mat4.perspective(mat4.create(),
          Math.PI/4.0,
          shell.width/shell.height,
          0.1,
          1000.0)
  }
  mesh.draw(cameraParameters)
  axes.draw(cameraParameters)
})