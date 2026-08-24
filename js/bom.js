let maxLevel = 1;
let searchInput = '';
let p00Filter = false;

function initialize() {
    CreoJS.getFullName()
        .then(displayFullName)
        .catch(handleError);
        
    CreoJS.getModelBoM()
        .then(displayBom)
        .catch(handleError);

    const debouncedDisplayBom = debounce(() => displayBom(lastStructure), 300);

    const inputField = document.getElementById('inputField');
    inputField.addEventListener('input', (e) => {
        searchInput = e.target.value;
        debouncedDisplayBom();
    });

    const clearButton = document.getElementById('clearButton');
    clearButton.addEventListener('click', () => {
        inputField.value = '';
        searchInput = '';
        displayBom(lastStructure);
        inputField.focus();
    });

    const p00FilterCheckbox = document.getElementById('p00Filter');
    p00FilterCheckbox.addEventListener('change', (e) => {
        p00Filter = e.target.checked;
        debouncedDisplayBom();
    });

    const bom = document.getElementById('bom');
    bom.addEventListener('dblclick', (e) => {
        if (e.target.tagName === 'TD') {
            copyCellText(e.target);
        }
    });
}

function handleError(error) {
    document.querySelector('.error').textContent = `Erreur : ${error.message || error}`;
    console.log(`Error: ${error.message || error}`);
}

function displayFullName(data) {
    const bomforDiv = document.getElementById('bomfor');
    const fullnameSpan = document.getElementById('fullname');
    const revisionSpan = document.getElementById('revision');
    const ds1Span = document.getElementById('ds1');
    const ds2Span = document.getElementById('ds2');
    const ds3Span = document.getElementById('ds3');

    fullnameSpan.textContent = data.fullname || '';
    revisionSpan.textContent = data.revision || '';
    ds1Span.textContent = data.ds1 || '';
    ds2Span.textContent = data.ds2 || '';
    ds3Span.textContent = data.ds3 || '';

    revisionSpan.style.display = (data.revision && data.revision !== 'non def') ? 'inline' : 'none';
    ds1Span.style.display     = (data.ds1 && data.ds1 !== 'non def') ? 'inline' : 'none';
    ds2Span.style.display     = (data.ds2 && data.ds2 !== 'non def') ? 'inline' : 'none';
    ds3Span.style.display     = (data.ds3 && data.ds3 !== 'non def') ? 'inline' : 'none';

    bomforDiv.innerHTML = '';
    const fields = [fullnameSpan, revisionSpan, ds1Span, ds2Span, ds3Span]
        .filter(span => span.style.display !== 'none');
    fields.forEach((span, index) => {
        bomforDiv.appendChild(span);
        if (index < fields.length - 1) {
            bomforDiv.appendChild(document.createTextNode(' | '));
        }
    });
}

let lastStructure = null;

/**
 * Crée une icône Material Symbols cliquable pour les colonnes Drw / 3D
 * @param {string} iconName  - nom de l'icône Material Symbols
 * @param {string} title     - tooltip
 * @param {string} color     - couleur CSS optionnelle
 * @returns {HTMLElement}
 */
function createModelIcon(iconName, title, color) {
    const btn = document.createElement('button');
    btn.className = 'action-icon-btn';
    btn.title = title;
    if (color) btn.style.color = color;
    btn.innerHTML = `<span class="material-symbols-outlined">${iconName}</span>`;
    return btn;
}

/**
 * Correspondance type de modèle → icône Material Symbols
 * picture_as_pdf  → dessin 2D
 * view_in_ar      → pièce 3D (part)
 * account_tree    → assemblage 3D
 */
const MODEL_ICONS = {
    drw: { icon: '2d', label: 'Ouvrir le dessin 2D',   color: '#dc2626' },
    prt: { icon: 'view_in_ar',     label: 'Ouvrir la pièce 3D',    color: '#2563eb' },
    asm: { icon: 'account_tree',   label: 'Ouvrir l\'assemblage 3D', color: '#16a34a' }
};

function displayBom(structure) {
    lastStructure = structure;
    if (!structure) {
        document.querySelector('.error').textContent = 'Aucune nomenclature disponible';
        return;
    }

    const table = document.getElementById('bom');
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    if (structure.isPart) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 8;
        td.style.textAlign = 'center';
        td.style.color = 'var(--danger)';
        td.textContent = 'Le modèle actif est une pièce, pas un assemblage.';
        tr.appendChild(td);
        table.appendChild(tr);
        return;
    }

    const rows = [];
    maxLevel = 1;

    function buildTable(struct, level) {
        if (!struct) return;
        if (level > maxLevel) maxLevel = level;

        if (level > 0 || !struct.isAssembly) {
            rows.push({
                level,
                statut:   struct.statut,
                quantity: struct.count,
                code:     struct.filename,
                revision: struct.revision,
                ds1:      struct.ds1,
                material: struct.material
            });
        }

        struct.components.forEach(comp => {
            if (comp.level > maxLevel) maxLevel = comp.level;
            rows.push({
                level:    comp.level,
                statut:   comp.statut,
                quantity: comp.count,
                code:     comp.filename,
                revision: comp.revision,
                ds1:      comp.ds1,
                material: comp.material
            });
            if (comp.isAssembly && comp.components.length > 0) {
                comp.components.forEach(subComp => {
                    buildTable(subComp, subComp.level);
                });
            }
        });
    }

    buildTable(structure, structure.level);

    // Mise à jour du slider
    const slider = document.getElementById('levelSlider');
    const maxLevelSpan = document.getElementById('maxLevel');
    const currentLevelSpan = document.getElementById('currentLevel');
    maxLevelSpan.textContent = maxLevel;
    slider.max = maxLevel;
    slider.value = maxLevel;
    currentLevelSpan.textContent = maxLevel;

    rows.forEach(row => {
        const matchesSearch = searchInput === '' ||
            row.code.toLowerCase().includes(searchInput.toLowerCase()) ||
            row.revision.toLowerCase().includes(searchInput.toLowerCase()) ||
            row.ds1.toLowerCase().includes(searchInput.toLowerCase());

        const matchesP00 = !p00Filter || row.code.toLowerCase().startsWith('p00');

        if (!matchesSearch || !matchesP00) return;

        const tr = document.createElement('tr');
        tr.dataset.level = row.level;
        if (row.statut === '') tr.classList.add('empty-statut');

        // --- Colonne Drw ---
        const drwTd = document.createElement('td');
        drwTd.style.textAlign = 'center';
        if (row.code.toLowerCase().startsWith('p00')) {
            const cfg = MODEL_ICONS.drw;
            const btn = createModelIcon(cfg.icon, cfg.label, cfg.color);
            btn.onclick = () => CreoJS.open2D(row.code.replace(/\.[^.]+$/, ''));
            drwTd.appendChild(btn);
        } else {
            drwTd.innerHTML = '<span style="color:var(--text-light)">—</span>';
        }
        tr.appendChild(drwTd);

        // --- Colonne 3D ---
        const threeDTd = document.createElement('td');
        threeDTd.style.textAlign = 'center';
        const extension = row.code.split('.').pop().toLowerCase();
        const modelType = (extension === 'prt' || extension === 'asm') ? extension : 'prt';
        const cfg3D = MODEL_ICONS[modelType];
        const btn3D = createModelIcon(cfg3D.icon, cfg3D.label, cfg3D.color);
        btn3D.onclick = () => CreoJS.open3D(row.code);
        threeDTd.appendChild(btn3D);
        tr.appendChild(threeDTd);

        // --- Niveau ---
        const levelTd = document.createElement('td');
        levelTd.classList.add(`level-${(row.level - 1) % 5 + 1}`);
        levelTd.style.paddingLeft = `${row.level * 5}px`;
        levelTd.textContent = row.level;
        tr.appendChild(levelTd);

        // --- Quantité ---
        const quantityTd = document.createElement('td');
        quantityTd.style.textAlign = 'center';
        quantityTd.textContent = row.quantity;
        tr.appendChild(quantityTd);

        // --- Code ---
        const codeTd = document.createElement('td');
        codeTd.appendChild(document.createTextNode(row.code.replace(/\.[^.]+$/, '')));
        tr.appendChild(codeTd);

        // --- Révision ---
        const revisionTd = document.createElement('td');
        revisionTd.textContent = row.revision;
        tr.appendChild(revisionTd);

        // --- DS1 ---
        const ds1Td = document.createElement('td');
        ds1Td.textContent = row.ds1;
        tr.appendChild(ds1Td);

        // --- Matière ---
        const materialTd = document.createElement('td');
        materialTd.textContent = row.material;
        tr.appendChild(materialTd);

        table.appendChild(tr);
    });

    filterTableByLevel(parseInt(slider.value));

    slider.addEventListener('input', () => {
        const selectedLevel = parseInt(slider.value);
        currentLevelSpan.textContent = selectedLevel;
        filterTableByLevel(selectedLevel);
    });
}

function filterTableByLevel(selectedLevel) {
    const table = document.getElementById('bom');
    for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];
        const rowLevel = parseInt(row.dataset.level);
        row.style.display = rowLevel <= selectedLevel ? '' : 'none';
    }
}

function exportTableToCSV() {
    const bomTable = document.getElementById('bom');
    const bomforDiv = document.getElementById('bomfor');

    if (!bomTable) {
        showTemporaryMessage('Erreur : tableau introuvable.');
        return;
    }

    const rows = [];
    const separator = "\t";

    if (bomforDiv) {
        const bomforRow = [];
        const fullname = document.getElementById('fullname')?.textContent || '';
        const revision = document.getElementById('revision')?.textContent || '';
        const ds1      = document.getElementById('ds1')?.textContent || '';
        const ds2      = document.getElementById('ds2')?.textContent || '';
        const ds3      = document.getElementById('ds3')?.textContent || '';
        bomforRow.push(separator, fullname, revision, ds1);
        if (ds2 && ds2 !== 'non def') bomforRow.push(ds2);
        if (ds3 && ds3 !== 'non def') bomforRow.push(ds3);
        rows.push(bomforRow.join(separator));
    } else {
        rows.push('');
    }

    // En-têtes (on ignore les 2 premières colonnes Drw et 3D)
    const headers = [];
    const headerCells = bomTable.rows[0].cells;
    for (let i = 2; i < headerCells.length; i++) {
        headers.push(headerCells[i].textContent);
    }
    rows.push(headers.join(separator));

    // Données (lignes visibles, sans les 2 premières colonnes)
    for (let r = 1; r < bomTable.rows.length; r++) {
        const row = bomTable.rows[r];
        if (row.style.display === 'none') continue;
        const cells = [];
        for (let c = 2; c < row.cells.length; c++) {
            cells.push(row.cells[c].textContent);
        }
        rows.push(cells.join(separator));
    }

    const csvContent = rows.join('\n');
    navigator.clipboard.writeText(csvContent)
        .then(() => showTemporaryMessage('Données copiées dans le presse-papier !'))
        .catch(err => {
            showTemporaryMessage('Échec de la copie.');
            console.error('Failed to copy to clipboard:', err);
        });
}

function showTemporaryMessage(msg, duration = 2000) {
    const el = document.getElementById('displayMessage');
    el.textContent = msg;
    el.style.opacity = 1;
    el.style.transition = 'opacity 0.5s';
    setTimeout(() => {
        el.style.opacity = 0;
        setTimeout(() => { el.textContent = ''; }, 500);
    }, duration);
}

const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

function copyCellText(cell) {
    const columnIndex = cell.cellIndex;
    const columnKeys = ['drw', '3d', 'level', 'quantity', 'code', 'revision', 'ds1', 'material'];
    const columnKey = columnKeys[columnIndex];
    if (columnKey === 'drw' || columnKey === '3d') return;

    const selectedText = window.getSelection().toString().trim();
    const text = selectedText || cell.textContent.trim();
    if (text) {
        navigator.clipboard.writeText(text)
            .then(() => showTemporaryMessage(`Copié : ${text}`))
            .catch(err => {
                showTemporaryMessage('Échec de la copie.');
                console.error('Failed to copy:', err);
            });
    }
}
