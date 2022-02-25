const {app, BrowserWindow, ipcMain, dialog } = require('electron');
const ejse = require('ejs-electron');
const path = require('path');
const isDev = require('electron-is-dev');
const {autoUpdater} = require('electron-updater');


let win;
let loadingScreen;
let devtools = null;

// Setup auto updater
autoUpdater.on('checking-for-update', () =>
{
	console.log('Checking for updates...');
});
autoUpdater.on('update-available', (info) =>
{
	console.log('Update available...'+ info);
});
autoUpdater.on('update-not-available', (info) =>
{
	console.log('Update not available...'+ info);
});
autoUpdater.on('update-downloaded', (info) =>
{
	console.log('Update downloaded...'+ info);
});
autoUpdater.on('error', (err) =>
{
	console.log('Update error...'+ err);
});

// Main Window
function CreateWindow()
{
	// Create Browser Window
	var winOptions = 
	{
		width: 1200,
		height: 800,
		icon: __dirname+'/src/assets/ico/main.png',
		webPreferences: { 
			nodeIntegration: true, 
			contextIsolation: false,
			preload: path.join(__dirname, 'preload.js') 
		},
		show: false
	};
	win = new BrowserWindow(winOptions);
	// Load index.html
	win.loadFile('index.ejs');
	// Open dev tools
	//win.webContents.openDevTools();
	devtools = new BrowserWindow();
	win.webContents.setDevToolsWebContents(devtools.webContents);
    win.webContents.openDevTools({ mode: 'detach' });
	// Set Win to null
	win.on('closed', () =>
	{
		win = null;
	});
	// Delete Default Context menu
	win.setMenu(null);
	return win;
}
// Loading Screen
function CreateLoadingScreen()
{
	// Create Browser Window
	var winOptions = 
	{
		width: 700,
		height: 500,
		icon: __dirname+'/src/assets/ico/main.png',
		webPreferences: { nodeIntegration: true, contextIsolation: false },
		show: true,
		resizable: false,
		frame: false
	};
	loadingScreen = new BrowserWindow(winOptions);
	// Load index.html
	loadingScreen.loadFile('loadingScreen.ejs');
	// Open dev tools
	//loadingScreen.webContents.openDevTools();
	// Set Win to null
	loadingScreen.on('closed', () =>
	{
		loadingScreen = null;
	});
	// Delete Default Context menu
	loadingScreen.setMenu(null);

	return loadingScreen;
}
// Run CreateWindow func
app.whenReady().then(() =>
{
	// Check for updates
	if ( !isDev )
		autoUpdater.checkForUpdates();

	CreateLoadingScreen().show();
	CreateWindow().webContents.on('dom-ready', () => // Also 'ready-to-show'
	{
		setTimeout( () => 
		{
			loadingScreen.destroy();
			win.show();
		}, 5 * 1000 );
	});
});
// Quit when all windows closed
app.on('window-all-closed', () =>
{
	if ( process.platform !== 'darwin' )
	{
		app.quit();
	}
});
//

ipcMain.on('show-select-dir-dialog', (e, arg) =>
{
	var options = {
		properties: ['openDirectory']
	};
	dir = dialog.showOpenDialog(win, options);
	dir.then(path =>
	{
		e.sender.send('dialog-dir-selected', path);
	});
	
});
