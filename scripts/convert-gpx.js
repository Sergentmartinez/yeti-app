const fs = require('fs');
const path = require('path');

// CONFIGURATION
const SOURCE_DIR = path.join(__dirname, 'gpx_source');
const OUTPUT_FILE = path.join(__dirname, '../lib/treks/tracks/gr20-tracks.ts');
const SAMPLING_RATE = 1; // ✅ Garde 1 point sur 3 (entier!)

console.log("🏔️  Démarrage de la conversion GPX pour YETI...");

function parseGPX(content) {
    const points = [];
    const regex = /<trkpt\s+lat="([\d.-]+)"\s+lon="([\d.-]+)">[\s\S]*?<ele>([\d.-]+)<\/ele>/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        points.push({
            lat: parseFloat(match[1]),
            lon: parseFloat(match[2]),
            ele: parseFloat(match[3])
        });
    }
    return points;
}

function simplifyTrack(points) {
    if (points.length === 0) return [];
    const simplified = [];
    simplified.push(points[0]); // Premier point
    for (let i = 1; i < points.length - 1; i++) {
        if (i % SAMPLING_RATE === 0) simplified.push(points[i]);
    }
    simplified.push(points[points.length - 1]); // Dernier point
    return simplified;
}

function convert() {
    let outputContent = `import { GPSPoint } from "@/types";\n\n`;
    const exportKeys = [];

    for (let i = 1; i <= 15; i++) {
        const num = i.toString().padStart(2, '0');
        const fileName = `gr20-e${num}.gpx`;
        const filePath = path.join(SOURCE_DIR, fileName);

        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            const rawPoints = parseGPX(content);
            const simplePoints = simplifyTrack(rawPoints);

            console.log(`✅ Étape ${i} (${fileName}): ${rawPoints.length} pts -> ${simplePoints.length} pts`);
            outputContent += `// Étape ${i}\nexport const GR20_E${num}_TRACK: GPSPoint[] = ${JSON.stringify(simplePoints)};\n\n`;
            exportKeys.push(`${i}: GR20_E${num}_TRACK`);
        } else {
            console.warn(`⚠️ Fichier manquant : ${fileName}`);
        }
    }

    outputContent += `export const GR20_TRACKS: Record<number, GPSPoint[]> = {\n  ${exportKeys.join(',\n  ')}\n};\n`;

    try {
        const dir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(OUTPUT_FILE, outputContent);
        console.log(`\n🎉 SUCCÈS ! Fichier généré ici : ${OUTPUT_FILE}`);
    } catch (e) {
        console.error("❌ Erreur :", e);
    }
}

convert();