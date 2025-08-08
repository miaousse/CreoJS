let allModels = [];
let showModifiedOnly = false;
let activeTypeFilters = [];

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


function buildList(models) {
	models.sort((a, b) => {
		if (a.filename !== b.filename) {
			return a.filename < b.filename ? -1 : 1;
		} else {
			return a.isModified - b.isModified;
		}
	});

	const container = document.getElementById("container");

	if (!models || models.length === 0) {
		showMessage("Pas de modèle en session", "INFO");
		return;
	}

	const table = document.createElement("table");
	const thead = table.createTHead();
	const headerRow = thead.insertRow();
	const headers = ['Actions', 'Fichier', 'Rev', 'DS1/Répertoire'];
	headers.forEach(headerText => {
		const th = document.createElement("th");
		th.textContent = headerText;
		headerRow.appendChild(th);
	});

	const tbody = document.createElement("tbody");

	models.forEach(model => {
		const row = tbody.insertRow();
		const actionsCell = row.insertCell();

		const buttons = [
			createHoverImageButton("display.png", "displayHover.png", "Display",
				() => CreoJS.DisplayModel(model.filename)),
			createHoverImageButton("erase.png", "eraseHover.png", "Erase",
				() => CreoJS.EraseModel(model.filename).then(refreshModelsAndList))
		];

		if (model.isModified) {
			buttons.push(createHoverImageButton("save.png", "saveHover.png", "Save",
				() => CreoJS.SaveModel(model.filename).then(refreshModelsAndList)));
		}

		actionsCell.append(...buttons);

		const filenameCell = row.insertCell();
		filenameCell.textContent = model.filename;
		if (model.isModified) {
			filenameCell.classList.add('modifiedModel');
		}
		row.insertCell().innerHTML = `${model.revision}`;
		row.insertCell().innerHTML = `${model.ds1}<br>${model.directory}`;
	});

	table.appendChild(tbody);
	container.innerHTML = '';
	container.appendChild(table);
}

function clearInput(inputId) {
	const input = document.getElementById(inputId);
	input.value = '';
	input.focus();
}

function createHoverImageButton(normalImg, hoverImg, altText, handler) {
	const LOCATION = './assets/';
	const container = document.createElement("div");
	const img = document.createElement("img");
	img.src = `${LOCATION}${normalImg}`;
	img.alt = altText;
	img.style.width = '15px';
	img.style.height = '15px';
	img.style.verticalAlign = 'middle';
	img.style.cursor = 'pointer';

	container.addEventListener('mouseenter', () => {
		img.src = `${LOCATION}${hoverImg}`;
	});
	container.addEventListener('mouseleave', () => {
		img.src = `${LOCATION}${normalImg}`;
	});
	img.addEventListener('click', handler);

	container.appendChild(img);
	container.style.position = 'relative';
	container.style.display = 'inline-block';
	container.style.padding = '5px';
	container.style.margin = '2px';
	return container;
}

document.getElementById('filenameFilter').addEventListener('keyup', () => {
    // showMessage('Key pressed in filter', 'INFO');
    applyFilters();
});

document.getElementById('modifiedFilter')?.addEventListener('click', function() {
    // showMessage(`Modified filter clicked, checked: ${this.checked}`, 'INFO');
    showModifiedOnly = this.checked;
    applyFilters();
});

document.querySelectorAll('.type-filters input').forEach(checkbox => {
    checkbox.addEventListener('click', function() {
        if (this.checked) {
            activeTypeFilters.push(this.value);
        } else {
            activeTypeFilters = activeTypeFilters.filter(t => t !== this.value);
        }
        // showMessage(`Type filter ${this.value} clicked, checked: ${this.checked}`, 'INFO');
        applyFilters();
    });
});



function showMessage(message, type = "INFO") {
    const checker = document.getElementById("debugMessages");
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.color = type === "ERROR" ? "red" : "green";
    messageDiv.style.margin = '5px 0';
    checker.appendChild(messageDiv);
    setTimeout(() => {
        messageDiv.remove();
    }, 500);
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
    // showMessage(`Filtered ${filteredModels.length} of ${allModels.length} models`, 'INFO');
    buildList(filteredModels);
}