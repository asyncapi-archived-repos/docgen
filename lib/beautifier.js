const _ = require('lodash');
const hljs = require('highlight.js');
const md = require('markdown-it')({
  highlight (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>
${hljs.highlight(lang, str, true).value}
'</code></pre>`;
      } catch (__) {
        /* We did our best... */
      }
    }

    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  }
});

const sharedStart = (array) => {
  const A = array.concat().sort();
  const a1 = A[0], a2= A[A.length-1], L= a1.length;
  let i = 0;
  while (i<L && a1.charAt(i)=== a2.charAt(i)) i++;
  return a1.substring(0, i);
};

module.exports = (asyncapi) => {
  asyncapi.baseTopic = asyncapi.baseTopic || '';
  asyncapi.info = asyncapi.info || {};
  asyncapi.info.descriptionAsHTML = md.render(asyncapi.info.description || '');
  asyncapi.info.termsOfServiceAsHTML = md.render(asyncapi.info.termsOfService || '');

  _.each(asyncapi.topics, (topic, topicName) => {
    const baseTopic = asyncapi.baseTopic.trim();

    let newTopicName = `${baseTopic}.${topicName}`;
    newTopicName = newTopicName.replace(/\{(.*)\}/, ':$1');

    if (newTopicName !== topicName) {
      asyncapi.topics[newTopicName] = topic;
      delete asyncapi.topics[topicName];
      topicName = newTopicName;
    }

    _.each(topic, (operation, operationName) => {
      operation.summaryAsHTML = md.render(operation.summary || '');
      operation.descriptionAsHTML = md.render(operation.description || '');
      operation.formattedExample = JSON.stringify(operation.example || '', null, 2);
    });
  });

  if (!asyncapi.components) asyncapi.components = {};
  if (!asyncapi.components.messages) asyncapi.components.messages = {};
  if (!asyncapi.components.schemas) asyncapi.components.schemas = {};

  _.each(asyncapi.components.messages, (message, messageName) => {
    message.summaryAsHTML = md.render(message.summary || '');
    message.descriptionAsHTML = md.render(message.description || '');
    message.formattedExample = JSON.stringify(message.example || '', null, 2);
  });

  _.each(asyncapi.components.schemas, (schema, schemaName) => {
    schema.formattedExample = JSON.stringify(schema.example || '', null, 2);
  });

  const commonPrefix = sharedStart(Object.keys(asyncapi.topics));
  const levels = commonPrefix.split('.').length - 1;
  asyncapi.__commonPrefix = commonPrefix.split('.').slice(0, levels).join('.');

  return asyncapi;
};
