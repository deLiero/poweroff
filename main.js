const electron = require('electron');

// Module to control application life.
const app = electron.app;

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// нативные диалоговые окна
const dialog = electron.dialog;

const path = require('path');

const nconf = require('nconf');
nconf.argv().env().file({file: path.join(__dirname, 'config.cfg')});

// подключаем таймер
var timer = require(path.join(__dirname,'timer'));

const spawn = require('child_process').spawn;
var cmd = null;

const AppError = require(path.join(__dirname,'error')).AppError;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow;

//обработчики событий таймера
var  timerToggle, timerStop, timerStart, turnOff, timerTick, timerError;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
      width: nconf.get('window:width') || 528,
      height: nconf.get('window:height') || 300,
      center: nconf.get('window:center') || true,
      resizable: nconf.get('window:resizable') || false,
      maximizable:  nconf.get('window:maximizable') || false,
      icon: path.join(__dirname, nconf.get('window:icon')) || './icon.ico'
  });

  // скрыть дефолтное меню
  mainWindow.setMenu(null);

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + path.join(__dirname, 'view/index.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  // установить частоту опроса таймера
  timer.setTickRate(1); // 1000ms/2

  timer.on('timed',turnOff = function () {
      // turn off power
      //cmd = spawn('shutdown', ['/s','/t', '0']);
      cmd = spawn('notepad');

      cmd.on('error', function (err) {
          // отобразить диалог и закрыть приложение
          dialog.showErrorBox('Критическая ошибка', err.stack);
          app.exit(1);
      });
  });

  // обработка ошибок таймера
  timer.on('error', timerError = function (err) {
      if (err.code == 99) {
        mainWindow.emit('timer:error', err);
        dialog.showErrorBox('ERROR', err.message);
      }else {
        mainWindow.emit('timer:error', err);
      }
  });

  timer.on('tick', timerTick = function (state) {
      mainWindow.emit('timer:tick', state);
  });

  timer.on('started', timerStart = function (tickDate) {
      mainWindow.emit('timer:started');
  });

  timer.on('stopped', timerStop = function (tickDate) {
      mainWindow.emit('timer:stopped');
  });

  mainWindow.on('timer:toggle', timerToggle = function (h, m) {
     if(timer.isRun()) {
         timer.stop();
     } else {
         timer.setTime(h, m);
         timer.start();
     }
  });


  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;

    //удалить обработчики с timer
    try {
        timer.removeListener('timed', turnOff);
        timer.removeListener('error', timerError);
        timer.removeListener('tick', timerTick);
        timer.removeListener('started', timerStart);
        timer.removeListener('stopped', timerStop);
    }catch(err) {
        app.quit(); // выход из приложения
        throw new AppError(99, 1, err.message);
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
