const wordsUrl = 'https://raw.githubusercontent.com/boubaya/Arabic/main/words.txt';
let words = [];
let currentWord = '';
let attempts = 0;
const maxAttempts = 6;

document.addEventListener('DOMContentLoaded', () => {
    fetch(wordsUrl)
        .then(response => response.text())
        .then(data => {
            words = data.split('\n').map(line => line.split('|')[0]);
            startGame();
        });

    document.getElementById('keyboard').innerHTML = createKeyboard();
    document.getElementById('keyboard').addEventListener('click', handleKeyClick);
    document.getElementById('restart').addEventListener('click', restartGame);
});

function createKeyboard() {
    const letters = 'ا ب ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي';
    return letters.split(' ').map(letter => `<div class="key">${letter}</div>`).join('');
}

function startGame() {
    attempts = 0;
    currentWord = words[Math.floor(Math.random() * words.length)];
    document.getElementById('game-board').innerHTML = '';
    for (let i = 0; i < maxAttempts; i++) {
        for (let j = 0; j < 5; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            document.getElementById('game-board').appendChild(cell);
        }
    }
    document.getElementById('message').innerText = '';
}

function handleKeyClick(event) {
    if (event.target.classList.contains('key')) {
        const letter = event.target.innerText;
        checkGuess(letter);
    }
}

function checkGuess(letter) {
    if (attempts < maxAttempts) {
        const guess = currentWord.split('').slice(0, attempts + 1).join('') + letter;
        if (guess.length === 5) {
            evaluateGuess(guess);
            attempts++;
        }
    }
}

function evaluateGuess(
