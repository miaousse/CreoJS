// notepad.js
document.addEventListener('DOMContentLoaded', function() {
    const titleInput    = document.getElementById('title-input');
    const noteInput     = document.getElementById('note-input');
    const saveNoteBtn   = document.getElementById('save-note');
    const notesList     = document.getElementById('notes-list');
    const noteDisplay   = document.getElementById('note-display');
    const noteContent   = document.getElementById('displayed-note-content');
    const closeNoteBtn  = document.getElementById('close-note');

    let editingIndex = null;

    // ---- Icône du bouton save (change selon mode) ----
    function setSaveBtnMode(isEdit) {
        saveNoteBtn.title = isEdit ? 'Mettre à jour la note' : 'Sauver la note';
        saveNoteBtn.querySelector('.material-symbols-outlined').textContent =
            isEdit ? 'save' : 'note_add';
    }
    setSaveBtnMode(false);

    // ---- Persistance ----
    function getNotes() {
        return JSON.parse(localStorage.getItem('notes') || '[]');
    }

    function persistNotes(notes) {
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    // ---- Sauvegarde / mise à jour ----
    function saveNote() {
        const title = titleInput.value.trim();
        const note  = noteInput.value.trim();
        if (!title || !note) {
            alert('Merci de remplir le titre et le contenu de la note.');
            return;
        }
        const notes = getNotes();
        if (editingIndex !== null) {
            notes[editingIndex] = { title, content: note };
            editingIndex = null;
            setSaveBtnMode(false);
        } else {
            notes.push({ title, content: note });
        }
        persistNotes(notes);
        titleInput.value = '';
        noteInput.value  = '';
        displayNotes();
    }

    // ---- Affichage de la liste ----
    function displayNotes() {
        notesList.innerHTML = '';
        const notes = getNotes();
        notes.forEach((note, index) => {
            const tr = document.createElement('tr');

            // Actions
            const actionsTd = document.createElement('td');
            actionsTd.className = 'actions-cell';
            actionsTd.appendChild(createIconBtn('edit', 'Éditer', () => openNote(index)));
            actionsTd.appendChild(createIconBtn('delete', 'Supprimer', () => removeNote(index), 'btn-danger'));
            tr.appendChild(actionsTd);

            // Titre (cliquable pour ouvrir)
            const titleTd = document.createElement('td');
            titleTd.textContent = note.title;
            titleTd.style.cursor = 'pointer';
            titleTd.title = 'Cliquer pour lire';
            titleTd.addEventListener('click', () => previewNote(index));
            tr.appendChild(titleTd);

            notesList.appendChild(tr);
        });
    }

    // ---- Prévisualisation dans la zone en bas ----
    function previewNote(index) {
        const note = getNotes()[index];
        if (!note) return;
        noteContent.textContent = note.content;
        noteDisplay.classList.remove('hidden');
    }

    // ---- Chargement en édition ----
    function openNote(index) {
        const note = getNotes()[index];
        if (!note) return;
        titleInput.value = note.title;
        noteInput.value  = note.content;
        editingIndex = index;
        setSaveBtnMode(true);
        titleInput.focus();
        noteDisplay.classList.add('hidden');
    }

    // ---- Suppression ----
    function removeNote(index) {
        const notes = getNotes();
        notes.splice(index, 1);
        persistNotes(notes);
        if (editingIndex === index) {
            titleInput.value = '';
            noteInput.value  = '';
            editingIndex = null;
            setSaveBtnMode(false);
        }
        displayNotes();
    }

    // ---- Fermer la prévisualisation ----
    closeNoteBtn.addEventListener('click', () => {
        noteDisplay.classList.add('hidden');
    });

    saveNoteBtn.addEventListener('click', saveNote);

    displayNotes();
});

// ---- Utilitaire icône Material Symbols ----
function createIconBtn(iconName, title, onClick, extraClass) {
    const btn = document.createElement('button');
    btn.className = 'action-icon-btn' + (extraClass ? ' ' + extraClass : '');
    btn.title = title;
    btn.innerHTML = `<span class="material-symbols-outlined">${iconName}</span>`;
    btn.onclick = function(e) { e.stopPropagation(); onClick(); };
    return btn;
}
