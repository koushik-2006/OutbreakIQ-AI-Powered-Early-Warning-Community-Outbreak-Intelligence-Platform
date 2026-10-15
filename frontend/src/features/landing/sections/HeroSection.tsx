import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  VolumeX, 
  ArrowRight, 
  Triangle
} from 'lucide-react';
import bioPathogenImg from '../../../assets/images/bio_pathogen_cluster.jpg';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 bg-[#0B0D14] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
          
          {/* Left Side: Category, Headline, Feature Triangles & CTA */}
          <div className="lg:col-span-6 relative flex gap-6">
            
            {/* Leftmost Vertical 4-Dot Stepper */}
            <div className="hidden sm:flex flex-col items-center gap-4 pt-16 flex-shrink-0">
              {/* Dot 1: Active with ring */}
              <div className="relative flex items-center justify-center">
                <span className="w-4 h-4 rounded-full border border-purple-400/80 animate-ping absolute" />
                <span className="w-3.5 h-3.5 rounded-full border border-purple-300 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </span>
              </div>
              {/* Dots 2, 3, 4 */}
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            </div>

            {/* Content Column */}
            <div className="space-y-6">
              {/* Top Category Tag */}
              <div className="text-[11px] font-mono tracking-[0.25em] uppercase text-slate-400 font-semibold">
                EARLY WARNING, REIMAGINED
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-white font-display leading-[1.12]">
                See Emerging Signals.<br />
                Understand the Risk.<br />
                <span className="inline-flex items-center gap-3">
                  <span>Act With Confidence.</span>
                  {/* Glowing Infinity / DNA loop symbol */}
                  <svg className="w-8 h-8 text-brand-purple inline-block drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" />
                  </svg>
                </span>
              </h1>

              {/* 3 Core Points Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-2">
                {/* Point 1: Early Signal Detection */}
                <div className="sm:col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Triangle className="w-2.5 h-2.5 fill-purple-400 text-purple-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white font-mono">
                      EARLY SIGNAL DETECTION
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 pl-4 leading-relaxed">
                    Identify unusual changes in community health indicators.
                  </p>
                </div>

                {/* Point 2: Regional Intelligence */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Triangle className="w-2.5 h-2.5 fill-cyan-400 text-cyan-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white font-mono">
                      REGIONAL INTELLIGENCE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 pl-4 leading-relaxed">
                    Explore patterns and changes across monitored regions.
                  </p>
                </div>

                {/* Point 3: Evidence-Based Review */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Triangle className="w-2.5 h-2.5 fill-purple-400 text-purple-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white font-mono">
                      EVIDENCE-BASED REVIEW
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 pl-4 leading-relaxed">
                    Understand supporting indicators before taking action.
                  </p>
                </div>
              </div>

              {/* Supporting Paragraph */}
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed pt-1">
                Outbreak AI helps public-health teams examine emerging community health signals, understand the evidence and coordinate timely follow-up.
              </p>

              {/* Pill Button */}
              <div className="pt-2">
                <Link to="/dashboard">
                  <button className="px-6 py-3 rounded-full border border-slate-600/90 hover:border-slate-300 text-slate-200 hover:text-white text-xs uppercase font-semibold tracking-wider transition-all duration-200 bg-slate-900/60 hover:bg-slate-800 shadow-lg">
                    EXPLORE THE PLATFORM
                  </button>
                </Link>
              </div>

            </div>
          </div>

          {/* Right Side: Biological Pathogen Visual & 3 Floating Cards */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            
            {/* The Pathogen Container */}
            <div className="relative w-full max-w-[480px] aspect-square rounded-3xl overflow-visible flex items-center justify-center">
              
              {/* Biological Pathogen Visual */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-[#090B12]">
                <img
                  src={bioPathogenImg}
                  alt="Outbreak AI Biological Pathogen Cluster"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>

              {/* Floating Card 1: Top Right (Signal Detection) */}
              <div className="absolute -top-3 -right-2 sm:-right-4 z-20 glass-card rounded-2xl p-3 border border-purple-500/30 shadow-2xl backdrop-blur-xl max-w-[210px] animate-float">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Play className="w-2.5 h-2.5 fill-purple-400 text-purple-400" />
                  <span className="text-xs font-bold text-white font-mono">Signal Detection</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-4 leading-tight">
                  Identify unusual health patterns
                </p>
              </div>

              {/* Floating Card 2: Bottom Left (Regional Intelligence) */}
              <div 
                className="absolute -bottom-3 -left-2 sm:-left-4 z-20 glass-card rounded-2xl p-3 border border-purple-500/30 shadow-2xl backdrop-blur-xl max-w-[220px] animate-float"
                style={{ animationDelay: '2s' }}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Play className="w-2.5 h-2.5 fill-purple-400 text-purple-400" />
                  <span className="text-xs font-bold text-white font-mono">Regional Intelligence</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-4 leading-tight">
                  Explore community-level trends
                </p>
              </div>

              {/* Floating Card 3: Bottom Right (Evidence Analysis) */}
              <div 
                className="absolute -bottom-6 -right-2 sm:-right-6 z-20 glass-card rounded-2xl p-3 border border-purple-500/30 shadow-2xl backdrop-blur-xl max-w-[220px] animate-float"
                style={{ animationDelay: '4s' }}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Play className="w-2.5 h-2.5 fill-purple-400 text-purple-400" />
                  <span className="text-xs font-bold text-white font-mono">Evidence Analysis</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-4 leading-tight">
                  Review supporting indicators
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Feature Banner (Directly Matching Stitch Screenshot) */}
        <div className="mt-16 p-4 sm:p-5 rounded-2xl bg-[#0F121C]/90 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Audio Mute Icon */}
            <button className="w-9 h-9 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white transition-colors flex-shrink-0">
              <VolumeX className="w-4 h-4" />
            </button>

            {/* 01 Number in violet */}
            <span className="text-2xl font-bold font-display text-purple-400 font-mono">01</span>

            {/* Banner Title */}
            <span className="text-sm font-semibold text-white whitespace-nowrap">
              <strong className="text-purple-300 font-bold">Understand</strong> the Signals Behind the Data
            </span>
          </div>

          {/* Center/Right Pill & Description */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto text-center md:text-left">
            {/* Small biological thumbnail */}
            <div className="hidden sm:block w-12 h-6 rounded-md overflow-hidden border border-white/10 flex-shrink-0">
              <img src={bioPathogenImg} alt="" className="w-full h-full object-cover" />
            </div>

            {/* White Pill Badge */}
            <span className="px-3 py-1 rounded-full bg-white text-slate-950 font-bold text-[11px] tracking-wide font-mono whitespace-nowrap">
              BUILT FOR HUMAN REVIEW
            </span>

            {/* Right Subtext */}
            <p className="text-xs text-slate-400 max-w-md leading-snug">
              Explore changing health indicators, examine supporting evidence and help teams coordinate informed public-health review.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
