// jshint esversion: 6
// appcode int
// level int
//   0 - warning
//   1 - critical
// message string

//TODO Добавить конфиги

const util = require('util');

// Объект с описание ошибок
var MESSAGES = {
  0: 'Undefined',
  1: 'Значение RATE не число, либо не определено',
  2: 'Один из аргументов null или undefined',
  3: 'Один из аргументов не число',
  4: 'параметр h может принимать значения от 0 до 23',
  5: 'параметр m может принимать значения от 0 до 59',
  6: 'текущая дата и дата выключения равны',
  99: 'Критическая ошибка'
};

// при создании ошибки нужно учесть
// message name stack
function AppError(appCode, level, message) {
    Error.apply(this, arguments);

    // получить стек ошибки err.stack
    Error.captureStackTrace(this, AppError);

    this.code = appCode;
    this.level = level || 0;
    this.message = message || MESSAGES[appCode] || 'AppError';
}

// наследуем ошибку
util.inherits(AppError, Error);

// добавляем свойство name в прототип
AppError.prototype.name = 'AppError';

exports.AppError = AppError;
