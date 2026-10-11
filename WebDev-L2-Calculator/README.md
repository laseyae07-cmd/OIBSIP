# Simple Web Calculator

A web-based calculator built with plain HTML, CSS, and JavaScript.

## Features

* **Arithmetic**: addition, subtraction, multiplication (×), and division (÷), with correct precedence (`5 + 3 × 2 = 11`).
* **Operator chaining**: keep going from a result (`8 + 2 =` then `× 3 =`) or chain a whole expression before pressing `=`.
* **Display**: a main line for the current input/result and a small line showing the last completed expression.
* **Input controls**: `C` clears everything, `DEL` removes the last character.
* **Input validation**: one decimal point per number, no leading zeros (`007`), and repeated operators replace each other instead of stacking.
* **Error handling**: division by zero shows "Cannot divide by 0"; invalid or oversized results show a message instead of crashing. Any key after an error starts fresh.
* **Floating-point cleanup**: `0.1 + 0.2` shows `0.3`.
* **Keyboard support**: digits, `.`, `+ - * /`, `Enter` or `=` to calculate, `Backspace` to delete, `Esc` or `Delete` to clear.
* **Layout**: CSS Grid for the keypad, Flexbox to center the calculator.

## Technologies Used

* **HTML**: structure, with `data-*` attributes identifying each button's role (no inline `onclick`).
* **CSS**: dark theme; orange operators, red clear/delete, green equals.
* **JavaScript**: event listeners on every button plus a small recursive-descent parser. It does not use `eval()` or the `Function` constructor.

## Project Files

* `index.html`: display and button grid.
* `style.css`: layout and theme.
* `script.js`: input handling, parser, and error handling.

## How to Run

1. Clone this repository.
2. Open the project folder.
3. Open `index.html` in a browser.