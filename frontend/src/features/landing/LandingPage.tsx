import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { HeroSection } from './sections/HeroSection';
import { TheProblemSection } from './sections/TheProblemSection';
import { HowItWorksSection } from './sections/HowItWorksSection';
import { ProductPreviewSection } from './sections/ProductPreviewSection';
import { ArchitectureSection } from './sections/ArchitectureSection';
import { ResponsibleAiSection } from './sections/ResponsibleAiSection';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. The Problem & Challenges */}
      <TheProblemSection />

      {/* 3. 5-Stage Early-Warning Pipeline & Solution */}
      <HowItWorksSection />

      {/* 4. Interactive Live Dashboard Preview */}
      <ProductPreviewSection />

      {/* 5. System Architecture & Tech Stack */}
      <ArchitectureSection />

      {/* 6. Responsible AI & Community Privacy */}
      <ResponsibleAiSection />

      {/* 7. Bottom CTA Section */}
      <section className="py-20 bg-gradient-to-b from-[#080C14] to-[#0D1527] border-t border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-brand-cyan/40 text-xs font-mono text-brand-cyan shadow-glow-cyan">
            <Activity className="w-3.5 h-3.5" />
            <span>SYNAPSE '26 READY FOR DEPLOYMENT</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold text-white font-display">
            Transform Community Health Signals Into Decisive Action
          </h2>

          <p className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Equip your public health jurisdiction with automated early-warning intelligence. Identify syndromic anomalies before hospitals face critical surges.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/dashboard">
              <Button variant="cyan" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Launch Operational Dashboard
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg">
                Create Agency Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
