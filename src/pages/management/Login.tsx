import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, ShieldCheck, Eye, EyeOff, ArrowRight } from "lucide-react";

const ManagementLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("admin");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would authenticate here and set the role in context/localStorage
    localStorage.setItem("userRole", role);
    navigate("/management");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6 shadow-xl shadow-primary/20 rotate-3">
            <span className="text-white font-black text-3xl italic">F</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            Management <span className="text-accent underline decoration-4 decoration-accent/30 underline-offset-4 font-black">Portal</span>
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Access your shop's heartbeat and statistics</p>
        </div>

        {/* Login Form */}
        <div className="bg-white p-10 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-slate-100">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                Authorized Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`py-3 px-4 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                    role === "admin" 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-slate-100 text-slate-400 hover:border-slate-200"
                  }`}
                >
                  <ShieldCheck size={16} />
                  ADMIN
                </button>
                <button
                  type="button"
                  onClick={() => setRole("manager")}
                  className={`py-3 px-4 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                    role === "manager" 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-slate-100 text-slate-400 hover:border-slate-200"
                  }`}
                >
                  <User size={16} />
                  MANAGER
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-primary focus:ring-primary" />
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
              </label>
              <button type="button" className="text-xs font-bold text-primary hover:underline underline-offset-4">
                Forgot access?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all group"
            >
              AUTHENTICATE
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-slate-400 text-xs font-medium">
          Protected System. Unauthorized access is strictly monitored.
        </p>
      </div>
    </div>
  );
};

export default ManagementLogin;
