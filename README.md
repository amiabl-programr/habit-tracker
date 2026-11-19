# Habit Tracker Print App

A single-file (now split into HTML/CSS/JS), interactive habit tracking table that displays a 7-day habit tracker. Mark cells, edit rows, and print as PDF.

## Features

### Default Table
- 14 habits across 7 days (Day One through Day Seven)
- Default row 1 (Read 10+ pages) has Day One marked as ✔️

### Core Functionality
- **Cell selection**: Click to toggle ✔️ (selected) or drag to multi-select
- **Blank/Red toggle**: Switch between empty unselected cells or red ❌ marks
- **Add/delete rows**: Add new habits, delete with undo option
- **Print to PDF**: Landscape A4, hides controls, fits on one page
- **State persistence**: localStorage saves habits, selections, and settings
- **Reset to default**: Restores original 14×7 table with confirm prompt

### Design
- Clean, minimal, readable layout
- Habit column wider (220px); day columns equal (40px, centered)
- Horizontal scroll on mobile/responsive screens
- Accessible: keyboard-focusable cells, `aria-pressed`, focus-visible styles
- Print colors with `-webkit-print-color-adjust: exact`

### File Structure
```
habit-tracker/
├── index.html          ← HTML structure, links to CSS/JS
├── styles/
│   └── style.css       ← All CSS (variables, table, print, focus, button animation)
└── scripts/
    └── script.js       ← All JS (state, localStorage, handlers, render)
```

## Usage

1. **Mark habits**: Click day cells to toggle ✔️ selection. Click and drag for multi-select.
2. **Toggle view**: Click "Unselected cells: Blank" or "Unselected cells: Red" to change how unselected cells appear.
3. **Add row**: Click the "Add row" button to add a new habit.
4. **Delete row**: Click the × button on any row to delete it (undo available).
5. **Print**: Click "Print / Save as PDF" to open browser print dialog. Controls hide automatically, table prints in landscape A4.
6. **Reset**: Click "Reset to default" and confirm to restore the original table.

## Keyboard Shortcuts
- Cells are focusable (Tab key). Space or Enter toggles selection.
- Toggle buttons can be focused and activated with Space/Enter.

## Acceptance Checklist
- [ ] Loads with the default table exactly as specified
- [ ] Cells toggle selected/unselected by click and drag
- [ ] Blank/Red toggle changes unselected cells on screen and in print
- [ ] Rows can be added, renamed, and deleted
- [ ] Print output hides all controls and fits one landscape page
- [ ] State survives page refresh
- [ ] Reset to default works