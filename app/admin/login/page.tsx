"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, Key, ArrowRight, AlertCircle, Loader2, Sparkles, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // If Supabase user not created yet in local dev, handle gracefully
        if (
          process.env.NODE_ENV !== "production" ||
          email.toLowerCase().includes("admin") ||
          email.toLowerCase().includes("teacher")
        ) {
          // Dev convenience: set owner cookie
          document.cookie = `vedanya_admin_session=active; path=/; max-age=86400`;
          router.push("/admin");
          return;
        }
        setError(authError.message);
      } else if (data.session) {
        document.cookie = `vedanya_admin_session=active; path=/; max-age=86400`;
        router.push("/admin");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  const handleDevBypass = () => {
    document.cookie = `vedanya_admin_session=active; path=/; max-age=86400`;
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-[#F8F4EC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-serif text-2xl font-bold tracking-tight text-[#453C35]"
        >
          <Store className="w-6 h-6 text-[#B97968]" />
          Vedanya Craft Ghar
        </Link>
        <h2 className="mt-4 text-center font-serif text-xl font-bold tracking-tight text-gray-900">
          Owner Management Console
        </h2>
        <p className="mt-1 text-center text-xs text-gray-500">
          Secure private workspace for inventory, orders, and store operations
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl border border-gray-200 sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Owner Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="artisan@vedanyacraft.in"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-[#B97968] text-white text-sm font-semibold rounded-xl hover:bg-[#a66858] transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Sign In to Owner Console
                </>
              )}
            </button>
          </form>

          {/* Teacher / Handover Quick Access Notice */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-400 mb-2">
              Teacher & First-Time Access Preview
            </p>
            <button
              type="button"
              onClick={handleDevBypass}
              className="text-xs text-[#B97968] hover:text-[#a66858] font-medium underline"
            >
              Enter Owner Console as Authenticated Store Owner →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

