document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    // !!! IMPORTANT: Replace this URL with the Raw URL of your arabic_letters.json file on GitHub !!!
    const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO_NAME/main/arabic_letters.json';
    const NUM_OPTIONS = 4; // Number of choices including the correct one

    // --- DOM ELEMENTS ---
    const loadingMessage = document.getElementById('loading-message');
    const loadingErrorSpan = document.getElementById('loading-error'); // Get the error span
    const startScreen = document.getElementById('start-screen');
    const startButton = document.getElementById('start-button');
    const gameArea = document.getElementById('game-area');
    const questionArea = document.getElementById('question-area');
    const letterDisplay = document.getElementById('letter-display');
    const audioButton = document.getElementById('audio-button');
    const optionsContainer = document.getElementById('options-container');
    const feedback = document.getElementById('feedback');
    const scoreDisplay = document.getElementById('score');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const exampleWordArea = document.getElementById('example-word-area');
    const exampleWordSpan = document.getElementById('example-word');
    const exampleTranslationSpan = document.getElementById('example-translation');
    const endScreen = document.getElementById('end-screen');
    const finalScoreDisplay = document.getElementById('final-score');
    const endMessage = document.getElementById('end-message');
    const restartButton = document.getElementById('restart-button');

    // --- GAME STATE ---
    let allLetters = [];
    let currentLetters = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let currentCorrectAnswer = null;
    let currentAudioUrl = null;
    let audioContext = null; // Initialize as null
    let audioBufferCache = {}; // Cache for loaded sounds
    let totalQuestions = 0;

    // --- AUDIO SETUP ---
    function initAudio() {
        if (audioContext) return; // Already initialized
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            if (window.AudioContext) {
                audioContext = new AudioContext();
                // Resume context if it's suspended (required by some browsers initially)
                if (audioContext.state === 'suspended') {
                    audioContext.resume();
                }
                console.log("AudioContext initialized successfully.");
            } else {
                console.warn("Web Audio API is not supported by this browser.");
                disableAudioFeatures();
            }
        } catch (e) {
            console.error("Could not create AudioContext:", e);
            disableAudioFeatures();
        }
    }

     function disableAudioFeatures() {
        audioButton.style.display = 'none'; // Hide button permanently
        currentAudioUrl = null; // Prevent attempts to play/load
    }

    async function loadSound(url) {
        if (!audioContext || !url) return null;
        if (audioBufferCache[url]) return audioBufferCache[url]; // Return cached buffer
        if (audioBufferCache[url] === null) return null; // Return null if known to fail

        console.log(`Attempting to load audio: ${url}`);
        try {
            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status} for ${url}`);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            audioBufferCache[url] = audioBuffer; // Cache success
            console.log(`Successfully loaded and decoded audio: ${url}`);
            return audioBuffer;
        } catch (error) {
            console.error(`Could not load or decode audio file: ${url}`, error);
            audioBufferCache[url] = null; // Cache failure
            return null;
        }
    }

    function playSound(audioBuffer) {
        if (!audioContext || !audioBuffer) {
            console.log("playSound aborted: No context or buffer.");
            return;
        }
        // Ensure context is running
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log("AudioContext resumed.");
                actuallyPlaySound(audioBuffer);
            }).catch(e => console.error("Error resuming AudioContext:", e));
        } else {
            actuallyPlaySound(audioBuffer);
        }
    }

    function actuallyPlaySound(audioBuffer) {
        try {
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start(0);
            console.log("Playing sound.");
        } catch (error) {
            console.error("Error playing sound:", error);
        }
    }

    // --- GAME LOGIC ---

    function shuffleArray(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    async function fetchLetters() {
        console.log("Attempting to fetch letters from:", GITHUB_RAW_URL);
        loadingErrorSpan.style.display = 'none'; // Hide previous errors
        loadingErrorSpan.textContent = '';
        try {
            // Add cache-busting query param
            const url = `${GITHUB_RAW_URL}?t=${new Date().getTime()}`;
            const response = await fetch(url, { mode: 'cors' });

            if (!response.ok) {
                throw new Error(`Network response was not ok. Status: ${response.status} ${response.statusText}. Check the GitHub URL.`);
            }
            allLetters = await response.json();

            if (!Array.isArray(allLetters) || allLetters.length === 0) {
                 throw new Error("Data loaded, but it's not a valid array or is empty. Check the JSON file format.");
            }

            totalQuestions = allLetters.length;
            progressText.textContent = `0 / ${totalQuestions}`; // Update max progress

            loadingMessage.classList.add('hidden');
            startScreen.classList.remove('hidden');
            console.log("Letters loaded successfully:", totalQuestions, "items");

        } catch (error) {
            console.error("Failed to fetch or parse letters:", error);
            // Display user-friendly error
            loadingMessage.textContent = `Error loading game data.`; // Keep main message simple
            loadingErrorSpan.textContent = `Details: ${error.message}. Please check the GitHub URL in script.js and ensure the JSON file is public and correct.`;
            loadingErrorSpan.style.display = 'inline'; // Show the detailed error
        }
    }


    function startGame() {
        // Initialize AudioContext on first user interaction (start)
        initAudio();

        score = 0;
        currentQuestionIndex = 0;
        if (!allLetters || allLetters.length === 0) {
            console.error("Cannot start game, letters not loaded.");
            // Show error feedback if trying to start without data
             feedback.textContent = "Error: Letter data not loaded. Please reload.";
             feedback.className = 'incorrect';
             loadingMessage.classList.remove('hidden'); // Show loading message area again
             loadingMessage.textContent = "Game data failed to load. Please refresh the page.";
            return;
        }
        currentLetters = shuffleArray([...allLetters]);
        totalQuestions = currentLetters.length; // Just in case

        startScreen.classList.add('hidden');
        endScreen.classList.add('hidden');
        questionArea.classList.remove('hidden');
        updateScoreAndProgress(); // Initialize display

        // Preload first audio
         if(currentLetters.length > 0 && currentLetters[0].audio_url && audioContext) {
            loadSound(currentLetters[0].audio_url);
         }

        displayQuestion();
    }

    function displayQuestion() {
        if (currentQuestionIndex >= totalQuestions) {
            endGame();
            return;
        }

        feedback.textContent = '';
        feedback.className = '';
        exampleWordArea.classList.add('hidden');
        optionsContainer.innerHTML = ''; // Clear previous options

        const currentLetterData = currentLetters[currentQuestionIndex];
        letterDisplay.textContent = currentLetterData.letter;
        letterDisplay.lang = "ar";
        currentCorrectAnswer = currentLetterData.name; // Or use transliteration: currentLetterData.transliteration
        const answerKey = 'name'; // Change to 'transliteration' if needed

        currentAudioUrl = currentLetterData.audio_url;

        // Prepare options
        let options = [currentCorrectAnswer];
        let distractors = allLetters
            .map(l => l[answerKey])
            .filter(val => val && val !== currentCorrectAnswer);
        shuffleArray(distractors);

        let distractorIndex = 0;
        while (options.length < NUM_OPTIONS && distractorIndex < distractors.length) {
            if (!options.includes(distractors[distractorIndex])) {
                options.push(distractors[distractorIndex]);
            }
            distractorIndex++;
        }
        // Fill remaining spots if not enough unique distractors
        while (options.length < NUM_OPTIONS && distractors.length > 0) {
             options.push(distractors[options.length % distractors.length]);
        }
         // Final fallback if distractors is empty (shouldn't happen with enough data)
         while (options.length < NUM_OPTIONS) {
              options.push(`Option ${options.length + 1}`);
         }


        options = shuffleArray(options);

        // Display options
        options.forEach(optionText => {
            const button = document.createElement('button');
            button.textContent = optionText;
            button.classList.add('option-button');
            button.addEventListener('click', () => handleAnswer(optionText, button));
            optionsContainer.appendChild(button);
        });

        // Handle Audio Button visibility
        if (currentAudioUrl && audioContext) {
            audioButton.classList.remove('hidden');
            loadSound(currentAudioUrl); // Preload optimistically
        } else {
            audioButton.classList.add('hidden');
        }
    }

    async function handleAnswer(selectedAnswer, button) {
        const buttons = optionsContainer.querySelectorAll('.option-button');
        buttons.forEach(btn => btn.disabled = true);

        const isCorrect = selectedAnswer === currentCorrectAnswer;
        const currentLetterData = currentLetters[currentQuestionIndex]; // Get data for example word

        if (isCorrect) {
            score++;
            feedback.textContent = 'Correct!';
            feedback.className = 'correct';
            button.classList.add('correct-answer');
        } else {
            feedback.textContent = `Incorrect. The answer is ${currentCorrectAnswer}.`;
            feedback.className = 'incorrect';
            button.classList.add('incorrect-answer');
            buttons.forEach(btn => {
                if (btn.textContent === currentCorrectAnswer) {
                    btn.classList.add('correct-answer');
                }
            });
        }

        // Show example word if available
        if (currentLetterData.example_word && currentLetterData.example_translation) {
             exampleWordSpan.textContent = currentLetterData.example_word;
             exampleWordSpan.lang = "ar";
             exampleTranslationSpan.textContent = currentLetterData.example_translation;
             exampleWordArea.classList.remove('hidden');
        }

        // Update score display *before* timeout
         updateScoreAndProgress(true);

        // Wait, then move to next question
        setTimeout(() => {
            currentQuestionIndex++;
            // Update progress *before* displaying next question
             updateScoreAndProgress(false);
            displayQuestion();
        }, isCorrect ? 1500 : 2500);
    }

    function updateScoreAndProgress(answerSubmitted = false) {
        scoreDisplay.textContent = `Score: ${score}`;
         // Display progress based on the *next* question index unless an answer was just submitted
         const displayIndex = answerSubmitted ? currentQuestionIndex + 1 : currentQuestionIndex;
        const progressPercent = totalQuestions > 0 ? (displayIndex / totalQuestions) * 100 : 0;
        progressBar.style.width = `${progressPercent}%`;
        progressText.textContent = `${displayIndex} / ${totalQuestions}`;
    }

     function getEndGameMessage(finalScore, total) {
        const percentage = total > 0 ? (finalScore / total) * 100 : 0;
        if (percentage === 100) return "Excellent! You know them all!";
        if (percentage >= 80) return "Great job! Very impressive!";
        if (percentage >= 60) return "Good work! Keep practicing!";
        if (percentage >= 40) return "Not bad, but more practice will help!";
        return "Keep trying! Practice makes perfect.";
    }

    function endGame() {
        questionArea.classList.add('hidden');
        endScreen.classList.remove('hidden');
        finalScoreDisplay.textContent = `${score} / ${totalQuestions}`;
        endMessage.textContent = getEndGameMessage(score, totalQuestions);
        // Ensure progress bar shows full completion
        progressBar.style.width = `100%`;
        progressText.textContent = `${totalQuestions} / ${totalQuestions}`;
    }

    // --- EVENT LISTENERS ---
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);

    audioButton.addEventListener('click', async () => {
        console.log("Audio button clicked.");
        // Ensure context is active before playing sound
        if (audioContext && audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        if (currentAudioUrl && audioContext) {
            try {
                const buffer = await loadSound(currentAudioUrl); // Get buffer (might be cached)
                if (buffer) {
                    playSound(buffer);
                } else {
                    console.warn("Audio buffer not available for playback.");
                    // Optionally provide visual feedback if sound failed permanently
                    feedback.textContent = "Audio for this letter could not be played.";
                    feedback.className = 'incorrect'; // Use error styling
                }
            } catch (error) {
                console.error("Error playing audio on button click:", error);
            }
        } else {
            console.log("Cannot play audio: No URL or no Audio Context.")
        }
    });

    // --- INITIALIZATION ---
    fetchLetters(); // Fetch data when the page loads

}); // End DOMContentLoaded
