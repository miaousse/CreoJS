function loadDirectories() {
	const storedDirectories = localStorage.getItem('directories');
	if (storedDirectories) {
		return JSON.parse(storedDirectories);
	}
	return [];
}

function loadModels() {
    const storedModels = localStorage.getItem('models');
    if (storedModels) {
        return JSON.parse(storedModels);
    }
    return [];
}

function saveModels(models) {
    localStorage.setItem('models', JSON.stringify(models));
}


function saveDirectories(directories) {
	localStorage.setItem('directories', JSON.stringify(directories));
}

function addDirectory() {
	const path = document.getElementById('path-input').value;
	const description = document.getElementById('description-input').value;

	if (path && description) {
		const directories = loadDirectories();
		directories.push({
			key: description,
			item: path
		});
		saveDirectories(directories);
		createDirectoryList();

		document.getElementById('path-input').value = '';
		document.getElementById('description-input').value = '';
	}
}

function addCurrentDirectory() {
	CreoJS.getCurrentDirectory()
		.then(currentPath => {
			const directories = loadDirectories();
			const existingDir = directories.find(dir => dir.item === currentPath);

			const addButton = document.getElementById('addCurrentDirButton');

			if (existingDir) {
				addButton.style.display = 'none';
			} else {
				addButton.style.display = 'block';
			}
		})
		.catch(error => {
			console.error('Failed to get current directory:', error);
		});
}

function removeDirectory(index) {
    if (confirm('Est tu sur de vouloir supprimer le repertoire ?')) {
        const directories = loadDirectories();
        directories.splice(index, 1);
        saveDirectories(directories);
        createDirectoryList();
    }
}
function createDirectoryList() {
	CreoJS.getCurrentDirectory()
		.then(currentPath => {
			const directories = loadDirectories();
			const table = document.createElement('table');
			table.className = 'directory-table';

			// Create table header
			const thead = document.createElement('thead');
			const headerRow = document.createElement('tr');
			const actionsHeader = document.createElement('th');
			actionsHeader.textContent = 'Actions';
			const descriptionHeader = document.createElement('th');
			descriptionHeader.textContent = 'Description';
			headerRow.appendChild(actionsHeader);
			headerRow.appendChild(descriptionHeader);
			thead.appendChild(headerRow);
			table.appendChild(thead);

			// Create table body
			const tbody = document.createElement('tbody');
			directories.forEach((dir, index) => {
				const row = document.createElement('tr');

				if (currentPath.includes(dir.item)) {
					row.classList.add('current-working-directory');
				}

				const actionsCell = document.createElement('td');
				const checkImage = document.createElement('img');
				checkImage.src = './assets/check.png';
				checkImage.className = 'actionImage';
				checkImage.onmouseover = function() { this.src = './assets/checkHover.png'; };
				checkImage.onmouseout = function() { this.src = './assets/check.png'; };
				checkImage.onclick = function() {
					CreoJS.changeDir(dir.item)
						.then(() => CreoJS.getCurrentDirectory())
						.then(path => {
							//document.getElementById('workingDirectory').innerHTML = path;
							createDirectoryList(); // Refresh the table to update highlighting
						})
						.catch(error => {
							console.error('Failed to change directory:', error);
							alert('Failed to change directory. Please check if the path is correct.');
						});
				};

				const deleteImage = document.createElement('img');
				deleteImage.src = './assets/delete.png';
				deleteImage.className = 'actionImage';
				deleteImage.onmouseover = function() { this.src = './assets/deleteHover.png'; };
				deleteImage.onmouseout = function() { this.src = './assets/delete.png'; };
				deleteImage.onclick = function() {
					removeDirectory(index);
				};

				actionsCell.appendChild(checkImage);
				actionsCell.appendChild(deleteImage);

				// Description column
				const descriptionCell = document.createElement('td');
				
				const pathText = dir.key;
				if (currentPath.includes(dir.item)) {
					descriptionCell.className = 'working-dir';
				}


				descriptionCell.textContent = pathText;
				row.appendChild(actionsCell);
				row.appendChild(descriptionCell);
				tbody.appendChild(row);
			});

			table.appendChild(tbody);

			const directoryList = document.getElementById('directory-list');
			directoryList.innerHTML = '';
			directoryList.appendChild(table);
		})
		.catch(error => {
			console.error('Failed to get current directory:', error);
		});
}