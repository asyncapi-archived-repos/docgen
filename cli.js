#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const generate = require('./lib/docgen').process;
const args = process.argv.slice(2);

const showHelp = () => {
  console.log(`
Usage: asyncapi-docgen machineReadableFile outputPath

machineReadableFile: It must point to a JSON or YAML file containing your AsyncAPI specification.
outputPath: It must point to the directory in which you want your documentation to be generated.
  `);
};

if (!args[0]) return showHelp();
if (fs.exists(args[0]) && !fs.lstatSync(args[0]).isFile()) return showHelp();
if (!args[1]) return showHelp();
if (fs.exists(args[1]) && !fs.lstatSync(args[1]).isDirectory()) return showHelp();

const machineReadablePath = path.resolve(process.cwd(), args[0]);
const outputPath = path.resolve(process.cwd(), args[1]);

console.log('Reading file from', machineReadablePath, '...');
console.log('Generating documentation at', outputPath, '...');

mkdirp(outputPath, err => {
  if (err) return console.error(err);

  generate(machineReadablePath, outputPath).then(() => {
    console.log('Done!');
  }).catch(err => console.error(err));
});
