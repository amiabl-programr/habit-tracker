// ---- State ----
const DEFAULT_HABITS = [
  'Read 10+ pages',
  'Pray one hour daily',
  'Give 2+ hour to learning a skill',
  'Wake up by 5:00 am',
  'Drink 3 litters of water',
  'Eat clean - no junks',
  'Take hard decisions',
  'Daily Journaling',
  'No phone first hour',
  'Bible Reading',
  'No soda or sugar',
  'Walk - brisk',
  'Reach out to 1+ person daily to check up',
  'Sit still for 15 minutes'
];

let state = {
  habits: [],
  unselectedMode: 'blank',
  title: 'Habit Tracker'
};

const DAYS = ['Day One','Day Two','Day Three','Day Four','Day Five','Day Six','Day Seven'];

// DOM elements
const tbody = document.querySelector('#habit-table tbody');
const printBtn = document.getElementById('print-btn');
const resetBtn = document.getElementById('reset-btn');
const addRowBtn = document.getElementById('add-row-btn');
const ublankToggle = document.getElementById('ublank-toggle');
const uredToggle = document.getElementById('ured-toggle');
const titleDisplay = document.getElementById('title-display');

// ---- Init / localStorage ----
function loadState() {
  const saved = localStorage.getItem('habitTrackerState');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state = { ...state, ...parsed };
      if (state.habits === undefined || state.habits.length === 0) state.habits = initDefaultHabits();
      if (state.unselectedMode === undefined) state.unselectedMode = 'blank';
      if (state.title === undefined) state.title = 'Habit Tracker';
    } catch { state = initDefault(); }
  } else {
    state = initDefault();
  }
  applyTitle();
  updateToggleUI();
  renderTable();
  addSelectionHighlight();
}

function initDefault() {
  const habits = DEFAULT_HABITS.map(name => ({
    name,
    selected: [false, false, false, false, false, false, false]
  }));
  return { habits, unselectedMode: 'blank', title: 'Habit Tracker' };
}

function initDefaultHabits() {
  return DEFAULT_HABITS.map(name => ({
    name,
    selected: [false, false, false, false, false, false, false]
  }));
}

function saveState() {
  localStorage.setItem('habitTrackerState', JSON.stringify(state));
}

// ---- Title handling ----
function toggleTitleMode() {
  titleDisplay.classList.toggle('editing');
}
function applyTitle() {
  document.getElementById('title-view-text').textContent = state.title;
}

// ---- Render table ----
function renderTable() {
  // build header
  let theadHTML = '<tr><th class="habit-col">Habits</th>';
  DAYS.forEach(d => theadHTML += `<th class="day-cell" data-day="${d}">${d}</th>`);
  theadHTML += '</tr>';
  document.querySelector('#habit-table thead').innerHTML = theadHTML;

  // build rows
  let tbodyHTML = '';
  state.habits.forEach((h, ridx) => {
    // Build day cells - no mark in innerHTML, rely on CSS ::after
    let cellsHTML = '';
    h.selected.forEach((s, cid) => {
      const cls = s ? 'cell-selected' : (state.unselectedMode === 'red' ? 'cell-unred' : '');
      // No mark here - use CSS ::after instead to avoid double ticks
      cellsHTML += `<td class="day-cell ${cls}" data-row="${ridx}" data-col="${cid}" tabindex="0" role="button" aria-pressed="${s}"></td>`;
    });
    // Habit cell with delete button
    tbodyHTML += `<tr>
      <td class="habit-cell habit-col" contenteditable="true" onblur="saveHabitName(this, ${ridx})" onkeypress="if(event.key==='Enter'){event.preventDefault();saveHabitName(this,${ridx})}">${h.name} <button class="btn btn-danger btn-sm" onclick="deleteRow(${ridx})">×</button></td>`;
    tbodyHTML += cellsHTML;
    tbodyHTML += `</tr>`;
  });
  tbody.innerHTML = tbodyHTML;
  addSelectionHighlight();
  saveState();
}

// ---- Cell toggle ----
function toggleCell(el, ridx, cid) {
  if (!el.classList.contains('day-cell')) return;
  // If the clicked element has a button child (delete button), don't toggle
  if (el.querySelector('button')) return;
  state.habits[ridx].selected[cid] = !state.habits[ridx].selected[cid];
  renderTable();
  addSelectionHighlight();
}

// ---- Drag selection ----
let dragStart = null;
document.querySelectorAll('#habit-table .day-cell').forEach(el => {
  el.addEventListener('mousedown', e => {
    if (e.target.classList.contains('day-cell')) {
      dragStart = { row: parseInt(e.target.dataset.row), col: parseInt(e.target.dataset.col) };
      e.target.focus();
    }
  });
});

document.addEventListener('mouseup', e => {
  if (dragStart) {
    const target = e.target.closest('.day-cell');
    const endRow = parseInt(target?.dataset.row ?? dragStart.row);
    const endCol = parseInt(target?.dataset.col ?? dragStart.col);
    dragSelection(dragStart.row, dragStart.col, endRow, endCol);
    dragStart = null;
  }
});

function dragSelection(r1, c1, r2, c2) {
  const minRow = Math.min(r1, r2), maxRow = Math.max(r1, r2);
  const minCol = Math.min(c1, c2), maxCol = Math.max(c1, c2);
  for (let r = minRow; r <= maxRow; r++) {
    if (!state.habits[r]) continue;
    for (let c = minCol; c <= maxCol; c++) {
      if (state.habits[r] && state.habits[r].selected.length > c) {
        state.habits[r].selected[c] = true;
      }
    }
  }
  renderTable();
  addSelectionHighlight();
}

// ---- Select all / Clear all ----
function selectAll() {
  state.habits.forEach(h => h.selected = [true, true, true, true, true, true, true]);
  renderTable();
  addSelectionHighlight();
}
function clearAll() {
  state.habits.forEach(h => h.selected = [false, false, false, false, false, false, false]);
  renderTable();
  addSelectionHighlight();
}

// ---- Unselected mode toggle ----
function setUnselectedMode(mode) {
  state.unselectedMode = mode;
  renderTable();
  updateToggleUI();
  saveState();
}

function updateToggleUI() {
  if (state.unselectedMode === 'red') {
    uredToggle.classList.add('active');
    uredToggle.classList.remove('inactive');
    uredToggle.setAttribute('aria-pressed', 'true');
    ublankToggle.classList.remove('active');
    ublankToggle.classList.add('inactive');
    ublankToggle.setAttribute('aria-pressed', 'false');
  } else {
    ublankToggle.classList.add('active');
    ublankToggle.classList.remove('inactive');
    ublankToggle.setAttribute('aria-pressed', 'true');
    uredToggle.classList.remove('active');
    uredToggle.classList.add('inactive');
    uredToggle.setAttribute('aria-pressed', 'false');
  }
}

// ---- Add row ----
function addRow() {
  state.habits.push({
    name: 'New habit',
    selected: [false, false, false, false, false, false, false]
  });
  renderTable();
  addSelectionHighlight();
  saveState();
}

// ---- Delete row with undo ----
let lastDeleted = null;
function deleteRow(ridx) {
  lastDeleted = { ...state.habits[ridx], ridx };
  state.habits.splice(ridx, 1);
  renderTable();
  addSelectionHighlight();
  saveState();
  showUndo();
}
function showUndo() {
  if (!lastDeleted) return;
  const btn = document.createElement('button');
  btn.textContent = 'Undo';
  btn.style.cssText = 'position:fixed; top:20px; left:20px; padding:6px 12px; background:#fff; border:1px solid #dee2e6; z-index:9999;';
  btn.onclick = () => {
    state.habits.splice(lastDeleted.ridx, 0, lastDeleted);
    renderTable();
    addSelectionHighlight();
    saveState();
    document.body.removeChild(btn);
    lastDeleted = null;
  };
  document.body.appendChild(btn);
  setTimeout(() => { document.body.removeChild(btn); lastDeleted = null; }, 5000);
}

// ---- Save habit name inline ----
function saveHabitName(el, ridx) {
  const name = el.textContent.trim().replace(/<button[^>]*>×<\/button>/, '').trim();
  if (name && name !== state.habits[ridx].name) {
    state.habits[ridx].name = name;
    renderTable();
    saveState();
  }
}

// ---- Unselected mode toggles ----
ublankToggle.addEventListener('click', () => {
  setUnselectedMode('blank');
});

uredToggle.addEventListener('click', () => {
  setUnselectedMode('red');
});

// ---- Print ----
printBtn.addEventListener('click', () => {
  window.print();
});

// ---- Reset to default ----
resetBtn.addEventListener('click', () => {
  if (confirm('Reset to default habits?')) {
    state = initDefault();
    renderTable();
    addSelectionHighlight();
    saveState();
  }
});

// ---- Init ----
loadState();