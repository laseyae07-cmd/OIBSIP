const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');

let currentInput = '';

buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        const value = e.target.innerText;

        if (e.target.classList.contains('clear')) {
            currentInput = '';
            display.innerText = '0';
        } else if (e.target.classList.contains('backspace')) {
            currentInput = currentInput.slice(0, -1);
            display.innerText = currentInput || '0';
        } else if (e.target.classList.contains('equals')) {
            try {
                // Check for division by zero
                if (currentInput.includes('/0')) {
                    display.innerText = "Error";
                    currentInput = "";
                    return;
                }
                // Avoid using eval() in production, but parse logic here for arithmetic
                // A safer approach is writing a custom calculation parser
                currentInput = Function('"use strict";return (' + currentInput + ')')().toString();
                display.innerText = currentInput;
            } catch {
                display.innerText = "Error";
                currentInput = "";
            }
        } else {
            // Handle operator chaining and number inputs
            currentInput += value;
            display.innerText = currentInput;
        }
    });
});