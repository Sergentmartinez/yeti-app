import Link from "next/link";
import { Icons } from "@/components/icons";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-stone-950 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-24 h-24 bg-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Icons.Logo className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-stone-400 mb-8">Cette page n&apos;existe pas</p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition"
        >
          <Icons.Home className="w-5 h-5" />
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
