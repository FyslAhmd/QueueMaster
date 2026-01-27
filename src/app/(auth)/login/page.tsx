'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, User, Calendar, Clock, Users, Shield } from 'lucide-react';
import { loginSchema, LoginInput } from '@/lib/validations/auth';
import { Button, Alert } from '@/components/ui';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    console.log('Login attempt with:', { email: data.email });
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      console.log('SignIn result:', result);

      if (result?.error) {
        let errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        
        if (result.error === 'CredentialsSignin') {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (result.error === 'Configuration') {
          errorMessage = 'Authentication service temporarily unavailable. Please try again in a moment.';
        } else if (result.error.includes('Invalid email or password')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else {
          errorMessage = 'Login failed. Please check your credentials and try again.';
        }
        
        console.log('Login error:', result.error, '-> mapped to:', errorMessage);
        setError(errorMessage);
        toast.error(errorMessage);
      } else if (result?.ok) {
        console.log('Login successful');
        toast.success('Welcome back!');
        router.push('/dashboard');
        router.refresh();
      } else {
        console.log('Login failed with unknown result:', result);
        setError('Login failed. Please try again.');
        toast.error('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: 'info.faysal.32@gmail.com',
        password: 'Ahmed@761',
        redirect: false,
      });

      if (result?.error) {
        let errorMessage = 'Demo account not available. Please register an account first.';
        
        if (result.error.includes('Invalid email or password')) {
          errorMessage = 'Demo account not set up. Please create your own account instead.';
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      } else if (result?.ok) {
        toast.success('Welcome to the demo!');
        router.push('/dashboard');
        router.refresh();
      } else {
        setError('Demo login failed. Please create your own account.');
        toast.error('Demo login failed. Please create your own account.');
      }
    } catch (err) {
      console.error('Demo login error:', err);
      const errorMessage = 'Demo account unavailable. Please register a new account.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Calendar, text: 'Smart appointment scheduling' },
    { icon: Users, text: 'Efficient queue management' },
    { icon: Clock, text: 'Real-time availability updates' },
    { icon: Shield, text: 'Secure & reliable platform' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-teal-600 via-teal-500 to-emerald-500 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-teal-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-white">QueueMaster</span>
          </Link>

          {/* Headline */}
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Welcome back to
            <br />
            <span className="text-teal-100">smarter scheduling</span>
          </h1>
          
          <p className="text-lg text-teal-50/80 mb-10 max-w-md">
            Sign in to manage your appointments, track queues, and optimize your workflow.
          </p>

          {/* Feature list */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/90 font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-800">QueueMaster</span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Sign in to your account</h1>
            <p className="text-sm sm:text-base text-slate-500">Enter your credentials to access your dashboard</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-5 sm:p-8 border border-slate-100">
            {error && (
              <Alert 
                type="error" 
                title="Login Failed" 
                message={error} 
                className="mb-5 sm:mb-6" 
              />
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400 text-sm sm:text-base"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400 text-sm sm:text-base"
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-linear-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold shadow-lg shadow-teal-500/25 transition-all text-sm sm:text-base"
                isLoading={isLoading}
                leftIcon={<LogIn className="w-4 h-4" />}
              >
                Sign In
              </Button>
            </form>

            <div className="relative my-5 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-slate-500">or</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 border-2 border-slate-300 bg-white hover:border-teal-400 hover:bg-teal-50 text-slate-700 py-2.5 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base disabled:opacity-50"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              <User className="w-4 h-4" />
              Login as Demo User
            </button>

            <p className="text-center text-sm text-slate-500 mt-5 sm:mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-teal-600 hover:text-teal-700 font-semibold">
                Sign up for free
              </Link>
            </p>
          </div>

          {/* Back to home */}
          <p className="text-center mt-5 sm:mt-6">
            <Link href="/" className="text-sm text-slate-500 hover:text-teal-600 transition-colors">
              ← Back to home
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
