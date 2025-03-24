import React from 'react';
import { Clock, Tag } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-playfair text-4xl font-bold mb-8">
            Limited Time Offer
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="flex items-center justify-center space-x-4">
              <Clock className="w-8 h-8" />
              <span className="text-xl">Free Rush Delivery</span>
            </div>
            <div className="flex items-center justify-center space-x-4">
              <Tag className="w-8 h-8" />
              <span className="text-xl">Free Engraved Pet Tag</span>
            </div>
          </div>
          
          <button className="bg-white text-purple-600 text-lg px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            Create Your Memorial Portrait Now
          </button>
          
          <p className="mt-6 text-sm opacity-90">
            *Limited time offer. While supplies last.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;