import type { Point, Polyline } from './types';

export function distanceBetweenPoints(a: Point, b: Point) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];

  return Math.hypot(dx, dy);
}

export function slope(a: Point, b: Point) {
  return (b[1] - a[1]) / (b[0] - a[0]);
}

export function hasPerpendicularSlope(slope: number) {
  return !isFinite(slope);
}

export function findPolylineMidpoint(line: Polyline) {
  // Calculate total polyline length
  let totalLength = 0;
  for(let i = 1; i < line.length; i++) {
      totalLength += distanceBetweenPoints(line[i - 1], line[i]);
  }
  const halfLength = totalLength / 2;

  // Find an "aesthetically optimal" midpoint.
  // Basically, if the geometrical midpoint falls on a line segment that is perpendicular to either X or Y axis,
  // we don't want to use this point, as it will be hard to place a label there (label side will merge with the line segment).
  // If this happens to be the case, we will use the next vertex on the polyline.
  let accumulatedLength = 0;
  for(let i = 1; i < line.length; i++) {
      const a = line[i - 1];
      const b = line[i];
      const segmentLength = distanceBetweenPoints(a, b);

      if(accumulatedLength + segmentLength >= halfLength) {
          // The segment is perpendicular to either X or Y axis, - use the next vertex as the midpoint. // TODO!: This doesn't take into account a situation when the next segment is also perpendicular to either X or Y axis.
          if (hasPerpendicularSlope(slope(a, b))) {
            return {
              x: b[0],
              y: b[1],
            };
          }
          // The segment has an "aesthetic" slope, - interpolate the midpoint within this segment.
          const remainingDistanceToMidpoint = halfLength - accumulatedLength;
          const ratio = remainingDistanceToMidpoint / segmentLength;
          const dx = b[0] - a[0];
          const dy = b[1] - a[1];
          return {
              x: Math.round(a[0] + ratio * dx),
              y: Math.round(a[1] + ratio * dy),
          };
      }
      else {
          accumulatedLength += segmentLength;
      }
  }

  // The polyline is empty or has only one point
  return null;
}
