# Auth0 Cordova

## Setup

This library requires two cordova plugins to work:

- cordova-plugin-safariviewcontroller: Shows Safari/Chrome browser ViewController/CustomTab
- cordova-plugin-customurlscheme: Handles the custom scheme url intents for callback

So you need to run 

```bash
cordova plugin add cordova-plugin-inappbrowser
cordova plugin add cordova-plugin-customurlscheme --variable URL_SCHEME={application package name} --variable ANDROID_SCHEME={application package name} --variable ANDROID_HOST={auth0 domain} --variable ANDROID_PATHPREFIX=/cordova/{application package name}/callback
```

and in your config you should have something entries like

```xml
<plugin name="cordova-plugin-customurlscheme" spec="~4.2.0">
    <variable name="URL_SCHEME" value="com.auth0.cordova.example" />
    <variable name="ANDROID_SCHEME" value="com.auth0.cordova.example" />
    <variable name="ANDROID_HOST" value="sample.auth0.com" />
    <variable name="ANDROID_PATHPREFIX" value="/cordova/com.auth0.cordova.example/callback" />
</plugin>
<plugin name="cordova-plugin-safariviewcontroller" spec="~1.4.6" />
```

then in your index.js you need to register the url handler ondeviceready

```js
import Auth0Cordova from './auth0-cordova';

function main() {
    function intentHandler(url) {
        Auth0Cordova.onRedirectUri(url);
    }
    window.handleOpenURL = intentHandler;
    // init your application
}

document.addEventListener('deviceready', main);
```

and to use is as simple as

```js
const client = new Auth0Cordova({
  clientId: "{auth0 client id}",
  domain: "{auth0 domain}",
  packageIdentifier: "{application package name}"
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

- [ ] state verification
- [ ] use custom error
- [ ] better error handling in public API
- [ ] validate parameters of functions
- [ ] unit tests
- [ ] fetch package identifier automatically
- [ ] make it a cordova plugin
- [ ] configure variables on plugin install