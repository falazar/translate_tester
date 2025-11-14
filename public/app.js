// Global Language Configuration
const baseLanguage = 'English';
const baseLanguageCode = getLanguageCode(baseLanguage);
const targetLanguage = 'French';
const targetLanguageCode = getLanguageCode(targetLanguage);

// Speech synthesis for pronunciation
let speechSynthesis = null;
let speechUtterance = null;

// Initialize speech synthesis
function initSpeechSynthesis() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    speechSynthesis = window.speechSynthesis;
    console.log('Speech synthesis available');
  } else {
    console.log('Speech synthesis not supported');
  }
}

// Speak text in target language
function speakText(text, language = targetLanguage) {
  if (!speechSynthesis) {
    console.log('Speech synthesis not available');
    return;
  }
  
  // Cancel any ongoing speech
  speechSynthesis.cancel();
  
  // Create new utterance
  speechUtterance = new SpeechSynthesisUtterance(text);
  
  // Configure language based on target language
  speechUtterance.lang = getSpeechLanguageCode(language);
  
  speechUtterance.rate = 0.8; // Slightly slower for learning
  speechUtterance.pitch = 1.0;
  speechUtterance.volume = 0.8;
  
  // Speak
  speechSynthesis.speak(speechUtterance);
}


// Stop speech
function stopSpeech() {
  if (speechSynthesis) {
    speechSynthesis.cancel();
  }
}

// Helper functions
function escapeForHtml(text) {
  return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// Calculate Levenshtein distance between two strings
function levenshteinDistance(a, b) {
  const matrix = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Check if answer is very close (off by just 1 character)
function isCloseMatch(userAnswer, correctAnswer) {
  const distance = levenshteinDistance(userAnswer.toLowerCase(), correctAnswer.toLowerCase());
  return distance === 1 && Math.abs(userAnswer.length - correctAnswer.length) <= 1;
}

function getLanguageCode(language) {
  if (language === 'English') return 'en';
  if (language === 'French') return 'fr';
  if (language === 'Spanish') return 'es';
  if (language === 'German') return 'de';
  return 'en'; // default
}

function getSpeechLanguageCode(language) {
  if (language === 'French') return 'fr-FR';
  if (language === 'Spanish') return 'es-ES';
  if (language === 'German') return 'de-DE';
  return 'en-US'; // default
}

// Global state
let currentUser = null;
let currentSession = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let currentScore = 0;
let currentLevelId = null;
let activeLevelSet = 1; // 1 for Set 1 (levels 1-12), 2 for Set 2 (levels 13-24), 3 for Set 3 (levels 25+)
let selectedLevelId = null;

// Helper function to update tab visual state
function updateTabState() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach((btn, index) => {
    if (index + 1 === activeLevelSet) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Helper function to filter and display levels based on active tab
function displayFilteredLevels(levelsWithProgress) {
  // Update tab active state
  updateTabState();

  // Display levels based on active tab
  const levelsGrid = document.getElementById('levelsGrid');
  levelsGrid.innerHTML = '';

  // Filter levels based on active tab
  const filteredLevels = levelsWithProgress.filter(level => {
    if (activeLevelSet === 1) {
      return level.level_number <= 12;
    } else if (activeLevelSet === 2) {
      return level.level_number > 12 && level.level_number < 25;
    } else if (activeLevelSet === 3) {
      return level.level_number >= 25;
    }
    return true; // fallback
  });

  // Display filtered levels
  for (const level of filteredLevels) {
    showLevelCard(level);
  }
}

// Tab switching function
function switchLevelSet(setNumber) {
  activeLevelSet = setNumber;
  // Save the current set to localStorage
  localStorage.setItem('activeLevelSet', setNumber.toString());
  updateTabState();

  // Get current levels data and redisplay
  fetch('/api/levels/user-progress')
    .then(response => response.json())
    .then(data => {
      displayFilteredLevels(data);
    })
    .catch(error => {
      console.error('Error switching level set:', error);
    });
}

// Menu functions
function openTesting() {
  // Go back to regular learning flow - this is already the main dashboard
  // Maybe just show a confirmation or reset to current level
  alert('You are already on the main testing/learning page. Start a practice session to test your knowledge!');
}

function openUploadText() {
  // Redirect to separate upload text page
  window.location.href = '/uploadtext.html';
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initSpeechSynthesis();
  checkAuth();
  if (typeof window !== 'undefined' && window.notifications) {
    window.notifications.setupDailyReminders();
  }
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

  // Add reminder button
  if (typeof window !== 'undefined' && window.notifications) {
    window.notifications.addReminderButton();
  }

  // Load saved active level set from localStorage
  const savedSet = localStorage.getItem('activeLevelSet');
  if (savedSet && (savedSet === '1' || savedSet === '2' || savedSet === '3')) {
    activeLevelSet = parseInt(savedSet);
  }

  // Update tab visual state to match loaded set
  updateTabState();

  try {
    // Get all levels with user progress
    const response = await fetch('/api/levels/user-progress');
    const levelsWithProgress = await response.json();
    
    // Check for newly unlocked levels
    const previouslyUnlocked = JSON.parse(localStorage.getItem('unlockedLevels') || '[]');
    const newlyUnlocked = [];
    
    // Find newly unlocked levels
    for (const level of levelsWithProgress) {
      if (level.is_unlocked && !previouslyUnlocked.includes(level.level_number)) {
        newlyUnlocked.push(level.level_number);
      }
    }

    // Display current level (default selection)
    const currentLevel = 
      levelsWithProgress.find(l => l.level_number === currentUser.current_level);
    
    if (currentLevel) {
      currentLevelId = currentLevel.id;
      selectedLevelId = currentLevel.id;
      selectLevel(currentLevel);
    }

    // Display levels using helper function
    displayFilteredLevels(levelsWithProgress);
    
    // Show popups for newly unlocked levels
    for (const levelNum of newlyUnlocked) {
      setTimeout(() => showLevelUnlockPopup(levelNum), 500);
    }
    
    // Update localStorage with current unlocked levels
    const currentUnlocked = levelsWithProgress
      .filter(level => level.is_unlocked)
      .map(level => level.level_number);
    localStorage.setItem('unlockedLevels', JSON.stringify(currentUnlocked));
    
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

function showLevelCard(level) {
  const isUnlocked = level.is_unlocked;
  const mastery = level.mastery;
  const isCurrent = level.level_number === currentUser.current_level;

  const levelsGrid = document.getElementById('levelsGrid');
  const levelItem = document.createElement('div');

  // Determine card color based on mastery
  let cardClass = `level-item ${isUnlocked ? '' : 'locked'}`;
  if (mastery >= 90) {
    cardClass += ' mastery-high';
  } else if (mastery < 80) {
    cardClass += ' mastery-low';
  }

  levelItem.className = cardClass;
  levelItem.dataset.levelId = level.id;
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Create HTML with mastery, date unlocked, and days to beat
  levelItem.innerHTML = `
    <h3>Level ${level.level_number}</h3>
    <h4>${level.name}</h4>
    <p>${level.description}</p>
    <span class="level-status ${isCurrent ? 'current' : 
      (isUnlocked ? 'unlocked' : 'locked')}">
      ${isCurrent ? 'Current' : 
        (isUnlocked ? 'Unlocked' : 'Locked')}
      <span class="mastery-percentage">${mastery}%</span>
    </span>
    ${isUnlocked ? `
      <div class="level-dates">
        <small>Unlocked: ${formatDate(level.unlocked_at)}</small>
        <small>Attempts: ${level.attempts}</small>
        ${level.days_to_beat ? `<small>Beat in: ${level.days_to_beat} days</small>` : ''}
      </div>
    ` : ''}
  `;
  
  // Add click handler for unlocked levels
  if (isUnlocked) {
    levelItem.style.cursor = 'pointer';
    levelItem.onclick = () => selectLevel(level);
  }
  
  levelsGrid.appendChild(levelItem);
}

async function selectLevel(level) {
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

  // Save current level to backend
  try {
    const response = await fetch('/api/auth/update-current-level', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level: level.level_number })
    });

    if (response.ok) {
      // Update local user object
      currentUser.current_level = level.level_number;
      console.log(`Current level set to ${level.level_number}`);
    } else {
      console.error('Failed to update current level');
    }
  } catch (error) {
    console.error('Error updating current level:', error);
  }
}

// Show words for selected level
async function showWords() {
  if (!selectedLevelId) {
    alert('Please select a level first');
    return;
  }

  try {
    // Fetch level with words data
    const response = await fetch(`/api/levels/${selectedLevelId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch level data');
    }
    
    const data = await response.json();
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
  
  words.forEach((word, index) => {
    const wordItem = document.createElement('div');
    wordItem.className = 'word-item';
    
    // Progress stats - always show, even if 0%
    const progress = word.progress || { 
      correct_count: 0, 
      incorrect_count: 0, 
      mastery_level: 0 
    };
    
    const progressHTML = `
      <div class="word-progress">
        <span class="progress-correct" 
              title="Correct answers">
          ✓ ${progress.correct_count}
        </span>
        <span class="progress-incorrect" 
              title="Incorrect answers">
          ✗ ${progress.incorrect_count}
        </span>
        <span class="progress-mastery" 
              title="Mastery level">
          ${progress.mastery_level}%
        </span>
      </div>
    `;
    
    let examplesHTML = '';
    console.log("DEBUG: word.examples", JSON.stringify(word.examples, null, 2));
    if (word.examples && word.examples.length > 0) {
      examplesHTML = `
        <div class="word-examples">
          ${word.examples.map(ex => `
            <div class="word-example">
              <span class="target-sentence">
                ${ex[`${targetLanguage.toLowerCase()}_sentence`]}
                <button class="speaker-btn-small" tabindex="-1" onclick="speakText('${escapeForHtml(ex[`${targetLanguage.toLowerCase()}_sentence`])}')" title="Listen to pronunciation">
                  🔊
                </button>
              </span>
              → ${ex[`${baseLanguage.toLowerCase()}_translation`]}
            </div>
          `).join('')}
        </div>
      `;
    }
    
    wordItem.innerHTML = `
      <div class="word-item-header">
        <div class="word-main">
          <span class="word-number">${index + 1}.</span>
          <span class="word-${targetLanguage.toLowerCase()}">
            ${word[targetLanguage.toLowerCase()]}
            <button class="speaker-btn" tabindex="-1" onclick="speakText('${escapeForHtml(word[targetLanguage.toLowerCase()])}')" title="Listen to pronunciation">
              🔊
            </button>
          </span>
          <span class="word-${baseLanguage.toLowerCase()}">${word[baseLanguage.toLowerCase()]}</span>
          ${progressHTML}
        </div>
        <span class="word-type-badge">${word.word_type}</span>
      </div>
      ${examplesHTML}
    `;
    
    wordsList.appendChild(wordItem);
  });
}

// Game functions
function updateGameLevelInfo(level) {
  const levelInfoElement = document.getElementById('gameLevelInfo');
  if (levelInfoElement && level) {
    levelInfoElement.textContent = `Level ${level.level_number}: ${level.name}`;
  }
}

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
      
      // Update level info display
      updateGameLevelInfo(data.level);
      
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
  
  // Reset all multiple choice buttons for new question
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.classList.remove('selected');
  });
  
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
  
  // Add speaker button to target language text in questions and auto-play
  let questionHTML = question.question;
  if (question.type === `${targetLanguageCode}_to_${baseLanguageCode}`) {
    // Extract target language text from question and add speaker button
    const questionMatch = question.question.match(/"([^"]+)"/);
    if (questionMatch) {
      const targetText = questionMatch[1];
      questionHTML = question.question.replace(
        `"${targetText}"`,
        `<span class="target-sentence">"${targetText}"
        <button class="speaker-btn-small" tabindex="-1" onclick="speakText('${escapeForHtml(targetText)}','${targetLanguage}')"
        title="Listen to pronunciation">🔊</button></span>`
      );
      // Auto-play the target language sentence when question loads
      setTimeout(() => speakText(targetText, targetLanguage), 500);
    }
  } else if (question.type === 'fill_blank') {
    // For fill_blank, extract target language sentence after <br> tag
    const questionMatch = question.question.match(/<br>"([^"]+)"/);
    if (questionMatch) {
      const targetText = questionMatch[1];
      const cleanText = targetText.replace(/_/g, ''); // Remove underscores once
      const escapedText = escapeForHtml(cleanText); // Escape once
      
      questionHTML = question.question.replace(
        `<br>"${targetText}"`,
        `<br><span class="target-sentence">"${targetText}" <button class="speaker-btn-small" tabindex="-1" onclick="speakText('${escapedText}','${targetLanguage}')" title="Listen to pronunciation">🔊</button></span>`
      );
      // Auto-play the target language sentence when question loads
      setTimeout(() => speakText(cleanText, targetLanguage), 500);
    }
  } else if (question.type === `${baseLanguageCode}_to_${targetLanguageCode}`) {
    // For English to target language questions, add speaker button to the target language word in the question
    const questionMatch = question.question.match(/"([^"]+)"/);
    if (questionMatch) {
      const targetText = questionMatch[1];
      questionHTML = question.question.replace(
        `"${targetText}"`, 
        `"${targetText}" <button class="speaker-btn-small" tabindex="-1" onclick="speakText('${escapeForHtml(targetText)}','${targetLanguage}')" title="Listen to pronunciation">🔊</button>`
      );
      // Auto-play the target language word when question loads
      setTimeout(() => speakText(targetText, targetLanguage), 500);
    }
  } else if (question.type === 'multiple_choice') {
    // For multiple choice questions, add speaker button to the target language word in the question
    const questionMatch = question.question.match(/"([^"]+)"/);
    if (questionMatch) {
      const targetText = questionMatch[1];
      questionHTML = question.question.replace(
        `"${targetText}"`, 
        `"${targetText}" <button class="speaker-btn-small" tabindex="-1" onclick="speakText('${escapeForHtml(targetText)}','${targetLanguage}')" title="Listen to pronunciation">🔊</button>`
      );
      // Auto-play the target language word when question loads
      setTimeout(() => speakText(targetText, targetLanguage), 500);
    }
  }
  
  // Debug: log the question to see the format
  console.log('Question type:', question.type);
  console.log('Question text:', question.question);
  console.log('Final HTML:', questionHTML);
  
  document.getElementById('questionText').innerHTML = questionHTML;

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
    input.autocomplete = 'off';
    input.spellcheck = 'false';
    input.autocorrect = 'off';
    input.autocapitalize = 'off';
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') submitAnswer();
    });
    answerArea.appendChild(input);
    input.focus();
    
    // Reset input field styling (in case it was disabled from previous question)
    input.disabled = false;
    input.style.backgroundColor = '';
    input.style.color = '';
  }

  // Reset buttons and feedback
  const submitBtn = document.getElementById('submitBtn');
  if (question.type === 'multiple_choice') {
    submitBtn.style.display = 'none';  // Hide submit button for multiple choice
  } else {
    submitBtn.style.display = 'block';  // Show submit button for other question types
  }
  submitBtn.disabled = false;  // Re-enable submit button
  document.getElementById('nextBtn').style.display = 'none';
  document.getElementById('feedback').classList.remove('active');
}

function selectOption(button) {
  // Deselect all options and re-enable them
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.classList.remove('selected');
    btn.disabled = false;
    btn.style.opacity = '1';
  });
  
  // Select clicked option
  button.classList.add('selected');
  
  // Disable all other options
  document.querySelectorAll('.option-btn:not(.selected)').forEach(btn => {
    btn.disabled = true;
    btn.style.opacity = '0.5';
  });
  
  // Auto-submit the answer immediately
  submitAnswer();
}

function formatQuestionType(type) {
  const types = {
    [`${getLanguageCode(baseLanguage)}_to_${getLanguageCode(targetLanguage)}`]: `${baseLanguage} → ${targetLanguage}`,
    [`${getLanguageCode(targetLanguage)}_to_${getLanguageCode(baseLanguage)}`]: `${targetLanguage} → ${baseLanguage}`,
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

  // Disable submit button and input field
  document.getElementById('submitBtn').disabled = true;
  
  // Disable and style input field
  const inputField = document.getElementById('answerInput');
  if (inputField) {
    inputField.disabled = true;
    inputField.style.backgroundColor = '#f0f0f0';
    inputField.style.color = '#999';
  }

  try {
    const response = await fetch(
      `/api/sessions/${currentSession.id}/answer`, 
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word_id: question.word.id,
          question_type: question.type,
          question_text: question.question,
          user_answer: userAnswer,
          correct_answer: question.correct_answer
        })
      }
    );

    if (response.ok) {
      const result = await response.json();
      displayFeedback(result.correct, question.correct_answer, question, userAnswer);
      
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

function displayFeedback(correct, correctAnswer, question, userAnswer = '') {
  const feedback = document.getElementById('feedback');
  feedback.className = 'feedback active ' + 
                       (correct ? 'correct' : 'incorrect');
  
  // Always extract the English sentence if available
  let englishSentence = '';
  if (question.english_translation) {
    englishSentence = question.english_translation;
  }

  if (question.type === 'fill_blank') {
    // For fill-in-the-blank, show the complete correct sentence
    const questionMatch = question.question.match(/<br>"([^"]+)"/);
    if (questionMatch) {
      const incompleteSentence = questionMatch[1];
      const completeSentence = incompleteSentence.replace(/___/g, correctAnswer);
      if (correct) {
        feedback.innerHTML = `✓ Correct!<br><br><strong>Complete sentence:</strong><br>
          <span class="target-sentence">
            "${completeSentence}" 
            <button class="speaker-btn-small" tabindex="-1" onclick="speakText('${escapeForHtml(completeSentence)}','${targetLanguage}')" title="Listen to pronunciation">🔊</button>
          </span>
          <br>
          <span class="sentence-en">${englishSentence}</span>
        `;
      } else {
        const showMainTerm = question.type === 'fill_blank' || question.type === 'en_to_fr';
        const rootWord = question.word.french;  // Root/base word
        const mainTermHint = showMainTerm && correctAnswer !== rootWord ? `<br>(${rootWord})` : '';
        // Check if user was very close (off by just 1 character)
        const closeMatch = isCloseMatch(userAnswer, correctAnswer);
        const feedbackPrefix = closeMatch ? '🤏 So close! The correct answer is:' : '✗ Incorrect. The correct answer is:';
        feedback.innerHTML = `${feedbackPrefix} ${correctAnswer}${mainTermHint}<br><br><strong>Complete sentence:</strong><br><span class="target-sentence">"${completeSentence}" <button class="speaker-btn-small" tabindex="-1" onclick="speakText('${escapeForHtml(completeSentence)}','${targetLanguage}')" title="Listen to pronunciation">🔊</button></span><br><span class="sentence-en">${englishSentence}</span>`;
      }
      // Auto-play the complete target language sentence
      setTimeout(() => speakText(completeSentence.replace(/_/g, ''), targetLanguage), 1000);
    }
  } else {
    // For other question types, show standard feedback, but include English sentence below
    if (correct) {
      feedback.innerHTML = `✓ Correct!<br><br><strong>Answer:</strong> ${correctAnswer}<br><span class="sentence-en">${englishSentence}</span>`;
      // Speak the correct answer in the appropriate language
      if (question.type === `${baseLanguageCode}_to_${targetLanguageCode}`) {
        setTimeout(() => speakText(correctAnswer, targetLanguage), 1000);
      } else if (question.type === `${targetLanguageCode}_to_${baseLanguageCode}`) {
        setTimeout(() => speakText(correctAnswer, baseLanguage), 1000);
      } else if (question.type === 'multiple_choice') {
        setTimeout(() => speakText(correctAnswer, baseLanguage), 1000);
      }
    } else {
      const showMainTerm = question.type === 'fill_blank' || question.type === 'en_to_fr';
      const rootWord = question.word.french;  // Root/base word
      const mainTermHint = showMainTerm && correctAnswer !== rootWord ? `\n(${rootWord})` : '';
      // Check if user was very close (off by just 1 character)
      const closeMatch = isCloseMatch(userAnswer, correctAnswer);
      const feedbackPrefix = closeMatch ? '🤏 So close! The correct answer is:' : '✗ Incorrect. The correct answer is:';
      feedback.innerHTML = `${feedbackPrefix} ${correctAnswer}${mainTermHint}<br><span class="sentence-en">${englishSentence}</span>`;
      // Speak the correct answer in the appropriate language
      if (question.type === `${baseLanguageCode}_to_${targetLanguageCode}`) {
        setTimeout(() => speakText(correctAnswer, targetLanguage), 1000);
      } else if (question.type === `${targetLanguageCode}_to_${baseLanguageCode}`) {
        setTimeout(() => speakText(correctAnswer, baseLanguage), 1000);
      } else if (question.type === 'multiple_choice') {
        setTimeout(() => speakText(correctAnswer, baseLanguage), 1000);
      }
    }
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
    : results.percentage >= 70 
      ? `You scored ${results.score}/${results.total_questions}. Good job!`
      : `You scored ${results.score}/${results.total_questions}. Try a bit harder!`;
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
                <div class="example-line">
                  <span class="target-sentence">
                    ${ex[`${targetLanguage.toLowerCase()}_sentence`]}
                    <button class="speaker-btn-small" tabindex="-1" onclick="speakText('${escapeForHtml(ex[`${targetLanguage.toLowerCase()}_sentence`])}')" title="Listen to pronunciation">
                      🔊
                    </button>
                  </span>
                  → ${ex[`${baseLanguage.toLowerCase()}_translation`]}
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }
      
      console.log("DEBUG: item", item);
      const showMainTerm = item.question_type === 'fill_blank' || item.question_type === 'en_to_fr';
      const rootWord = item.word?.french;  // This is the root/base word from the database
      // const mainTermHint = showMainTerm && rootWord     
      // && item.correct_answer.toLowerCase() !== rootWord.toLowerCase() ? ` (${rootWord})` : '';
      let mainTermHint = '';
      if (showMainTerm && rootWord && item.correct_answer.toLowerCase() !== rootWord.toLowerCase()) {
        mainTermHint = ` (${rootWord})`;
      }
      reviewItem.innerHTML = `
        <h3>${item.question_text}</h3>
        <div class="answer-info">
          <div class="correct-answer-display">
            <strong>Correct answer:</strong> 
            <span class="correct-text">${item.correct_answer}${mainTermHint}</span>
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

function showLevelUnlockPopup(newLevel) {
  // Create popup overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;
  
  // Create popup content
  const popup = document.createElement('div');
  popup.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    max-width: 400px;
    margin: 20px;
  `;
  
  popup.innerHTML = `
    <div style="font-size: 4em; margin-bottom: 20px;">🎉</div>
    <h2 style="color: #28a745; margin-bottom: 15px;">Level ${newLevel} Unlocked!</h2>
    <p style="color: #666; margin-bottom: 25px;">
      Congratulations! You've mastered this level and unlocked the next challenge.
    </p>
    <button onclick="this.parentElement.parentElement.remove()" 
            style="background: #28a745; color: white; border: none; 
                   padding: 12px 24px; border-radius: 8px; 
                   font-size: 16px; cursor: pointer;">
      Awesome!
    </button>
  `;
  
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
  
  // Auto-close after 5 seconds
  setTimeout(() => {
    if (overlay.parentElement) {
      overlay.remove();
    }
  }, 5000);
}

