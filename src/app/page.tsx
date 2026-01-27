'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import CountUp from 'react-countup';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  Sparkles,
  Star,
} from 'lucide-react';

// Fresh Teal/Mint Color Palette for Appointment System
// Primary: Teal (#0D9488) - Trust, calm, professional
// Accent: Emerald (#10B981) - Growth, success
// Background: Light mint (#F0FDFA) - Clean, modern

const features = [
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Intelligent appointment booking with conflict detection and automatic slot management.',
    gradient: 'from-teal-500 to-cyan-400',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  {
    icon: Users,
    title: 'Queue Management',
    description: 'Automated queue system that assigns customers to available staff based on capacity.',
    gradient: 'from-emerald-500 to-teal-400',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Clock,
    title: 'Real-time Updates',
    description: 'Live updates on appointment status, wait times, and staff availability.',
    gradient: 'from-cyan-500 to-blue-400',
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Comprehensive insights into appointments, staff performance, and customer flow.',
    gradient: 'from-blue-500 to-indigo-400',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Built with enterprise-grade security and authentication to protect your data.',
    gradient: 'from-indigo-500 to-purple-400',
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized performance with modern tech stack for seamless user experience.',
    gradient: 'from-amber-500 to-orange-400',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Stats data with numeric values for CountUp
const stats = [
  { value: 10000, suffix: '+', label: 'Appointments Booked', icon: Calendar },
  { value: 500, suffix: '+', label: 'Happy Businesses', icon: Users },
  { value: 99.9, suffix: '%', decimals: 1, label: 'Uptime Guaranteed', icon: Shield },
  { value: 4.9, suffix: '', decimals: 1, label: 'User Rating', icon: Star },
];

// Stats Section Component with synchronized CountUp
function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mt-12 sm:mt-20 max-w-5xl mx-auto px-2 sm:px-0"
    >
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-teal-100 transition-all duration-300"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-linear-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
              <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800">
            {isInView ? (
              <CountUp
                start={0}
                end={stat.value}
                duration={3}
                decimals={stat.decimals || 0}
                suffix={stat.suffix}
                useEasing={true}
                easingFn={(t, b, c, d) => {
                  t /= d;
                  return c * t * t * t + b;
                }}
              />
            ) : (
              <span>0{stat.suffix}</span>
            )}
            {stat.label === 'User Rating' && <span className="text-amber-400 ml-1">★</span>}
          </div>
          <div className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">{stat.label}</div>
        </div>
      ))}
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-teal-50/30 to-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-linear-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="font-bold text-lg sm:text-xl text-slate-800">QueueMaster</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/login"
                className="text-sm sm:text-base text-slate-600 hover:text-teal-600 transition-colors font-medium"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-linear-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 transition-all font-semibold text-sm sm:text-base text-white shadow-lg shadow-teal-500/25"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-28 px-4 sm:px-6 lg:px-8">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-20 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-teal-200/40 rounded-full blur-3xl" />
          <div className="absolute top-40 -right-20 sm:right-20 w-64 sm:w-96 h-64 sm:h-96 bg-emerald-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/3 w-48 sm:w-80 h-48 sm:h-80 bg-cyan-200/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-teal-50 border border-teal-200 mb-6 sm:mb-8">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" />
              <span className="text-xs sm:text-sm font-medium text-teal-700">Smart Appointment Management</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6 text-slate-800 px-2 sm:px-0"
          >
            Streamline Your{' '}
            <span className="bg-linear-to-r from-teal-600 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              Appointments
            </span>
            <br />& Queue Management
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-8 sm:mb-10 px-2 sm:px-0"
          >
            The all-in-one solution for scheduling appointments, managing waiting queues,
            and optimizing staff workload. Built for businesses that value their customers&apos; time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0"
          >
            <Link
              href="/register"
              className="group w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl bg-linear-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 transition-all font-semibold text-base sm:text-lg text-white shadow-xl shadow-teal-500/30"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all font-semibold text-base sm:text-lg text-slate-700"
            >
              View Demo
            </Link>
          </motion.div>

          {/* Stats */}
          <StatsSection />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-16"
          >
            <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
              Features
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-slate-800">
              Everything You Need
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto px-4 sm:px-0">
              Powerful features to help you manage appointments and queues efficiently
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-white border border-slate-100 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-100/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${feature.iconBg} flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-slate-800">{feature.title}</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-32 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 sm:w-80 h-48 sm:h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-20"
          >
            <span className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-teal-500/20 text-teal-300 text-xs sm:text-sm font-semibold mb-4 sm:mb-6 border border-teal-500/30">
              How It Works
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6 text-white">
              Get Started in Minutes
            </h2>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto px-4 sm:px-0">
              Simple setup process to transform your appointment management
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10"
          >
            {[
              {
                step: '01',
                title: 'Add Your Staff',
                description: 'Set up your team members with their specialties and daily capacity.',
                gradient: 'from-teal-400 to-teal-600',
                bgGlow: 'bg-teal-500',
              },
              {
                step: '02',
                title: 'Configure Services',
                description: 'Define your services with duration and availability settings.',
                gradient: 'from-emerald-400 to-emerald-600',
                bgGlow: 'bg-emerald-500',
              },
              {
                step: '03',
                title: 'Start Scheduling',
                description: 'Book appointments and let the system handle queue management automatically.',
                gradient: 'from-cyan-400 to-cyan-600',
                bgGlow: 'bg-cyan-500',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative group"
              >
                {/* Glow effect */}
                <div className={`absolute -inset-1 ${item.bgGlow}/20 rounded-2xl sm:rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-slate-700/50 hover:border-teal-500/50 transition-all duration-300">
                  {/* Step number with gradient background */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-linear-to-br ${item.gradient} text-white font-bold text-lg sm:text-xl mb-4 sm:mb-6 shadow-lg`}>
                    {item.step}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white">{item.title}</h3>
                  <p className="text-sm sm:text-base text-slate-400 leading-relaxed">{item.description}</p>
                  
                  {/* Connector line for desktop */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-12 -right-5 w-10 h-0.5 bg-linear-to-r from-slate-600 to-slate-700" />
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Get Started Section - Minimalist Design */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-20"
          >
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-emerald-50 border border-emerald-200 mb-4 sm:mb-6">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs sm:text-sm font-medium text-emerald-700">Free to get started</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4 sm:mb-6 leading-tight">
                Start managing
                <br />
                <span className="bg-linear-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                  smarter today
                </span>
              </h2>
              
              <p className="text-base sm:text-lg text-slate-600 mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0">
                No credit card required. Get set up in under 5 minutes and see the difference in your workflow.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 lg:justify-start justify-center">
                <Link
                  href="/register"
                  className="group w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl bg-linear-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 transition-all font-semibold text-base sm:text-lg text-white shadow-lg shadow-teal-500/25"
                >
                  Create Free Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="text-slate-600 hover:text-teal-600 transition-colors font-semibold text-base sm:text-lg underline underline-offset-4 decoration-slate-300 hover:decoration-teal-400"
                >
                  Sign in instead
                </Link>
              </div>
            </div>

            {/* Right Content - Feature Highlights */}
            <div className="flex-1 w-full max-w-md">
              <div className="space-y-3 sm:space-y-4">
                {[
                  { icon: CheckCircle, text: 'Unlimited appointments on free plan', color: 'text-teal-500' },
                  { icon: Users, text: 'Manage up to 5 staff members', color: 'text-emerald-500' },
                  { icon: BarChart3, text: 'Basic analytics & reports included', color: 'text-cyan-500' },
                  { icon: Shield, text: 'Enterprise-grade security by default', color: 'text-indigo-500' },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
                  >
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 ${item.color}`}>
                      <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-sm sm:text-base text-slate-700 font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-linear-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <span className="font-bold text-base sm:text-lg text-slate-800">QueueMaster</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 text-center">
            &copy; {new Date().getFullYear()} QueueMaster. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
