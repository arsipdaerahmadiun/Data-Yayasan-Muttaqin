#!/bin/bash
cat << 'INNER_EOF' > src/components/LoginModal.tsx
import React, { useState } from "react";
import { ShieldCheck, User, Lock, Eye, EyeOff, Building, Sun, Monitor, Moon } from "lucide-react";

interface LoginModalProps {
  onLoginSuccess: (role: "admin" | "visitor", username: string) => void;
  onClose?: () => void;
}

type ThemeMode = 'light' | 'system' | 'dark';

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess, onClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>('dark');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedUsername = username.trim().toLowerCase();
    
    // Accept both "admin" and "al_muttaqin" for the default admin login
    if ((trimmedUsername === "al_muttaqin" || trimmedUsername === "admin") && password === "muttaqin2026") {
      onLoginSuccess("admin", "Administrator Utama");
    } else {
      setError("Email, No. Telepon, atau Username / Password salah.");
    }
  };
  
  // Computed styles based on theme
  const isLight = theme === 'light';
  
  const bgClass = isLight ? "bg-slate-50" : "bg-[#0f111a]";
  const modalBgClass = isLight ? "bg-white border-slate-200" : "bg-[#1a1d24] border-slate-800";
  const textTitleClass = isLight ? "text-slate-900" : "text-white";
  const textSubClass = isLight ? "text-slate-500" : "text-slate-400";
  const labelClass = isLight ? "text-slate-600" : "text-slate-300";
  const inputBgClass = isLight ? "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400" : "bg-[#232732] border-[#2d3240] text-slate-200 placeholder:text-slate-500";
  const logoBgClass = isLight ? "bg-white border-slate-200 shadow-slate-200/50" : "bg-slate-800/80 border-slate-700 shadow-black/50";
  const dividerClass = isLight ? "border-slate-200" : "border-slate-700";
  const dividerTextBgClass = isLight ? "bg-white" : "bg-[#1a1d24]";
  const themeToggleBgClass = isLight ? "bg-white border-slate-200" : "bg-[#1a1d24] border-slate-800";
  
  const getThemeBtnClass = (mode: ThemeMode) => {
    const isActive = theme === mode;
    if (isLight) {
      return isActive 
        ? "w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-blue-600 shadow-inner" 
        : "w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 transition-colors";
    } else {
      return isActive 
        ? "w-9 h-9 flex items-center justify-center rounded-full bg-[#232732] text-blue-400 shadow-inner" 
        : "w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-white transition-colors";
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${bgClass} flex items-center justify-center p-4 transition-colors duration-300`}>
      {/* Background Graphic */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-20%] left-[-10%] w-[70%] h-[50%] ${isLight ? 'bg-blue-200/40' : 'bg-blue-900/20'} rounded-full blur-3xl transform rotate-12 transition-colors duration-300`}></div>
        <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] ${isLight ? 'bg-purple-200/40' : 'bg-purple-900/20'} rounded-full blur-3xl transform -rotate-12 transition-colors duration-300`}></div>
      </div>

      <div className={`${modalBgClass} rounded-3xl max-w-[420px] w-full p-8 sm:p-10 shadow-2xl border space-y-8 relative z-10 transition-colors duration-300`}>
        
        {/* Header / Logo */}
        <div className="text-center space-y-4">
          <div className={`w-16 h-16 rounded-2xl ${logoBgClass} border flex items-center justify-center mx-auto shadow-lg transition-colors duration-300`}>
            <Building className="w-8 h-8 text-blue-500 opacity-80" />
          </div>
          <div className="space-y-1">
            <h2 className={`text-2xl font-bold ${textTitleClass} tracking-tight transition-colors duration-300`}>Assalamualaikum</h2>
            <p className={`text-[13px] ${textSubClass} font-medium transition-colors duration-300`}>Silahkan masuk untuk melanjutkan.</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username Field */}
          <div className="space-y-1.5">
            <label className={`text-[11px] font-bold ${labelClass} uppercase tracking-wider block transition-colors duration-300`}>
              Email, No. Telepon, Atau Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="w-4.5 h-4.5 text-slate-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className={`w-full pl-10 pr-4 py-3 ${inputBgClass} border rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-300`}
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className={`text-[11px] font-bold ${labelClass} uppercase tracking-wider block transition-colors duration-300`}>
                Password
              </label>
              <button type="button" className="text-[12px] font-medium text-blue-500 hover:text-blue-600 transition-colors">
                Lupa Password?
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="w-4.5 h-4.5 text-slate-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-3 ${inputBgClass} border rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-300`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-500 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-xl text-[15px] transition-colors shadow-lg shadow-blue-600/30"
            >
              Sign in
            </button>
          </div>
          
          <div className="relative py-4 flex items-center justify-center">
             <div className="absolute inset-0 flex items-center">
               <div className={`w-full border-t ${dividerClass} transition-colors duration-300`}></div>
             </div>
             <div className={`relative px-4 ${dividerTextBgClass} text-[11px] font-medium text-slate-400 uppercase tracking-widest transition-colors duration-300`}>
               Atau
             </div>
          </div>

        </form>
      </div>
      
      {/* Theme Toggle (Top Right) */}
      <div className={`absolute top-6 right-6 flex ${themeToggleBgClass} rounded-full p-1 border shadow-lg transition-colors duration-300`}>
         <button onClick={() => setTheme('light')} type="button" className={getThemeBtnClass('light')} title="Light Mode">
           <Sun className="w-4 h-4" />
         </button>
         <button onClick={() => setTheme('system')} type="button" className={getThemeBtnClass('system')} title="System Default">
            <Monitor className="w-4 h-4" />
         </button>
         <button onClick={() => setTheme('dark')} type="button" className={getThemeBtnClass('dark')} title="Dark Mode">
           <Moon className="w-4 h-4" />
         </button>
      </div>
    </div>
  );
};
INNER_EOF
bash update_login.sh