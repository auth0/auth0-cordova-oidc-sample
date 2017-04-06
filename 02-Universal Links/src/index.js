import Auth0Cordova from './auth0-cordova';
import App from './App';

// In a real world app, you should replace this with React
// or Angular or jQuery.


function main() {
    const app = new App();
    function intentHandler(intent) {
        Auth0Cordova.onRedirectUri(intent.url);
    }
    universalLinks.subscribe('authcallback', intentHandler);
    app.run('#app');
}

document.addEventListener('deviceready', main);
