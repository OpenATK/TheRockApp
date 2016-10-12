import distanceTo from 'react-leafelt';

function getFlowDirection(dem) = {
  var flowDirection = [];
  for (var r = 0; r < dem.length; r++) {
    for (var c = 0; c < dem[0].length; c++) {
      var maxSlope;
      if (flowDirection[i][j] ) {
        for (var x = -1; x < 2; x++) {
          for (var y = -1; y < 2; y++) {
            if (x == 0 && y == 0) {
              continue;
            }
            var pointA = new Point(c, r);
            var pointB = new Point(c+x, r+y);
            var distance = pointA.distanceTo(pointB);
            var slope = ((dem[r+y][c+x] - dem[r][c])/distance);
            
            if (!maxSlope || maxSlope < slope) {
              maxSlope = slope;
              flowDirection[r][c] = [r+y, c+x];
            }
          }
        }
        if (maxSlope >= 0) {
          flowDirection[r][c] = -1;
        }
      }
    }
  }

  return flowDirection;
};

function getFlowDirectionParents(dem) = {
  var numrows = dem.length;
  var numcols = dem[0].length;
  var flowDirectionParents = [][][][];

  for (var r = 0; r < dem.length; r++) {
    for (var c = 0; c < dem[0].length; c++) {
      for (var x = -1; x < 2; x++) {
        for (var y = -1; y < 2; y++) {
          if (x == 0 && y == 0) {
            continue;
          }
          
          if (r+y > numrows || r+y < 1 || c+x > numcols || c+x < 1
            continue;
          }
          
          if (flowDirection[r+y][c+x].x != 0 && flowDirection[r+y][c+x].y != 0) {
            if (flowDirection[r+y][c+x].y == r && flowDirection[r+y][c+x].x = c) {
              flowDirectionParents[r][c][y+2][x+2] = true;
            }
          }
        }
      }
    }
  }
};

function getPits() = {

};

function fillPits() = {

};


