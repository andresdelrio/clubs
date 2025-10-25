const fs = require('fs');
const { parse } = require('csv-parse');

function parseCsvFile(filePath, { columns, trim = true, skipEmptyLines = true }) {
  return new Promise((resolve, reject) => {
    const records = [];
    fs.createReadStream(filePath)
      .pipe(
        parse({
          columns,
          bom: true,
          skip_empty_lines: skipEmptyLines,
          trim,
        })
      )
      .on('data', (record) => records.push(record))
      .on('error', (err) => reject(err))
      .on('end', () => resolve(records));
  });
}

module.exports = {
  parseCsvFile,
};

