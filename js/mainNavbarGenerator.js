// On place le code dans une fonction pour pouvoir l'appeler au bon moment
function generateNavbar() {
    // Get the current page filename
    const currentPage = window.location.pathname.split('/').pop();

    const navContainer = document.getElementById('main-navbar');
    
    // Sécurité : si le conteneur n'existe pas, on sort pour éviter l'erreur
    if (!navContainer) return;

    const navDiv = document.createElement('div');
    navDiv.className = 'nav-buttons';

    navButtons.forEach(btn => {
        const button = document.createElement('button');
        button.id = btn.id;
        button.className = 'actionButton';
        button.textContent = btn.label;

        if (btn.href === currentPage) {
            button.disabled = true; // Disable if it's the current page
        } else {
            button.onclick = () => window.location.href = btn.href;
        }

        navDiv.appendChild(button);
    });

    // On vide le conteneur au cas où (évite les doublons si on relance)
    navContainer.innerHTML = '';
    navContainer.appendChild(navDiv);
}

// On demande au navigateur de lancer la fonction dès que le HTML est prêt
document.addEventListener('DOMContentLoaded', generateNavbar);
