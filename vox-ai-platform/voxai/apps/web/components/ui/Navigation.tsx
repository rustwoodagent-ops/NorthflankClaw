"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { api } from "@/lib/trpc/provider";

export function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: usage } = api.subscriptions.getUsage.useQuery(undefined, {
    enabled: !!session?.user,
  });

  const navLinks = [
    { href: "/record", label: "Record" },
    { href: "/analyses", label: "My Analyses" },
    { href: "/subscription", label: "Plans" },
  ];

  return (
    <nav className="h-16 border-b border-border bg-bg/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
            <span className="text-accent font-black text-sm font-mono">V</span>
          </div>
          <span className="font-black text-lg tracking-tight">
            VOX<span className="text-accent">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        {session && (
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:text-text hover:bg-surface"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              {/* Usage pill */}
              {usage && (
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-full">
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
                    {usage.remaining}/{usage.limit}
                  </span>
                </div>
              )}

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-9 h-9 rounded-full bg-surface border border-border overflow-hidden hover:border-accent/50 transition-colors flex items-center justify-center"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-muted">
                      {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                    </span>
                  )}
                </button>

                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-11 w-56 bg-surface border border-border rounded-xl shadow-2xl shadow-black/50 z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold text-text truncate">
                          {session.user?.name}
                        </p>
                        <p className="text-xs text-muted truncate">
                          {session.user?.email}
                        </p>
                        {usage && (
                          <p className="text-xs font-mono text-accent mt-1 capitalize">
                            {usage.tier} plan
                          </p>
                        )}
                      </div>
                      <div className="p-1">
                        {navLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className="block px-3 py-2 rounded-lg text-sm text-muted hover:text-text hover:bg-surface2 transition-colors"
                          >
                            {link.label}
                          </Link>
                        ))}
                        <div className="h-px bg-border my-1" />
                        <button
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted hover:text-red-400 hover:bg-red-950/30 transition-colors"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="px-4 py-2 bg-accent text-bg rounded-lg text-sm font-bold hover:scale-105 active:scale-95 transition-all"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
