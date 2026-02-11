import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Activity, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({
          title: "Tarkista sähköpostisi",
          description: "Lähetimme sinulle vahvistuslinkin.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Virhe",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-primary/3 rounded-full blur-[100px]" />

      <div className="w-full max-w-md relative z-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-bold">Takaisin</span>
        </button>

        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center glow-primary">
            <Activity size={24} className="text-primary-foreground" />
          </div>
          <span className="text-2xl font-black tracking-tighter">
            LIVE<span className="text-primary">TRACK</span>
          </span>
        </div>

        <h1 className="text-3xl font-black tracking-tight mb-2">
          {isLogin ? "Kirjaudu sisään" : "Luo tili"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {isLogin
            ? "Tervetuloa takaisin terminaaliin."
            : "Aloita kryptojen reaaliaikainen seuranta."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Nimi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground font-medium focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-muted-foreground"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="email"
              placeholder="Sähköposti"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground font-medium focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-muted-foreground"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="password"
              placeholder="Salasana"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground font-medium focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-muted-foreground"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black text-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 glow-primary"
          >
            {loading ? "Ladataan..." : isLogin ? "Kirjaudu" : "Rekisteröidy"}
          </button>
        </form>

        <p className="text-center text-muted-foreground mt-6 text-sm">
          {isLogin ? "Eikö sinulla ole tiliä?" : "Onko sinulla jo tili?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-bold hover:underline"
          >
            {isLogin ? "Rekisteröidy" : "Kirjaudu sisään"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
