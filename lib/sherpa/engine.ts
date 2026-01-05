// lib/sherpa/engine.ts
// Moteur d'Analyse LLM Simulé (Sherpa Layer 2)
import { GearItem, Trek } from "@/types";

interface LLMAnalysis {
    summary: string;
    recommendations: {
        item: string;
        reason: string;
    }[];
}

/**
 * Simule l'appel à un LLM (comme Gemini ou GPT-4) pour analyser
 * un pack d'équipement et générer des recommandations textuelles.
 * * @param pack Le sac à dos actuel de l'utilisateur.
 * @param trek Le trek ciblé.
 * @returns Une analyse textuelle personnalisée.
 */
export async function generateLLMAnalysis(pack: GearItem[], trek: Trek): Promise<LLMAnalysis> {
    
    // Simuler le temps de latence de l'API LLM
    await new Promise(resolve => setTimeout(resolve, 800));

    const totalWeightKg = pack.reduce((sum, item) => sum + item.weight, 0) / 1000;
    const isHeavy = totalWeightKg > 10;
    const missingShelter = !pack.some(item => item.category === 'shelter');
    const isSpirit = trek.theme === 'spirit';

    let summary = `Votre pack pour le ${trek.name} a un poids total de ${totalWeightKg.toFixed(1)} kg. `;
    
    // Déterminer le ton et la sévérité
    if (isHeavy) {
        summary += "C'est un poids considérable pour ce parcours. L'optimisation sera votre priorité pour minimiser la fatigue sur les étapes les plus dures. ";
    } else {
        summary += "Le poids est bien maîtrisé, ce qui est excellent pour les longues journées en montagne. Concentrez-vous sur les détails techniques.";
    }

    if (isSpirit) {
        summary += `Étant donné l'esprit Pèlerin, assurez-vous que votre pack reflète la simplicité et la résilience requises pour les chemins comme le Camino.`;
    } else {
        summary += `La nature alpine du trek exige que chaque pièce soit fiable face à des conditions extrêmes.`;
    }

    const recommendations = [];

    // Recommandation 1: Poids
    if (totalWeightKg > 12) {
        recommendations.push({
            item: "Réduction du Poids",
            reason: `Votre pack dépasse le seuil de confort de ${totalWeightKg - 12} kg. Envisagez de remplacer la tente ou le sac de couchage par des modèles ultra-légers.`,
        });
    }

    // Recommandation 2: Essentiels manquants
    if (missingShelter && !isSpirit) {
        recommendations.push({
            item: "Abri de Secours",
            reason: `Aucun abri principal détecté (tente ou bâche). C'est critique pour le GR20/TMB en cas de météo imprévue. Ajoutez une tente légère ou un tarp de secours.`,
        });
    }
    
    // Recommandation 3: Spécifique au Trek
    if (trek.name.includes("GR20")) {
        recommendations.push({
            item: "Chaînes et Mousquetons",
            reason: "Le GR20 est très engagé, surtout au Nord. Vérifiez l'usure de vos chaînes ou ajoutez une longe d'assurage pour les passages aériens.",
        });
    }

    // Recommandation 4: Hydratation (toujours pertinente)
    recommendations.push({
        item: "Filtration d'Eau",
        reason: "Sur les treks longs, la purification est essentielle. Confirmez la présence d'une gourde filtrante ou de pastilles de purification.",
    });

    return { summary, recommendations };
}

// Moteur LLM V2 (Placeholder pour l'avenir)
export function getLLMAnalysisPlaceholder() {
    return {
        summary: "Analyse en cours par l'IA Sherpa. Veuillez ajouter plus d'articles à votre pack pour obtenir des conseils plus précis sur votre profil de risque.",
        recommendations: [],
    };
}