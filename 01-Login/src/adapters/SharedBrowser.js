import autobind from 'core-decorators/lib/autobind';

@autobind
class SharedBrowserAuthenticator {
    constructor (uiOptions) {
        // You can optionally use this to customize the look and feel.
    }

    static isAvailable () {
        return new Promise((resolve, reject) => {
            SafariViewController.isAvailable(resolve, reject)
        });
    }

    // Opens the url
    open(url, hidden) {
        const sharedView = window.SafariViewController;
        const options = {url, hidden};

        return new Promise((resolve, reject) => {
            sharedView.show(options, (result) => {
                if (result.event === 'loaded') {
                    if (!this.hasFinished && !hidden) {
                        return resolve({});
                    }
                    reject(new Error('Browser loaded a url in Silent Authentication, this might be because there is no session or interaction was required.'));
                }
            }, (e) =>  reject(e));
        });
    }

    close (){
        this.hasFinished = true;
        SafariViewController.hide();
    }
}

export default SharedBrowserAuthenticator;