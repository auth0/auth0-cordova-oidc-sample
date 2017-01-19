import HybridOAuthClient from './HybridOAuthClient';
import PKCEAuth from 'pkce-auth';
import env from '../env';


function authenticate(options, cb) {
    const client = new HybridOAuthClient(env.domain, env.clientID, env.packageIdentifier);
    const pkceAuth = new PKCEAuth(env.domain, env.clientID, client.getRedirectURL());

    const url = pkceAuth.buildAuthorizeUrl(options);

    return client.launchWebAuthFlow(url)
        .then(function (redirectUrl) {
            return pkceAuth.handleCallback(redirectUrl,cb)
        }).catch(cb);
}

function intentHandler(url) {
    HybridOAuthClient.resumeAuth(url);
}

function main() {
    const authOptions = {
        audience: env.audience
    };
    window.handleOpenURL = intentHandler;
    authenticate(authOptions, (err, authResult) => console.log(err, authResult))
}

document.addEventListener('deviceready', main);
