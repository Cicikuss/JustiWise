import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector) // Kullanıcının tarayıcı dilini otomatik algılar
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          settings1: "Settings",
          chooseLanguage: "Choose Language",
          turkish: "Turkish",
          english: "English",
          user: "User",
          noNewNotifications: "No new notifications",
          profile: "Profile",
          myCases: "My Cases",
          settings: "Settings",
          logout: "Log Out",
          aiPanelTitle: "Legal Assistant AI Panel",
          aiPanelSubtitle:
            "Summarize documents, join the courtroom simulation, or ask smart questions.",
          go: "Go",
          searchPlaceholder: "Search across the site...",
          features: {
            summarize: {
              title: "Summarize",
              description: "Summarize long documents in seconds.",
            },
            requestedCasePage: {
              title: "Requested Case Page",
              description: "View pending requests.",
            },
            courtroom: {
              title: "Courtroom",
              description: "Enter the simulation courtroom.",
            },
            qna: {
              title: "Q&A",
              description:
                "Ask smart questions from documents and get answers.",
            },
            tinyCats: {
              title: "TinyCats",
              description: "I love cats.",
            },
            quiz: {
              title: "Quiz",
              description: "Test your legal knowledge.",
            },
          },
        },
      },
      tr: {
        translation: {
          settings1: "Ayarlar",
          chooseLanguage: "Dil Seçiniz",
          turkish: "Türkçe",
          english: "İngilizce",
          user: "Kullanıcı",
          noNewNotifications: "Yeni bildirim yok",
          profile: "Profil",
          myCases: "Davalarım",
          settings: "Ayarlar",
          logout: "Oturumu kapat",
          aiPanelTitle: "Legal Asistan AI Paneli",
          aiPanelSubtitle:
            "Belgeleri özetle, mahkeme simülasyonuna katıl veya akıllı sorular sor.",
          go: "Git",
          searchPlaceholder: "Site genelinde ara...",
          features: {
            summarize: {
              title: "Özetle",
              description: "Uzun belgeleri birkaç saniyede özetle.",
            },
            requestedCasePage: {
              title: "Bekleyen Talepler",
              description: "Bekleyen istekleri görüntüle.",
            },
            courtroom: {
              title: "Sanal Mahkeme",
              description: "Simülasyon mahkeme ortamına giriş yap.",
            },
            qna: {
              title: "Q&A",
              description: "Belgelerden akıllı sorular sor, cevapları al.",
            },
            tinyCats: {
              title: "TinyCats",
              description: "Kedileri seviyorum.",
            },
            quiz: {
              title: "Quiz",
              description: "Hukuk bilginizi test edin.",
            },
          },
        },
      },
    },
    fallbackLng: "tr", // tarayıcı dilini bulamazsa Türkçeye döner
    interpolation: {
      escapeValue: false, // React zaten XSS'e karşı korumalı
    },
    detection: {
      order: ["localStorage", "navigator"], // Önce localStorage, sonra tarayıcı dili
      caches: ["localStorage"],
    },
  });

export default i18n;
