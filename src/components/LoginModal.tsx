import React, { useState, useEffect } from "react";
import { ShieldCheck, User, Lock, Eye, EyeOff, Building, Sun, Monitor, Moon, X, HelpCircle, KeyRound, ArrowRight } from "lucide-react";

interface LoginModalProps {
  onLoginSuccess: (role: "admin" | "visitor", username: string) => void;
  onClose?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: (dark?: boolean) => void;
}

type ThemeMode = 'light' | 'system' | 'dark';

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess, onClose, isDarkMode, onToggleDarkMode }) => {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("muttaqin2026");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem("portal_terpadu_theme_preference") as ThemeMode;
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
        return savedTheme;
      }
      if (isDarkMode !== undefined) return isDarkMode ? 'dark' : 'light';
    } catch {}
    return 'dark';
  });

  // Calculate effective dark state
  const [effectiveIsDark, setEffectiveIsDark] = useState<boolean>(() => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return typeof window !== "undefined" && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const applyTheme = (mode: ThemeMode) => {
    setTheme(mode);
    try {
      localStorage.setItem("portal_terpadu_theme_preference", mode);
    } catch {}

    let dark = false;
    if (mode === 'dark') {
      dark = true;
    } else if (mode === 'light') {
      dark = false;
    } else {
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    setEffectiveIsDark(dark);
    try {
      localStorage.setItem("portal_terpadu_dark_mode", String(dark));
      if (dark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {}

    if (onToggleDarkMode) {
      onToggleDarkMode(dark);
    }
  };

  useEffect(() => {
    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        setEffectiveIsDark(e.matches);
        if (e.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      };
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [theme]);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    const trimmedUsername = username.trim().toLowerCase();
    
    // Accept standard administrator logins
    if (
      (trimmedUsername === "al_muttaqin" || trimmedUsername === "admin" || trimmedUsername === "admin@yayasan.org" || trimmedUsername === "fahmi") && 
      (password === "muttaqin2026" || password === "admin" || password === "admin123")
    ) {
      onLoginSuccess("admin", "Administrator Utama");
      return;
    }

    // Direct match for quick testing
    if (trimmedUsername === "admin" && password === "muttaqin2026") {
      onLoginSuccess("admin", "Administrator Utama");
      return;
    }

    if (!trimmedUsername || !password) {
      setError("Silakan masukkan username dan password.");
      return;
    }

    setError("Username atau password salah. Gunakan username: admin dan password: muttaqin2026");
  };

  const handleFillDemo = () => {
    setUsername("admin");
    setPassword("muttaqin2026");
    setError("");
  };

  const handleGuestLogin = () => {
    onLoginSuccess("visitor", "Tamu / Pengunjung");
  };
  
  // Computed styles based on theme
  const isLight = !effectiveIsDark;
  
  const bgClass = isLight ? "bg-slate-100" : "bg-[#0f111a]";
  const modalBgClass = isLight ? "bg-white border-slate-200" : "bg-[#1a1d24] border-slate-800";
  const textTitleClass = isLight ? "text-slate-900" : "text-white";
  const textSubClass = isLight ? "text-slate-600" : "text-slate-400";
  const labelClass = isLight ? "text-slate-700 font-semibold" : "text-slate-300";
  const inputBgClass = isLight ? "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400" : "bg-[#232732] border-[#2d3240] text-slate-200 placeholder:text-slate-500";
  const logoBgClass = isLight ? "bg-blue-50 border-blue-200 shadow-blue-200/50" : "bg-slate-800/80 border-slate-700 shadow-black/50";
  const dividerClass = isLight ? "border-slate-200" : "border-slate-700";
  const dividerTextBgClass = isLight ? "bg-white" : "bg-[#1a1d24]";
  const themeToggleBgClass = isLight ? "bg-white border-slate-300 shadow-md" : "bg-[#1a1d24] border-slate-700 shadow-lg";
  
  const getThemeBtnClass = (mode: ThemeMode) => {
    const isActive = theme === mode;
    if (isLight) {
      return isActive 
        ? "w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-sm font-bold" 
        : "w-9 h-9 flex items-center justify-center rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors";
    } else {
      return isActive 
        ? "w-9 h-9 flex items-center justify-center rounded-full bg-blue-500 text-white shadow-inner font-bold" 
        : "w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-white transition-colors";
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${bgClass} flex items-center justify-center p-4 transition-colors duration-300 overflow-y-auto`}>
      {/* Background Graphic */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-20%] left-[-10%] w-[70%] h-[50%] ${isLight ? 'bg-blue-200/50' : 'bg-blue-900/20'} rounded-full blur-3xl transform rotate-12 transition-colors duration-300`}></div>
        <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] ${isLight ? 'bg-purple-200/50' : 'bg-purple-900/20'} rounded-full blur-3xl transform -rotate-12 transition-colors duration-300`}></div>
      </div>

      <div className={`${modalBgClass} rounded-3xl max-w-[440px] w-full p-6 sm:p-8 shadow-2xl border space-y-6 relative z-10 transition-colors duration-300 my-auto`}>
        
        {/* Header / Logo */}
        <div className="text-center space-y-3 relative">
          {onClose && (
            <button
              onClick={onClose}
              type="button"
              className="absolute -top-2 -right-2 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className={`w-14 h-14 rounded-2xl ${logoBgClass} border flex items-center justify-center mx-auto shadow-md transition-colors duration-300`}>
            <Building className="w-7 h-7 text-blue-600" />
          </div>
          <div className="space-y-1">
            <h2 className={`text-xl sm:text-2xl font-bold ${textTitleClass} tracking-tight transition-colors duration-300`}>
              Sistem Terpadu Yayasan
            </h2>
            <p className={`text-xs sm:text-[13px] ${textSubClass} font-medium transition-colors duration-300`}>
              Silahkan masuk untuk mengelola data & dokumen yayasan
            </p>
          </div>
        </div>

        {/* Demo Credentials Quick Fill Banner */}
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
          isLight ? "bg-blue-50/80 border-blue-200 text-blue-900" : "bg-blue-950/40 border-blue-800/80 text-blue-200"
        }`}>
          <div className="flex items-center gap-2 truncate">
            <KeyRound className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="truncate">Default: <strong className="font-mono">admin</strong> / <strong className="font-mono">muttaqin2026</strong></span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold shrink-0 shadow-xs cursor-pointer"
          >
            Gunakan Demo
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/40 text-rose-600 dark:text-rose-400 text-xs p-3 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username Field */}
          <div className="space-y-1">
            <label className={`text-[11px] font-bold ${labelClass} uppercase tracking-wider block transition-colors duration-300`}>
              Email, No. Telepon, Atau Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className={`w-full pl-10 pr-4 py-2.5 ${inputBgClass} border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-300`}
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className={`text-[11px] font-bold ${labelClass} uppercase tracking-wider block transition-colors duration-300`}>
                Password
              </label>
              <button 
                type="button" 
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] font-medium text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
              >
                Lupa Password?
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 ${inputBgClass} border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-300`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-500 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sign in (Masuk Sebagai Admin)</span>
            </button>
          </div>
          
          {/* Divider "Atau" */}
          <div className="relative py-2 flex items-center justify-center">
             <div className="absolute inset-0 flex items-center">
               <div className={`w-full border-t ${dividerClass} transition-colors duration-300`}></div>
             </div>
             <div className={`relative px-4 ${dividerTextBgClass} text-[10px] font-bold text-slate-400 uppercase tracking-widest transition-colors duration-300`}>
               Atau
             </div>
          </div>

          {/* Guest / Visitor Login Option */}
          <div>
            <button
              type="button"
              onClick={handleGuestLogin}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isLight 
                  ? "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs" 
                  : "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700"
              }`}
            >
              <span>Masuk sebagai Tamu / Pengunjung (Mode Lihat)</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>

        </form>
      </div>
      
      {/* Theme Toggle in Top Right (Fixed & Functional) */}
      <div className={`fixed top-5 right-5 flex ${themeToggleBgClass} rounded-full p-1 border shadow-xl transition-colors duration-300 z-50`}>
         <button 
           onClick={() => applyTheme('light')} 
           type="button" 
           className={getThemeBtnClass('light')} 
           title="Mode Terang (Light Mode)"
         >
           <Sun className="w-4 h-4" />
         </button>
         <button 
           onClick={() => applyTheme('system')} 
           type="button" 
           className={getThemeBtnClass('system')} 
           title="Ikuti Tema Sistem (System Default)"
         >
            <Monitor className="w-4 h-4" />
         </button>
         <button 
           onClick={() => applyTheme('dark')} 
           type="button" 
           className={getThemeBtnClass('dark')} 
           title="Mode Gelap (Dark Mode)"
         >
           <Moon className="w-4 h-4" />
         </button>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`${modalBgClass} rounded-2xl max-w-sm w-full p-6 border shadow-2xl space-y-4 text-center animate-in fade-in zoom-in duration-150`}>
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className={`text-base font-bold ${textTitleClass}`}>Bantuan Kredensial</h3>
              <p className={`text-xs ${textSubClass} leading-relaxed`}>
                Kredensial master default untuk administrator yayasan adalah:
              </p>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono text-left space-y-1 border border-slate-200 dark:border-slate-700">
                <p>Username : <strong className="text-blue-600 dark:text-blue-400">admin</strong></p>
                <p>Password : <strong className="text-blue-600 dark:text-blue-400">muttaqin2026</strong></p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                handleFillDemo();
                setShowForgotModal(false);
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Gunakan Kredensial Ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
