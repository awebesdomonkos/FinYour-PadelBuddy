import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy({ onBack, lang = 'hu' }: { onBack?: () => void; lang?: string }) {
  return (
    <div className="min-h-screen bg-[#F8F8F5] pt-[env(safe-area-inset-top,0px)]">
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#141414]/10 px-4 py-3 flex items-center gap-3 z-10">
        {onBack && (
          <button onClick={onBack} className="p-2 hover:bg-[#141414]/5 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h1 className="font-black text-sm uppercase tracking-widest">
          {lang === 'hu' ? 'Adatvédelmi nyilatkozat' : 'Privacy Policy'}
        </h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 prose prose-sm text-[#141414]/80 space-y-6">
        {lang === 'hu' ? (
          <>
            <p className="text-xs text-[#141414]/40 font-bold uppercase tracking-widest">Utolsó frissítés: 2026. június 1.</p>

            <section className="space-y-3">
              <h2 className="text-base font-black uppercase tracking-tight text-[#141414]">1. Adatkezelő</h2>
              <p className="text-sm leading-relaxed">A Find Your Padel Buddy alkalmazást (<strong>padelbuddy.app</strong>) magánszemélyként üzemeltetem. Kapcsolat: <a href="mailto:padelbuddy.app@gmail.com" className="font-bold text-[#141414] underline">padelbuddy.app@gmail.com</a></p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-black uppercase tracking-tight text-[#141414]">2. Kezelt adatok</h2>
              <ul className="text-sm space-y-1 list-disc pl-4">
                <li>Felhasználónév, teljes név, email cím</li>
                <li>Telefonszám (opcionális, csak ha megadod)</li>
                <li>Helyszín (város szintű, nem pontos GPS)</li>
                <li>Padel szint, játékstílus, preferenciák</li>
                <li>Meccs- és csoport-tagság adatok</li>
                <li>Chat üzenetek (meccseken és csoportokban)</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-black uppercase tracking-tight text-[#141414]">3. Adatkezelés célja</h2>
              <p className="text-sm leading-relaxed">Az adatokat kizárólag a szolgáltatás nyújtásához használjuk: padel partnerek megtalálása, meccslétrehozás, értesítések. Az adatokat <strong>harmadik féllel nem osztjuk meg</strong>, reklám célra nem használjuk.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-black uppercase tracking-tight text-[#141414]">4. Adattárolás</h2>
              <p className="text-sm leading-relaxed">Az adatok az EU-ban (Supabase / Frankfurt régió) tárolódnak. A jelszavak titkosítva (bcrypt) vannak tárolva, eredeti formában nem hozzáférhetők.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-black uppercase tracking-tight text-[#141414]">5. Jogaid (GDPR)</h2>
              <ul className="text-sm space-y-1 list-disc pl-4">
                <li><strong>Hozzáférés:</strong> kérheted a tárolt adataidat</li>
                <li><strong>Törlés:</strong> kérheted a fiókod és adataid törlését</li>
                <li><strong>Helyesbítés:</strong> a Profil szerkesztése menüből módosíthatod adataidat</li>
                <li><strong>Tiltakozás:</strong> bármikor leiratkozhatsz az értesítésekről</li>
              </ul>
              <p className="text-sm">Kérelmeidet ide küldd: <a href="mailto:padelbuddy.app@gmail.com" className="font-bold text-[#141414] underline">padelbuddy.app@gmail.com</a> — 30 napon belül válaszolunk.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-black uppercase tracking-tight text-[#141414]">6. Cookie-k</h2>
              <p className="text-sm leading-relaxed">Az alkalmazás kizárólag funkcionális célú localStorage-t használ (bejelentkezési token, beállítások). Reklám vagy nyomkövető cookie-t nem alkalmazunk.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-black uppercase tracking-tight text-[#141414]">7. Fiók törlése</h2>
              <p className="text-sm leading-relaxed">Fiókod törléséhez írj a <a href="mailto:padelbuddy.app@gmail.com" className="font-bold text-[#141414] underline">padelbuddy.app@gmail.com</a> címre. 72 órán belül töröljük az összes adatodat.</p>
            </section>
          </>
        ) : (
          <>
            <p className="text-xs text-[#141414]/40 font-bold uppercase tracking-widest">Last updated: June 1, 2026</p>

            <section className="space-y-3">
              <h2 className="text-base font-black uppercase tracking-tight text-[#141414]">1. Data Controller</h2>
              <p className="text-sm leading-relaxed">Find Your Padel Buddy (<strong>padelbuddy.app</strong>) is operated as an individual project. Contact: <a href="mailto:padelbuddy.app@gmail.com" className="font-bold text-[#141414] underline">padelbuddy.app@gmail.com</a></p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-black uppercase tracking-tight text-[#141414]">2. Data We Collect</h2>
              <ul className="text-sm space-y-1 list-disc pl-4">
                <li>Username, full name, email address</li>
                <li>Phone number (optional, only if provided)</li>
                <li>Location (city level only, no precise GPS)</li>
                <li>Padel skill level, play style, preferences</li>
                <li>Game and group membership data</li>
                <li>Chat messages (in games and groups)</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-black uppercase tracking-tight text-[#141414]">3. Purpose</h2>
              <p className="text-sm leading-relaxed">Data is used solely to provide the service: finding padel partners, creating games, sending notifications. We <strong>never share data with third parties</strong> or use it for advertising.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-black uppercase tracking-tight text-[#141414]">4. Storage</h2>
              <p className="text-sm leading-relaxed">Data is stored in the EU (Supabase / Frankfurt). Passwords are hashed with bcrypt and cannot be retrieved in plain text.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-black uppercase tracking-tight text-[#141414]">5. Your Rights (GDPR)</h2>
              <ul className="text-sm space-y-1 list-disc pl-4">
                <li><strong>Access:</strong> request a copy of your data</li>
                <li><strong>Deletion:</strong> request deletion of your account and data</li>
                <li><strong>Correction:</strong> edit your data in Profile Settings</li>
                <li><strong>Opt-out:</strong> disable notifications anytime in settings</li>
              </ul>
              <p className="text-sm">Send requests to: <a href="mailto:padelbuddy.app@gmail.com" className="font-bold text-[#141414] underline">padelbuddy.app@gmail.com</a> — we respond within 30 days.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-black uppercase tracking-tight text-[#141414]">6. Cookies</h2>
              <p className="text-sm leading-relaxed">The app uses localStorage only for functional purposes (auth token, settings). No advertising or tracking cookies are used.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-black uppercase tracking-tight text-[#141414]">7. Account Deletion</h2>
              <p className="text-sm leading-relaxed">To delete your account, email <a href="mailto:padelbuddy.app@gmail.com" className="font-bold text-[#141414] underline">padelbuddy.app@gmail.com</a>. We will delete all your data within 72 hours.</p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
