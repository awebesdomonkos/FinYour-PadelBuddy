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
      gotIt: "Értem", accept: "Elfogadás", decline: "Elutasítás", unknown: "Ismeretlen"
    },
    nav: { games: "Játékok", players: "Játékosok", groups: "Csoportok", profile: "Profil", myGames: "Saját meccsek" },
    players: { subTitle: "Találj partnereket a közeledben." },
    auth: {
      title: "FindYour PadelBuddy", subTitle: "Csatlakozz a helyi padel közösséghez",
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
      levelTutorialTitle: "Képességszintek", levelTutorialSub: "Padel szintmagyarázat",
      experienceLevels: {
        "Less than 6 months": "Kevesebb mint 6 hónap", "6-12 months": "6-12 hónap",
        "1-2 years": "1-2 év", "2+ years": "Több mint 2 év"
      },
      playTimesList: { "Morning": "Reggel", "Day": "Délután", "Evening": "Este" },
      appLanguageList: { "hu": "Magyar", "en": "English" },
      languageList: { "Hungarian": "Magyar", "English": "Angol" },
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
      filters: { all: "Mind", today: "Ma", tomorrow: "Holnap", weekend: "Hétvége", lastminute: "Last Minute 🔥" },
      recommendedLevel: "Ajánlott szint", players: "játékos", spots: "hely",
      requestToJoin: "Csatlakozás kérése", cancelRequest: "Kérelem visszavonása",
      deleteGame: "Játék törlése", editGame: "Játék szerkesztése",
      confirmDelete: "Biztosan törölni akarod ezt a meccset?",
      noGamesYet: "Még nincs meccs. Legyél te az első!", myCreated: "Általam szervezett", myJoined: "Csatlakozott meccsek"
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
      gameInvite: "Játékmeghívás", newGroupGame: "Új játék a csoportban"
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
      gotIt: "Got it", accept: "Accept", decline: "Decline", unknown: "Unknown"
    },
    nav: { games: "Games", players: "Players", groups: "Groups", profile: "Profile", myGames: "My Games" },
    players: { subTitle: "Find partners near you." },
    auth: {
      title: "FindYour PadelBuddy", subTitle: "Join the local padel community",
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
      levelTutorialTitle: "Skill Levels", levelTutorialSub: "Padel level guide",
      experienceLevels: {
        "Less than 6 months": "Less than 6 months", "6-12 months": "6-12 months",
        "1-2 years": "1-2 years", "2+ years": "2+ years"
      },
      playTimesList: { "Morning": "Morning", "Day": "Afternoon", "Evening": "Evening" },
      appLanguageList: { "hu": "Magyar", "en": "English" },
      languageList: { "Hungarian": "Hungarian", "English": "English" },
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
      filters: { all: "All", today: "Today", tomorrow: "Tomorrow", weekend: "Weekend", lastminute: "Last Minute 🔥" },
      recommendedLevel: "Recommended Level", players: "players", spots: "spots",
      requestToJoin: "Request to Join", cancelRequest: "Cancel Request",
      deleteGame: "Delete Game", editGame: "Edit Game",
      confirmDelete: "Are you sure you want to delete this match?",
      noGamesYet: "No games yet. Be the first to create one!", myCreated: "Created by me", myJoined: "Joined matches"
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
      gameInvite: "Game invitation", newGroupGame: "New game in group"
    }
  }
};
