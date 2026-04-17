// app/basecamp/weather/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud, CloudRain, CloudSnow, CloudLightning, Sun, CloudSun,
  Wind, Droplets, Thermometer, Sunrise, Sunset, MapPin, Search,
  Calendar, AlertTriangle, Sparkles, Eye, Gauge, Compass,
  TrendingUp, TrendingDown, X, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const THEME = {
  red: "#f21e2c",
  orange: "#F9591F",
  yellow: "#FEC631",
  emerald: "#10b981",
  cyan: "#06b6d4",
  violet: "#8b5cf6",
  blue: "#3b82f6",
  pink: "#ec4899",
};

type IconType = React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties; strokeWidth?: number }>;

// ============================================================================
// WMO WEATHER CODES → ICÔNE + LABEL FR
// https://open-meteo.com/en/docs
// ============================================================================
const WMO: Record<number, { icon: IconType; label: string; color: string }> = {
  0: { icon: Sun, label: "Ciel dégagé", color: THEME.yellow },
  1: { icon: Sun, label: "Principalement clair", color: THEME.yellow },
  2: { icon: CloudSun, label: "Partiellement nuageux", color: "#fbbf24" },
  3: { icon: Cloud, label: "Couvert", color: "#94a3b8" },
  45: { icon: Cloud, label: "Brouillard", color: "#94a3b8" },
  48: { icon: Cloud, label: "Brouillard givrant", color: "#94a3b8" },
  51: { icon: CloudRain, label: "Bruine légère", color: THEME.cyan },
  53: { icon: CloudRain, label: "Bruine modérée", color: THEME.cyan },
  55: { icon: CloudRain, label: "Bruine dense", color: THEME.cyan },
  61: { icon: CloudRain, label: "Pluie légère", color: THEME.blue },
  63: { icon: CloudRain, label: "Pluie modérée", color: THEME.blue },
  65: { icon: CloudRain, label: "Pluie forte", color: "#1d4ed8" },
  71: { icon: CloudSnow, label: "Neige légère", color: "#e0f2fe" },
  73: { icon: CloudSnow, label: "Neige modérée", color: "#bae6fd" },
  75: { icon: CloudSnow, label: "Neige forte", color: "#7dd3fc" },
  77: { icon: CloudSnow, label: "Grésil", color: "#7dd3fc" },
  80: { icon: CloudRain, label: "Averses légères", color: THEME.blue },
  81: { icon: CloudRain, label: "Averses", color: THEME.blue },
  82: { icon: CloudRain, label: "Averses violentes", color: "#1d4ed8" },
  85: { icon: CloudSnow, label: "Averses de neige", color: "#7dd3fc" },
  86: { icon: CloudSnow, label: "Fortes averses de neige", color: "#7dd3fc" },
  95: { icon: CloudLightning, label: "Orage", color: THEME.violet },
  96: { icon: CloudLightning, label: "Orage avec grêle", color: THEME.pink },
  99: { icon: CloudLightning, label: "Orage violent", color: THEME.red },
};

const getWMO = (code: number) =>
  WMO[code] || { icon: Cloud, label: "Inconnu", color: "#94a3b8" };

// ============================================================================
// LIEUX POPULAIRES DE TREK
// ============================================================================
type Location = {
  id: string;
  name: string;
  region: string;
  lat: number;
  lon: number;
  altitude: number;
  emoji: string;
};

const POPULAR_LOCATIONS: Location[] = [
  { id: "gr20-corte", name: "GR20 — Corte", region: "Corse", lat: 42.307, lon: 9.150, altitude: 400, emoji: "🏔️" },
  { id: "chamonix", name: "Chamonix", region: "Alpes", lat: 45.923, lon: 6.870, altitude: 1035, emoji: "⛰️" },
  { id: "mont-blanc", name: "Mont-Blanc TMB", region: "Alpes", lat: 45.832, lon: 6.865, altitude: 1000, emoji: "🗻" },
  { id: "saint-jean", name: "St-Jean-Pied-de-Port", region: "Compostelle", lat: 43.164, lon: -1.237, altitude: 180, emoji: "🥾" },
  { id: "nepal-lukla", name: "Lukla", region: "Népal / Everest BC", lat: 27.687, lon: 86.731, altitude: 2860, emoji: "🏔️" },
  { id: "patagonia", name: "Torres del Paine", region: "Patagonie", lat: -50.944, lon: -72.999, altitude: 200, emoji: "🌄" },
  { id: "pyrenees", name: "Gavarnie", region: "Pyrénées", lat: 42.733, lon: -0.019, altitude: 1375, emoji: "🏔️" },
  { id: "islande", name: "Laugavegur", region: "Islande", lat: 63.983, lon: -19.067, altitude: 580, emoji: "🌋" },
];

// ============================================================================
// TYPES API
// ============================================================================
type CurrentWeather = {
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  weather_code: number;
  precipitation: number;
  surface_pressure: number;
  is_day: number;
};

type DailyForecast = {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
};

type HourlyForecast = {
  time: string[];
  temperature_2m: number[];
  weather_code: number[];
  precipitation_probability: number[];
};

type WeatherData = {
  current: CurrentWeather;
  daily: DailyForecast;
  hourly: HourlyForecast;
};

// ============================================================================
// HELPERS
// ============================================================================
const formatDay = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { weekday: "short" });
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

const windDirection = (deg: number): string => {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "O", "NO"];
  return dirs[Math.round(deg / 45) % 8];
};

const getComfortLevel = (temp: number, wind: number, precip: number): { score: number; label: string; color: string } => {
  let score = 100;
  if (temp < -5) score -= 40;
  else if (temp < 0) score -= 25;
  else if (temp < 5) score -= 10;
  else if (temp > 30) score -= 25;
  else if (temp > 35) score -= 40;
  if (wind > 50) score -= 30;
  else if (wind > 30) score -= 15;
  if (precip > 15) score -= 30;
  else if (precip > 5) score -= 15;
  else if (precip > 1) score -= 5;
  score = Math.max(0, Math.min(100, score));
  if (score >= 75) return { score, label: "Idéal pour marcher", color: THEME.emerald };
  if (score >= 50) return { score, label: "Correct avec préparation", color: THEME.yellow };
  if (score >= 25) return { score, label: "Difficile", color: THEME.orange };
  return { score, label: "À éviter", color: THEME.red };
};

// ============================================================================
// PAGE
// ============================================================================
export default function WeatherPage() {
  const [location, setLocation] = useState<Location>(POPULAR_LOCATIONS[0]);
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Fetch weather
  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = new URL("https://api.open-meteo.com/v1/forecast");
        url.searchParams.set("latitude", location.lat.toString());
        url.searchParams.set("longitude", location.lon.toString());
        url.searchParams.set("elevation", location.altitude.toString());
        url.searchParams.set(
          "current",
          "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,precipitation,surface_pressure,is_day"
        );
        url.searchParams.set(
          "daily",
          "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset,uv_index_max"
        );
        url.searchParams.set(
          "hourly",
          "temperature_2m,weather_code,precipitation_probability"
        );
        url.searchParams.set("timezone", "auto");
        url.searchParams.set("forecast_days", "7");

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("Erreur API Open-Meteo");
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [location]);

  return (
    <div className="min-h-screen bg-[#050505] font-sans pb-16 selection:bg-red-600/30">
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-6">

        {/* ============ HEADER ============ */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-500">
              Prévisions météo
            </span>
          </div>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
                Météo du trek
              </h1>
              <p className="text-sm text-zinc-400 max-w-xl">
                Anticipez les conditions de votre marche : température, pluie, vent.
                Données en temps réel depuis Open-Meteo, sans clé API.
              </p>
            </div>

            {/* Location picker */}
            <button
              onClick={() => setPickerOpen(true)}
              className="group rounded-2xl border border-white/[0.08] bg-[#111] hover:bg-[#161616] transition-colors p-5 min-w-[320px] text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                  Lieu observé
                </span>
                <Search size={12} className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{location.emoji}</span>
                <div className="min-w-0">
                  <div className="text-xl font-black text-white truncate">{location.name}</div>
                  <div className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {location.region} · {location.altitude} m
                  </div>
                </div>
              </div>
            </button>
          </div>
        </header>

        {/* ============ CONTENT ============ */}
        {loading && <LoadingState />}
        {error && <ErrorState error={error} />}

        {data && !loading && (
          <>
            {/* CURRENT */}
            <CurrentWeatherBlock current={data.current} daily={data.daily} location={location} />

            {/* STATS */}
            <StatsRow current={data.current} daily={data.daily} />

            {/* 7-DAY FORECAST */}
            <div className="mt-8">
              <SectionTitle
                title="Prévisions sur 7 jours"
                subtitle="Idéal pour caler votre fenêtre de départ"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {data.daily.time.map((iso, i) => (
                  <DayCard
                    key={iso}
                    iso={iso}
                    code={data.daily.weather_code[i]}
                    tmin={data.daily.temperature_2m_min[i]}
                    tmax={data.daily.temperature_2m_max[i]}
                    precip={data.daily.precipitation_sum[i]}
                    precipProb={data.daily.precipitation_probability_max[i]}
                    wind={data.daily.wind_speed_10m_max[i]}
                    uv={data.daily.uv_index_max[i]}
                    isToday={i === 0}
                  />
                ))}
              </div>
            </div>

            {/* TREK ADVICE + HOURLY */}
            <div className="grid grid-cols-12 gap-6 mt-8">
              <div className="col-span-12 lg:col-span-8">
                <SectionTitle
                  title="Aujourd'hui, heure par heure"
                  subtitle="Température et probabilité de pluie"
                />
                <HourlyChart hourly={data.hourly} />
              </div>
              <div className="col-span-12 lg:col-span-4">
                <SectionTitle title="Conseils sherpa" />
                <TrekAdvice current={data.current} daily={data.daily} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* LOCATION PICKER MODAL */}
      <AnimatePresence>
        {pickerOpen && (
          <LocationPicker
            current={location}
            onSelect={(loc) => {
              setLocation(loc);
              setPickerOpen(false);
            }}
            onClose={() => setPickerOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// COMPOSANTS
// ============================================================================

const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="flex items-baseline justify-between mb-4">
    <div>
      <h2 className="text-xl font-black text-white tracking-tight">{title}</h2>
      {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const LoadingState = () => (
  <div className="rounded-2xl border border-white/[0.08] bg-[#111] py-24 text-center">
    <div className="inline-flex items-center gap-3 text-zinc-400">
      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      <span className="text-sm">Récupération des données météo…</span>
    </div>
  </div>
);

const ErrorState = ({ error }: { error: string }) => (
  <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
    <AlertTriangle size={24} className="text-red-400 mx-auto mb-2" />
    <div className="text-sm font-bold text-white">Impossible de charger la météo</div>
    <div className="text-xs text-zinc-500 mt-1">{error}</div>
  </div>
);

// --- CURRENT WEATHER ---
const CurrentWeatherBlock = ({
  current,
  daily,
  location,
}: {
  current: CurrentWeather;
  daily: DailyForecast;
  location: Location;
}) => {
  const wmo = getWMO(current.weather_code);
  const Icon = wmo.icon;
  const comfort = getComfortLevel(
    current.temperature_2m,
    current.wind_speed_10m,
    current.precipitation
  );

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#111] to-[#0a0a0a] p-6 md:p-8 overflow-hidden relative">
      {/* Background glow */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: wmo.color }}
      />

      <div className="relative grid grid-cols-12 gap-6 items-center">
        {/* TEMP */}
        <div className="col-span-12 md:col-span-5">
          <div className="flex items-center gap-4">
            <Icon size={96} style={{ color: wmo.color }} strokeWidth={1.25} />
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-7xl font-black tracking-tighter text-white">
                  {Math.round(current.temperature_2m)}°
                </span>
              </div>
              <div className="text-xs font-semibold text-zinc-400 mt-1">
                Ressenti {Math.round(current.apparent_temperature)}°C
              </div>
              <div className="text-base font-bold text-white mt-2">{wmo.label}</div>
            </div>
          </div>
        </div>

        {/* COMFORT */}
        <div className="col-span-12 md:col-span-4">
          <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Conditions randonnée
              </span>
              <span className="text-xs font-black tabular-nums" style={{ color: comfort.color }}>
                {comfort.score}/100
              </span>
            </div>
            <div className="text-lg font-black text-white">{comfort.label}</div>
            <div className="mt-3 h-2 rounded-full bg-black/40 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${comfort.score}%`, backgroundColor: comfort.color }}
              />
            </div>
          </div>
        </div>

        {/* MIN/MAX + SUN */}
        <div className="col-span-12 md:col-span-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-zinc-400">
              <TrendingUp size={14} className="text-orange-400" /> Max
            </span>
            <span className="font-bold text-white tabular-nums">
              {Math.round(daily.temperature_2m_max[0])}°
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-zinc-400">
              <TrendingDown size={14} className="text-cyan-400" /> Min
            </span>
            <span className="font-bold text-white tabular-nums">
              {Math.round(daily.temperature_2m_min[0])}°
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-zinc-400">
              <Sunrise size={14} className="text-yellow-400" /> Lever
            </span>
            <span className="font-mono text-xs font-bold text-white">
              {formatTime(daily.sunrise[0])}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-zinc-400">
              <Sunset size={14} className="text-orange-400" /> Coucher
            </span>
            <span className="font-mono text-xs font-bold text-white">
              {formatTime(daily.sunset[0])}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- STATS ROW ---
const StatsRow = ({ current, daily }: { current: CurrentWeather; daily: DailyForecast }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
    <StatCard
      label="Vent"
      value={`${Math.round(current.wind_speed_10m)}`}
      unit="km/h"
      hint={`Direction ${windDirection(current.wind_direction_10m)}`}
      color={THEME.cyan}
      icon={Wind}
    />
    <StatCard
      label="Humidité"
      value={`${Math.round(current.relative_humidity_2m)}`}
      unit="%"
      hint={
        current.relative_humidity_2m > 80
          ? "Air humide"
          : current.relative_humidity_2m < 40
          ? "Air sec"
          : "Humidité normale"
      }
      color={THEME.blue}
      icon={Droplets}
    />
    <StatCard
      label="Précipitations"
      value={`${current.precipitation.toFixed(1)}`}
      unit="mm"
      hint={`${Math.round(daily.precipitation_probability_max[0])}% proba sur 24h`}
      color={THEME.violet}
      icon={CloudRain}
    />
    <StatCard
      label="Indice UV"
      value={`${daily.uv_index_max[0]?.toFixed(1) ?? "—"}`}
      unit=""
      hint={
        daily.uv_index_max[0] > 7
          ? "Très fort · crème obligatoire"
          : daily.uv_index_max[0] > 5
          ? "Élevé · protégez-vous"
          : "Modéré"
      }
      color={THEME.yellow}
      icon={Sun}
    />
  </div>
);

const StatCard = ({
  label,
  value,
  unit,
  hint,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  color: string;
  icon: IconType;
}) => (
  <div className="rounded-2xl border border-white/[0.08] bg-[#111] p-5">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-semibold text-zinc-400">{label}</span>
      <Icon size={14} className="text-zinc-600" />
    </div>
    <div className="flex items-baseline gap-1.5">
      <span className="text-3xl font-black tracking-tight" style={{ color }}>
        {value}
      </span>
      {unit && <span className="text-xs font-bold text-zinc-500">{unit}</span>}
    </div>
    {hint && <div className="text-[11px] text-zinc-500 mt-1">{hint}</div>}
  </div>
);

// --- 7-DAY CARD ---
const DayCard = ({
  iso,
  code,
  tmin,
  tmax,
  precip,
  precipProb,
  wind,
  uv,
  isToday,
}: {
  iso: string;
  code: number;
  tmin: number;
  tmax: number;
  precip: number;
  precipProb: number;
  wind: number;
  uv: number;
  isToday: boolean;
}) => {
  const wmo = getWMO(code);
  const Icon = wmo.icon;
  const comfort = getComfortLevel(tmax, wind, precip);

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 flex flex-col items-center gap-2 transition-colors",
        isToday
          ? "bg-white/[0.06] border-white/20"
          : "bg-[#111] border-white/[0.08] hover:bg-[#161616]"
      )}
    >
      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
        {isToday ? "Auj." : formatDay(iso)}
      </div>
      <div className="text-xs text-zinc-600 -mt-1">{formatDate(iso)}</div>
      <Icon size={32} style={{ color: wmo.color }} strokeWidth={1.5} />
      <div className="text-[10px] text-zinc-500 text-center leading-tight min-h-[24px] flex items-center">
        {wmo.label}
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-lg font-black text-white tabular-nums">{Math.round(tmax)}°</span>
        <span className="text-xs text-zinc-500 tabular-nums">{Math.round(tmin)}°</span>
      </div>
      <div className="w-full mt-1 space-y-1">
        <div className="flex items-center justify-between text-[10px] text-zinc-500">
          <span className="flex items-center gap-1">
            <Droplets size={9} />
          </span>
          <span className="font-semibold">{Math.round(precipProb)}%</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-zinc-500">
          <span className="flex items-center gap-1">
            <Wind size={9} />
          </span>
          <span className="font-semibold">{Math.round(wind)} km/h</span>
        </div>
      </div>
      <div
        className="w-full h-1 rounded-full mt-2"
        style={{ backgroundColor: `${comfort.color}40` }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${comfort.score}%`, backgroundColor: comfort.color }}
        />
      </div>
    </div>
  );
};

// --- HOURLY CHART ---
const HourlyChart = ({ hourly }: { hourly: HourlyForecast }) => {
  // Afficher les 24 prochaines heures
  const now = new Date();
  const startIdx = hourly.time.findIndex((iso) => new Date(iso) >= now);
  const data = hourly.time.slice(startIdx, startIdx + 24).map((iso, i) => ({
    iso,
    hour: new Date(iso).getHours(),
    temp: hourly.temperature_2m[startIdx + i],
    code: hourly.weather_code[startIdx + i],
    precipProb: hourly.precipitation_probability[startIdx + i],
  }));

  if (data.length === 0) return null;

  const minT = Math.min(...data.map((d) => d.temp));
  const maxT = Math.max(...data.map((d) => d.temp));
  const range = maxT - minT || 1;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#111] p-5">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {data.map((d, i) => {
          const wmo = getWMO(d.code);
          const Icon = wmo.icon;
          const heightPct = ((d.temp - minT) / range) * 60 + 20;
          return (
            <div key={i} className="flex flex-col items-center gap-2 min-w-[52px]">
              <span className="text-xs font-bold text-white tabular-nums">
                {Math.round(d.temp)}°
              </span>
              <div className="h-20 w-full flex items-end">
                <div
                  className="w-full rounded-t"
                  style={{
                    height: `${heightPct}%`,
                    background: `linear-gradient(180deg, ${wmo.color}80 0%, ${wmo.color}20 100%)`,
                  }}
                />
              </div>
              <Icon size={14} style={{ color: wmo.color }} />
              {d.precipProb > 20 && (
                <span className="text-[9px] font-bold text-cyan-400 flex items-center gap-0.5">
                  <Droplets size={8} /> {d.precipProb}%
                </span>
              )}
              <span className="text-[10px] font-semibold text-zinc-500 tabular-nums">
                {d.hour}h
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- TREK ADVICE ---
const TrekAdvice = ({ current, daily }: { current: CurrentWeather; daily: DailyForecast }) => {
  const advice = useMemo(() => {
    const tips: { icon: IconType; color: string; title: string; desc: string }[] = [];

    if (current.temperature_2m < 5) {
      tips.push({
        icon: Thermometer,
        color: THEME.cyan,
        title: "Couches chaudes obligatoires",
        desc: "Doudoune, gants, bonnet. Protégez les extrémités du froid.",
      });
    }

    if (current.temperature_2m > 28) {
      tips.push({
        icon: Sun,
        color: THEME.orange,
        title: "Forte chaleur",
        desc: "Partez tôt (avant 7h), ciblez 4L d'eau/jour, chapeau et crème solaire.",
      });
    }

    const maxWind = Math.max(...daily.wind_speed_10m_max.slice(0, 3));
    if (maxWind > 40) {
      tips.push({
        icon: Wind,
        color: THEME.violet,
        title: "Vent fort annoncé",
        desc: `Jusqu'à ${Math.round(maxWind)} km/h. Évitez les crêtes, sécurisez la tente avec haubans.`,
      });
    }

    const maxPrecip = Math.max(...daily.precipitation_sum.slice(0, 3));
    if (maxPrecip > 10) {
      tips.push({
        icon: CloudRain,
        color: THEME.blue,
        title: "Pluie conséquente",
        desc: `${maxPrecip.toFixed(0)}mm sur 72h. Veste imperméable indispensable, attention aux guets.`,
      });
    }

    if (daily.uv_index_max[0] > 6) {
      tips.push({
        icon: Sun,
        color: THEME.yellow,
        title: "UV élevés en altitude",
        desc: "Lunettes cat. 4, crème SPF 50+, manches longues. Le rayonnement augmente de 10% tous les 1000m.",
      });
    }

    const willRainSoon = daily.precipitation_probability_max.slice(0, 2).some((p) => p > 60);
    if (willRainSoon) {
      tips.push({
        icon: AlertTriangle,
        color: THEME.orange,
        title: "Averses probables sous 48h",
        desc: "Vérifiez les refuges ouverts, prévoyez du matériel de rechange sec en sac étanche.",
      });
    }

    if (tips.length === 0) {
      tips.push({
        icon: Sparkles,
        color: THEME.emerald,
        title: "Fenêtre idéale",
        desc: "Les conditions sur les prochains jours sont favorables à la randonnée. Profitez-en !",
      });
    }

    return tips;
  }, [current, daily]);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#111] to-[#0a0a0a] p-5 space-y-3">
      {advice.map((tip, i) => {
        const Icon = tip.icon;
        return (
          <div key={i} className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${tip.color}20` }}
            >
              <Icon size={16} style={{ color: tip.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white">{tip.title}</div>
              <div className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{tip.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- LOCATION PICKER MODAL ---
const LocationPicker = ({
  current,
  onSelect,
  onClose,
}: {
  current: Location;
  onSelect: (loc: Location) => void;
  onClose: () => void;
}) => {
  const [query, setQuery] = useState("");

  const filtered = POPULAR_LOCATIONS.filter(
    (l) =>
      l.name.toLowerCase().includes(query.toLowerCase()) ||
      l.region.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d0d0d] overflow-hidden"
      >
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white">Choisir un lieu</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Spots de trek populaires avec altitude réelle
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 border-b border-white/[0.06]">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              autoFocus
              placeholder="Rechercher par nom ou région…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-600/50"
            />
          </div>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-3">
          {filtered.map((loc) => (
            <button
              key={loc.id}
              onClick={() => onSelect(loc)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left",
                loc.id === current.id
                  ? "bg-red-600/10 border border-red-600/30"
                  : "hover:bg-white/5 border border-transparent"
              )}
            >
              <span className="text-2xl">{loc.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">{loc.name}</div>
                <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                  <MapPin size={10} />
                  {loc.region} · {loc.altitude} m · {loc.lat.toFixed(2)}, {loc.lon.toFixed(2)}
                </div>
              </div>
              {loc.id === current.id && (
                <span className="text-[10px] font-bold text-red-400 uppercase">Actuel</span>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-zinc-500 text-sm">
              Aucun lieu ne correspond
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
