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
  title: 'Habit Tracker'
};

const DAYS = ['Day One','Day Two','Day Three','Day Four','Day Five','Day Six','Day Seven'];

// DOM elements
const tbody = document.querySelector('#habit-table tbody');
const printBtn = document.getElementById('print-btn');
const resetBtn = document.getElementById('reset-btn');
const addRowBtn = document.getElementById('add-row-btn');
const titleDisplay = document.getElementById('title-display');

// ---- Init / localStorage ----
function loadState() {
  const saved = localStorage.getItem('habitTrackerState');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state = { ...state, ...parsed };
      if (state.habits === undefined || state.habits.length === 0) state.habits = initDefaultHabits();
      if (state.title === undefined) state.title = 'Habit Tracker';
      delete state.unselectedMode;
    } catch { state = initDefault(); }
  } else {
    state = initDefault();
  }
  applyTitle();
  renderTable();
  addSelectionHighlight();
}

function initDefault() {
  const habits = DEFAULT_HABITS.map(name => ({
    name,
    selected: [false, false, false, false, false, false, false]
  }));
  return { habits, title: 'Habit Tracker' };
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
      const cls = s ? 'cell-selected' : '';
      // No mark here - use CSS ::after instead to avoid double ticks
      cellsHTML += `<td class="day-cell ${cls}" data-row="${ridx}" data-col="${cid}" tabindex="0" role="button" aria-pressed="${s}" onclick="toggleCell(this, ${ridx}, ${cid})"></td>`;
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

// ---- Drag selection (event delegation: works after every re-render) ----
let dragStart = null;

tbody.addEventListener('mousedown', e => {
  const cell = e.target.closest('.day-cell');
  if (cell) {
    dragStart = { row: parseInt(cell.dataset.row), col: parseInt(cell.dataset.col) };
    cell.focus();
  }
});

tbody.addEventListener('mouseover', e => {
  if (!dragStart) return;
  const cell = e.target.closest('.day-cell');
  if (!cell) return;
  const endRow = parseInt(cell.dataset.row);
  const endCol = parseInt(cell.dataset.col);
  if (endRow === dragStart.row && endCol === dragStart.col) return;
  dragSelection(dragStart.row, dragStart.col, endRow, endCol);
});

document.addEventListener('mouseup', () => {
  dragStart = null;
});

// ---- Keyboard support (Space / Enter) ----
tbody.addEventListener('keydown', e => {
  const cell = e.target.closest('.day-cell');
  if (!cell || (e.key !== ' ' && e.key !== 'Enter')) return;
  e.preventDefault();
  toggleCell(cell, parseInt(cell.dataset.row), parseInt(cell.dataset.col));
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

// ---- Add selection highlight ----
// Re-applies the selected class so ticks stay green
function addSelectionHighlight() {
  document.querySelectorAll('#habit-table .day-cell').forEach(el => {
    const ridx = parseInt(el.dataset.row);
    const cid = parseInt(el.dataset.col);
    const s = state.habits[ridx]?.selected?.[cid] ?? false;
    el.classList.remove('cell-selected');
    if (s) {
      el.classList.add('cell-selected');
    }
  });
}

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