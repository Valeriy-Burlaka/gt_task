import * as geom from 'jsts/org/locationtech/jts/geom.js';
import * as linear from 'jsts/org/locationtech/jts/linearref.js';
// Monkey-patches the bundled ES6 version of JSTS to add some missing methods, like `Geometry.prototype.intersects()`.
import 'jsts/org/locationtech/jts/monkey.js';

import type { Polyline } from './types';

const LABEL_WIDTH = 100;
const LABEL_HEIGHT = 50;

const GeometryFactory = new geom.GeometryFactory();

function parsePolylines(lines: Polyline[]) {
  // console.time('parse polylines');
  const result = lines.map((points) => {
    const coordinates = points.map((p) => {
      return new geom.Coordinate(p[0], p[1]);
    })

    return GeometryFactory.createLineString(coordinates);
  });

  // console.timeEnd('parse polylines');

  return result;
}

function getMiddlePoint(polyline) {
  // console.time('get middle point');
  const lengthIndexedLine = new linear.LengthIndexedLine(polyline);
  const midpoint = lengthIndexedLine.extractPoint(polyline.getLength() / 2);

  // console.timeEnd('get middle point');

  return { x: Math.round(midpoint.x), y: Math.round(midpoint.y)};
}

function findBestLabelPosition(thisLine, otherLines) {
  const anchorCoordinates = getMiddlePoint(thisLine);
  // const { x, y } = anchorCoordinates;
  const x = anchorCoordinates.x + 1; // trying to add offsets to make the polygon vertex to not touch the anchor point
  const y = anchorCoordinates.y + 1;
  console.log(x, y)
  const labelDirections = {
    'top-right': [1, 1],
    'top-left': [-1, 1],
    'bottom-right': [1, -1],
    'bottom-left': [-1, -1],
  };

  for (const direction of Object.keys(labelDirections)) {
    const [dx, dy] = labelDirections[direction];
    const labelBoundingBox = GeometryFactory.createPolygon([
      new geom.Coordinate(x, y),
      new geom.Coordinate(x + dx * LABEL_WIDTH, y),
      new geom.Coordinate(x + dx * LABEL_WIDTH, y + dy * LABEL_HEIGHT),
      new geom.Coordinate(x, y + dy * LABEL_HEIGHT),
      new geom.Coordinate(x, y)
    ]);

    // Check if the label covers the polyline
    if (thisLine.intersects(labelBoundingBox)) {
      console.log("The label covers the polyline, direction: ", direction);
    } else {
      console.log("DOESN'T cover the polyline, direction:", direction);
    }
  }
}

function processInput(lines: Polyline[]) {
  // console.log('Processing input, received: ', lines);
  const allPolylines = parsePolylines(lines);
  allPolylines.forEach((polyline) => {
    findBestLabelPosition(polyline, allPolylines);
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
