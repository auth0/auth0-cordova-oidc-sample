import Auth0Cordova from './Auth0Cordova';
import env from '../env';

document.addEventListener('deviceready', function() {
    const auth0 = new Auth0Cordova(env.domain, env.clientID, env.packageIdentifier);

    window.handleOpenURL = function(url){
        Auth0Cordova.resumeAuth(url);
    }

    auth0.authenticate({
        scope: 'openid',
    }).then(function(authResult){
        console.log(authResult);
    });
})
