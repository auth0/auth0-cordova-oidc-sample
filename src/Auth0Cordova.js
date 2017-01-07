import autobind from 'core-decorators/lib/autobind';
import parse from 'url-parse';
import auth0 from 'auth0-js';

import generateRandomChallengePair from './generateRandomChallengePair';
import SharedBrowser from './adapters/SharedBrowser';
import WebView from './adapters/WebView';
import Session from './Session';

@autobind
class Auth0Cordova {
    // These params will never change
    constructor(domain, clientID, packageIdentifier) {
        this.domain = domain;
        this.clientID = clientID;
        this.packageIdentifier = packageIdentifier;
        this.client = new auth0.Authentication({
            domain,
            clientID
        });
    }

    static queueForCallback(resolve, reject){
        if(Auth0Cordova.session) Auth0Cordova.session.stop(new Error('Only one instance of auth can happen at a time'));
        Auth0Cordova.session = new Session(resolve, reject);
    }

    static resumeAuth(url) {
        // This must be handled this way otherwise cordova might crash on iOS
        setTimeout(function(){
            if (Auth0Cordova.session) {
                Auth0Cordova.session.resume(url);
            }
        }, 4);
    }


    exchangeCodeForToken(code, verifier, redirectURL) {
        const {domain, clientId} = this;
        return new Promise((resolve, reject) => {
            this.client.oauthToken({
                redirectUri: this.getRedirectURL(),
                grantType: 'authorization_code',
                code_verifier: verifier,
                code
            }, function (err, response) {
                if(err){
                    reject(err);
                }
                resolve(response);
            });
        })
    }

    extractCode(resultUrl) {
        const response = parse(resultUrl, true).query;

        if (response.error) {
            throw new Error(response.error_description || response.error);
        }

        return response.code;
    }

    getAuthResult(responseURL, secret, redirectURL) {
        const code = this.extractCode(responseURL);
        return this.exchangeCodeForToken(code, secret, redirectURL);
    }

    getOS() {
        const userAgent = navigator.userAgent;
        if (/android/i.test(userAgent)) {
            return "android";
        }

        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            return "ios";
        }
    }

    getRedirectURL() {
        return `${this.packageIdentifier}://${this.domain}/${this.getOS()}/${this.packageIdentifier}/callback`;
    }

    getAdapter(isSharedBrowserSupported) {
        let adapter = null;
        if (isSharedBrowserSupported) {
            adapter = new SharedBrowser();
        } else {
            adapter = new WebView();
        }
        return adapter;
    }

    awaitCallback() {
        // This will be resolved in future
        return new Promise((resolve, reject) => {
            if (this.session) {
                this.session.stop(new Error('Only one instance of authentication can happen at one time'));
            }
            Auth0Cordova.queueForCallback(resolve, reject);
        });
    }

    getResponseURL(adapter, url, callbackUrl) {
        // This will always be true as not-true makes sense only for implicit mode
        return adapter.getResponseURL(url, callbackUrl, true)
            .then((response) => {
                if (typeof response !== 'string') {
                    return this.awaitCallback()
                            .then(function(url) {
                                adapter.cleanup();
                                return url;
                            });
                }
                return response;
            });
    }

    authenticate(params) {
        const {hashed, secret} = generateRandomChallengePair();
        const redirectUri = this.getRedirectURL();
        params = Object.assign({}, params, {
            redirectUri: redirectUri,
            code_challenge: hashed,
            code_challenge_method: 'S256',
            responseType: 'code',
        });

        const url = this.client.buildAuthorizeUrl(params);

        return SharedBrowser.isAvailable()
            .then(this.getAdapter)
            .then(adapter => this.getResponseURL(adapter, url, redirectUri))
            .then(url => this.getAuthResult(url, secret, redirectUri));
    }
}

export default Auth0Cordova;
