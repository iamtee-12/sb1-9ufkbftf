import React from 'react';
import { Heart, MessageSquareText, Shield, Gift } from 'lucide-react';

const features = [
  {
    icon: Heart,
    title: "Voice Cloning Technology",
    description: "Preserve your pet's memory with AI-powered voice tributes that capture their unique personality"
  },
  {
    icon: MessageSquareText,
    title: "QR Video Tributes",
    description: "Access cherished memories instantly through scannable QR codes linked to your personalized memorial"
  },
  {
    icon: Shield,
    title: "100% Satisfaction Guarantee",
    description: "Love your memorial or we'll make it right. Your satisfaction is our priority"
  },
  {
    icon: Gift,
    title: "Shelter Support",
    description: "10% of every purchase goes directly to supporting local animal shelters"
  }
];

const Features = () => {
  return (
    <section className="py-20 bg-purple-50">
      <div className="container mx-auto px-6">
        <h2 className="font-playfair text-4xl text-center font-bold text-gray-900 mb-16">
          Features That Honor Their Memory
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;