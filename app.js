const sessionStatus = document.querySelector('.session-status');
const startSessionBtn = document.getElementById('start-session');
const sessionForm = document.querySelector('.session-form');
const quickActions = document.querySelectorAll('.quick-actions .chip');
const stepForm = document.getElementById('step-form');
const stepInput = document.getElementById('step-input');
const stepList = document.querySelector('.step-list');
const stepTemplate = document.getElementById('step-template');
const clearStepsBtn = document.getElementById('clear-steps');
const resourceForm = document.getElementById('resource-form');
const resourceList = document.querySelector('.resource-list');
const resourceTemplate = document.getElementById('resource-template');
const suggestedResourceButtons = document.querySelectorAll('.suggested-resources .link-button');
const notesArea = document.getElementById('notes-area');
const recap = document.querySelector('.recap');
const exportNotesBtn = document.getElementById('export-notes');

const toasts = [];

function buildSessionSummary() {
  const helper = document.getElementById('helper-name').value.trim();
  const helpee = document.getElementById('helpee-name').value.trim();
  const goal = document.getElementById('session-goal').value.trim();
  const link = document.getElementById('meeting-link').value.trim();

  const parts = [];
  if (helper) parts.push(`${helper} is helping`);
  if (helpee) parts.push(helpee);
  if (goal) parts.push(`to ${goal.toLowerCase()}`);

  return {
    summary: parts.length ? `${parts.join(' ')}.` : 'Live coaching in progress.',
    link,
  };
}

startSessionBtn?.addEventListener('click', () => {
  const { summary, link } = buildSessionSummary();
  sessionStatus.textContent = summary;

  if (link) {
    sessionStatus.innerHTML = `${summary} <a href="${link}" target="_blank" rel="noopener">Join call</a>`;
  }

  flashMessage('Session started');
});

quickActions.forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    let message = 'Action logged.';

    switch (action) {
      case 'send-instructions':
        message = 'Prep checklist sent to helpee via text message.';
        break;
      case 'share-screen':
        message = 'Screen share request created.';
        break;
      case 'record-session':
        message = 'Recording reminder added to calendar.';
        break;
      case 'follow-up':
        message = 'Follow-up session scheduled for tomorrow.';
        break;
      default:
        break;
    }

    flashMessage(message);
    logRecap(message);
  });
});

stepForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = stepInput.value.trim();
  if (!value) return;

  const stepFragment = stepTemplate.content.cloneNode(true);
  const item = stepFragment.querySelector('.step-item');
  const checkbox = stepFragment.querySelector('input[type="checkbox"]');
  const text = stepFragment.querySelector('.step-text');
  const removeBtn = stepFragment.querySelector('.remove-step');

  text.textContent = value;

  checkbox.addEventListener('change', () => {
    item.classList.toggle('completed', checkbox.checked);
    const status = checkbox.checked ? 'completed' : 'reopened';
    logRecap(`Step "${value}" ${status}.`);
  });

  removeBtn.addEventListener('click', () => {
    item.remove();
    logRecap(`Step "${value}" removed.`);
  });

  stepList.appendChild(stepFragment);
  stepInput.value = '';
  stepInput.focus();
});

clearStepsBtn?.addEventListener('click', () => {
  stepList.innerHTML = '';
  logRecap('Cleared the guided steps.');
});

resourceForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = document.getElementById('resource-title').value.trim();
  const link = document.getElementById('resource-link').value.trim();
  if (!title || !link) return;

  addResource(title, link);
  resourceForm.reset();
  document.getElementById('resource-title').focus();
  flashMessage('Resource saved');
});

function addResource(title, link) {
  const resourceFragment = resourceTemplate.content.cloneNode(true);
  const item = resourceFragment.querySelector('.resource-item');
  const anchor = resourceFragment.querySelector('.resource-link');
  const removeBtn = resourceFragment.querySelector('.remove-resource');

  anchor.textContent = title;
  anchor.href = link;

  removeBtn.addEventListener('click', () => {
    item.remove();
    logRecap(`Removed resource "${title}".`);
  });

  resourceList.appendChild(resourceFragment);
}

suggestedResourceButtons.forEach((button) => {
  button.addEventListener('click', () => {
    addResource(button.textContent, button.dataset.url);
    flashMessage('Suggested resource added');
  });
});

notesArea?.addEventListener('input', () => {
  const count = notesArea.value.trim().split(/\s+/).filter(Boolean).length;
  recap.textContent = `Notes updated • ${count} words captured.`;
});

exportNotesBtn?.addEventListener('click', () => {
  const blob = new Blob([notesArea.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'helperhub-session-notes.txt';
  link.click();
  URL.revokeObjectURL(url);
  flashMessage('Notes exported');
});

function flashMessage(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function logRecap(message) {
  const entry = document.createElement('p');
  entry.textContent = `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — ${message}`;
  recap.prepend(entry);
}

// Seed demo data
(function seedDemoData() {
  document.getElementById('helper-name').value = 'You';
  document.getElementById('helpee-name').value = 'Auntie Mary';
  document.getElementById('session-goal').value = 'book her COVID booster at Walgreens';
  document.getElementById('meeting-link').value = 'https://zoom.us/j/123456789';

  ['Greet Mary and ask about her device', 'Check that she is on Wi-Fi', 'Guide her to open Walgreens site'].forEach((step) => {
    stepInput.value = step;
    stepForm.dispatchEvent(new Event('submit'));
  });

  addResource('Walgreens appointment page', 'https://www.walgreens.com/findcare/vaccination/covid-19');
  addResource('Zoom: share screen', 'https://support.zoom.us/hc/en-us/articles/201362153');

  notesArea.value = 'Mary prefers Safari. Needs a reminder to bring insurance card.';
  logRecap('Demo session loaded with starter steps and resources.');
})();
