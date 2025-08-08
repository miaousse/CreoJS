const rootFolder = 'C:/Users/jrcivetta/Documents/';
const directories = [
    { key: 'Socles', item: 'IRVE/Socle/00_Base_Gamme' },
    { key: 'Coffret d\'exploitation', item: 'IRVE/Coffret_exploitation/00_Base_Gamme' },
    { key: 'Coffret SPCM', item: 'IRVE/Coffret_SPCM/00_Base_Gamme' },
    { key: 'Coffret de protection', item: 'IRVE/Coffret_protection/00_Base_Gamme' },
    { key: 'Borne de recharge', item: 'IRVE/Borne_Recharge/00_Base_Gamme' },
    { key: 'CD2M', item: 'cd2m/' }
];

function createDirectoryList() {
    const ul = document.createElement('ul');
    
    directories.forEach(dir => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = dir.key;
        a.href = '#';
        a.onclick = function(e) {
            e.preventDefault();
            CreoJS.changeDir(rootFolder + dir.item);
            setTimeout(() => {
                location.reload();
            }, 100);
        };
        li.className = 'directory';

        li.appendChild(a);
        ul.appendChild(li);
    });

    document.body.appendChild(ul);
}

let blurred = false;

window.addEventListener('blur', function() {
    blurred = true;
});

window.addEventListener('focus', function() {
    if (blurred) {
        blurred = false;
        window.location.reload();
    }
});
