// Lesson Audio Controls - Text-to-Speech with Voice Selection

// Keep utterances array to prevent garbage collection (Chrome bug)
window.lessonUtterances = window.lessonUtterances || [];

let currentButton = null;
let currentUtterance = null;
let selectedEnglishVoice = null;
let selectedFrenchVoice = null;
let englishSpeed = 0.9;
let frenchSpeed = 0.9;
let voicesReady = false;
let isPaused = false;

// Load saved settings from localStorage
function loadSettings() {
  const savedEnVoice = localStorage.getItem('frenchLesson_enVoice');
  const savedFrVoice = localStorage.getItem('frenchLesson_frVoice');
  const savedEnSpeed = localStorage.getItem('frenchLesson_enSpeed');
  const savedFrSpeed = localStorage.getItem('frenchLesson_frSpeed');

  if (savedEnSpeed) englishSpeed = parseFloat(savedEnSpeed);
  if (savedFrSpeed) frenchSpeed = parseFloat(savedFrSpeed);

  return { savedEnVoice, savedFrVoice };
}

// Save settings to localStorage
function saveSettings() {
  if (selectedEnglishVoice) {
    localStorage.setItem('frenchLesson_enVoice', selectedEnglishVoice.name);
  }
  if (selectedFrenchVoice) {
    localStorage.setItem('frenchLesson_frVoice', selectedFrenchVoice.name);
  }
  localStorage.setItem('frenchLesson_enSpeed', englishSpeed);
  localStorage.setItem('frenchLesson_frSpeed', frenchSpeed);
}

// Populate voice dropdowns
function populateVoiceSelectors() {
  const voices = speechSynthesis.getVoices();
  const { savedEnVoice, savedFrVoice } = loadSettings();

  const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
  const frenchVoices = voices.filter((v) => v.lang.startsWith('fr'));

  // Populate English voice selector
  const enSelect = document.getElementById('english-voice');
  if (enSelect) {
    enSelect.innerHTML = '';
    englishVoices.forEach((voice, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${voice.name} (${voice.lang})`;

      // Check saved voice or default to Google
      if (
        (savedEnVoice && voice.name === savedEnVoice) ||
        (!savedEnVoice && voice.name.includes('Google') && voice.lang === 'en-US')
      ) {
        option.selected = true;
        selectedEnglishVoice = voice;
      }
      enSelect.appendChild(option);
    });

    if (!selectedEnglishVoice && englishVoices.length > 0) {
      selectedEnglishVoice = englishVoices[0];
      enSelect.selectedIndex = 0;
    }

    enSelect.addEventListener('change', (e) => {
      selectedEnglishVoice = englishVoices[e.target.value];
      saveSettings();
    });
  }

  // Populate French voice selector
  const frSelect = document.getElementById('french-voice');
  if (frSelect) {
    frSelect.innerHTML = '';
    frenchVoices.forEach((voice, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${voice.name} (${voice.lang})`;

      // Check saved voice or default to Google
      if (
        (savedFrVoice && voice.name === savedFrVoice) ||
        (!savedFrVoice && voice.name.includes('Google') && voice.lang === 'fr-FR')
      ) {
        option.selected = true;
        selectedFrenchVoice = voice;
      }
      frSelect.appendChild(option);
    });

    if (!selectedFrenchVoice && frenchVoices.length > 0) {
      selectedFrenchVoice = frenchVoices[0];
      frSelect.selectedIndex = 0;
    }

    frSelect.addEventListener('change', (e) => {
      selectedFrenchVoice = frenchVoices[e.target.value];
      saveSettings();
    });
  }

  // Set up speed controls
  const enSpeedSlider = document.getElementById('english-speed');
  const enSpeedValue = document.getElementById('english-speed-value');
  if (enSpeedSlider) {
    enSpeedSlider.value = englishSpeed;
    if (enSpeedValue) enSpeedValue.textContent = englishSpeed.toFixed(1) + 'x';

    enSpeedSlider.addEventListener('input', (e) => {
      englishSpeed = parseFloat(e.target.value);
      if (enSpeedValue) enSpeedValue.textContent = englishSpeed.toFixed(1) + 'x';
      saveSettings();
    });
  }

  const frSpeedSlider = document.getElementById('french-speed');
  const frSpeedValue = document.getElementById('french-speed-value');
  if (frSpeedSlider) {
    frSpeedSlider.value = frenchSpeed;
    if (frSpeedValue) frSpeedValue.textContent = frenchSpeed.toFixed(1) + 'x';

    frSpeedSlider.addEventListener('input', (e) => {
      frenchSpeed = parseFloat(e.target.value);
      if (frSpeedValue) frSpeedValue.textContent = frenchSpeed.toFixed(1) + 'x';
      saveSettings();
    });
  }
}

// Load voices - Chrome loads them asynchronously
function loadVoices() {
  const voices = speechSynthesis.getVoices();
  if (voices.length > 0 && !voicesReady) {
    // Make sure the HTML is loaded first
    const enSelect = document.getElementById('english-voice');
    if (enSelect) {
      populateVoiceSelectors();
      voicesReady = true;
    } else {
      // HTML not loaded yet, retry
      setTimeout(loadVoices, 100);
    }
  }
}

// Set up voice loading
if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices(); // Try loading immediately
}

function getVoice(lang) {
  if (lang === 'fr') {
    return selectedFrenchVoice || speechSynthesis.getVoices().find((v) => v.lang.startsWith('fr'));
  }
  return selectedEnglishVoice || speechSynthesis.getVoices().find((v) => v.lang.startsWith('en'));
}

function playSection(button, sectionId) {
  // Wait for voices to be ready with single retry
  if (!voicesReady) {
    button.disabled = true;
    setTimeout(() => {
      button.disabled = false;
      if (voicesReady) {
        playSection(button, sectionId);
      }
    }, 500);
    return;
  }

  const section = document.querySelector(`[data-section="${sectionId}"]`);
  if (!section) return;

  // Get the section header to include title
  const sectionContainer = section.closest('.section');
  const titleElement = sectionContainer ? sectionContainer.querySelector('.section-title') : null;

  const lang = section.getAttribute('data-lang');

  // If already playing this section, pause/resume it
  if (currentButton === button) {
    console.log('Same button clicked. State:', {
      speaking: speechSynthesis.speaking,
      paused: speechSynthesis.paused,
      isPaused: isPaused,
      pending: speechSynthesis.pending,
    });

    if (isPaused) {
      // Currently paused - resume it
      console.log('Resuming speech');
      speechSynthesis.resume();
      isPaused = false;
      button.textContent = '⏸';
      button.classList.add('playing');
      return;
    } else if (speechSynthesis.speaking) {
      // Currently playing - pause it
      console.log('Pausing speech');
      speechSynthesis.pause();
      isPaused = true;
      button.textContent = '▶';
      button.classList.remove('playing');
      return;
    } else {
      // Speech ended - will restart below
      console.log('Speech ended, restarting');
      speechSynthesis.cancel();
      currentButton = null;
      currentUtterance = null;
      isPaused = false;
    }
  }

  // Stop any other current playback
  if (currentButton && currentButton !== button) {
    speechSynthesis.cancel();
    currentButton.textContent = '▶';
    currentButton.classList.remove('playing');
    currentButton = null;
    currentUtterance = null;
    isPaused = false;
  }

  // Update button state immediately
  button.textContent = '⏸';
  button.classList.add('playing');
  currentButton = button;
  isPaused = false;

  // Read title first if it exists, then content
  if (titleElement && lang === 'mixed') {
    // For mixed content, read title in English, then process mixed content
    const titleText = titleElement.textContent.replace(/[▶⏸📖🎯📚🌍🎵]/g, '').trim();
    const titleUtterance = createUtterance(titleText, 'en');

    titleUtterance.onend = () => {
      speakMixedContent(section, button);
    };

    titleUtterance.onerror = () => {
      button.textContent = '▶';
      button.classList.remove('playing');
      currentButton = null;
      currentUtterance = null;
    };

    currentUtterance = titleUtterance;
    speechSynthesis.speak(titleUtterance);
  } else if (titleElement) {
    // Single language - read title then content
    const titleText = titleElement.textContent.replace(/[▶⏸📖🎯📚🌍🎵]/g, '').trim();
    let contentText = section.innerText || section.textContent;
    contentText = contentText.replace(/[▶⏸]/g, '').replace(/📖|🎯|📚|🌍|🎵/g, '');

    const fullText = titleText + '. ' + contentText;
    speakSingleLanguage(fullText, lang, button);
  } else {
    // No title - just handle content
    if (lang === 'mixed') {
      speakMixedContent(section, button);
    } else {
      let textToRead = section.innerText || section.textContent;
      textToRead = textToRead.replace(/[▶⏸]/g, '').replace(/📖|🎯|📚|🌍|🎵/g, '');

      if (!textToRead || textToRead.trim().length === 0) return;

      speakSingleLanguage(textToRead, lang, button);
    }
  }
}

// Speak mixed language content by reading span lang attributes
function speakMixedContent(contentElement, button) {
  const utterances = [];

  // Get all text nodes and their language context
  const textSegments = [];

  function extractTextWithLanguage(element, currentLang = 'en') {
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.replace(/[▶⏸📖🎯📚🌍🎵]/g, '').trim();
        if (text.length > 0) {
          textSegments.push({ text, lang: currentLang });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Skip elements with no-speak class
        if (node.classList && node.classList.contains('no-speak')) {
          continue;
        }
        // Check if this element has a lang attribute
        const nodeLang = node.getAttribute('lang') || currentLang;
        extractTextWithLanguage(node, nodeLang);
      }
    }
  }

  extractTextWithLanguage(contentElement);

  // Create utterances for each text segment
  for (const segment of textSegments) {
    if (segment.text.length > 0) {
      const utterance = createUtterance(segment.text, segment.lang);
      utterances.push(utterance);
    }
  }

  if (utterances.length === 0) {
    button.textContent = '▶';
    button.classList.remove('playing');
    currentButton = null;
    currentUtterance = null;
    return;
  }

  // Chain utterances together
  let currentIndex = 0;

  const speakNext = () => {
    if (currentIndex >= utterances.length) {
      button.textContent = '▶';
      button.classList.remove('playing');
      currentButton = null;
      currentUtterance = null;
      return;
    }

    const utterance = utterances[currentIndex++];
    currentUtterance = utterance;

    utterance.onend = speakNext;
    utterance.onerror = () => {
      button.textContent = '▶';
      button.classList.remove('playing');
      currentButton = null;
      currentUtterance = null;
      isPaused = false;
    };

    speechSynthesis.speak(utterance);
  };

  speakNext();
}

// Create a speech utterance with proper voice
function createUtterance(text, lang) {
  const utterance = new SpeechSynthesisUtterance(text);
  window.lessonUtterances.push(utterance);

  const isFrench = lang === 'fr' || lang === 'fr-FR';
  const voice = getVoice(isFrench ? 'fr' : 'en');
  if (voice) utterance.voice = voice;

  utterance.lang = isFrench ? 'fr-FR' : 'en-US';
  utterance.rate = isFrench ? frenchSpeed : englishSpeed;
  utterance.pitch = 1;
  utterance.volume = 1.0;

  return utterance;
}

// Speak single language content
function speakSingleLanguage(text, lang, button) {
  const utterance = createUtterance(text, lang);
  currentUtterance = utterance;

  // Handle end of speech
  utterance.onend = () => {
    button.textContent = '▶';
    button.classList.remove('playing');
    currentButton = null;
    currentUtterance = null;
    isPaused = false;
  };

  utterance.onerror = () => {
    button.textContent = '▶';
    button.classList.remove('playing');
    currentButton = null;
    currentUtterance = null;
    isPaused = false;
  };

  // Keep array size manageable
  if (window.lessonUtterances.length > 10) {
    window.lessonUtterances.shift();
  }

  speechSynthesis.speak(utterance);
}

// Spacebar control
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !e.target.matches('input, textarea, select')) {
    e.preventDefault();
    if (currentButton) {
      currentButton.click();
    }
  }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  speechSynthesis.cancel();
});

// Initialize settings on load
window.addEventListener('DOMContentLoaded', async () => {
  await loadSettingsPanel();
  loadSettings();
});

// Load settings panel HTML
async function loadSettingsPanel() {
  const voiceControls = document.querySelector('.voice-controls');
  if (!voiceControls) return;

  try {
    const response = await fetch('settings_panel.html');
    const html = await response.text();
    voiceControls.innerHTML = html;
  } catch (error) {
    console.error('Failed to load settings panel:', error);
  }
}

function toggleSettings() {
  console.log('Toggling audio settings panel');
  const panel = document.getElementById('audio-settings-panel');
  console.log('Panel element:', panel);

  const button = document.getElementById('settings-toggle-btn');
  if (panel && button) {
    panel.classList.toggle('open');
    button.textContent = panel.classList.contains('open')
      ? '▲ Hide Audio Settings'
      : '▼ Show Audio Settings';
    panel.style.display = panel.classList.contains('open') ? 'block' : 'none';
  }
}
