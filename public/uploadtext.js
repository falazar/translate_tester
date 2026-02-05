// Upload Text Page JavaScript Functions

// Global variables
let currentUser = null;
let plainFrequenciesExpanded = false;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  initUploadTextPage();
});

function initUploadTextPage() {
  // Check if user is authenticated by calling /api/auth/me
  checkAuth();

  // Hide processing result and word analysis initially
  document.getElementById('processingResult').style.display = 'none';
  document.getElementById('wordAnalysis').style.display = 'none';

  // Reset expansion state
  plainFrequenciesExpanded = false;
  const toggleIcon = document.getElementById('plainToggleIcon');
  if (toggleIcon) {
    toggleIcon.textContent = '▼';
  }

  // Load saved text from localStorage
  loadSavedText();

  // Set up auto-save on text input
  setupTextAutoSave();
}

function loadSavedText() {
  const textInput = document.getElementById('textInput');
  const savedText = localStorage.getItem('uploadTextContent');
  if (savedText && textInput) {
    textInput.value = savedText;
  }
}

function setupTextAutoSave() {
  const textInput = document.getElementById('textInput');
  if (textInput) {
    textInput.addEventListener('input', function () {
      localStorage.setItem('uploadTextContent', this.value);
    });
  }
}

async function checkAuth() {
  try {
    const response = await fetch('/api/auth/me');
    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      updateUsernameDisplay();
    } else {
      // Not authenticated, redirect to login
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    window.location.href = '/';
  }
}

function updateUsernameDisplay() {
  const uploadTextUsernameDisplay = document.getElementById('uploadTextUsernameDisplay');
  if (currentUser && uploadTextUsernameDisplay) {
    uploadTextUsernameDisplay.textContent = `Welcome, ${currentUser.username}!`;
  }
}

function goToTesting() {
  // Redirect back to main dashboard
  window.location.href = '/';
}

function openUploadText() {
  // Already on upload text page, maybe refresh or do nothing
  console.log('Already on upload text page');
}

function handleTextUpload(event) {
  event.preventDefault();

  const textInput = document.getElementById('textInput').value;
  const submitButton = event.target.querySelector('button[type="submit"]');

  // Show loading state
  submitButton.textContent = 'Processing...';
  submitButton.disabled = true;

  // Call the server endpoint
  fetch('/api/text/parseText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: textInput }),
  })
    .then((response) => {
      if (!response.ok) {
        // Handle non-200 responses
        return response.text().then((text) => {
          throw new Error(`HTTP ${response.status}: ${text}`);
        });
      }
      return response.json();
    })
    .then((data) => {
      // Show processing result
      const processingResult = document.getElementById('processingResult');
      const highlightedText = document.getElementById('highlightedText');

      // Use highlighted text if available, otherwise fall back to processed text
      const textToDisplay =
        data.analysis?.highlightedProcessedText ||
        data.processedText ||
        'No text returned from server';
      highlightedText.innerHTML = textToDisplay;
      processingResult.style.display = 'block';

      // Show word analysis if available
      if (data.analysis) {
        const wordAnalysis = document.getElementById('wordAnalysis');
        const wordCount = document.getElementById('wordCount');
        const uniqueWords = document.getElementById('uniqueWords');
        const uniqueKnownWords = document.getElementById('uniqueKnownWords');
        const unknownWords = document.getElementById('unknownWords');
        const percentageKnown = document.getElementById('percentageKnown');
        const knownWordCount = document.getElementById('knownWordCount');
        const totalWordCount = document.getElementById('totalWordCount');
        const plainWordFrequencies = document.getElementById('plainWordFrequencies');

        console.log('DOM elements found:', {
          wordAnalysis: !!wordAnalysis,
          plainWordFrequencies: !!plainWordFrequencies,
        });

        wordCount.textContent = data.analysis.totalWords || '0';
        uniqueWords.textContent = data.analysis.uniqueWords || '0';
        uniqueKnownWords.textContent = data.analysis.uniqueKnownWords || '0';
        unknownWords.textContent = data.analysis.unknownWords || '0';
        percentageKnown.textContent = data.analysis.percentageKnown || '0';

        // Calculate and display the math for percentage
        const totalWords =
          data.analysis.wordFrequencies?.reduce((sum, item) => sum + item.count, 0) || 0;
        const knownWords =
          data.analysis.wordFrequencies
            ?.filter((item) => item.level !== 'unknown')
            .reduce((sum, item) => sum + item.count, 0) || 0;

        knownWordCount.textContent = knownWords.toString();
        totalWordCount.textContent = totalWords.toString();

        // Display plain word frequencies (by count)
        console.log('Plain word frequencies:', data.analysis.plainWordFrequencies);
        if (
          data.analysis.plainWordFrequencies &&
          Array.isArray(data.analysis.plainWordFrequencies)
        ) {
          console.log('Plain word frequencies length:', data.analysis.plainWordFrequencies.length);

          // Show only first 10 items initially, add expand indicator if more exist
          const displayItems = data.analysis.plainWordFrequencies.slice(0, 10);
          const hasMoreItems = data.analysis.plainWordFrequencies.length > 10;

          let plainHtml = displayItems
            .map((item, index) => {
              console.log('Plain item:', item);
              const number = index + 1;
              return `
            <div class="plain-frequency-item">
              <div class="word-info">
                <span class="word-number">${number}.</span>
                <span class="word-text">${item.word}</span>
              </div>
              <span class="word-count">${item.count}</span>
            </div>
          `;
            })
            .join('');

          if (hasMoreItems) {
            plainHtml += `
            <div class="expand-indicator">
              + ${data.analysis.plainWordFrequencies.length - 10} more words... Click header to expand
            </div>
          `;
          }

          console.log('Plain HTML generated:', plainHtml.substring(0, 200) + '...');
          plainWordFrequencies.innerHTML = plainHtml || '<p>No plain frequencies to display</p>';
          console.log('Plain HTML set to DOM');

          // Set initial collapsed state if there are more than 10 items
          if (hasMoreItems && !plainFrequenciesExpanded) {
            plainWordFrequencies.classList.add('collapsed');
            plainWordFrequencies.classList.remove('expanded');
          }
        } else {
          console.log('Plain word frequencies not found or not an array');
        }

        // Display known and unknown word frequencies by level
        if (data.analysis.wordFrequencies && Array.isArray(data.analysis.wordFrequencies)) {
          const knownWords = data.analysis.wordFrequencies.filter(
            (item) => item.level !== 'unknown'
          );
          const unknownWords = data.analysis.wordFrequencies.filter(
            (item) => item.level === 'unknown'
          );

          // Set header counts
          document.getElementById('plainWordCount').textContent =
            `(${data.analysis.plainWordFrequencies.length})`;
          document.getElementById('knownLevelWordCount').textContent = `(${knownWords.length})`;
          document.getElementById('unknownLevelWordCount').textContent = `(${unknownWords.length})`;

          // Display all known words
          const knownWordFrequencies = document.getElementById('knownWordFrequencies');
          if (knownWords.length > 0) {
            const knownHtml = knownWords
              .map((item, index) => {
                const levelText = `Level ${item.level}`;
                const number = index + 1;
                return `
              <div class="word-frequency-item">
                <div class="word-info">
                  <span class="word-number">${number}.</span>
                  <span class="word-text">${item.word}</span>
                  <span class="word-level">${levelText}</span>
                </div>
                <span class="word-count">${item.count}</span>
              </div>
            `;
              })
              .join('');

            knownWordFrequencies.innerHTML = knownHtml;
          } else {
            knownWordFrequencies.innerHTML = '<p>No known words found.</p>';
          }

          // Display all unknown words
          const unknownWordFrequencies = document.getElementById('unknownWordFrequencies');
          if (unknownWords.length > 0) {
            const unknownHtml = unknownWords
              .map((item, index) => {
                const number = index + 1;
                return `
              <div class="word-frequency-item level-unknown">
                <div class="word-info">
                  <span class="word-number">${number}.</span>
                  <span class="word-text">${item.word}</span>
                  <span class="word-level">Unknown</span>
                </div>
                <span class="word-count">${item.count}</span>
              </div>
            `;
              })
              .join('');

            unknownWordFrequencies.innerHTML = unknownHtml;
          } else {
            unknownWordFrequencies.innerHTML = '<p>No unknown words found.</p>';
          }
        }

        wordAnalysis.style.display = 'block';
      }

      // Reset button
      submitButton.textContent = 'Process Text';
      submitButton.disabled = false;
    })
    .catch((error) => {
      console.error('Error processing text:', error);
      alert(`Error processing text: ${error.message}`);

      // Reset button
      submitButton.textContent = 'Process Text';
      submitButton.disabled = false;
    });
}

function goBackToDashboard() {
  // Redirect back to main dashboard
  window.location.href = '/';
}

function clearSavedText() {
  // Clear the textarea
  const textInput = document.getElementById('textInput');
  if (textInput) {
    textInput.value = '';
  }

  // Clear from localStorage
  localStorage.removeItem('uploadTextContent');

  // Clear any previous results
  document.getElementById('processingResult').style.display = 'none';
  document.getElementById('wordAnalysis').style.display = 'none';

  // Clear header counts
  document.getElementById('plainWordCount').textContent = '';
  document.getElementById('knownLevelWordCount').textContent = '';
  document.getElementById('unknownLevelWordCount').textContent = '';
}

function togglePlainFrequencies() {
  const content = document.getElementById('plainWordFrequencies');
  const toggleIcon = document.getElementById('plainToggleIcon');

  plainFrequenciesExpanded = !plainFrequenciesExpanded;

  if (plainFrequenciesExpanded) {
    content.classList.remove('collapsed');
    content.classList.add('expanded');
    toggleIcon.textContent = '▲';
    // Remove expand indicator when expanded
    const indicator = content.querySelector('.expand-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  } else {
    content.classList.remove('expanded');
    content.classList.add('collapsed');
    toggleIcon.textContent = '▼';
    // Show expand indicator when collapsed
    const indicator = content.querySelector('.expand-indicator');
    if (indicator) {
      indicator.style.display = 'block';
    }
  }
}
