const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const filesToLint = ['server.js', 'db.js'];
const failures = [];

for (const relativePath of filesToLint) {
  const filePath = path.join(projectRoot, relativePath);
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    if (/\bconsole\.(log|warn|error)\(/.test(line)) {
      failures.push({
        relativePath,
        lineNumber,
        rule: 'no-console',
        message: 'Unexpected console statement.',
      });
    }

    if (line.length > 100) {
      failures.push({
        relativePath,
        lineNumber,
        rule: 'max-len',
        message: `Line is ${line.length} characters; expected 100 or fewer.`,
      });
    }
  });
}

if (failures.length > 0) {
  console.error('Lint failed:');

  for (const failure of failures) {
    console.error(
      `${failure.relativePath}:${failure.lineNumber} ${failure.rule} - ${failure.message}`,
    );
  }

  process.exit(1);
}

console.log('Lint passed.');
