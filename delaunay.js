"use strict"

var iota = require("iota-array")
var deck = require("deck")
var orientation = require("robust-orientation")
var pointInSimplex = require("robust-point-in-simplex")
var inSphere = require("robust-in-sphere")
var sc = require("simplicial-complex")

module.exports = createDelaunayTriangulation

function Simplex(triangulation, vertices, children, next, prev) {
  this.triangulation = triangulation
  this.vertices = vertices
  this.children = children
  this.next = next
  this.prev = prev
}

var proto = Simplex.prototype

proto.insert = function(p) {
  if(this.children) {
    for(var i=0; i<this.children.length; ++i) {
      if(this.children[i].contains(this.triangulation.points[p])) {
        this.children[i].insert(p)
      }
    }
  } else {
    //Unlink from list
    this.prev.next = this.next
    this.next.prev = this.prev
    this.next = this.prev = null
    //Add child
    this.children = []
    for(var i=this.vertices.length-1; i>=0; --i) {
      //Remove from dual
      var v = this.vertices[i]
      var d = this.triangulation._dual[v]
      for(var j=d.length-1; j>=0; --j) {
        if(d[j] === this) {
          d[j] = d[d.length-1]
          d.pop()
          break
        }
      }
      //Add child
      var nv = this.vertices.slice()
      nv[i] = p
      var child = new Simplex(this.triangulation, nv, null, this.triangulation.next, this.triangulation)
      if(!child.degenerate()) {
        this.children.push(child)
        this.triangulation.next.prev = child
        this.triangulation.next = child
        for(var j=0; j<nv.length; ++j) {
          this.triangulation._dual[nv[j]].push(child)
        }
      }
    }
  }
}

proto.contains = function(p) {
  var pointList = new Array(this.vertices.length)
  for(var i=0; i<this.vertices.length; ++i) {
    pointList[i] = this.triangulation.points[this.vertices[i]]
  }
  return pointInSimplex(pointList, p) >= 0
}

proto.degenerate = function() {
  var pointList = new Array(this.vertices.length)
  for(var i=0; i<this.vertices.length; ++i) {
    pointList[i] = this.triangulation.points[this.vertices[i]]
  }
  return orientation(pointList) === 0
}

function DelaunayTriangulation(points, dual, root) {
  this.points = points
  this._dual = dual
  this._root = root
  this.next = this
  this.prev = this
}

var dproto = DelaunayTriangulation.prototype


dproto.dual = function(v) {
  var d = this._dual[v]
  var r = []
  for(var i=0; i<d.length; ++i) {
    r.push(d[i].vertices)
  }
  return r
}

function removeFromDual(triangulation, simplex) {
  for(var i=0; i<simplex.vertices.length; ++i) {
    var d = triangulation._dual[simplex.vertices[i]]
    for(var j=0; j<d.length; ++j) {
      if(d[j] === simplex) {
        d[j] = d[d.length-1]
        d.pop()
        break
      }
    }
  }
}

dproto.insert = function(p) {
  var v = this.points.length
  this.points.push(p)
  this._dual.push([])
  this._root.insert(v)
  //Fix up delaunay condition
  var to_visit = this._dual[v].slice()
  while(to_visit.length > 0) {
    var c = to_visit[to_visit.length-1]
    to_visit.pop()
    if(c.children) {
      continue
    }
    //Get opposite simplex
    var points = new Array(c.vertices.length+1)
    var v_sum = 0
    for(var i=0; i<c.vertices.length; ++i) {
      points[i] = this.points[c.vertices[i]]
      v_sum ^= c.vertices[i]
    }
    //Walk over simplex vertices
do_flip:
    for(var i=0; i<c.vertices.length; ++i) {
      //Find opposite simplex to vertex i
      if(c.vertices[i] !== v) {
        continue
      }
      var d = this._dual[c.vertices[(i+1)%c.vertices.length]]
      var opposite
      var opposite_index
search_opposite:
      for(var j=0; j<d.length; ++j) {
        opposite = d[j]
        if(opposite === c) {
          continue
        }
        opposite_index = v_sum ^ v
        for(var k=0; k<opposite.vertices.length; ++k) {
          opposite_index ^= opposite.vertices[k]
          if(c.vertices[k] !== v && opposite.vertices.indexOf(c.vertices[k]) < 0) {
            continue search_opposite
          }
        }
        //Check if legal
        points[c.vertices.length] = this.points[opposite_index]
        var s = inSphere(points)
        if(inSphere(points) > 0) {
          //Unlink cells
          removeFromDual(this, c)
          c.children = []
          c.next.prev = c.prev
          c.prev.next = c.next
          c.next = c.prev = null
          removeFromDual(this, opposite)
          opposite.children = []
          opposite.next.prev = opposite.prev
          opposite.prev.next = opposite.next
          opposite.next = opposite.prev = null
          for(var k=0; k<c.vertices.length; ++k) {
            if(c.vertices[k] === v) {
              continue
            }
            var nv = c.vertices.slice()
            nv[k] = opposite_index
            //Create and link cell
            var nchild = new Simplex(this, nv, null, this.next, this)
            this.next.prev = nchild
            this.next = nchild
            for(var l=0; l<nv.length; ++l) {
              this._dual[nv[l]].push(nchild)
            }
            //Add to child pointers
            c.children.push(nchild)
            opposite.children.push(nchild)
            //Mark to visit
            to_visit.push(nchild)
          }
        }
        break do_flip
      }
    }
  }
}

dproto.locate = function(p) {
  var c = this._root
  while(c.children) {
    for(var i=0; i<c.children.length; ++i) {
      if(c.children[i].contains(p)) {
        c = c.children[i]
        break
      }
    }
  }
  return c.vertices
}

Object.defineProperty(dproto, "cells", {
  get: function() {
    var r = []
    for(var cur=this.next; cur !== this; cur = cur.next) {
      r.push(cur.vertices)
    }
    return r
  }
})

function createBoundingSimplex(dimension) {
  var result = new Array(dimension+1)
  for(var i=0; i<=dimension; ++i) {
    result[i] = new Array(dimension)
  }
  for(var i=1; i<=dimension; ++i) {
    result[i][i-1] = 1e30
    for(var j=0; j<i-1; ++j) {
      result[i][j] = 0.0
    }
    for(var j=0; j<i; ++j) {
      result[j][i-1] = -1e30
    }
  }
  return result
}

function createDelaunayTriangulation(dimension, points) {
  var bounds = createBoundingSimplex(dimension)
  var root = new Simplex(null, iota(dimension+1), null, null, null)
  var dual = new Array(dimension+1)
  for(var i=0; i<dual.length; ++i) {
    dual[i] = [root]
  }
  var triangulation = new DelaunayTriangulation(bounds, dual, root)
  root.triangulation = triangulation
  root.next = root.prev = triangulation
  triangulation.next = triangulation.prev = root
  if(points) {
    var spoints = deck.shuffle(points)
    for(var i=0; i<spoints.length; ++i) {
      triangulation.insert(spoints[i])
    }
  }
  return triangulation
}