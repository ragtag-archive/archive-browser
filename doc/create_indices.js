const axios = require('axios');
const path = require('path');
const fs = require('fs');
const [cmd, file, ...args] = process.argv;

if (args.length < 1) {
  console.error('Usage: create_indices.js <elasticsearch url>');
  process.exit(1);
}

const baseURL = args[0];

async function run() {
  const files = fs.readdirSync(path.join(__dirname, './indices'));

  for (const file of files) {
    const fileContents = fs.readFileSync(
      path.join(__dirname, './indices', file)
    );
    const indexName = file.split('.')[0];
    console.log('Creating index', indexName);
    const response = await axios
      .request({
        baseURL,
        url: '/' + indexName,
        method: 'PUT',
        data: JSON.parse(fileContents),
      })
      .catch((err) => err.response);
    console.log(response.data);
  }
}

run();
