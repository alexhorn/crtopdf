#!/usr/bin/env node
const fs = require('fs');
const CrToPdf = require('./crtopdf');
const program = require('commander');

program
  .option('-u, --url <value>', 'Source URL')
  .option('-o, --output <value>', 'Output path')
  .option('--orientation [type]', 'Page orientation (landscape or portrait)')
  .option('--print-background', 'Print background images')
  .option('--format [type]', 'Page size (A0-9, letter, legal or ledger)')
  .option('--margin-top [n]', 'Top margin')
  .option('--margin-bottom [n]', 'Bottom margin')
  .option('--margin-left [n]', 'Left margin')
  .option('--margin-right [n]', 'Right margin')
  .option('--page-ranges [value]', 'Page ranges (e.g. 1-2, 4-5)')
  .option('--chrome-path [value]', 'Path to Chrome or Chromium')
  .parse(process.argv);

if (!program.url) {
  throw new Error('--url required');
}
if (!program.output) {
  throw new Error('--output required');
}

let pdf = new CrToPdf({
  chromePath: program.chromePath,
});
pdf.init()
.then(() => pdf.convert({
  url: program.url,
  orientation: program.orientation,
  printBackground: program.printBackground,
  format: program.format,
  marginTop: program.marginTop,
  marginBottom: program.marginBottom,
  marginLeft: program.marginLeft,
  marginRight: program.marginRight,
  pageRanges: program.pageRanges,
}))
.then((buf) => {
  fs.writeFileSync(program.output, buf);
})
.then(() => pdf.dispose())
.catch((err) => {
  console.error(err);
  process.exit(1);
});
