// jshint esversion: 6
// appcode int
// level int
//   0 - info
//   1 - warning
//   2 - critical
// message string

const util = require('util');

// Объект с описание ошибок
var MESSAGES = {
  0: 'Undefined'
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
