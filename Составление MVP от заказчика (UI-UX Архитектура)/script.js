(function() {
    const rawCardsData = [
        { id: 1, icon: '🟩', title: 'Зеленая кнопка', desc: 'Главный элемент интерфейса для вызова сотрудника.', isCorrect: true },
        { id: 2, icon: '🚨', title: 'Кнопка SOS', desc: 'Интеграция с экстренными службами МЧС.', isCorrect: false },
        { id: 3, icon: '📅', title: 'Статусы смены', desc: 'Отображение графика: кто на смене, кто отдыхает.', isCorrect: true },
        { id: 4, icon: '🎲', title: 'Чат-рулетка', desc: 'Случайный видеочат с любым свободным курьером.', isCorrect: false },
        { id: 5, icon: '📸', title: 'Профили', desc: 'Аватарки, имена и краткая био сотрудников.', isCorrect: true },
        { id: 6, icon: '🕶️', title: 'AR Модели', desc: '3D-голограммы сотрудников в дополненной реальности.', isCorrect: false },
        { id: 7, icon: '🛠️', title: 'Навыки', desc: 'Карточка с компетенциями и рейтингом работника.', isCorrect: true },
        { id: 8, icon: '🪙', title: 'Крипто-чаевые', desc: 'Модуль перевода чаевых через блокчейн.', isCorrect: false },
        { id: 9, icon: '🗺️', title: 'Геопозиция', desc: 'Лайв-трекинг местоположения на карте.', isCorrect: true },
        { id: 10, icon: '🎮', title: 'Мини-игры', desc: 'Встроенная аркада для скрашивания ожидания.', isCorrect: false },
        { id: 11, icon: '📜', title: 'История', desc: 'Логирование прошлых заказов для быстрого повтора.', isCorrect: true },
        { id: 12, icon: '🎵', title: 'Подкасты', desc: 'Встроенный аудиоплеер с бизнес-подкастами.', isCorrect: false },
        { id: 13, icon: '🔔', title: 'Пуши', desc: 'Уведомления о прибытии и смене статуса.', isCorrect: true },
        { id: 14, icon: '✂️', title: 'Кнопка "Уволить"', desc: 'Функция увольнения сотрудника в один клик.', isCorrect: false },
        { id: 15, icon: '⭐', title: 'Рейтинг', desc: 'Система оценки работы после выполнения заказа.', isCorrect: true }
    ];

    let shuffledCards = [];
    let state = { currentIndex: 0, selectedFeatures: [], totalCards: 0 };
    let isAnimating = false;
    let pointerHandlers = null;
    let gameCompleted = false;

    let cardStack, cardsLeftDisplay, inventoryList, welcomeScreen, winScreen, loseScreen, startBtn, winDoneBtn, loseDoneBtn;

    function removeAllCards() {
        if (cardStack) {
            while (cardStack.firstChild) {
                cardStack.removeChild(cardStack.firstChild);
            }
        }
    }

    function unbindSwipeEvents() {
        if (pointerHandlers && cardStack) {
            cardStack.removeEventListener('pointerdown', pointerHandlers.pointerDown);
            document.removeEventListener('pointermove', pointerHandlers.pointerMove);
            document.removeEventListener('pointerup', pointerHandlers.pointerUp);
            pointerHandlers = null;
        }
    }

    function initGame() {
        gameCompleted = false;
        isAnimating = false;
        
        removeAllCards();
        shuffledCards = [...rawCardsData].sort(() => Math.random() - 0.5);
        state.currentIndex = 0;
        state.selectedFeatures = [];
        state.totalCards = shuffledCards.length;
        
        updateInventoryDisplay();
        if (cardsLeftDisplay) cardsLeftDisplay.innerText = state.totalCards;

        [...shuffledCards].reverse().forEach((card, reverseIndex) => {
            const index = shuffledCards.length - 1 - reverseIndex;
            const cardEl = document.createElement('div');
            cardEl.className = 'swipe-card';
            
            const scale = 1 - index * 0.05;
            const translateY = index * 10;
            
            cardEl.style.transform = `scale(${scale}) translateY(${translateY}px)`;
            cardEl.style.zIndex = shuffledCards.length - index;

            cardEl.innerHTML = `
                <div class="stamp accept">БЕРЕМ</div>
                <div class="stamp reject">В МУСОР</div>
                <div class="card-icon">${card.icon}</div>
                <div class="card-title">${card.title}</div>
                <div class="card-desc">${card.desc}</div>
            `;
            cardStack.appendChild(cardEl);
        });

        unbindSwipeEvents();
        bindSwipeEvents();
    }

    function bindSwipeEvents() {
        let isDragging = false;
        let startX = 0;
        let currentX = 0;
        let topCard = null;
        let startTime = 0;

        const onPointerDown = (e) => {
            if (gameCompleted || isAnimating) return;
            const cards = document.querySelectorAll('.swipe-card');
            if (!cards.length) return;
            
            topCard = cards[cards.length - 1]; 
            isDragging = true;
            startX = e.clientX ?? (e.touches?.[0]?.clientX ?? 0);
            currentX = 0;
            startTime = Date.now();
            
            topCard.style.transition = 'none';
            topCard.classList.remove('glow-accept', 'glow-reject');
        };

        const onPointerMove = (e) => {
            if (!isDragging || !topCard || gameCompleted) return;
            const clientX = e.clientX ?? (e.touches?.[0]?.clientX ?? 0);
            currentX = clientX - startX;
            
            const rotate = currentX * 0.05;
            topCard.style.transform = `translateX(${currentX}px) rotate(${rotate}deg)`;

            const acceptStamp = topCard.querySelector('.stamp.accept');
            const rejectStamp = topCard.querySelector('.stamp.reject');
            
            if (currentX > 50) {
                topCard.classList.add('glow-accept');
                topCard.classList.remove('glow-reject');
                if(acceptStamp) acceptStamp.style.opacity = currentX / 150;
                if(rejectStamp) rejectStamp.style.opacity = 0;
            } else if (currentX < -50) {
                topCard.classList.add('glow-reject');
                topCard.classList.remove('glow-accept');
                if(rejectStamp) rejectStamp.style.opacity = Math.abs(currentX) / 150;
                if(acceptStamp) acceptStamp.style.opacity = 0;
            } else {
                topCard.classList.remove('glow-accept', 'glow-reject');
                if(acceptStamp) acceptStamp.style.opacity = 0;
                if(rejectStamp) rejectStamp.style.opacity = 0;
            }
        };

        const onPointerUp = () => {
            if (!isDragging || !topCard || gameCompleted) return;
            isDragging = false;
            
            const velocity = Math.abs(currentX) / (Date.now() - startTime + 1);
            const threshold = 100;
            const isFastSwipe = velocity > 0.8 && Math.abs(currentX) > 50;

            if (currentX > threshold || (isFastSwipe && currentX > 0)) {
                processSwipe(topCard, true, currentX || 1);
            } else if (currentX < -threshold || (isFastSwipe && currentX < 0)) {
                processSwipe(topCard, false, currentX || -1);
            } else {
                topCard.style.transition = 'transform 0.3s ease-out';
                topCard.classList.remove('glow-accept', 'glow-reject');
                
                const allCards = document.querySelectorAll('.swipe-card');
                const cardIndex = Array.from(allCards).indexOf(topCard);
                const currentCardRealIndex = state.currentIndex + (allCards.length - 1 - cardIndex);
                const scale = 1 - (currentCardRealIndex - state.currentIndex) * 0.05;
                const translateY = (currentCardRealIndex - state.currentIndex) * 10;
                
                topCard.style.transform = `scale(${scale}) translateY(${translateY}px)`;
                
                const acceptStamp = topCard.querySelector('.stamp.accept');
                const rejectStamp = topCard.querySelector('.stamp.reject');
                if (acceptStamp) acceptStamp.style.opacity = 0;
                if (rejectStamp) rejectStamp.style.opacity = 0;
            }
            topCard = null;
        };

        pointerHandlers = { pointerDown: onPointerDown, pointerMove: onPointerMove, pointerUp: onPointerUp };
        
        cardStack.addEventListener('pointerdown', pointerHandlers.pointerDown);
        document.addEventListener('pointermove', pointerHandlers.pointerMove);
        document.addEventListener('pointerup', pointerHandlers.pointerUp);
    }

    function processSwipe(cardEl, accepted, directionX) {
        if (isAnimating || gameCompleted) return;
        isAnimating = true;
        
        const direction = directionX > 0 ? 1 : -1;
        const throwX = direction * window.innerWidth;
        const throwRotate = direction * 30;

        cardEl.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out';
        cardEl.style.transform = `translateX(${throwX}px) translateY(${20}px) rotate(${throwRotate}deg)`;
        cardEl.style.opacity = '0';

        if (state.currentIndex < shuffledCards.length) {
            const currentCardData = shuffledCards[state.currentIndex];
            if (accepted && currentCardData) {
                state.selectedFeatures.push(currentCardData);
                updateInventoryDisplay();
            }
        }

        state.currentIndex++;
        if (cardsLeftDisplay) cardsLeftDisplay.innerText = state.totalCards - state.currentIndex;

        const remaining = document.querySelectorAll('.swipe-card');
        Array.from(remaining).forEach((el, idx) => {
            if (el === cardEl) return;
            const stackPos = remaining.length - 2 - idx;
            el.style.transition = 'transform 0.3s ease-out';
            el.style.transform = `scale(${1 - stackPos * 0.05}) translateY(${stackPos * 10}px)`;
        });

        setTimeout(() => {
            if (cardEl && cardEl.parentNode) {
                cardEl.parentNode.removeChild(cardEl);
            }
            isAnimating = false;
            
            if (state.currentIndex >= state.totalCards && !gameCompleted) {
                evaluateResults();
            }
        }, 400);
    }

    function updateInventoryDisplay() {
        if (!inventoryList) return;
        
        if (state.selectedFeatures.length === 0) {
            inventoryList.innerHTML = `
                <div class="empty-state">
                    <span>Проект пока пуст</span>
                    <small>Свайпайте вправо, чтобы добавить функции</small>
                </div>`;
            return;
        }
        
        inventoryList.innerHTML = '';
        state.selectedFeatures.forEach((feature) => {
            const div = document.createElement('div');
            div.className = 'inventory-item';
            div.innerHTML = `
                <div class="inv-icon">${feature.icon}</div>
                <div class="inv-info">
                    <span class="inv-title">${feature.title}</span>
                    <span class="inv-status">Интегрировано</span>
                </div>
            `;
            inventoryList.appendChild(div);
        });

        setTimeout(() => {
            inventoryList.scrollTo({ top: inventoryList.scrollHeight, behavior: 'smooth' });
        }, 50);
    }

    function evaluateResults() {
        if (gameCompleted) return;
        
        const correctRequired = rawCardsData.filter(c => c.isCorrect);
        const incorrectRequired = rawCardsData.filter(c => !c.isCorrect);

        const missedFeatures = correctRequired.filter(c => !state.selectedFeatures.some(s => s.id === c.id));
        const badFeaturesAdded = incorrectRequired.filter(c => state.selectedFeatures.some(s => s.id === c.id));

        if (missedFeatures.length === 0 && badFeaturesAdded.length === 0) {
            gameCompleted = true;
            if (winScreen) winScreen.classList.add('active');
        } else {
            let html = '';
            if (badFeaturesAdded.length > 0) {
                html += `<strong>❌ Лишние траты:</strong><br>Вы добавили лишнее: ` + 
                        badFeaturesAdded.map(f => `${f.title}`).join(', ') + `.<br><br>`;
            }
            if (missedFeatures.length > 0) {
                html += `<strong>⚠️ Упущенный функционал:</strong><br>Вы забыли добавить: ` + 
                        missedFeatures.map(f => `${f.title}`).join(', ') + `.`;
            }
            const loseReason = document.getElementById('lose-reason');
            if (loseReason) loseReason.innerHTML = html;
            if (loseScreen) loseScreen.classList.add('active');
        }
    }

    function fullReset() {
        [welcomeScreen, winScreen, loseScreen].forEach(el => el && el.classList.remove('active'));
        gameCompleted = false;
        isAnimating = false;
        removeAllCards();
        unbindSwipeEvents();
        state.currentIndex = 0;
        state.selectedFeatures = [];
        state.totalCards = 0;
        shuffledCards = [];
        updateInventoryDisplay();
        initGame();
    }

    document.addEventListener('DOMContentLoaded', () => {
        cardStack = document.getElementById('card-stack');
        cardsLeftDisplay = document.getElementById('cards-left');
        inventoryList = document.getElementById('inventory-list');
        welcomeScreen = document.getElementById('welcome-screen');
        winScreen = document.getElementById('win-screen');
        loseScreen = document.getElementById('lose-screen');
        
        startBtn = document.getElementById('start-game-btn');
        winDoneBtn = document.getElementById('win-done-btn');
        loseDoneBtn = document.getElementById('lose-done-btn');

        if(startBtn) {
            startBtn.addEventListener('click', () => {
                if(welcomeScreen) welcomeScreen.classList.remove('active');
                initGame();
            });
        }

        if(loseDoneBtn) {
            loseDoneBtn.addEventListener('click', () => {
                fullReset();
            });
        }

        // --- ТОЛЬКО postMessage, как просили ---
        if(winDoneBtn) {
            winDoneBtn.addEventListener('click', () => {
                window.parent.postMessage({ type: "game_completed" }, "*");
            });
        }

        if(welcomeScreen) welcomeScreen.classList.add('active');
    });

})();