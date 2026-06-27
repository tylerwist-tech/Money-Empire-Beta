// 1. Firebase Datenbank laden (Pfad geht einen Ordner zurück ins Hauptverzeichnis!)
import { db } from '../firebase-config.js';
import { doc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 2. Spiel-Variablen
let gameData = {
    balance: 0,
    clickPower: 1,
    incomePerSecond: 0,
    prestigeMultiplier: 1
};

// Deine Upgrades (Du kannst hier beliebig viele hinzufügen)
const upgrades = [
    { id: 'upgrade1', name: 'Mitarbeiter', cost: 10, income: 1, type: 'idle' },
    { id: 'upgrade2', name: 'Besseres Werkzeug', cost: 50, power: 2, type: 'click' },
    { id: 'upgrade3', name: 'Firma', cost: 200, income: 15, type: 'idle' }
];

// 3. HTML Elemente greifen
const balanceDisplay = document.getElementById('balance-display');
const incomeDisplay = document.getElementById('income-display');
const clickPowerDisplay = document.getElementById('click-power-display');
const clickBtn = document.getElementById('click-btn');
const upgradesContainer = document.getElementById('upgrades-container');

// 4. Klick-Funktion
clickBtn.addEventListener('click', () => {
    gameData.balance += (gameData.clickPower * gameData.prestigeMultiplier);
    updateUI();
});

// 5. Automatisch Geld verdienen (jede Sekunde)
setInterval(() => {
    if (gameData.incomePerSecond > 0) {
        gameData.balance += (gameData.incomePerSecond * gameData.prestigeMultiplier);
        updateUI();
    }
}, 1000);

// 6. Shop rendern (Hier war vorher der Absturz!)
function renderShop() {
    upgradesContainer.innerHTML = '';
    
    upgrades.forEach(upgrade => {
        const btn = document.createElement('button');
        btn.className = 'upgrade-btn';
        
        let effectText = upgrade.type === 'idle' ? `+${upgrade.income}$/sec` : `+${upgrade.power}$/Klick`;
        
        btn.innerHTML = `<span>${upgrade.name} (${effectText})</span> <span>Kosten: $${upgrade.cost}</span>`;
        
        btn.onclick = () => buyUpgrade(upgrade);
        upgradesContainer.appendChild(btn);
    });
}

// 7. Upgrade kaufen
function buyUpgrade(upgrade) {
    if (gameData.balance >= upgrade.cost) {
        gameData.balance -= upgrade.cost;
        
        if (upgrade.type === 'idle') {
            gameData.incomePerSecond += upgrade.income;
        } else if (upgrade.type === 'click') {
            gameData.clickPower += upgrade.power;
        }
        
        // Kosten für das nächste Mal erhöhen (z.B. um 50%)
        upgrade.cost = Math.floor(upgrade.cost * 1.5);
        
        updateUI();
        renderShop();
        saveGame();
    } else {
        alert("Nicht genug Geld!");
    }
}

// 8. UI Aktualisieren
function updateUI() {
    balanceDisplay.innerText = `$${Math.floor(gameData.balance)}`;
    incomeDisplay.innerText = `${gameData.incomePerSecond}/sec`;
    clickPowerDisplay.innerText = `${gameData.clickPower}/Klick`;
}

// 9. Speichern & Firebase Sync
async function saveGame() {
    // Lokal speichern (Handy)
    localStorage.setItem('moneyEmpireSave', JSON.stringify(gameData));
    
    // In der Cloud speichern (Firebase)
    try {
        const userRef = doc(db, "users", "test_spieler_1");
        // setDoc speichert die Daten. merge: true sorgt dafür, dass nichts überschrieben wird
        await setDoc(userRef, {
            balance: gameData.balance,
            clickPower: gameData.clickPower,
            incomePerSecond: gameData.incomePerSecond,
            lastSaveTime: Date.now()
        }, { merge: true });
        
        console.log("Erfolgreich in Firebase gespeichert!");
    } catch (error) {
        console.error("Fehler beim Cloud-Save: ", error);
    }
}

// 10. Spiel beim Start laden
function initGame() {
    const savedData = localStorage.getItem('moneyEmpireSave');
    if (savedData) {
        gameData = JSON.parse(savedData);
    }
    
    updateUI();
    renderShop();
    
    // Alle 30 Sekunden automatisch speichern
    setInterval(saveGame, 30000);
}

// Spiel starten
initGame();
