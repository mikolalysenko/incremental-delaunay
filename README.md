incremental-delaunay
====================
Incremental Delaunay triangulation data structure.

# Example

```javascript
var createTriangulation = require("incremental-delaunay")

//Create a 2D triangulation with some points
var triangulation = createTriangulation(2, [
  [0,1],
  [1,0],
  [1,1]
])

//Insert some random point
triangulation.insert([1, 2])

//Get all points in the triangulation
console.log("points=", triangulation.points)

//Get all cells in the triangulation
console.log("cells=", triangulation.cells)

//Locate a triangle containing a point
console.log("located triangle=", triangulation.locate([0.5, 0.5]))
```

Example output:

```javascript
points= [ [ -1e+30, -1e+30 ],
  [ 1e+30, -1e+30 ],
  [ 0, 1e+30 ],
  [ 0, 1 ],
  [ 1, 0 ],
  [ 1, 1 ],
  [ 1, 2 ] ]


cells= [ [ 5, 6, 3 ],
  [ 3, 6, 2 ],
  [ 6, 1, 2 ],
  [ 5, 1, 6 ],
  [ 4, 5, 3 ],
  [ 4, 1, 5 ],
  [ 3, 0, 4 ],
  [ 0, 1, 4 ],
  [ 0, 3, 2 ] ]


located triangle= [ 3, 0, 4 ]
```

# API

```javascript
var createTriangulation = require("incremental-delaunay")
```

## Constructor

### `var triangulation = createTriangulation(dimension, points)`
Creates a triangulation

* `dimension` is the dimension of the ambient space
* `points` is an array of points

**Returns** A `DelaunayTriangulation` object

## Methods

### `triangulation.cells`
An array of all cells in the triangulation

### `triangulation.points`
An array of all points in the triangulation

### `triangulation.insert(point)`
Adds `point` to the triangulation

### `triangulation.locate(point)`
Returns the simplex containing `point`

# Credits
(c) 2013-2014 Mikola Lysenko. MIT License