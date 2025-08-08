// notepad.js
document.addEventListener('DOMContentLoaded', function() {
  const titleInput = document.getElementById('title-input');
  const noteInput = document.getElementById('note-input');
  const saveNoteButton = document.getElementById('save-note');
  const notesList = document.getElementById('notes-list');

  let editingIndex = null; // Track which note is being edited

  function getNotes() {
    const storedNotes = localStorage.getItem('notes');
    return storedNotes ? JSON.parse(storedNotes) : [];
  }

  function saveNote() {
    const title = titleInput.value.trim();
    const note = noteInput.value.trim();
    if (title && note) {
      const notes = getNotes();
      if (editingIndex !== null) {
        // Update existing note
        notes[editingIndex] = { title, content: note };
        editingIndex = null;
      } else {
        // Add new note
        notes.push({ title, content: note });
      }
      localStorage.setItem('notes', JSON.stringify(notes));
      displayNotes();
      titleInput.value = '';
      noteInput.value = '';
      saveNoteButton.textContent = 'Sauver Note';
    } else {
      alert('Remplir le titre et le contenu de la note');
    }
  }

  function displayNotes() {
    notesList.innerHTML = '';
    const notes = getNotes();
    notes.forEach((note, index) => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <span class="note-title">${note.title}</span>
        <div class="note-actions">
          <button class="open-note" data-index="${index}">Ouvrir</button>
          <button class="remove-note" data-index="${index}">Supprimer</button>
        </div>
      `;
      notesList.appendChild(listItem);
    });
  }

  // Handle click events for open and remove
  notesList.addEventListener('click', function(e) {
    if (e.target.classList.contains('open-note')) {
      const index = e.target.getAttribute('data-index');
      openNote(index);
    } else if (e.target.classList.contains('remove-note')) {
      const index = e.target.getAttribute('data-index');
      removeNote(index);
    }
  });

  function openNote(index) {
    const notes = getNotes();
    const note = notes[index];
    if (note) {
      titleInput.value = note.title;
      noteInput.value = note.content;
      editingIndex = Number(index);
      saveNoteButton.textContent = 'Mettre à jour';
    }
  }

  function removeNote(index) {
    const notes = getNotes();
    notes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
    // Reset editing if necessary
    if (editingIndex === Number(index)) {
      titleInput.value = '';
      noteInput.value = '';
      editingIndex = null;
      saveNoteButton.textContent = 'Sauver Note';
    }
  }

  saveNoteButton.addEventListener('click', saveNote);

  displayNotes();
});
