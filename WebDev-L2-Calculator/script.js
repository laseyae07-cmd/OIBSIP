// Calculator logic.
// Expressions are evaluated by a small recursive-descent parser (no eval() or
// Function()), so × and ÷ are applied before + and −: 5 + 3 × 2 = 11.

const display = document.getElementById('display');
const expressionLine = document.getElementById('expression');
const buttons = document.querySelectorAll('.btn');

const SYMBOLS = { '+': '+', '-': '−', '*': '×', '/': '÷' };
const OPERATORS = Object.keys(SYMBOLS);
const MAX_RESULT = 1e15;

let expression = '';        // internal form, e.g. "5+3*2"
let justEvaluated = false;  // true right after "=" so the next digit starts fresh
let hasError = false;

const isOperator = (ch) => OPERATORS.includes(ch);

// ---------- Display ----------

// "5+3*2" -> "5 + 3 × 2" (a leading minus stays attached: "−5 + 3")
function pretty(expr) {
    return [...expr].map((ch, i) => {
        if (!isOperator(ch)) return ch;
        return i === 0 ? SYMBOLS[ch] : ` ${SYMBOLS[ch]} `;
    }).join('');
}

function render() {
    display.classList.remove('error');
    display.textContent = expression ? pretty(expression) : '0';
    display.classList.toggle('small', display.textContent.length > 12);
}

function showError(message) {
    hasError = true;
    justEvaluated = false;
    expression = '';
    expressionLine.textContent = '';
    display.textContent = message;
    display.classList.add('error', 'small');
}

// ---------- State helpers ----------

function startFresh() {
    expression = '';
    justEvaluated = false;
    hasError = false;
    expressionLine.textContent = '';
}

// Any new input after an error or a finished calculation begins clean.
function resetIfError() {
    if (hasError) startFresh();
}

// The number currently being typed (digits and dot at the end of the expression)
function currentNumber() {
    return expression.match(/[\d.]*$/)[0];
}

// ---------- Input handlers ----------

function inputDigit(digit) {
    resetIfError();
    if (justEvaluated) startFresh();

    // Replace a lone leading zero so "05" never happens
    if (currentNumber() === '0') expression = expression.slice(0, -1);
    expression += digit;
    render();
}

function inputDecimal() {
    resetIfError();
    if (justEvaluated) startFresh();

    const number = currentNumber();
    if (number.includes('.')) return;           // only one dot per number
    expression += number === '' ? '0.' : '.';
    render();
}

function inputOperator(op) {
    resetIfError();
    if (justEvaluated) {                        // keep chaining from the result
        justEvaluated = false;
        expressionLine.textContent = '';
    }

    if (expression === '') {
        expression = op === '-' ? '-' : '0' + op;   // allow a negative start
    } else if (expression === '-') {
        return;
    } else if (isOperator(expression.slice(-1))) {
        expression = expression.slice(0, -1) + op;  // swap operator, never stack them
    } else {
        expression += op;
    }
    render();
}

function deleteLast() {
    if (hasError) {
        startFresh();
    } else {
        if (justEvaluated) {
            justEvaluated = false;
            expressionLine.textContent = '';
        }
        expression = expression.slice(0, -1);
    }
    render();
}

function clearAll() {
    startFresh();
    render();
}

function evaluate() {
    if (hasError) { clearAll(); return; }
    if (expression === '' || justEvaluated) return;

    // Ignore a dangling operator: "5+" evaluates as "5"
    let expr = expression;
    while (expr && isOperator(expr.slice(-1))) expr = expr.slice(0, -1);
    if (expr === '') return;

    try {
        const result = calculate(expr);
        if (!Number.isFinite(result) || Math.abs(result) >= MAX_RESULT) {
            throw new Error('Result too large');
        }
        expressionLine.textContent = pretty(expr) + ' =';
        expression = formatResult(result);
        justEvaluated = true;
        render();
    } catch (err) {
        showError(err.message);
    }
}

// ---------- Math ----------

// Trims floating-point noise: 0.1 + 0.2 -> "0.3"
function formatResult(n) {
    let s = Number(n.toPrecision(15)).toString();
    if (s.includes('e')) {                       // very small numbers
        s = n.toFixed(12).replace(/0+$/, '').replace(/\.$/, '');
    }
    return s;
}

// expression := term (('+' | '-') term)*
// term       := factor (('*' | '/') factor)*
// factor     := '-' factor | number
function calculate(expr) {
    const tokens = expr.match(/\d+\.?\d*|\.\d+|[+\-*/]/g);
    if (!tokens) throw new Error('Invalid expression');

    let pos = 0;
    const peek = () => tokens[pos];
    const next = () => tokens[pos++];

    function parseFactor() {
        const token = next();
        if (token === '-') return -parseFactor();
        if (token === undefined || isOperator(token)) throw new Error('Invalid expression');
        return parseFloat(token);
    }

    function parseTerm() {
        let value = parseFactor();
        while (peek() === '*' || peek() === '/') {
            const op = next();
            const right = parseFactor();
            if (op === '/' && right === 0) throw new Error('Cannot divide by 0');
            value = op === '*' ? value * right : value / right;
        }
        return value;
    }

    function parseExpression() {
        let value = parseTerm();
        while (peek() === '+' || peek() === '-') {
            const op = next();
            const right = parseTerm();
            value = op === '+' ? value + right : value - right;
        }
        return value;
    }

    const result = parseExpression();
    if (pos < tokens.length) throw new Error('Invalid expression');
    return result;
}

// ---------- Event listeners ----------

buttons.forEach((button) => {
    button.addEventListener('click', () => {
        const { number, operator, action } = button.dataset;

        if (number !== undefined) inputDigit(number);
        else if (operator !== undefined) inputOperator(operator);
        else if (action === 'decimal') inputDecimal();
        else if (action === 'equals') evaluate();
        else if (action === 'delete') deleteLast();
        else if (action === 'clear') clearAll();
    });
});

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const key = e.key;

    if (/^\d$/.test(key)) inputDigit(key);
    else if (key === '.') inputDecimal();
    else if (isOperator(key)) inputOperator(key);
    else if (key === 'Enter' || key === '=') evaluate();
    else if (key === 'Backspace') deleteLast();
    else if (key === 'Escape' || key === 'Delete') clearAll();
    else return;

    e.preventDefault(); // stops "/" quick-find and Enter re-clicking a focused button
});

render();