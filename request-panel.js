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
import {PolymerElement} from '../../@polymer/polymer/polymer-element.js';
import {EventsTargetMixin} from '../../@advanced-rest-client/events-target-mixin/events-target-mixin.js';
import {html} from '../../@polymer/polymer/lib/utils/html-tag.js';
import '../../@advanced-rest-client/request-editor/request-editor.js';
import '../../@advanced-rest-client/response-view/response-view.js';
import '../../@polymer/paper-progress/paper-progress.js';
import '../../@polymer/paper-icon-button/paper-icon-button.js';
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
 * ## Styling
 *
 * `<request-panel>` provides the following custom properties and mixins for
 * styling:
 *
 * Custom property|Description|Default
 * ---------- | ------------------ | ------
 * `--request-panel-progress-color` | Color of the progress bar | `#00A2DF`
 *
 * @polymer
 * @customElement
 * @memberof UiElements
 * @appliesMixin EventsTargetMixin
 */
class RequestPanel extends EventsTargetMixin(PolymerElement) {
  static get template() {
    return html`<style>
    :host {
      display: block;
    }

    paper-progress {
      width: 100%;
      --paper-progress-active-color: var(--request-panel-progress-color, #00A2DF);
    }
    </style>
    <request-editor
      loading-request="[[loading]]"
      headers="{{editorRequest.headers}}"
      method="{{editorRequest.method}}"
      payload="{{editorRequest.payload}}"
      url="{{editorRequest.url}}"
      request-actions="{{editorRequest.requestActions}}"
      response-actions="{{editorRequest.responseActions}}"
      auth-settings="{{editorRequest.auth}}"
      oauth2-redirect-uri="[[oauth2RedirectUri]]"
      events-target="[[eventsTarget]]"
      readonly="[[readonly]]"
      state="{{editorState}}"
      narrow="[[narrow]]"
      ignore-content-on-get="[[ignoreContentOnGet]]">
      <slot name="request-context-menu" slot="request-context-menu"></slot>
    </request-editor>
    <template is="dom-if" if="[[loading]]">
      <paper-progress indeterminate=""></paper-progress>
    </template>
    <template is="dom-if" if="[[hasResponse]]">
      <response-view
        request="[[request]]"
        response="[[response]]"
        response-error="[[responseError]]"
        is-error="[[isErrorResponse]]"
        is-xhr="[[responseMeta.responseIsXhr]]"
        loading-time="{{responseMeta.loadingTime}}"
        redirects="[[responseMeta.redirects]]"
        redirect-timings="[[responseMeta.redirectsTiming]]"
        response-timings="[[responseMeta.timing]]"
        sent-http-message="[[responseMeta.sourceMessage]]"></response-view>
    </template>`;
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
      editorRequest: {
        type: Object,
        notify: true,
        value: function() {
          return {};
        }
      },
      /**
       * Computed value. If true then the request is loading.
       * This resets each time the request status changes.
       */
      loading: Boolean,
      /**
       * Created by the transport ARFC `request` object
       */
      request: Object,
      /**
       * Created by the transport ARC `response` object.
       */
      response: {notify: true, type: Object},
      /**
       * Computed value, true, when the response object is set.
       */
      hasResponse: {
        type: Boolean,
        computed: '_computeHasResponse(response, isErrorResponse)'
      },
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
      responseMeta: {notify: true, type: Object},
      /**
       * Redirect URL for the OAuth2 authorization.
       * If can be also set by dispatching `oauth2-redirect-url-changed`
       * with `value` property on the `detail` object.
       */
      oauth2RedirectUri: String,
      /**
       * A flag indincating request error.
       */
      isErrorResponse: {notify: true, type: Boolean},
      /**
       * An error object associated with the response when error.
       */
      responseError: {notify: true, type: Object},
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
      lastRequestId: String,
      /**
       * When set it sets `eventsTarget` to itself and all editor event
       * listeners strats listening on this node.
       * This prohibits editors from getting data from the outside ot this
       * component.
       */
      boundEvents: {
        type: Boolean,
        observer: '_boundEventsChanged'
      },
      /**
       * When set it renders editors in read only mode.
       */
      readonly: Boolean,
      /**
       * Request editor UI state object.
       * @type {Object}
       */
      editorState: {type: Object, notify: true},
      /**
       * If set it renders the view in the narrow layout.
       */
      narrow: {type: Boolean, value: false},
      /**
       * When set it will ignore all `content-*` headers when the request method
       * is either `GET` or `HEAD`.
       * When not set or `false` it renders warning dialog.
       * @type {Boolean}
       */
      ignoreContentOnGet: Boolean
    };
  }

  /**
   * @constructor
   */
  constructor() {
    super();
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
    this.shadowRoot.querySelector('request-editor').send();
  }

  /**
   * Calls abort on the request editor.
   */
  abort() {
    this.shadowRoot.querySelector('request-editor').abort();
  }
  /**
   * Calls `clearRequest()` method of the `request-editor`
   */
  clear() {
    this.shadowRoot.querySelector('request-editor').clearRequest();
  }
  /**
   * Computes if there is a reponse object.
   *
   * @param {Object} response ARC response objects
   * @param {Boolean} isErrorResponse
   * @return {Boolean}
   */
  _computeHasResponse(response, isErrorResponse) {
    return !!response || !!isErrorResponse;
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
    this.set('editorRequest.url', e.detail.url);
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

  _boundEventsChanged(value) {
    if (value) {
      this.eventsTarget = this;
    }
  }
}
window.customElements.define('request-panel', RequestPanel);
