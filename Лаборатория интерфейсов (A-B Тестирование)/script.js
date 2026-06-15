(function() {
    const state = {
        currentLevel: 0,
        lives: 3,
        selectedMockupId: null
    };

    const levels = [
        {
            task: "Наше приложение создано для пенсионеров. Какая форма авторизации покажет лучшую конверсию?",
            correctMockup: 2,
            correctReason: 1,
            mockups: [
                { id: 0, title: "Концепт А (Sleek)", html: '<div class="ui-case1-hipster"><div class="dot-logo"></div><div class="line-input"></div><div class="line-input"></div><div class="btn-minimal">SIGN IN</div></div>' },
                { id: 1, title: "Концепт Б (Web3)", html: '<div class="ui-case1-crypto"><div class="crypto-badge">🦊</div><div class="crypto-title">CryptoAuth v2</div><button class="wallet-btn">Connect Wallet</button></div>' },
                { id: 2, title: "Концепт В (Utilitarian)", html: '<div class="ui-case1-accessible"><div class="big-header">ВХОД В СЕРВИС</div><div class="huge-label">Ваш телефон:</div><div class="huge-input">8 (999) 000-00-00</div><button class="huge-btn">ПОЛУЧИТЬ СМС КОД</button></div>' }
            ],
            reasons: [
                { id: 0, text: "Тонкие линии и темная минималистичная тема снижают зрительную нагрузку." },
                { id: 1, text: "Для возрастной ЦА критически важна высокая читаемость (крупный текст) и простой привычный паттерн входа по номеру телефона." },
                { id: 2, text: "Криптокошельки исключают кражу паролей злоумышленниками с помощью фишинга." }
            ]
        },
        {
            task: "Приложение доставки еды. Студент находится на этапе корзины. Задача — минимизировать отказы от покупки.",
            correctMockup: 1,
            correctReason: 2,
            mockups: [
                { id: 0, title: "Концепт А (Step-Form)", html: '<div class="ui-case2-form"><div class="step-bar"><span class="active">1.Адрес</span><span>2.Оплата</span><span>3.Скидка</span></div><div class="input-group"><span class="micro-label">Улица</span><div class="micro-input"></div></div><div class="input-group"><span class="micro-label">Дом / Подъезд</span><div class="micro-input"></div></div><button class="next-btn">ДАЛЕЕ</button></div>' },
                { id: 1, title: "Концепт Б (Express Pay)", html: '<div class="ui-case2-instant"><div class="food-hero"><span class="food-title">Комбо-Набор 850₽</span></div><button class="apple-pay-btn">⚡ Быстрый заказ</button></div>' },
                { id: 2, title: "Концепт В (Legal Safety)", html: '<div class="ui-case2-legal"><div class="legal-box">Нажимая кнопку, пользователь соглашается с пунктами 4.1, 8.2 регламента обработки персональных данных и правилами возврата...</div><div class="check-row"><div class="check-box"></div> Согласен</div><button class="action-btn-legal">Подтвердить заказ</button></div>' }
            ],
            reasons: [
                { id: 0, text: "Разбиение формы на шаги помогает структурировать ввод и не пугает пользователя объёмом." },
                { id: 1, text: "Юридическая прозрачность на этапе оплаты повышает доверие и лояльность клиентов." },
                { id: 2, text: "Меньше шагов — выше конверсия. Для голодного студента важна импульсивная покупка в одно касание без лишнего трения." }
            ]
        },
        {
            task: "Профессиональный B2B инструмент. Аналитики работают с терабайтами финансовых данных 8 часов в день. Какой интерфейс им нужен?",
            correctMockup: 1,
            correctReason: 0,
            mockups: [
                { id: 0, title: "Концепт А (Neo-SaaS)", html: '<div class="ui-case3-dribbble"><div class="fancy-header"><span>Analytics Node</span><div class="avatar"></div></div><div class="main-stat-card"><div class="huge-percent">98.4%</div><div class="sub-lbl">Efficiency rate</div></div><div class="smooth-chart-mock"></div></div>' },
                { id: 1, title: "Концепт Б (Data Terminal)", html: '<div class="ui-case3-terminal"><div class="system-bar"><span>SYS_MODE: COMPACT</span><span>DB_OK</span></div><div class="grid-mini-metrics"><div class="metric-box">VOL: <span>41.2K</span></div><div class="metric-box">DELTA: <span style="color:#ef4444">-0.82</span></div><div class="metric-box">ROI: <span style="color:#10b981">+14.5</span></div></div><div class="dense-table"><div class="table-header-row"><span>TICKER</span><span>PRICE</span><span>TREND</span></div><div class="table-data-row"><span>AAPL.US</span><span>174.2</span><div class="sparkline-container"></div></div><div class="table-data-row"><span>TSLA.US</span><span class="neg-val">162.0</span><div class="sparkline-container" style="background:rgba(239,68,68,0.1); border-color:#ef4444;"></div></div><div class="table-data-row"><span>MSFT.US</span><span class="pos-val">421.9</span><div class="sparkline-container"></div></div></div></div>' },
                { id: 2, title: "Концепт В (AI Wizard)", html: '<div class="ui-case3-ai"><div class="ai-bubble">Привет! Я твой AI-помощник. Финансовые графики слишком скучные, хочешь я сразу покажу тебе мем про акции?</div><div class="magic-spark">✨</div><button class="ai-btn">Сделать красиво</button></div>' }
            ],
            reasons: [
                { id: 0, text: "Профессионалам не нужны красивые пустые пространства и гигантские абстрактные цифры. Им нужна максимальная плотность данных, таблицы, фильтры и сухой функционал без визуального шума." },
                { id: 1, text: "Геймификация и интерактивные подсказки от искусственного интеллекта снижают выгорание сотрудников финансового сектора." },
                { id: 2, text: "Минимум графиков и акцент на одну ключевую красивую метрику (как в Концепте А) позволяют быстрее принимать стратегические решения." }
            ]
        }
    ];

    const els = {
        mainGame: document.getElementById('main-game'),
        levelDisplay: document.getElementById('level-display'),
        livesDisplay: document.getElementById('lives-display'),
        taskText: document.getElementById('task-text'),
        carousel: document.getElementById('carousel'),
        reasonsContainer: document.getElementById('reasons-container'),
        errorText: document.getElementById('error-text'),
        successText: document.getElementById('success-text'), // Добавлено
        
        screens: {
            welcome: document.getElementById('welcome-screen'),
            reasonModal: document.getElementById('reason-modal'),
            error: document.getElementById('error-screen'),
            success: document.getElementById('success-screen'), // Добавлено
            win: document.getElementById('win-screen'),
            lose: document.getElementById('lose-screen')
        }
    };

    function loadLevel(index) {
        const lvl = levels[index];
        els.levelDisplay.innerText = `КЕЙС: ${index + 1} / ${levels.length}`;
        els.taskText.innerText = lvl.task;
        
        els.carousel.innerHTML = '';
        
        lvl.mockups.forEach(m => {
            const card = document.createElement('div');
            card.className = 'mockup-card';
            card.innerHTML = `
                <div class="mockup-header">${m.title}</div>
                <div class="mockup-body">${m.html}</div>
                <div class="select-btn-wrap">
                    <button class="select-mockup-btn" data-id="${m.id}">ВЫБРАТЬ</button>
                </div>
            `;
            els.carousel.appendChild(card);
        });

        document.querySelectorAll('.select-mockup-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                state.selectedMockupId = parseInt(e.target.getAttribute('data-id'));
                openReasonModal(lvl);
            });
        });

        els.carousel.scrollTo(0, 0);
    }

    function openReasonModal(levelData) {
        els.reasonsContainer.innerHTML = '';
        const shuffledReasons = [...levelData.reasons].sort(() => Math.random() - 0.5);
        
        shuffledReasons.forEach(r => {
            const btn = document.createElement('button');
            btn.className = 'reason-btn';
            btn.innerText = r.text;
            btn.addEventListener('click', () => checkAnswer(r.id));
            els.reasonsContainer.appendChild(btn);
        });

        els.screens.reasonModal.classList.remove('hidden');
    }

    function checkAnswer(reasonId) {
        els.screens.reasonModal.classList.add('hidden');
        const lvl = levels[state.currentLevel];

        // ЛОГИКА ПРАВИЛЬНОГО ОТВЕТА ИЗМЕНЕНА ЗДЕСЬ
        if (state.selectedMockupId === lvl.correctMockup && reasonId === lvl.correctReason) {
            // Находим текст правильного обоснования и показываем его
            const correctReasonData = lvl.reasons.find(r => r.id === lvl.correctReason);
            els.successText.innerText = correctReasonData.text;
            els.screens.success.classList.remove('hidden');
        } else {
            state.lives--;
            els.livesDisplay.innerText = state.lives;
            
            if (state.selectedMockupId !== lvl.correctMockup) {
                els.errorText.innerText = "Выбран неподходящий экран для данной целевой аудитории. Метрики конверсии упали.";
            } else {
                els.errorText.innerText = "Экран выбран верно, но вы не смогли аргументировать решение перед командой разработки.";
            }

            if (state.lives <= 0) {
                els.screens.lose.classList.remove('hidden');
            } else {
                els.screens.error.classList.remove('hidden');
            }
        }
    }

    // НОВЫЙ ОБРАБОТЧИК ДЛЯ КНОПКИ "СЛЕДУЮЩИЙ КЕЙС"
    document.getElementById('btn-next-level').addEventListener('click', () => {
        els.screens.success.classList.add('hidden');
        state.currentLevel++;
        if (state.currentLevel >= levels.length) {
            els.screens.win.classList.remove('hidden');
        } else {
            loadLevel(state.currentLevel);
        }
    });

    document.getElementById('btn-start').addEventListener('click', () => {
        const container = document.getElementById('game-container');
        if (container.requestFullscreen) container.requestFullscreen();

        els.screens.welcome.classList.add('hidden');
        els.mainGame.classList.remove('hidden');
        loadLevel(0);
    });

    document.getElementById('btn-close-reason').addEventListener('click', () => {
        els.screens.reasonModal.classList.add('hidden');
    });

    document.getElementById('btn-retry').addEventListener('click', () => {
        els.screens.error.classList.add('hidden');
    });

    document.getElementById('btn-win-done').addEventListener('click', () => {
        window.parent.postMessage({ type: "game_completed" }, "*");
    });

    document.getElementById('btn-lose-done').addEventListener('click', () => {
        location.reload();
    });

})();