import autobind from 'core-decorators/lib/autobind';
import parse from 'url-parse';
import SharedBrowser from './adapters/SharedBrowser';
import WebView from './adapters/WebView';
import Session from './Session';

@autobind
class HybridOAuthClient {
    // These params will never change, they are used 
    // to create the callback url
    constructor(domain, packageIdentifier) {
        this.domain = domain;
        this.packageIdentifier = packageIdentifier;
    }

    static resumeAuth(url) {
        // This must be handled this way otherwise cordova might crash on iOS
        setTimeout(function () {
            Session.handleCallback(url);
        }, 4);
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

    canHandleUrl(url) {
        return url.indexOf(this.getRedirectURL()) !== -1;
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
            Session.queueForCallback(resolve, reject, this);
        });
    }

    getResponseURL(adapter, url, interactive) {
        const redirectUri = this.getRedirectURL();
        return adapter.getResponseURL(url, redirectUri, interactive)
            .then((response) => {
                if (typeof response !== 'string') {
                    return this.awaitCallback()
                        .then(function (url) {
                            adapter.cleanup();
                            return url;
                        });
                }
                return response;
            });
    }

    // This is inspired by how Chrome handles Authentication
    // however this uses Promises instead of a global lastError
    launchWebAuthFlow(url, interactive) {
        return SharedBrowser.isAvailable()
            .then(this.getAdapter)
            .then(adapter => this.getResponseURL(adapter, url, interactive))
    }
}

export default HybridOAuthClient;
