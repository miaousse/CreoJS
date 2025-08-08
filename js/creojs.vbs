' Script : Liste et copie le contenu de chaque fichier d'un répertoire dans un fichier de sortie
Option Explicit

Const ForReading = 1
Const ForWriting = 2

Dim fso, dossier, fichier, sortie
Dim repertoire, cheminSortie

' À modifier selon votre besoin
repertoire = "C:\CAO\_CreoJS\css" ' <-- Remplacez par votre chemin
cheminSortie = "C:\CAO\css.txt" ' <-- Remplacez par votre chemin de sortie

Set fso = CreateObject("Scripting.FileSystemObject")

If Not fso.FolderExists(repertoire) Then
    WScript.Echo "Le répertoire n'existe pas."
    WScript.Quit
End If

Set dossier = fso.GetFolder(repertoire)
Set sortie = fso.OpenTextFile(cheminSortie, ForWriting, True)

For Each fichier In dossier.Files
    sortie.WriteLine "# " & fichier.Name
    sortie.WriteLine "## debut du fichier"
    Dim contenu
    On Error Resume Next
    contenu = ""
    Dim tf
    Set tf = fso.OpenTextFile(fichier.Path, ForReading)
    If Not tf Is Nothing Then
        contenu = tf.ReadAll
        tf.Close
    End If
    sortie.WriteLine contenu
    sortie.WriteLine "## fin du fichier"
    sortie.WriteLine ""
    On Error GoTo 0
Next

sortie.Close

Set sortie = Nothing
Set dossier = Nothing
Set fso = Nothing

WScript.Echo "Traitement terminé. Voir : " & cheminSortie
