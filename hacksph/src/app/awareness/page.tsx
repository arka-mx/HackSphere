"use client";

import { useState } from "react";
import { awarenessCards, type AwarenessCard } from "@/lib/mockData";

type Lang = "en" | "hi" | "bn";

const languages: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
];

export default function AwarenessPage() {
  const [lang, setLang] = useState<Lang>("en");

  const headings: Record<Lang, { title: string; subtitle: string }> = {
    en: {
      title: "Health & Hygiene Awareness",
      subtitle: "Learn simple practices to protect your family and community from waterborne diseases.",
    },
    hi: {
      title: "स्वास्थ्य और स्वच्छता जागरूकता",
      subtitle: "जलजनित बीमारियों से अपने परिवार और समुदाय की रक्षा के लिए सरल उपाय जानें।",
    },
    bn: {
      title: "স্বাস্থ্য ও স্বাস্থ্যবিধি সচেতনতা",
      subtitle: "জলবাহিত রোগ থেকে আপনার পরিবার এবং সম্প্রদায়কে রক্ষা করার জন্য সহজ অভ্যাস শিখুন।",
    },
  };

  return (
    <div className="min-h-screen bg-grid relative">
      <div className="absolute inset-0 bg-radial-glow" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        {/* Language Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl glass-light p-1 gap-1" id="lang-toggle">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                id={`lang-${l.code}`}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  lang === l.code
                    ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                    : "text-surface-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {l.native}
              </button>
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="gradient-text">{headings[lang].title}</span>
          </h1>
          <p className="text-surface-400 max-w-xl mx-auto">
            {headings[lang].subtitle}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {awarenessCards.map((card, i) => (
            <div
              key={card.id}
              className="glass-card rounded-2xl p-6 group hover:-translate-y-1 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform`}
                >
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {card.title[lang]}
                  </h3>
                  <p className="text-sm text-surface-400 leading-relaxed">
                    {card.body[lang]}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Info */}
        <div className="mt-12 glass-card rounded-2xl p-6 text-center border-primary-500/20">
          <h2 className="text-xl font-bold text-white mb-3">
            {lang === "en" ? "🆘 Emergency Contact" : lang === "hi" ? "🆘 आपातकालीन संपर्क" : "🆘 জরুরি যোগাযোগ"}
          </h2>
          <p className="text-surface-400 mb-4 text-sm">
            {lang === "en"
              ? "If you see multiple people sick with similar symptoms, contact your nearest ASHA worker or health center immediately."
              : lang === "hi"
              ? "अगर आप देखें कि कई लोग एक जैसे लक्षणों से बीमार हैं, तो तुरंत अपने नजदीकी आशा कार्यकर्ता या स्वास्थ्य केंद्र से संपर्क करें।"
              : "আপনি যদি দেখেন যে একই ধরনের লক্ষণ নিয়ে অনেক মানুষ অসুস্থ, তাহলে অবিলম্বে আপনার নিকটতম ASHA কর্মী বা স্বাস্থ্য কেন্দ্রে যোগাযোগ করুন।"}
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
            <span className="text-2xl">📞</span>
            <div className="text-left">
              <div className="text-xs text-surface-400">
                {lang === "en" ? "Health Helpline" : lang === "hi" ? "स्वास्थ्य हेल्पलाइन" : "স্বাস্থ্য হেল্পলাইন"}
              </div>
              <div className="text-lg font-bold text-primary-400">104</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
