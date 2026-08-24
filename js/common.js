/**
 * Utilitaires UI partagés entre plusieurs pages (workingDirectories, enSession, ...).
 * Chargé avant les scripts spécifiques à chaque page.
 */

/**
 * Crée un bouton icône Material Symbols cliquable.
 * @param {string} iconName - Nom de l'icône Material Symbols (ex: 'open_in_new').
 * @param {string} title - Texte d'aide affiché au survol (tooltip).
 * @param {Function} onClick - Callback exécuté au clic.
 * @param {string} [extraClass] - Classe CSS additionnelle (ex: 'btn-danger').
 * @returns {HTMLButtonElement}
 */
function createIconBtn(iconName, title, onClick, extraClass) {
    const btn = document.createElement('button');
    btn.className = 'action-icon-btn' + (extraClass ? ' ' + extraClass : '');
    btn.title = title;
    btn.innerHTML = `<span class="material-symbols-outlined">${iconName}</span>`;
    btn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        onClick();
    };
    return btn;
}

// Icône 3D à afficher selon le type de fichier (prt/asm).
const MODEL_3D_ICON_BY_TYPE = {
    asm: 'account_tree',
    prt: 'view_in_ar'
};

/**
 * Retourne le nom de l'icône Material Symbols pour un type de modèle 3D donné.
 * Fonction pure : mêmes entrées → même sortie, aucun effet de bord.
 */
function get3DIconName(modelType) {
    return MODEL_3D_ICON_BY_TYPE[modelType] || 'view_in_ar';
}

/**
 * Construit une cellule de tableau contenant un bouton icône, ou un tiret
 * si l'action n'est pas disponible pour cette ligne (ex. pas de mise en
 * plan pour ce modèle). Centralise ce motif "icône ou tiret" utilisé sur
 * plusieurs pages (workingDirectories, enSession).
 */
function buildActionCell({ isAvailable, iconName, title, extraClass, onOpen }) {
    const cell = document.createElement('td');
    cell.className = 'col-action';

    if (!isAvailable) {
        cell.innerHTML = '<span style="color:var(--text-light)">—</span>';
        return cell;
    }

    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'icon-cell-inner';
    iconWrapper.appendChild(createIconBtn(iconName, title, onOpen, extraClass));
    cell.appendChild(iconWrapper);

    return cell;
}
