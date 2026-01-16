/**
 * HyLo Widget - Embeddable Hyperliquid Deposit Widget
 * 
 * Usage:
 *   <script src="https://hylo.dev/widget.js"></script>
 *   <button data-hylo-deposit data-recipient="0x...">Deposit</button>
 * 
 * Or programmatically:
 *   HyLo.init({ onSuccess: (tx) => console.log(tx) });
 *   HyLo.open({ recipient: '0x...', amount: '100' });
 */

(function() {
  'use strict';

  // Widget configuration
  const WIDGET_URL = window.HYLO_WIDGET_URL || (window.location.origin + '/widget');
  const WIDGET_VERSION = '1.0.0';

  // State
  let config = {};
  let iframe = null;
  let overlay = null;
  let isOpen = false;
  let pendingOptions = null;

  // Styles for the overlay and iframe
  const styles = `
    .hylo-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s ease, visibility 0.2s ease;
    }
    .hylo-overlay.hylo-open {
      opacity: 1;
      visibility: visible;
    }
    .hylo-iframe-container {
      width: 100%;
      max-width: 420px;
      max-height: 90vh;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      transform: scale(0.95) translateY(20px);
      transition: transform 0.3s ease;
    }
    .hylo-overlay.hylo-open .hylo-iframe-container {
      transform: scale(1) translateY(0);
    }
    .hylo-iframe {
      width: 100%;
      height: 600px;
      border: none;
      background: #0a0a0a;
    }
    .hylo-close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease;
    }
    .hylo-close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    .hylo-close-btn svg {
      width: 20px;
      height: 20px;
      color: white;
    }
    @media (max-width: 480px) {
      .hylo-iframe-container {
        max-width: 100%;
        max-height: 100%;
        border-radius: 0;
        height: 100%;
      }
      .hylo-iframe {
        height: 100%;
      }
    }
  `;

  // Inject styles
  function injectStyles() {
    if (document.getElementById('hylo-widget-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'hylo-widget-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  // Create overlay and iframe
  function createWidget() {
    if (overlay) return;

    injectStyles();

    // Create overlay
    overlay = document.createElement('div');
    overlay.className = 'hylo-overlay';
    overlay.id = 'hylo-widget-overlay';

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'hylo-close-btn';
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';
    closeBtn.onclick = close;

    // Create iframe container
    const container = document.createElement('div');
    container.className = 'hylo-iframe-container';

    // Create iframe
    iframe = document.createElement('iframe');
    iframe.className = 'hylo-iframe';
    iframe.id = 'hylo-widget-iframe';
    iframe.allow = 'clipboard-write';
    iframe.setAttribute('loading', 'lazy');

    container.appendChild(iframe);
    overlay.appendChild(closeBtn);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        close();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) {
        close();
      }
    });

    // Listen for messages from iframe
    window.addEventListener('message', handleMessage);
  }

  // Handle messages from iframe
  function handleMessage(event) {
    // Verify origin in production
    const data = event.data;
    if (!data || !data.type || !data.type.startsWith('HYLO_')) return;

    switch (data.type) {
      case 'HYLO_READY':
        // Widget is ready, send config
        if (pendingOptions) {
          sendToWidget({
            type: 'HYLO_INIT',
            payload: { ...config, ...pendingOptions }
          });
        }
        break;

      case 'HYLO_SUCCESS':
        if (config.onSuccess) {
          config.onSuccess(data.payload);
        }
        close();
        break;

      case 'HYLO_ERROR':
        if (config.onError) {
          config.onError(data.payload);
        }
        break;

      case 'HYLO_CLOSE':
        close();
        break;

      case 'HYLO_RESIZE':
        if (iframe && data.payload && data.payload.height) {
          iframe.style.height = Math.min(data.payload.height, window.innerHeight * 0.9) + 'px';
        }
        break;
    }
  }

  // Send message to widget iframe
  function sendToWidget(message) {
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(message, '*');
    }
  }

  // Open the widget
  function open(options) {
    if (!options || !options.recipient) {
      console.error('[HyLo] recipient address is required');
      return;
    }

    createWidget();
    pendingOptions = options;

    // Build widget URL with params
    const params = new URLSearchParams();
    params.set('recipient', options.recipient);
    if (options.amount) params.set('amount', options.amount);
    if (options.destinationToken) params.set('token', options.destinationToken);
    if (options.fromChainId) params.set('chainId', options.fromChainId.toString());
    if (config.theme) params.set('theme', config.theme);
    if (config.primaryColor) params.set('color', config.primaryColor);

    iframe.src = WIDGET_URL + '?' + params.toString();
    
    // Show overlay
    requestAnimationFrame(function() {
      overlay.classList.add('hylo-open');
      isOpen = true;
      document.body.style.overflow = 'hidden';
    });
  }

  // Close the widget
  function close() {
    if (!isOpen) return;
    
    overlay.classList.remove('hylo-open');
    isOpen = false;
    document.body.style.overflow = '';
    
    if (config.onClose) {
      config.onClose();
    }

    // Clear iframe after animation
    setTimeout(function() {
      if (iframe) {
        iframe.src = 'about:blank';
      }
    }, 300);
  }

  // Initialize with config
  function init(userConfig) {
    config = userConfig || {};
    createWidget();
    console.log('[HyLo] Widget initialized v' + WIDGET_VERSION);
  }

  // Auto-bind buttons with data attributes
  function bindButtons() {
    document.querySelectorAll('[data-hylo-deposit]').forEach(function(button) {
      if (button.hasAttribute('data-hylo-bound')) return;
      button.setAttribute('data-hylo-bound', 'true');

      button.addEventListener('click', function(e) {
        e.preventDefault();
        
        const options = {
          recipient: button.getAttribute('data-recipient') || button.getAttribute('data-hylo-recipient'),
          amount: button.getAttribute('data-amount') || button.getAttribute('data-hylo-amount'),
          destinationToken: button.getAttribute('data-token') || button.getAttribute('data-hylo-token'),
          fromChainId: button.getAttribute('data-chain-id') || button.getAttribute('data-hylo-chain-id')
        };

        // Filter out undefined values
        Object.keys(options).forEach(function(key) {
          if (!options[key]) delete options[key];
        });

        if (!options.recipient) {
          console.error('[HyLo] data-recipient attribute is required on button');
          return;
        }

        open(options);
      });
    });
  }

  // Export global API
  window.HyLo = {
    init: init,
    open: open,
    close: close,
    version: WIDGET_VERSION
  };

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      bindButtons();
      // Re-bind on DOM changes (for SPAs)
      if (typeof MutationObserver !== 'undefined') {
        new MutationObserver(bindButtons).observe(document.body, {
          childList: true,
          subtree: true
        });
      }
    });
  } else {
    bindButtons();
  }

  console.log('[HyLo] Widget script loaded v' + WIDGET_VERSION);
})();
