// Notification system for daily French learning reminders

let reminderPermission = null;

// Request notification permission from user
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    reminderPermission = true;
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    reminderPermission = permission === 'granted';
    return reminderPermission;
  }

  reminderPermission = false;
  return false;
}

// Show the daily reminder notification
function showDailyReminder() {
  if (reminderPermission && Notification.permission === 'granted') {
    new Notification('🇫🇷 French Learning Reminder!', {
      body: 'Time for your daily French lesson! Keep your streak going!',
      icon: '/favicon.ico',
      tag: 'daily-lesson',
      requireInteraction: true,
    });
  }
}

// Check if we should show a reminder today
function checkDailyReminder() {
  const lastReminder = localStorage.getItem('lastReminderDate');
  const today = new Date().toDateString();

  if (lastReminder !== today) {
    showDailyReminder();
    localStorage.setItem('lastReminderDate', today);
  }
}

// Initialize the daily reminder system
function setupDailyReminders() {
  // Request permission on first visit
  requestNotificationPermission().then((hasPermission) => {
    if (hasPermission) {
      // Check if we should show reminder today
      checkDailyReminder();

      // Set up daily check (every hour)
      setInterval(checkDailyReminder, 60 * 60 * 1000);
    }
  });
}

// Add reminder button to dashboard
function addReminderButton() {
  const dashboard = document.getElementById('dashboard');
  if (!dashboard) return;

  const reminderBtn = document.createElement('button');
  reminderBtn.id = 'reminderBtn';
  reminderBtn.textContent = '🔔 Enable Daily Reminders';
  reminderBtn.className = 'btn btn-secondary';
  reminderBtn.onclick = async () => {
    const hasPermission = await requestNotificationPermission();
    if (hasPermission) {
      reminderBtn.textContent = '✅ Reminders Enabled';
      reminderBtn.disabled = true;
      checkDailyReminder();
    } else {
      alert(
        'Notifications are required for daily reminders. Please enable them in your browser settings.'
      );
    }
  };

  // Add to dashboard
  const levelActions = document.querySelector('.level-actions-right');
  if (levelActions) {
    levelActions.appendChild(reminderBtn);
  }
}

// Export functions for use in main app
window.notifications = {
  setupDailyReminders,
  addReminderButton,
  requestNotificationPermission,
  checkDailyReminder,
};
