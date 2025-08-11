const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'homepage.html'));

  // Listen for download events
  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    // Optionally, ask user where to save
    const fileName = item.getFilename();
    const defaultPath = path.join(app.getPath('downloads'), fileName);

    // You can prompt user for a save location (optional)
    dialog.showSaveDialog({
      defaultPath,
      title: 'Save file',
      buttonLabel: 'Save',
    }).then(({ canceled, filePath }) => {
      if (canceled) {
        item.cancel();
      } else {
        item.setSavePath(filePath);
      }
    });

    item.on('updated', (event, state) => {
      if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused');
        } else {
          console.log(`Received bytes: ${item.getReceivedBytes()}`);
        }
      }
    });

    item.once('done', (event, state) => {
      if (state === 'completed') {
        console.log('Download successfully');
        // Optionally notify user here
      } else {
        console.log(`Download failed: ${state}`);
      }
    });
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
