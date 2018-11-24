const OpenAPISampler = require('openapi-sampler');
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
  const A = array.concat([]).sort();
  const a1 = A[0] || '', a2= A[A.length-1], L= a1.length;
  let i = 0;
  while (i<L && a1.charAt(i)=== a2.charAt(i)) i++;
  return a1.substring(0, i);
};

const resolveAllOf = (schema) => {
  if (schema.allOf) {
    const schemas = [];
    schema.allOf.forEach((s) => {
      schemas.push(s);
    });

    return resolveAllOf(_.merge({}, ...schemas));
  }

  if (schema.properties) {
    const transformed = {};

    for (const key in schema.properties) {
      if (schema.properties[key].allOf) {
        transformed[key] = resolveAllOf(schema.properties[key]);
        continue;
      }
      transformed[key] = schema.properties[key];
    }

    return {
      ...schema,
      ...{ properties: transformed }
    };
  }

  return schema;
};

const stringify = json => JSON.stringify(json || '', null, 2);
const generateExample = schema => OpenAPISampler.sample(schema);

const beautifyMessage = (message) => {
  if (message.payload) message.payload = resolveAllOf(message.payload);
  if (message.headers) message.headers = resolveAllOf(message.headers);
  message.summaryAsHTML = md.render(message.summary || '');
  message.descriptionAsHTML = md.render(message.description || '');
  message.formattedExample = stringify(message.example);

  if (message.headers) {
    message.generatedHeadersExample = stringify(generateExample(message.headers));
  }
  if (message.payload) {
    message.generatedPayloadExample = stringify(generateExample(message.payload));
  }

  return message;
};

module.exports = (asyncapi) => {
  asyncapi.baseTopic = asyncapi.baseTopic || '';
  asyncapi.info = asyncapi.info || {};
  asyncapi.info.descriptionAsHTML = md.render(asyncapi.info.description || '');

  if (asyncapi.servers) {
    _.each(asyncapi.servers, server => {
      server.descriptionAsHTML = md.render(server.description || '');
      _.each(server.variables, variable => {
        variable.descriptionAsHTML = md.render(variable.description || '');
      });
    });
  }

  if (asyncapi.security) {
    asyncapi._security = [];

    _.each(asyncapi.security, security => {
      const name = Object.keys(security)[0];
      if (!asyncapi.components || !asyncapi.components.securitySchemes || !asyncapi.components.securitySchemes[name]) {
        throw new Error(`Security definition "${name}" is not in included in #/components/securitySchemes.`);
      }

      asyncapi.components.securitySchemes[name].descriptionAsHTML = md.render(asyncapi.components.securitySchemes[name].description || '');
      asyncapi._security.push(asyncapi.components.securitySchemes[name]);
    });
  }

  _.each(asyncapi.topics, (topic, topicName) => {
    const separator = asyncapi['x-topic-separator'] || '.';
    const baseTopic = asyncapi.baseTopic.trim();

    const newTopicName = baseTopic.length ? `${baseTopic}${separator}${topicName}` : topicName;
    if (newTopicName !== topicName) {
      asyncapi.topics[newTopicName] = topic;
      delete asyncapi.topics[topicName];
    }

    if (topic.publish) {
      beautifyMessage(topic.publish);
      if (topic.publish.oneOf) _.each(topic.publish.oneOf, beautifyMessage);
    }

    if (topic.subscribe) {
      beautifyMessage(topic.subscribe);
      if (topic.subscribe.oneOf) _.each(topic.subscribe.oneOf, beautifyMessage);
    }

    if (topic.parameters) {
      topic.parameters.forEach((param) => {
        param.descriptionAsHTML = md.render(param.description || '');
      });
    }
  });

  if (!asyncapi.components) asyncapi.components = {};
  if (!asyncapi.components.messages) asyncapi.components.messages = {};
  if (!asyncapi.components.schemas) asyncapi.components.schemas = {};

  _.each(asyncapi.components.messages, beautifyMessage);

  _.each(asyncapi.components.schemas, (schema, schemaName) => {
    schema = resolveAllOf(schema);
    schema.formattedExample = stringify(schema.example);
    schema.generatedExample = stringify(generateExample(schema));
    asyncapi.components.schemas[schemaName] = schema;
  });

  const commonPrefix = sharedStart(Object.keys(asyncapi.topics||{}));
  const levels = commonPrefix.split('.').length - 1;
  asyncapi.__commonPrefix = commonPrefix.split('.').slice(0, levels).join('.');

  return asyncapi;
};
