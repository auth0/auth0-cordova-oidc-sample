import autobind from 'core-decorators/lib/autobind';
import parse from 'url-parse';
import SharedBrowser from './adapters/SharedBrowser';
import WebView from './adapters/WebView';
import Session from './Session';

@autobind
class HybridOAuthClient {
    // These params will never change
    constructor(domain, clientID, packageIdentifier) {
        this.domain = domain;
        this.clientID = clientID;
        this.packageIdentifier = packageIdentifier;
    }

    static queueForCallback(resolve, reject, client) {
        if (HybridOAuthClient.session) {
            HybridOAuthClient.session.stop(new Error('Only one instance of auth can happen at a time'));
        }
        HybridOAuthClient.session = new Session(resolve, reject, client);
    }

    static resumeAuth(url) {
        // This must be handled this way otherwise cordova might crash on iOS
        setTimeout(function () {
            if (HybridOAuthClient.session) {
                HybridOAuthClient.session.resume(url);
            }
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
            if (this.session) {
                this.session.stop(new Error('Only one instance of authentication can happen at one time'));
            }
            HybridOAuthClient.queueForCallback(resolve, reject, this);
        });
    }

    getResponseURL(adapter, url) {
        // This will always be true as not-true makes sense only for implicit mode
        return adapter.getResponseURL(url, '', true)
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

    // This is inspired by how Chrome handles Authenticatio
    // however this uses Promises
    launchWebAuthFlow(url) {
        return SharedBrowser.isAvailable()
            .then(this.getAdapter)
            .then(adapter => this.getResponseURL(adapter, url))
    }
}

export default HybridOAuthClient;
