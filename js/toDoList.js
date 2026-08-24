// toDoList.js
const taskForm   = document.getElementById('task-form');
const taskInput  = document.getElementById('task-input');
const tasksTbody = document.getElementById('tasks-tbody');
const submitBtn  = document.getElementById('add-btn');

let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let editingIndex = null;

// ---- Icône du bouton submit (change selon mode) ----
function setSubmitMode(isEdit) {
    submitBtn.title = isEdit ? 'Modifier la tâche' : 'Ajouter la tâche';
    submitBtn.querySelector('.material-symbols-outlined').textContent =
        isEdit ? 'save' : 'add_circle';
}
setSubmitMode(false);

// ---- Utilitaire icône Material Symbols ----
function createIconBtn(iconName, title, onClick, extraClass) {
    const btn = document.createElement('button');
    btn.className = 'action-icon-btn' + (extraClass ? ' ' + extraClass : '');
    btn.title = title;
    btn.innerHTML = `<span class="material-symbols-outlined">${iconName}</span>`;
    btn.onclick = function(e) { e.stopPropagation(); onClick(); };
    return btn;
}

// ---- Rendu du tableau ----
function renderTasks() {
    tasksTbody.innerHTML = '';
    tasks.forEach((task, idx) => {
        const tr = document.createElement('tr');

        // Actions
        const actionsTd = document.createElement('td');
        actionsTd.className = 'actions-cell';
        actionsTd.appendChild(createIconBtn('edit',   'Éditer',    () => editTask(idx)));
        actionsTd.appendChild(createIconBtn('delete', 'Supprimer', () => removeTask(idx), 'btn-danger'));
        tr.appendChild(actionsTd);

        // Texte tâche
        const taskTd = document.createElement('td');
        taskTd.textContent = task.text;
        tr.appendChild(taskTd);

        tasksTbody.appendChild(tr);
    });
}

// ---- Ajouter / modifier ----
taskForm.onsubmit = function(e) {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;

    if (editingIndex !== null) {
        tasks[editingIndex].text = text;
        editingIndex = null;
        setSubmitMode(false);
    } else {
        tasks.push({ text });
    }
    taskInput.value = '';
    saveTasks();
    renderTasks();
};

// ---- Supprimer ----
function removeTask(idx) {
    tasks.splice(idx, 1);
    if (editingIndex === idx) {
        editingIndex = null;
        taskInput.value = '';
        setSubmitMode(false);
    }
    saveTasks();
    renderTasks();
}

// ---- Éditer ----
function editTask(idx) {
    taskInput.value = tasks[idx].text;
    editingIndex = idx;
    setSubmitMode(true);
    taskInput.focus();
}

// ---- Persistance ----
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ---- Init ----
renderTasks();
