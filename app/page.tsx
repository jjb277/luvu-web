import Link from "next/link";
import PersonalizedHome from "./components/PersonalizedHome";
import SearchBar from "./components/SearchBar";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #2a3f40 0%, #1a2a2b 100%)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ background: "#4c6f71", color: "#c9d3d4" }}
          >
            L
          </div>
          <span className="font-bold tracking-widest text-sm" style={{ color: "#c9d3d4" }}>LUVU</span>
        </div>
        <div className="flex items-center gap-6 text-sm" style={{ color: "rgba(201,211,212,0.6)" }}>
          <Link href="/saved" className="hover:opacity-100 transition-opacity flex items-center gap-1">
            ♥ Bewaard
          </Link>
          <Link href="/profile" className="hover:opacity-100 transition-opacity">Profiel</Link>
          <Link href="/support" className="hover:opacity-100 transition-opacity">Support</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pb-24">
        {/* Hero */}
        <div className="pt-10 pb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 leading-tight" style={{ color: "#e8f0f0" }}>
            Ontdek events<br />
            <span style={{ color: "#c9d3d4" }}>in jouw buurt</span>
          </h1>
          <p className="text-base max-w-lg mb-6" style={{ color: "rgba(232,240,240,0.55)" }}>
            Concerts, theater, comedy, dans en meer — gepersonaliseerd op jouw locatie.
          </p>
          <SearchBar />
        </div>

        {/* Personalized section: region picker + events */}
        <PersonalizedHome />
      </main>

      {/* Footer */}
      <footer
        className="border-t py-8 px-6 text-center text-sm"
        style={{ borderColor: "rgba(201,211,212,0.1)", color: "rgba(232,240,240,0.4)" }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-3">
          <Link href="/privacy" className="hover:underline">Privacybeleid</Link>
          <span>·</span>
          <Link href="/support" className="hover:underline">Support</Link>
          <span>·</span>
          <a href="mailto:luvulive1@gmail.com" className="hover:underline">luvulive1@gmail.com</a>
        </div>
        <p>© {new Date().getFullYear()} LUVU. Alle rechten voorbehouden.</p>
      </footer>
    </div>
  );
}
