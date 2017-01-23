import env from '../env';
import Auth0 from 'auth0-js';
import decodeJwt from 'jwt-decode';
import HybridOAuthClient from './HybridOAuthClient';
import PKCEAuth from 'pkce-auth';
import autobind from 'core-decorators/lib/autobind';

const $$ = (arg) => document.querySelectorAll(arg);
const $  = (arg) => document.querySelector(arg);
const $i = (id) => document.getElementById(id);
const $c = (className) => document.getElementsByClassName(className);

/*
 * 
 * App class is an example application which aims to 
 * be a simple and framework agnostic app, written purely
 * in javascript. This should translate to most modern
 * frameworks 
 * 
 */

@autobind
class App {
    constructor() {
        this.auth0 = new Auth0.Authentication({
            domain: env.domain, 
            clientID: env.clientID
        });
        this.state = {
            authenticated: false,
            accessToken: false,
            currentRoute: '/',
            routes: {
                '/': {
                    id: 'loading',
                    onMount: (page) => {
                        if(this.state.authenticated)
                            return this.redirectTo('/home');
                        return this.redirectTo('/login');
                    }
                },
                '/login': {
                    id: 'login',
                    onMount: (page) => {
                        if(this.state.authenticated === true){
                            return this.redirectTo('/home');
                        }
                        const loginButton = page.querySelector('.btn-login');
                        loginButton.addEventListener('click', e => this.login(e));
                    }
                },
                '/home': {
                    id: 'profile',
                    onMount: (page) => {
                        const logoutButton = page.querySelector('.btn-logout');
                        const profileCodeContainer = page.querySelector('.profile-json')
                        logoutButton.addEventListener('click', e => this.logout(e));
                        this.loadProfile().then((profile) => {
                            profileCodeContainer.textContent = JSON.stringify(profile, null, 4);
                        });
                    }
                }
            }
        };
    }
    
    run(id) {
        // The first run parts
        this.container = $(id);
        this.resumeApp();        
    }

    loadProfile() {
        return new Promise((resolve, reject) => {
            this.auth0.userInfo(this.state.accessToken, (err, profile) => {
                if(err) reject(err);
                resolve(profile);
            });
        });
    }

    login(e) {
        e.target.disabled = true;
        const client = new HybridOAuthClient(env.domain, env.packageIdentifier);
        const pkceAuth = new PKCEAuth(env.domain, env.clientID, client.getRedirectURL());

        const options = {
            scope: 'openid profile',
            audience: env.audience
        };

        const url = pkceAuth.buildAuthorizeUrl(options);
        /* 
         * This is equivalent to the following with Async/Await
         *   const responseUrl = await client.launchWebAuthFlow(url, true);
         *   const authResult = await pkceAuth.handleCallbackAsync(redirectUrl);
         */
        return client.launchWebAuthFlow(url, true)
            .then((redirectUrl) => new Promise((resolve, reject) => {
                const callback = (err, authResult) => err?reject(err):resolve(authResult);
                pkceAuth.handleCallback(redirectUrl, callback); 
            }))
            .then((authResult) => {
                this.state.accessToken = authResult.accessToken;
                localStorage.setItem('access_token', authResult.accessToken);
                this.redirectTo('/home');
            })
            .catch(() => e.target.disabled = false);
    }

    logout(e) {
        e.target.disabled = true;
        const client = new HybridOAuthClient(env.domain, env.packageIdentifier);
        this.state.accessToken = null;
        localStorage.removeItem('access_token');
        setTimeout(() => this.redirectTo('/login'), 400);
        const url = this.auth0.buildLogoutUrl({
            returnTo: client.getRedirectURL()
        });

        client.launchWebAuthFlow(url, false)
            .catch((err) => {
                // @TODO: Handle this, it is being blocked by 
                // https://github.com/EddyVerbruggen/cordova-plugin-safariviewcontroller/issues/54
                console.log('Error while logging out', err);
                e.target.disabled = false;
            });
    }

    redirectTo(route) {
        if (!this.state.routes[route]) {
            throw new Error(`Unknown route "${route}".`);
        }
        this.state.currentRoute = route;
        this.render();
    }

    resumeApp() {
        // Mostly No-op in a real app you'd use this 
        // to handle deep links from other applications 
        // etc.
        const accessToken = localStorage.getItem('access_token');
        if (accessToken){
            const payload = decodeJwt(accessToken);
            if(payload.exp > Date.now()/1000){
                this.state.authenticated = true;
                this.state.accessToken = accessToken;
            }
        }
        this.render();
    }

    render() {
        // A simple css powered router.
        const currRoute = this.state.routes[this.state.currentRoute];
        const currRouteEl = $i(currRoute.id);
        const element = document.importNode(currRouteEl.content, true);
        this.container.innerHTML = '';
        this.container.appendChild(element);
        currRoute.onMount(this.container);
    }
}   

export default App;