function readRevisionTable() {
    const session = pfcGetCurrentSession();
    const model = session.CurrentModel;
    
    if (model.Type !== pfcModelType.MDL_DRAWING) return [];

    const tables = model.ListTables();
    let dataFound = [];

    for (let i = 0; i < tables.Count; i++) {
        const table = tables.Item(i);
        // On vérifie si la cellule 1,1 contient "Ind."
        try {
            const firstCell = table.GetText(pfcTableCell.Create(1, 1), pfcParamMode.DWGTABLE_NORMAL);
            if (firstCell && firstCell.Item(0).includes("Ind.")) {
                const rows = table.GetRowCount();
                // On lit les lignes existantes (en sautant l'entête à la ligne 1)
                for (let r = 2; r <= rows; r++) {
                    dataFound.push({
                        ind: table.GetText(pfcTableCell.Create(r, 1), pfcParamMode.DWGTABLE_NORMAL).Item(0),
                        mod: table.GetText(pfcTableCell.Create(r, 2), pfcParamMode.DWGTABLE_NORMAL).Item(0),
                        ver: table.GetText(pfcTableCell.Create(r, 3), pfcParamMode.DWGTABLE_NORMAL).Item(0),
                        date: table.GetText(pfcTableCell.Create(r, 4), pfcParamMode.DWGTABLE_NORMAL).Item(0)
                    });
                }
                break; // On a trouvé notre table, on arrête
            }
        } catch(e) {}
    }
    return dataFound;
}