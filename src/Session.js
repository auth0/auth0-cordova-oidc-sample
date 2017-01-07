import autobind from 'core-decorators/lib/autobind';

class Session{
    constructor(resolve, reject){
        this.reject = reject;
        this.resolve = resolve;
    }
    stop(reason){
        this.reject(reason);
    } 

    resume(url) {
        this.resolve(url);
    }
}
export default Session;