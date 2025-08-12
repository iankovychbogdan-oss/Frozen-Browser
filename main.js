const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,      // Enable Node.js in renderer for your code
      contextIsolation: false,    // Disable context isolation to match nodeIntegration
      webviewTag: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'homepage.html'));

  mainWindow.webContents.session.on('will-download', (event, item) => {
    console.log('Download started:', item.getFilename());

    // Prevent default to control download path
    event.preventDefault();

    // Default save path
    const defaultPath = path.join(app.getPath('downloads'), item.getFilename());

    dialog.showSaveDialog(mainWindow, {
      title: 'Save file',
      defaultPath,
      buttonLabel: 'Save',
    }).then(({ canceled, filePath }) => {
      if (canceled || !filePath) {
        console.log('Download cancelled by user');
        item.cancel();
        return;
      }

      item.setSavePath(filePath);
      item.resume();

      console.log('Downloading to:', filePath);
    }).catch(err => {
      console.error('Save dialog error:', err);
      item.cancel();
    });

    item.on('updated', (event, state) => {
      if (state === 'progressing' && !item.isPaused()) {
        const received = item.getReceivedBytes();
        const total = item.getTotalBytes();
        const percent = ((received / total) * 100).toFixed(2);
        console.log(`Progress: ${percent}%`);
      } else if (item.isPaused()) {
        console.log('Download paused');
      }
    });

    item.once('done', (event, state) => {
      if (state === 'completed') {
        console.log('Download completed:', item.getSavePath());
      } else {
        console.log('Download failed:', state);
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
