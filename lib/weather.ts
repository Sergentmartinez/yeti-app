// lib/weather.ts

export interface MonthlyWeather {
    month: string;
    tempDay: number; // Température moyenne jour (°C)
    tempNight: number; // Température moyenne nuit (°C)
    rainDays: number; // Jours de pluie par mois
    sunHours: number; // Heures d'ensoleillement par jour (moyenne)
    snowRisk: boolean; // Risque de neige significatif
}

const GR20_WEATHER: MonthlyWeather[] = [
    { month: "Mai", tempDay: 14, tempNight: 4, rainDays: 12, sunHours: 6, snowRisk: true },
    { month: "Juin", tempDay: 18, tempNight: 8, rainDays: 9, sunHours: 8, snowRisk: false },
    { month: "Juillet", tempDay: 22, tempNight: 12, rainDays: 6, sunHours: 10, snowRisk: false },
    { month: "Août", tempDay: 23, tempNight: 12, rainDays: 7, sunHours: 9, snowRisk: false },
    { month: "Septembre", tempDay: 19, tempNight: 7, rainDays: 8, sunHours: 7, snowRisk: false },
    { month: "Octobre", tempDay: 14, tempNight: 4, rainDays: 10, sunHours: 5, snowRisk: true },
];

const TMB_WEATHER: MonthlyWeather[] = [
    { month: "Juin", tempDay: 16, tempNight: 5, rainDays: 10, sunHours: 7, snowRisk: true },
    { month: "Juillet", tempDay: 20, tempNight: 9, rainDays: 8, sunHours: 9, snowRisk: false },
    { month: "Août", tempDay: 21, tempNight: 9, rainDays: 7, sunHours: 8, snowRisk: false }, 
    { month: "Septembre", tempDay: 16, tempNight: 5, rainDays: 9, sunHours: 6, snowRisk: false },
];

const CAMINO_WEATHER: MonthlyWeather[] = [
    { month: "Avril", tempDay: 17, tempNight: 7, rainDays: 12, sunHours: 6, snowRisk: false },
    { month: "Mai", tempDay: 20, tempNight: 10, rainDays: 10, sunHours: 8, snowRisk: false },
    { month: "Juin", tempDay: 25, tempNight: 14, rainDays: 6, sunHours: 10, snowRisk: false }, 
    { month: "Juillet", tempDay: 28, tempNight: 16, rainDays: 4, sunHours: 11, snowRisk: false },
    { month: "Août", tempDay: 27, tempNight: 15, rainDays: 5, sunHours: 10, snowRisk: false },
    { month: "Septembre", tempDay: 23, tempNight: 12, rainDays: 7, sunHours: 8, snowRisk: false },
    { month: "Octobre", tempDay: 18, tempNight: 8, rainDays: 10, sunHours: 6, snowRisk: false },
];

/**
 * Récupère les données météo mensuelles pour un trek donné.
 */
export function getTrekWeather(slug: string): MonthlyWeather[] {
    switch (slug) {
        case "gr20-corse":
            return GR20_WEATHER;
        case "tour-mont-blanc":
            return TMB_WEATHER;
        case "camino":
            return CAMINO_WEATHER;
        default:
            return [];
    }
}