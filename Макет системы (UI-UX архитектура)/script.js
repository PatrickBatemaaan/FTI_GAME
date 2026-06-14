(function() {
    const state = {
        timeLeft: 180,
        timerId: null,
        selectedComponent: null,
        layout: { '1': null, '2': null, '3': null, '4': null, '5': null }
    };

    // Оригинальные тексты слотов (для восстановления при очистке)
    const slotDescriptions = {
        '1': 'Слот 1: Визуальный фокус',
        '2': 'Слот 2: Контекст',
        '3': 'Слот 3: Интерактив',
        '4': 'Слот 4: Калькуляция',
        '5': 'Слот 5: Завершение флоу'
    };

    const welcomeScreen = document.getElementById('welcome-screen');
    const winScreen = document.getElementById('win-screen');
    const loseScreen = document.getElementById('lose-screen');
    const timerDisplay = document.getElementById('time-left');
    const terminal = document.getElementById('terminal-output');
    const inventory = document.getElementById('inventory');
    const slots = document.querySelectorAll('.ux-drop-slot');

    const uiMetrics = {
        conversion: { bar: document.getElementById('bar-conversion'), val: document.getElementById('val-conversion') },
        load: { bar: document.getElementById('bar-load'), val: document.getElementById('val-load') },
        a11y: { bar: document.getElementById('bar-a11y'), val: document.getElementById('val-a11y') }
    };

    function printLog(text, type = 'normal') {
        const line = document.createElement('div');
        line.className = `log-line ${type}`;
        line.innerText = `> ${text}`;
        terminal.appendChild(line);
        terminal.scrollTop = terminal.scrollHeight;
    }

    function recalculateLiveMetrics() {
        let conversion = 0;
        let cogLoad = 10;
        let a11y = 20;

        const items = Object.values(state.layout);
        const filledCount = items.filter(x => x !== null).length;

        if (filledCount > 0) {
            if (state.layout['1'] === 'comp-image') { conversion += 25; a11y += 20; }
            if (state.layout['2'] === 'comp-title') { conversion += 20; a11y += 20; }
            
            items.forEach(item => {
                if (item === 'comp-banner') { conversion -= 15; cogLoad += 45; a11y -= 15; }
                if (item === 'comp-spacer') { cogLoad += 10; }
                if (item === 'comp-counter') { conversion += 15; cogLoad += 10; }
                if (item === 'comp-price') { conversion += 15; a11y += 15; }
                if (item === 'comp-button') { conversion += 20; }
                if (item === 'comp-badge') { conversion += 10; cogLoad += 5; }
            });

            if (filledCount === 5) cogLoad += 15;
        }

        conversion = Math.max(0, Math.min(100, conversion));
        cogLoad = Math.max(0, Math.min(100, cogLoad));
        a11y = Math.max(0, Math.min(100, a11y));

        uiMetrics.conversion.bar.style.width = `${conversion}%`;
        uiMetrics.conversion.val.innerText = `${conversion}%`;
        uiMetrics.load.bar.style.width = `${cogLoad}%`;
        uiMetrics.load.val.innerText = `${cogLoad}%`;
        uiMetrics.a11y.bar.style.width = `${a11y}%`;
        uiMetrics.a11y.val.innerText = `${a11y}%`;
    }

    document.querySelectorAll('.ux-component').forEach(comp => {
        comp.addEventListener('pointerdown', (e) => {
            if (comp.classList.contains('in-use')) return;
            document.querySelectorAll('.ux-component').forEach(c => c.classList.remove('selected'));
            state.selectedComponent = comp;
            comp.classList.add('selected');
        });

        comp.addEventListener('dragstart', (e) => {
            if (comp.classList.contains('in-use')) {
                e.preventDefault();
                return;
            }
            e.dataTransfer.setData('text/plain', comp.getAttribute('data-comp'));
        });
    });

    slots.forEach(slot => {
        slot.addEventListener('pointerdown', () => {
            if (state.selectedComponent) {
                placeComponent(slot, state.selectedComponent);
                state.selectedComponent.classList.remove('selected');
                state.selectedComponent = null;
            }
        });

        slot.addEventListener('dragover', (e) => e.preventDefault());
        slot.addEventListener('dragenter', () => slot.classList.add('hovered'));
        slot.addEventListener('dragleave', () => slot.classList.remove('hovered'));
        slot.addEventListener('drop', (e) => {
            slot.classList.remove('hovered');
            const compId = e.dataTransfer.getData('text/plain');
            const compEl = inventory.querySelector(`[data-comp="${compId}"]`);
            if (compEl) placeComponent(slot, compEl);
        });
    });

    function placeComponent(slot, element) {
        const slotNum = slot.getAttribute('data-slot');
        const compId = element.getAttribute('data-comp');

        const oldComponent = slot.querySelector('.ux-component');
        if (oldComponent) {
            const oldCompId = oldComponent.getAttribute('data-comp');
            const originalItem = inventory.querySelector(`[data-comp="${oldCompId}"]`);
            if (originalItem) originalItem.classList.remove('in-use');
        }

        slot.innerHTML = '';
        const clone = element.cloneNode(true);
        clone.classList.remove('selected', 'in-use');
        
        clone.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            removeComponent(slotNum);
        });

        slot.appendChild(clone);
        slot.setAttribute('data-filled', 'true');
        state.layout[slotNum] = compId;

        element.classList.add('in-use');

        printLog(`Слот ${slotNum} <- ${element.innerText}`);
        recalculateLiveMetrics();
    }

    function removeComponent(slotNum) {
        const slot = document.querySelector(`.ux-drop-slot[data-slot="${slotNum}"]`);
        const compEl = slot.querySelector('.ux-component');
        
        if (compEl) {
            const compId = compEl.getAttribute('data-comp');
            const originalItem = inventory.querySelector(`[data-comp="${compId}"]`);
            if (originalItem) originalItem.classList.remove('in-use');
        }

        const originalText = slotDescriptions[slotNum] || `Слот ${slotNum}`;
        slot.innerHTML = `<span class="slot-placeholder">${originalText}</span>`;
        
        slot.removeAttribute('data-filled');
        state.layout[slotNum] = null;
        printLog(`Слот ${slotNum} очищен`);
        recalculateLiveMetrics();
    }

    document.getElementById('clear-btn').addEventListener('click', () => {
        Object.keys(state.layout).forEach(slotNum => removeComponent(slotNum));
        printLog('Архитектурная сетка полностью сброшена', 'system');
    });

    document.getElementById('validate-btn').addEventListener('click', () => {
        printLog('Запуск глубокого UX-анализа структуры...', 'system');
        
        let fatalError = false;

        for (let i = 1; i <= 5; i++) {
            if (!state.layout[i.toString()]) {
                printLog(`Ошибка сборки: Слот ${i} пуст. Интерфейс не завершен!`, 'error');
                fatalError = true;
            }
        }

        if (fatalError) {
            printLog('Компиляция отклонена: заполните абсолютно все слоты макета.', 'error');
            return;
        }

        const positions = {};
        Object.keys(state.layout).forEach(slot => {
            if (state.layout[slot]) positions[state.layout[slot]] = parseInt(slot);
        });

        if (!positions['comp-image']) { printLog('Критическая ошибка: отсутствует фото блюда.', 'error'); fatalError = true; }
        if (!positions['comp-title']) { printLog('Критическая ошибка: отсутствует название продукта.', 'error'); fatalError = true; }
        if (!positions['comp-price']) { printLog('Критическая ошибка: отсутствует цена продажи.', 'error'); fatalError = true; }
        if (!positions['comp-button']) { printLog('Критическая ошибка: отсутствует CTA-кнопка.', 'error'); fatalError = true; }

        if (fatalError) return;

        if (positions['comp-image'] !== 1) {
            printLog('Нарушение паттерна скроллинга: фото должно быть в Слоте 1.', 'error');
            fatalError = true;
        }

        if (positions['comp-title'] > positions['comp-price']) {
            printLog('Ошибка восприятия: пользователь видит стоимость раньше названия.', 'error');
            fatalError = true;
        }

        if (positions['comp-counter']) {
            const counterPos = positions['comp-counter'];
            const pricePos = positions['comp-price'];
            const btnPos = positions['comp-button'];
            if (Math.abs(counterPos - pricePos) !== 1 && Math.abs(counterPos - btnPos) !== 1) {
                printLog('Нарушение закона близости: селектор количества оторван от цены или кнопки!', 'error');
                fatalError = true;
            }
        }

        if (positions['comp-banner']) {
            printLog('Обнаружен Dark Pattern! Рекламный блок внутри карточки недопустим.', 'error');
            fatalError = true;
        }

        if (positions['comp-button'] !== 5) {
            printLog('Нарушение Gutenberg-пакета: целевая кнопка должна быть в самом низу (Слот 5).', 'error');
            fatalError = true;
        }

        if (!fatalError) {
            printLog('Иерархия верифицирована. Макет идеален.', 'success');
            clearInterval(state.timerId);
            setTimeout(() => winScreen.classList.add('active'), 600);
        } else {
            printLog('Компиляция отклонена. Перестройте структуру интерфейса.', 'error');
        }
    });

    function startTimer() {
        state.timerId = setInterval(() => {
            state.timeLeft--;
            let min = Math.floor(state.timeLeft / 60);
            let sec = state.timeLeft % 60;
            timerDisplay.innerText = `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;

            if (state.timeLeft <= 0) {
                clearInterval(state.timerId);
                loseScreen.classList.add('active');
            }
        }, 1000);
    }

    document.getElementById('start-game-btn').addEventListener('click', () => {
        const container = document.getElementById('qa-game-container');
        if (container.requestFullscreen) container.requestFullscreen();
        else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
        else if (container.mozRequestFullScreen) container.mozRequestFullScreen();

        welcomeScreen.classList.remove('active');
        startTimer();
    });

    // ПОБЕДА: отправляем postMessage во внешнюю систему
    document.getElementById('win-done-btn').addEventListener('click', () => {
        window.parent.postMessage({ type: "game_completed" }, "*");
    });

    // ПОРАЖЕНИЕ: просто мягко перезапускаем игру для новой попытки без уведомления сайта
    document.getElementById('lose-done-btn').addEventListener('click', () => {
        location.reload();
    });

})();