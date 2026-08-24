// ---- Persistance localStorage ----

function loadDirectories() {
    const stored = localStorage.getItem('directories');
    return stored ? JSON.parse(stored) : [];
}

function saveDirectories(directories) {
    localStorage.setItem('directories', JSON.stringify(directories));
}

// createIconBtn() est fourni par common.js, chargé avant ce fichier.

// ---- Ajout d'un répertoire (saisi manuellement) ----
function addDirectory() {
    const path        = document.getElementById('path-input').value.trim();
    const description = document.getElementById('description-input').value.trim();

    if (!path || !description) return;

    const directories = loadDirectories();
    directories.push({ key: description, item: path });
    saveDirectories(directories);

    document.getElementById('path-input').value        = '';
    document.getElementById('description-input').value = '';

    createDirectoryList();
}

// ---- Suppression d'un répertoire ----
function removeDirectory(index) {
    if (!confirm('Supprimer ce répertoire de la liste ?')) return;
    const directories = loadDirectories();
    directories.splice(index, 1);
    saveDirectories(directories);
    createDirectoryList();
}

// ---- Construction d'une ligne du tableau des répertoires ----
function buildDirectoryRow(dir, index, currentPath) {
    const row = document.createElement('tr');

    // Mise en évidence du répertoire courant
    const isCurrent = currentPath && currentPath.includes(dir.item);
    if (isCurrent) row.classList.add('current-working-directory');

    // ---- Cellule actions ----
    const actionsTd = document.createElement('td');
    actionsTd.className = 'actions-cell';

    // Icône "activer" — folder_open
    const activateBtn = createIconBtn(
        isCurrent ? 'folder_special' : 'folder_open',
        'Activer ce répertoire',
        () => {
            CreoJS.changeDir(dir.item)
                .then(() => {
                    createDirectoryList();
                    refreshDirectoryModels();
                })
                .catch(err => {
                    console.error('Failed to change directory:', err);
                    alert('Impossible de changer de répertoire. Vérifiez le chemin.');
                });
        },
        isCurrent ? 'btn-active' : ''
    );
    actionsTd.appendChild(activateBtn);

    // Icône "supprimer" — delete
    actionsTd.appendChild(createIconBtn(
        'delete',
        'Supprimer de la liste',
        () => removeDirectory(index),
        'btn-danger'
    ));
    row.appendChild(actionsTd);

    // ---- Cellule description ----
    const descTd = document.createElement('td');
    descTd.textContent = dir.key;
    descTd.style.fontWeight = isCurrent ? '600' : '500';
    row.appendChild(descTd);

    // ---- Cellule chemin ----
    const pathTd = document.createElement('td');
    pathTd.textContent = dir.item;
    pathTd.className = 'dir-cell';
    row.appendChild(pathTd);

    return row;
}

// ---- Construction du tableau des répertoires ----
function createDirectoryList() {
    CreoJS.getCurrentDirectory()
        .then(currentPath => {
            const directories = loadDirectories();
            const table       = document.getElementById('directory-list-table');
            const tbody       = document.getElementById('directory-list-table-body');
            const emptyMessage = document.getElementById('directory-list-empty');

            tbody.innerHTML = '';

            if (directories.length === 0) {
                table.style.display = 'none';
                emptyMessage.style.display = '';
                return;
            }

            table.style.display = '';
            emptyMessage.style.display = 'none';

            directories.forEach((dir, index) => {
                tbody.appendChild(buildDirectoryRow(dir, index, currentPath));
            });
        })
        .catch(error => {
            console.error('Failed to get current directory:', error);
        });
}

// ---- Listing du contenu du répertoire courant (modèles PRT/ASM/DRW) ----

let allDirectoryModels = [];

function refreshDirectoryModels() {
    CreoJS.getCurrentDirectory()
        .then(path => CreoJS.listDirectoryModels(path))
        .then(models => {
            allDirectoryModels = models;
            applyDirectoryFilters();
        })
        .catch(error => console.error('Failed to list directory models:', error));
}

function applyDirectoryFilters() {
    const filterInput = document.getElementById('modelFilenameFilter');
    const textFilter = filterInput ? filterInput.value.toLowerCase().trim() : '';
    const p00Filter  = document.getElementById('modelP00Filter')?.checked || false;

    const activeTypeFilters = Array.from(
        document.querySelectorAll('.model-type-filters input[type="checkbox"]:not(#modelP00Filter):checked')
    ).map(cb => cb.value.toLowerCase());

    if (!Array.isArray(allDirectoryModels)) {
        return;
    }

    const filtered = allDirectoryModels.filter(model => {
        const name = (model.name || '').toLowerCase();

        const textMatch = !textFilter || name.includes(textFilter);
        const p00Match   = !p00Filter || name.startsWith('p00');

        const typeMatch = activeTypeFilters.length === 0 || activeTypeFilters.some(type => {
            if (type === 'drw') return model.hasDrawing;
            return model.has3D && model.type3D === type;
        });

        return textMatch && p00Match && typeMatch;
    });

    buildModelsTable(filtered);
}

// ---- Constantes (Single Source of Truth pour l'affichage du tableau) ----

const DIRECTORY_MODELS_COLUMNS = ['2D', '3D', 'MODELE'];

// get3DIconName() et buildActionCell() sont fournis par common.js, chargé avant ce fichier.

function openDrawing(modelName) {
    CreoJS.open2D(modelName).catch(error => {
        console.error(`Échec de l'ouverture de la mise en plan "${modelName}" :`, error);
    });
}

function open3DModel(modelName, modelType) {
    CreoJS.open3D(`${modelName}.${modelType}`).catch(error => {
        console.error(`Échec de l'ouverture du modèle 3D "${modelName}.${modelType}" :`, error);
    });
}

function buildDirectoryModelRow(model) {
    const row = document.createElement('tr');

    row.appendChild(buildActionCell({
        isAvailable: model.hasDrawing,
        iconName: '2d',
        title: 'Ouvrir la mise en plan',
        extraClass: 'btn-2d',
        onOpen: () => openDrawing(model.name)
    }));

    row.appendChild(buildActionCell({
        isAvailable: model.has3D,
        iconName: get3DIconName(model.type3D),
        title: 'Ouvrir en 3D',
        extraClass: `btn-${model.type3D}`,
        onOpen: () => open3DModel(model.name, model.type3D)
    }));

    const nameCell = document.createElement('td');
    nameCell.textContent = model.name;
    row.appendChild(nameCell);

    return row;
}

function buildModelsTable(models) {
    const tbody = document.getElementById('directory-models-table-body');
    tbody.innerHTML = ''; // Vide uniquement le contenu des lignes

    if (!models || models.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3">Aucun modèle dans ce répertoire.</td></tr>';
        return;
    }

    models.forEach(model => {
        tbody.appendChild(buildDirectoryModelRow(model));
    });
}

function setupDirectoryFilters() {
    document.getElementById('modelFilenameFilter')?.addEventListener('input', applyDirectoryFilters);
    document.getElementById('modelP00Filter')?.addEventListener('change', applyDirectoryFilters);
    document.querySelectorAll('.model-type-filters input').forEach(checkbox => {
        checkbox.addEventListener('change', applyDirectoryFilters);
    });
}

let blurred = false;
window.addEventListener('blur', () => { blurred = true; });
window.addEventListener('focus', () => {
    if (blurred) {
        blurred = false;
        createDirectoryList();
        refreshDirectoryModels();
    }
});