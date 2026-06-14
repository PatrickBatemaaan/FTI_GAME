(function() {
    const state = {
        fixedBugs: new Set(),
        totalBugs: 10, // Насчитываем 10 логов
        activeBug: null,
        timeLeft: 180,
        timerId: null
    };

    const bugDatabase = {
        'title-jitter': {
            name: 'h2.store-title { animation }',
            html: `<div class="control-group"><label>Анимация дрожания:</label><button id="fix-jitter-btn" class="devtools-input-btn">set animation: none</button></div>`,
            onInit: (target, fix) => {
                document.getElementById('fix-jitter-btn').addEventListener('click', () => {
                    target.style.animation = 'none';
                    fix('title-jitter', target);
                });
            }
        },
        'btn-padding': {
            name: 'button.exchange-btn { padding }',
            html: `<div class="control-group"><label>Внутренние отступы:</label><button id="fix-padding-btn" class="devtools-input-btn">Reset padding: 5px 10px</button></div>`,
            onInit: (target, fix) => {
                document.getElementById('fix-padding-btn').addEventListener('click', () => {
                    target.style.padding = '5px 10px';
                    fix('btn-padding', target);
                });
            }
        },
        'font-regression': {
            name: '#cookie-title { font-family }',
            html: `<div class="control-group"><label>Шрифт заголовка карточки:</label><button id="fix-font-btn" class="devtools-input-btn">Reset to Global Font</button></div>`,
            onInit: (target, fix) => {
                document.getElementById('fix-font-btn').addEventListener('click', () => {
                    fix('font-regression', target);
                });
            }
        },
        'btn-contrast': {
            name: 'button#cookie-btn { color }',
            html: `<div class="control-group"><label>Контрастность текста:</label><button id="fix-contrast-btn" class="devtools-input-btn">set color: #ffffff</button></div>`,
            onInit: (target, fix) => {
                document.getElementById('fix-contrast-btn').addEventListener('click', () => {
                    target.style.color = '#ffffff';
                    fix('btn-contrast', target);
                });
            }
        },
        'rogue-pixel': {
            name: 'div.rogue-pixel { DOM artifact }',
            html: `<div class="control-group"><label>Артефакт отрисовки:</label><button id="fix-pixel-btn" class="devtools-input-btn">display: none</button></div>`,
            onInit: (target, fix) => {
                document.getElementById('fix-pixel-btn').addEventListener('click', () => {
                    target.style.display = 'none';
                    fix('rogue-pixel', target);
                });
            }
        },
        'tab-displace': {
            name: 'div.tab-indicator { position-error }',
            html: `<div class="control-group"><label>Позиция нижнего подчеркивания:</label><button id="fix-tab-btn" class="devtools-input-btn">set left: 0px (Выровнять)</button></div>`,
            onInit: (target, fix) => {
                document.getElementById('fix-tab-btn').addEventListener('click', () => {
                    target.querySelector('.tab-indicator').style.left = '0px';
                    fix('tab-displace', target);
                });
            }
        },
        'price-nan': {
            name: 'span#hoodie-price { parsing-fail }',
            html: `<div class="control-group"><label>Data format fallback:</label><button id="fix-nan-btn" class="devtools-input-btn">Parse String to Integer (800 🪙)</button></div>`,
            onInit: (target, fix) => {
                document.getElementById('fix-nan-btn').addEventListener('click', () => {
                    target.innerText = '800 🪙';
                    fix('price-nan', target);
                });
            }
        },
        'text-crunch': {
            name: 'span.card-desc { letter-spacing }',
            html: `<div class="control-group"><label>Межсимвольный интервал:</label><button id="fix-crunch-btn" class="devtools-input-btn">set letter-spacing: normal</button></div>`,
            onInit: (target, fix) => {
                document.getElementById('fix-crunch-btn').addEventListener('click', () => {
                    target.style.letterSpacing = 'normal';
                    fix('text-crunch', target);
                });
            }
        },
        // НОВЫЙ БАГ №9: Регистр текста кнопки
        'btn-case': {
            name: 'button#hoodie-btn { text-transform }',
            html: `<div class="control-group"><label>Регистр текста (Design System):</label><button id="fix-case-btn" class="devtools-input-btn">set text-transform: uppercase</button></div>`,
            onInit: (target, fix) => {
                document.getElementById('fix-case-btn').addEventListener('click', () => {
                    // ИспользуемsetProperty, чтобы перебить !important из CSS-файла бага
                    target.style.setProperty('text-transform', 'uppercase', 'important');
                    target.innerText = 'ОБМЕНЯТЬ';
                    fix('btn-case', target);
                });
            }
        },
        // НОВЫЙ БАГ №10: Геометрия аватара
        'avatar-shape': {
            name: 'div.user-avatar { border-radius }',
            html: `<div class="control-group"><label>Искажение пропорций контейнера:</label><button id="fix-avatar-btn" class="devtools-input-btn">set border-radius: 50% (Круг)</button></div>`,
            onInit: (target, fix) => {
                document.getElementById('fix-avatar-btn').addEventListener('click', () => {
                    target.style.borderRadius = '50%';
                    fix('avatar-shape', target);
                });
            }
        }
    };

    const devtools = document.getElementById('devtools');
    const selectedName = document.getElementById('selected-element-name');
    const controlsZone = document.getElementById('controls-zone');
    const bugsFixedDisplay = document.getElementById('bugs-fixed');
    const timerDisplay = document.getElementById('time-left');
    const welcomeScreen = document.getElementById('welcome-screen');
    const winScreen = document.getElementById('win-screen');
    const loseScreen = document.getElementById('lose-screen');

    document.querySelectorAll('.bug-element').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const bugId = el.getAttribute('data-bug');
            if (state.fixedBugs.has(bugId)) return;

            state.activeBug = bugId;
            selectedName.innerText = bugDatabase[bugId].name;
            controlsZone.innerHTML = bugDatabase[bugId].html;
            devtools.classList.add('open');

            bugDatabase[bugId].onInit(el, markFixed);
        });
    });

    document.getElementById('close-tools').addEventListener('click', () => {
        devtools.classList.remove('open');
    });

    function markFixed(bugId, element) {
        if (!state.fixedBugs.has(bugId)) {
            state.fixedBugs.add(bugId);
            element.classList.add('fixed');
            bugsFixedDisplay.innerText = `${state.fixedBugs.size}/${state.totalBugs} LOGS`;
            devtools.classList.remove('open');

            if (state.fixedBugs.size === state.totalBugs) {
                clearInterval(state.timerId);
                setTimeout(() => winScreen.classList.add('active'), 300);
            }
        }
    }

    function startTimer() {
        state.timerId = setInterval(() => {
            state.timeLeft--;
            let min = Math.floor(state.timeLeft / 60);
            let sec = state.timeLeft % 60;
            timerDisplay.innerText = `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;

            if (state.timeLeft <= 0) {
                clearInterval(state.timerId);
                devtools.classList.remove('open');
                loseScreen.classList.add('active');
            }
        }, 1000);
    }

    document.getElementById('start-game-btn').addEventListener('click', () => {
        welcomeScreen.classList.remove('active');
        startTimer();
    });

// Кнопка подтверждения ПОБЕДЫ
    document.getElementById('win-done-btn').addEventListener('click', () => {
        console.log('QA_GAME_EVENT: WIN_CONFIRMED');
        window.parent.postMessage({ type: 'QA_GAME_FINISHED', status: 'SUCCESS' }, '*');
    });

    // Кнопка перезапуска при ПОРАЖЕНИИ (Исправленная)
    document.getElementById('lose-done-btn').addEventListener('click', () => {
        console.log('QA_GAME_EVENT: LOSE_ACKNOWLEDGED');
        // 1. Уведомляем фронтендера о таймауте
        window.parent.postMessage({ type: 'QA_GAME_FINISHED', status: 'TIMEOUT' }, '*');
        
        // 2. Делаем физический рестарт страницы, как в прошлой версии
        location.reload();
    });

})();