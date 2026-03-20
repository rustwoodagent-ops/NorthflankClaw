"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/lib/trpc/provider";

const PLAN_FEATURES = {
  free: ["3 analyses / month", "Full Seven Pillars report", "Acoustic measurements", "Prescribed exercises"],
  basic: ["10 analyses / month", "Full Seven Pillars report", "Pitch timeline chart", "Stems playback", "Phrase-by-phrase breakdown"],
  pro: ["50 analyses / month", "Everything in Basic", "Mel spectrogram", "Piano roll view", "Priority processing"],
};

const PLAN_COLORS = {
  free: "var(--muted)",
  basic: "var(--accent)",
  pro: "var(--accent2)",
};

export default function SubscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  const { data: usage, isLoading: usageLoading } = api.subscriptions.getUsage.useQuery();
  const { data: plans } = api.subscriptions.getPlans.useQuery();
  const createCheckout = api.subscriptions.createCheckout.useMutation({
    onSuccess: ({ url }) => {
      router.push(url);
    },
  });
  const cancelSubscription = api.subscriptions.cancelSubscription.useMutation();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Success banner */}
      {success && (
        <div className="mb-8 p-4 bg-green-950/50 border border-green-800 rounded-xl text-green-300 text-sm text-center">
          🎉 Subscription activated! You now have access to your new plan features.
        </div>
      )}

      <div className="mb-10">
        <h1 className="text-3xl font-black mb-2">Plans & Billing</h1>
        {usage && !usageLoading && (
          <div className="flex items-center gap-3">
            <p className="text-muted">
              You're on the{" "}
              <span
                className="font-bold capitalize"
                style={{ color: PLAN_COLORS[usage.tier] }}
              >
                {usage.tier}
              </span>{" "}
              plan.
            </p>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-full">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  usage.remaining === 0
                    ? "bg-red-400"
                    : usage.remaining <= 2
                    ? "bg-yellow-400"
                    : "bg-accent4"
                }`}
              />
              <span className="text-xs font-mono text-muted">
                {usage.used} / {usage.limit} analyses used this month
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Usage bar */}
      {usage && (
        <div className="mb-10 p-5 bg-surface border border-border rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Monthly usage</span>
            <span className="text-sm font-mono text-muted">
              Resets {new Date(usage.resetAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
            </span>
          </div>
          <div className="h-2 bg-surface2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (usage.used / usage.limit) * 100)}%`,
                background:
                  usage.remaining === 0
                    ? "var(--danger)"
                    : usage.remaining <= 2
                    ? "#f59e0b"
                    : "var(--accent4)",
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted font-mono">{usage.used} used</span>
            <span className="text-xs text-muted font-mono">{usage.remaining} remaining</span>
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {(["free", "basic", "pro"] as const).map((tier) => {
          const isCurrentPlan = usage?.tier === tier;
          const color = PLAN_COLORS[tier];
          const price = tier === "free" ? 0 : tier === "basic" ? 5 : 12;
          const features = PLAN_FEATURES[tier];

          return (
            <div
              key={tier}
              className="rounded-2xl border p-6 relative flex flex-col"
              style={{
                borderColor: isCurrentPlan ? `${color}50` : "var(--border)",
                background: isCurrentPlan ? `color-mix(in srgb, ${color} 5%, var(--surface))` : "var(--surface)",
              }}
            >
              {isCurrentPlan && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold rounded-full text-bg"
                  style={{ background: color }}
                >
                  CURRENT PLAN
                </div>
              )}

              {/* Plan name */}
              <div className="mb-4">
                <div
                  className="text-xs font-mono uppercase tracking-widest mb-1"
                  style={{ color }}
                >
                  {tier}
                </div>
                <div className="text-4xl font-black">
                  ${price}
                  <span className="text-muted text-sm font-normal"> AUD/mo</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 flex-1 mb-6">
                {features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm text-muted">
                    <span style={{ color }} className="flex-shrink-0 font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrentPlan ? (
                <div className="space-y-2">
                  <div
                    className="w-full text-center py-3 rounded-xl text-sm font-bold border"
                    style={{ color, borderColor: `${color}30`, background: `${color}10` }}
                  >
                    Active
                  </div>
                  {tier !== "free" && (
                    <button
                      onClick={() => {
                        if (confirm("Cancel your subscription at end of billing period?")) {
                          cancelSubscription.mutate();
                        }
                      }}
                      disabled={cancelSubscription.isPending}
                      className="w-full text-center py-2 rounded-xl text-xs text-muted hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      {cancelSubscription.isPending ? "Cancelling..." : "Cancel subscription"}
                    </button>
                  )}
                </div>
              ) : tier === "free" ? (
                <div
                  className="w-full text-center py-3 rounded-xl text-sm font-medium border text-muted border-border"
                >
                  Free forever
                </div>
              ) : (
                <button
                  onClick={() => createCheckout.mutate({ tier })}
                  disabled={createCheckout.isPending}
                  className="w-full py-3 rounded-xl text-sm font-bold text-bg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg"
                  style={{ background: color, boxShadow: `0 8px 24px ${color}20` }}
                >
                  {createCheckout.isPending ? "Redirecting..." : `Upgrade to ${tier.charAt(0).toUpperCase() + tier.slice(1)}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="mt-12 space-y-4">
        <h2 className="text-xl font-bold">FAQ</h2>
        {[
          {
            q: "What counts as one analysis?",
            a: "Each recording you submit and process counts as one analysis. Re-requesting a phrase-by-phrase breakdown on an existing analysis does not use an additional credit.",
          },
          {
            q: "Can I cancel anytime?",
            a: "Yes. Your subscription will remain active until the end of your current billing period, then revert to the Free plan.",
          },
          {
            q: "What audio formats are supported?",
            a: "WAV, MP3, M4A, WebM, OGG, and FLAC. Files up to 100MB. Recordings up to ~15 minutes.",
          },
          {
            q: "Does it work with backing tracks?",
            a: "Yes — our pipeline uses Demucs AI to separate your vocals from any backing track before analysis, so measurements reflect your voice alone.",
          },
        ].map((item) => (
          <div key={item.q} className="border border-border rounded-xl p-5 bg-surface">
            <p className="font-semibold mb-1.5">{item.q}</p>
            <p className="text-muted text-sm leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
