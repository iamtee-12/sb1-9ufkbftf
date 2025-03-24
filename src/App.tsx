import React from 'react';
import { Heart, PawPrint as Paw, Camera, MessageSquareText, Shield, Gift } from 'lucide-react';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import FAQ from './components/FAQ';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <Hero />
      <HowItWorks />
      <Features />
      <Testimonials />
      <CTA />
      <FAQ />
    </div>
  );
}

export default App;