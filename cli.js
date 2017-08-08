#!/usr/bin/env node
const fs = require('fs');
const CrToPdf = require('./crtopdf');
const argv = require('yargs')
  .options({
    'url': {
      alias: 'u',
      demandOption: true
    },
    'output': {
      alias: 'o',
      demandOption: true
    },
    'orientation': {
      default: 'portrait'
    },
    'print-background': {
      default: undefined,
      type: 'boolean'
    },
    'format': {
      default: 'a4'
    },
    'margin-top': {
      default: undefined
    },
    'margin-bottom': {
      default: undefined
    },
    'margin-left': {
      default: undefined
    },
    'margin-right': {
      default: undefined
    },
    'page-ranges': {
      default: undefined
    }
  })
  .argv;

var pdf = new CrToPdf();
pdf.init()
.then(() => pdf.convert({
  url: argv.url,
  orientation: argv.orientation,
  printBackground: argv.printBackground,
  format: argv.format,
  marginTop: argv.marginTop,
  marginBottom: argv.marginBottom,
  marginLeft: argv.marginLeft,
  marginRight: argv.marginRight,
  pageRanges: argv.pageRanges
}))
.then(buf => {
  fs.writeFileSync(argv.output, buf);
})
.then(() => pdf.dispose())
.catch(err => {
  console.error(err);
  process.exit(1);
});
