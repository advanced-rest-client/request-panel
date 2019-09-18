import { html } from 'lit-html';
import { ArcDemoPage } from '@advanced-rest-client/arc-demo-helper/ArcDemoPage.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@polymer/paper-toast/paper-toast.js';
import '@advanced-rest-client/variables-evaluator/variables-evaluator.js';
import '@advanced-rest-client/variables-manager/variables-manager.js';
import '@advanced-rest-client/oauth-authorization/oauth2-authorization.js';
import '@advanced-rest-client/oauth-authorization/oauth1-authorization.js';
import '@advanced-rest-client/arc-models/url-history-model.js';
import '@advanced-rest-client/arc-models/variables-model.js';
import '@polymer/iron-media-query/iron-media-query.js';
import '../request-panel.js';

class DemoPage extends ArcDemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'compatibility',
      'outlined',
      'readOnly',
      'narrow',
      'ignoreContentOnGet',
      'request'
    ]);
    this._componentName = 'request-panel';
    this.demoStates = ['Filled', 'Outlined', 'Anypoint'];

    this._demoStateHandler = this._demoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
    this._narrowHandler = this._narrowHandler.bind(this);
    this._requestHandler = this._requestHandler.bind(this);

    this.oauth2RedirectUri = location.href;

    window.addEventListener('abort-api-request', () => this.openToast('requestAbort'));
    window.addEventListener('request-clear-state', () => this.openToast('clearToast'));
    window.addEventListener('request-save-state', () => this.openToast('saveToast'));
    window.addEventListener('request-use-xhr-changed', () => this.openToast('xhrToast'));
    window.addEventListener('variable-store-action', () => this.openToast('varStore'));
    window.addEventListener('variable-update-action', () => this.openToast('varUpdate'));
    window.addEventListener('api-request', this._requestHandler);

    this.request = {
      url: window.location.href,
      method: 'GET'
    };
  }

  _toggleMainOption(e) {
    const { name, checked } = e.target;
    this[name] = checked;
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.outlined = state === 1;
    this.compatibility = state === 2;
  }

  _narrowHandler(e) {
    this.narrow = e.detail.value;
  }

  openToast(id) {
    document.getElementById(id).opened = true;
  }

  _requestHandler(e) {
    this.openToast('transportToast');
    this.sendEvent('url-history-store', {
      value: e.detail.url
    }, true);

    this.sendRequest(e.detail);
  }

  sendEvent(type, details, cancelable, node) {
    const e = new CustomEvent(type, {
      detail: details,
      cancelable: cancelable || false,
      bubbles: true
    });
    (node || document.body).dispatchEvent(e);
    return e;
  }

  async sendRequest(request) {
    console.log(request);
    let startTime = Date.now();
    try {
      const override = await this._preparePreRequestVariables(request);
      this._notifyVariablesChange(override);
      const _eval = document.getElementById('eval');
      const transportData = await _eval.processBeforeRequest(request, override);
      const init = {
        method: transportData.method,
        headers: this.createHeaders(transportData.headers)
      };
      if (['GET', 'HEAD'].indexOf(transportData.method) === -1 && transportData.payload) {
        init.body = transportData.payload;
      }
      this.rsp = {
        id: transportData.id,
        request: transportData,
        response: {},
        isXhr: true,
        loadingTime: 0
      };
      startTime = Date.now();
      const response = await fetch(transportData.url, init);
      this.rsp.loadingTime = Date.now() - startTime;
      let headers = '';
      response.headers.forEach((value, name) => {
        headers += `${name}: ${value}\n`;
      });
      this.rsp.response.headers = headers;
      this.rsp.response.status = response.status;
      this.rsp.response.statusText = response.statusText;
      this.rsp.response.url = response.url;
      const body = await response.text();
      this.rsp.response.payload = body;
      document.body.dispatchEvent(new CustomEvent('api-response', {
        bubbles: true,
        detail: this.rsp
      }));
    } catch (e) {
      this.rsp.isError = true;
      this.rsp.error = e;
      this.rsp.loadingTime = Date.now() - startTime;
      document.body.dispatchEvent(new CustomEvent('api-response', {
        bubbles: true,
        detail: this.rsp
      }));
    }
  }
  /**
   * Prepares scripts context override values for variables evaluator.
   * If there are actions defined for the `beforeRequest` key then it will
   * get list of variables and create the override object.
   *
   * @param {Object} request ARC request object
   * @return {Promise} Promise resolved to an object of variables
   * or undefined if actions not defined.
   */
  async _preparePreRequestVariables(request) {
    const actions = request.requestActions;
    if (!actions) {
      return;
    }
    const vars = actions.variables;
    if (!vars || !vars.length) {
      return;
    }
    const result = {};
    vars.forEach(function(item) {
      if (item.enabled === false) {
        return;
      }
      result[item.variable] = item.value;
    });
    const _eval = document.getElementById('eval');
    return await _eval.evaluateVariables(result);
  }
  /**
   * Notifies variable change event listeners
   * @param {Object} obj
   */
  _notifyVariablesChange(obj) {
    if (!obj) {
      return;
    }
    Object.keys(obj).forEach((key) => {
      const detail = {
        variable: key,
        value: obj[key]
      };
      document.body.dispatchEvent(new CustomEvent('variable-update-action', {
        composed: true,
        bubbles: true,
        detail
      }));
    });
  }

  createHeaders(data) {
    const headers = new Headers();
    if (data) {
      data.split('\n').forEach((line) => {
        const pair = line.split(':');
        const n = pair[0] ? pair[0].trim() : '';
        if (!n) {
          return;
        }
        const v = pair[1] ? pair[1].trim() : '';
        headers.append(n, v);
      });
    }
    return headers;
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      outlined,
      readOnly,
      narrow,
      oauth2RedirectUri,
      request
    } = this;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the REST APIs menu element with various
          configuration options.
        </p>

        <arc-interactive-demo
          .states="${demoStates}"
          @state-chanegd="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >
          <request-panel
            ?compatibility="${compatibility}"
            ?outlined="${outlined}"
            ?readOnly="${readOnly}"
            ?narrow="${narrow}"
            .oauth2RedirectUri="${oauth2RedirectUri}"
            .editorRequest="${request}"
            slot="content"
          ></request-panel>

          <label slot="options" id="mainOptionsLabel">Options</label>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="readOnly"
            @change="${this._toggleMainOption}"
          >
            Read only
          </anypoint-checkbox>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="ignoreContentOnGet"
            @change="${this._toggleMainOption}"
          >
            Ignore content-* headers on GET
          </anypoint-checkbox>
        </arc-interactive-demo>
      </section>
    `;
  }

  contentTemplate() {
    return html`
      <url-history-model></url-history-model>
      <variables-model></variables-model>
      <variables-manager></variables-manager>
      <variables-evaluator id="eval" nobeforerequest jexlpath="ArcVariables.JexlDev"></variables-evaluator>
      <oauth2-authorization></oauth2-authorization>
      <oauth1-authorization></oauth1-authorization>
      <paper-toast id="transportToast" text="api-request event handled"></paper-toast>
      <paper-toast id="requestAbort" text="Request abort event detected"></paper-toast>
      <paper-toast id="clearToast" text="Clear request state detected"></paper-toast>
      <paper-toast id="saveToast" text="Save request state detected"></paper-toast>
      <paper-toast id="xhrToast" text="Toggle XHR request state changed"></paper-toast>
      <paper-toast id="varUpdate" text="Update variable value event handled"></paper-toast>
      <paper-toast id="varStore" text="Store variable value event handled"></paper-toast>

      <iron-media-query
        query="(max-width: 768px)"
        @query-matches-changed="${this._narrowHandler}"></iron-media-query>

      <h2>HTTP request panel</h2>
      ${this._demoTemplate()}
    `;
  }
}

const instance = new DemoPage();
instance.render();
window._demo = instance;
