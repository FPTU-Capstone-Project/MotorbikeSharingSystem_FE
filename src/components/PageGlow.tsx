import React from 'react';
import { cn } from '../utils/cn';

type GlowVariant = 'analytics' | 'vehicles' | 'users';

type GlowShape = {
  className: string;
  style: React.CSSProperties;
};

const glowShapes: Record<GlowVariant, GlowShape[]> = {
  analytics: [
    {
      className: 'bg-fuchsia-400/40',
      style: { width: '420px', height: '420px', top: '-12%', right: '-10%' },
    },
    {
      className: 'bg-sky-400/35',
      style: { width: '360px', height: '360px', top: '30%', left: '-8%' },
    },
    {
      className: 'bg-indigo-500/40',
      style: { width: '520px', height: '520px', bottom: '-18%', right: '15%' },
    },
  ],
  vehicles: [
    {
      className: 'bg-rose-400/35',
      style: { width: '360px', height: '360px', top: '-8%', left: '10%' },
    },
    {
      className: 'bg-emerald-400/30',
      style: { width: '420px', height: '420px', top: '25%', right: '-12%' },
    },
    {
      className: 'bg-purple-500/35',
      style: { width: '500px', height: '500px', bottom: '-22%', left: '5%' },
    },
  ],
  users: [
    {
      className: 'bg-pink-400/40',
      style: { width: '420px', height: '420px', top: '-10%', left: '-5%' },
    },
    {
      className: 'bg-sky-500/35',
      style: { width: '480px', height: '480px', top: '25%', right: '-15%' },
    },
    {
      className: 'bg-purple-500/35',
      style: { width: '560px', height: '560px', bottom: '-20%', left: '20%' },
    },
  ],
};

interface PageGlowProps {
  variant?: GlowVariant;
  className?: string;
}

export default function PageGlow({ variant = 'analytics', className }: PageGlowProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}
    >
      {glowShapes[variant].map((shape, index) => (
        <div
          key={`${variant}-${index}`}
          className={cn(
            'absolute rounded-full blur-[120px] md:blur-[160px] opacity-60 md:opacity-70 mix-blend-screen animate-mesh',
            shape.className
          )}
          style={shape.style}
        />
      ))}
    </div>
  );
}

