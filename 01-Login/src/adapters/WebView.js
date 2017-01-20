import autobind from 'core-decorators/lib/autobind';

// Fallback to old WebView where SFSafariViewController is not supported
@autobind
class WebviewAdapter{

  constructor (uiOptions) {
    
  }

  getResponseURL (authenticationURL, redirectURL, interactive) {
    const re = RegExp(redirectURL);
    const browser = cordova.InAppBrowser;
    
    return new Promise((resolve, reject) => { 
      // Open a new tab in InAppBrowser
      const tab = browser.open(authenticationURL, '_blank');

      // First page that is loaded
      function handleFirstLoadEnd({url}) {
        tab.removeEventListener('loadstop', handleFirstLoadEnd);
        if (re.test(url)) {
          return;
        }
        tab.show();
      }

      // Clears all event listeners
      function clearEvents() {
        tab.removeEventListener('loaderror', handleLoadError);
        tab.removeEventListener('loadstop', handleFirstLoadEnd);
        tab.removeEventListener('loadstart', handleUrl);
      }

      // There was an error loading the page
      function handleLoadError(e) {
        clearEvents();
        reject(e);
      }
      
      function handleUrl({url}) {
        if (re.test(url) === false) {
          return;
        }
        tab.close();
        clearEvents();
        return resolve({url});
      }

      tab.addEventListener('loadstop', handleFirstLoadEnd);
      tab.addEventListener('loaderror', handleLoadError);
      tab.addEventListener('loadstart', handleUrl);
    });
  }

  cleanup(){
    /* No op */
  }
}

export default WebviewAdapter;