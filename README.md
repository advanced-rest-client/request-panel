[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/request-panel.svg)](https://www.npmjs.com/package/@advanced-rest-client/request-panel)

[![Build Status](https://travis-ci.org/advanced-rest-client/request-panel.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/request-panel)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/request-panel)

# request-panel

A full request and response view for the Advanced REST client

**See breaking changes and list of required dependencies at the bottom of this document**

## Usage

### Installation
```
npm install --save @advanced-rest-client/request-panel
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import '@advanced-rest-client/request-panel/request-panel.js';
    </script>
  </head>
  <body>
    <request-panel></request-panel>
  </body>
</html>
```

### In a LitElement

```javascript
import { LitElement, html } from 'lit-element';
import '@advanced-rest-client/request-panel/request-panel.js';

class SampleElement extends LitElement {
  render() {
    const {
      compatibility,
      outlined,
      readOnly,
      narrow,
      oauth2RedirectUri,
      request
    } = this;
    return html`
    <request-panel
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      ?readOnly="${readOnly}"
      ?narrow="${narrow}"
      .oauth2RedirectUri="${oauth2RedirectUri}"
      .editorRequest="${request}"
    ></request-panel>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

## Development

```sh
git clone https://github.com/advanced-rest-client/request-panel
cd request-panel
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests
```sh
npm test
```

## Breaking Changes in v3

This is to be added to the document before initializing the element.

```html
<!-- CodeMirror + modes loader -->
<script src="node_modules/codemirror/lib/codemirror.js"></script>
<script src="node_modules/codemirror/addon/mode/loadmode.js"></script>
<script src="node_modules/codemirror/mode/meta.js"></script>
<!--Default set of parsers, add as many as you need -->
<script src="node_modules/codemirror/mode/javascript/javascript.js"></script>
<script src="node_modules/codemirror/mode/xml/xml.js"></script>
<script src="node_modules/codemirror/mode/htmlmixed/htmlmixed.js"></script>
<!-- JSON linter -->
<script src="node_modules/jsonlint/lib/jsonlint.js"></script>
<script src="node_modules/codemirror/addon/lint/lint.js"></script>
<script src="node_modules/codemirror/addon/lint/json-lint.js"></script>
<link rel="stylesheet" href="node_modules/codemirror/addon/lint/lint.css" />
```

```html
<script>
CodeMirror.modeURL = 'node_modules/codemirror/mode/%N/%N.js';
</script>
```

## Jexyl situation

Variables evaluator uses Jexyl library. It is not part of this component but the demo page.
Jexyl currently do not support ES modules and API components will not maintain fork of the
library (any more). Therefore Jexyl is compiled locally when the component is installed for
development.
