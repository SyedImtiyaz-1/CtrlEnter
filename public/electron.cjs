const { app, BrowserWindow, globalShortcut, screen, ipcMain } = require('electron');
const path = require('path');
const isDev = !app.isPackaged; // Better way to detect development mode

let mainWindow;
let isWindowVisible = false;

function createWindow() {
  // Get primary display dimensions
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width } = primaryDisplay.workAreaSize;
  
  // Create the browser window with transparency and glass effect
  mainWindow = new BrowserWindow({
    width: 950,
    height: 120,
    x: Math.floor(width / 2 - 475), // Center horizontally
    y: 50, // Position at top
    frame: false,
    transparent: true,
    alwaysOnTop: false, // Changed to false to allow other apps to be used
    resizable: false,
    minimizable: false,
    maximizable: false,
    skipTaskbar: true,
    show: false, // Don't show initially
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false
    }
  });

  // Load the app
  if (isDev) {
    console.log('Loading from development server...');
    mainWindow.loadURL('http://localhost:5173');
    // Uncomment the next line if you want to see DevTools in development
    // mainWindow.webContents.openDevTools();
  } else {
    console.log('Loading from built files...');
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Window event handlers
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Remove the auto-hide on blur to allow multi-app usage

  // Add error handling for load failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorDescription);
    if (isDev) {
      console.log('Retrying in 2 seconds...');
      setTimeout(() => {
        mainWindow.loadURL('http://localhost:5173');
      }, 2000);
    }
  });

  // Handle window focus events
  mainWindow.on('focus', () => {
    isWindowVisible = true;
    mainWindow.setAlwaysOnTop(true); // Only on top when focused
  });

  mainWindow.on('blur', () => {
    mainWindow.setAlwaysOnTop(false); // Allow other apps to come to front
  });

  // Add keyboard shortcuts for better UX
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape') {
      hideWindow();
    }
  });

  // Wait for the page to load before injecting the resize functionality
  mainWindow.webContents.once('did-finish-load', () => {
    // Inject the resize function into the window
    mainWindow.webContents.executeJavaScript(`
      // Create electronAPI object if it doesn't exist
      window.electronAPI = window.electronAPI || {};
      
      // Add resizeWindow function
      window.electronAPI.resizeWindow = (width, height) => {
        // This will be handled by IPC
        window.postMessage({ type: 'resize-window', width, height }, '*');
      };
      
      // Set up the observer for dynamic resizing
              const observer = new MutationObserver(() => {
          const responseContainer = document.querySelector('.response-container');
          if (responseContainer && window.getComputedStyle(responseContainer).display !== 'none') {
            // Expand window when response is shown
            window.electronAPI.resizeWindow(950, 450);
          } else {
            // Shrink window when response is hidden
            window.electronAPI.resizeWindow(950, 120);
          }
        });
      
      // Start observing
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
      
      // Listen for resize messages
      window.addEventListener('message', (event) => {
        if (event.data.type === 'resize-window') {
          // Send to main process via IPC
          require('electron').ipcRenderer.send('resize-window', event.data.width, event.data.height);
        }
      });
    `).catch((error) => {
      console.error('Error injecting resize functionality:', error);
    });
  });
}

// Handle window resize requests from renderer
ipcMain.on('resize-window', (event, width, height) => {
  if (mainWindow) {
    const currentBounds = mainWindow.getBounds();
    mainWindow.setBounds({
      ...currentBounds,
      width: width,
      height: height
    });
    console.log(`Window resized to ${width}x${height}`);
  }
});

function showWindow() {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    isWindowVisible = true;
    console.log('Window shown');
  }
}

function hideWindow() {
  if (mainWindow) {
    mainWindow.hide();
    isWindowVisible = false;
    console.log('Window hidden');
  }
}

function toggleWindow() {
  if (isWindowVisible) {
    hideWindow();
  } else {
    showWindow();
  }
}

// App event handlers
app.whenReady().then(() => {
  createWindow();

  // Register global hotkey Ctrl+Enter for toggle
  const ret = globalShortcut.register('CommandOrControl+Return', toggleWindow);

  // Register additional shortcuts
  const escRet = globalShortcut.register('CommandOrControl+Escape', hideWindow);

  if (!ret) {
    console.log('Global shortcut registration failed');
  } else {
    console.log('Global shortcuts registered:');
    console.log('- Ctrl+Enter: Show/Hide app');
    console.log('- Ctrl+Escape: Hide app');
    console.log('- Escape (when focused): Hide app');
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

// Don't prevent app quit - allow normal app behavior
app.on('before-quit', (event) => {
  // Remove the preventDefault to allow normal quit behavior
  console.log('App is quitting');
}); 