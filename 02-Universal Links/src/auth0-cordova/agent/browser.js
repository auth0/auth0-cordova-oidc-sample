class BrowserAgent {
    static isAvailable () {
        return new Promise(window.SafariViewController.isAvailable);
    }

    open(url, handler) {
        const safari = window.SafariViewController;
        const options = {url, hidden: false};
        safari.show(options, (result) => handler(null, result), (message) => reject(new Error(message), null));
    }

    close (){
        window.SafariViewController.hide();
    }
}

export default BrowserAgent;
