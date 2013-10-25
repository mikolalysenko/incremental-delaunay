incremental-delaunay
====================
Incremental Delaunay triangulation data structure.

# Example

```javascript
var createTriangulation = require("incremental-delaunay")

var triangulation = createTriangulation(2, [
  [0,1],
  [1,0],
  [1,1]
])
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
(c) 2013 Mikola Lysenko. MIT License