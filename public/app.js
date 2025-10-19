// Global state
let currentUser = null;
let currentSession = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let currentScore = 0;
let currentLevelId = null;
let selectedLevelId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});

// Auth functions
async function checkAuth() {
  try {
    const response = await fetch('/api/auth/me');
    if (response.ok) {
      currentUser = await response.json();
      showDashboard();
    } else {
      showScreen('authScreen');
    }
  } catch (error) {
    showScreen('authScreen');
  }
}

function switchToRegister() {
  document.getElementById('loginForm').classList.remove('active');
  document.getElementById('registerForm').classList.add('active');
  clearError();
}

function switchToLogin() {
  document.getElementById('registerForm').classList.remove('active');
  document.getElementById('loginForm').classList.add('active');
  clearError();
}

async function login() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  if (!username || !password) {
    showError('Please fill in all fields');
    return;
  }

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      showDashboard();
    } else {
      const error = await response.json();
      showError(error.error);
    }
  } catch (error) {
    showError('Login failed. Please try again.');
  }
}

async function register() {
  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  if (!username || !email || !password) {
    showError('Please fill in all fields');
    return;
  }

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      showDashboard();
    } else {
      const error = await response.json();
      showError(error.error);
    }
  } catch (error) {
    showError('Registration failed. Please try again.');
  }
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  currentUser = null;
  showScreen('authScreen');
}

// Dashboard functions
async function showDashboard() {
  showScreen('dashboardScreen');
  
  document.getElementById('usernameDisplay').textContent = 
    currentUser.username;
  
  try {
    // Get all levels
    const response = await fetch('/api/levels');
    const levels = await response.json();

    // Display current level (default selection)
    const currentLevel = 
      levels.find(l => l.level_number === currentUser.current_level);
    
    if (currentLevel) {
      currentLevelId = currentLevel.id;
      selectedLevelId = currentLevel.id;
      selectLevel(currentLevel);
    }

    // Display all levels
    const levelsGrid = document.getElementById('levelsGrid');
    levelsGrid.innerHTML = '';

    levels.forEach(level => {
      const isUnlocked = level.level_number <= 
                         currentUser.current_level;
      const isCurrent = level.level_number === 
                        currentUser.current_level;
      
      const levelItem = document.createElement('div');
      levelItem.className = `level-item ${isUnlocked ? '' : 'locked'}`;
      levelItem.dataset.levelId = level.id;
      levelItem.innerHTML = `
        <h3>Level ${level.level_number}</h3>
        <h4>${level.name}</h4>
        <p>${level.description}</p>
        <span class="level-status ${isCurrent ? 'current' : 
          (isUnlocked ? 'unlocked' : 'locked')}">
          ${isCurrent ? 'Current' : 
            (isUnlocked ? 'Unlocked' : 'Locked')}
        </span>
      `;
      
      // Add click handler for unlocked levels
      if (isUnlocked) {
        levelItem.style.cursor = 'pointer';
        levelItem.onclick = () => selectLevel(level);
      }
      
      levelsGrid.appendChild(levelItem);
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

function selectLevel(level) {
  // Update selected level
  selectedLevelId = level.id;
  
  // Update display area
  document.getElementById('currentLevelNum').textContent = 
    level.level_number;
  document.getElementById('currentLevelName').textContent = level.name;
  document.getElementById('currentLevelDesc').textContent = 
    level.description;
  
  // Update visual selection
  document.querySelectorAll('.level-item').forEach(item => {
    item.classList.remove('selected');
  });
  
  const selectedItem = document.querySelector(
    `[data-level-id="${level.id}"]`
  );
  if (selectedItem) {
    selectedItem.classList.add('selected');
  }
}

// Show words for selected level
async function showWords() {
  if (!selectedLevelId) {
    alert('Please select a level first');
    return;
  }

  try {
    // Fetch words for the selected level
    const wordsResponse = await fetch(
      `/api/levels/${selectedLevelId}/words`
    );
    
    if (!wordsResponse.ok) {
      throw new Error('Failed to fetch words');
    }
    
    const data = await wordsResponse.json();
    displayWordsScreen(data);
  } catch (error) {
    console.error('Error loading words:', error);
    alert('Failed to load words: ' + error.message);
  }
}

function displayWordsScreen(data) {
  showScreen('wordsScreen');
  
  const { level, words } = data;
  
  document.getElementById('wordsLevelTitle').textContent = 
    `Level ${level.level_number}: ${level.name}`;
  
  const wordsList = document.getElementById('wordsList');
  wordsList.innerHTML = '';
  
  words.forEach(word => {
    const wordItem = document.createElement('div');
    wordItem.className = 'word-item';
    
    let examplesHTML = '';
    if (word.examples && word.examples.length > 0) {
      examplesHTML = `
        <div class="word-examples">
          ${word.examples.map(ex => `
            <div class="word-example">
              ${ex.french_sentence} → ${ex.english_translation}
            </div>
          `).join('')}
        </div>
      `;
    }
    
    wordItem.innerHTML = `
      <div class="word-item-header">
        <div class="word-main">
          <span class="word-french">${word.french}</span>
          <span class="word-english">${word.english}</span>
        </div>
        <span class="word-type-badge">${word.word_type}</span>
      </div>
      ${examplesHTML}
    `;
    
    wordsList.appendChild(wordItem);
  });
}

// Game functions
async function startSession() {
  try {
    const response = await fetch('/api/sessions/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level_id: selectedLevelId })
    });

    if (response.ok) {
      const data = await response.json();
      currentSession = { id: data.session_id, 
                         level_id: data.level_id };
      currentQuestions = data.questions;
      currentQuestionIndex = 0;
      currentScore = 0;
      
      showScreen('gameScreen');
      displayQuestion();
    } else {
      const errorData = await response.json();
      console.error('Failed to start session:', errorData);
      alert('Failed to start session: ' + 
            (errorData.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error starting session:', error);
    alert('Failed to start session: ' + error.message);
  }
}

function displayQuestion() {
  const question = currentQuestions[currentQuestionIndex];
  
  // Update progress
  document.getElementById('currentQuestion').textContent = 
    currentQuestionIndex + 1;
  document.getElementById('currentScore').textContent = currentScore;
  
  const progressPercent = 
    ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
  document.getElementById('progressFill').style.width = 
    progressPercent + '%';

  // Display question
  document.getElementById('questionType').textContent = 
    formatQuestionType(question.type);
  document.getElementById('questionText').innerHTML = 
    question.question;

  // Clear previous answer area
  const answerArea = document.getElementById('answerArea');
  answerArea.innerHTML = '';

  // Create answer input based on question type
  if (question.type === 'multiple_choice') {
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'options-grid';
    
    question.options.forEach(option => {
      const button = document.createElement('button');
      button.className = 'option-btn';
      button.textContent = option;
      button.onclick = () => selectOption(button);
      optionsDiv.appendChild(button);
    });
    
    answerArea.appendChild(optionsDiv);
  } else {
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'answerInput';
    input.placeholder = 'Type your answer...';
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') submitAnswer();
    });
    answerArea.appendChild(input);
    input.focus();
  }

  // Reset buttons and feedback
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.style.display = 'block';
  submitBtn.disabled = false;  // Re-enable submit button
  document.getElementById('nextBtn').style.display = 'none';
  document.getElementById('feedback').classList.remove('active');
}

function selectOption(button) {
  // Deselect all options
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // Select clicked option
  button.classList.add('selected');
}

function formatQuestionType(type) {
  const types = {
    'fr_to_en': 'French → English',
    'en_to_fr': 'English → French',
    'fill_blank': 'Fill in the Blank',
    'multiple_choice': 'Multiple Choice'
  };
  return types[type] || type;
}

async function submitAnswer() {
  const question = currentQuestions[currentQuestionIndex];
  let userAnswer = '';

  if (question.type === 'multiple_choice') {
    const selected = document.querySelector('.option-btn.selected');
    if (!selected) {
      alert('Please select an answer');
      return;
    }
    userAnswer = selected.textContent;
  } else {
    const input = document.getElementById('answerInput');
    userAnswer = input.value.trim();
    if (!userAnswer) {
      alert('Please enter an answer');
      return;
    }
  }

  // Disable submit button
  document.getElementById('submitBtn').disabled = true;

  try {
    const response = await fetch(
      `/api/sessions/${currentSession.id}/answer`, 
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word_id: question.word.id,
          question_type: question.type,
          user_answer: userAnswer,
          correct_answer: question.correct_answer
        })
      }
    );

    if (response.ok) {
      const result = await response.json();
      displayFeedback(result.correct, question.correct_answer);
      
      if (result.correct) {
        currentScore++;
        document.getElementById('currentScore').textContent = 
          currentScore;
      }
    } else {
      alert('Failed to submit answer');
    }
  } catch (error) {
    console.error('Error submitting answer:', error);
    alert('Failed to submit answer');
  }
}

function displayFeedback(correct, correctAnswer) {
  const feedback = document.getElementById('feedback');
  feedback.className = 'feedback active ' + 
                       (correct ? 'correct' : 'incorrect');
  
  if (correct) {
    feedback.textContent = '✓ Correct!';
  } else {
    feedback.textContent = `✗ Incorrect. The correct answer is: ${correctAnswer}`;
  }

  // Hide submit, show next
  document.getElementById('submitBtn').style.display = 'none';
  document.getElementById('nextBtn').style.display = 'block';
}

function nextQuestion() {
  currentQuestionIndex++;
  
  if (currentQuestionIndex < currentQuestions.length) {
    displayQuestion();
  } else {
    showResults();
  }
}

async function showResults() {
  showScreen('resultsScreen');

  try {
    const response = await fetch(
      `/api/sessions/${currentSession.id}/results`
    );
    
    if (response.ok) {
      const results = await response.json();
      displayResults(results);
    } else {
      alert('Failed to load results');
    }
  } catch (error) {
    console.error('Error loading results:', error);
    alert('Failed to load results');
  }
}

function displayResults(results) {
  // Update title
  document.getElementById('resultsTitle').textContent = 
    results.passed ? '🎉 Congratulations!' : '📚 Keep Practicing!';

  // Update score circle
  const scoreCircle = document.getElementById('scoreCircle');
  scoreCircle.className = 'score-circle ' + 
                          (results.passed ? 'passed' : 'failed');
  document.getElementById('percentageDisplay').textContent = 
    results.percentage + '%';

  // Update message
  const message = results.passed 
    ? `You scored ${results.score}/${results.total_questions} and advanced to the next level!`
    : `You scored ${results.score}/${results.total_questions}. You need 90% to advance.`;
  document.getElementById('resultsMessage').textContent = message;

  // Display review items
  const reviewItems = document.getElementById('reviewItems');
  reviewItems.innerHTML = '';

  if (results.incorrect_words.length === 0) {
    reviewItems.innerHTML = 
      '<p style="text-align: center; color: #28a745; font-weight: 600;">Perfect score! No mistakes to review.</p>';
  } else {
    results.incorrect_words.forEach(item => {
      const reviewItem = document.createElement('div');
      reviewItem.className = 'review-item';
      
      let examplesHTML = '';
      if (item.examples && item.examples.length > 0) {
        examplesHTML = `
          <div class="examples">
            <h4>Example sentences:</h4>
            ${item.examples.map(ex => `
              <div class="example">
                <div class="french">${ex.french_sentence}</div>
                <div class="english">→ ${ex.english_translation}</div>
              </div>
            `).join('')}
          </div>
        `;
      }
      
      reviewItem.innerHTML = `
        <h3>${item.word.french} → ${item.word.english}</h3>
        <div class="answer-info">
          <div class="correct-answer-display">
            <strong>Correct answer:</strong> 
            <span class="correct-text">${item.correct_answer}</span>
          </div>
          <div class="user-answer-display">
            <strong>Your answer:</strong> 
            <span class="wrong-text">${item.user_answer || '(blank)'}</span>
          </div>
        </div>
        ${examplesHTML}
      `;
      
      reviewItems.appendChild(reviewItem);
    });
  }

  // Update user info if passed
  if (results.passed) {
    currentUser.current_level++;
  }
}

function returnToDashboard() {
  showDashboard();
}

function retryLevel() {
  startSession();
}

// Utility functions
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}

function showError(message) {
  const errorDiv = document.getElementById('authError');
  errorDiv.textContent = message;
  errorDiv.classList.add('active');
}

function clearError() {
  const errorDiv = document.getElementById('authError');
  errorDiv.textContent = '';
  errorDiv.classList.remove('active');
}

