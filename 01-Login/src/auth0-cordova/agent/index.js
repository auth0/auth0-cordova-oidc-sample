import BrowserAgent from './browser';
import WebViewAgent from './webview';

const getAgent = () => {
  return BrowserAgent
    .isAvailable()
    .then((available) => available ? new BrowserAgent() : new WebViewAgent())
    .catch(() => new WebViewAgent);
};

export default getAgent;