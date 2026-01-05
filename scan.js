const fs = require('fs');
const path = require('path');

// On ignore les dossiers systèmes et lourds
const IGNORE_DIRS = ['node_modules', '.next', '.git', '.vscode', 'public', 'dist', 'build'];
// On ignore les fichiers de config lourds ou inutiles pour le contexte
const IGNORE_FILES = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'scan.js', 'next-env.d.ts', '.eslintrc.json'];
// On ne lit que ces extensions
const ALLOWED_EXTS = ['.ts', '.tsx', '.js', '.json', '.css', '.md'];

const outputFile = 'projet_complet.txt';
let output = '';

function scanDir(dir, depth = 0) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.includes(file)) {
                output += `\n📁 [DOSSIER] ${fullPath}\n`;
                scanDir(fullPath, depth + 1);
            }
        } else {
            if (!IGNORE_FILES.includes(file) && ALLOWED_EXTS.includes(path.extname(file))) {
                output += `\n📄 [FICHIER] ${fullPath}\n`;
                output += `--- DÉBUT DU CODE ---\n`;
                output += fs.readFileSync(fullPath, 'utf8');
                output += `\n--- FIN DU CODE ---\n`;
            }
        }
    });
}

console.log('Analyse de ton projet Yeti en cours...');
try {
    scanDir('.');
    fs.writeFileSync(outputFile, output);
    console.log(`✅ Succès ! Le fichier "${outputFile}" a été créé.`);
    console.log(`👉 Ouvre ce fichier, copie TOUT le texte, et donne-le à l'IA.`);
} catch (e) {
    console.error("Erreur :", e);
}