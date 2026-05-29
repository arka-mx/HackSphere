// ============================
// JalRakshak Health AI – Mock Data
// ============================

export interface Village {
  name: string;
  latitude: number;
  longitude: number;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}

export interface Report {
  id: number;
  village: string;
  fever: number;
  diarrhea: number;
  vomiting: number;
  waterCondition: string;
  waterNumeric: number;
  date: string;
  riskScore: number;
  mlPrediction: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}

export interface Alert {
  id: number;
  village: string;
  risk: number;
  timestamp: string;
  status: "active" | "resolved";
}

export interface AwarenessCard {
  id: number;
  title: { en: string; hi: string; bn: string };
  body: { en: string; hi: string; bn: string };
  icon: string;
  color: string;
}

// ---- Village Coordinates (Rural India) ----
export const villages: Village[] = [
  { name: "Sundarbans", latitude: 21.9497, longitude: 88.8989, riskScore: 87, riskLevel: "HIGH" },
  { name: "Rampurhat", latitude: 24.1723, longitude: 87.7832, riskScore: 62, riskLevel: "MEDIUM" },
  { name: "Kalna", latitude: 23.2210, longitude: 88.3639, riskScore: 34, riskLevel: "LOW" },
  { name: "Bankura", latitude: 23.2324, longitude: 87.0678, riskScore: 91, riskLevel: "HIGH" },
  { name: "Durgapur", latitude: 23.5204, longitude: 87.3119, riskScore: 45, riskLevel: "MEDIUM" },
  { name: "Malda", latitude: 25.0108, longitude: 88.1410, riskScore: 78, riskLevel: "MEDIUM" },
  { name: "Purulia", latitude: 23.3321, longitude: 86.3650, riskScore: 95, riskLevel: "HIGH" },
  { name: "Bolpur", latitude: 23.6693, longitude: 87.7214, riskScore: 28, riskLevel: "LOW" },
  { name: "Berhampore", latitude: 24.1005, longitude: 88.2510, riskScore: 55, riskLevel: "MEDIUM" },
  { name: "Diamond Harbour", latitude: 22.1910, longitude: 88.1868, riskScore: 82, riskLevel: "HIGH" },
  { name: "Basirhat", latitude: 22.6527, longitude: 88.8664, riskScore: 71, riskLevel: "MEDIUM" },
  { name: "Jhargram", latitude: 22.4493, longitude: 86.9942, riskScore: 19, riskLevel: "LOW" },
];

// ---- Reports ----
export const reports: Report[] = [
  { id: 1, village: "Sundarbans", fever: 1, diarrhea: 1, vomiting: 1, waterCondition: "contaminated", waterNumeric: 1, date: "2026-05-20", riskScore: 87, mlPrediction: 1, riskLevel: "HIGH" },
  { id: 2, village: "Rampurhat", fever: 1, diarrhea: 1, vomiting: 0, waterCondition: "clean", waterNumeric: 0, date: "2026-05-21", riskScore: 62, mlPrediction: 0, riskLevel: "MEDIUM" },
  { id: 3, village: "Kalna", fever: 0, diarrhea: 1, vomiting: 0, waterCondition: "clean", waterNumeric: 0, date: "2026-05-22", riskScore: 34, mlPrediction: 0, riskLevel: "LOW" },
  { id: 4, village: "Bankura", fever: 1, diarrhea: 1, vomiting: 1, waterCondition: "contaminated", waterNumeric: 1, date: "2026-05-22", riskScore: 91, mlPrediction: 1, riskLevel: "HIGH" },
  { id: 5, village: "Durgapur", fever: 1, diarrhea: 0, vomiting: 1, waterCondition: "clean", waterNumeric: 0, date: "2026-05-23", riskScore: 45, mlPrediction: 0, riskLevel: "MEDIUM" },
  { id: 6, village: "Malda", fever: 1, diarrhea: 1, vomiting: 0, waterCondition: "contaminated", waterNumeric: 1, date: "2026-05-23", riskScore: 78, mlPrediction: 1, riskLevel: "MEDIUM" },
  { id: 7, village: "Purulia", fever: 1, diarrhea: 1, vomiting: 1, waterCondition: "contaminated", waterNumeric: 1, date: "2026-05-24", riskScore: 95, mlPrediction: 1, riskLevel: "HIGH" },
  { id: 8, village: "Bolpur", fever: 0, diarrhea: 0, vomiting: 1, waterCondition: "clean", waterNumeric: 0, date: "2026-05-24", riskScore: 28, mlPrediction: 0, riskLevel: "LOW" },
  { id: 9, village: "Berhampore", fever: 1, diarrhea: 1, vomiting: 0, waterCondition: "clean", waterNumeric: 0, date: "2026-05-25", riskScore: 55, mlPrediction: 0, riskLevel: "MEDIUM" },
  { id: 10, village: "Diamond Harbour", fever: 1, diarrhea: 1, vomiting: 1, waterCondition: "contaminated", waterNumeric: 1, date: "2026-05-25", riskScore: 82, mlPrediction: 1, riskLevel: "HIGH" },
  { id: 11, village: "Basirhat", fever: 1, diarrhea: 1, vomiting: 0, waterCondition: "contaminated", waterNumeric: 1, date: "2026-05-26", riskScore: 71, mlPrediction: 1, riskLevel: "MEDIUM" },
  { id: 12, village: "Jhargram", fever: 0, diarrhea: 0, vomiting: 0, waterCondition: "clean", waterNumeric: 0, date: "2026-05-27", riskScore: 19, mlPrediction: 0, riskLevel: "LOW" },
  { id: 13, village: "Sundarbans", fever: 1, diarrhea: 1, vomiting: 0, waterCondition: "contaminated", waterNumeric: 1, date: "2026-05-26", riskScore: 83, mlPrediction: 1, riskLevel: "HIGH" },
  { id: 14, village: "Purulia", fever: 1, diarrhea: 1, vomiting: 1, waterCondition: "contaminated", waterNumeric: 1, date: "2026-05-27", riskScore: 92, mlPrediction: 1, riskLevel: "HIGH" },
  { id: 15, village: "Kalna", fever: 0, diarrhea: 0, vomiting: 0, waterCondition: "clean", waterNumeric: 0, date: "2026-05-28", riskScore: 12, mlPrediction: 0, riskLevel: "LOW" },
];

// ---- Time Series (Cases Over Time) ----
export const casesOverTime = [
  { date: "May 18", cases: 3, highRisk: 1 },
  { date: "May 19", cases: 5, highRisk: 2 },
  { date: "May 20", cases: 8, highRisk: 3 },
  { date: "May 21", cases: 6, highRisk: 2 },
  { date: "May 22", cases: 12, highRisk: 5 },
  { date: "May 23", cases: 9, highRisk: 4 },
  { date: "May 24", cases: 14, highRisk: 6 },
  { date: "May 25", cases: 11, highRisk: 5 },
  { date: "May 26", cases: 16, highRisk: 7 },
  { date: "May 27", cases: 13, highRisk: 5 },
  { date: "May 28", cases: 18, highRisk: 8 },
  { date: "May 29", cases: 15, highRisk: 6 },
];

// ---- Risk Per Village (bar chart) ----
export const riskPerVillage = villages.map((v) => ({
  village: v.name,
  risk: v.riskScore,
  fill:
    v.riskLevel === "HIGH"
      ? "#ef4444"
      : v.riskLevel === "MEDIUM"
      ? "#f59e0b"
      : "#10b981",
}));

// ---- Alerts ----
export const alerts: Alert[] = [
  { id: 1, village: "Purulia", risk: 95, timestamp: "2026-05-27T14:30:00Z", status: "active" },
  { id: 2, village: "Bankura", risk: 91, timestamp: "2026-05-26T10:15:00Z", status: "active" },
  { id: 3, village: "Sundarbans", risk: 87, timestamp: "2026-05-25T18:45:00Z", status: "active" },
  { id: 4, village: "Diamond Harbour", risk: 82, timestamp: "2026-05-25T09:20:00Z", status: "active" },
  { id: 5, village: "Malda", risk: 78, timestamp: "2026-05-23T12:00:00Z", status: "resolved" },
];

// ---- Awareness Content (Multilingual) ----
export const awarenessCards: AwarenessCard[] = [
  {
    id: 1,
    title: {
      en: "Boil Water Before Drinking",
      hi: "पीने से पहले पानी उबालें",
      bn: "পান করার আগে জল ফুটিয়ে নিন",
    },
    body: {
      en: "Always boil water for at least 1 minute before drinking. This kills harmful bacteria and viruses that can cause diseases like cholera and typhoid.",
      hi: "पीने से पहले हमेशा पानी को कम से कम 1 मिनट तक उबालें। इससे हैजा और टाइफॉइड जैसी बीमारियां पैदा करने वाले हानिकारक बैक्टीरिया और वायरस नष्ट हो जाते हैं।",
      bn: "সর্বদা পান করার আগে কমপক্ষে ১ মিনিটের জন্য জল ফুটিয়ে নিন। এটি কলেরা এবং টাইফয়েডের মতো রোগ সৃষ্টিকারী ক্ষতিকর ব্যাকটেরিয়া এবং ভাইরাস মেরে ফেলে।",
    },
    icon: "💧",
    color: "from-blue-600/20 to-cyan-600/20",
  },
  {
    id: 2,
    title: {
      en: "Wash Hands Frequently",
      hi: "बार-बार हाथ धोएं",
      bn: "ঘন ঘন হাত ধুন",
    },
    body: {
      en: "Wash hands with soap and clean water for at least 20 seconds, especially before eating and after using the toilet. This simple habit prevents 80% of common infections.",
      hi: "कम से कम 20 सेकंड तक साबुन और साफ पानी से हाथ धोएं, खासकर खाने से पहले और शौचालय जाने के बाद। यह सरल आदत 80% सामान्य संक्रमणों को रोकती है।",
      bn: "কমপক্ষে ২০ সেকেন্ড ধরে সাবান এবং পরিষ্কার জল দিয়ে হাত ধুন, বিশেষ করে খাওয়ার আগে এবং টয়লেট ব্যবহারের পর। এই সহজ অভ্যাস ৮০% সাধারণ সংক্রমণ প্রতিরোধ করে।",
    },
    icon: "🧼",
    color: "from-emerald-600/20 to-green-600/20",
  },
  {
    id: 3,
    title: {
      en: "Report Symptoms Early",
      hi: "लक्षणों की जल्दी रिपोर्ट करें",
      bn: "লক্ষণগুলি তাড়াতাড়ি রিপোর্ট করুন",
    },
    body: {
      en: "If you notice fever, diarrhea, or vomiting in your community, report immediately to the nearest ASHA worker or health center. Early reporting saves lives.",
      hi: "यदि आपके समुदाय में बुखार, दस्त या उल्टी दिखाई दे, तो तुरंत नजदीकी आशा कार्यकर्ता या स्वास्थ्य केंद्र को रिपोर्ट करें। जल्दी रिपोर्ट करने से जान बचती है।",
      bn: "আপনার সম্প্রদায়ে জ্বর, ডায়রিয়া বা বমি দেখা গেলে, অবিলম্বে নিকটতম ASHA কর্মী বা স্বাস্থ্য কেন্দ্রে রিপোর্ট করুন। তাড়াতাড়ি রিপোর্ট করলে জীবন বাঁচে।",
    },
    icon: "🏥",
    color: "from-rose-600/20 to-pink-600/20",
  },
  {
    id: 4,
    title: {
      en: "Keep Surroundings Clean",
      hi: "आसपास साफ-सफाई रखें",
      bn: "পরিবেশ পরিষ্কার রাখুন",
    },
    body: {
      en: "Remove stagnant water near your home. Use mosquito nets while sleeping. Cover food items properly. These measures prevent malaria, dengue, and other diseases.",
      hi: "अपने घर के पास का रुका हुआ पानी हटाएं। सोते समय मच्छरदानी का प्रयोग करें। खाद्य पदार्थों को ठीक से ढकें। ये उपाय मलेरिया, डेंगू और अन्य बीमारियों को रोकते हैं।",
      bn: "আপনার বাড়ির কাছে জমে থাকা জল সরান। ঘুমানোর সময় মশারি ব্যবহার করুন। খাবার ঠিকমতো ঢেকে রাখুন। এই ব্যবস্থাগুলি ম্যালেরিয়া, ডেঙ্গু এবং অন্যান্য রোগ প্রতিরোধ করে।",
    },
    icon: "🏡",
    color: "from-amber-600/20 to-yellow-600/20",
  },
  {
    id: 5,
    title: {
      en: "Use Clean Toilets",
      hi: "स्वच्छ शौचालय का उपयोग करें",
      bn: "পরিষ্কার শৌচাগার ব্যবহার করুন",
    },
    body: {
      en: "Open defecation contaminates water sources and spreads diseases. Always use a toilet and ensure it is kept clean. Proper sanitation is key to community health.",
      hi: "खुले में शौच करने से जल स्रोत दूषित होते हैं और बीमारियां फैलती हैं। हमेशा शौचालय का उपयोग करें और उसे साफ रखें। उचित स्वच्छता सामुदायिक स्वास्थ्य की कुंजी है।",
      bn: "খোলা জায়গায় মলত্যাগ করলে জলের উৎস দূষিত হয় এবং রোগ ছড়ায়। সর্বদা শৌচাগার ব্যবহার করুন এবং এটি পরিষ্কার রাখুন। সঠিক স্যানিটেশন সম্প্রদায়ের স্বাস্থ্যের চাবিকাঠি।",
    },
    icon: "🚻",
    color: "from-violet-600/20 to-purple-600/20",
  },
  {
    id: 6,
    title: {
      en: "Eat Freshly Cooked Food",
      hi: "ताज़ा पका हुआ भोजन खाएं",
      bn: "সদ্য রান্না করা খাবার খান",
    },
    body: {
      en: "Avoid eating stale or uncovered food. Cook food thoroughly and eat it while fresh. Proper food hygiene prevents stomach infections and food poisoning.",
      hi: "बासी या बिना ढके भोजन से बचें। भोजन को अच्छी तरह पकाएं और ताज़ा खाएं। उचित खाद्य स्वच्छता पेट के संक्रमण और फूड पॉइज़निंग को रोकती है।",
      bn: "বাসি বা খোলা খাবার এড়িয়ে চলুন। খাবার ভালোভাবে রান্না করুন এবং তাজা খান। সঠিক খাদ্য স্বাস্থ্যবিধি পেটের সংক্রমণ এবং ফুড পয়জনিং প্রতিরোধ করে।",
    },
    icon: "🍲",
    color: "from-orange-600/20 to-red-600/20",
  },
];

// ---- Helpers ----
export function getRiskColor(level: string): string {
  switch (level) {
    case "HIGH":
      return "#ef4444";
    case "MEDIUM":
      return "#f59e0b";
    case "LOW":
      return "#10b981";
    default:
      return "#94a3b8";
  }
}

export function getRiskBadgeClass(level: string): string {
  switch (level) {
    case "HIGH":
      return "risk-high";
    case "MEDIUM":
      return "risk-medium";
    case "LOW":
      return "risk-low";
    default:
      return "";
  }
}

export function calculateRisk(
  fever: number,
  diarrhea: number,
  vomiting: number,
  waterContaminated: boolean
): { risk: number; level: "LOW" | "MEDIUM" | "HIGH"; mlPrediction: number } {
  // Rule-based risk
  let risk = fever * 2 + diarrhea * 3 + vomiting * 2 + (waterContaminated ? 20 : 0);

  // Normalize to 0-100 scale
  const baseRisk = Math.min(risk * 3.7, 70);

  // Simple ML simulation
  const featureSum = fever + diarrhea + vomiting + (waterContaminated ? 1 : 0);
  const mlPrediction = featureSum >= 3 ? 1 : 0;

  // Hybrid: if ML predicts outbreak, add +30
  const finalRisk = Math.min(Math.round(baseRisk + (mlPrediction ? 30 : 0)), 100);

  const level: "LOW" | "MEDIUM" | "HIGH" =
    finalRisk >= 80 ? "HIGH" : finalRisk >= 50 ? "MEDIUM" : "LOW";

  return { risk: finalRisk, level, mlPrediction };
}
