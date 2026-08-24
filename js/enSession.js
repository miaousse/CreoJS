// createIconBtn(), get3DIconName() et buildActionCell() sont fournis par common.js.

let allModels = [];

function refreshModelsAndList() {
    CreoJS.getInSessionModels()
        .then(models => {
            allModels = models;
            applyFilters();
        })
        .catch(error => {
            showMessage(`Erreur: ${error.message}`, "ERROR");
        });
}

/**
 * Trie les modèles : modifiés en premier, puis ordre alphabétique.
 * NB : localeCompare() est utilisé ici sans risque car ce tri s'exécute
 * dans le navigateur (pas dans le moteur JS de Creo, qui ne le supporte pas).
 */
function sortModels(models) {
    return [...models].sort((a, b) => {
        if (a.isModified !== b.isModified) {
            return b.isModified - a.isModified;
        }
        return a.filename.localeCompare(b.filename);
    });
}

/**
 * Déduit le type de fichier (drw/prt/asm) à partir du nom de modèle.
 * Fonction pure.
 */
function getModelFileType(filename) {
    const lowerFilename = (filename || '').toLowerCase();
    if (lowerFilename.endsWith('.drw')) return 'drw';
    if (lowerFilename.endsWith('.asm')) return 'asm';
    if (lowerFilename.endsWith('.prt')) return 'prt';
    return null;
}

/**
 * Ferme (efface de la session) un modèle.
 * Si Creo refuse — cas fréquent quand le modèle est encore référencé
 * par un assemblage ou une mise en plan ouverte en session — on informe
 * l'utilisateur au lieu de laisser l'échec passer silencieusement.
 */
function closeModel(model) {
    CreoJS.EraseModel(model.filename)
        .then(refreshModelsAndList)
        .catch(error => {
            console.error(`Échec de la fermeture de "${model.filename}" :`, error);
            alert(`Impossible de fermer "${model.filename}" : le fichier est probablement utilisé par un autre modèle en session.`);
        });
}

/**
 * Construit les cellules 2D et 3D pour un modèle : une icône dans la
 * colonne correspondant à son type, un tiret dans l'autre.
 */
function buildModelTypeCells(model) {
    const fileType = getModelFileType(model.filename);

    const drawingCell = buildActionCell({
        isAvailable: fileType === 'drw',
        iconName: '2d',
        title: 'Afficher la mise en plan',
        extraClass: 'btn-2d',
        onOpen: () => CreoJS.DisplayModel(model.filename)
    });

    const model3DCell = buildActionCell({
        isAvailable: fileType === 'prt' || fileType === 'asm',
        iconName: get3DIconName(fileType),
        title: 'Afficher le modèle 3D',
        extraClass: `btn-${fileType}`,
        onOpen: () => CreoJS.DisplayModel(model.filename)
    });

    return [drawingCell, model3DCell];
}

/**
 * Construit la cellule FERMER (effacer + sauvegarder si modifié).
 */
function buildModelActionsCell(model) {
    const cell = document.createElement('td');
    cell.className = 'actions-cell';

    cell.appendChild(createIconBtn('disabled_by_default', 'Fermer (effacer de la session)', () => {
        closeModel(model);
    }, 'btn-danger'));

    if (model.isModified) {
        cell.appendChild(createIconBtn('save', 'Sauvegarder', () => {
            CreoJS.SaveModel(model.filename).then(refreshModelsAndList);
        }, 'btn-save'));
    }

    return cell;
}

/**
 * Construit une ligne du tableau pour un modèle en session.
 */
function buildModelRow(model) {
    const row = document.createElement('tr');
    if (model.isModified) row.classList.add('row-modified');

    buildModelTypeCells(model).forEach(cell => row.appendChild(cell));
    row.appendChild(buildModelActionsCell(model));

    const nameCell = document.createElement('td');
    const badge = model.isModified ? '<span class="status-badge-modified">MODIFIÉ</span>' : '';
    nameCell.innerHTML = `
        <div class="model-name">${model.filename}</div>
        <div class="model-ds1">${model.ds1 || ''}</div>
        ${badge}
    `;
    row.appendChild(nameCell);

    return row;
}

/**
 * Construit et affiche le tableau des modèles en session.
 * Cible directement le tbody de la table statique du HTML (pas de
 * reconstruction du thead à chaque appel), et cache la table quand
 * il n'y a rien à afficher.
 */
function buildList(models) {
    const table = document.getElementById('models-table');
    const tbody = document.getElementById('models-table-body');
    const emptyMessage = document.getElementById('models-empty');

    tbody.innerHTML = '';

    if (!models || models.length === 0) {
        table.style.display = 'none';
        emptyMessage.style.display = '';
        return;
    }

    table.style.display = '';
    emptyMessage.style.display = 'none';

    sortModels(models).forEach(model => {
        tbody.appendChild(buildModelRow(model));
    });
}

document.getElementById('filenameFilter').addEventListener('input', applyFilters);

document.getElementById('modifiedFilter')?.addEventListener('change', applyFilters);

document.querySelectorAll('.type-filters input').forEach(checkbox => {
    checkbox.addEventListener('change', applyFilters);
});

function showMessage(message, type = "INFO") {
    const checker = document.getElementById("debugMessages");
    if (!checker) return;
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.color = type === "ERROR" ? "red" : "green";
    messageDiv.style.margin = '5px 0';
    checker.appendChild(messageDiv);
    setTimeout(() => { messageDiv.remove(); }, 500);
}

CreoJS.$ADD_ON_LOAD(() => {
    initialize();
});

function initialize() {
    try {
        CreoJS.getInSessionModels()
            .then(models => {
                allModels = models;
                buildList(models);
            });
    } catch (error) {
        showMessage(`Erreur: ${error.message}`, "ERROR");
    }
}

function applyFilters() {
    const textFilter = document.getElementById('filenameFilter').value.toLowerCase().trim();
    const modifiedFilter = document.getElementById('modifiedFilter').checked;
    const p00Filter = document.getElementById('p00Filter')?.checked || false;

    const activeTypeFilters = Array.from(document.querySelectorAll('.type-filters input[type="checkbox"]:not(#modifiedFilter):not(#p00Filter):checked'))
        .map(cb => cb.value.toLowerCase());

    const filteredModels = allModels.filter(model => {
        const filename = model.filename?.toLowerCase() || '';

        const textMatch = !textFilter || filename.includes(textFilter);
        const typeMatch = activeTypeFilters.length === 0 ||
            activeTypeFilters.some(type => filename.endsWith(`.${type}`));
        const modifiedMatch = !modifiedFilter || model.isModified;
        const p00Match = !p00Filter || filename.startsWith('p00');

        return textMatch && typeMatch && modifiedMatch && p00Match;
    });

    buildList(filteredModels);
}
