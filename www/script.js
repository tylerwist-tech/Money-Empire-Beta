// Oben in www/script.js
import { db } from '../firebase-config.js'; // Achte auf die zwei Punkte!
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-firestore.js";

// Ganz am Ende der Datei
initGame();

// ... ab hier folgt dein restlicher Code ...

// Jetzt kannst du deine Funktion schreiben
async function geldSammeln() {
    try {
        const userRef = doc(db, "users", "user_id_123");
        await updateDoc(userRef, {
            balance: 500
        });
        console.log("Geld wurde erfolgreich aktualisiert!");
    } catch (e) {
        console.error("Fehler beim Speichern: ", e);
    }
}


let gameData = {
    balance: 0,
    clickPower: 1,
    incomePerSecond: 0,
    upgradesOwned: {},
    lastSaveTime: Date.now(),
    prestigeMultiplier: 1
};

let displayBalance = 0; // Für flüssige Zahlen-Animation

const upgrades = [
    { id: 'click_1', name: 'Kaffee für den Chef', description: '+1 $/Klick', baseCost: 25, type: 'click', value: 1 },
    { id: 'auto_1', name: 'Zeitungsjunge', description: '+2 $/Sekunde', baseCost: 100, type: 'auto', value: 2 },
    { id: 'click_2', name: 'Bessere Tastatur', description: '+5 $/Klick', baseCost: 250, type: 'click', value: 5 },
    { id: 'auto_2', name: 'Limonadenstand', description: '+15 $/Sekunde', baseCost: 1200, type: 'auto', value: 15 },
    { id: 'click_3', name: 'Ergonomische Maus', description: '+25 $/Klick', baseCost: 5000, type: 'click', value: 25 },
    { id: 'auto_3', name: 'Aktien-Portfolio', description: '+100 $/Sekunde', baseCost: 12500, type: 'auto', value: 100 },
    { id: 'auto_4', name: 'Bürogebäude', description: '+600 $/Sekunde', baseCost: 55000, type: 'auto', value: 600 }
];

const balanceEl = document.getElementById('balance-display');
const statsEl = document.getElementById('stats-display');
const clickerBtn = document.getElementById('clicker-btn');
const shopContainer = document.getElementById('upgrades-container');
const prestigeBtn = document.getElementById('prestige-btn');
const prestigeDisplay = document.getElementById('prestige-display');
const multiplierSpan = document.getElementById('multiplier');
const notificationsContainer = document.getElementById('notifications');

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'click') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'buy') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(500, audioCtx.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'special') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.4);
    }
}

// --- OPTIMIERTE FLIEGENDE ZAHLEN (CSS Variablen für Fontäne) ---
function createFloatingText(e, amount) {
    const floater = document.createElement('div');
    floater.className = 'floating-text';
    floater.innerText = `+$${amount}`;
    
    // Zufälliger X-Wert zwischen -60px und +60px
    const randomX = (Math.random() - 0.5) * 120;
    floater.style.setProperty('--x', `${randomX}px`);
    
    floater.style.left = e.clientX + 'px';
    floater.style.top = e.clientY + 'px';
    
    document.body.appendChild(floater);
    
    // Aufräumen passend zur CSS Animation (1 Sekunde)
    setTimeout(() => floater.remove(), 1000);
}

function showNotification(text) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = text;
    notificationsContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

async function syncMitFirebase() {
    try {
        const userRef = doc(db, "users", "user_id_123");
        await updateDoc(userRef, {
            balance: gameData.balance,
            lastSaveTime: Date.now()
        });
        console.log("Firebase sync erfolgreich!");
    } catch (e) {
        console.error("Fehler beim Sync: ", e);
    }
}

function initGame() {
    const savedData = localStorage.getItem('moneyEmpireSave');
    if (savedData) {
        gameData = JSON.parse(savedData);
        if (!gameData.lastSaveTime) gameData.lastSaveTime = Date.now();
        if (!gameData.prestigeMultiplier) gameData.prestigeMultiplier = 1;
        
        upgrades.forEach(u => {
            if (gameData.upgradesOwned[u.id] === undefined) {
                gameData.upgradesOwned[u.id] = 0;
            }
        });

        const now = Date.now();
        const secondsAway = Math.floor((now - gameData.lastSaveTime) / 1000);
        if (secondsAway > 60 && gameData.incomePerSecond > 0) {
            const offlineEarnings = secondsAway * gameData.incomePerSecond * gameData.prestigeMultiplier;
            gameData.balance += offlineEarnings;
            showNotification(`🌙 Du warst offline!<br>Verdient: $${offlineEarnings.toLocaleString('de-DE')}`);
        }
    } else {
        upgrades.forEach(u => gameData.upgradesOwned[u.id] = 0);
    }
    
    displayBalance = gameData.balance;
    
    if(gameData.prestigeMultiplier > 1) {
        prestigeDisplay.style.display = 'block';
        multiplierSpan.innerText = gameData.prestigeMultiplier.toFixed(1);
    }

    renderShop();
    updateUI();
    
    setInterval(passiveIncomeLoop, 1000);
    setInterval(saveGame, 5000);
    requestAnimationFrame(animateVisualBalance);
    scheduleGoldenCoin();
}

clickerBtn.addEventListener('click', (e) => {
    const earnings = gameData.clickPower * gameData.prestigeMultiplier;
    gameData.balance += earnings;
    playSound('click');
    
    // Position des Klicks ermitteln
    let clientX = e.clientX;
    let clientY = e.clientY;
    
    if (clientX === undefined || clientX === 0) {
        const rect = clickerBtn.getBoundingClientRect();
        clientX = rect.left + rect.width / 2;
        clientY = rect.top + rect.height / 2;
    }
    
    createFloatingText({clientX, clientY}, earnings);
    updateShopColors();
});

function getCost(upgradeId) {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    const owned = gameData.upgradesOwned[upgradeId];
    return Math.floor(upgrade.baseCost * Math.pow(1.15, owned));
}

function buyUpgrade(upgradeId) {
    const cost = getCost(upgradeId);
    if (gameData.balance >= cost) {
        gameData.balance -= cost;
        gameData.upgradesOwned[upgradeId]++;
        
        const upgrade = upgrades.find(u => u.id === upgradeId);
        if (upgrade.type === 'click') {
            gameData.clickPower += upgrade.value;
        } else if (upgrade.type === 'auto') {
            gameData.incomePerSecond += upgrade.value;
        }
        
        playSound('buy');
        renderShop();
        updateUI();
    }
}

function passiveIncomeLoop() {
    if (gameData.incomePerSecond > 0) {
        gameData.balance += gameData.incomePerSecond * gameData.prestigeMultiplier;
        updateShopColors();
    }
}

// --- OPTIMIERTER SMOOTH COUNTER ---
function animateVisualBalance() {
    // Reagiert schneller (0.25 statt 0.15) für weniger Stottern
    if (Math.abs(displayBalance - gameData.balance) > 0.5) {
        displayBalance += (gameData.balance - displayBalance) * 0.25;
    } else {
        displayBalance = gameData.balance;
    }
    balanceEl.innerText = '$' + Math.floor(displayBalance).toLocaleString('de-DE');
    
    if (gameData.balance >= 100000) {
        prestigeBtn.classList.remove('hidden');
    } else {
        prestigeBtn.classList.add('hidden');
    }
    
    requestAnimationFrame(animateVisualBalance);
}

function updateUI() {
    const activeIncome = gameData.incomePerSecond * gameData.prestigeMultiplier;
    const activeClick = gameData.clickPower * gameData.prestigeMultiplier;
    statsEl.innerText = `${activeIncome.toLocaleString('de-DE')}/sec | ${activeClick.toLocaleString('de-DE')}/Klick`;
}

function renderShop() {
    shopContainer.innerHTML = ''; 
    
    upgrades.forEach(upgrade => {
        const cost = getCost(upgrade.id);
        const owned = gameData.upgradesOwned[upgrade.id];
        
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.id = `card-${upgrade.id}`;
        
        if (gameData.balance < cost) card.classList.add('disabled');
        
        card.innerHTML = `
            <div class="upgrade-info">
                <h3>${upgrade.name} <span style="font-size: 0.8em; color: var(--text-muted)">(${owned})</span></h3>
                <p>${upgrade.description}</p>
            </div>
            <div class="upgrade-cost">
                $${cost.toLocaleString('de-DE')}
            </div>
        `;
        
        card.addEventListener('click', () => buyUpgrade(upgrade.id));
        shopContainer.appendChild(card);
    });
}

function updateShopColors() {
    upgrades.forEach(upgrade => {
        const cost = getCost(upgrade.id);
        const card = document.getElementById(`card-${upgrade.id}`);
        if (card) {
            if (gameData.balance >= cost) {
                card.classList.remove('disabled');
            } else {
                card.classList.add('disabled');
            }
        }
    });
}


prestigeBtn.addEventListener('click', () => {
    if(confirm('Möchtest du dein Imperium wirklich verkaufen? Du fängst bei $0 an, erhältst aber dauerhaft +0.5x Multiplikator auf alles!')) {
        playSound('special');
        gameData.balance = 0;
        displayBalance = 0;
        gameData.clickPower = 1;
        gameData.incomePerSecond = 0;
        gameData.prestigeMultiplier += 0.5;
        upgrades.forEach(u => gameData.upgradesOwned[u.id] = 0);
        
        prestigeBtn.classList.add('hidden');
        prestigeDisplay.style.display = 'block';
        multiplierSpan.innerText = gameData.prestigeMultiplier.toFixed(1);
        
        renderShop();
        updateUI();
        saveGame();
        showNotification('🚀 Imperium neugegründet! Multiplikator erhöht.');
    }
});

function scheduleGoldenCoin() {
    const randomTime = Math.random() * (90000 - 30000) + 30000;
    setTimeout(spawnGoldenCoin, randomTime);
}

function spawnGoldenCoin() {
    const coin = document.createElement('div');
    coin.className = 'golden-coin';
    coin.innerText = '$';
    
    const mainArea = document.querySelector('main').getBoundingClientRect();
    const maxX = mainArea.width - 70;
    const maxY = mainArea.height - 70;
    
    coin.style.left = Math.max(10, Math.random() * maxX) + 'px';
    coin.style.top = Math.max(10, Math.random() * maxY) + 'px';
    
    document.querySelector('main').appendChild(coin);
    
    const despawnTimer = setTimeout(() => {
        if(document.body.contains(coin)) coin.remove();
        scheduleGoldenCoin();
    }, 5000);
    
    coin.addEventListener('click', (e) => {
        clearTimeout(despawnTimer);
        playSound('special');
        
        let bonus = (gameData.incomePerSecond * gameData.prestigeMultiplier) * 60;
        if(bonus < 100) bonus = 100;
        
        gameData.balance += bonus;
        createFloatingText(e, bonus);
        showNotification(`🌟 Glückstreffer! $${bonus.toLocaleString('de-DE')} gefunden!`);
        
        coin.remove();
        scheduleGoldenCoin();
    });
}

initGame();

function saveGame() {
    gameData.lastSaveTime = Date.now();
    localStorage.setItem('moneyEmpireSave', JSON.stringify(gameData));
    
    // HIER rufst du den Firebase-Sync auf:
    syncMitFirebase()

}
