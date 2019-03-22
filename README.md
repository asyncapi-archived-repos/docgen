## Please note: this project is deprecated in favour of [AsyncAPI-Generator](https://github.com/asyncapi/generator).

<p align="center"><img src="logo.png"></p>
<p align="center">
  <strong>AsyncAPI Documentation Generator</strong>
</p>
<p align="center">
  <em>Use your AsyncAPI definition to generate beautiful<br>human-readable documentation for your API.</em>
</p>
<br><br>

![](screenshot.png)

## Install

To use it from the CLI:

```bash
npm install -g asyncapi-docgen
```

To use it as a module in your project:

```bash
npm install --save asyncapi-docgen
```

## Usage

### From the command-line interface (CLI)

```bash
  Usage: adg [options] <asyncAPI>


  Options:

    -V, --version             output the version number
    -o, --output <outputDir>  directory where to put the generated files (defaults to current directory)
    -h, --help                output usage information
```

#### Examples

The shortest possible syntax:
```bash
adg asyncapi.yaml
```

Specify where to put the generated documentation:
```bash
adg asyncapi.yaml -o ./docs
```

### As a module in your project

Place a file called `asyncapi.yaml` in the same directory as the following script, and then run it. You can obtain the content of the file from [editor.asyncapi.org](https://editor.asyncapi.org), not included here for brevity.

> Note that you'll need to install `asyncapi-docgen` for it to work. Either run `npm install asyncapi-docgen` in your terminal or add it to your `package.json` file as a dependency.

```js
const fs = require('fs');
const path = require('path');
const docs = require('asyncapi-docgen');

// Read file content
const asyncapi = fs.readFileSync(path.resolve(__dirname, 'asyncapi.yaml'), 'utf8');

(async function() {
  try {
    const html = await docs.generateFullHTML(asyncapi);
    console.log('Done!');
    console.log(html);
  } catch (e) {
    console.error(`Something went wrong: ${e.message}`);
  }
})();
```

#### Using promises

```js
const fs = require('fs');
const path = require('path');
const docs = require('asyncapi-docgen');

// Read file content
const asyncapi = fs.readFileSync(path.resolve(__dirname, 'asyncapi.yaml'), 'utf8');

docs
  .generateFullHTML(asyncapi)
  .catch((err) => {
    console.error(`Something went wrong: ${err.message}`);
  })
  .then((html) => {
    console.log('Done!');
    console.log(html);
  });
```

## Custom specification extensions

This package makes use of two different custom specification extensions:

|Extension|Path|Description|
|---------|----|-----------|
|`x-logo`|`/info`|URL of the logo rendered on the top left corner of the documentation.|
|`x-topic-separator`|`/`|A string to use as the topic separator.|

#### Examples

Custom logo:

```yaml
asyncapi: '1.0.0'
info:
  title: My API
  x-logo: https://your-company.com/logo.png
```

MQTT-style topic separator:

```yaml
asyncapi: '1.0.0'
x-topic-separator: '/'
```

> **ATTENTION:** This will not replace your topic separators. E.g., if your baseTopic is `my.company` and one of your topics is `user.signup`, the result of concatenating both, in the example above, would be `my.company/user.signup` and not `my/company/user/signup`. If you aim for the latter, your baseTopic should be `my/company` and your topic should be `user/signup`.

## Requirements

* Node.js v7.6+

## Author

Fran Méndez ([@fmvilas](http://twitter.com/fmvilas))
