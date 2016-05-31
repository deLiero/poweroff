// jshint esversion: 6
//TODO добавить конфиги для параметров окна и значения по умолчанию

const electron = require('electron');

// Module to control application life.
const app = electron.app;

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// нативные диалоговые окна
const dialog = electron.dialog;

// подключаем таймер
var timer = require('./timer');

const spawn = require('child_process').spawn;
var cmd = null;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

//TODO handlers возможно просто удалить все обработчики событий
let timerToggle, timerStop, timerStart, turnOff, timerTick;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
      width: 528,
      height: 300,
      center: true,
      resizable: false,
      maximizable: false
      //icon: './icon.ico'
  });

  // скрыть дефолтное меню
  mainWindow.setMenu(null);

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/view/index.html');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // установить частоту опроса таймера
  timer.setTickRate(2); // 1000ms/2

  timer.on('timed',turnOff = function () {
      // turn off power
      //cmd = spawn('shutdown', ['/s','/t', '0']);
      //cmd = spawn('notepad');
      console.log('TIMED');
      dialog.showErrorBox('ошибка', 'отключение компьютера');
  });

  // обработка ошибок таймера
  timer.on('error', function (err) {
      if (err.code == 99) {
        mainWindow.emit('timer:error', err);
        dialog.showErrorBox('ERROR', err.message);
      }else {
        mainWindow.emit('timer:error', err);
      }
  });

  timer.on('tick', timerTick = function (state) {
      console.log(state);
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

    //TODO удалить обработчики с timer
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
