function initGameApp() {
    const state = {
        timeLeft: 300, // 5 минут
        timerId: null,
        attemptsLeft: 3, // 3 ошибки максимум
        isGameActive: false
    };

    // Словари для "ИИ"
    const FORBIDDEN_WORDS = ["институт", "университет", "вуз", "факультет", "академия", "учеба"];
    const DIRECT_INJECTION = ["физтех"]; // Игрок не должен сам писать это слово

    // Собираем все элементы
    const els = {
        attemptsDisplay: document.getElementById('attempts-display'),
        promptInput: document.getElementById('prompt-input'),
        chatLog: document.getElementById('chat-log'),
        timeLeft: document.getElementById('time-left'),
        screens: {
            welcome: document.getElementById('welcome-screen'),
            error: document.getElementById('error-screen'),
            win: document.getElementById('win-screen'),
            lose: document.getElementById('lose-screen')
        },
        errorReasonText: document.getElementById('error-reason-text')
    };

    // Кнопки
    const startBtn = document.getElementById('start-game-btn');
    const executeBtn = document.getElementById('btn-execute');
    const clearBtn = document.getElementById('btn-clear');
    const errorCloseBtn = document.getElementById('error-close-btn');
    const winDoneBtn = document.getElementById('win-done-btn');
    const loseDoneBtn = document.getElementById('lose-done-btn');

    function updateUI() {
        if (els.attemptsDisplay) els.attemptsDisplay.innerText = `ПОПЫТКИ: ${state.attemptsLeft} / 3`;
        let m = Math.floor(state.timeLeft / 60);
        let s = state.timeLeft % 60;
        if (els.timeLeft) els.timeLeft.innerText = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }

    function addMessage(sender, text, isError = false) {
        if (!els.chatLog) return;
        const div = document.createElement('div');
        div.className = `chat-msg ${sender === 'USER' ? 'user-msg' : 'ai-msg'}`;
        if (isError) div.classList.add('ai-error');
        
        div.innerHTML = `<span class="msg-author">${sender}:</span> ${text}`;
        els.chatLog.appendChild(div);
        els.chatLog.scrollTop = els.chatLog.scrollHeight;
    }

    function triggerError(reason) {
        state.attemptsLeft--;
        state.timeLeft = Math.max(0, state.timeLeft - 30); // Штраф -30 секунд
        
        updateUI();
        if (els.errorReasonText) els.errorReasonText.innerText = reason;
        if (els.screens.error) els.screens.error.classList.add('active');

        addMessage("СИСТЕМА", "[ЗАПРОС ОТКЛОНЕН] " + reason, true);

        if (state.attemptsLeft <= 0 || state.timeLeft <= 0) {
            clearInterval(state.timerId);
            setTimeout(() => {
                if (els.screens.error) els.screens.error.classList.remove('active');
                if (els.screens.lose) els.screens.lose.classList.add('active');
            }, 1000);
        }
    }

    function processPrompt() {
        if (!state.isGameActive || !els.promptInput) return;
        const text = els.promptInput.value.trim();
        if (!text) return;

        // Очищаем инпут и выводим сообщение пользователя
        els.promptInput.value = '';
        addMessage("USER", text);

        const lowerText = text.toLowerCase();

        // 1. Проверка на прямой Prompt Injection (Игрок сам написал слово)
        if (DIRECT_INJECTION.some(word => lowerText.includes(word))) {
            triggerError("Обнаружена попытка прямого внедрения промпта (Prompt Injection). ИИ не реагирует на прямые приказы.");
            return;
        }

        // 2. Проверка на стоп-слова
        const foundForbidden = FORBIDDEN_WORDS.find(word => lowerText.includes(word));
        if (foundForbidden) {
            triggerError(`Использовано стоп-слово: "${foundForbidden.toUpperCase()}".`);
            return;
        }

        // 3. Логика угадывания (Симуляция LLM)
        const hasPhysics = /(физик|наук|фт)/i.test(lowerText);
        const hasTech = /(технолог|айти|програм|инженер|it)/i.test(lowerText);
        const hasPlace = /(где|место|учат|центр|называется|заведение)/i.test(lowerText);

        const score = (hasPhysics ? 1 : 0) + (hasTech ? 1 : 0) + (hasPlace ? 1 : 0);

        if (score >= 2) {
            // Победа!
            setTimeout(() => {
                addMessage("AI", "Анализирую параметры: точные науки, технологии, местоположение... Вероятно, вы имеете в виду <strong>ФИЗТЕХ</strong>?");
                clearInterval(state.timerId);
                state.isGameActive = false;
                
                // Кулдаун изменен с 1.5 до 5 секунд (5000мс)
                setTimeout(() => {
                    if (els.screens.win) els.screens.win.classList.add('active');
                }, 5000);
            }, 800);
        } else if (hasPhysics) {
            setTimeout(() => addMessage("AI", "Вы спрашиваете о физике. Пожалуйста, дайте больше контекста, чтобы я мог дать точный ответ."), 600);
        } else if (hasTech) {
            setTimeout(() => addMessage("AI", "Технологии развиваются быстро. Что конкретно в IT-сфере вас интересует?"), 600);
        } else {
            setTimeout(() => addMessage("AI", "Я системный ИИ-помощник. Ваш запрос слишком размыт или не содержит явных признаков. Пожалуйста, конкретизируйте вопрос."), 600);
        }
    }

    function startTimer() {
        if (state.timerId) clearInterval(state.timerId);
        state.isGameActive = true;
        
        state.timerId = setInterval(() => {
            state.timeLeft--;
            updateUI();

            if (state.timeLeft <= 0) {
                clearInterval(state.timerId);
                state.isGameActive = false;
                if (els.screens.error) els.screens.error.classList.remove('active'); 
                if (els.screens.lose) els.screens.lose.classList.add('active');
            }
        }, 1000);
    }

    // --- ПРИВЯЗКА СОБЫТИЙ ---

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (els.screens.welcome) els.screens.welcome.classList.remove('active');
            updateUI();
            startTimer();
        });
    }

    if (executeBtn) executeBtn.addEventListener('click', processPrompt);
    
    if (clearBtn && els.promptInput) {
        clearBtn.addEventListener('click', () => { els.promptInput.value = ''; });
    }
    
    if (els.promptInput) {
        els.promptInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                processPrompt();
            }
        });
    }

    if (errorCloseBtn) {
        errorCloseBtn.addEventListener('click', () => {
            if (els.screens.error) els.screens.error.classList.remove('active');
        });
    }

    if (loseDoneBtn) {
        loseDoneBtn.addEventListener('click', () => {
            location.reload();
        });
    }

    if (winDoneBtn) {
        winDoneBtn.addEventListener('click', () => {
            window.parent.postMessage({ type: "game_completed" }, "*");
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGameApp);
} else {
    initGameApp();
}