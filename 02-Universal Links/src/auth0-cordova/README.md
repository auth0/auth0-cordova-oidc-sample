# Auth0 Cordova

## Setup

Copy the contents of this library to your project in a folder named `auth0-cordova`.

> This library is written with JS ES6 so you might need to configure babel to transpile it to ES5 if you haven't done it for your app.

Then, since the library requires these two cordova plugins to work:

- cordova-plugin-safariviewcontroller: Shows Safari/Chrome browser ViewController/CustomTab
- cordova-universal-links-plugin: Handles the universal links callback

you'll need to run 

```bash
cordova plugin add cordova-plugin-inappbrowser
cordova plugin add cordova-universal-links-plugin
```
After installing the universal links plugin you'll need to follow the installation guide at https://github.com/nordnet/cordova-universal-links-plugin#cordova-universal-links-plugin

> In cordova applications, the application package name is the widget's id in the file `config.xml`

So if you have the following values

* application package name: com.auth0.cordova.ul
* auth0 domain: samples.auth0.com

in your config you should have some entries like 

```xml
<plugin name="cordova-plugin-safariviewcontroller" spec="~1.4.6" />
<plugin name="cordova-universal-links-plugin" spec="~1.2.1" />
<universal-links>
    <host 
        name="app.domain.com"
        scheme="https"
    >
        <path 
            url="/ios/com.auth0.cordova.ul/callback" 
            event="authcallback"
        />
    </host>
</universal-links>

```

then in your index.js you need to register the url handler `ondeviceready`

```js
import Auth0Cordova from './auth0-cordova';

function main() {
    function intentHandler(intent) {
        Auth0Cordova.onRedirectUri(intent.url);
    }
    universalLinks.subscribe('authcallback', intentHandler);
    // init your application
}

document.addEventListener('deviceready', main);
```

and to use is as simple as

```js
const client = new Auth0Cordova({
  clientId: "{auth0 client id}",
  domain: "{auth0 domain}",
  packageIdentifier: "{application package name}",
  redirectUri: "{your_domain.com/ios/com.auth0.cordova.ul/callback}"
});

const options = {
  scope: 'openid profile',
};

client
  .authorize(options)
  .then((authResult) => {
    // SUCCESS!
  })
  .catch((error) => {
    // ERROR!
  });
}
```

## TODO

- [x] state verification
- [ ] handle url's on auth0 tenant.
- [ ] use custom error
- [ ] better error handling in public API
- [ ] validate parameters of functions
- [ ] unit tests
- [ ] fetch package identifier automatically
- [ ] make it a cordova plugin
- [ ] configure variables on plugin install
