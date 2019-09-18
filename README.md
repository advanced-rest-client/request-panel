[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/request-panel.svg)](https://www.npmjs.com/package/@advanced-rest-client/request-panel)

[![Build Status](https://travis-ci.org/advanced-rest-client/api-url-data-model.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/request-panel)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/request-panel)

# request-panel

A full request and response view for the Advanced REST client

**See breaking changes and list of required dependencies at the bottom of this document**

```html
<request-panel value="{{body}}"></request-panel>
```

### API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)

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

### In a Polymer 3 element

```js
import {PolymerElement, html} from '@polymer/polymer';
import '@advanced-rest-client/request-panel/request-panel.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
    <request-panel content-type="application/json" value="{{body}}"></request-panel>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### Installation

```sh
git clone https://github.com/advanced-rest-client/request-panel
cd api-url-editor
npm install
npm install -g polymer-cli
```

### Running the demo locally

```sh
polymer serve --npm
open http://127.0.0.1:<port>/demo/
```

### Running the tests
```sh
polymer test --npm
```

## Breaking Changes in v3

Due to completely different dependencies import algorithm the CodeMirror and it's dependencies has to
be included to the web application manually, outside the component.

Web Components are ES6 modules and libraries like CodeMirror are not adjusted to
new spec. Therefore importing the library inside the component won't make it work
(no reference is created).

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
<!-- Headers hint support -->
<script src="../../../@advanced-rest-client/code-mirror-hint/headers-addon.js"></script>
<script src="../../../@advanced-rest-client/code-mirror-hint/show-hint.js"></script>
<script src="../../../@advanced-rest-client/code-mirror-hint/hint-http-headers.js"></script>
```

Finally, you should set the path to CodeMirror modes. When content type change
this path is used to load syntax highlighter. If you list all modes in the scripts
above then this is not required.

```html
<script>
CodeMirror.modeURL = 'node_modules/codemirror/mode/%N/%N.js';
</script>
```

The `jsonlint` library is a dependency of `@api-components/code-mirror-linter`
already included in the dependency graph of this element.

## Jexyl situaltion

Variables evaluator uses Jexyl library. It is not part of this component but the demo page.
Jexyl currently do not support ES modules and API components will not maitain fork of the
library (anymore). Therefore Jexyl is compiled locally when the component is installed for
development.
