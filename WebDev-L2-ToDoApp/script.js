// ---------- DOM references ----------
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const formError = document.getElementById('form-error');
const pendingList = document.getElementById('pending-list');
const completedList = document.getElementById('completed-list');
const pendingCount = document.getElementById('pending-count');
const completedCount = document.getElementById('completed-count');
const pendingEmpty = document.getElementById('pending-empty');
const completedEmpty = document.getElementById('completed-empty');
const clearCompletedBtn = document.getElementById('clear-completed');
const progressFill = document.getElementById('progress-fill');
const progressLabel = document.getElementById('progress-label');
const progressBar = document.querySelector('.bar');
const todayEl = document.getElementById('today');

const STORAGE_KEY = 'tasks';

// ---------- State ----------
let tasks = loadTasks();
let editingId = null; // id of the task currently being edited inline
let justAddedId = null; // used to animate a newly added task

// ---------- Storage ----------
function loadTasks() {
    try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (!Array.isArray(raw)) return [];
        // Normalise tasks (also upgrades the older format that stored a single "timestamp" string)
        return raw
            .filter(t => t && typeof t.text === 'string')
            .map(t => ({
                id: t.id ?? Date.now() + Math.random(),
                text: t.text,
                completed: Boolean(t.completed),
                createdAt: t.createdAt ?? (typeof t.id === 'number' ? t.id : Date.now()),
                completedAt: t.completedAt ?? null
            }));
    } catch (err) {
        // Corrupted data or storage blocked: start fresh instead of breaking the app
        console.warn('Could not read saved tasks:', err);
        return [];
    }
}

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
        console.warn('Could not save tasks:', err);
    }
}

function update() {
    saveTasks();
    renderTasks();
}

// ---------- Helpers ----------
function formatTime(ms) {
    return new Date(ms).toLocaleString([], {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: 'numeric', minute: '2-digit'
    });
}

function makeButton(label, className, action, id) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = className;
    btn.textContent = label;
    btn.dataset.action = action;
    btn.dataset.id = id;
    return btn;
}

// ---------- Rendering ----------
const CHECK_SVG = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8"/></svg>';

function buildTaskItem(task) {
    const li = document.createElement('li');
    if (task.completed) li.classList.add('completed');
    if (task.id === justAddedId) li.classList.add('enter');

    const content = document.createElement('div');
    content.className = 'task-content';
    const actions = document.createElement('div');
    actions.className = 'task-actions';

    if (task.id === editingId) {
        // Inline edit mode
        li.classList.add('editing');
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'edit-input';
        input.value = task.text;
        input.maxLength = 200;
        input.setAttribute('aria-label', 'Edit task text');
        input.dataset.editFor = task.id;
        content.appendChild(input);

        actions.append(
            makeButton('Save', 'btn-complete', 'save-edit', task.id),
            makeButton('Cancel', 'btn-cancel', 'cancel-edit', task.id)
        );
        li.append(content, actions);
        return li;
    }

    // Round check button = the Mark Complete / Mark Pending toggle
    const label = task.completed ? 'Mark Pending' : 'Mark Complete';
    const check = document.createElement('button');
    check.type = 'button';
    check.className = 'check';
    check.dataset.action = 'toggle';
    check.dataset.id = task.id;
    check.setAttribute('aria-label', label);
    check.title = label;
    check.innerHTML = CHECK_SVG; // static markup, no user input

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text; // textContent prevents HTML injection

    const time = document.createElement('span');
    time.className = 'task-time';
    time.textContent = task.completed && task.completedAt
        ? `Added ${formatTime(task.createdAt)} · Completed ${formatTime(task.completedAt)}`
        : `Added ${formatTime(task.createdAt)}`;

    content.append(text, time);

    if (!task.completed) {
        actions.appendChild(makeButton('Edit', 'btn-edit', 'edit', task.id));
    }
    actions.appendChild(makeButton('Delete', 'btn-delete', 'delete', task.id));

    li.append(check, content, actions);
    return li;
}

function renderTasks() {
    pendingList.replaceChildren();
    completedList.replaceChildren();

    let pCount = 0;
    let cCount = 0;

    tasks.forEach(task => {
        if (task.completed) {
            completedList.appendChild(buildTaskItem(task));
            cCount++;
        } else {
            pendingList.appendChild(buildTaskItem(task));
            pCount++;
        }
    });

    pendingCount.textContent = `${pCount} pending`;
    completedCount.textContent = `${cCount} completed`;

    pendingEmpty.style.display = pCount === 0 ? 'block' : 'none';
    completedEmpty.style.display = cCount === 0 ? 'block' : 'none';
    clearCompletedBtn.hidden = cCount === 0;

    // Progress summary in the header
    const total = pCount + cCount;
    const pct = total === 0 ? 0 : Math.round((cCount / total) * 100);
    progressLabel.textContent = `${cCount} of ${total} done`;
    progressFill.style.width = `${pct}%`;
    progressBar.setAttribute('aria-valuenow', pct);

    justAddedId = null;

    // Put the cursor in the edit box when editing starts
    if (editingId !== null) {
        const box = document.querySelector('.edit-input');
        if (box) {
            box.focus();
            box.setSelectionRange(box.value.length, box.value.length);
        }
    }
}

// ---------- Actions ----------
function addTask(text) {
    const id = Date.now() + Math.random();
    justAddedId = id;
    tasks.push({
        id,
        text,
        completed: false,
        createdAt: Date.now(),
        completedAt: null
    });
    update();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    task.completedAt = task.completed ? Date.now() : null; // createdAt is never overwritten
    update();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    if (editingId === id) editingId = null;
    update();
}

function startEdit(id) {
    editingId = id;
    renderTasks();
}

function saveEdit(id) {
    const box = document.querySelector('.edit-input');
    const newText = box ? box.value.trim() : '';
    if (newText === '') {
        box.classList.add('invalid');
        box.focus();
        return;
    }
    const task = tasks.find(t => t.id === id);
    if (task) task.text = newText;
    editingId = null;
    update();
}

function cancelEdit() {
    editingId = null;
    renderTasks();
}

// ---------- Events ----------
// Add a task (the form handles both the button click and the Enter key)
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (text === '') {
        formError.hidden = false;
        taskInput.focus();
        return;
    }
    formError.hidden = true;
    addTask(text);
    taskInput.value = '';
    taskInput.focus();
});

taskInput.addEventListener('input', () => { formError.hidden = true; });

// One listener for every task button (event delegation)
document.querySelector('.lists-container').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);

    switch (btn.dataset.action) {
        case 'toggle': toggleTask(id); break;
        case 'delete': deleteTask(id); break;
        case 'edit': startEdit(id); break;
        case 'save-edit': saveEdit(id); break;
        case 'cancel-edit': cancelEdit(); break;
    }
});

// Keyboard shortcuts inside the inline editor: Enter saves, Escape cancels
document.querySelector('.lists-container').addEventListener('keydown', (e) => {
    if (!e.target.classList.contains('edit-input')) return;
    if (e.key === 'Enter') saveEdit(Number(e.target.dataset.editFor));
    if (e.key === 'Escape') cancelEdit();
});

document.querySelector('.lists-container').addEventListener('input', (e) => {
    if (e.target.classList.contains('edit-input')) e.target.classList.remove('invalid');
});

clearCompletedBtn.addEventListener('click', () => {
    if (confirm('Permanently delete all completed tasks?')) {
        tasks = tasks.filter(t => !t.completed);
        update();
    }
});

// ---------- Initial render ----------
todayEl.textContent = new Date().toLocaleDateString([], {
    weekday: 'long', day: 'numeric', month: 'long'
});
renderTasks();