import React from 'react';
import { Upload, Wand2, Package } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: "Upload Your Photo",
    description: "Share your favorite picture of your beloved companion"
  },
  {
    icon: Wand2,
    title: "AI Magic",
    description: "Watch as we transform your photo into an animated masterpiece"
  },
  {
    icon: Package,
    title: "Receive & Remember",
    description: "Get your personalized memorial with QR-linked memories"
  }
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="font-playfair text-4xl text-center font-bold text-gray-900 mb-16">
          How It Works
        </h2>
        
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                  <step.icon className="w-10 h-10 text-purple-600" />
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-purple-100 -translate-y-1/2 transform" />
                )}
              </div>
              <h3 className="text-xl font-bold mb-4">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;