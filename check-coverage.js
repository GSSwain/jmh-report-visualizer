const fs = require('fs');
const path = require('path');

const summaryPath = path.resolve(__dirname, 'playwright-report/coverage/coverage-summary.json');
const threshold = 80;
const branchThreshold = 70;

if (!fs.existsSync(summaryPath)) {
    console.error('Coverage summary not found at ' + summaryPath);
    process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
const global = summary.total;

const lines = global.lines.pct;
const branches = global.branches.pct;
const functions = global.functions.pct;
const statements = global.statements.pct;

console.log('--- Coverage Summary ---');
console.log(`Lines: ${lines}%`);
console.log(`Branches: ${branches}%`);
console.log(`Functions: ${functions}%`);
console.log(`Statements: ${statements}%`);
console.log('------------------------');

if (lines < threshold || functions < threshold || statements < threshold) {
    console.error(`Coverage threshold of ${threshold}% not met.`);
    process.exit(1);
} else if ( branches < branchThreshold ) {
    console.error(`Branch Coverage threshold of ${branchThreshold}% not met.`);
    process.exit(1);
}

console.log(`Coverage threshold of ${threshold}% and branch coverage threshold of ${branchThreshold}% met.`);
process.exit(0);
