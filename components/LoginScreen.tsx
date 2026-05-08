'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, LayoutDashboard, Lock, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    
    // Simulate network delay for a more premium feel
    await new Promise((resolve) => setTimeout(resolve, 800));

    const success = await onLogin(email, password);
    
    if (!success) {
      setError('Invalid email or password.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 overflow-hidden relative transition-colors duration-200">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-sky-200/50 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-200/40 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-5xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        
        {/* Left Side: Branding and Value Prop */}
        <div className="flex-1 space-y-8 text-center lg:text-left z-10">
          <div className="inline-flex items-center justify-center lg:justify-start gap-2 rounded-full bg-sky-100/80 px-4 py-2">
            <LayoutDashboard className="h-5 w-5 text-sky-700" />
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-sky-800 dark:text-sky-300">
              TaskTracker Pro
            </span>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-[1.1]">
            Manage your <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">
              workspace
            </span> <br className="hidden lg:block" />
            seamlessly.
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto lg:mx-0">
            Track daily tasks, monitor progress, and maintain detailed work logs in one unified workspace.
          </p>

          <div className="hidden lg:flex flex-col gap-4 pt-4">
            {['Real-time task tracking', 'Automated work logs', 'Local data privacy'].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full max-w-md z-10">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-2xl rounded-3xl p-8 relative overflow-hidden transition-colors duration-200">
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 dark:from-slate-800/60 to-white/10 dark:to-slate-900/10 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Welcome back</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to your account to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl text-center animate-in fade-in slide-in-from-top-2">
                    {error}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 ml-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                      <Input
                        type="email"
                        placeholder="admin@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-colors rounded-xl text-slate-900 dark:text-slate-50"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-colors rounded-xl text-slate-900 dark:text-slate-50"
                        autoComplete="current-password"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 bg-slate-900 dark:bg-slate-50 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl shadow-lg hover:shadow-xl transition-all group"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 dark:border-slate-900/20 border-t-white dark:border-t-slate-900" />
                  ) : (
                    <div className="flex items-center gap-2">
                      Sign In
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>
                
                <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-4">
                  Mock login: Use any email and password.
                </p>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
