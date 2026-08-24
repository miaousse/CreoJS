let blurred = false;

window.addEventListener('blur', function() {
	blurred = true;
});

window.addEventListener('focus', function() {
	if (blurred) {
		setTimeout(initialize, 100);
		initialize();
		// window.location.reload();
		blurred = false;
	}
});

function reloadPage() {
	initialize();
	// window.location.reload();
}

function copyToClipboard(elementId) {
	const infoDiv = document.getElementById('info');
	const domElement = document.getElementById(elementId);
	let copiedText = '';
	
	infoDiv.style.color = '#4CAF50';
	switch (domElement.tagName) {
		case 'SPAN':
			copiedText = domElement.textContent;
			break;
		case 'INPUT':
			copiedText = domElement.value;
			break;
		default:
			copiedText = 'Erreur de copie';
			infoDiv.style.color = '#ce3a34';
	}
	navigator.clipboard.writeText(copiedText);
	infoDiv.textContent = `${copiedText} copié dans le presse-papier`;
}

function copyRevision() {
	const infoDiv = document.getElementById('info');
	const INDICE = document.getElementById('Indice').value;
	const INDICEMIN = document.getElementById('Indice_min').value;
	const TEXT = INDICE + INDICEMIN;
	navigator.clipboard.writeText(TEXT);
	infoDiv.textContent = `${TEXT} copié dans le presse-papier`;
}

function handleChangeMajorRevision(id, value) {
	CreoJS.updateParameterValueFromHTML(id, value);

	const minorRevision = 'Indice_min';
	const minorRevisionValue = 0;
	const field = document.getElementById(minorRevision);

	CreoJS.updateParameterValueFromHTML(minorRevision, minorRevisionValue);
	field.value = minorRevisionValue;
}

/**
 * updateDrawingActionButtons
 * Active/désactive les boutons "2D" et "PDF" en fonction de la disponibilité
 * réelle du dessin associé au modèle actif (isDrawing / hasDrawing calculés
 * côté Creo.JS par getDrawingAvailability, Single Source of Truth).
 * Le bouton STEP n'est pas concerné : il exporte le solide 3D, pas le dessin.
 */
function updateDrawingActionButtons(isDrawing, hasDrawing) {
	const shouldDisable = isDrawing || !hasDrawing;
	const btn2D = document.getElementById('btn2D');
	const btnPdf = document.getElementById('btnPdf');

	if (btn2D) btn2D.disabled = shouldDisable;
	if (btnPdf) btnPdf.disabled = shouldDisable;
}

function generateRalPalette() {
    const paletteContainer = document.getElementById('ral-palette');
    if (!paletteContainer) return;

    const favorites = [
        { code: '1003', hex: '#F2A900', text: 'dark' },
        { code: '1015', hex: '#F5F5DC', text: 'dark' },
        { code: '1018', hex: '#E5BE01', text: 'dark' },
        { code: '2004', hex: '#DE5306', text: 'light' },
        { code: '3020', hex: '#AF2B1E', text: 'light' },
        { code: '5012', hex: '#7FB5D1', text: 'dark' },
        { code: '5014', hex: '#687C96', text: 'light' },
        { code: '5015', hex: '#0B7BB0', text: 'light' },
        { code: '6018', hex: '#599A39', text: 'light' },
        { code: '6019', hex: '#B9CEAC', text: 'dark' },
        { code: '7035', hex: '#C5C7C4', text: 'dark' },
        { code: '9003', hex: '#E7EBDA', text: 'dark' },
        // { code: '9005', hex: '#0A0A0A', text: 'light' },
        // { code: '9010', hex: '#FFFFFF', text: 'dark' }
    ];

    favorites.forEach(ral => {
        const btn = document.createElement('button');
        btn.className = 'ral-btn';
        btn.style.backgroundColor = ral.hex;
        btn.style.color = ral.text === 'light' ? '#FFFFFF' : '#1e293b';
        btn.title = `Assigner le RAL ${ral.code}`;
        btn.innerText = ral.code;
        
        // On appelle ta fonction existante dans changeColor.creojs
        btn.onclick = () => CreoJS.assignRALColor(ral.code);
        
        paletteContainer.appendChild(btn);
    });
}
