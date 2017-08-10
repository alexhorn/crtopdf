const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
const EventEmitter = require('events');
const getPort = require('get-port');
const Semaphore = require('./semaphore');

const PAGE_SIZES = {
  'a0': {width: 33.1, height: 46.8},
  'a1': {width: 23.4, height: 33.1},
  'a2': {width: 16.5, height: 23.4},
  'a3': {width: 11.7, height: 16.5},
  'a4': {width: 8.3, height: 11.7},
  'a5': {width: 5.8, height: 8.3},
  'a6': {width: 4.1, height: 5.8},
  'a7': {width: 2.9, height: 4.1},
  'a8': {width: 2.0, height: 2.9},
  'letter': {width: 8.5, height: 11},
  'legal': {width: 8.5, height: 14},
  'legder': {width: 17, height: 11},
};
const CM_PER_INCH = 2.54;

/**
 * Options for generating a PDF.
 * @typedef {Object} Options
 * @property {string} url - URL
 * @property {'portrait'|'landscape'} [orientaton] - Paper orientation
 * @property {boolean} [printBackground] - Print background graphics
 * @property {'a0'|'a1'|'a2'|'a3'|'a4'|'a5'|'a6'|'a7'|'a8'|'letter'|'legal'|'ledger'} [format] - Paper size
 * @property {number} [marginTop] - Top margin in cm
 * @property {number} [marginBottom] - Bottom margin in cm
 * @property {number} [marginLeft] - Left margin in cm
 * @property {number} [marginRight] - Right margin in cm
 * @property {string} [page] - Page ranges, e.g. "1-5, 8, 11-13"
 */

/**
 * Class for generating a PDF from a web page.
 * Requires Chrome to be installed on the machine.
 * @example
 * var fs = require('fs');
 * var CrToPdf = require('crtopdf');
 *
 * var pdf = new CrToPdf();
 *
 * pdf.init()
 * .then(function () {
 *   return pdf.convert({ url: 'https://en.wikipedia.org' });
 * })
 * .then(function (buf) {
 *   fs.writeFileSync('wikipedia.pdf', buf);
 * })
 * .then(function () {
 *   pdf.dispose();
 * });
 */
class CrToPdf extends EventEmitter {
  constructor() {
    super();
    this.sem = new Semaphore(1);
  }

  /**
   * Initializes Chrome
   */
  async init() {
    this.chrome = await chromeLauncher.launch({
      port: await getPort(),
      chromeFlags: [
        '--disable-gpu',
        '--headless',
      ],
    });
    this.protocol = await CDP({port: this.chrome.port});
    this.connected = true;
    this.protocol.on('disconnect', () => {
      this.connected = false;
      this.emit('disconnect');
    });
  }

  /**
   * Disposes Chrome
   */
  async dispose() {
    await this.protocol.close();
    await this.chrome.kill();
  }

  /**
   * Generates a PDF from a web page.
   * Do not call this method until the previous operation has finished.
   * @param {Options} opts - Options
   * @return {Buffer} PDF data
   */
  async convert(opts) {
    if (!this.connected) {
      throw new Error('Not connected. Either init() wasn\'t called or Chrome crashed.');
    }

    await this.sem.down();

    try {
      const {Page} = this.protocol;

      await Page.enable();

      await Page.navigate({url: opts.url});

      await new Promise((resolve, reject) => this.protocol.once('Page.loadEventFired', resolve));

      let pageSize = PAGE_SIZES[(opts.format || 'a4').toLowerCase()];
      let b64 = await Page.printToPDF({
        landscape: !!opts.orientation && opts.orientation.toLowerCase() === 'landscape',
        printBackground: opts.printBackground,
        paperWidth: pageSize.width,
        paperHeight: pageSize.height,
        marginTop: opts.marginTop / CM_PER_INCH,
        marginBottom: opts.marginBottom / CM_PER_INCH,
        marginLeft: opts.marginLeft / CM_PER_INCH,
        marginRight: opts.marginRight / CM_PER_INCH,
        pageRanges: opts.pageRanges,
      });

      return new Buffer(b64.data, 'base64');
    } finally {
      this.sem.up();
    }
  }
};

module.exports = CrToPdf;
