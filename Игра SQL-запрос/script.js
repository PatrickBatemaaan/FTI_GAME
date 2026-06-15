(function() {
    const state = {
        timeLeft: 300, // 5 минут на всю сессию
        timerId: null,
        currentRound: 0,
        assembledSequence: []
    };

    // БАЗА ДАННЫХ ДЛЯ 3 РАУНДОВ С ДИСТРАКТОРАМИ
    const roundsData = [
        {
            // РАУНД 1 (Студенты, 3 параметра)
            table: "FTI_STUDENTS",
            taskHTML: "Найти студента: <br><strong>КУРС = 3 , БЕЗ ОЧКОВ , С БОРОДОЙ</strong>",
            targetConditions: ["c_course", "c_glasses", "c_beard"],
            targetLength: 7, 
            cards: [
                { id: 1, title: "STD_01", props: [{l: "КУРС", v: "1", c: "val-neutral"}, {l: "ОЧКИ", v: "YES", c: "val-true"}, {l: "БОРОДА", v: "NO", c: "val-false"}] },
                { id: 2, title: "STD_02", props: [{l: "КУРС", v: "2", c: "val-neutral"}, {l: "ОЧКИ", v: "NO", c: "val-false"}, {l: "БОРОДА", v: "YES", c: "val-true"}] },
                { id: 3, title: "STD_03", target: true, props: [{l: "КУРС", v: "3", c: "val-neutral"}, {l: "ОЧКИ", v: "NO", c: "val-false"}, {l: "БОРОДА", v: "YES", c: "val-true"}] },
                { id: 4, title: "STD_04", props: [{l: "КУРС", v: "3", c: "val-neutral"}, {l: "ОЧКИ", v: "YES", c: "val-true"}, {l: "БОРОДА", v: "YES", c: "val-true"}] },
                { id: 5, title: "STD_05", props: [{l: "КУРС", v: "2", c: "val-neutral"}, {l: "ОЧКИ", v: "NO", c: "val-false"}, {l: "БОРОДА", v: "NO", c: "val-false"}] },
                { id: 6, title: "STD_06", props: [{l: "КУРС", v: "1", c: "val-neutral"}, {l: "ОЧКИ", v: "NO", c: "val-false"}, {l: "БОРОДА", v: "YES", c: "val-true"}] },
            ],
            tokens: [
                // Правильные блоки
                { id: "select", type: "core-syntax", text: "SELECT * FROM students" },
                { id: "where", type: "core-syntax", text: "WHERE" },
                { id: "c_course", type: "condition", text: "course = 3" },
                { id: "c_glasses", type: "condition", text: "glasses = FALSE" },
                { id: "c_beard", type: "condition", text: "beard = TRUE" },
                { id: "and1", type: "logical", text: "AND" }, { id: "and2", type: "logical", text: "AND" },
                
                // Расширенные блоки-обманки (дистракторы)
                { id: "dist1", type: "distractor", text: "OR" }, 
                { id: "dist2", type: "distractor", text: "glasses = TRUE" },
                { id: "dist3", type: "distractor", text: "course = 2" },
                { id: "dist4", type: "distractor", text: "beard = FALSE" }
            ]
        },
        {
            // РАУНД 2 (Машины, 4 параметра)
            table: "TRANSPORT_FLEET",
            taskHTML: "Найти машину из парка: <br><strong>BMW , ЧЕРНЫЙ , 2023 , АВТОПИЛОТ ЕСТЬ</strong>",
            targetConditions: ["c_brand", "c_color", "c_year", "c_auto"],
            targetLength: 9, 
            cards: [
                { id: 1, title: "CAR_A1", props: [{l: "МАРКА", v: "AUDI", c: "val-neutral"}, {l: "ЦВЕТ", v: "BLACK", c: "val-neutral"}, {l: "ГОД", v: "2023", c: "val-neutral"}, {l: "АВТОПИЛОТ", v: "YES", c: "val-true"}] },
                { id: 2, title: "CAR_A2", target: true, props: [{l: "МАРКА", v: "BMW", c: "val-neutral"}, {l: "ЦВЕТ", v: "BLACK", c: "val-neutral"}, {l: "ГОД", v: "2023", c: "val-neutral"}, {l: "АВТОПИЛОТ", v: "YES", c: "val-true"}] },
                { id: 3, title: "CAR_A3", props: [{l: "МАРКА", v: "BMW", c: "val-neutral"}, {l: "ЦВЕТ", v: "WHITE", c: "val-neutral"}, {l: "ГОД", v: "2023", c: "val-neutral"}, {l: "АВТОПИЛОТ", v: "YES", c: "val-true"}] },
                { id: 4, title: "CAR_A4", props: [{l: "МАРКА", v: "BMW", c: "val-neutral"}, {l: "ЦВЕТ", v: "BLACK", c: "val-neutral"}, {l: "ГОД", v: "2020", c: "val-neutral"}, {l: "АВТОПИЛОТ", v: "NO", c: "val-false"}] },
                { id: 5, title: "CAR_A5", props: [{l: "МАРКА", v: "TESLA", c: "val-neutral"}, {l: "ЦВЕТ", v: "BLACK", c: "val-neutral"}, {l: "ГОД", v: "2023", c: "val-neutral"}, {l: "АВТОПИЛОТ", v: "YES", c: "val-true"}] },
                { id: 6, title: "CAR_A6", props: [{l: "МАРКА", v: "AUDI", c: "val-neutral"}, {l: "ЦВЕТ", v: "WHITE", c: "val-neutral"}, {l: "ГОД", v: "2020", c: "val-neutral"}, {l: "АВТОПИЛОТ", v: "NO", c: "val-false"}] },
            ],
            tokens: [
                // Правильные блоки
                { id: "select", type: "core-syntax", text: "SELECT * FROM fleet" },
                { id: "where", type: "core-syntax", text: "WHERE" },
                { id: "c_brand", type: "condition", text: "brand = 'BMW'" },
                { id: "c_color", type: "condition", text: "color = 'BLACK'" },
                { id: "c_year", type: "condition", text: "year = 2023" },
                { id: "c_auto", type: "condition", text: "autopilot = TRUE" },
                { id: "and1", type: "logical", text: "AND" }, { id: "and2", type: "logical", text: "AND" }, { id: "and3", type: "logical", text: "AND" },
                
                // Расширенные блоки-обманки (дистракторы)
                { id: "dist1", type: "distractor", text: "year = 2020" }, 
                { id: "dist2", type: "distractor", text: "OR" },
                { id: "dist3", type: "distractor", text: "brand = 'AUDI'" },
                { id: "dist4", type: "distractor", text: "color = 'WHITE'" }
            ]
        },
        {
            // РАУНД 3 (Библиотеки, 5 параметров)
            table: "DEV_LIBRARIES",
            taskHTML: "Найти фреймворк: <br><strong>ЯЗЫК: JS , ТИП: UI , ГОД: 2023 , TS_SUPPORT , АКТИВНА</strong>",
            targetConditions: ["c_lang", "c_type", "c_year", "c_ts", "c_active"],
            targetLength: 11, 
            cards: [
                { id: 1, title: "LIB_REACT", target: true, props: [{l: "LANG", v: "JS", c: "val-neutral"}, {l: "TYPE", v: "UI", c: "val-neutral"}, {l: "YEAR", v: "2023", c: "val-neutral"}, {l: "TS", v: "YES", c: "val-true"}, {l: "ACTIVE", v: "YES", c: "val-true"}] },
                { id: 2, title: "LIB_VUE", props: [{l: "LANG", v: "JS", c: "val-neutral"}, {l: "TYPE", v: "UI", c: "val-neutral"}, {l: "YEAR", v: "2020", c: "val-neutral"}, {l: "TS", v: "YES", c: "val-true"}, {l: "ACTIVE", v: "YES", c: "val-true"}] },
                { id: 3, title: "LIB_ANGULAR", props: [{l: "LANG", v: "JS", c: "val-neutral"}, {l: "TYPE", v: "UI", c: "val-neutral"}, {l: "YEAR", v: "2023", c: "val-neutral"}, {l: "TS", v: "YES", c: "val-true"}, {l: "ACTIVE", v: "NO", c: "val-false"}] },
                { id: 4, title: "LIB_EXPRESS", props: [{l: "LANG", v: "JS", c: "val-neutral"}, {l: "TYPE", v: "BACKEND", c: "val-neutral"}, {l: "YEAR", v: "2023", c: "val-neutral"}, {l: "TS", v: "YES", c: "val-true"}, {l: "ACTIVE", v: "YES", c: "val-true"}] },
                { id: 5, title: "LIB_JQUERY", props: [{l: "LANG", v: "JS", c: "val-neutral"}, {l: "TYPE", v: "UI", c: "val-neutral"}, {l: "YEAR", v: "2023", c: "val-neutral"}, {l: "TS", v: "NO", c: "val-false"}, {l: "ACTIVE", v: "YES", c: "val-true"}] },
                { id: 6, title: "LIB_PANDAS", props: [{l: "LANG", v: "PYTHON", c: "val-neutral"}, {l: "TYPE", v: "DATA", c: "val-neutral"}, {l: "YEAR", v: "2023", c: "val-neutral"}, {l: "TS", v: "NO", c: "val-false"}, {l: "ACTIVE", v: "YES", c: "val-true"}] },
            ],
            tokens: [
                // Правильные блоки
                { id: "select", type: "core-syntax", text: "SELECT * FROM libs" },
                { id: "where", type: "core-syntax", text: "WHERE" },
                { id: "c_lang", type: "condition", text: "lang = 'JS'" },
                { id: "c_type", type: "condition", text: "type = 'UI'" },
                { id: "c_year", type: "condition", text: "year = 2023" },
                { id: "c_ts", type: "condition", text: "ts_support = TRUE" },
                { id: "c_active", type: "condition", text: "is_active = TRUE" },
                { id: "and1", type: "logical", text: "AND" }, { id: "and2", type: "logical", text: "AND" }, { id: "and3", type: "logical", text: "AND" }, { id: "and4", type: "logical", text: "AND" },
                
                // Расширенные блоки-обманки (дистракторы)
                { id: "dist1", type: "distractor", text: "type = 'BACKEND'" },
                { id: "dist2", type: "distractor", text: "OR" },
                { id: "dist3", type: "distractor", text: "lang = 'PYTHON'" },
                { id: "dist4", type: "distractor", text: "is_active = FALSE" }
            ]
        }
    ];

    const els = {
        roundDisplay: document.getElementById('round-display'),
        taskText: document.getElementById('task-text'),
        blocksPool: document.getElementById('blocks-pool'),
        dataGrid: document.getElementById('data-grid'),
        queryDisplay: document.getElementById('query-display'),
        timeLeft: document.getElementById('time-left'),
        screens: {
            welcome: document.getElementById('welcome-screen'),
            error: document.getElementById('error-screen'),
            transition: document.getElementById('transition-screen'),
            win: document.getElementById('win-screen'),
            lose: document.getElementById('lose-screen')
        }
    };

    function loadRound(roundIndex) {
        state.assembledSequence = [];
        els.queryDisplay.innerHTML = '<span class="query-placeholder">Строка пуста...</span>';
        
        const data = roundsData[roundIndex];
        els.roundDisplay.innerText = `РАУНД: ${roundIndex + 1} / 3`;
        els.taskText.innerHTML = data.taskHTML;

        // Генерация блоков операторов (перемешиваются случайно)
        els.blocksPool.innerHTML = '';
        const shuffledTokens = data.tokens.sort(() => Math.random() - 0.5);
        
        shuffledTokens.forEach(t => {
            const div = document.createElement('div');
            div.className = `sql-token ${t.type}`;
            div.setAttribute('data-id', t.id);
            div.innerText = t.text;
            
            div.addEventListener('click', () => {
                if (div.classList.contains('in-editor')) return;
                state.assembledSequence.push({ id: t.id, text: t.text, type: t.type, node: div });
                div.classList.add('in-editor');
                renderQuery();
            });
            els.blocksPool.appendChild(div);
        });

        // Генерация сетки досье
        els.dataGrid.innerHTML = '';
        data.cards.forEach(card => {
            const div = document.createElement('div');
            div.className = 'data-card';
            if (card.target) div.setAttribute('data-target', 'true');
            
            let propsHtml = card.props.map(p => `
                <div class="indicator-row">
                    <span class="ind-label">${p.l}:</span>
                    <span class="ind-value ${p.c}">${p.v}</span>
                </div>
            `).join('');

            div.innerHTML = `<div class="data-meta">${card.title}</div><div class="visual-indicators">${propsHtml}</div>`;
            els.dataGrid.appendChild(div);
        });
    }

    function renderQuery() {
        els.queryDisplay.innerHTML = '';
        if (state.assembledSequence.length === 0) {
            els.queryDisplay.innerHTML = '<span class="query-placeholder">Строка пуста...</span>';
            return;
        }

        state.assembledSequence.forEach((item, index) => {
            const block = document.createElement('div');
            block.className = `sql-token ${item.type}`;
            block.innerText = item.text;
            
            block.addEventListener('click', () => {
                item.node.classList.remove('in-editor');
                state.assembledSequence.splice(index, 1);
                renderQuery();
            });
            els.queryDisplay.appendChild(block);
        });
    }

    document.getElementById('btn-clear').addEventListener('click', () => {
        state.assembledSequence.forEach(item => item.node.classList.remove('in-editor'));
        state.assembledSequence = [];
        renderQuery();
        document.querySelectorAll('.data-card').forEach(card => card.classList.remove('filtered-out', 'target-locked'));
    });

    // Валидация запроса
    document.getElementById('btn-execute').addEventListener('click', () => {
        const data = roundsData[state.currentRound];
        const tokens = state.assembledSequence.map(item => item.id);

        const isSyntaxValid = tokens[0] === 'select' && tokens[1] === 'where';
        const hasAllConditions = data.targetConditions.every(cond => tokens.includes(cond));
        const andCount = tokens.filter(t => t.startsWith('and')).length;
        const hasCorrectAnds = andCount === (data.targetConditions.length - 1);
        const noDistractors = !tokens.some(t => t.startsWith('dist'));

        if (isSyntaxValid && hasAllConditions && hasCorrectAnds && noDistractors && tokens.length === data.targetLength) {
            
            document.querySelectorAll('.data-card').forEach(card => {
                if (card.getAttribute('data-target') === 'true') {
                    card.classList.add('target-locked');
                } else {
                    card.classList.add('filtered-out');
                }
            });

            setTimeout(() => {
                if (state.currentRound < 2) {
                    els.screens.transition.classList.add('active');
                } else {
                    clearInterval(state.timerId);
                    els.screens.win.classList.add('active');
                }
            }, 1000);

        } else {
            // Включаем внутриигровое модальное окно сбоя + штраф по времени
            state.timeLeft = Math.max(0, state.timeLeft - 15);
            updateTimerUI();
            els.screens.error.classList.add('active');
        }
    });

    // Закрытие окна ошибки
    document.getElementById('error-close-btn').addEventListener('click', () => {
        els.screens.error.classList.remove('active');
    });

    document.getElementById('next-round-btn').addEventListener('click', () => {
        els.screens.transition.classList.remove('active');
        state.currentRound++;
        loadRound(state.currentRound);
    });

    function updateTimerUI() {
        let m = Math.floor(state.timeLeft / 60);
        let s = state.timeLeft % 60;
        els.timeLeft.innerText = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }

    function startTimer() {
        state.timerId = setInterval(() => {
            state.timeLeft--;
            updateTimerUI();

            if (state.timeLeft <= 0) {
                clearInterval(state.timerId);
                els.screens.error.classList.remove('active'); 
                els.screens.lose.classList.add('active');
            }
        }, 1000);
    }

    document.getElementById('start-game-btn').addEventListener('click', () => {
        const container = document.getElementById('sql-game-container');
        if (container.requestFullscreen) container.requestFullscreen();
        
        els.screens.welcome.classList.remove('active');
        loadRound(0);
        startTimer();
    });

    // ПОБЕДНЫЙ ХУК ДЛЯ КУРСА
    document.getElementById('win-done-btn').addEventListener('click', () => {
        window.parent.postMessage({ type: "game_completed" }, "*");
    });

    // ПЕРЕЗАГРУЗКА
    document.getElementById('lose-done-btn').addEventListener('click', () => {
        location.reload();
    });

})();