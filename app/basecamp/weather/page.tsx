// app/basecamp/weather/page.tsx
"use client";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

const FORECAST_DATA = [
  { day: "Lun", date: "12", temp: 18, min: 8, icon: "sun", wind: 15, precip: 0 },
  { day: "Mar", date: "13", temp: 16, min: 6, icon: "cloud", wind: 20, precip: 10 },
  { day: "Mer", date: "14", temp: 12, min: 4, icon: "rain", wind: 35, precip: 80 },
  { day: "Jeu", date: "15", temp: 14, min: 5, icon: "cloud", wind: 25, precip: 30 },
  { day: "Ven", date: "16", temp: 17, min: 7, icon: "sun", wind: 10, precip: 5 },
  { day: "Sam", date: "17", temp: 19, min: 9, icon: "sun", wind: 8, precip: 0 },
  { day: "Dim", date: "18", temp: 20, min: 10, icon: "sun", wind: 12, precip: 0 },
];

const STAGE_WEATHER = [
  { stage: "Calenzana → Ortu", altitude: 1570, temp: 8, wind: 25, condition: "Nuageux" },
  { stage: "Ortu → Carozzu", altitude: 1690, temp: 6, wind: 30, condition: "Partiellement nuageux" },
  { stage: "Carozzu → Asco", altitude: 1422, temp: 4, wind: 40, condition: "Tempête possible", alert: true },
  { stage: "Asco → Tighjettu", altitude: 1855, temp: 2, wind: 45, condition: "Neige possible", alert: true },
];

export default function WeatherPage() {
  return (
    <div className="min-h-screen bg-bg-base transition-colors">
      {/* HEADER */}
      <header className="h-16 border-b border-border-subtle flex items-center justify-between px-8 bg-bg-surface-1 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black text-text-primary tracking-tight">Météo Expédition</h1>
          <div className="h-4 w-[1px] bg-border-subtle" />
          <span className="text-sm text-text-muted font-medium uppercase tracking-widest">Corse - GR20</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-text-faint uppercase tracking-widest">Dernière mise à jour: il y a 2h</span>
        </div>
      </header>

      <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-slide-up">
        
        {/* CURRENT CONDITIONS */}
        <section className="premium-card rounded-2xl p-8 bg-gradient-to-br from-cyan-vibrant/10 to-bg-surface-1 border-cyan-vibrant/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-vibrant/5 blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black text-text-faint uppercase tracking-[0.3em] mb-2">Conditions actuelles • Refuge d&apos;Asco</div>
              <div className="flex items-baseline gap-4">
                <span className="text-7xl font-black font-mono text-text-primary">12°</span>
                <div className="text-text-muted">
                  <div className="text-sm font-bold">Partiellement nuageux</div>
                  <div className="text-[10px] font-black uppercase tracking-widest">Ressenti: 8°C</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center premium-card p-4 rounded-xl">
                <Icons.WeatherWind className="w-6 h-6 mx-auto text-cyan-vibrant mb-2" />
                <div className="text-xl font-black font-mono text-text-primary">25</div>
                <div className="text-[10px] font-black text-text-faint uppercase">km/h</div>
              </div>
              <div className="text-center premium-card p-4 rounded-xl">
                <Icons.WeatherRain className="w-6 h-6 mx-auto text-cyan-vibrant mb-2" />
                <div className="text-xl font-black font-mono text-text-primary">30%</div>
                <div className="text-[10px] font-black text-text-faint uppercase">Précip</div>
              </div>
              <div className="text-center premium-card p-4 rounded-xl">
                <Icons.StatsAltitude className="w-6 h-6 mx-auto text-orange-vibrant mb-2" />
                <div className="text-xl font-black font-mono text-text-primary">1422</div>
                <div className="text-[10px] font-black text-text-faint uppercase">m alt.</div>
              </div>
            </div>
          </div>
        </section>

        {/* 7 DAY FORECAST */}
        <section className="premium-card rounded-2xl p-6">
          <h3 className="text-lg font-black text-text-primary tracking-tight mb-6 flex items-center gap-2">
            <Icons.Calendar className="w-5 h-5 text-cyan-vibrant" />
            Prévisions 7 Jours
          </h3>
          <div className="grid grid-cols-7 gap-4">
            {FORECAST_DATA.map((day, i) => (
              <div key={i} className={cn(
                "premium-card p-4 rounded-xl text-center transition-all hover:translate-y-[-2px]",
                i === 0 && "ring-1 ring-cyan-vibrant/30 bg-cyan-vibrant/5"
              )}>
                <div className="text-[10px] font-black text-text-faint uppercase tracking-widest mb-1">{day.day}</div>
                <div className="text-sm font-black text-text-muted mb-3">{day.date}</div>
                <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center">
                  {day.icon === "sun" && <Icons.WeatherSun className="w-8 h-8 text-orange-vibrant" />}
                  {day.icon === "cloud" && <Icons.WeatherCloudSun className="w-8 h-8 text-text-muted" />}
                  {day.icon === "rain" && <Icons.WeatherRain className="w-8 h-8 text-cyan-vibrant" />}
                </div>
                <div className="text-lg font-black font-mono text-text-primary">{day.temp}°</div>
                <div className="text-[10px] font-bold text-text-faint">{day.min}°</div>
                {day.precip > 50 && (
                  <div className="mt-2 text-[9px] font-black text-cyan-vibrant">{day.precip}% pluie</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* STAGE ALERTS */}
        <section className="premium-card rounded-2xl p-6">
          <h3 className="text-lg font-black text-text-primary tracking-tight mb-6 flex items-center gap-2">
            <Icons.Warning className="w-5 h-5 text-orange-vibrant" />
            Alertes par Étape
          </h3>
          <div className="space-y-3">
            {STAGE_WEATHER.map((stage, i) => (
              <div key={i} className={cn(
                "p-4 rounded-xl flex items-center justify-between transition-all",
                stage.alert ? "bg-red-vibrant/10 ring-1 ring-red-vibrant/20" : "bg-bg-surface-3/50 hover:bg-bg-surface-3"
              )}>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    stage.alert ? "bg-red-vibrant text-white" : "bg-bg-surface-4 text-text-muted"
                  )}>
                    {stage.alert ? <Icons.Warning className="w-5 h-5" /> : <Icons.NavRoutes className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-text-primary">{stage.stage}</div>
                    <div className="text-[10px] font-black text-text-faint uppercase tracking-widest">{stage.condition}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <div className="text-lg font-black font-mono text-text-primary">{stage.temp}°</div>
                    <div className="text-[9px] font-bold text-text-faint">{stage.altitude}m</div>
                  </div>
                  <div>
                    <div className="text-lg font-black font-mono text-cyan-vibrant">{stage.wind}</div>
                    <div className="text-[9px] font-bold text-text-faint">km/h</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
