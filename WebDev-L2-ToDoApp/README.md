# Task Manager (To-Do Web App)

A small to-do list built with HTML5, CSS3 and vanilla JavaScript. Tasks are split into **Pending** and **Completed** lists and survive page refreshes.

## Features
- Add tasks with the input field and the **Add Task** button (or press Enter)
- New tasks appear instantly in Pending Tasks
- **Mark Complete** moves a task to Completed; **Mark Pending** moves it back
- **Edit** changes the task text inline (Enter or Save to confirm, Esc or Cancel to discard)
- **Delete** permanently removes a task from either list
- Live counters: "X pending" and "Y completed"
- Timestamps showing when each task was added and completed
- Saved in `localStorage`, so tasks persist across refreshes
- Friendly empty-state messages for both lists
- Extras: "Clear all completed" button, input validation, mobile layout, keyboard focus styles

## Run it
Open `index.html` in any modern browser. No build step or dependencies.

## Files
| File | Purpose |
| --- | --- |
| `index.html` | Page structure |
| `style.css` | Styling |
| `script.js` | Task logic, rendering and storage |

## Notes
- Task text is inserted with `textContent`, so typed HTML is shown as text and never executed.
- Saved data is read defensively: corrupted or blocked storage will not break the app.