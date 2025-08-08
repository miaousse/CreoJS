const models = [
    { name: '30621-08', type: 'prt', desc: 'Plaque De Recouvrement', origin: 'inconnu' },
    { name: '32098-12', type: 'asm', desc: 'Coffret 1 Module', origin: 'inconnu' },
    { name: 'P0036053', type: 'asm', desc: 'Amoire 5 modules', origin: 'inconnu' },
    { name: '32103-12', type: 'asm', desc: 'Coffret 3 modules', origin: 'inconnu' },
    { name: '32385-12', type: 'asm', desc: 'Socle Mono Sans Terrassement', origin: 'inconnu' },
    { name: '32427-12', type: 'asm', desc: 'Socle Dos A Dos', origin: 'inconnu' },
    { name: '32692-12', type: 'asm', desc: 'Socle Mono', origin: 'inconnu' },
    { name: '32687-12', type: 'asm', desc: 'Socle Cote A Cote', origin: 'inconnu' },
    { name: '34459-12', type: 'asm', desc: 'Coffret d\'exploitation', origin: 'inconnu' },
    { name: '35866-12', type: 'asm', desc: 'Socle Cote A Cote Sans Terrassement', origin: 'inconnu' },
    { name: '35884-12', type: 'asm', desc: 'Socle Dos A Dos Sans Terrassement', origin: 'inconnu' }
];

function createModelsList() {
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '550px';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['3D', '2D', 'Numero', 'Description'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
	
    const sortedModels = models.sort((a, b) => a.name.localeCompare(b.name));
    sortedModels.forEach(model => {
	const row = document.createElement('tr');

	const createImage = (src, handler, tooltip) => {
	  const img = document.createElement('img');
	  img.src = src;
	  img.onclick = () => {
			handler();
			document.getElementById('action').classList.add('highlight');
	  };
	  img.setAttribute('draggable', 'true');
	  img.title = tooltip;
	  img.style.cursor = 'pointer';
	  return img;
	};


        const td3D = document.createElement('td');
        td3D.appendChild(createImage(getModelImage(model.type), () => openModel(model.name, model.type), `Ouvrir ${model.type}`));
        row.appendChild(td3D);

        const td2D = document.createElement('td');
        td2D.appendChild(createImage(getModelImage('drw'), () => openModel(model.name, 'drw'), `Ouvrir drw`));
        row.appendChild(td2D);

        const span = document.createElement('span');
        span.appendChild(document.createTextNode(model.name));
        
        const tdName = document.createElement('td');
        tdName.style.display = 'flex';
        tdName.style.alignItems = 'center';
        tdName.appendChild(span);
        
        row.appendChild(tdName);

        const tdDesc = document.createElement('td');
        tdDesc.textContent = model.desc;
        tdDesc.style.maxWidth = '300px';
        tdDesc.style.overflow = 'hidden';
        tdDesc.style.textOverflow = 'ellipsis';
        row.appendChild(tdDesc);

        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    document.body.appendChild(table);
}


function openModel(modelName, type) {
    const action = document.getElementById('action');
    action.textContent = `ouverture de ${modelName}.${type}`;
	CreoJS.getModel(modelName, type)
		.then(model => {
			 setTimeout(() => {
				action.classList.remove('highlight');
				action.textContent = ''; // Clear the span
			  }, 500);
		});
	
}


function getModelImage(modelType) {
    const sourceDirectory = 'C:/CAO/Appli/Creo 10.0.6.0/Common Files/text/resource/';
    const imageMap = {
        'prt': 'part16x16.png',
        'asm': 'assembly16x16.png',
        'drw': 'drawing_app16x16.png'
    };
    
    const imageName = imageMap[modelType] || 'default16x16.png';
    
    return sourceDirectory + imageName;
}
let blurred = false;

window.addEventListener('blur', function() {
	blurred = true;
});

window.addEventListener('focus', function() {
	if (blurred) {
		window.location.reload();
		blurred = false;
	}
});