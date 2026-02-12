import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Login functionality coming soon!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar />
      <Navbar />
      
      <main className="flex-grow bg-primary relative flex items-center justify-center px-4 overflow-hidden py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid-login" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid-login)" />
        </svg>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl font-black text-white tracking-tight">
            SIGN IN
          </h1>
          <p className="text-white/60 text-sm mt-2 font-medium">Access your DTX account</p>
        </div>

        <div className="bg-white rounded-2xl p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-primary font-bold text-xs uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <input
                  type="email" required placeholder="your@email.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F5F7F9] border-none py-4 px-6 rounded-lg text-sm focus:ring-1 focus:ring-accent transition-all pl-12"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent opacity-50" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-primary font-bold text-xs uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} required placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F5F7F9] border-none py-4 px-6 rounded-lg text-sm focus:ring-1 focus:ring-accent transition-all pl-12 pr-12"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent opacity-50" />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full bg-accent text-white py-4 rounded-lg font-black text-xs tracking-[0.2em] uppercase hover:bg-accent/90 transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-3">
              <LogIn className="h-4 w-4" /> SIGN IN
            </button>
            
            <div className="pt-4 text-center">
              <p className="text-sm text-muted-foreground font-medium">
                Don't have an account?{" "}
                <Link to="/register" className="text-accent font-bold hover:underline">CREATE ONE</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>

    <Footer />
  </div>
  );
};

export default Login;
