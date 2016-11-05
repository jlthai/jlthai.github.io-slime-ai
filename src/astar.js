Crafty.c('astar', {
   init: function() {
      var _this = this;
      _this.world1d = SOURCE_FROM_TILED_MAP_EDITOR.layers[2].data;
      _this.worldWidth = Game.map_grid.width;
      _this.worldHeight = Game.map_grid.height;
      _this.world2d = [];

      _this.worldSize = this.worldWidth * this.worldHeight;
      _this.distanceFunction = this.manhattanDistance;

      // Convert 1d map to 2d
      // A 2D array to keep track of all occupied tiles
      for (var i = 0; i < this.worldWidth; i++) {
         this.world2d[i] = new Array(this.worldHeight);
      }

      for (var i = 0; i < this.worldWidth; i++) {
         for (var j = 0; j < this.worldHeight; j++) {
            this.world2d[i][j] = this.world1d[(j * this.worldWidth) + i];
         }
      }

      // End 1d to 2d
   },

   runSearch: function(pathStart, pathEnd) {
      var result = this.calculatePath(pathStart, pathEnd);

      var path = result[0];
      var pathCost = result[1];
      this.pathCost = pathCost;

      this.drawPath(path);
      document.getElementById("pathCost").innerHTML = "Shortest path: " + pathCost + " squares"

      if ( (!this.pursuing && pathCost < 14 ) ) {
         this.pursuing = true;

         this.bind('moveDone', function() {

            this.timeout( function() {
               result = this.calculatePath(this.at(), Crafty('PlayerChar').at());
               path = result[0];
               this.pathCost = result[1];
               document.getElementById("pathCost").innerHTML = "Shortest path: " + pathCost + " squares"
               this.drawPath(path);
               this.attack(path);
            }, 260);
         });

         this.attack(path);
      }
   },

   attack: function(path) {
      for (var i = 0; i < 16; i++) {
         this.timeout( function() {
            if ( path[1][1] < this.at().y ) {
               this.move("n", 2);
            }

            if ( path[1][1] > this.at().y ) {
               this.move("s", 2);
            }

            if ( path[1][0] < this.at().x ) {
               this.move("w", 2);
            }

            if ( path[1][0] > this.at().x ) {
               this.move("e", 2);
            }
         }, 260 ); // end timeout
      }

      Crafty.trigger("moveDone");
   },

   drawPath: function(path) {
      Crafty.trigger('destroyPath', this[0]);

      for (i = 1; i < path.length; i++) {
         Crafty.e('Path, ' + this[0]).at(path[i][0], path[i][1]);
      }
   },

   // Returns an array of coordinates for travelable neighbors
   neighbors: function(x, y) {
      var N = y - 1;
      var S = y + 1;
      var E = x + 1;
      var W = x - 1;
      var myN = N > -1 && this.canWalkHere(x, N);
      var myS = S < this.worldHeight && this.canWalkHere(x, S);
      var myE = E < this.worldWidth  && this.canWalkHere(E, y);
      var myW = W > -1 && this.canWalkHere(W, y);
      var result = [];

      if (myN) { result.push({x:x, y:N}); }
      if (myE) { result.push({x:E, y:y}); }
      if (myS) { result.push({x:x, y:S}); }
      if (myW) { result.push({x:W, y:y}); }

      return result;
   }, // End Neighbors

   // Returns true or false depending on whether the tile passed
   // in is a walkable tile
   canWalkHere: function(x, y) {
      return( (this.world2d[x] != null) &&
               (this.world2d[x][y] != null) &&
               (this.world2d[x][y] <= 0) );
   }, // End canWalkHere

   // Returns a manhattan distance (right angle distance of x + y)
   manhattanDistance: function(point, goal) {
      return Math.abs(point.x - goal.x) + Math.abs(point.y - goal.y);
   }, // End manhattanDistance

   // Returns a js object with properties to represent a node
   node: function(parent, point) {
      var newNode = {
         parent: parent, // pointer to previous node
         value: point.x + (point.y * this.worldWidth),
         x: point.x,
         y: point.y,
         f: 0, // Pathcost + heuristic (rightangle distance)
         g: 0  // Pathcost
      };

      return newNode;
   }, // End node

   calculatePath: function(pathStart, pathEnd) {
      var myPathStart = this.node(null, {x: Math.ceil(pathStart.x), y: Math.ceil(pathStart.y)});
      var myPathEnd = this.node(null, {x: Math.ceil(pathEnd.x), y: Math.ceil(pathEnd.y)});
      var flatWorld = new Array(this.worldSize); // 1D array w/ all world tiles
      var open = [myPathStart]; // Frontier list
      var closed = []; // Explored nodes list
      var result = []; // path output
      var myNeighbors; // list of neighbor nodes
      var myNode; // pointer to current node
      var myPath; // pointer to node we are exploring
      var finalCost;

      // temp integer variables used in the calculations
      var length, max, min, i, j;

      // Check if there are any nodes in the frontier
      while(length = open.length) {
         max = this.worldSize;
         min = -1;

         // Find the node with the lowest heuristic
         for( i = 0; i < length; i++ ) {
            if( open[i].f < max ) {
               max = open[i].f;
               min = i;
            }
         }

         myNode = open.splice(min, 1)[0]; // Try open[min]

         // Check if current node is at the goal
         if ( myNode.value === myPathEnd.value ) {
            // closed.push() returns the closed array's length
            // set myPath to the node at the last node's index
            myPath = closed[closed.push(myNode) - 1];

            finalCost = myPath.g;
            // Push coordinates into result array while the current path has a parent
            do {
               result.push( [myPath.x, myPath.y] );
            } while (myPath = myPath.parent);

            // End the loops by clearing arrays
            flatWorld = closed = open = [];

            result.reverse(); // flip results so it goes from start to finish
         } else { // if myNode isn't at goal
            // Find nodes that can be traveled to
            myNeighbors = this.neighbors(myNode.x, myNode.y);

            // Travel to each node in myNeighbors
            for (i = 0, j = myNeighbors.length; i < j; i++) {
               myPath = this.node(myNode, myNeighbors[i]);

               if (!flatWorld[myPath.value]) {
                  // Current path cost
                  myPath.g = myNode.g + this.distanceFunction(myNeighbors[i], myNode);

                  // Cost + heuristic
                  myPath.f = myPath.g + this.distanceFunction(myNeighbors[i], myPathEnd);

                  // frontier nodes
                  open.push(myPath);
                  // mark this node in the world graph as visited
                  flatWorld[myPath.value] = true;
               }
            }
            closed.push(myNode);
         }
      } // keep iterating until the open list is empty

      // return array of coordinates and path cost of result
      return [result, finalCost];
   } // End calculatePath
});
