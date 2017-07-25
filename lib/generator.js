const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const mkdirp = require('mkdirp');
const generate = module.exports = {};

generate.page = async (asyncapi, targetDir) => {
  fs.readFile(path.resolve(__dirname, '../templates/__index.html'), 'utf8', (err, data) => {
    if (err) throw err;

    const targetFile = path.resolve(targetDir, './index.html');
    const template = Handlebars.compile(data.toString());
    const content = template({ asyncapi });

    mkdirp(path.dirname(targetFile), err => {
      if (err) console.error(err);

      fs.writeFile(targetFile, content, { encoding: 'utf8', flag: 'w' }, (err) => {
        if (err) throw err;
      });
    });
  });
};

generate.content = async (asyncapi, targetDir) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(__dirname, '../templates/partials/content.html'), 'utf8', (err, data) => {
      if (err) return reject(err);

      const template = Handlebars.compile(data.toString());
      const content = template({ asyncapi });

      resolve(content);
    });
  });
};

generate.static = async (targetDir) => {
  const files = [
    './css/main.css'
  ];

  files.map(file => {
    const targetFile = path.resolve(targetDir, file.substr(0, 2) === '__' ? file.substr(2) : file);

    mkdirp(path.dirname(targetFile), err => {
      if (err) return console.error(err);

      fs.createReadStream(path.resolve(__dirname, '../templates/', file))
        .pipe(fs.createWriteStream(targetFile));
    });
  });
};
