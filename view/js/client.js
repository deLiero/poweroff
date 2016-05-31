// VARIABLES //
// client js syntax
var curDateElem = document.getElementById('cur-time'); // текущее время
var timerButtonElem = document.getElementById('timer-button'); // кнопка старт/стоп
var hourInputElem = document.getElementById('hour-input'); // ввод часов
var minInputElem = document.getElementById('min-input'); // ввод минут
var arrHourUpElem = document.getElementById('arr_h_up'); // стрелка час+
var arrHourDownElem = document.getElementById('arr_h_down'); // стрелка час-
var arrMinUpElem = document.getElementById('arr_m_up'); // стрелка минута+
var arrMinDownElem = document.getElementById('arr_m_down'); // стрелка минута-
var arrowBoxes = document.getElementsByClassName('arrows'); // боксы со стрелками
var dotsElem = document.getElementsByClassName('dots')[0]; // точки между вводом час:мин
var errorBoxElem = document.getElementById('error-box'); // контейнер для ошибки
var errorMessageElem = document.getElementById('error-message');

var active = false; // запущен ли таймер
var errorTimeoutId = null; // управление показом ошибки

// линия прогресса таймера
var progressElem = document.getElementById('progress');

// node syntax
var remote = require('electron').remote;
var win = remote.getCurrentWindow(); // текущее окно view
// END VARIABLES //


// METHODS //
// client js syntax
// таймер с установкой текущей даты

// объект с датой h, m, s
function getDate () {
    var tickDate = new Date();
    var h = tickDate.getHours();
    h = h < 10 ? ('0' + h) : h;
    var m = tickDate.getMinutes();
    m = m < 10 ? ('0' + m) : m;
    var s = tickDate.getSeconds();
    s = s < 10 ? ('0' + s) : s;

    return {
        hours: h,
        minutes: m,
        seconds: s
    };
}

// отобазить текущую дату
function setCurrentDate() {
    var curDate = getDate();
    curDateElem.innerHTML = curDate.hours + ':' + curDate.minutes + ':' + curDate.seconds;
    setTimeout(setCurrentDate, 1000/5);
}

// изменить часы
// 0 - decrease
// 1 - increase
function changeHour(state) {
    var h = parseInt(hourInputElem.value);

    if (isNaN(h)) {
        hourInputElem.value = '00';
        return;
    }

    if (state === 1) {
        h++;
    } else if (state === 0) {
        h--;
    }

    if (h < 0) {
        hourInputElem.value = '23';
        return;
    }

    if (h > 23) {
        hourInputElem.value = '00';
        return;
    }

    if (h < 10) {
        h = '0' + h;
    }

    hourInputElem.value = h;
}

// изменить минуты
// 0 - decrease
// 1 - increase
function changeMinute(state) {
    var m = parseInt(minInputElem.value);

    if (isNaN(m)) {
        minInputElem.value = '00';
        return;
    }

    if (state === 1) {
        m++;
    } else if (state === 0) {
        m--;
    }

    if (m < 0) {
        minInputElem.value = '59';
        return;
    }

    if (m > 59) {
        minInputElem.value = '00';
        return;
    }

    if (m < 10) {
        m = '0' + m;
    }

    minInputElem.value = m;
}

function showMessage(msg) {
    if (errorTimeoutId) {
        return;
    }
    errorMessageElem.innerHTML = msg;
    errorBoxElem.style.top = '0px';
    errorTimeoutId = setTimeout(function () {
        hideMessage();
    },3000);
}

function hideMessage() {
    clearTimeout(errorTimeoutId);
    errorTimeoutId = null;
    errorMessageElem.innerHTML = '';
    errorBoxElem.style.top = '-30px';
}

// END METHODS //

// EXTEND HTML ELEMENT //
// показать состояние кнопки: стоп
timerButtonElem.js_stop = function () {
    timerButtonElem.classList.add('active');
    timerButtonElem.innerHTML = 'стоп';
};

// показать состояние кнопки: стоп
timerButtonElem.js_start = function () {
    timerButtonElem.classList.remove('active');
    timerButtonElem.innerHTML = 'старт';
};

// END EXTEND HTML ELEMENT //

// EVENT HANDLERS //
timerButtonElem.onclick = function () {
    win.emit('timer:toggle', hourInputElem.value, minInputElem.value);
};

arrHourUpElem.onclick = function () {changeHour(1);}; // h + 1
arrHourDownElem.onclick = function () {changeHour(0);}; // h - 1
arrMinUpElem.onclick = function () {changeMinute(1);}; // m + 1
arrMinDownElem.onclick = function () {changeMinute(0);}; // m - 1

// обработка колёсика мыши
hourInputElem.addEventListener('wheel', function (e) {

    e = e || window.event;

    if (!active) {
        // wheelDelta не дает возможность узнать количество пикселей
        var delta = e.deltaY || e.detail || e.wheelDelta;

        if (+delta > 0 ) {
            changeHour(0);
        } else {
            changeHour(1);
        }
    }

    e.preventDefault ? e.preventDefault() : (e.returnValue = false);
});

// обработка колёсика мыши
minInputElem.addEventListener('wheel', function (e) {
    e = e || window.event;

    if (!active) {
        // wheelDelta не дает возможность узнать количество пикселей
        var delta = e.deltaY || e.detail || e.wheelDelta;

        if (+delta > 0 ) {
            changeMinute(0);
        } else {
            changeMinute(1);
        }
    }

    e.preventDefault ? e.preventDefault() : (e.returnValue = false);
});


// обработка событий таймера
win.on('timer:started', function () {
    active = true;

    //скрыть сообщение если оно показано
    if (errorTimeoutId) {
        hideMessage();
    }

    // скрыть стрелки ввода
    for (var i = 0, max = arrowBoxes.length; i < max; i++) {
        arrowBoxes[i].style.visibility = 'hidden';
    }

    // анимация точек
    dotsElem.classList.add('anim');

    // отобразить состояние кнопки стоп
    timerButtonElem.js_stop();

    // показать линию прогресса
    progressElem.style.display = 'block';
});

win.on('timer:stopped', function () {
    active = false;
    // показать стрелки ввода
    for (var i = 0, max = arrowBoxes.length; i < max; i++) {
        arrowBoxes[i].style.visibility = 'visible';
    }

    // отменить анимацию точек
    dotsElem.classList.remove('anim');

    // отобразить сосотояние кнопки старт
    timerButtonElem.js_start();

    // восстановить прогресс линию
    progressElem.style.width = '100%';
    progressElem.style.display = 'none';
});

win.on('timer:error', function (err) {
    showMessage(err.message);
});

win.on('timer:tick', function (state) {
    progressElem.style.width = state.percentage + '%';
});
// END EVENT HANDLERS //

// RUN //
// run cur time
var curDate = getDate();
setTimeout(setCurrentDate, 0);

// установить текущее время для таймера
hourInputElem.value = curDate.hours;
minInputElem.value = curDate.minutes;
