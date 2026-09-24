import { Language } from './types';

export const translations: Record<Language, any> = {
  hu: {
    common: {
      save: "Mentés", cancel: "Mégse", delete: "Törlés", edit: "Szerkesztés",
      search: "Keresés", searchPlaceholder: "Keresés név vagy város alapján...",
      back: "Vissza", join: "Csatlakozás", leave: "Kilépés", loading: "Betöltés...",
      noData: "Nincs adat", send: "Küldés", verify: "Ellenőrzés", score: "Eredmény",
      repeat: "Ismétlés", joined: "Csatlakozva", requested: "Várólista", full: "Betelt",
      joinMatch: "Jelentkezés", typeMessage: "Írj üzenetet...", noMessages: "Még nincsenek üzenetek.",
      signOut: "Kijelentkezés", scanning: "Pályák keresése...", noMatchesFound: "Nincs találat a szűrők alapján.",
      enter: "Belépés a körbe", all: "Mind", active: "Aktív", datetime: "Dátum és idő",
      gotIt: "Értem", accept: "Elfogadás", decline: "Elutasítás", unknown: "Ismeretlen",
      close: "Bezárás", confirm: "Megerősítés", saving: "Mentés...", saveError: "Nem sikerült menteni. Próbáld újra.",
      networkError: "Hálózati hiba. Ellenőrizd az internetkapcsolatot.", genericError: "Hiba történt, próbáld újra!"
    },
    feedback: {
      entry: "Visszajelzés küldése", entrySub: "Hibát találtál vagy ötleted van? Írd meg!",
      title: "Visszajelzés", subtitle: "Minden üzenetet elolvasunk.",
      categoryLabel: "Téma", categories: { bug: "Hiba", suggestion: "Ötlet", other: "Egyéb" },
      messageLabel: "Üzenet", messagePlaceholder: "Mi történt, vagy min változtatnál?",
      privacyNote: "Az üzenettel együtt elmentjük a fiókodat, az aktuális oldalt és a böngésződ típusát, hogy utána tudjunk járni a hibának.",
      submit: "Küldés", sending: "Küldés...",
      thanksTitle: "Köszönjük!", thanksBody: "Megkaptuk a visszajelzésedet.",
      errorEmpty: "Írj pár szót, mielőtt elküldöd.", errorRateLimit: "Túl sok üzenetet küldtél az elmúlt órában. Próbáld később.",
      errorGeneric: "Nem sikerült elküldeni. Próbáld újra.", errorNetwork: "Hálózati hiba. Ellenőrizd az internetkapcsolatot.",
      statuses: { new: "Új", reviewed: "Átnézve", resolved: "Megoldva" },
      admin: {
        entry: "Beérkezett visszajelzések", title: "Visszajelzések", refresh: "Frissítés", filterLabel: "Szűrés státusz szerint",
        statusLabel: "Státusz", empty: "Nincs ilyen visszajelzés.", deletedUser: "Törölt felhasználó",
        loadError: "Nem sikerült betölteni a visszajelzéseket.", saveError: "Nem sikerült menteni a státuszt."
      }
    },
    legal: { privacyPolicy: "Adatvédelmi nyilatkozat", section: "Súgó és jogi információk" },
    nav: { games: "Játékok", players: "Játékosok", groups: "Csoportok", profile: "Profil", myGames: "Saját meccsek" },
    players: { subTitle: "Találj partnereket a közeledben." },
    auth: {
      title: "Find Your Padel Buddy", subTitle: "Csatlakozz a helyi padel közösséghez",
      usernameLabel: "Felhasználónév", nameLabel: "Neved", emailLabel: "Email cím",
      phoneLabel: "Telefonszám", passwordLabel: "Jelszó", levelLabel: "Szinted",
      usernamePlaceholder: "pl. roger99", namePlaceholder: "pl. Roger",
      emailPlaceholder: "email@pelda.hu", phonePlaceholder: "+36 30 123 4567",
      passwordPlaceholder: "Legalább 6 karakter", secure: "Biztonságos és zárt közösség",
      register: "Regisztráció", login: "Bejelentkezés",
      errors: {
        EMAIL_TAKEN: "Ez az email cím már foglalt.", PHONE_TAKEN: "Ez a telefonszám már foglalt.",
        USERNAME_TAKEN: "Ez a felhasználónév már foglalt.", NAME_TAKEN: "Ez a név már foglalt.",
        USER_NOT_FOUND: "Nincs fiók ezzel az email címmel.", WRONG_PASSWORD: "Hibás jelszó. Kérjük, próbáld újra!",
        GENERIC: "Hiba történt. Kérjük, próbáld újra később."
      },
      noProfile: "Nincs még profilod?", alreadyRegistered: "Már regisztráltál?",
      completeProfileTitle: "Profil kitöltése", completeProfileSub: "Pár utolsó simítás mielőtt a pályára lépsz",
      finishRegistration: "Regisztráció befejezése"
    },
    profile: {
      title: "Profil", editTitle: "Profil szerkesztése", bio: "Bemutatkozás",
      bioPlaceholder: "Mesélj magadról, játékstílusodról...", skillLevel: "Szint",
      experience: "Tapasztalat", location: "Város", locationPlaceholder: "pl. Budapest",
      languages: "Beszélt nyelvek", appLanguage: "App nyelve", socialLinks: "Közösségi média",
      privacy: "Adatvédelem", matchHistory: "Meccselőzmények", playedGames: "Lejátszott meccsek",
      reliability: "Megbízhatóság", addFriend: "Barát hozzáadása", block: "Letiltás", unblock: "Feloldás",
      friends: "Barátok", friendRequests: "Barátkérések", publicProfile: "Nyilvános profil",
      showMatchHistory: "Meccselőzmények láthatósága", showSocialLinks: "Közösségi linkek láthatósága",
      padelExperience: "Padel tapasztalat", playTimes: "Preferált időpontok",
      interests: "Érdeklődési körök", favoriteClubs: "Kedvenc klubok", notifications: "Értesítések",
      addInterest: "Érdeklődési kör hozzáadása...", addClub: "Klub neve...",
      noFriends: "Még nincsenek barátok.", noMatchHistory: "Nincs meccselőzmény",
      playStyle: "Játékstílus", gamesAttended: "meccsen vett részt", status: "LFG Státusz",
      notificationSettings: "Értesítési beállítások", nearGames: "Közeli meccsek",
      reminders: "Emlékeztetők", groupUpdates: "Csoport frissítések",
      friendUpdates: "Barát értesítések", requestUpdates: "Kérés értesítések",
      levels: { Bronze: "Bronz", Silver: "Ezüst", Gold: "Arany" },
      levelDescriptions: {
        Bronze: "Kezdő szint. Ismerkedsz az alapokkal és a szabályokkal.",
        Silver: "Középhaladó. Stabil játékstílus, tudatos falhasználat.",
        Gold: "Haladó. Magas technikai és taktikai tudás."
      },
      avatar: "Profilkép", deletePhoto: "Kép törlése", levelTutorialTitle: "Képességszintek", levelTutorialSub: "Padel szintmagyarázat",
      experienceLevels: {
        "Less than 6 months": "Kevesebb mint 6 hónap", "6-12 months": "6-12 hónap",
        "1-2 years": "1-2 év", "2+ years": "Több mint 2 év"
      },
      playTimesList: { "Morning": "Reggel", "Day": "Délután", "Evening": "Este" },
      appLanguageList: { "hu": "Magyar", "en": "English" },
      languageList: { "Hungarian": "Magyar", "English": "Angol", "Spanish": "Spanyol", "German": "Német", "French": "Francia", "Italian": "Olasz" },
      reliabilityStatus: {
        "New Player": "Új játékos", "Regularly Appears": "Rendszeresen megjelenik",
        "Very Reliable": "Nagyon megbízható", "Unreliable": "Kevésbé megbízható"
      },
      lfg: { "None": "Nincs", "Now": "Azonnal játszanék", "Today": "Ma játszanék" },
      playStyles: { "Casual": "Alkalmi", "Competitive": "Versenyzői", "Technical": "Technikai", "Power": "Erőjátékos" },
      interestsList: {
        "Competitive": "Versenyzői", "Social Padel": "Közösségi Padel",
        "Morning Matches": "Reggeli meccsek", "Evening Matches": "Esti meccsek",
        "Mixed Matches": "Vegyes meccsek", "Tournaments": "Versenyek", "Coaching": "Edzés"
      }
    },
    games: {
      title: "Játékok", createGame: "Játék indítása", createGameShort: "Új Játék",
      findGame: "Játék keresése", findGameSub: "Keress egy meccset és irány a pálya!",
      location: "Helyszín", level: "Szint", type: "Típus", note: "Megjegyzés",
      notePlaceholder: "Egyéb tudnivalók a meccsről...", status: "Státusz",
      joined: "Csatlakozva", required: "Szükséges", attendance: "Visszaigazolás",
      recordResult: "Eredmény rögzítése", score: "Eredmény", visibility: "Láthatóság",
      public: "Nyilvános", groupOnly: "Csak csoport", inviteOnly: "Csak meghívás",
      inviteFriends: "Barátok meghívása", chat: "Meccs Chat", hostMatch: "Játék indítása",
      selectGroup: "Csoport választása", noGroups: "Még nem vagy tagja csoportnak.",
      noFriendsToInvite: "Nincsenek meghívható barátok.",
      attendanceTitle: "Meccs utáni visszaigazolás", attendanceSub: "Igazold vissza, ki jelent meg",
      appeared: "Megjelent", missed: "Hiányzott", matchChat: "Meccs Chat",
      groupChat: "Csoport Chat", chatShort: "Chat",
      gameTypes: { "Friendly": "Baráti", "Competitive": "Verseny", "Training": "Edzés" },
      noScore: "Nincs rögzített eredmény",
      filters: { all: "Mind", today: "Ma", tomorrow: "Holnap", weekend: "Hétvége", lastminute: "Last Minute 🔥" },
      recommendedLevel: "Ajánlott szint", players: "játékos", spots: "hely",
      requestToJoin: "Csatlakozás kérése", cancelRequest: "Kérelem visszavonása", leaveGame: "Kilépés a meccsből",
      deleteGame: "Játék törlése", editGame: "Játék szerkesztése",
      deleteGameConfirm: "Biztosan törlöd ezt a meccset?",
      leaveGameConfirm: "Biztosan kilépsz ebből a meccsből?",
      gameDeleted: "Meccs törölve", gameSaved: "Meccs mentve",
      noPlayersFound: "Nincs találat",
      deleteConfirmTitle: "Játék törlése", deleteConfirmMessage: "Biztosan törölni szeretnéd ezt a játékot? Ez a művelet nem vonható vissza.",
      confirmDelete: "Biztosan törölni akarod ezt a meccset?",
      removeFromHistory: "Eltávolítás az előzményekből", noGamesYet: "Még nincs meccs. Legyél te az első!", myCreated: "Általam szervezett", myJoined: "Csatlakozott meccsek"
    },
    groups: {
      title: "Csoportok", createGroup: "Csoport létrehozása", name: "Csoport neve",
      namePlaceholder: "pl. Reggeli Harcosok", members: "Tagok", admin: "Admin",
      joinRequest: "Csatlakozási kérelem", invite: "Meghívás", description: "Leírás",
      descriptionPlaceholder: "Mire koncentrál a csoport?", location: "Város",
      recommendedLevel: "Ajánlott szint", visibility: "Láthatóság",
      subTitle: "Rendszeres játékostársaságok", noGroups: "Még nincsenek csoportok.",
      joinGroup: "Csatlakozás", leaveGroup: "Kilépés", deleteGroup: "Csoport törlése",
      public: "Nyilvános", private: "Privát"
    },
    notifications: {
      title: "Értesítések", allCaughtUp: "Minden elolvasva!", noNotifications: "Nincsenek új értesítéseid.",
      nearbyGames: "Közeli meccsek", reminders: "Emlékeztetők", groupUpdates: "Csoport frissítések",
      lastMinute: "Last minute hívások", newFriendRequest: "Új barátkérés",
      friendRequestAccepted: "Barátkérés elfogadva", groupInvite: "Csoportmeghívás",
      gameInvite: "Játékmeghívás", newGroupGame: "Új játék a csoportban",
      unreadCount: "{n} olvasatlan", allRead: "Minden olvasott", markAllRead: "Összes megjelölése olvasottként"
    },
    onboarding: {
      skip: "Kihagyás", logout: "Kijelentkezés", next: "Tovább →", finish: "🎾  Belépés a pályára!",
      levelTitle: "Mi a szinted?", levelSub: "Őszintén válaszolj — így találhatsz hasonló szintű partnereket",
      levelDesc: { Bronze: "Kezdő – ismerkedem az alapokkal", Silver: "Középhaladó – stabil játékstílus", Gold: "Haladó – magas technikai szint" },
      experienceQ: "Mennyi tapasztalatod van?",
      experience: { "Less than 6 months": "< 6 hónap", "6-12 months": "6–12 hónap", "1-2 years": "1–2 év", "2+ years": "2+ év" },
      cityTitle: "Melyik városban játszol?", citySub: "Így tudunk közeli meccseket és játékosokat megmutatni",
      cityPlaceholder: "pl. Budapest", cityLabel: "Város", popularCities: "Legnépszerűbb városok",
      timeTitle: "Mikor érsz rá?", timeSub: "Több időpontot is választhatsz — így jobban összepárosítunk",
      styleLabel: "Játékstílusod", optional: "(opcionális)",
      styleDesc: { Casual: "Szórakozásból játszom", Competitive: "Mindig nyerni akarok", Technical: "A pontosság a fontos", Power: "Kemény ütések, erős játék" },
      progress: "{step}. lépés / {total}"
    },
    chat: {
      members: "Tagok", requests: "Kérelmek", noPending: "Nincs függő kérelem", wantsToJoin: "Csatlakozni szeretne",
      freeSlot: "Szabad hely", host: "Szervező", fallbackTitle: "Meccs",
      quick: ["Ott vagyok! 👋", "Kések 10 percet ⏰", "Még aktuális? 🎾", "Jó meccset! 🏆"],
      send: "Üzenet küldése", approve: "Elfogadás", reject: "Elutasítás", messageLabel: "Üzenet"
    },
    time: { now: "Most", minutesAgo: "{n} perce", hoursAgo: "{n} órája", daysAgo: "{n} napja" },
    result: { title: "Eredmény rögzítése", set: "{n}. szett", team1: "1. csapat", team2: "2. csapat", addSet: "+ Szett hozzáadása", save: "Eredmény mentése" },
    completeness: {
      complete: "Teljes profil — Szuper!", percent: "Profilod {n}% teljes", almost: "Szinte teljes! ✨", good: "Jó úton jársz! 👍",
      start: "Töltsd ki a profilod! 🎾", missing: "Hiányzik még:",
      items: { avatar: "Profilkép", bio: "Bemutatkozó", city: "Városod", playstyle: "Játékstílus", playtime: "Preferált időpontok", exp: "Tapasztalat", interests: "Érdeklődési körök", friends: "Első barátod", lfg: "LFG státusz" }
    },
    errors: { title: "Hiba történt", body: "Kérjük, frissítsd az oldalt.", reload: "Újratöltés" },
    confirmDialogs: {
      deleteGameTitle: "Meccs törlése", deleteGame: "Biztosan törlöd ezt a meccset? Ez a művelet nem vonható vissza.",
      deleteGroupTitle: "Csoport törlése", deleteGroup: "Biztosan törlöd a csoportot? Ez a művelet nem vonható vissza.",
      clearHistoryTitle: "Előzmények törlése", clearHistory: "Biztosan törlöd az összes meccselőzményt? Ez nem vonható vissza.",
      leaveGameTitle: "Kilépés a meccsből", leaveGame: "Biztosan kilépsz ebből a meccsből?",
      removeFriendTitle: "Barát eltávolítása"
    },
    a11y: {
      back: "Vissza", close: "Bezárás", notifications: "Értesítések", favorite: "Kedvencek közé", removeFavorite: "Eltávolítás a kedvencek közül",
      removeClub: "Klub eltávolítása", addClub: "Klub hozzáadása", addInterest: "Érdeklődési kör hozzáadása", removeFriend: "Barát eltávolítása",
      deleteGroup: "Csoport törlése", leaveGroup: "Kilépés a csoportból", deleteGame: "Meccs törlése", editProfile: "Profil szerkesztése",
      decreaseScore: "Csökkentés", increaseScore: "Növelés", share: "Megosztás", openChat: "Chat megnyitása", logout: "Kijelentkezés",
      gdprRequired: "Az adatvédelmi nyilatkozat elfogadása kötelező."
    },
    push: {
      label: "Push-értesítések ezen az eszközön",
      hint: "Szólunk meghívóknál, csatlakozási kérelmeknél és értékeléseknél — akkor is, ha az app zárva van.",
      denied: "A böngésző letiltotta az értesítéseket. Az oldal beállításaiban tudod újra engedélyezni.",
      iosInstall: "iPhone-on és iPaden a push-értesítésekhez add hozzá az appot a Főképernyőhöz (Megosztás → Főképernyőhöz adás), majd onnan nyisd meg.",
      error: "Nem sikerült bekapcsolni az értesítéseket. Próbáld újra.",
      enabled: "Push-értesítések bekapcsolva",
      disabled: "Push-értesítések kikapcsolva"
    }
  },
  en: {
    common: {
      save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit",
      search: "Search", searchPlaceholder: "Search by name or city...",
      back: "Back", join: "Join", leave: "Leave", loading: "Loading...",
      noData: "No data", send: "Send", verify: "Verify", score: "Score",
      repeat: "Repeat", joined: "Joined", requested: "Waitlist", full: "Full",
      joinMatch: "Join Match", typeMessage: "Type a message...", noMessages: "No messages yet.",
      signOut: "Sign Out", scanning: "Scanning courts...", noMatchesFound: "No results found.",
      enter: "Enter", all: "All", active: "Active", datetime: "Date & Time",
      gotIt: "Got it", accept: "Accept", decline: "Decline", unknown: "Unknown",
      close: "Close", confirm: "Confirm", saving: "Saving...", saveError: "Couldn't save. Please try again.",
      networkError: "Network error. Check your internet connection.", genericError: "Something went wrong, please try again!"
    },
    feedback: {
      entry: "Send feedback", entrySub: "Found a bug or have an idea? Tell us!",
      title: "Feedback", subtitle: "We read every message.",
      categoryLabel: "Topic", categories: { bug: "Bug", suggestion: "Idea", other: "Other" },
      messageLabel: "Message", messagePlaceholder: "What happened, or what would you change?",
      privacyNote: "Along with your message we store your account, the current page and your browser type so we can look into the issue.",
      submit: "Send", sending: "Sending...",
      thanksTitle: "Thank you!", thanksBody: "We've received your feedback.",
      errorEmpty: "Write a few words before sending.", errorRateLimit: "You've sent too many messages in the last hour. Please try later.",
      errorGeneric: "Couldn't send it. Please try again.", errorNetwork: "Network error. Check your internet connection.",
      statuses: { new: "New", reviewed: "Reviewed", resolved: "Resolved" },
      admin: {
        entry: "Incoming feedback", title: "Feedback", refresh: "Refresh", filterLabel: "Filter by status",
        statusLabel: "Status", empty: "No feedback here.", deletedUser: "Deleted user",
        loadError: "Couldn't load feedback.", saveError: "Couldn't save the status."
      }
    },
    legal: { privacyPolicy: "Privacy Policy", section: "Help & legal" },
    nav: { games: "Games", players: "Players", groups: "Groups", profile: "Profile", myGames: "My Games" },
    players: { subTitle: "Find partners near you." },
    auth: {
      title: "Find Your Padel Buddy", subTitle: "Join the local padel community",
      usernameLabel: "Username", nameLabel: "Your name", emailLabel: "Email address",
      phoneLabel: "Phone number", passwordLabel: "Password", levelLabel: "Your level",
      usernamePlaceholder: "e.g. roger99", namePlaceholder: "e.g. Roger",
      emailPlaceholder: "email@example.com", phonePlaceholder: "+36 30 123 4567",
      passwordPlaceholder: "At least 6 characters", secure: "Secure and closed community",
      register: "Register", login: "Login",
      errors: {
        EMAIL_TAKEN: "This email address is already taken.", PHONE_TAKEN: "This phone number is already taken.",
        USERNAME_TAKEN: "This username is already taken.", NAME_TAKEN: "This name is already taken.",
        USER_NOT_FOUND: "No account found with this email.", WRONG_PASSWORD: "Invalid password. Please try again!",
        GENERIC: "Something went wrong. Please try again later."
      },
      noProfile: "Don't have a profile yet?", alreadyRegistered: "Already registered?",
      completeProfileTitle: "Complete Your Profile", completeProfileSub: "A few last touches before you hit the court",
      finishRegistration: "Finish Registration"
    },
    profile: {
      title: "Profile", editTitle: "Edit Profile", bio: "Bio",
      bioPlaceholder: "Tell others about yourself and your play style...", skillLevel: "Skill Level",
      experience: "Experience", location: "City", locationPlaceholder: "e.g. Budapest",
      languages: "Languages Spoken", appLanguage: "App Language", socialLinks: "Social Media",
      privacy: "Privacy", matchHistory: "Match History", playedGames: "Games Played",
      reliability: "Reliability", addFriend: "Add Friend", block: "Block", unblock: "Unblock",
      friends: "Friends", friendRequests: "Friend Requests", publicProfile: "Public Profile",
      showMatchHistory: "Show Match History", showSocialLinks: "Show Social Links",
      padelExperience: "Padel Experience", playTimes: "Preferred Times",
      interests: "Interests", favoriteClubs: "Favourite Clubs", notifications: "Notifications",
      addInterest: "Add an interest...", addClub: "Club name...",
      noFriends: "No friends yet.", noMatchHistory: "No match history",
      playStyle: "Play Style", gamesAttended: "games attended", status: "LFG Status",
      notificationSettings: "Notification Settings", nearGames: "Nearby games",
      reminders: "Reminders", groupUpdates: "Group updates",
      friendUpdates: "Friend notifications", requestUpdates: "Request notifications",
      levels: { Bronze: "Bronze", Silver: "Silver", Gold: "Gold" },
      levelDescriptions: {
        Bronze: "Beginner level. Getting familiar with the basics and rules.",
        Silver: "Intermediate. Stable play style, conscious wall use.",
        Gold: "Advanced. High technical and tactical knowledge."
      },
      avatar: "Profile Picture", deletePhoto: "Remove photo", levelTutorialTitle: "Skill Levels", levelTutorialSub: "Padel level guide",
      experienceLevels: {
        "Less than 6 months": "Less than 6 months", "6-12 months": "6-12 months",
        "1-2 years": "1-2 years", "2+ years": "2+ years"
      },
      playTimesList: { "Morning": "Morning", "Day": "Afternoon", "Evening": "Evening" },
      appLanguageList: { "hu": "Magyar", "en": "English" },
      languageList: { "Hungarian": "Hungarian", "English": "English", "Spanish": "Spanish", "German": "German", "French": "French", "Italian": "Italian" },
      reliabilityStatus: {
        "New Player": "New Player", "Regularly Appears": "Regularly Appears",
        "Very Reliable": "Very Reliable", "Unreliable": "Unreliable"
      },
      lfg: { "None": "None", "Now": "Playing Now", "Today": "Playing Today" },
      playStyles: { "Casual": "Casual", "Competitive": "Competitive", "Technical": "Technical", "Power": "Power" },
      interestsList: {
        "Competitive": "Competitive", "Social Padel": "Social Padel",
        "Morning Matches": "Morning Matches", "Evening Matches": "Evening Matches",
        "Mixed Matches": "Mixed Matches", "Tournaments": "Tournaments", "Coaching": "Coaching"
      }
    },
    games: {
      title: "Games", createGame: "Create Game", createGameShort: "New Game",
      findGame: "Find a Game", findGameSub: "Find a match and head to the court!",
      location: "Location", level: "Level", type: "Type", note: "Note",
      notePlaceholder: "Any additional info about the match...", status: "Status",
      joined: "Joined", required: "Required", attendance: "Attendance",
      recordResult: "Record Result", score: "Score", visibility: "Visibility",
      public: "Public", groupOnly: "Group Only", inviteOnly: "Invite Only",
      inviteFriends: "Invite Friends", chat: "Match Chat", hostMatch: "Host a Match",
      selectGroup: "Select Group", noGroups: "You're not in any groups yet.",
      noFriendsToInvite: "No friends to invite.",
      attendanceTitle: "Post-Match Attendance", attendanceSub: "Confirm who showed up",
      appeared: "Appeared", missed: "Missed", matchChat: "Match Chat",
      groupChat: "Group Chat", chatShort: "Chat",
      gameTypes: { "Friendly": "Friendly", "Competitive": "Competitive", "Training": "Training" },
      noScore: "No score recorded",
      filters: { all: "All", today: "Today", tomorrow: "Tomorrow", weekend: "Weekend", lastminute: "Last Minute 🔥" },
      recommendedLevel: "Recommended Level", players: "players", spots: "spots",
      requestToJoin: "Request to Join", cancelRequest: "Cancel Request", leaveGame: "Leave Game",
      deleteGame: "Delete Game", editGame: "Edit Game",
      deleteGameConfirm: "Are you sure you want to delete this match?",
      leaveGameConfirm: "Are you sure you want to leave this match?",
      gameDeleted: "Match deleted", gameSaved: "Match saved",
      noPlayersFound: "No players found",
      deleteConfirmTitle: "Delete Game", deleteConfirmMessage: "Are you sure you want to delete this game? This action cannot be undone.",
      confirmDelete: "Are you sure you want to delete this match?",
      removeFromHistory: "Remove from history", noGamesYet: "No games yet. Be the first to create one!", myCreated: "Created by me", myJoined: "Joined matches"
    },
    groups: {
      title: "Groups", createGroup: "Create Group", name: "Group Name",
      namePlaceholder: "e.g. Morning Warriors", members: "Members", admin: "Admin",
      joinRequest: "Join Request", invite: "Invite", description: "Description",
      descriptionPlaceholder: "What does the group focus on?", location: "City",
      recommendedLevel: "Recommended Level", visibility: "Visibility",
      subTitle: "Regular playing groups", noGroups: "No groups yet.",
      joinGroup: "Join Group", leaveGroup: "Leave Group", deleteGroup: "Delete Group",
      public: "Public", private: "Private"
    },
    notifications: {
      title: "Notifications", allCaughtUp: "All caught up!", noNotifications: "No new notifications.",
      nearbyGames: "Nearby Games", reminders: "Reminders", groupUpdates: "Group Updates",
      lastMinute: "Last Minute Calls", newFriendRequest: "New friend request",
      friendRequestAccepted: "Friend request accepted", groupInvite: "Group invitation",
      gameInvite: "Game invitation", newGroupGame: "New game in group",
      unreadCount: "{n} unread", allRead: "All read", markAllRead: "Mark all as read"
    },
    onboarding: {
      skip: "Skip", logout: "Sign out", next: "Next →", finish: "🎾  Hit the court!",
      levelTitle: "What's your level?", levelSub: "Answer honestly — that's how you'll find partners at your level",
      levelDesc: { Bronze: "Beginner – learning the basics", Silver: "Intermediate – steady play style", Gold: "Advanced – strong technique" },
      experienceQ: "How much experience do you have?",
      experience: { "Less than 6 months": "< 6 months", "6-12 months": "6–12 months", "1-2 years": "1–2 years", "2+ years": "2+ years" },
      cityTitle: "Which city do you play in?", citySub: "So we can show you nearby games and players",
      cityPlaceholder: "e.g. Budapest", cityLabel: "City", popularCities: "Popular cities",
      timeTitle: "When are you free?", timeSub: "Pick as many as you like — it helps us match you better",
      styleLabel: "Your play style", optional: "(optional)",
      styleDesc: { Casual: "I play for fun", Competitive: "I always want to win", Technical: "Precision matters most", Power: "Hard hits, strong game" },
      progress: "Step {step} of {total}"
    },
    chat: {
      members: "Members", requests: "Requests", noPending: "No pending requests", wantsToJoin: "Wants to join",
      freeSlot: "Open spot", host: "Host", fallbackTitle: "Match",
      quick: ["I'm here! 👋", "Running 10 min late ⏰", "Still on? 🎾", "Good game! 🏆"],
      send: "Send message", approve: "Approve", reject: "Reject", messageLabel: "Message"
    },
    time: { now: "Now", minutesAgo: "{n} min ago", hoursAgo: "{n} h ago", daysAgo: "{n} d ago" },
    result: { title: "Record Result", set: "Set {n}", team1: "Team 1", team2: "Team 2", addSet: "+ Add Set", save: "Save Result" },
    completeness: {
      complete: "Complete profile — Great!", percent: "Profile {n}% complete", almost: "Almost there! ✨", good: "Good progress! 👍",
      start: "Complete your profile! 🎾", missing: "Still missing:",
      items: { avatar: "Profile picture", bio: "Bio", city: "Your city", playstyle: "Play style", playtime: "Preferred times", exp: "Experience", interests: "Interests", friends: "Your first friend", lfg: "LFG status" }
    },
    errors: { title: "Something went wrong", body: "Please reload the page.", reload: "Reload" },
    confirmDialogs: {
      deleteGameTitle: "Delete match", deleteGame: "Are you sure you want to delete this match? This can't be undone.",
      deleteGroupTitle: "Delete group", deleteGroup: "Are you sure you want to delete this group? This can't be undone.",
      clearHistoryTitle: "Clear history", clearHistory: "Delete your entire match history? This can't be undone.",
      leaveGameTitle: "Leave match", leaveGame: "Are you sure you want to leave this match?",
      removeFriendTitle: "Remove friend"
    },
    a11y: {
      back: "Back", close: "Close", notifications: "Notifications", favorite: "Add to favourites", removeFavorite: "Remove from favourites",
      removeClub: "Remove club", addClub: "Add club", addInterest: "Add interest", removeFriend: "Remove friend",
      deleteGroup: "Delete group", leaveGroup: "Leave group", deleteGame: "Delete match", editProfile: "Edit profile",
      decreaseScore: "Decrease", increaseScore: "Increase", share: "Share", openChat: "Open chat", logout: "Sign out",
      gdprRequired: "You must accept the privacy policy."
    },
    push: {
      label: "Push notifications on this device",
      hint: "We'll let you know about invites, join requests and ratings — even when the app is closed.",
      denied: "Notifications are blocked by your browser. You can re-enable them in the site settings.",
      iosInstall: "On iPhone and iPad, add the app to your Home Screen (Share → Add to Home Screen) and open it from there to enable push notifications.",
      error: "Couldn't turn on notifications. Please try again.",
      enabled: "Push notifications turned on",
      disabled: "Push notifications turned off"
    }
  }
};
