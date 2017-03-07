import BrowserTab from './adapters/BrowserTab';
import WebView from './adapters/WebView';
import Session from './Session';

class HybridOAuthClient {
    // These params will never change, they are used
    // to create the callback url
    constructor(domain, packageIdentifier) {
        this.domain = domain;
        this.packageIdentifier = packageIdentifier;
    }

    static resumeAuth(url) {
        Session.handleCallback(url);
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
        return `${this.packageIdentifier}://${this.domain}/cordova/${this.packageIdentifier}/callback`;
    }

    canHandleUrl(url) {
        return url.indexOf(this.getRedirectURL()) !== -1;
    }

    getAdapter(isSharedBrowserSupported) {
        let adapter = null;
        if (isSharedBrowserSupported) {
            adapter = new BrowserTab();
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
        return new Promise((resolve, reject) => {
            adapter.open(url, (error, result) => {
                if(error) {
                    reject(error);
                }
                if(result.event === 'closed' && this.getOS() === 'ios') {
                    reject(new Error('user canceled'));
                }
            });
            Session.queueForCallback((url) => {
                adapter.close();
                resolve(url);
            }, reject, this);
        });
    }

    launchWebAuthFlow(url, interactive) {
        return BrowserTab.isAvailable()
            .then(this.getAdapter)
            .then(adapter => this.getResponseURL(adapter, url, interactive))
    }
}

export default HybridOAuthClient;