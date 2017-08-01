const parser = require('./parser');
const generate = require('./generator');
const beautify = require('./beautifier');
require('./register-partials');
require('./helpers/handlebars');
const docgen = module.exports = {};

docgen.process = async (filePath, targetDir) => {
  const json = await parser(filePath);
  const asyncapi = beautify(json);

  await generate.page(asyncapi, targetDir);
  await generate.static(targetDir);
};

docgen.generate = async (yaml) => {
  const json = await parser.parseText(yaml);
  const asyncapi = beautify(json);

  return await generate.content(asyncapi);
};
