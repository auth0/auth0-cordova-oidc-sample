import autobind from 'core-decorators/lib/autobind';

@autobind
class Session {
    constructor(resolve, reject, client) {
        this.reject = reject;
        this.client = client;
        this.resolve = resolve;
    }

    stop(reason) {
        this.reject(reason);
    }

    resume(url) {
        if (this.client.canHandleUrl(url)) {
            this.resolve(url);
        }
    }
}

export default Session;