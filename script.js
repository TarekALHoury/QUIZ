// Global variables initialization
let questions = [];
let pictureQuestions = [];
let currentQuestionIndex = 0;
let selectedAnswers = {}; 
let selectedQuestions = []; 
let selectedPictureQuestions = []; 

let timerInterval;
let timeLeft = 900; // Set timer to 10 seconds for testing
let selectedLanguage = 'en'; // Default language

// Add animations to buttons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('mouseover', () => {
        button.style.transform = 'scale(1.05)';
    });
    button.addEventListener('mouseout', () => {
        button.style.transform = 'scale(1)';
    });
});

// script.js

// Get the language select element and message div
const languageSelect = document.getElementById('language');
const message = document.getElementById('sorry');

// Function to update direction and show message based on selected language
function changeDirection() {
    const selectedLanguage = languageSelect.value;

    if (selectedLanguage === 'ar') {
        // Apply RTL for Arabic
        document.documentElement.setAttribute('lang', 'ar');
        document.body.style.direction = 'rtl';

        // Show the message
        message.style.display = 'block';
    } else {
        // Apply LTR for other languages (like English)
        document.documentElement.setAttribute('lang', 'en');
        document.body.style.direction = 'ltr';

        // Hide the message
        message.style.display = 'none';
    }
}

// Add an event listener to detect language change
languageSelect.addEventListener('change', changeDirection);

// Run the function initially to set the default direction (LTR or RTL) and message visibility
changeDirection();


// Fetch normal questions based on selected language
async function loadQuestions(language) {
    try {
        console.log(`Loading normal questions for language: ${language}`);
        const response = await fetch(`questions_${language}.json`);
        console.log(`Fetch response status for normal questions: ${response.status}`);
        if (!response.ok) {
            throw new Error(`Failed to load questions_${language}.json - Status: ${response.status}`);
        }
        questions = await response.json();
        console.log("Normal questions loaded:", questions);
    } catch (error) {
        console.error("Error loading normal questions:", error);
    }
}

// Fetch picture questions based on selected language
async function loadPictureQuestions(language) {
    try {
        let pictureQuestionsFile = `pictureQuestions_${language}.json`; // Default to plural form
        
        // Handle Arabic language where the file uses singular form
        if (language === 'en') {
            pictureQuestionsFile = `pictureQuestions_${language}.json`; // Use singular for Arabic
        }
        const response = await fetch(pictureQuestionsFile);
        console.log(`Fetch response status for picture questions: ${response.status}`);
        if (!response.ok) {
            throw new Error(`Failed to load ${pictureQuestionsFile} - Status: ${response.status}`);
        }
        pictureQuestions = await response.json();
        console.log("Picture questions loaded:", pictureQuestions);
        
        // Check if pictureQuestions is an array
        if (!Array.isArray(pictureQuestions)) {
            throw new Error("pictureQuestions is not an array");
        }
    } catch (error) {
        console.error("Error loading picture questions:", error);
    }
}

// Change language based on user selection
document.getElementById('language').addEventListener('change', function () {

    selectedLanguage = this.value;
    console.log(`Language changed to: ${selectedLanguage}`);

    // Reload questions and picture questions for the selected language
    loadQuestions(selectedLanguage);
    loadPictureQuestions(selectedLanguage);

    // Reset timer to ensure it's fresh after language change
    timeLeft = 900;
    
    document.getElementById('time').textContent = "15:00";
    clearInterval(timerInterval);
    document.getElementById('timer').classList.add('hidden');

    // Make sure the start button is visible after language change
    document.getElementById('startQuiz').classList.remove('hidden');
});

// --- startQuiz (fixed: sets initial button state) ---
async function startQuiz() {
  console.log("Start Quiz triggered...");

  const questionCount = parseInt(document.getElementById('questionCount').value);
  const pictureQuestionCount = parseInt(document.getElementById('pictureQuestionCount').value);

  if (questionCount >= 1 && questionCount <= 100 && pictureQuestionCount >= 1 && pictureQuestionCount <= 100) {
    document.getElementById('startQuiz').classList.add('hidden');
    document.getElementById('timer').classList.remove('hidden');
    startTimer();

    await Promise.all([loadQuestions(selectedLanguage), loadPictureQuestions(selectedLanguage)]);

    selectedQuestions = questions.sort(() => Math.random() - 0.5).slice(0, questionCount);
    selectedPictureQuestions = pictureQuestions.sort(() => Math.random() - 0.5).slice(0, pictureQuestionCount);

    const allQuestions = [...selectedQuestions, ...selectedPictureQuestions];
    selectedQuestions = allQuestions.sort(() => Math.random() - 0.5);

    currentQuestionIndex = 0;
    document.getElementById("quizContainer").classList.remove("hidden");
    document.querySelector(".config").classList.add("hidden");

    displayQuestion(); // show first question

    // set initial button states (first question)
    document.getElementById("prevQuestion").classList.add("hidden");
    document.getElementById("nextQuestion").classList.remove("hidden");
    document.getElementById("submitQuiz").classList.add("hidden");

    document.getElementById("returnButton").classList.remove("hidden");
  } else {
    alert("Please enter valid numbers for the questions and picture questions. Reload the page!");
  }
}


// --- displayQuestion (keep as-is, includes button toggles) ---
function displayQuestion() {
  const quizElement = document.getElementById("quiz");
  const question = selectedQuestions[currentQuestionIndex];

  quizElement.innerHTML = `
    <h2 id="ok2"><u>Question ${currentQuestionIndex + 1}</u></h2>
    ${question.image ? `<img src="${question.image}" alt="Question Image">` : ""}
    <h3>${question.question}</h3>
    ${question.options.map((option) => `
      <li class="clickable-item">
        <label>
          <input type="radio" name="answer" value="${option}" ${selectedAnswers[currentQuestionIndex] === option ? 'checked' : ''}>
          <span>${option}</span>
        </label>
      </li>
    `).join('')}
  `;

  // Show/hide navigation buttons based on position
  document.getElementById("prevQuestion").classList.toggle("hidden", currentQuestionIndex === 0);
  document.getElementById("nextQuestion").classList.toggle("hidden", currentQuestionIndex === selectedQuestions.length - 1);
  document.getElementById("submitQuiz").classList.toggle("hidden", currentQuestionIndex !== selectedQuestions.length - 1);
}

// Navigation through questions
document.getElementById("prevQuestion").addEventListener("click", () => {
    currentQuestionIndex--;
    displayQuestion();
});
document.getElementById("nextQuestion").addEventListener("click", () => {
    currentQuestionIndex++;
    displayQuestion();
});

// Submit the quiz function
function submitQuiz() {
    clearInterval(timerInterval);
    const resultContainer = document.getElementById("result");
    let score = 0;

    // Ensure selected answers are correctly assigned before checking
    selectedQuestions.forEach((question, index) => {
        if (selectedAnswers[index] === question.answer) {
            score++;
        }
    });

    document.getElementById("quizContainer").classList.add("hidden");
    const resultHTML = selectedQuestions.map((question, index) => {
        const userAnswer = selectedAnswers[index] || "No Answer";
        const isCorrect = selectedAnswers[index] === question.answer;
        return `
            <div class="result-question">
                <p><strong>Question ${index + 1}:</strong> ${question.question}</p>
                ${question.image ? `<img src="${question.image}" alt="Question Image">` : ""}
                <p>Your Answer: <span class="${isCorrect ? 'correct' : 'wrong'}">${selectedAnswers[index] || "No Answer"}</span></p>
                <p>Correct Answer: <span class="correct">${question.answer}</span></p>
            </div>
        `;
    }).join("");

    resultContainer.innerHTML = `
        <p style="font-size: 2em; text-align: center;"> ${score}/ ${selectedQuestions.length}</p>
        <div class="result-content">
            ${resultHTML}
        </div>
        <button id="restartQuiz" class="btn">Restart Quiz</button>
    `;

    resultContainer.classList.remove("hidden");

    // Attach the restart button click event
    document.getElementById("restartQuiz").addEventListener("click", () => {
        window.location.href = './quiztab';
    });
}

// Restart quiz function
function restartQuiz() {
    // Reset necessary variables and UI elements
    selectedAnswers = [];
    currentQuestionIndex = 0;
    document.getElementById("result").classList.add("hidden");
    document.getElementById("quizContainer").classList.remove("hidden");
    document.getElementById("startQuiz").classList.remove("hidden");
    document.getElementById("timer").classList.add("hidden");
    document.getElementById("returnButton").classList.add("hidden");
    document.querySelector(".config").classList.remove("hidden");
}

// Timeout handler function
function timeOut() {
    clearInterval(timerInterval);
    const resultContainer = document.getElementById("result");
    let score = 0;

    // Ensure selected answers are correctly assigned before checking
    selectedQuestions.forEach((question, index) => {
        if (selectedAnswers[index] === question.answer) {
            score++;
        }
    });

    const resultHTML = selectedQuestions.map((question, index) => {
        const isCorrect = selectedAnswers[index] === question.answer;
        return `
            <div class="result-question">
                <p><strong>Question ${index + 1}:</strong> ${question.question}</p>
                ${question.image ? `<img src="${question.image}" alt="Question Image">` : ""}
                <p>Your Answer: <span class="${isCorrect ? 'correct' : 'wrong'}">${selectedAnswers[index] || "No Answer"}</span></p>
                <p>Correct Answer: <span class="correct">${question.answer}</span></p>
            </div>
        `;
    }).join("");

    resultContainer.innerHTML = `
        <p style="font-size: 2em; text-align: center;"> ${score}/ ${selectedQuestions.length}</p>
        <p style="color: red;"><strong>Time's Up! You didn't finish in time.</strong></p>
        <p style="color: red;"><strong>انتهى الوقت! لم تتمكن من إكمال الاختبار في الوقت المحدد.</strong></p>
        <div class="result-content">
            ${resultHTML}
        </div>
        <button id="restartQuiz" class="btn">Restart Quiz</button>
    `;

    resultContainer.classList.remove("hidden");
    document.getElementById("quizContainer").classList.add("hidden");

    // Attach the restart button click event
    document.getElementById("restartQuiz").addEventListener("click", () => {
        window.location.href = './quiztab';
    });
}

// Timer functionality
function startTimer() {
    let timer = timeLeft, minutes, seconds;
    timerInterval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        let timeText = minutes + ":" + seconds;
        if (selectedLanguage === 'ar') {
            timeText = convertToArabicNumerals(timeText);
        }

        document.getElementById("timer").textContent = timeText;

        if (--timer < 0) {
            timeOut();
        }
    }, 1000);
}

// Start quiz button event listener
document.getElementById("startQuiz").addEventListener("click", function() {
    startQuiz();
    document.getElementById('startQuiz').classList.add('hidden');
    document.getElementById('timer').classList.remove('hidden'); // Ensure the timer is visible
});

// Attach the submit button click event
document.getElementById('submitQuiz').addEventListener('click', submitQuiz);

// Save selected answers
document.getElementById("quiz").addEventListener("change", (event) => {
    selectedAnswers[currentQuestionIndex] = event.target.value;
});

// Load questions on page load (default language is 'en')
loadQuestions('en');
loadPictureQuestions('en');

// Note: The duplicate event listener for "nextQuestion" has been removed.

