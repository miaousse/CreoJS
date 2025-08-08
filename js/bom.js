let maxLevel = 1; // Store the maximum level found in the BoM
let searchInput = ''; // Store the current search input
let p00Filter = false; // Store the P00 filter state

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
    document.getElementById('error').textContent = `Error: ${error.message || error}`;
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

    // Show spans only if data is present and not 'non def'
    revisionSpan.style.display = (data.revision && data.revision !== 'non def') ? 'inline' : 'none';
    ds1Span.style.display = (data.ds1 && data.ds1 !== 'non def') ? 'inline' : 'none';
    ds2Span.style.display = (data.ds2 && data.ds2 !== 'non def') ? 'inline' : 'none';
    ds3Span.style.display = (data.ds3 && data.ds3 !== 'non def') ? 'inline' : 'none';

    // Add separators for display
    bomforDiv.innerHTML = '';
    const fields = [fullnameSpan, revisionSpan, ds1Span, ds2Span, ds3Span].filter(span => span.style.display !== 'none');
    fields.forEach((span, index) => {
        bomforDiv.appendChild(span);
        if (index < fields.length - 1) {
            bomforDiv.appendChild(document.createTextNode(' | '));
        }
    });
}

let lastStructure = null; // Store the last BoM structure for filtering

function getModelImage(modelType) {
    const sourceDirectory = './assets/'; // Relative path to image subdirectory
    const imageMap = {
        'prt': 'part16x16.png',
        'asm': 'assembly16x16.png',
        'drw': 'drawing_app16x16.png'
    };
    const imageName = imageMap[modelType] || 'default16x16.png';
    return sourceDirectory + imageName;
}

function displayBom(structure) {
    lastStructure = structure; // Store structure for re-filtering
    if (!structure) {
        document.getElementById('error').textContent = 'No BoM structure available';
        return;
    }

    const table = document.getElementById('bom');
    // Clear any existing rows except header
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Check if the model is a part
    if (structure.isPart) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 7; // 7 columns: Drw, 3D, Level, Qté, Code, Rev, Description
        td.style.textAlign = 'center';
        td.style.color = 'red';
        td.textContent = 'Cannot display BoM: Current model is a part, not an assembly';
        tr.appendChild(td);
        table.appendChild(tr);
        return;
    }

    const rows = [];
    maxLevel = 1; // Reset maxLevel
    function buildTable(struct, level) {
        if (!struct) return;

        // Update maxLevel
        if (level > maxLevel) maxLevel = level;

        // Add the current assembly/part (skip level 0 for top assembly)
        if (level > 0 || !struct.isAssembly) {
            rows.push({
                level,
                statut: struct.statut,
                quantity: struct.count,
                code: struct.filename,
                revision: struct.revision,
                ds1: struct.ds1,
				material:struct.material
            });
        }

        // Process components (parts and subassemblies)
        struct.components.forEach(comp => {
            if (comp.level > maxLevel) maxLevel = comp.level;
            rows.push({
                level: comp.level,
                statut: comp.statut,
                quantity: comp.count,
                code: comp.filename,
                revision: comp.revision,
                ds1: comp.ds1,
				material:comp.material
            });
            if (comp.isAssembly && comp.components.length > 0) {
                comp.components.forEach(subComp => {
                    buildTable(subComp, subComp.level);
                });
            }
        });
    }

    buildTable(structure, structure.level);

    // Update slider attributes
    const slider = document.getElementById('levelSlider');
    const maxLevelSpan = document.getElementById('maxLevel');
    const currentLevelSpan = document.getElementById('currentLevel');
    maxLevelSpan.textContent = maxLevel;
    slider.max = maxLevel;
    slider.value = maxLevel;
    currentLevelSpan.textContent = maxLevel;

    // Populate table with filtered rows
    rows.forEach((row, index) => {
        // Apply filters: search input, P00 filter, and level (level filter applied later)
        const matchesSearch = searchInput === '' || 
            row.code.toLowerCase().includes(searchInput.toLowerCase()) ||
            row.revision.toLowerCase().includes(searchInput.toLowerCase()) ||
            row.ds1.toLowerCase().includes(searchInput.toLowerCase());
        
        const matchesP00 = !p00Filter || row.code.toLowerCase().startsWith('p00');

        if (matchesSearch && matchesP00) {
            const tr = document.createElement('tr');
            tr.dataset.level = row.level; // Store level for filtering
            if (row.statut === '') {
                tr.classList.add('empty-statut');
            }

            // Drw column
            const drwTd = document.createElement('td');
            drwTd.style.textAlign = 'center';
            if (row.code.toLowerCase().startsWith('p00')) {
                const img = document.createElement('img');
                img.src = getModelImage('drw');
                img.alt = 'Drawing';
                img.title = 'Open 2D Drawing';
                img.style.width = '16px';
                img.style.height = '16px';
                drwTd.style.cursor = 'pointer';
                drwTd.appendChild(img);
                drwTd.onclick = () => CreoJS.open2D(row.code.replace(/\.[^.]+$/, ''));
            } else {
                drwTd.innerHTML = '-';
            }
            tr.appendChild(drwTd);

            // 3D column
            const threeDTd = document.createElement('td');
            threeDTd.style.textAlign = 'center';
            threeDTd.style.cursor = 'pointer';
            const extension = row.code.split('.').pop().toLowerCase();
            const modelType = extension === 'prt' || extension === 'asm' ? extension : 'prt'; // Default to prt if unknown
            const img = document.createElement('img');
            img.src = getModelImage(modelType);
            img.alt = modelType === 'prt' ? 'Part' : 'Assembly';
            img.title = `Open 3D ${modelType === 'prt' ? 'Part' : 'Assembly'}`;
            img.style.width = '16px';
            img.style.height = '16px';
            threeDTd.appendChild(img);
            threeDTd.onclick = () => CreoJS.open3D(row.code);
            tr.appendChild(threeDTd);

            // Level cell
            const levelTd = document.createElement('td');
            levelTd.classList.add(`level-${(row.level - 1) % 5 + 1}`);
            levelTd.style.paddingLeft = `${row.level * 5}px`;
            levelTd.textContent = row.level;
            tr.appendChild(levelTd);

            // Quantity cell
            const quantityTd = document.createElement('td');
            quantityTd.style.textAlign = 'center';
            quantityTd.textContent = row.quantity;
            tr.appendChild(quantityTd);

            // Code cell
            const codeTd = document.createElement('td');
            const baseCode = row.code.replace(/\.[^.]+$/, '');
            const codeText = document.createTextNode(baseCode);
            codeTd.appendChild(codeText);
            tr.appendChild(codeTd);

            // Revision cell
            const revisionTd = document.createElement('td');
            revisionTd.textContent = row.revision;
            tr.appendChild(revisionTd);

            // DS1 cell
            const ds1Td = document.createElement('td');
            ds1Td.textContent = row.ds1;
            tr.appendChild(ds1Td);
			
			const materialTd = document.createElement('td');
			materialTd.textContent=row.material;
			tr.appendChild(materialTd);
			
            table.appendChild(tr);
        }
    });

    // Apply level filter after populating
    filterTableByLevel(parseInt(slider.value));

    // Add event listener for slider
    slider.addEventListener('input', () => {
        const selectedLevel = parseInt(slider.value);
        currentLevelSpan.textContent = selectedLevel;
        filterTableByLevel(selectedLevel);
    });
}

function exportTableToCSV() {
    const bomTable = document.getElementById('bom');
    const bomforDiv = document.getElementById('bomfor');
    
    if (!bomTable) {
        showTemporaryMessage('Error: BoM table not found!');
        console.error('BoM table with id="bom" not found in the DOM');
        return;
    }

    if (!bomforDiv) {
        console.warn('Bomfor div with id="bomfor" not found, skipping Bomfor data');
    }

    const rows = [];
    const separator = "\t";

    // Build Bomfor row (fullname, revision, ds1, ds2, ds3 if they exist)
    if (bomforDiv) {
        const bomforRow = [];
        const fullname = document.getElementById('fullname')?.textContent || '';
        const revision = document.getElementById('revision')?.textContent || '';
        const ds1 = document.getElementById('ds1')?.textContent || '';
        const ds2 = document.getElementById('ds2')?.textContent || '';
        const ds3 = document.getElementById('ds3')?.textContent || '';
        bomforRow.push(separator, fullname, revision, ds1);
        if (ds2 && ds2 !== 'non def') bomforRow.push(ds2);
        if (ds3 && ds3 !== 'non def') bomforRow.push(ds3);
        rows.push(bomforRow.join(separator));
    } else {
        rows.push(''); // Placeholder to maintain CSV structure
    }

    // Build header row for bom table, excluding Drw and 3D columns
    const headers = [];
    const headerCells = bomTable.rows[0].cells;
    for (let i = 2; i < headerCells.length; i++) { // Start from index 2 to skip Drw and 3D
        headers.push(headerCells[i].textContent);
    }
    rows.push(headers.join(separator));

    // Build data rows for bom table (only visible rows, excluding Drw and 3D columns)
    for (let r = 1; r < bomTable.rows.length; r++) {
        const row = bomTable.rows[r];
        if (row.style.display === 'none') continue;
        const cells = [];
        for (let c = 2; c < row.cells.length; c++) { // Start from index 2 to skip Drw and 3D
            cells.push(row.cells[c].textContent);
        }
        rows.push(cells.join(separator));
    }

    const csvContent = rows.join('\n');
    navigator.clipboard.writeText(csvContent)
        .then(() => {
            showTemporaryMessage('Table data copied to clipboard!');
        })
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
        setTimeout(() => {
            errorDiv.textContent = '';
        }, 500);
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
    const columnKeys = ['drw', '3d', 'level', 'quantity', 'code', 'revision', 'ds1'];
    const columnKey = columnKeys[columnIndex];
    if (columnKey === 'drw' || columnKey === '3d') return;

    const selectedText = window.getSelection().toString().trim();
    const text = selectedText || cell.textContent.trim();
    if (text) {
        navigator.clipboard.writeText(text)
            .then(() => showTemporaryMessage(`Copied: ${text}`))
            .catch(err => {
                showTemporaryMessage('Failed to copy to clipboard.');
                console.error('Failed to copy:', err);
            });
    }
}

// function filterTableByLevel(selectedLevel) {
    // const table = document.getElementById(config.tableId);
    // for (let r = 1; r < table.rows.length; r++) {
        // const row = table.rows[r];
        // const rowLevel = parseInt(row.dataset.level);
        // row.style.display = rowLevel <= selectedLevel ? '' : 'none';
    // }
// }
function filterTableByLevel(selectedLevel) {
    const table = document.getElementById('bom');
    for (let i = 1; i < table.rows.length; i++) { // Start from 1 to skip header
        const row = table.rows[i];
        const rowLevel = parseInt(row.dataset.level);
        row.style.display = rowLevel <= selectedLevel ? '' : 'none';
    }
}