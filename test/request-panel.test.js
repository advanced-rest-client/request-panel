import { fixture, assert, html, aTimeout } from '@open-wc/testing';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import * as sinon from 'sinon';
import '../request-panel.js';

describe('<request-panel>', function() {
  async function basicFixture() {
    return await fixture(html`
      <request-panel></request-panel>
    `);
  }

  async function requestFixture(request, editorState) {
    return await fixture(html`
      <request-panel
        .editorRequest="${request}"
        .editorState="${editorState}"></request-panel>
    `);
  }

  async function clientCertificateImportFixture() {
    return await fixture(html`
      <request-panel clientCertificateImport></request-panel>
    `);
  }

  function appendRequestData(element, request) {
    request = request || {};
    const editor = element.shadowRoot.querySelector('request-editor');
    editor.httpMethod = request.method || 'get';
    editor.url = request.url || 'https://domain.com';
    editor.headers = request.headers || '';
    editor.payload = request.payload;
  }

  describe('Initialization', () => {
    it('responseMeta is not computed', async () => {
      const element = await basicFixture();
      assert.isUndefined(element.responseMeta);
    });

    it('hasResponse is false', async () => {
      const element = await basicFixture();
      assert.isFalse(element.hasResponse);
    });

    it('api-request is dispatched', async () => {
      const element = await basicFixture();
      appendRequestData(element);
      const spy = sinon.spy();
      element.addEventListener('api-request', spy);
      const editor = element.shadowRoot.querySelector('request-editor');
      editor.send();
    });
  });

  describe('send()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.request = {
        url: 'https://domain.com/',
        method: 'GET',
        headers: 'accept: text/plain'
      };
    });

    it('Calls send() on the editor', () => {
      const node = element.shadowRoot.querySelector('request-editor');
      const spy = sinon.spy(node, 'send');
      element.send();
      assert.isTrue(spy.called);
    });
  });

  describe('abort()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.request = {
        url: 'https://domain.com/',
        method: 'GET',
        headers: 'accept: text/plain'
      };
    });

    it('Calls abort() on the editor', () => {
      const node = element.shadowRoot.querySelector('request-editor');
      const spy = sinon.spy(node, 'abort');
      element.abort();
      assert.isTrue(spy.called);
    });
  });

  describe('clear()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.request = {
        url: 'https://domain.com/',
        method: 'GET',
        headers: 'accept: text/plain'
      };
    });

    it('Calls clearRequest() on the editor', () => {
      const node = element.shadowRoot.querySelector('request-editor');
      const spy = sinon.spy(node, 'clearRequest');
      element.clear();
      assert.isTrue(spy.called);
    });
  });

  describe('notifyResize()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.request = {
        url: 'https://domain.com/',
        method: 'GET',
        headers: 'accept: text/plain'
      };
    });

    it('Calls notifyResize() on the editor', () => {
      const node = element.shadowRoot.querySelector('request-editor');
      const spy = sinon.spy(node, 'notifyResize');
      element.notifyResize();
      assert.isTrue(spy.called);
    });
  });

  describe('_abortHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.lastRequestId = 'test-id';
      element.loading = true;
    });

    it('Clears lastRequestId', () => {
      element._abortHandler();
      assert.isUndefined(element.lastRequestId);
    });

    it('Clears loading', () => {
      element._abortHandler();
      assert.isFalse(element.loading);
    });

    it('Calls _abortHandler from the event', () => {
      const editor = element.shadowRoot.querySelector('request-editor');
      editor.dispatchEvent(new CustomEvent('abort-api-request', {
        bubbles: true,
        composed: true
      }));
      assert.isUndefined(element.lastRequestId);
      assert.isFalse(element.loading);
    });
  });

  describe('_clearHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.lastRequestId = 'test-id';
      element.loading = true;
    });

    it('Clears lastRequestId', () => {
      element._clearHandler();
      assert.isUndefined(element.lastRequestId);
    });

    it('Clears loading', () => {
      element._clearHandler();
      assert.isFalse(element.loading);
    });

    it('Calls _clearHandler from the event', () => {
      const editor = element.shadowRoot.querySelector('request-editor');
      editor.dispatchEvent(new CustomEvent('request-clear-state', {
        bubbles: true,
        composed: true
      }));
      assert.isUndefined(element.lastRequestId);
      assert.isFalse(element.loading);
    });
  });

  describe('_apiResponseHandler()', () => {
    function fire() {
      const detail = {
        id: 'test-id',
        request: {
          url: 'https://domain.com/',
          method: 'GET',
          headers: 'accept: text/plain'
        },
        response: {
          status: 200,
          statusText: 'OK',
          payload: 'Hello world',
          headers: 'content-type: text/plain'
        },
        loadingTime: 124.12345678,
        isError: false,
        isXhr: true
      };
      const e = new CustomEvent('api-response', {
        bubbles: true,
        detail
      });
      document.body.dispatchEvent(e);
    }
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.lastRequestId = 'test-id';
      element.loading = true;
    });

    it('Ignores event when different id', () => {
      element.lastRequestId = 'other-id';
      fire();
      assert.isTrue(element.loading);
    });

    it('Clears loading', () => {
      fire();
      assert.isFalse(element.loading);
    });

    it('Propagates the response', () => {
      fire();
      assert.isTrue(element.hasResponse);
      assert.typeOf(element.responseMeta, 'object');
    });
  });

  describe('_changeUrlHandler()', () => {
    function fire(element) {
      const e = new CustomEvent('url-change-action', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: {
          url: 'http://test.com'
        }
      });
      element.dispatchEvent(e);
      return e;
    }
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Sets new URL', () => {
      const e = fire(element);
      assert.equal(element.editorRequest.url, e.detail.url);
    });

    it('Event is cancelled', () => {
      const e = fire(element);
      assert.isTrue(e.defaultPrevented);
    });
  });

  describe('_boundEventsChanged()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Does nothing when argument is false', () => {
      const old = element.eventsTarget;
      element._boundEventsChanged(false);
      assert.isTrue(element.eventsTarget === old);
    });

    it('Sets self as event target when argument is true', () => {
      element._boundEventsChanged(true);
      assert.isTrue(element.eventsTarget === element);
    });
  });

  describe('XHR response handling', () => {
    function propagate(element) {
      const detail = {
        request: {
          url: 'https://domain.com/',
          method: 'GET',
          headers: 'accept: text/plain'
        },
        response: {
          status: 200,
          statusText: 'OK',
          payload: 'Hello world',
          headers: 'content-type: text/plain'
        },
        loadingTime: 124.12345678,
        isError: false,
        isXhr: true
      };
      element._propagateResponse(detail);
    }

    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('hasResponse is set', () => {
      propagate(element);
      assert.isTrue(element.hasResponse);
    });

    it('responseMeta is set', () => {
      propagate(element);
      assert.typeOf(element.responseMeta, 'object');
    });

    it('isErrorResponse is false', () => {
      propagate(element);
      assert.isFalse(element.isErrorResponse);
    });

    it('responseError is undefined', () => {
      propagate(element);
      assert.isUndefined(element.responseError, 'error is undefined');
    });

    it('request is set', () => {
      propagate(element);
      assert.typeOf(element.request, 'object');
    });

    it('response is set', () => {
      propagate(element);
      assert.typeOf(element.response, 'object');
    });

    it('loadingTime is set', () => {
      propagate(element);
      assert.equal(element.responseMeta.loadingTime, 124.12345678);
    });

    it('responseIsXhr is true', () => {
      propagate(element);
      assert.isTrue(element.responseMeta.responseIsXhr);
    });

    it('redirects is undefined', () => {
      propagate(element);
      assert.isUndefined(element.responseMeta.redirects);
    });

    it('redirectsTiming is undefined', () => {
      propagate(element);
      assert.isUndefined(element.responseMeta.redirectsTiming, 'array');
    });

    it('timing is undefined', () => {
      propagate(element);
      assert.isUndefined(element.responseMeta.timing, 'object');
    });

    it('source message is undefined', () => {
      propagate(element);
      assert.isUndefined(element.responseMeta.sourceMessage, 'string');
    });
  });

  describe('Advanced response handling', () => {
    function propagate(element) {
      let headers = 'content-type: text/plain\nlocation: ';
      headers += 'https://other.domain.com\ncontent-length: 30';
      const detail = {
        request: {
          url: 'https://domain.com/',
          method: 'GET',
          headers: 'accept: text/plain'
        },
        response: {
          status: 200,
          statusText: 'OK',
          payload: 'Hello world',
          headers: 'content-type: text/plain'
        },
        loadingTime: 124.12345678,
        isError: false,
        isXhr: false,
        sentHttpMessage: 'GET / HTTP/1.1\nHost: domain.com\naccept: text/plain\n\n\n',
        redirects: [{
          status: 301,
          statusText: 'Not here',
          payload: 'Go to https://other.domain.com',
          headers: headers
        }],
        timing: {
          blocked: 12.0547856,
          dns: 0.12,
          connect: 112.21458762,
          send: 4.4748989,
          wait: 15.8436988,
          receive: 65.125412256,
          ssl: 10
        },
        redirectsTiming: [{
          blocked: 12.0547856,
          dns: 0.12,
          connect: 112.21458762,
          send: 4.4748989,
          wait: 15.8436988,
          receive: 65.125412256,
          ssl: 10
        }]
      };
      element._propagateResponse(detail);
    }
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('hasResponse is set', () => {
      propagate(element);
      assert.isTrue(element.hasResponse);
    });

    it('responseMeta is set', () => {
      propagate(element);
      assert.typeOf(element.responseMeta, 'object');
    });

    it('isErrorResponse is false', () => {
      propagate(element);
      assert.isFalse(element.isErrorResponse);
    });

    it('responseError is undefined', () => {
      propagate(element);
      assert.isUndefined(element.responseError, 'error is undefined');
    });

    it('request is set', () => {
      propagate(element);
      assert.typeOf(element.request, 'object');
    });

    it('response is set', () => {
      propagate(element);
      assert.typeOf(element.response, 'object');
    });

    it('loadingTime is set', () => {
      propagate(element);
      assert.equal(element.responseMeta.loadingTime, 124.12345678);
    });

    it('responseIsXhr is false', () => {
      propagate(element);
      assert.isFalse(element.responseMeta.responseIsXhr);
    });

    it('redirects is set', () => {
      propagate(element);
      assert.typeOf(element.responseMeta.redirects, 'array');
    });

    it('redirectsTiming is set', () => {
      propagate(element);
      assert.typeOf(element.responseMeta.redirectsTiming, 'array');
    });

    it('timing is set', () => {
      propagate(element);
      assert.typeOf(element.responseMeta.timing, 'object');
    });

    it('source message is set', () => {
      propagate(element);
      assert.typeOf(element.responseMeta.sourceMessage, 'string');
    });

    it('Calling clearResponse() clears response', () => {
      propagate(element);
      element.clearResponse();
      assert.isUndefined(element.isErrorResponse);
      assert.isUndefined(element.responseError);
      assert.isUndefined(element.request);
      assert.isUndefined(element.response);
      assert.deepEqual(element.responseMeta, {});
    });
  });

  describe('Response error handling', () => {
    function propagate(element) {
      const detail = {
        request: {
          url: 'https://domain.com/',
          method: 'GET',
          headers: 'accept: text/plain'
        },
        response: {
          status: 0,
          statusText: 'NOT OK',
          payload: 'Hello world',
          headers: 'content-type: text/plain'
        },
        loadingTime: 124.12345678,
        isError: true,
        error: new Error('test-error'),
        isXhr: true
      };
      element._propagateResponse(detail);
    }

    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('hasResponse is set', () => {
      propagate(element);
      assert.isTrue(element.hasResponse);
    });

    it('responseMeta is set', () => {
      propagate(element);
      assert.typeOf(element.responseMeta, 'object');
    });

    it('isErrorResponse is true', () => {
      propagate(element);
      assert.isTrue(element.isErrorResponse);
    });

    it('responseError is set', () => {
      propagate(element);
      assert.typeOf(element.responseError, 'error');
    });

    it('request is set', () => {
      propagate(element);
      assert.typeOf(element.request, 'object');
    });

    it('response is set', () => {
      propagate(element);
      assert.typeOf(element.response, 'object');
    });

    it('loadingTime is set', () => {
      propagate(element);
      assert.equal(element.responseMeta.loadingTime, 124.12345678);
    });

    it('responseIsXhr is true', () => {
      propagate(element);
      assert.isTrue(element.responseMeta.responseIsXhr);
    });
  });

  describe('#boundEvents', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('sets eventsTarget', () => {
      element.boundEvents = true;
      assert.equal(element.eventsTarget, element);
    });

    it('returns set value', () => {
      element.boundEvents = true;
      assert.equal(element.boundEvents, true);
    });

    it('does not set eventsTarget when false', () => {
      element._boundEventsChanged(false);
      assert.isUndefined(element.eventsTarget)
    });
  });

  describe('Passing a request and state', () => {
    let element;
    let request;
    let state;
    beforeEach(async () => {
      request = {
        method: 'POST',
        url: 'https://api.com',
        headers: 'x-test: true',
        payload: 'test',
        requestActions: {
          variables: [{
            enabled: true,
            value: 'test-value',
            variable: 'test-var'
          }]
        },
        responseActions: [{
          source: 'request.body',
          action: 'assign-variable',
          enabled: true
        }],
        config: {
          timeout: 50
        },
        authType: 'basic',
        auth: {
          password: 'pwd',
          username: 'test'
        }
      };
      state = {
        collapseOpened: true,
        selectedTab: 2,
        urlOpened: true
      };
      element = await requestFixture(request, state);
    });

    it('sets a request data on the editor', () => {
      const panel = element.shadowRoot.querySelector('request-editor');
      assert.equal(panel.url, request.url, 'url is set');
      assert.equal(panel.method, request.method, 'method is set');
      assert.equal(panel.payload, request.payload, 'payload is set');
      assert.equal(panel.headers, request.headers, 'payload is set');
      assert.deepEqual(panel.requestActions, request.requestActions, 'beforeActions is set');
      assert.deepEqual(panel.responseActions, request.responseActions, 'afterActions is set');
      assert.deepEqual(panel.config, request.config, 'afterActions is set');
      assert.equal(panel.authType, request.authType, 'authType is set');
      assert.deepEqual(panel.auth, request.auth, 'auth settings is set');
    });

    it('updates request url when changed', () => {
      const panel = element.shadowRoot.querySelector('request-editor');
      panel._urlHandler({
        detail: {
          value: 'http://test'
        }
      });
      assert.equal(element.editorRequest.url, 'http://test');
    });

    it('updates request method when changed', () => {
      const panel = element.shadowRoot.querySelector('request-editor');
      panel._methodHandler({
        detail: {
          value: 'PUT'
        }
      });
      assert.equal(element.editorRequest.method, 'PUT');
    });

    it('updates request headers when changed', () => {
      const panel = element.shadowRoot.querySelector('request-editor');
      panel._headersHandler({
        detail: {
          value: 'x-other: true'
        }
      });
      assert.equal(element.editorRequest.headers, 'x-other: true');
    });

    it('updates request payload when changed', () => {
      const panel = element.shadowRoot.querySelector('request-editor');
      panel._bodyHandler({
        detail: {
          value: 'changed'
        }
      });
      assert.equal(element.editorRequest.payload, 'changed');
    });

    it('updates request requestActions when changed', () => {
      const panel = element.shadowRoot.querySelector('request-editor');
      panel._requestActionsChanged({
        detail: {
          value: {}
        }
      });
      assert.deepEqual(element.editorRequest.requestActions, {});
    });

    it('updates request responseActions when changed', () => {
      const panel = element.shadowRoot.querySelector('request-editor');
      panel._responseActionsChanged({
        detail: {
          value: []
        }
      });
      assert.deepEqual(element.editorRequest.responseActions, []);
    });

    it('updates request config when changed', () => {
      const panel = element.shadowRoot.querySelector('request-editor');
      panel._configHandler({
        detail: {
          value: {
            timeout: 25
          }
        }
      });
      assert.deepEqual(element.editorRequest.config, {
        timeout: 25
      });
    });

    it('updates auth config when selecting auth method', async () => {
      const editor = element.shadowRoot.querySelector('request-editor');
      const panel = editor.shadowRoot.querySelector('authorization-selector');
      panel.selected = 'basic';
      await aTimeout();
      const authPanel = editor.shadowRoot.querySelector('authorization-method[type="basic"]');
      authPanel.username = 'test-username';
      authPanel.password = 'test-password';
      authPanel.dispatchEvent(new CustomEvent('change'));
      assert.deepEqual(element.editorRequest.auth, {
        username: 'test-username',
        password: 'test-password',
      }, 'auth.settings is set');
      assert.equal(element.editorRequest.authType,
          'basic', 'auth.settings is set');
    });

    it('sets the state on the editor', () => {
      const panel = element.shadowRoot.querySelector('request-editor');
      assert.deepEqual(panel.state, state);
    });

    it('updates editorState when state changes', () => {
      const panel = element.shadowRoot.querySelector('request-editor');
      const tab = panel.shadowRoot.querySelector('anypoint-tab');
      MockInteractions.tap(tab);
      assert.equal(element.editorState.selectedTab, 0);
    });
  });

  describe('#clientCertificateImport', () => {
    it('propagates clientCertificateImport property', async () => {
      const element = await clientCertificateImportFixture();
      const editor = element.shadowRoot.querySelector('request-editor');
      assert.isTrue(editor.clientCertificateImport);
    });

    it('propagates only when set', async () => {
      const element = await basicFixture();
      const editor = element.shadowRoot.querySelector('request-editor');
      assert.isUndefined(editor.clientCertificateImport);
    });
  });
});
