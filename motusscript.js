document.addEventListener('DOMContentLoaded', () => {
    const wordListUrl = 'https://raw.githubusercontent.com/boubaya/Arabic/blob/main/words.txt';
    const guessInput = document.getElementById('guess-input');
    const guessButton = document.getElementById('guess-button');
    const gameBoard = document.getElementById('game-board');
    const messageDisplay = document.getElementById('message');
    const audioPlayer = document.getElementById('audio-player');
    const playAudioButton = document.getElementById('play-audio');

    let words = [];
    let secretWord = '';
    let secretWordAudio = '';
    let guessCount = 0;
    const maxGuesses = 6;
    let gameEnded = false;

    // Function to fetch words from the file
    async function fetchWords() {
        try {
            const response = await fetch(wordListUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch words: ${response.status}`);
            }
            const text = await response.text();
            words = text.trim().split('\n').map(line => {
                const [word, audio] = line.split('|');
                return { word: word.trim(), audio: audio.trim() };
            });

        } catch (error) {
            console.error("Error fetching word list:", error);
            messageDisplay.textContent = "Error loading words. Please try again later.";
            guessButton.disabled = true;
            playAudioButton.disabled = true;
        }
    }

    // Function to select a random word
    function selectRandomWord() {
        if (words.length > 0) {
            const randomIndex = Math.floor(Math.random() * words.length);
            secretWord = words[randomIndex].word;
            secretWordAudio = words[randomIndex].audio;
            console.log("Secret word:", secretWord); // For debugging
            audioPlayer.src = secretWordAudio;
        } else {
            messageDisplay.textContent = "Word list is empty.";
            guessButton.disabled = true;
            playAudioButton.disabled = true;
        }
    }

    // Function to create the initial game board
    function createGameBoard() {
        gameBoard.innerHTML = ''; // Clear any existing board

        for (let i = 0; i < maxGuesses; i++) {
            const row = document.createElement('div');
            row.classList.add('grid-container');
            for (let j = 0; j < secretWord.length; j++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-item');
                row.appendChild(cell);
            }
            gameBoard.appendChild(row);
        }
    }

    // Function to check the guess
    function checkGuess() {
        if (gameEnded) return;

        const guess = guessInput.value.trim();

        if (guess.length !== secretWord.length) {
            messageDisplay.textContent = `الكلمة يجب أن تكون ${secretWord.length} حروف.`;
            return;
        }
        if (!/^[ء-ي]+$/.test(guess)) {
            messageDisplay.textContent = "الكلمة يجب أن تحتوي على حروف عربية فقط";
            return
        }


        const guessRows = document.querySelectorAll('.grid-container');
        const currentRow = guessRows[guessCount];
        const cells = currentRow.querySelectorAll('.grid-item');

        let allCorrect = true;

        for (let i = 0; i < secretWord.length; i++) {
            if (guess[i] === secretWord[i]) {
                cells[i].textContent = guess[i];
                cells[i].classList.add('correct');
            } else if (secretWord.includes(guess[i])) {
                cells[i].textContent = guess[i];
                cells[i].classList.add('present');
                allCorrect = false;
            } else {
                cells[i].textContent = guess[i];
                cells[i].classList.add('absent');
                allCorrect = false;
            }
        }

        guessCount++;

        if (allCorrect) {
            messageDisplay.textContent = `أحسنت! لقد خمنت الكلمة ${secretWord} في ${guessCount} محاولات.`;
            endGame();
        } else if (guessCount >= maxGuesses) {
            messageDisplay.textContent = `انتهت المحاولات! الكلمة كانت ${secretWord}.`;
            endGame();
        } else {
            messageDisplay.textContent = ''; // Clear message
        }

        guessInput.value = ''; // Clear the input
    }

    function endGame() {
        gameEnded = true;
        guessButton.disabled = true;
        guessInput.disabled = true;
        playAudioButton.disabled = true;
    }


    // Event listeners
    guessButton.addEventListener('click', checkGuess);

    guessInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            checkGuess();
        }
    });

    playAudioButton.addEventListener('click', () => {
        audioPlayer.play().catch(error => {
            console.error("Error playing audio:", error);
            messageDisplay.textContent = "مشكلة في تشغيل الصوت.";
        });
    });

    audioPlayer.addEventListener('error', () => {
        console.error("Audio playback error");
        messageDisplay.textContent = "مشكلة في تشغيل الصوت.";
    });



    // Initialize the game
    async function initializeGame() {
        await fetchWords();
        selectRandomWord();
        createGameBoard();
    }

    initializeGame();
});
