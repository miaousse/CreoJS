function buildList(models) {
    const container = document.getElementById("container");
    if (!models || models.length === 0) {
        showMessage("No modified models found", "INFO");
        return;
    }

    const table = document.createElement("table");
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    const headers = ['Actions', 'Fichier', 'DS1', 'Infos'];
    headers.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    const tbody = document.createElement("tbody");
    models.forEach(modelArr => {
        const [filename, ds1, directory, modifiedStatus] = modelArr;
        const row = tbody.insertRow();

        const actionsCell = row.insertCell();
		
		const buttons = [
			createHoverImageButton("display.png", "display_hover.png", "Display", 
				() => CreoJS.DisplayModel(filename)),
			createHoverImageButton("erase.png", "erase_hover.png", "Erase", 
				() => CreoJS.EraseModel(filename).then(window.location.reload())),
			createHoverImageButton("save.png", "save_hover.png", "Save", 
				() => CreoJS.SaveModel(filename).then(window.location.reload())))
		];

		actionsCell.append(...buttons);

		const filenameCell = row.insertCell();
		filenameCell.textContent = filename;
		row.insertCell().innerHTML = `DS1: ${ds1}<br>${directory}`;
	});

	table.appendChild(tbody);
	container.innerHTML = '';
	container.appendChild(table);
}
function createHoverImageButton(normalImg, hoverImg, altText, handler) {
    const LOCATION = './assets/';
    const button = document.createElement("button");
    const img = document.createElement("img");
    
    img.src = `${LOCATION}${normalImg}`;
    img.alt = altText;
    img.style.width = '25px';
    img.style.height = '25px';
    img.style.verticalAlign = 'middle';
    
    // Create custom tooltip element
    const tooltip = document.createElement('span');
    tooltip.className = 'custom-tooltip';
    tooltip.textContent = altText;
    
    // Event handlers
    button.addEventListener('mouseenter', () => {
        img.src = `${LOCATION}${hoverImg}`;
        tooltip.style.visibility = 'visible';
        tooltip.style.opacity = '1';
    });
    
    button.addEventListener('mouseleave', () => {
        img.src = `${LOCATION}${normalImg}`;
        tooltip.style.visibility = 'hidden';
        tooltip.style.opacity = '0';
    });

    button.appendChild(img);
    button.appendChild(tooltip);
    button.onclick = handler;
    
    // Required styling
    button.style.position = 'relative';
    button.style.cursor = 'pointer';
    // button.style.background = 'none';
    button.style.border = 'none';
    button.style.padding = '5px';
    button.style.margin = '2px';
    
    return button;
}



function showMessage(message, type = "INFO") {
    const checker = document.getElementById("container");
    checker.textContent = message;
    checker.style.color = type === "ERROR" ? "red" : "green";
}
