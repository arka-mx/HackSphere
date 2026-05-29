import Link from "next/link";

const stats = [
  { value: "12", label: "Villages Monitored", icon: "🏘️" },
  { value: "15+", label: "Reports Collected", icon: "📋" },
  { value: "4", label: "Active Alerts", icon: "🚨" },
  { value: "95%", label: "ML Accuracy", icon: "🤖" },
];

const steps = [
  { step: "1", title: "User Input", desc: "ASHA workers submit field reports", icon: "📱", color: "from-emerald-500/20" },
  { step: "2", title: "API Layer", desc: "Flask validates & stores raw data", icon: "🔗", color: "from-blue-500/20" },
  { step: "3", title: "ML Engine", desc: "RandomForest + Risk engine", icon: "🧠", color: "from-purple-500/20" },
  { step: "4", title: "Database", desc: "SQLite stores predictions", icon: "🗄️", color: "from-amber-500/20" },
  { step: "5", title: "Dashboard", desc: "Live map & trend charts", icon: "📊", color: "from-cyan-500/20" },
  { step: "6", title: "Alerts", desc: "Outbreak popup notifications", icon: "🚨", color: "from-red-500/20" },
];

const features = [
  { title: "Offline-First Reporting", desc: "ASHA workers can submit reports even without internet. Data syncs automatically when connectivity resumes.", icon: "📡", gradient: "from-emerald-600/20 to-cyan-600/20" },
  { title: "Hybrid AI Predictions", desc: "Combines RandomForest ML classification with rule-based risk scoring for accurate outbreak prediction.", icon: "🤖", gradient: "from-purple-600/20 to-pink-600/20" },
  { title: "Real-Time Heatmaps", desc: "Interactive Leaflet maps with color-coded risk markers. Zoom into villages and see live risk data.", icon: "🗺️", gradient: "from-blue-600/20 to-indigo-600/20" },
  { title: "Instant Alert System", desc: "Automatic outbreak alerts when risk exceeds 80%. Push notifications to health officers.", icon: "🚨", gradient: "from-red-600/20 to-orange-600/20" },
  { title: "Multilingual Awareness", desc: "Health education content in English, Hindi, and Bengali for maximum community reach.", icon: "🌐", gradient: "from-amber-600/20 to-yellow-600/20" },
  { title: "Data-Driven Decisions", desc: "Trend analysis charts help administrators allocate medical resources effectively.", icon: "📈", gradient: "from-teal-600/20 to-green-600/20" },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="animate-slide-up mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light text-xs font-semibold tracking-wider text-primary-400 uppercase">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            AI-Powered Health Surveillance
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <span className="gradient-text">JalRakshak</span>
          <br />
          <span className="text-surface-200 text-3xl sm:text-4xl md:text-5xl font-bold">Health AI</span>
        </h1>

        <p className="max-w-2xl text-lg sm:text-xl text-surface-400 leading-relaxed mb-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          Smart Disease Surveillance &amp; Early Warning System for Rural India. Powered by hybrid AI models to predict outbreaks and protect communities.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <Link href="/report" className="btn-primary text-center" id="cta-report">📋 Submit Health Report</Link>
          <Link href="/dashboard" className="btn-outline text-center" id="cta-dashboard">📊 View Dashboard</Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 mt-20 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          {stats.map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 stat-card group hover:scale-105 transition-transform duration-300">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-xs text-surface-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 gradient-text">How It Works</h2>
          <p className="text-center text-surface-400 mb-16 max-w-xl mx-auto">End-to-end pipeline from data collection to outbreak alert</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {steps.map((item, i) => (
              <div key={i} className="glass-card rounded-2xl p-5 text-center group hover:scale-105 transition-all duration-300 relative">
                {i < 5 && <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-primary-500/50 to-transparent" />}
                <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${item.color} to-transparent flex items-center justify-center text-2xl mb-3`}>{item.icon}</div>
                <div className="text-xs text-primary-500 font-bold mb-1">STEP {item.step}</div>
                <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-surface-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16 gradient-text">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 group hover:-translate-y-2 transition-all duration-300">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>{f.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-surface-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">💧</span>
            <span className="text-lg font-bold gradient-text">JalRakshak Health AI</span>
          </div>
          <p className="text-sm text-surface-500 mb-4">Smart Health Surveillance &amp; Disease Early Warning System</p>
          <p className="text-xs text-surface-600">Built for India&apos;s rural communities · Hackathon Project 2026</p>
        </div>
      </footer>
    </div>
  );
}
