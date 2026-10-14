import React, { useState } from 'react';
import { Check, Sparkles, Zap, Shield, HelpCircle, ArrowRight } from 'lucide-react';
import { PricingTier } from '../../types';

interface PricingProps {
  onSelectTier: (tierId: string) => void;
}

const TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 0,
    priceAnnual: 0,
    description: 'Perfect for individual developers exploring the future of 3D spatial coding.',
    features: [
      'Interactive 3D IDE Workspace',
      'Up to 15,000 monthly AI code completions',
      'Basic RAG project understanding (up to 50 files)',
      'Time-travel 3D debugger (local stack)',
      'Community Discord & Forum Support'
    ],
    ctaText: 'Start Free Forever'
  },
  {
    id: 'pro',
    name: 'Professional',
    priceMonthly: 29,
    priceAnnual: 23,
    badge: 'MOST POPULAR',
    highlighted: true,
    description: 'For senior engineers and power builders requiring zero-latency AST synthesis.',
    features: [
      'Unlimited Titan-3.8 AI code generation',
      'Full-repository RAG knowledge graph (unlimited files)',
      'Autonomous multi-agent task execution swarm',
      'Advanced 3D memory leak & race condition visualizer',
      'Zero-trust security & automated CVE hot-patching',
      'Continuous JIT AST compilation & benchmarking',
      'Priority GPU worker access with 1.8ms latency'
    ],
    ctaText: 'Upgrade to Pro'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 99,
    priceAnnual: 79,
    badge: 'ENTERPRISE-GRADE',
    description: 'Custom fine-tuned models, on-prem VPC deployment, and SOC2 compliance.',
    features: [
      'Everything in Professional',
      'Self-hosted VPC or air-gapped on-premise deployment',
      'Custom fine-tuned weights on your private repositories',
      'Enterprise SSO (SAML, Okta, Azure AD) & RBAC',
      'Dedicated 99.99% uptime SLA & 24/7 engineering line',
      'Zero data retention & IP indemnification policy'
    ],
    ctaText: 'Contact Enterprise Sales'
  }
];

export const PricingSection: React.FC<PricingProps> = ({ onSelectTier }) => {
  const [annualBilling, setAnnualBilling] = useState(true);

  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-[#0c102c]/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-3">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            TRANSPARENT VALUE MATRIX
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            Engineered for High-Velocity Teams
          </h2>
          <p className="mt-4 text-gray-400 text-base leading-relaxed">
            Transparent pricing without surprise token fees. Choose your tier or try the full developer suite free.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3 font-mono text-xs">
            <span className={!annualBilling ? 'text-white font-bold' : 'text-gray-400'}>Monthly</span>
            <button
              onClick={() => setAnnualBilling(!annualBilling)}
              className="w-12 h-6 rounded-full bg-[#182046] border border-cyan-500/30 p-0.5 relative transition-colors cursor-pointer"
            >
              <div
                className={`w-5 h-5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-transform ${
                  annualBilling ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={annualBilling ? 'text-white font-bold flex items-center gap-1.5' : 'text-gray-400'}>
              Annual <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">SAVE 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {TIERS.map((tier) => {
            const price = annualBilling ? tier.priceAnnual : tier.priceMonthly;
            return (
              <div
                key={tier.id}
                className={`rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 relative ${
                  tier.highlighted
                    ? 'glass-panel-elevated border-2 border-cyan-400 shadow-[0_0_40px_rgba(0,217,255,0.25)] scale-[1.02] md:-translate-y-2'
                    : 'glass-card border border-white/10 hover:border-cyan-500/30'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-lg">
                    {tier.badge}
                  </div>
                )}

                <div>
                  <h3 className="font-display font-bold text-xl text-white">{tier.name}</h3>
                  <p className="mt-2 text-xs text-gray-400 leading-relaxed min-h-[36px]">
                    {tier.description}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1 font-mono">
                    <span className="text-4xl font-extrabold text-white">${price}</span>
                    <span className="text-xs text-gray-400">/ seat / month</span>
                  </div>

                  {annualBilling && tier.priceMonthly > 0 && (
                    <div className="mt-1 text-[11px] font-mono text-cyan-300">
                      Billed annually (${price * 12}/yr)
                    </div>
                  )}

                  {/* Features list */}
                  <div className="mt-8 pt-6 border-t border-white/10 space-y-3 font-mono text-xs">
                    {tier.features.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5 text-gray-300">
                        <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    onClick={() => onSelectTier(tier.id)}
                    className={`w-full py-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      tier.highlighted
                        ? 'bg-gradient-to-r from-cyan-400 via-cyan-300 to-emerald-300 text-black shadow-[0_0_20px_rgba(0,217,255,0.4)] hover:shadow-[0_0_30px_rgba(0,217,255,0.7)] hover:scale-[1.02]'
                        : 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
                    }`}
                  >
                    <span>{tier.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
