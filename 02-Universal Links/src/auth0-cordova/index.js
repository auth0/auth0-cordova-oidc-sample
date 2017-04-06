import getAgent from './agent';
import parse from 'url-parse';
import auth0 from 'auth0-js';
import { generateProofKey, generateState } from './crypto';

const getOS = () => {
  const userAgent = navigator.userAgent;
  if (/android/i.test(userAgent)) {
    return "android";
  }

  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return "ios";
  }
};

const NoSession = () => false;

class Auth0Cordova {

  constructor(options) {
    this.clientId = options.clientId;
    this.domain = options.domain;
    this.redirectUri = options.redirectUri || `https://${domain}/${getOS()}/${options.packageIdentifier}/callback`;
    this.client = new auth0.Authentication({clientID: this.clientId, domain: this.domain});
  }

  authorize(parameters = {}) {
    return getAgent()
      .then((agent) => new Promise((resolve, reject) => {
        const keys = generateProofKey();
        const {client, redirectUri} = this;
        const {state, ...authParams} = parameters;
        const requestState = state || generateState();

        var params = {
          code_challenge_method: 'S256',
          responseType: 'code',
          redirectUri: redirectUri,
          code_challenge: keys.codeChallenge,
          state: requestState,
          ...authParams
        };
        const url = client.buildAuthorizeUrl(params);

        agent.open(url, (error, result) => {
          if(error != null) {
            return reject(error);
          }
          if(result.event === 'closed' && getOS() === 'ios') {
            return reject(new Error('user canceled'));
          }
        });
        Auth0Cordova.newSession((error, url) => {
          if (error != null) {
            return reject(error);
          }

          const handled = url.indexOf(redirectUri) !== -1;
          if (!handled) {
            return handled;
          }

          if (!url || typeof url !== 'string') {
            return reject(new Error('url must be a string'));
          }

          const response = parse(url, true).query;
          if (response.error) {
              return reject(new Error(response.error_description || response.error));
          }

          const responseState = response.state;
          if (responseState !== requestState) {
              return reject(new Error('Response state does not match expected state'));
          }

          const code = response.code;
          const verifier = keys.codeVerifier;
          client.oauthToken({
              code_verifier: keys.codeVerifier,
              grantType: 'authorization_code',
              redirectUri: redirectUri,
              code
          }, (error, result) => {
            agent.close();
            if (error) {
              return reject(error);
            }
            return resolve(result);
          });

          return handled;
        });
      }));
  }

  static currentSession = NoSession;

  static newSession(handler) {
    Auth0Cordova.currentSession(new Error('Only one instance of auth can happen at a time'));
    Auth0Cordova.currentSession = handler;
  }

  static onRedirectUri(url) {
    if (Auth0Cordova.currentSession(null, url)) {
      Auth0Cordova.currentSession = NoSession;
    }
  }
}

export default Auth0Cordova;