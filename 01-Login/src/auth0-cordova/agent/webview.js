// Fallback to old WebView where SFSafariViewController is not supported
class WebViewAgent {

  open(url, handler){
    const browser = cordova.InAppBrowser;
    const tab = browser.open(url, '_blank');

    const handleFirstLoadEnd = ({url}) => {
      handler(null, {event: 'loaded'});
    }

    const handleLoadError = (e) => {
      clearEvents();
      handler(e, null);
    }

    const handleExit = () => {
      clearEvents();
      handler(null, {event: 'closed'});
    };

    const clearEvents = (e) => {
      tab.removeEventListener('loaderror', handleLoadError);
      tab.removeEventListener('loadstop', handleFirstLoadEnd);
      tab.removeEventListener('exit', handleExit);
    }

    tab.addEventListener('loadstop', handleFirstLoadEnd);
    tab.addEventListener('loaderror', handleLoadError);
    tab.addEventListener('exit', handleExit);
    this.tab = tab;
    this.clearEvents = clearEvents;
  }


  close(){
    if (this.tab != null) {
      this.tab.close();
    }
    this.clearEvents();
    this.tab = null;
    this.clearEvents = () => {};
  }

}

export default WebViewAgent;
