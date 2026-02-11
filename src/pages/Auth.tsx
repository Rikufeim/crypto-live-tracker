import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Activity, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AuthStarsBackground } from "@/components/ui/auth-stars-background";

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
          title: "Check your email",
          description: "We sent you a confirmation link.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      <AuthStarsBackground />

      {/* Top nav */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 py-4 auth-nav-bg flex items-center justify-between">
        <div className="flex-1 flex justify-start">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-bold transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <span className="text-2xl font-black tracking-tighter">
            LIVE<span className="text-primary">TRACK</span>
          </span>
        </div>
        <div className="flex-1 flex justify-end" />
      </div>

      {/* Auth card */}
      <div className="w-full max-w-md relative z-10 pt-12">

        <h1 className="text-3xl font-black tracking-tight mb-2">
          {isLogin ? "Log in" : "Create account"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {isLogin
            ? "Welcome back, boss."
            : "Start tracking your crypto in real time."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Name"
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
              placeholder="Email"
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
              placeholder="Password"
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
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black text-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Loading..." : isLogin ? "Log in" : "Sign up"}
          </button>
        </form>

        <p className="text-center text-muted-foreground mt-6 text-sm">
          {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-bold hover:underline"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
