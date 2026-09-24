import React from 'react';
import { ArrowLeft } from 'lucide-react';

const CONTROLLER = {
  name: 'Zala Domonkos E.V.',
  address: '1138 Budapest, Dagály utca 6.',
  phone: '+36 30 421 6462',
  email: 'info@awebes.hu',
  web: 'www.awebes.hu',
  taxNumber: '69935060-1-41',
};

const Mail = () => <a href={`mailto:${CONTROLLER.email}`} className="font-bold text-[#141414] underline">{CONTROLLER.email}</a>;

const Section = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <section className="space-y-3" aria-labelledby={`pp-${n}`}>
    <h2 id={`pp-${n}`} className="text-base font-black uppercase tracking-tight text-[#141414]">{n}. {title}</h2>
    {children}
  </section>
);

const List = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="text-sm space-y-1.5 list-disc pl-4 leading-relaxed">
    {items.map((item, i) => <li key={i}>{item}</li>)}
  </ul>
);

const ControllerCard = ({ labels }: { labels: { address: string; phone: string; email: string; web: string; tax: string; chamber: string } }) => (
  <dl className="text-sm grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 bg-white rounded-2xl p-4 border border-[#141414]/5">
    <dt className="font-bold col-span-2 text-[#141414]">{CONTROLLER.name}</dt>
    <dt className="opacity-50">{labels.address}</dt><dd>{CONTROLLER.address}</dd>
    <dt className="opacity-50">{labels.phone}</dt><dd><a href={`tel:${CONTROLLER.phone.replace(/\s/g, '')}`} className="underline">{CONTROLLER.phone}</a></dd>
    <dt className="opacity-50">{labels.email}</dt><dd><Mail /></dd>
    <dt className="opacity-50">{labels.web}</dt><dd><a href={`https://${CONTROLLER.web}`} target="_blank" rel="noopener" className="underline">{CONTROLLER.web}</a></dd>
    <dt className="opacity-50">{labels.tax}</dt><dd>{CONTROLLER.taxNumber}</dd>
    <dd className="col-span-2 opacity-50 text-xs mt-1">{labels.chamber}</dd>
  </dl>
);

export default function PrivacyPolicy({ onBack, lang = 'hu' }: { onBack?: () => void; lang?: string }) {
  const hu = lang === 'hu';
  return (
    <div className="min-h-screen bg-[#F8F8F5] pt-[env(safe-area-inset-top,0px)]" lang={hu ? 'hu' : 'en'}>
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#141414]/10 px-4 py-3 flex items-center gap-3 z-10">
        {onBack && (
          <button onClick={onBack} aria-label={hu ? 'Vissza' : 'Back'} className="p-2 hover:bg-[#141414]/5 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
        <h1 className="font-black text-sm uppercase tracking-widest flex-1">
          {hu ? 'Adatvédelmi nyilatkozat' : 'Privacy Policy'}
        </h1>
        <a href={`/privacy?lang=${hu ? 'en' : 'hu'}`} className="text-xs font-bold underline opacity-60" hrefLang={hu ? 'en' : 'hu'}>
          {hu ? 'English' : 'Magyar'}
        </a>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8 text-[#141414]/80 space-y-8 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
        {hu ? (
          <>
            <p className="text-xs text-[#141414]/40 font-bold uppercase tracking-widest">Hatályos: 2026. szeptember 23-tól</p>
            <p className="text-sm leading-relaxed">Ez a nyilatkozat azt írja le, hogy a Find Your Padel Buddy alkalmazás (find-your-padel-buddy.vercel.app, a továbbiakban: alkalmazás) milyen személyes adatokat kezel, milyen célból és jogalapon, kik férnek hozzá, és milyen jogaid vannak. Az adatkezelés az EU általános adatvédelmi rendelete (GDPR) és az információs önrendelkezési jogról szóló 2011. évi CXII. törvény (Infotv.) szerint történik.</p>

            <Section n={1} title="Adatkezelő">
              <ControllerCard labels={{ address: 'Cím', phone: 'Telefon', email: 'E-mail', web: 'Web', tax: 'Adószám', chamber: 'Nyilvántartó kamara: Budapesti Kereskedelmi és Iparkamara · alanyi adómentes egyéni vállalkozó' }} />
            </Section>

            <Section n={2} title="Milyen adatokat kezelünk">
              <List items={[
                <><strong>Fiókadatok:</strong> név, felhasználónév, e-mail-cím, telefonszám (csak ha megadod).</>,
                <><strong>Profiladatok:</strong> város, padel szint és tapasztalat, játékstílus, preferált időpontok, beszélt nyelvek, bemutatkozás, érdeklődési körök, kedvenc klubok, közösségi média felhasználónevek, profilkép — mind önkéntes.</>,
                <><strong>Közösségi adatok:</strong> meccsek, csoportok, jelentkezések, barátkérések, letiltások, kedvencek, meccs- és csoportchat-üzenetek, részvétel és értékelések (megbízhatóság).</>,
                <><strong>Értesítések:</strong> az alkalmazáson belüli értesítések, valamint — ha bekapcsolod — a push-értesítésekhez szükséges eszköz-feliratkozás (a böngésző által generált végpont-cím és titkosítókulcsok).</>,
                <><strong>Visszajelzések:</strong> a beküldött üzenet és téma, a fiókod azonosítója, az oldal, ahol küldted, és a böngésződ típusa (user agent).</>,
                <><strong>Technikai adatok:</strong> a tárhelyszolgáltató a kérések kiszolgálásához IP-címet és időbélyeget naplóz.</>,
              ]} />
              <p className="text-sm leading-relaxed">Pontos GPS-helyzetet nem kérünk és nem tárolunk.</p>
            </Section>

            <Section n={3} title="Célok és jogalapok">
              <List items={[
                <><strong>A szolgáltatás nyújtása</strong> (fiók, profil, meccs- és partnerkeresés, chat, értesítések az alkalmazáson belül): a veled kötött felhasználási szerződés teljesítése — GDPR 6. cikk (1) b).</>,
                <><strong>Push-értesítések:</strong> a hozzájárulásod — GDPR 6. cikk (1) a). Bármikor visszavonhatod a Profil → Értesítések kapcsolóval vagy a böngésző beállításaiban.</>,
                <><strong>Visszajelzések kezelése, hibakeresés, az alkalmazás biztonsága:</strong> az adatkezelő jogos érdeke — GDPR 6. cikk (1) f).</>,
              ]} />
              <p className="text-sm leading-relaxed">Az adatokat reklámcélra nem használjuk, nem adjuk el, és profilalkotást vagy automatizált döntéshozatalt nem végzünk.</p>
            </Section>

            <Section n={4} title="Kik férnek hozzá — adatfeldolgozók">
              <List items={[
                <><strong>Supabase Inc.</strong> — adatbázis, bejelentkezés és képtárolás. Az adatok az EU-ban, Írországban (eu-west-1 régió) tárolódnak. A jelszavakat a Supabase Auth kezeli és kizárólag egyirányú titkosított (hash) formában tárolja; az alkalmazás maga jelszót nem lát és nem tárol.</>,
                <><strong>Vercel Inc.</strong> — az alkalmazás tárhelye és szerveroldali feldolgozása, amely az EU-ban (Dublin) fut; a statikus fájlokat globális tartalomszolgáltató hálózat szolgálja ki.</>,
                <><strong>Push-szolgáltatók</strong> (a böngésződtől függően: Google Firebase Cloud Messaging, Mozilla, Apple, Microsoft) — csak ha bekapcsolod a push-értesítéseket, és csak az értesítés kézbesítéséhez. Az értesítés tartalma végponttól végpontig titkosítva halad át rajtuk.</>,
              ]} />
              <p className="text-sm leading-relaxed">A Supabase és a Vercel amerikai székhelyű vállalat; ha adat mégis az EU-n kívülre kerülne, az az Európai Bizottság által elfogadott általános szerződési feltételek (SCC) alapján történik. A többi felhasználó csak azt látja, amit a profilodon nyilvánosnak jelölsz, illetve a közös meccsek és csoportok adatait.</p>
            </Section>

            <Section n={5} title="Meddig őrizzük az adatokat">
              <List items={[
                'Fiók- és profiladatok, közösségi adatok: a fiók törléséig.',
                'Push-feliratkozás: a kikapcsolásig, kijelentkezésig, vagy amíg a böngésző érvényesnek jelzi.',
                'Visszajelzések: a feldolgozásukig, legfeljebb 2 évig; a fiók törlésekor a fiókhoz kötés megszűnik.',
                'Tárhelyszolgáltatói naplók: a szolgáltató saját megőrzési ideje szerint (jellemzően néhány nap).',
              ]} />
            </Section>

            <Section n={6} title="Jogaid">
              <List items={[
                <><strong>Hozzáférés</strong> és <strong>adathordozhatóság:</strong> kérheted a rólad tárolt adatok másolatát.</>,
                <><strong>Helyesbítés:</strong> a legtöbb adatot a Profil szerkesztése menüben magad javíthatod.</>,
                <><strong>Törlés</strong> és <strong>korlátozás:</strong> kérheted a fiókod és adataid törlését vagy a kezelés korlátozását.</>,
                <><strong>Tiltakozás</strong> a jogos érdeken alapuló adatkezelés ellen, és a <strong>hozzájárulás visszavonása</strong> (push) bármikor.</>,
              ]} />
              <p className="text-sm leading-relaxed">Kérelmeidet a <Mail /> címre küldd; legkésőbb 30 napon belül válaszolunk. Panaszt tehetsz a Nemzeti Adatvédelmi és Adatbiztonsági Hatóságnál (NAIH, 1055 Budapest, Falk Miksa utca 9–11., <a href="https://naih.hu" target="_blank" rel="noopener" className="underline">naih.hu</a>), vagy bírósághoz fordulhatsz.</p>
            </Section>

            <Section n={7} title="Helyi tárolás az eszközödön">
              <p className="text-sm leading-relaxed">Az alkalmazás kizárólag működéshez szükséges helyi tárolást használ: bejelentkezési munkamenet, beállítások, a telepíthető alkalmazás (PWA) gyorsítótára és a service worker. Reklám- vagy nyomkövető sütit, analitikát nem használunk, ezért hozzájárulást kérő sütisávra nincs szükség.</p>
            </Section>

            <Section n={8} title="Fiók törlése">
              <p className="text-sm leading-relaxed">Fiókod törléséhez írj a <Mail /> címre a regisztrált e-mail-címedről. Legkésőbb 30 napon belül töröljük a fiókodat és a hozzá kapcsolódó személyes adatokat; a közös meccsek chatjében hagyott üzeneteid a neved nélkül maradhatnak meg.</p>
            </Section>

            <Section n={9} title="Változások">
              <p className="text-sm leading-relaxed">Ha a nyilatkozat lényegesen változik, az alkalmazásban jelezzük. A mindenkor hatályos változat ezen az oldalon érhető el.</p>
            </Section>
          </>
        ) : (
          <>
            <p className="text-xs text-[#141414]/40 font-bold uppercase tracking-widest">Effective from 23 September 2026</p>
            <p className="text-sm leading-relaxed">This notice explains what personal data the Find Your Padel Buddy app (find-your-padel-buddy.vercel.app, "the app") processes, why and on what legal basis, who has access to it, and what your rights are. Processing follows the EU General Data Protection Regulation (GDPR) and Hungarian Act CXII of 2011 on informational self-determination.</p>

            <Section n={1} title="Data Controller">
              <ControllerCard labels={{ address: 'Address', phone: 'Phone', email: 'Email', web: 'Web', tax: 'Tax number', chamber: 'Registered with the Budapest Chamber of Commerce and Industry · Hungarian sole trader, VAT-exempt' }} />
            </Section>

            <Section n={2} title="Data we process">
              <List items={[
                <><strong>Account data:</strong> name, username, email address, phone number (only if you provide it).</>,
                <><strong>Profile data:</strong> city, padel level and experience, play style, preferred times, spoken languages, bio, interests, favourite clubs, social media handles, profile picture — all optional.</>,
                <><strong>Community data:</strong> games, groups, join requests, friend requests, blocks, favourites, game and group chat messages, attendance and ratings (reliability).</>,
                <><strong>Notifications:</strong> in-app notifications and — if you turn them on — the device subscription needed for push notifications (the endpoint address and encryption keys generated by your browser).</>,
                <><strong>Feedback:</strong> the message and topic you send, your account ID, the page you sent it from, and your browser type (user agent).</>,
                <><strong>Technical data:</strong> the hosting provider logs IP addresses and timestamps to serve requests.</>,
              ]} />
              <p className="text-sm leading-relaxed">We never ask for or store your precise GPS location.</p>
            </Section>

            <Section n={3} title="Purposes and legal bases">
              <List items={[
                <><strong>Providing the service</strong> (account, profile, finding games and partners, chat, in-app notifications): performance of the user agreement with you — GDPR Art. 6(1)(b).</>,
                <><strong>Push notifications:</strong> your consent — GDPR Art. 6(1)(a). You can withdraw it anytime with the Profile → Notifications switch or in your browser settings.</>,
                <><strong>Handling feedback, troubleshooting and security:</strong> the controller's legitimate interest — GDPR Art. 6(1)(f).</>,
              ]} />
              <p className="text-sm leading-relaxed">We don't use your data for advertising, don't sell it, and don't carry out profiling or automated decision-making.</p>
            </Section>

            <Section n={4} title="Who has access — processors">
              <List items={[
                <><strong>Supabase Inc.</strong> — database, sign-in and image storage. Data is stored in the EU, in Ireland (eu-west-1 region). Passwords are handled by Supabase Auth and stored only as one-way hashes; the app itself never sees or stores your password.</>,
                <><strong>Vercel Inc.</strong> — app hosting and server-side processing, which runs in the EU (Dublin); static files are served through a global content delivery network.</>,
                <><strong>Push services</strong> (depending on your browser: Google Firebase Cloud Messaging, Mozilla, Apple, Microsoft) — only if you enable push notifications, and only to deliver them. Notification content passes through them end-to-end encrypted.</>,
              ]} />
              <p className="text-sm leading-relaxed">Supabase and Vercel are US-headquartered companies; should any data leave the EU, the transfer relies on the European Commission's Standard Contractual Clauses (SCCs). Other users only see what you mark as public on your profile, and the details of games and groups you share with them.</p>
            </Section>

            <Section n={5} title="How long we keep data">
              <List items={[
                'Account, profile and community data: until your account is deleted.',
                'Push subscription: until you turn it off, sign out, or the browser reports it as expired.',
                'Feedback: until processed, at most 2 years; deleting your account removes the link to your account.',
                'Hosting logs: per the provider\'s own retention (typically a few days).',
              ]} />
            </Section>

            <Section n={6} title="Your rights">
              <List items={[
                <><strong>Access</strong> and <strong>portability:</strong> request a copy of the data we hold about you.</>,
                <><strong>Rectification:</strong> you can correct most data yourself under Edit Profile.</>,
                <><strong>Erasure</strong> and <strong>restriction:</strong> request deletion of your account and data or restriction of processing.</>,
                <><strong>Objection</strong> to processing based on legitimate interest, and <strong>withdrawal of consent</strong> (push) at any time.</>,
              ]} />
              <p className="text-sm leading-relaxed">Send requests to <Mail />; we respond within 30 days at the latest. You may lodge a complaint with the Hungarian National Authority for Data Protection and Freedom of Information (NAIH, 1055 Budapest, Falk Miksa utca 9–11, <a href="https://naih.hu" target="_blank" rel="noopener" className="underline">naih.hu</a>) or go to court.</p>
            </Section>

            <Section n={7} title="Local storage on your device">
              <p className="text-sm leading-relaxed">The app only uses storage that is strictly necessary for it to work: your sign-in session, settings, the installable app (PWA) cache and the service worker. We use no advertising or tracking cookies and no analytics, so no cookie consent banner is needed.</p>
            </Section>

            <Section n={8} title="Deleting your account">
              <p className="text-sm leading-relaxed">To delete your account, email <Mail /> from your registered address. We delete your account and related personal data within 30 days at the latest; messages you left in shared game chats may remain without your name.</p>
            </Section>

            <Section n={9} title="Changes">
              <p className="text-sm leading-relaxed">If this notice changes materially, we will let you know in the app. The current version is always available on this page.</p>
            </Section>
          </>
        )}
      </main>
    </div>
  );
}
