const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const tasksTbody = document.getElementById('tasks-tbody');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let editingIndex = null;

// Render tasks in the table
// function renderTasks() {
  // tasksTbody.innerHTML = '';
  // tasks.forEach((task, idx) => {
    // const tr = document.createElement('tr');

    // const actionsTd = document.createElement('td');
    // actionsTd.className = 'actions-cell';


    // const doneBtn = document.createElement('button');
    // doneBtn.className = 'icon-btn done';
    // doneBtn.title = 'Supprimer';
    // doneBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
    // doneBtn.onclick = () => removeTask(idx);



    // const editBtn = document.createElement('button');
    // editBtn.className = 'icon-btn edit';
    // editBtn.title = 'Editer';
    // editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
    // editBtn.onclick = () => editTask(idx);

    // actionsTd.appendChild(doneBtn);
    // actionsTd.appendChild(editBtn);


    // const taskTd = document.createElement('td');
    // taskTd.textContent = task.text;

    // tr.appendChild(actionsTd);
    // tr.appendChild(taskTd);
    // tasksTbody.appendChild(tr);
  // });
// }

// Add or update a task
taskForm.onsubmit = function (e) {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  if (editingIndex !== null) {
    tasks[editingIndex].text = text;
    editingIndex = null;
    // taskForm.querySelector('button[type="submit"]').textContent = 'Ajouter';
	taskForm.querySelector('button[type="submit"]').innerHTML = '<i class="fa-solid fa-plus"></i> Ajouter';
  } else {
    tasks.push({ text });
  }
  taskInput.value = '';
  saveTasks();
  renderTasks();
};

// Remove a task (called when done icon is clicked)
function removeTask(idx) {
  tasks.splice(idx, 1);
  saveTasks();
  renderTasks();
}

// Edit a task
function editTask(idx) {
  taskInput.value = tasks[idx].text;
  editingIndex = idx;
  // taskForm.querySelector('button[type="submit"]').textContent = 'Modifier';
  taskForm.querySelector('button[type="submit"]').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Modifier';
  taskInput.focus();
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}
// SVG icons as strings
const deleteSVG = `
<svg class="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <rect x="4" y="7" width="16" height="13" rx="2" stroke="#005496" stroke-width="2" fill="none"/>
  <rect x="9" y="3" width="6" height="4" rx="1" stroke="#005496" stroke-width="2" fill="none"/>
  <line x1="10" y1="11" x2="10" y2="17" stroke="#005496" stroke-width="2"/>
  <line x1="14" y1="11" x2="14" y2="17" stroke="#005496" stroke-width="2"/>
</svg>
`;

const editSVG = `
<svg class="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <rect x="3" y="17" width="18" height="4" rx="1" stroke="#005496" stroke-width="2" fill="none"/>
  <path d="M15.5 5.5l3 3L8 19H5v-3L15.5 5.5z" stroke="#005496" stroke-width="2" fill="none"/>
</svg>
`;

// Add styles for SVG hover effect
const style = document.createElement('style');
style.textContent = `
.icon-btn {
  background: transparent;
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
}
.icon-svg {
  display: block;
  width: 24px;
  height: 24px;
  transition: background 0.2s, fill 0.2s, stroke 0.2s;
  background: transparent;
  border-radius: 4px;
}
.icon-btn:hover .icon-svg,
.icon-btn:focus .icon-svg {
  background: #005496;
}
.icon-btn.delete:hover .icon-svg rect,
.icon-btn.delete:hover .icon-svg line {
  stroke: transparent;
}
.icon-btn.delete:hover .icon-svg {
  background: #005496;
}
.icon-btn.delete:hover .icon-svg rect,
.icon-btn.delete:hover .icon-svg line {
  stroke: transparent;
}
.icon-btn.delete:hover .icon-svg {
  background: #005496;
}
.icon-btn.delete:hover .icon-svg rect,
.icon-btn.delete:hover .icon-svg line {
  stroke: transparent;
}
.icon-btn.edit:hover .icon-svg path,
.icon-btn.edit:hover .icon-svg rect {
  stroke: transparent;
}
.icon-btn.edit:hover .icon-svg {
  background: #005496;
}
`;
document.head.appendChild(style);

// Render tasks in the table
function renderTasks() {
  tasksTbody.innerHTML = '';
  tasks.forEach((task, idx) => {
    const tr = document.createElement('tr');

    // Actions cell
    const actionsTd = document.createElement('td');
    actionsTd.className = 'actions-cell';

    // Delete button
    const doneBtn = document.createElement('button');
    doneBtn.className = 'icon-btn delete';
    doneBtn.title = 'Supprimer';
    doneBtn.innerHTML = deleteSVG;
    doneBtn.onclick = function () { removeTask(idx); };

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn edit';
    editBtn.title = 'Editer';
    editBtn.innerHTML = editSVG;
    editBtn.onclick = function () { editTask(idx); };

    actionsTd.appendChild(doneBtn);
    actionsTd.appendChild(editBtn);

    // Task text cell
    const taskTd = document.createElement('td');
    taskTd.textContent = task.text;

    tr.appendChild(actionsTd);
    tr.appendChild(taskTd);

    tasksTbody.appendChild(tr);
  });
}






// Initial render
renderTasks();
