class BrowserTabAdapter {
    constructor (uiOptions) {
        // You can optionally use this to customize the look and feel.
    }

    static isAvailable () {
        return new Promise((resolve, reject) => {
            SafariViewController.isAvailable(resolve, reject)
        });
    }

    // Opens the url
    open(url, handler) {
        const safari = window.SafariViewController;
        const options = {url, hidden: false};

        safari.show(options, (result) => {
            console.log(result);
            handler(null, result);
        }, (message) => {
            console.log(message);
            reject(new Error(message), null);
        });
    }

    close (){
        this.hasFinished = true;
        SafariViewController.hide();
    }
}

export default BrowserTabAdapter;
