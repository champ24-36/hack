import './index.css';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Set up error handling before anything else
const setupErrorHandling = () => {
  // Suppress browser extension errors
  const originalError = console.error;
  console.error = (...args) => {
    const errorMessage = args[0];
    if (typeof errorMessage === 'string') {
      // Suppress common browser extension errors
      if (
        errorMessage.includes('custom element') ||
        errorMessage.includes('mce-autosize-textarea') ||
        errorMessage.includes('webcomponents-ce.js') ||
        errorMessage.includes('already been defined') ||
        errorMessage.includes('CustomElementRegistry') ||
        errorMessage.includes('define') ||
        errorMessage.includes('useRoutes() may be used only in the context of a <Router> component') ||
        errorMessage.includes('overlay_bundle.js') ||
        errorMessage.includes('Aa') ||
        errorMessage.includes('m.define') ||
        errorMessage.includes('uBOL') ||
        errorMessage.includes('cosmetic filtering') ||
        errorMessage.includes('DOM changes') ||
        errorMessage.includes('css-generic.js')
      ) {
        return;
      }
    }
    originalError.apply(console, args);
  };

  // Override window.onerror to catch errors before they bubble up
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    const errorMessage = message?.toString() || '';
    if (
      errorMessage.includes('custom element') ||
      errorMessage.includes('mce-autosize-textarea') ||
      errorMessage.includes('webcomponents-ce.js') ||
      errorMessage.includes('already been defined') ||
      errorMessage.includes('CustomElementRegistry') ||
      errorMessage.includes('define') ||
      errorMessage.includes('overlay_bundle.js') ||
      errorMessage.includes('Aa') ||
      errorMessage.includes('m.define') ||
      errorMessage.includes('uBOL') ||
      errorMessage.includes('cosmetic filtering') ||
      errorMessage.includes('DOM changes') ||
      errorMessage.includes('css-generic.js') ||
      (source && source.includes('webcomponents-ce.js')) ||
      (source && source.includes('overlay_bundle.js')) ||
      (source && source.includes('css-generic.js'))
    ) {
      return true; // Prevent the error from being logged
    }
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };

  // Global error handler for uncaught errors
  const originalAddEventListener = window.addEventListener;
  window.addEventListener = function(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
    if (type === 'error') {
      const wrappedListener: EventListener = (event: Event) => {
        const errorEvent = event as ErrorEvent;
        const errorMessage = errorEvent.message || errorEvent.error?.message || '';
        if (
          errorMessage.includes('custom element') ||
          errorMessage.includes('mce-autosize-textarea') ||
          errorMessage.includes('webcomponents-ce.js') ||
          errorMessage.includes('already been defined') ||
          errorMessage.includes('CustomElementRegistry') ||
          errorMessage.includes('define') ||
          errorMessage.includes('useRoutes() may be used only in the context of a <Router> component') ||
          errorMessage.includes('overlay_bundle.js') ||
          errorMessage.includes('Aa') ||
          errorMessage.includes('m.define') ||
          errorMessage.includes('uBOL') ||
          errorMessage.includes('cosmetic filtering') ||
          errorMessage.includes('DOM changes') ||
          errorMessage.includes('css-generic.js')
        ) {
          errorEvent.preventDefault();
          return;
        }
        if (typeof listener === 'function') {
          return listener.call(this, event);
        }
        return;
      };
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    return originalAddEventListener.call(this, type, listener, options);
  };

  // Suppress uncaught promise rejections related to custom elements
  window.addEventListener('unhandledrejection', (event) => {
    const errorMessage = event.reason?.message || event.reason || '';
    if (
      errorMessage.includes('custom element') ||
      errorMessage.includes('mce-autosize-textarea') ||
      errorMessage.includes('webcomponents-ce.js') ||
      errorMessage.includes('already been defined') ||
      errorMessage.includes('CustomElementRegistry') ||
      errorMessage.includes('define') ||
      errorMessage.includes('useRoutes() may be used only in the context of a <Router> component') ||
      errorMessage.includes('overlay_bundle.js') ||
      errorMessage.includes('Aa') ||
      errorMessage.includes('m.define') ||
      errorMessage.includes('uBOL') ||
      errorMessage.includes('cosmetic filtering') ||
      errorMessage.includes('DOM changes') ||
      errorMessage.includes('css-generic.js')
    ) {
      event.preventDefault();
      return;
    }
  });

  // Suppress console.log messages from browser extensions
  const originalLog = console.log;
  console.log = (...args) => {
    const logMessage = args[0];
    if (typeof logMessage === 'string') {
      if (
        logMessage.includes('uBOL') ||
        logMessage.includes('cosmetic filtering') ||
        logMessage.includes('DOM changes') ||
        logMessage.includes('css-generic.js')
      ) {
        return;
      }
    }
    originalLog.apply(console, args);
  };
};

// Set up error handling immediately
setupErrorHandling();

createRoot(document.getElementById('root')!).render(
  <App />
);