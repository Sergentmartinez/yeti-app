"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/icons";
import { PAYWALL_COPY, PRODUCTS, ProductKey } from "@/lib/copy/monetization";
import { recordPurchase } from "@/lib/projects/local";

export function PaywallModal({
  open,
  onClose,
  projectId,
  defaultProduct,
  onPurchased,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  defaultProduct: ProductKey;
  onPurchased?: () => void;
}) {
  const [selected, setSelected] = useState<ProductKey>(defaultProduct);
  const product = useMemo(() => PRODUCTS[selected], [selected]);

  function pay() {
    // V1: paiement simulé (localStorage). À remplacer par Stripe + webhooks.
    recordPurchase(projectId, product.key, product.priceEUR);
    onClose();
    onPurchased?.();
  }

  return (
    <Modal open={open} onClose={onClose} title={PAYWALL_COPY.title}>
      <div className="space-y-5">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="text-sm text-zinc-200">{PAYWALL_COPY.subtitle}</div>
          <ul className="mt-3 space-y-1 text-sm text-zinc-300">
            {PAYWALL_COPY.projectLogic.map((l) => (
              <li key={l} className="flex gap-2">
                <span className="mt-[2px] inline-block h-2 w-2 rounded-full bg-orange-500" />
                <span>{l.replace(/^✅\s*/, "")}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {(Object.keys(PRODUCTS) as ProductKey[]).map((k) => {
            const p = PRODUCTS[k];
            const active = selected === k;
            return (
              <button
                key={k}
                onClick={() => setSelected(k)}
                className={[
                  "text-left rounded-2xl border p-4 transition",
                  active ? "border-orange-500 bg-orange-500/10" : "border-zinc-800 bg-zinc-950 hover:bg-zinc-900/40"
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-white">{p.name}</div>
                    {p.badge ? (
                      <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-300">
                        <Icons.Star className="h-3 w-3" /> {p.badge}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-sm font-bold text-white">{p.priceEUR}€</div>
                </div>
                <ul className="mt-3 space-y-2 text-xs text-zinc-300">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <Icons.Check className="mt-[1px] h-4 w-4 text-green-500" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
            <Icons.Lock className="h-4 w-4 text-orange-500" />
            Paiement (V1 simulée)
          </div>
          <div className="text-sm text-zinc-300">
            Tu débloques <span className="font-semibold text-white">{product.name}</span> pour ce projet.
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-zinc-400">{PAYWALL_COPY.osintLimitsTitle} — {PAYWALL_COPY.osintLimitsBody}</div>
            <Button onClick={pay} className="sm:shrink-0">
              Payer {product.priceEUR}€
            </Button>
          </div>
        </div>

        <div className="text-xs text-zinc-500">
          En production : Stripe + webhooks + entitlements en DB (Supabase). Ici, c’est volontairement simple pour itérer vite.
        </div>
      </div>
    </Modal>
  );
}
