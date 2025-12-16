"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/nav";
import { getExpertById, TREKS } from "@/lib/data";

export default function ExpertPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const expert = getExpertById(id);

  if (!expert) {
    notFound();
  }

  const completedTreks = TREKS.filter((t) => expert.treksCompleted.includes(t.slug));

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-stone-100 pt-16">
        {/* Header */}
        <section className="bg-stone-950 text-white py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-orange-600 flex items-center justify-center text-4xl font-black">
                {expert.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-black tracking-tight">{expert.name}</h1>
                  <span className="px-2 py-0.5 bg-orange-600 text-white text-xs font-bold rounded">
                    EXPERT CERTIFIÉ
                  </span>
                </div>
                <p className="text-orange-500 font-medium">{expert.title}</p>
                <div className="flex items-center gap-4 mt-2 text-stone-400 text-sm">
                  <span>{expert.followers.toLocaleString()} followers</span>
                  <span>•</span>
                  <span>{expert.certifiedPacks} packs certifiés</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-6 -mt-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-black text-orange-600">{expert.certifiedPacks}</div>
                <div className="text-sm text-stone-500">Packs Certifiés</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-orange-600">{completedTreks.length}</div>
                <div className="text-sm text-stone-500">Treks Maîtrisés</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-orange-600">
                  {expert.followers.toLocaleString()}
                </div>
                <div className="text-sm text-stone-500">Followers</div>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="px-6 py-12">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Bio */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200">
                <h2 className="text-xl font-bold text-stone-900 mb-4">À propos</h2>
                <p className="text-stone-600 leading-relaxed">{expert.bio}</p>
              </div>

              {/* Completed Treks */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200">
                <h2 className="text-xl font-bold text-stone-900 mb-4">Treks Maîtrisés</h2>
                <div className="space-y-4">
                  {completedTreks.map((trek) => (
                    <Link
                      key={trek.slug}
                      href={`/treks/${trek.slug}`}
                      className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition"
                    >
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <span className="text-xl">🏔️</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-stone-900">{trek.name}</div>
                        <div className="text-sm text-stone-500">
                          {trek.stats.dist} km • {trek.stats.days} jours
                        </div>
                      </div>
                      <div className={`font-mono font-bold ${
                        trek.stats.difficulty >= 4 ? "text-red-500" :
                        trek.stats.difficulty >= 3 ? "text-orange-500" : "text-green-500"
                      }`}>
                        {trek.stats.difficulty.toFixed(1)}/5
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Certified Packs (Placeholder) */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200">
                <h2 className="text-xl font-bold text-stone-900 mb-4">Packs Certifiés</h2>
                <div className="text-center py-8 text-stone-400">
                  <div className="text-3xl mb-2">🎒</div>
                  <div className="text-sm">Les packs certifiés seront disponibles prochainement</div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200">
                <h3 className="font-bold text-stone-900 mb-4">Contacter l&apos;Expert</h3>
                <button className="w-full px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition mb-3">
                  Demander un Conseil
                </button>
                <button className="w-full px-6 py-3 bg-stone-100 text-stone-900 font-bold rounded-xl hover:bg-stone-200 transition">
                  Suivre
                </button>
              </div>

              {/* Badges */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200">
                <h3 className="font-bold text-stone-900 mb-4">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-orange-100 text-orange-700 text-sm font-bold rounded-lg">
                    🏆 Expert Certifié
                  </span>
                  <span className="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-bold rounded-lg">
                    ✓ Profil Vérifié
                  </span>
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-bold rounded-lg">
                    🎯 Pack Master
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
