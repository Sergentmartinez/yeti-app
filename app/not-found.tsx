import Link from "next/link";
import { Icons } from "@/components/icons";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-stone-950 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <Logo variant="light" />
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
