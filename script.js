const suits = ['kreuz', 'pik', 'herz', 'karo'];
const values = ['7', '8', '9', '10', 'bube', 'dame', 'koenig', 'ass'];
let deck = [];
let players = [[], [], [], []];
let playedCards = [];
let schraeme = [7, 7, 7, 7];
let currentPlayer = 0;
let roundStarter = 0;
let roundSuit = null;
let history = [];
let klopfLevel = 1;
let klopfMitgehen = [true, true, true, true];
let hammerActive = false;

function createDeck() {
  deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
}

function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function dealCards() {
  players = [[], [], [], []];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      players[i].push(deck.pop());
    }
  }
}

function getCardValue(card) {
  const order = {
    'bube': 2,
    'dame': 3,
    'koenig': 4,
    'ass': 5,
    '7': 6,
    '8': 7,
    '9': 8,
    '10': 9
  };
  return order[card.value];
}

function renderGame() {
  const gameDiv = document.getElementById('game');
  gameDiv.innerHTML = '';
  
  players.forEach((hand, index) => {
    const handDiv = document.createElement('div');
    handDiv.className = 'player-hand';
    const header = document.createElement('h3');
    header.textContent = `Spieler ${index + 1} - ${schraeme[index]} Schräme${currentPlayer === index ? ' (am Zug)' : ''}`;
    handDiv.appendChild(header);

    hand.forEach((card, i) => {
      const cardImg = document.createElement('img');
      cardImg.src = `karten/${card.suit}_${card.value}.png`;
      cardImg.className = 'card';
      if (currentPlayer === index) {
        cardImg.onclick = () => playCard(index, i);
      }
      handDiv.appendChild(cardImg);
    });

    if (currentPlayer === index) {
      const klopfButton = document.createElement('button');
      klopfButton.textContent = 'Klopfen';
      klopfButton.onclick = () => handleKlopfen();
      handDiv.appendChild(klopfButton);
    }

    gameDiv.appendChild(handDiv);
  });

  renderPlayedCards();
  renderHistory();
}

function renderPlayedCards() {
  const playedDiv = document.getElementById('played');
  playedDiv.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const stack = document.createElement('div');
    stack.className = 'played-stack';
    stack.innerHTML = `<strong>Spieler ${i + 1}</strong><br>`;
    const card = playedCards.find(c => c.player === i);
    if (card) {
      const img = document.createElement('img');
      img.src = `karten/${card.card.suit}_${card.card.value}.png`;
      img.className = 'card';
      stack.appendChild(img);
    }
    playedDiv.appendChild(stack);
  }
}

function renderHistory() {
  const historyDiv = document.getElementById('history');
  historyDiv.innerHTML = '<h3>Verlauf</h3>' + history.map(h => `<div>${h}</div>`).join('');
}

function playCard(playerIndex, cardIndex) {
  if (playerIndex !== currentPlayer) return;
  const card = players[playerIndex][cardIndex];

  if (playedCards.length === 0) roundSuit = card.suit;

  const hand = players[playerIndex];
  const hasSuit = hand.some(c => c.suit === roundSuit);
  if (hasSuit && card.suit !== roundSuit) {
    showMessage('Du musst die zuerst gespielte Farbe bedienen!');
    return;
  }

  playedCards.push({ player: playerIndex, card });
  players[playerIndex].splice(cardIndex, 1);

  if (playedCards.length === 4) {
    setTimeout(() => {
      const winner = evaluateWinner();
      currentPlayer = winner;
      roundStarter = winner;
      playedCards = [];
      roundSuit = null;

      for (let i = 0; i < 4; i++) {
        if (i !== winner && klopfMitgehen[i]) {
          schraeme[i] -= klopfLevel;
          animateSchraemLoss(i);
        }
      }

      const loser = schraeme.findIndex(s => s <= 0);
      if (loser !== -1) {
        showEndScreen(`Spieler ${loser + 1} hat verloren!`);
        return;
      }

      klopfLevel = 1;
      klopfMitgehen = [true, true, true, true];
      hammerActive = false;
      for (let i = 0; i < 4; i++) {
        if (schraeme[i] === 1) {
          hammerActive = true;
          klopfLevel = 2;
          showMessage(`Spieler ${i + 1} ist Hammer! Diese Runde zählt doppelt.`);
        }
      }

      if (deck.length >= 16) {
        dealCards();
        renderGame();
      } else {
        showMessage('Keine Karten mehr zum Austeilen.');
      }
    }, 1000);
  } else {
    currentPlayer = (currentPlayer + 1) % 4;
    renderGame();
  }
}

function evaluateWinner() {
  const valid = playedCards.filter(c => c.card.suit === roundSuit);
  valid.sort((a, b) => getCardValue(b.card) - getCardValue(a.card));
  const winner = valid[0].player;
  history.push(`Runde gewonnen: Spieler ${winner + 1}`);
  return winner;
}

function animateSchraemLoss(playerIndex) {
  const msg = document.getElementById('message');
  msg.textContent = `Spieler ${playerIndex + 1} verliert ${klopfLevel} Schräme!`;
  msg.style.color = 'red';
  setTimeout(() => {
    msg.textContent = '';
    msg.style.color = 'darkred';
  }, 2000);
}

function showMessage(msg) {
  const div = document.getElementById('message');
  div.innerText = msg;
  setTimeout(() => (div.innerText = ''), 3000);
}

function showScoreboard() {
  alert(schraeme.map((s, i) => `Spieler ${i + 1}: ${s} Schräme`).join('\n'));
}

function restartGame() {
  createDeck();
  shuffleDeck();
  dealCards();
  currentPlayer = 0;
  roundStarter = 0;
  roundSuit = null;
  playedCards = [];
  schraeme = [7, 7, 7, 7];
  history = [];
  klopfLevel = 1;
  klopfMitgehen = [true, true, true, true];
  hammerActive = false;
  renderGame();
  showMessage("Neues Spiel gestartet!");
}

function showEndScreen(message) {
  setTimeout(() => {
    if (confirm(`${message}\nNeues Spiel starten?`)) {
      restartGame();
    }
  }, 500);
}

function handleKlopfen() {
  if (klopfLevel >= 3) return; // Max 2x klopfen
  klopfLevel++;
  history.push(`Spieler ${currentPlayer + 1} klopft! Es geht jetzt um ${klopfLevel} Schräme.`);
  for (let i = 0; i < 4; i++) {
    if (i !== currentPlayer) {
      const mit = confirm(`Spieler ${currentPlayer + 1} hat geklopft. Spieler ${i + 1}, willst du mitgehen?`);
      klopfMitgehen[i] = mit;
    }
  }
  renderGame();
}

restartGame();
