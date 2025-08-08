let maxLevel = 1;
let searchInput = '';
let lastStructure = null;

const config = {
    tableId: 'bom',
    containerId: 'bom',
    caption: 'Nomenclature',
    columns: [
        { key: 'drw', label: 'Drw', type: 'custom', render: (row) => {
            const content = row.code.toLowerCase().startsWith('p00') ? '2D' : '-';
            return { content, onclick: content === '2D' ? () => CreoJS.open2D(row.code.replace(/\.[^.]+$/, '')) : null, style: { textAlign: 'center', cursor: content === '2D' ? 'pointer' : 'default' } };
        }},
        { key: '3d', label: '3D', type: 'custom', render: () => ({ content: '3D', onclick: (row) => () => CreoJS.open3D(row.code), style: { textAlign: 'center', cursor: 'pointer' } })},
        { key: 'level', label: '#', type: 'number', class: (row) => `level-${(row.level - 1) % 5 + 1}`, style: (row) => ({ paddingLeft: `${row.level * 5}px` })},
        { key: 'quantity', label: 'Qté', type: 'number', style: () => ({ textAlign: 'center' })},
        { key: 'code', label: 'Code', type: 'text', render: (row) => ({ content: row.code.replace(/\.[^.]+$/, '') })},
        { key: 'revision', label: 'Rev', type: 'text'},
        { key: 'ds1', label: 'Description', type: 'text'}
    ],
    fullNameDisplay: {
        elementIds: ['fullname', 'revision', 'ds1', 'ds2'],
        containerId: 'bomFor',
        showDs2: true
    },
    features: {
        levelSlider: true,
        search: true,
        csvExport: true
    }
};

function initialize() {
    CreoJS.getFullName()
        .then(displayFullName)
        .catch(handleError);

    CreoJS.getModelBoM()
        .then(displayBom)
        .catch(handleError);

    if (config.features.search) {
        const inputField = document.getElementById('inputField');
        const clearButton = document.getElementById('clearButton');
        const debouncedDisplayBom = debounce(() => displayBom(lastStructure), 300);

        inputField.addEventListener('input', (e) => {
            searchInput = e.target.value;
            debouncedDisplayBom();
        });

        clearButton.addEventListener('click', () => {
            inputField.value = '';
            searchInput = '';
            displayBom(lastStructure);
            inputField.focus();
        });
    }

    if (config.features.levelSlider) {
        const slider = document.getElementById('levelSlider');
        slider.addEventListener('input', () => {
            const selectedLevel = parseInt(slider.value);
            document.getElementById('currentLevel').textContent = selectedLevel;
            filterTableByLevel(selectedLevel);
        });
    }
}

function handleError(error) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = `Error: ${error.message || error}`;
    console.log(`Error: ${error.message || error}`);
}

function displayFullName(data) {
    const { fullNameDisplay } = config;
    if (fullNameDisplay.elementIds) {
        document.getElementById(fullNameDisplay.elementIds[0]).textContent = data.fullname || '';
        document.getElementById(fullNameDisplay.elementIds[1]).textContent = data.revision || '';
        document.getElementById(fullNameDisplay.elementIds[2]).textContent = data.ds1 || '';
        if (fullNameDisplay.showDs2) {
            const ds2Row = document.getElementById('ds2Row');
            const ds2Cell = document.getElementById(fullNameDisplay.elementIds[3]);
            if (data.ds2 != null && data.ds2 !== '') {
                ds2Cell.textContent = data.ds2;
                ds2Row.style.display = '';
            } else {
                ds2Row.style.display = 'none';
            }
        }
    } else {
        document.getElementById(fullNameDisplay.containerId).textContent = `Nomenclature de ${data.fullname || ''}`;
    }
}

function displayBom(structure) {
    lastStructure = structure;
    if (!structure) {
        document.getElementById('error').textContent = 'No BoM structure available';
        return;
    }

    const table = document.getElementById(config.tableId);
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    if (structure.isPart) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = config.columns.length;
        td.style.textAlign = 'center';
        td.style.color = 'red';
        td.textContent = 'Cannot display BoM: Current model is a part, not an assembly';
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
                statut: struct.statut,
                quantity: struct.count,
                code: struct.filename,
                revision: struct.revision,
                ds1: struct.ds1
            });
        }

        struct.components.forEach(comp => {
            if (comp.level > maxLevel) maxLevel = comp.level;
            rows.push({
                level: comp.level,
                statut: comp.statut,
                quantity: comp.count,
                code: comp.filename,
                revision: comp.revision,
                ds1: comp.ds1
            });
            if (comp.isAssembly && comp.components.length > 0) {
                comp.components.forEach(subComp => {
                    buildTable(subComp, subComp.level);
                });
            }
        });
    }

    buildTable(structure, structure.level);

    if (config.features.levelSlider) {
        const slider = document.getElementById('levelSlider');
        const maxLevelSpan = document.getElementById('maxLevel');
        const currentLevelSpan = document.getElementById('currentLevel');
        maxLevelSpan.textContent = maxLevel;
        slider.max = maxLevel;
        slider.value = maxLevel;
        currentLevelSpan.textContent = maxLevel;
    }

    rows.forEach((row) => {
        const matchesSearch = !config.features.search || searchInput === '' ||
            row.code.toLowerCase().includes(searchInput.toLowerCase()) ||
            row.revision.toLowerCase().includes(searchInput.toLowerCase()) ||
            row.ds1.toLowerCase().includes(searchInput.toLowerCase());

        if (matchesSearch) {
            const tr = document.createElement('tr');
            tr.dataset.level = row.level;
            if (row.statut === '') {
                tr.classList.add('empty-statut');
            }

            config.columns.forEach((col) => {
                const td = document.createElement('td');
                let content = row[col.key] || '';
                let onclick = null;
                let style = col.style ? col.style(row) : {};
                let className = col.class ? col.class(row) : '';

                if (col.type === 'custom' && col.render) {
                    const result = col.render(row);
                    content = result.content;
                    onclick = result.onclick;
                    style = { ...style, ...result.style };
                }

                td.textContent = content;
                if (className) td.classList.add(className);
                Object.assign(td.style, style);
                if (onclick) td.onclick = onclick(row);
                tr.appendChild(td);
            });

            table.appendChild(tr);
        }
    });

    if (config.features.levelSlider) {
        filterTableByLevel(parseInt(document.getElementById('levelSlider').value));
    }
}

function filterTableByLevel(selectedLevel) {
    const table = document.getElementById(config.tableId);
    for (let r = 1; r < table.rows.length; r++) {
        const row = table.rows[r];
        const rowLevel = parseInt(row.dataset.level);
        row.style.display = rowLevel <= selectedLevel ? '' : 'none';
    }
}

function exportTableToCSV() {
    const table = document.getElementById(config.tableId);
    if (!table) {
        showTemporaryMessage('Table not found!');
        return;
    }

    const rows = [];
    const separator = ';';

    const headers = config.columns.map(col => col.label);
    rows.push(headers.join(separator));

    for (let r = 1; r < table.rows.length; r++) {
        const row = table.rows[r];
        if (row.style.display === 'none') continue;
        const cells = [];
        for (let c = 0; c < row.cells.length; c++) {
            cells.push(row.cells[c].textContent);
        }
        rows.push(cells.join(separator));
    }

    const csvContent = rows.join('\n');
    navigator.clipboard.writeText(csvContent)
        .then(() => showTemporaryMessage('Table data copied to clipboard!'))
        .catch(err => {
            showTemporaryMessage('Failed to copy to clipboard.');
            console.error('Failed to copy to clipboard:', err);
        });
}

function showTemporaryMessage(msg, duration = 2000) {
    const errorDiv = document.getElementById('displayMessage');
    errorDiv.textContent = msg;
    errorDiv.style.opacity = 1;
    errorDiv.style.transition = 'opacity 0.5s';

    setTimeout(() => {
        errorDiv.style.opacity = 0;
        setTimeout(() => errorDiv.textContent = '', 500);
    }, duration);
}

const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

document.addEventListener('DOMContentLoaded', initialize);