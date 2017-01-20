import autobind from 'core-decorators/lib/autobind';

@autobind
class SharedBrowserAuthenticator{
    constructor (uiOptions) {
        // You can optionally use this to customize the look and feel.
    }

    static isAvailable () {
        return new Promise((resolve, reject) => SafariViewController.isAvailable(resolve, reject));
    }

    /* redirectURL is not needed in this case, it will be handled by the server */
    getResponseURL (authenticationURL, redirectURL, interactive) {
        const sharedView = window.SafariViewController;
        const options = {
            hidden: !interactive,
            url: authenticationURL
        };

        return new Promise((resolve, reject) => {
            sharedView.show({
                hidden: !interactive,
                url: authenticationURL,
            }, (result) => {
                // Page loaded
                if (result.event === 'loaded') {
                    if (!this.hasFinished && interactive) {
                        return resolve({handleUrl: true});
                    }
                    reject(new Error('Browser loaded a url in Silent Authentication, this might be because there is no session'));
                } else if (result.event === 'closed') {
                    // Browser closed prematurely
                    if (!this.hasFinished && interactive) {
                        reject(new Error('Browser failed to open the url'));
                    }
                }
            }, (e) =>  reject(e));
        });
    }

    /* Free resources */
    cleanup () {
        this.hasFinished = true;
        SafariViewController.hide();
    }
}

export default SharedBrowserAuthenticator;