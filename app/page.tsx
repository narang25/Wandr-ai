import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-void">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-display font-bold bg-gradient-to-r from-primary to-violet bg-clip-text text-transparent">
          Wandr.ai
        </h1>
        <p className="text-xl text-muted max-w-md mx-auto">
          Your AI-powered travel companion. Plan extraordinary trips in seconds.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/login"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-violet text-void font-semibold hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}
