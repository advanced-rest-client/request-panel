/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html, css } from 'lit-element';
import { EventsTargetMixin } from '@advanced-rest-client/events-target-mixin/events-target-mixin.js';
import '@advanced-rest-client/request-editor/request-editor.js';
import '@advanced-rest-client/response-view/response-view.js';
import '@polymer/paper-progress/paper-progress.js';
/**
 * A full request and response view for the Advanced REST client.
 *
 * ## Breaking changes in version 2
 *
 * - does not contain any logic responsible for making a request
 * - does not contain any logic responsible for request and response actions
 * - does not evaluate variables
 * - It only renders view for both request and response panels
 *
 * @customElement
 * @memberof UiElements
 * @appliesMixin EventsTargetMixin
 */
export class RequestPanel extends EventsTargetMixin(LitElement) {
  static get styles() {
    return css`
    :host {
      display: block;
    }

    paper-progress {
      width: 100%;
      --paper-progress-active-color: var(--request-panel-progress-color, #00A2DF);
    }

    .separator {
      height: 1px;
      background-color: #e5e5e5;
      margin: 24px 0;
    }
    `;
  }

  static get properties() {
    return {
      /**
       * A request object that is generated in request edtor.
       * It contains the following properties:
       * - url
       * - method
       * - headers
       * - payload
       * - pathModel
       */
      editorRequest: { type: Object },
      /**
       * Computed value. If true then the request is loading.
       * This resets each time the request status changes.
       */
      loading: { type: Boolean },
      /**
       * Created by the transport ARFC `request` object
       */
      request: { type: Object },
      /**
       * Created by the transport ARC `response` object.
       */
      response: { type: Object },
      /**
       * Request and response meta data passed to the response view.
       * Keys:
       * - responseIsXhr (Boolean) - True if the response is made by the
       * Fetch or XHR api.
       * - loadingTime (Number) - Response full loading time. This information
       * is received from the transport library.
       * - timing {Object} - If the transport method is able to collect
       * detailed information about request timings then this value will
       * be set. It's the `timings` property from the HAR 1.2 spec.
       * - redirectsTiming (Array) - If the transport method is able to
       * collect detailed information about redirects timings then this value
       * will be set. It's a list of `timings` property from the HAR 1.2 spec.
       * - redirects (Array) - It will be set if the transport method can
       * generate information about redirections.
       * - sourceMessage (String) - Http message sent to the server.
       * This information should be available only in case of advanced
       * HTTP transport.
       */
      responseMeta: { type: Object },
      /**
       * Redirect URL for the OAuth2 authorization.
       * If can be also set by dispatching `oauth2-redirect-url-changed`
       * with `value` property on the `detail` object.
       */
      oauth2RedirectUri: { type: String },
      /**
       * A flag indincating request error.
       */
      isErrorResponse: { type: Boolean },
      /**
       * An error object associated with the response when error.
       */
      responseError: { type: Object, notify: true },
      /**
       * ID of latest request.
       * It is received from the `api-request-editor` when `api-request`
       * event is dispatched. When `api-response` event is handled
       * the id is compared and if match it dispays the result.
       *
       * This system allows to use different request panels on single app
       * and don't mix the results.
       *
       * @type {String|Number}
       */
      lastRequestId: { type: String },
      /**
       * When set it sets `eventsTarget` to itself and all editor event
       * listeners strats listening on this node.
       * This prohibits editors from getting data from the outside ot this
       * component.
       */
      boundEvents: { type: Boolean },
      /**
       * When set it renders editors in read only mode.
       */
      readOnly: { type: Boolean },
      /**
       * Request editor UI state object.
       * @type {Object}
       */
      editorState: { type: Object },
      /**
       * If set it renders the view in the narrow layout.
       */
      narrow: { type: Boolean },
      /**
       * When set it will ignore all `content-*` headers when the request method
       * is either `GET` or `HEAD`.
       * When not set or `false` it renders warning dialog.
       * @type {Boolean}
       */
      ignoreContentOnGet: { type: Boolean },
      /**
       * Enables compatibility with Anypoint platform
       */
      compatibility: { type: Boolean },
      /**
       * Enables material's outlined theme for inputs.
       */
      outlined: { type: Boolean },
    };
  }

  get hasResponse() {
    const { response, isErrorResponse } = this;
    return !!(response || isErrorResponse);
  }

  get boundEvents() {
    return this._boundEvents;
  }

  set boundEvents(value) {
    const old = this._boundEvents;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._boundEvents = value;
    this._boundEventsChanged(value);
  }

  get response() {
    return this._response;
  }

  set response(value) {
    const old = this._response;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._response = value;
    this.requestUpdate('response', old);
    this.dispatchEvent(new CustomEvent('response', {
      detail: {
        value
      }
    }));
  }

  get responseMeta() {
    return this._responseMeta;
  }

  set responseMeta(value) {
    const old = this._responseMeta;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._responseMeta = value;
    this.requestUpdate('responseMeta', old);
    this.dispatchEvent(new CustomEvent('responsemeta', {
      detail: {
        value
      }
    }));
  }

  get isErrorResponse() {
    return this._isErrorResponse;
  }

  set isErrorResponse(value) {
    const old = this._isErrorResponse;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._isErrorResponse = value;
    this.requestUpdate('isErrorResponse', old);
    this.dispatchEvent(new CustomEvent('iserrorresponse', {
      detail: {
        value
      }
    }));
  }

  get responseError() {
    return this._responseError;
  }

  set responseError(value) {
    const old = this._responseError;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._responseError = value;
    this.requestUpdate('responseError', old);
    this.dispatchEvent(new CustomEvent('responseerror', {
      detail: {
        value
      }
    }));
  }
  /**
   * @return {RequestEditor} Reference to RequestEditor element.
   */
  get editor() {
    return this.shadowRoot.querySelector('request-editor');
  }

  constructor() {
    super();
    this.editorRequest = {};

    this._apiResponseHandler = this._apiResponseHandler.bind(this);
    this._sendRequestHandler = this._sendRequestHandler.bind(this);
    this._changeUrlHandler = this._changeUrlHandler.bind(this);
    this._abortHandler = this._abortHandler.bind(this);
    this._clearHandler = this._clearHandler.bind(this);
  }

  _attachListeners() {
    window.addEventListener('api-response', this._apiResponseHandler);
    this.addEventListener('api-request', this._sendRequestHandler);
    this.addEventListener('url-change-action', this._changeUrlHandler);
    this.addEventListener('abort-api-request', this._abortHandler);
    this.addEventListener('request-clear-state', this._clearHandler);
  }

  _detachListeners() {
    window.removeEventListener('api-response', this._apiResponseHandler);
    this.removeEventListener('api-request', this._sendRequestHandler);
    this.removeEventListener('url-change-action', this._changeUrlHandler);
    this.removeEventListener('abort-api-request', this._abortHandler);
    this.removeEventListener('request-clear-state', this._clearHandler);
  }
  /**
   * Runs current request.
   * Note, it does not validate the state of the request.
   */
  send() {
    this.editor.send();
  }

  /**
   * Calls abort on the request editor.
   */
  abort() {
    this.editor.abort();
  }
  /**
   * Calls `clearRequest()` method of the `request-editor`
   */
  clear() {
    this.editor.clearRequest();
  }

  /**
   * Calls `notifyResize()` on the `request-editor`
   */
  notifyResize() {
    const node = this.editor;
    // this can be called when the editor is not yet upgraded
    if (node && node.notifyResize) {
      node.notifyResize();
    }
  }

  _boundEventsChanged(value) {
    if (value) {
      this.eventsTarget = this;
    }
  }
  /**
   * A handler for the API call.
   *
   * @param {CustomEvent} e `api-request` event
   */
  _sendRequestHandler(e) {
    this.lastRequestId = e.detail.id;
    this.loading = true;
  }
  /**
   * Handler for the `abort-api-request` custom event.
   * Clears loading state and `lastRequestId` property.
   */
  _abortHandler() {
    this.lastRequestId = undefined;
    this.loading = false;
  }
  /**
   * Handler for the `request-clear-state` custom event.
   * Clears loading state and `lastRequestId` property.
   */
  _clearHandler() {
    this.lastRequestId = undefined;
    this.loading = false;
  }

  /**
   * Handler for the `api-response` custom event. Sets values on the response
   * panel when response is ready.
   *
   * @param {CustomEvent} e
   */
  _apiResponseHandler(e) {
    if (this.lastRequestId !== e.detail.id) {
      return;
    }
    this.loading = false;
    this._propagateResponse(e.detail);
  }
  /**
   * Propagate `api-response` detail object.
   *
   * @param {Object} data Event's detail object
   */
  _propagateResponse(data) {
    this.isErrorResponse = data.isError;
    this.responseError = data.isError ? data.error : undefined;
    this.request = data.request;
    this.response = data.response;
    const isXhr = data.isXhr === false ? false : true;
    this.responseMeta = {
      loadingTime: data.loadingTime,
      responseIsXhr: isXhr,
      redirects: isXhr ? undefined : data.redirects,
      redirectsTiming: isXhr ? undefined : data.redirectsTiming,
      timing: isXhr ? undefined : data.timing,
      sourceMessage: data.sentHttpMessage
    };
  }
  /**
   * Updates value of the request URL from `url-change-action`
   * custom event.
   *
   * @param {Event} e
   */
  _changeUrlHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    this.editorRequest.url = e.detail.url;
    this.requestUpdate();
  }

  /**
   * Clears response panel.
   */
  clearResponse() {
    this.isErrorResponse = undefined;
    this.responseError = undefined;
    if (this.request) {
      this.request = undefined;
    }
    if (this.response) {
      this.response = undefined;
    }
    this.responseMeta = {};
  }

  _stateHandler(e) {
    const { value } = e.detail;
    this.editorState = value;
    this.dispatchEvent(new CustomEvent('editorstate', {
      detail: {
        value
      }
    }));
  }

  _notifyRequest(e) {
    this.dispatchEvent(new CustomEvent('editorrequest', {
      detail: {
        value: this.editorRequest
      }
    }));
  }

  _urlHandler(e) {
    const { value } = e.detail;
    this.editorRequest.url = value;
    this._notifyRequest();
  }

  _methodHandler(e) {
    const { value } = e.detail;
    this.editorRequest.method = value;
    this._notifyRequest();
  }

  _payloadHandler(e) {
    const { value } = e.detail;
    this.editorRequest.payload = value;
    this._notifyRequest();
  }

  _headersHandler(e) {
    const { value } = e.detail;
    this.editorRequest.headers = value;
    this._notifyRequest();
  }

  _requestActionsChanged(e) {
    const { value } = e.detail;
    this.editorRequest.requestActions = value;
    this._notifyRequest();
  }

  _responseActionsChanged(e) {
    const { value } = e.detail;
    this.editorRequest.responseActions = value;
    this._notifyRequest();
  }

  _configChanged(e) {
    const { value } = e.detail;
    this.editorRequest.config = value;
    this._notifyRequest();
  }

  render() {
    return html`
    ${this._requestEditorTemplate()}
    ${this._busyTemplate()}
    <div class="separator"></div>
    ${this._responseTemplate()}
    `;
  }

  _requestEditorTemplate() {
    const {
      compatibility,
      outlined,
      readOnly,
      oauth2RedirectUri,
      eventsTarget,
      editorState,
      narrow,
      ignoreContentOnGet
    } = this;
    const request = this.editorRequest || {};
    return html`
    <request-editor
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      ?narrow="${narrow}"
      ?readOnly="${readOnly}"
      ?ignoreContentOnGet="${ignoreContentOnGet}"
      collapseOpened
      oauth2RedirectUri="${oauth2RedirectUri}"
      .eventsTarget="${eventsTarget}"
      .state="${editorState}"
      @state="${this._stateHandler}"
      .url="${request.url}"
      @url-changed="${this._urlHandler}"
      .method="${request.method}"
      @method-changed="${this._methodHandler}"
      .payload="${request.payload}"
      @payload-changed="${this._payloadHandler}"
      .headers="${request.headers}"
      @headers-changed="${this._headersHandler}"
      .requestActions="${request.requestActions}"
      @requestactions-changed="${this._requestActionsChanged}"
      .responseActions="${request.responseActions}"
      @responseactions-changed="${this._responseActionsChanged}"
      .config="${request.config}"
      @config-changed="${this._configChanged}"
    >
      <slot name="request-context-menu" slot="request-context-menu"></slot>
    </request-editor>
    `;
  }

  _responseTemplate() {
    if (!this.hasResponse) {
      return '';
    }
    const {
      compatibility,
      request,
      response,
      responseError,
      isErrorResponse,
    } = this;
    const meta = this.responseMeta || {};
    return html`
    <response-view
      .request="${request}"
      .response="${response}"
      .responseError="${responseError}"
      .isError="${isErrorResponse}"
      .isXhr="${meta.responseIsXhr}"
      .loadingTime="${meta.loadingTime}"
      .redirects="${meta.redirects}"
      .redirectTimings="${meta.redirectsTiming}"
      .responseTimings="${meta.timing}"
      .sentHttpMessage="${meta.sourceMessage}"
      .legacy="${compatibility}"
    ></response-view>`;
  }

  _busyTemplate() {
    if (!this.loading) {
      return '';
    }
    return html`<paper-progress indeterminate></paper-progress>`;
  }
}
