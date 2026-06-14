(function() {
    // Состояние игры
    const state = {
        timeLeft: 180, // 3 минуты на симуляцию
        timerId: null,
        activeBugId: null,
        fixedBugs: new Set(),
        totalBugs: 10
    };

    // Элементы интерфейса
    const welcomeScreen = document.getElementById('welcome-screen');
    const winScreen = document.getElementById('win-screen');
    const loseScreen = document.getElementById('lose-screen');
    const timerDisplay = document.getElementById('time-left');
    const progressDisplay = document.getElementById('progress-count');
    
    // Элементы панели инспектора (DevTools)
    const inspectorPanel = document.getElementById('inspector-panel');
    const bugTitle = document.getElementById('bug-title');
    const bugControls = document.getElementById('bug-controls');

    // База данных багов: шаблоны управления и условия их исправления
    const bugDatabase = {
        'bug-letter-spacing': {
            title: 'Синтаксический баг: Избыточный letter-spacing',
            render: () => `<label>letterSpacing (px):</label><input type="range" id="fix-input" min="0" max="20" value="16">`,
            init: (element, onFix) => {
                const input = document.getElementById('fix-input');
                input.addEventListener('input', (e) => {
                    const val = e.target.value;
                    element.style.letterSpacing = `${val}px`; // Валидный JS camelCase
                    if (parseInt(val) <= 1) onFix();
                });
            }
        },
        'bug-font-size': {
            title: 'Сломанная иерархия: Экстремальный размер заголовка',
            render: () => `<label>font-size (px):</label><input type="range" id="fix-input" min="12" max="80" value="72">`,
            init: (element, onFix) => {
                const input = document.getElementById('fix-input');
                input.addEventListener('input', (e) => {
                    const val = e.target.value;
                    element.style.fontSize = `${val}px`;
                    if (parseInt(val) >= 20 && parseInt(val) <= 28) onFix();
                });
            }
        },
        'bug-flex-spacing': {
            title: 'Смещение сетки: Перекрытие элементов через justify-content',
            render: () => `
                <label>justify-content:</label>
                <select id="fix-input">
                    <option value="space-between" selected>space-between</option>
                    <option value="center">center</option>
                    <option value="flex-start">flex-start</option>
                </select>`,
            init: (element, onFix) => {
                document.getElementById('fix-input').addEventListener('change', (e) => {
                    element.style.justifyContent = e.target.value;
                    if (e.target.value === 'center') onFix();
                });
            }
        },
        'bug-color-contrast': {
            title: 'Нарушение accessibility: Нечитаемый серый текст на сером фоне',
            render: () => `<label>Цвет текста:</label><input type="color" id="fix-input" value="#888888">`,
            init: (element, onFix) => {
                document.getElementById('fix-input').addEventListener('input', (e) => {
                    element.style.color = e.target.value;
                    if (e.target.value.toLowerCase() === '#ffffff' || e.target.value.toLowerCase() === '#000000') onFix();
                });
            }
        },
        'bug-opacity': {
            title: 'Рендеринг: Элемент случайно скрыт через непрозрачность',
            render: () => `<label>opacity:</label><input type="range" id="fix-input" min="0" max="1" step="0.1" value="0">`,
            init: (element, onFix) => {
                document.getElementById('fix-input').addEventListener('input', (e) => {
                    element.style.opacity = e.target.value;
                    if (parseFloat(e.target.value) >= 0.9) onFix();
                });
            }
        },
        'bug-padding': {
            title: 'Плохой UX: Слишком мелкая кликабельная зона кнопки',
            render: () => `<label>padding (px):</label><input type="range" id="fix-input" min="2" max="24" value="2">`,
            init: (element, onFix) => {
                document.getElementById('fix-input').addEventListener('input', (e) => {
                    element.style.padding = `${e.target.value}px`;
                    if (parseInt(e.target.value) >= 12) onFix();
                });
            }
        },
        'bug-border-radius': {
            title: 'Геометрия: Острые углы элемента ломают гайдлайны скруглений',
            render: () => `<label>border-radius (px):</label><input type="range" id="fix-input" min="0" max="30" value="0">`,
            init: (element, onFix) => {
                document.getElementById('fix-input').addEventListener('input', (e) => {
                    element.style.borderRadius = `${e.target.value}px`;
                    if (parseInt(e.target.value) >= 8 && parseInt(e.target.value) <= 16) onFix();
                });
            }
        },
        'bug-width': {
            title: 'Адаптивность: Фиксированная ширина ломает контейнер',
            render: () => `
                <label>width:</label>
                <select id="fix-input">
                    <option value="600px" selected>600px</option>
                    <option value="100%">100%</option>
                    <option value="auto">auto</option>
                </select>`,
            init: (element, onFix) => {
                document.getElementById('fix-input').addEventListener('change', (e) => {
                    element.style.width = e.target.value;
                    if (e.target.value === '100%' || e.target.value === 'auto') onFix();
                });
            }
        },
        'bug-z-index': {
            title: 'Слои: Всплывающая подсказка перекрыта нижним блоком',
            render: () => `<label>z-index:</label><input type="number" id="fix-input" value="0">`,
            init: (element, onFix) => {
                document.getElementById('fix-input').addEventListener('input', (e) => {
                    element.style.zIndex = e.target.value;
                    if (parseInt(e.target.value) >= 10) onFix();
                });
            }
        },
        'bug-text-transform': {
            title: 'Контентный баг: Капслок в описании ошибки',
            render: () => `
                <label>text-transform:</label>
                <select id="fix-input">
                    <option value="uppercase" selected>uppercase</option>
                    <option value="none">none</option>
                    <option value="capitalize">capitalize</option>
                </select>`,
            init: (element, onFix) => {
                document.getElementById('fix-input').addEventListener('change', (e) => {
                    element.style.textTransform = e.target.value;
                    if (e.target.value === 'none') onFix();
                });
            }
        }
    };

    // Слушатель кликов по элементам с багами
    document.querySelectorAll('[data-bug]').forEach(element => {
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            const bugId = element.getAttribute('data-bug');
            if (state.fixedBugs.has(bugId)) return; // Игнорируем уже исправленное

            state.activeBugId = bugId;
            openInspector(bugId, element);
        });
    });

    // Открытие панели инспектора
    function openInspector(bugId, element) {
        const config = bugDatabase[bugId];
        if (!config) return;

        inspectorPanel.classList.add('open');
        bugTitle.innerText = config.title;
        bugControls.innerHTML = config.render();

        config.init(element, () => {
            // Callback успешного исправления бага
            state.fixedBugs.add(bugId);
            element.removeAttribute('data-bug');
            element.classList.add('bug-resolved');
            inspectorPanel.classList.remove('open');
            
            updateProgress();
            checkWinCondition();
        });
    }

    // Обновление счетчика
    function updateProgress() {
        progressDisplay.innerText = `${state.fixedBugs.size} / ${state.totalBugs}`;
    }

    // Проверка победы
    function checkWinCondition() {
        if (state.fixedBugs.size === state.totalBugs) {
            clearInterval(state.timerId);
            setTimeout(() => {
                winScreen.classList.add('active');
            }, 500);
        }
    }

    // Таймер игры
    function startTimer() {
        state.timerId = setInterval(() => {
            state.timeLeft--;
            let min = Math.floor(state.timeLeft / 60);
            let sec = state.timeLeft % 60;
            timerDisplay.innerText = `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;

            if (state.timeLeft <= 0) {
                clearInterval(state.timerId);
                inspectorPanel.classList.remove('open');
                loseScreen.classList.add('active');
            }
        }, 1000);
    }

    // Кнопка Старт на приветственном экране
    document.getElementById('start-game-btn').addEventListener('click', () => {
        welcomeScreen.classList.remove('active');
        updateProgress();
        startTimer();
    });

    // Закрытие инспектора при клике мимо него
    document.addEventListener('click', (e) => {
        if (!inspectorPanel.contains(e.target)) {
            inspectorPanel.classList.remove('open');
            state.activeBugId = null;
        }
    });

    // === НОВАЯ СИСТЕМНАЯ ПОЛИТИКА ИНТЕГРАЦИИ ===

    // ПОБЕДА: Передаем сигнал завершения фронтендеру в родительское окно
    document.getElementById('win-done-btn').addEventListener('click', () => {
        window.parent.postMessage({ type: "game_completed" }, "*");
    });

    // ПОРАЖЕНИЕ: Полный мягкий сброс сессии без отправки каких-либо данных наружу
    document.getElementById('lose-done-btn').addEventListener('click', () => {
        location.reload();
    });

})();