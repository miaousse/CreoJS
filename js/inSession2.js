let allModels = [];
let activeTypeFilters = ['DRW', 'PRT', 'ASM'];
let showModifiedOnly = true;

function showMessage(message, type = "INFO") {
    const checker = document.getElementById("debugMessages");
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.color = type === "ERROR" ? "red" : "green";
    messageDiv.style.margin = '5px 0';
    checker.appendChild(messageDiv);
    setTimeout(() => {
        messageDiv.remove();
    }, 2000);
}

CreoJS.$ADD_ON_LOAD(() => {
    showMessage('Script initialized', 'INFO');
    initialize();
    const filenameFilter = document.getElementById('filenameFilter');
    const modifiedFilter = document.getElementById('modifiedFilter');
    showMessage(`Elements found - filenameFilter: ${!!filenameFilter}, modifiedFilter: ${!!modifiedFilter}`, 'INFO');
    if (filenameFilter) showMessage('filenameFilter event listener attached', 'INFO');
    if (modifiedFilter) showMessage('modifiedFilter event listener attached', 'INFO');
    document.querySelectorAll('.type-filters input').forEach(() => {
        showMessage('type filter event listener attached', 'INFO');
    });
});

function initialize() {
    try {
        CreoJS.getInSessionModels()
            .then(models => {
                allModels = models;
                showMessage(`Loaded ${models.length} models`, 'INFO');
                buildList(models);
            });
    } catch (error) {
        showMessage(`Erreur: ${error.message}`, "ERROR");
    }
}

function applyFilters() {
    showMessage('Filters applied', 'INFO');
    const textFilter = document.getElementById('filenameFilter').value.toLowerCase();
    const modifiedFilter = document.getElementById('modifiedFilter').checked;
    activeTypeFilters = Array.from(document.querySelectorAll('.type-filters input:checked'))
        .map(cb => cb.value);
    const filteredModels = allModels.filter(model => {
        const filename = model.filename?.toLowerCase() || '';
        const textMatch = !textFilter || filename.includes(textFilter);
        const typeMatch = activeTypeFilters.length === 0 ||
            activeTypeFilters.some(type => {
                const ext = type.toLowerCase();
                return filename.endsWith(`.${ext}`);
            });
        const modifiedMatch = !modifiedFilter || model.isModified;
        return textMatch && typeMatch && modifiedMatch;
    });
    showMessage(`Filtered ${filteredModels.length} of ${allModels.length} models`, 'INFO');
    buildList(filteredModels);
}

function buildList(models) {
    models.sort((a, b) => {
        if (a.filename !== b.filename) {
            return a.filename < b.filename ? -1 : 1;
        } else {
            return a.isModified - b.isModified;
        }
    });

    const iframe = document.getElementById('table-iframe');
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const tbody = iframeDoc.getElementById('table-body');
    tbody.innerHTML = '';

    if (!models || models.length === 0) {
        showMessage("Pas de modèle en session", "INFO");
        return;
    }

    models.forEach(model => {
        const tr = iframeDoc.createElement('tr');
        const actionCell = iframeDoc.createElement('td');
        const filenameCell = iframeDoc.createElement('td');
        const revisionCell = iframeDoc.createElement('td');
        const directoryCell = iframeDoc.createElement('td');

        if (model.isModified) {
            filenameCell.classList.add('modifiedModel');
        }

        actionCell.innerHTML = `<button onclick="CreoJS.openModel('${model.filename}')">Ouvrir</button