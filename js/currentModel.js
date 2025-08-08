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

function reloadPage() {
	window.location.reload();
}

function copyToClipboard(elementId) {
	const infoDiv = document.getElementById('info');
	const domElement = document.getElementById(elementId);
	let copiedText = '';

	infoDiv.style.color = '#4CAF50'
	switch (domElement.tagName) {
		case 'SPAN':
		copiedText = domElement.textContent;
		break;
	case 'INPUT':
		copiedText = domElement.value;
		break;
	return;
	default:
		copiedText = 'Erreur de copie';
		infoDiv.style.color = '#ce3a34';
	}
	navigator.clipboard.writeText(copiedText);
	infoDiv.textContent  = `${copiedText} copie dans le presse papier`;
}


function copyRevision() {
	const infoDiv = document.getElementById('info');
	const INDICE = document.getElementById('Indice').value;
	const INDICEMIN = document.getElementById('Indice_min').value;
	const TEXT = INDICE + INDICEMIN;
	navigator.clipboard.writeText(TEXT);
	infoDiv.textContent  = `${TEXT} copie dans le presse papier`;

}
