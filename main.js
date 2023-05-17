import * as geom from 'jsts/org/locationtech/jts/geom.js';
import * as linear from 'jsts/org/locationtech/jts/linearref.js';

const GeometryFactory = new geom.GeometryFactory();

function getMiddlePoint(vertices) {
  // Calculate total length of a polyline
  let totalLength = 0;
  for(let i = 1; i < vertices.length; i++) {
      const dx = vertices[i][0] - vertices[i - 1][0];
      const dy = vertices[i][1] - vertices[i - 1][1];
      totalLength += Math.hypot(dx, dy);
  }

  // Find midpoint
  const midpointLength = totalLength / 2;
  let accumulatedLength = 0;
  for(let i = 1; i < vertices.length; i++) {
      const dx = vertices[i][0] - vertices[i - 1][0];
      const dy = vertices[i][1] - vertices[i - 1][1];
      const segmentLength = Math.hypot(dx, dy);

      if(accumulatedLength + segmentLength >= midpointLength) {
          // Interpolate the midpoint within this segment
          const ratio = (midpointLength - accumulatedLength) / segmentLength;
          return {
              x: vertices[i - 1][0] + ratio * dx,
              y: vertices[i - 1][1] + ratio * dy
          };
      }
      else {
          accumulatedLength += segmentLength;
      }
  }

  // The polyline is empty or has only one point
  return null;
}

function processInput(lines) {
  // console.log('Processing input, received: ', lines);
  lines.forEach((line) => {
    // console.log('Line:', line)
    console.time('raw midpoint');
    console.log('Middle point:', getMiddlePoint(line));
    console.timeEnd('raw midpoint');

    console.time('jsts midpoint');
    console.log('Middle point with jsts:', getMiddlePointWithJSTS(line));
    console.timeEnd('jsts midpoint');
  });

}

function parseInput(callback) {
  let combinedData = '';
  
  process.stdin.on('data', (data) => {
    combinedData += data;
  });
  
  process.stdin.on('end', () => {
    if (combinedData) {
      console.time('parsing input');
      const lines = combinedData.trim().split('\n');
      // Convert an array of numbers into an array of coordinates
      const parsedLines = lines.map((line) => {
        return line.trim().split(' ').reduce((result, item, index, array) => {
          // x-coordinates are even
          if (index % 2 === 0) {
            result.push([parseInt(item, 10), parseInt(array[index + 1], 10)]);
          }
          return result;
        }, []);
      });
      console.timeEnd('parsing input');

      callback(parsedLines);
    }
  
    // console.log('Finished processing input');
  });
}

parseInput(processInput);
