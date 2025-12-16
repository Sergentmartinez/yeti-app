import Link from "next/link";
import { Icons } from "@/components/icons";

const MOCK_PACKS = [
  { id: "pack-1", name: "GR20 Ultralight", trek: "GR20", weight: 7.8, items: 18, createdAt: "2025-01-05" },
  { id: "pack-2", name: "TMB Confort", trek: "TMB", weight: 11.2, items: 24, createdAt: "2024-12-20" },
];

export default function PacksPage() {
  return (
    <main className="min-h-screen bg-stone-50">
      <section className="bg-stone-950 text-white py-12 px-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Mes Packs</h1>
        <p className="text-stone-400">Packs sauvegardés depuis le Pack Builder</p>
      </section>

      <section className="px-8 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_PACKS.map((pack) => (
            <div key={pack.id} className="bg-white p-6 rounded-2xl border border-stone-200 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-stone-900">{pack.name}</h3>
                  <p className="text-sm text-stone-500">{pack.trek}</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Icons.NavPack className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs text-stone-500 mb-1">Poids</div>
                  <div className="text-xl font-bold font-mono text-stone-900">{pack.weight} kg</div>
                </div>
                <div>
                  <div className="text-xs text-stone-500 mb-1">Articles</div>
                  <div className="text-xl font-bold font-mono text-stone-900">{pack.items}</div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <span className="text-xs text-stone-400">{pack.createdAt}</span>
                <button className="flex items-center gap-1 text-sm text-orange-600 font-semibold hover:text-orange-700">
                  Voir <Icons.ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <Link href="/basecamp/packbuilder" className="bg-stone-100 p-6 rounded-2xl border-2 border-dashed border-stone-300 hover:border-orange-500 hover:bg-orange-50 transition flex flex-col items-center justify-center min-h-[200px]">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
              <Icons.Plus className="w-7 h-7 text-orange-600" />
            </div>
            <span className="font-semibold text-stone-700">Créer un nouveau Pack</span>
            <span className="text-sm text-stone-500 mt-1">via le Pack Builder</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
