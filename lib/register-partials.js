const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars');

const getFileContent = name => {
  return fs.readFileSync(path.resolve(__dirname, name), 'utf8');
};

Handlebars.registerPartial('content', getFileContent('../templates/partials/content.html'));
Handlebars.registerPartial('info', getFileContent('../templates/partials/info.html'));
Handlebars.registerPartial('security', getFileContent('../templates/partials/security.html'));
Handlebars.registerPartial('topics', getFileContent('../templates/partials/topics.html'));
Handlebars.registerPartial('topic', getFileContent('../templates/partials/topic.html'));
Handlebars.registerPartial('operation', getFileContent('../templates/partials/operation.html'));
Handlebars.registerPartial('messages', getFileContent('../templates/partials/messages.html'));
Handlebars.registerPartial('message', getFileContent('../templates/partials/message.html'));
Handlebars.registerPartial('schemas', getFileContent('../templates/partials/schemas.html'));
Handlebars.registerPartial('schema', getFileContent('../templates/partials/schema.html'));
Handlebars.registerPartial('schemaProp', getFileContent('../templates/partials/schema-prop.html'));
Handlebars.registerPartial('tags', getFileContent('../templates/partials/tags.html'));
