document.addEventListener('DOMContentLoaded', () => {
    renderTable();
});

function renderTable() {
    const tableBody = document.getElementById('modelsTableBody');
    tableBody.innerHTML = ''; // Clear existing rows
    const models = JSON.parse(localStorage.getItem('models')) || [];

    models.forEach((model, index) => {
        const iconPath = getIconPath(model.type);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="button-container">
                    <button class="actionButton" onclick="CreoJS.openModel('${model.ds1}', '${model.name}', '${model.type}')">Open</button>
                    <button class="actionButton" onclick="deleteModel(${index})">Delete</button>
                </div>
            </td>
            <td><img src="${iconPath}" class="model-icon" alt="${model.type} icon">${model.name}</td>
            <td> ${model.ds1}</td>
        `;
        tableBody.appendChild(row);
    });
}

function getIconPath(type) {
    switch (type.toUpperCase()) {
        case 'ASSEMBLY':
            return './assets/assembly32x32.png';
        case 'PART':
            return './assets/part32x32.png';
        case 'DRAWING':
            return './assets/drawing32x32.png';
        default:
            return '';
    }
}

function deleteModel(index) {
    const models = JSON.parse(localStorage.getItem('models')) || [];
    models.splice(index, 1); // Remove item at index
    localStorage.setItem('models', JSON.stringify(models));
    renderTable(); // Refresh table
}