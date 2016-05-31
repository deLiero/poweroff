// jshint esversion: 6

const util = require('util');
const EventEmitter = require('events');
const AppError = require('../error').AppError;

module.exports = (function () {
    // EVENTS
    //   error - ошибка
    //   timed - время вышло, после наступает событие stoped
    //   tick  - опрос таймера 30 раз в сек /передает объект с остатком времени и процентом остатка
    //   started - таймер запущен
    //   stopped - таймер остановлен

    // Constructor
    var Timer = function () {
        EventEmitter.call(this);
    };

    // унаследуемся от EventEmitter
    util.inherits(Timer, EventEmitter);

    // время таймера default=null
    var time = {
        h: null, // 3600 s * 1000 ms 0 - 23
        m: null // 60s * 1000 ms 0 - 59
    };

    // module variables
    var timeoutId = null; // id таймера
    var checked = false; // true - данные валидны
    var tickRate = 30; // кол-во опросов таймера в секунду default = 30
    var firstRun = true; // первый запуск
    var totalTime = null; // полное время в секундах до завершения

    // публичные методы класса Timer
    Timer.prototype.setTime = setTime;
    Timer.prototype.start = start;
    Timer.prototype.stop = stop;
    Timer.prototype.setTickRate = setTickRate;
    Timer.prototype.isRun = function () {
        return !!timeoutId;
    };

    // создадим экземпляр класса
    var _timer = new Timer();

    // установка частоты опроса таймера
    function setTickRate(rate) {
        try {
            if (typeof rate !== 'number' && isNaN(rate)) {
                _timer.emit('error', new AppError(1, 0));
                return;
            }
            tickRate = rate;
        } catch (err) {
            _timer.emit('error', err);
        }
    }

    // int h  0 - 23
    // int m 0 - 59
    function setTime (h, m) {
        try {
            if (h === undefined || m === undefined || h === null || m === null) {
                _timer.emit('error', new AppError(2, 0));
                checked = false;
                return;
            }

            // преобразуем в число
            h = parseInt(h);
            m = parseInt(m);

            // проверка на число
            if (isNaN(h) || isNaN(m)) {
                _timer.emit('error', new AppError(3, 0));
                checked = false;
                return;
            }

            // проверка на допустимое значение
            if (h<0 || h>23) {
                _timer.emit('error', new AppError(4, 0));
                checked = false;
                return;
            }

            if (m<0 || m>59) {
                _timer.emit('error', new AppError(5, 0));
                checked = false;
                return;
            }

            // присвоить значения
            time.h = h;
            time.m = m;
            checked = true;
        } catch (err) {
            _timer.emit('error', new AppError(99, 1, err.message));
            checked = false; // предотвратить запуск
        }
    }

    // запуск таймера
    function start() {
        try {
            // получить текущую дату
            var date = new Date();
            // если curDate == timeoutDate emit ERROR при старте
            if (time.h == date.getHours() && time.m == date.getMinutes()) {
                _timer.emit('error', new AppError(6, 0));
                return;
            }

            // если данные валидны, то запуск таймера
            if (checked) {
                _timer.emit('started');
                tick();
            }
        } catch (err) {
            _timer.emit('error', new AppError(99, 1, err.message));
        }
    }

    // остановка таймера
    function stop() {
        clearTimeout(timeoutId);
        timeoutId = null;
        firstRun = true;
        _timer.emit('stopped');
    }

    // цикл опроса таймера
    function tick() {
      try{
        timeoutId = setTimeout(tick, 1000/tickRate);

        // получить текущую дату
        var date = new Date(),
            curH = date.getHours(),
            curM = date.getMinutes(),
            curS = date.getSeconds();

        // проверка даты
        if (time.h == curH && time.m == curM) {
            _timer.emit('timed');
            stop();
            return;
        }

        // расчет времени в секундах с 00:00
        var finFullTime = (time.h * 3600 + time.m * 60)*1000;
        var curFullTime = (curH * 3600 + curM * 60  + curS) * 1000 + date.getMilliseconds();

        if (finFullTime < curFullTime) {
            // 24 * 3600 - кол-во секунд в сутках
            finFullTime = 24 * 3600 * 1000 + finFullTime - curFullTime;
        } else {
            finFullTime = finFullTime - curFullTime;
        }

        // при первом запуске запомнить общее время
        if (firstRun) {
          //TODO DELETE
            console.log('totaltime: ' + finFullTime);
            totalTime = finFullTime;
            firstRun = false;
        }

        if (finFullTime <= 0) {
            finFullTime = 0;
        }
        var percentage = ((finFullTime/totalTime) * 100).toFixed(2);

        var hours = Math.floor(finFullTime/(3600*1000)); // округлить вниз

        // сколько целых минут
        var minutes = Math.floor((finFullTime - (hours * 3600 * 1000))/(60*1000)); // округлить вниз

        // сколько целых секунд
        var seconds = Math.round(((finFullTime - (hours * 3600*1000) - (minutes * 60*1000))/1000));

        _timer.emit('tick', {
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            percentage: percentage
        });
      }catch (err) {
          _timer.emit('error', new AppError(99, 1, err.message));

          // предотвратить повторное запуск tick
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
      }
    }

    // возвратить таймер
    return _timer;
})();
