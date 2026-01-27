'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, Calendar, Clock, Users, Shield, CheckCircle } from 'lucide-react';
import { registerSchema, RegisterInput } from '@/lib/validations/auth';
import { Button, Alert } from '@/components/ui';
import api, { ApiError } from '@/lib/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFieldError,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      await api.post('/auth/register', data);
      toast.success('Account created successfully! Please log in.');
      router.push('/login');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
      
      if (apiError.errors) {
        Object.entries(apiError.errors).forEach(([field, message]) => {
          setFieldError(field as keyof RegisterInput, { message });
        });
      }
      
      toast.error(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    { icon: Calendar, text: 'Unlimited appointments' },
    { icon: Users, text: 'Up to 5 team members' },
    { icon: Clock, text: 'Real-time queue updates' },
    { icon: Shield, text: 'Free forever to start' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-emerald-600 via-teal-500 to-cyan-500 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-emerald-400/10 rounded-full blur-3xl" />
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
            Start your journey to
            <br />
            <span className="text-emerald-100">effortless scheduling</span>
          </h1>
          
          <p className="text-lg text-emerald-50/80 mb-10 max-w-md">
            Join thousands of businesses already using QueueMaster to streamline their operations.
          </p>

          {/* Benefits list */}
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/90 font-medium">{benefit.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md my-8 lg:my-0"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-800">QueueMaster</span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left mb-5 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Create your account</h1>
            <p className="text-sm sm:text-base text-slate-500">Get started with your free account today</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-5 sm:p-8 border border-slate-100">
            {error && (
              <Alert type="error" message={error} className="mb-4 sm:mb-5" />
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400 text-sm sm:text-base"
                    {...register('name')}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
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
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400 text-sm sm:text-base"
                    {...register('password')}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">At least 6 characters</p>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400 text-sm sm:text-base"
                    {...register('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-linear-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold shadow-lg shadow-teal-500/25 transition-all text-sm sm:text-base"
                isLoading={isLoading}
                leftIcon={<UserPlus className="w-4 h-4" />}
              >
                Create Account
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-5">
              Already have an account?{' '}
              <Link href="/login" className="text-teal-600 hover:text-teal-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>

          {/* Back to home */}
          <p className="text-center mt-5">
            <Link href="/" className="text-sm text-slate-500 hover:text-teal-600 transition-colors">
              ← Back to home
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
