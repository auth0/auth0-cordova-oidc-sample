import autobind from 'core-decorators/lib/autobind';

// Fallback to old WebView where SFSafariViewController is not supported
@autobind
class WebViewAdapter{
  static buildOptionString (options) { 
    return Object.keys(options).map((key) => {
      let value = options[key];
      if(typeof(value) === 'boolean'){
        value = value?'yes':'no';
      }
      return `${key}=${value}`;
    }).join(',');
  }

  constructor (uiOptions) {
    
  }
  
  open(url, hidden){
    const browser = cordova.InAppBrowser;  
    return new Promise((resolve, reject) => {
      const options = {
        location: true,
        hidden
      };

      const optStr =  WebViewAdapter.buildOptionString(options);
      const tab = browser.open(url, '_blank', optStr);

      const handleFirstLoadEnd = ({url}) => {
        tab.removeEventListener('loadstop', handleFirstLoadEnd);
        
        if (!hidden) {
          tab.show();
        }
        clearEvents();
        resolve({});
      }
      
      const handleLoadError = (e) => {
        if(this.hasFinished){
          return;
        }
        clearEvents();
        reject(e);
      }
      
      const clearEvents = (e) => {
        tab.removeEventListener('loaderror', handleLoadError);
        tab.removeEventListener('loadstop', handleFirstLoadEnd);
      }
      
      tab.addEventListener('loadstop', handleFirstLoadEnd);
      tab.addEventListener('loaderror', handleLoadError);
      this.tab = tab;
    });
  }


  close(){
    this.hasFinished = true;
    this.tab.close();
    this.tab = null;
  }

}

export default WebViewAdapter;