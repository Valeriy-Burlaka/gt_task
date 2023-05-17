
function processInput(data) {
  console.log('Processing input, received: ', data);
}

function parseInput(callback) {
  let combinedData = '';
  
  process.stdin.on('data', (data) => {
    combinedData += data;
  });
  
  process.stdin.on('end', () => {
    if (combinedData) {
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

      callback(parsedLines);
    }
  
    console.log('Finished processing input');
  });
}

if (require.main === module) {
  console.log('This is the main module being run.');
  parseInput(processInput);
} else {
  exit(1)
}