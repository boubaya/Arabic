const questions = [
    {
        question: "ما هو عاصمة مصر؟",
        answers: ["القاهرة", "الاسكندرية", "الأقصر", "أسوان"],
        correct: 0
    },
    {
        question: "ما هو أكبر كوكب في المجموعة الشمسية؟",
        answers: ["الأرض", "المريخ", "المشتري", "زحل"],
        correct: 2
    },
    {
        question: "ما هو لون السماء في يوم صافٍ؟",
        answers: ["أخضر", "أزرق", "أحمر", "أصفر"],
        correct: 1
    }
];

let currentQuestionIndex = 0;
let score = 0;

const startButton = document.getElementById('start-button');
const quizContainer = document.getElementById('quiz-container');
const questionElement = document.getElementById('question');
const answersElement = document.getElementById('answers');
const nextButton = document.getElementById('next-button');
const resultContainer = document.getElementById('result-container');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restart-button');

startButton.addEventListener('click', startGame);
nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion(questions[currentQuestionIndex]);
    } else {
        showResult();
    }
});

restartButton.addEventListener('click', restartGame);

function startGame() {
    currentQuestionIndex = 0;
    score = 0;
    startButton.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    resultContainer.classList.add('hidden');
    showQuestion(questions[currentQuestionIndex]);
}

function showQuestion(question) {
    questionElement.innerText = question.question;
    answersElement.innerHTML = '';
    question.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.innerText = answer;
        button.classList.add('answer-button');
        button.addEventListener('click', () => selectAnswer(index));
        answersElement.appendChild(button);
    });
    nextButton.classList.add('hidden');
}

function selectAnswer(index) {
    const correctIndex = questions[currentQuestionIndex].correct;
    const answerButtons = document.querySelectorAll('.answer-button');

    answerButtons.forEach((button, i) => {
        button.disabled = true; // Disable all buttons after an answer is selected
        if (i === correctIndex) {
            button.style.backgroundColor = 'green'; // Highlight correct answer in green
        } else if (i === index) {
            button.style.backgroundColor = 'red';   // Highlight selected incorrect answer in red
        } else {
            button.style.backgroundColor = 'lightgray'; // Light gray for other unselected answers
        }
    });

    if (index === correctIndex) {
        score++;
    }

    nextButton.classList.remove('hidden');
}

function showResult() {
    quizContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    scoreElement.innerText = `حصلت على ${score} من ${questions.length} أسئلة صحيحة!`;
}

function restartGame() {
    startButton.classList.remove('hidden');
    resultContainer.classList.add('hidden');
    startGame();  // Restart the game properly
}
