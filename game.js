let currentWordIndex = 0;
let wordsData; // Will store the data loaded from JSON
let selectedLetters = [];

function startGame(data) {
  wordsData = data;
  currentWordIndex = 0;
  displayWord();
  generateLetterButtons();
}

function displayWord() {
  const wordDisplay = document.getElementById('word-display');
  wordDisplay.textContent = wordsData[currentWordIndex].word;
}

function generateLetterButtons() {
  const letterButtonsContainer = document.getElementById('letter-buttons');
  letterButtonsContainer.innerHTML = ''; // Clear existing buttons

  const letters = wordsData[currentWordIndex].letters;

  letters.forEach(letter => {
    const button = document.createElement('button');
    button.classList.add('letter-button');
    button.textContent = letter;
    button.addEventListener('click', () => handleLetterClick(letter));
    letterButtonsContainer.appendChild(button);
  });
}

function handleLetterClick(letter) {
    selectedLetters.push(letter);
    checkAnswer();
}

function checkAnswer() {
    const expectedLetters = wordsData[currentWordIndex].letters;
    const messageDiv = document.getElementById("message");

    if (selectedLetters.length === expectedLetters.length) {
        const isCorrect = selectedLetters.every((letter, index) => letter === expectedLetters[index]);

        if (isCorrect) {
            messageDiv.textContent = "Correct!";
            messageDiv.style.color = "green";
            // Load the next word after a delay
            setTimeout(() => {
              currentWordIndex++;
              selectedLetters = []; //reset the selected letters
                if (currentWordIndex < wordsData.length) {
                    displayWord();
                    generateLetterButtons();
                    messageDiv.textContent = ""; // Clear the message
                } else {
                    messageDiv.textContent = "Congratulations! You completed all the words!";
                    messageDiv.style.color = "blue";
                    document.getElementById('letter-buttons').innerHTML = ""; // Clear the buttons
                    document.getElementById('word-display').textContent = ""; // Clear the word
                }
            }, 1500); // Delay of 1.5 seconds
        } else {
            messageDiv.textContent = "Incorrect. Try again.";
            messageDiv.style.color = "red";
            selectedLetters = []; // Reset the selected letters
            // Potentially add a short delay before clearing the message and re-enabling buttons
            setTimeout(() => {
                messageDiv.textContent = "";
                generateLetterButtons();
            }, 1500);
        }
    } else if (selectedLetters.length > expectedLetters.length) {
        messageDiv.textContent = "Too many letters selected. Try again.";
        messageDiv.style.color = "red";
        selectedLetters = [];
         setTimeout(() => {
                messageDiv.textContent = "";
                generateLetterButtons();
            }, 1500);
    }


}

// Add more game logic here (e.g., checking answers, updating score, etc.)
