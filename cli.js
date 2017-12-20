#!/usr/bin/env node

const path = require('path');
const program = require('commander');
const packageInfo = require('./package.json');
const mkdirp = require('mkdirp');
const generate = require('./lib/docgen').process;

const red = text => `\x1b[31m${text}\x1b[0m`;
const magenta = text => `\x1b[35m${text}\x1b[0m`;
const yellow = text => `\x1b[33m${text}\x1b[0m`;
const green = text => `\x1b[32m${text}\x1b[0m`;

let asyncAPI;

const parseOutput = dir => path.resolve(dir);

const showError = err => {
  console.error(red('Something went wrong:'));
  console.error(red(err.stack || err.message));
};

program
  .version(packageInfo.version)
  .arguments('<asyncAPI>')
  .action((asyncAPIPath) => {
    asyncAPI = path.resolve(asyncAPIPath);
  })
  .option('-o, --output <outputDir>', 'directory where to put the generated files (defaults to current directory)', parseOutput, process.cwd())
  .parse(process.argv);

if (!asyncAPI) {
  console.error(red('> Path to AsyncAPI file not provided.'));
  program.help(); // This exits the process
}

mkdirp(program.output, err => {
  if (err) return console.error(err);

  generate(asyncAPI, program.output).then(() => {
    console.log(green('Done! ✨'));
    console.log(yellow('Check out your shiny new API documentation at ') + magenta(program.output) + yellow('.'));
  }).catch(showError);
});

process.on('unhandledRejection', showError);
