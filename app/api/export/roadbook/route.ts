// app/api/export/roadbook/route.ts

import { NextRequest } from 'next/server';
import { getAllTreks, MOCK_USER } from '@/lib/data';
// 🚨 Risque d'erreur : Assurez-vous que GEAR_ITEMS est un export simple
// Sinon, il est préférable de le placer dans un fichier dédié aux MOCKs Serveur
import { GEAR_ITEMS } from '@/lib/gear'; 


// Simuler la bibliothèque PDF (en production on utiliserait 'html-pdf' ou 'puppeteer')
const generatePdfContent = (trekName: string, userName: string, totalWeight: number): string => {
    
    // --- 📄 ROADBOOK TEMPLATE Fictif ---
    let content = `
*****************************************************
** YETI ROADBOOK V1.0 - Accès Privilégié     **
*****************************************************

PLANIFICATEUR: ${userName}
TREK CHOISI: ${trekName}
POIDS TOTAL DU SAC: ${ (totalWeight / 1000).toFixed(2) } kg
DATE DE GÉNÉRATION: ${new Date().toLocaleDateString('fr-FR')}

--- SECTION 1 : LOGISTIQUE DE DÉPART ---
* Point d'accès : (Information fournie par l'API)
* Statut de Sécurité (Sherpa Layer 1) : VÉRIFIÉ ET OK

--- SECTION 2 : ITINÉRAIRE DÉTAILLÉ ---
[Données d'étapes simulées pour économiser la mémoire]
Etape 1 : Jour 1 - Dénivelé +950m
Etape 2 : Jour 2 - Dénivelé +1200m
(Voir la liste complète sur l'application YETI)

--- SECTION 3 : CHECKLIST MATÉRIEL ---
[Extrait de votre pack personnalisé]
- Tente Ultralight (350g)
- Sac de Couchage (600g)
- Trousse de secours (OBLIGATOIRE)

*****************************************************
Ce document est valide pour l'obtention des réductions partenaires YETI.
*****************************************************
`;
    return content.trim();
};


/**
 * Route Handler pour générer et télécharger le Roadbook (PDF/TXT)
 * Endpoint: /api/export/roadbook?slug=trek-slug
 */
export async function GET(request: NextRequest) {
    
    try {
        // 1. Récupération des paramètres (slug du trek)
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (!slug) {
            return new Response(JSON.stringify({ error: 'Le paramètre slug du trek est requis.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 2. Récupération des données (Simulation)
        const trek = getAllTreks().find(t => t.slug === slug);
        const pack = GEAR_ITEMS.slice(0, 5); 

        if (!trek) {
            return new Response(JSON.stringify({ error: `Trek non trouvé pour le slug: ${slug}` }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Calcul du poids total simulé (pour l'affichage)
        const totalWeight = pack.reduce((sum, item) => sum + item.weight, 0);

        // 3. Génération du contenu (Simulé en TXT pour la V1)
        const roadbookContent = generatePdfContent(trek.name, MOCK_USER.username, totalWeight);

        // 4. Création de la Réponse HTTP pour le Téléchargement
        return new Response(roadbookContent, {
            status: 200,
            headers: {
                'Content-Disposition': `attachment; filename="YETI_Roadbook_${slug}.txt"`,
                'Content-Type': 'text/plain', 
            },
        });

    } catch (error) {
        console.error("API Roadbook Error:", error);
        // Retourne une erreur 500 générique
        return new Response(JSON.stringify({ error: 'Internal Server Error during export generation.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}