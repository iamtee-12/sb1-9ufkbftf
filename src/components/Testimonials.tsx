import React from 'react';

const testimonials = [
  {
    name: "Sarah Mitchell",
    pet: "Max",
    image: "https://images.unsplash.com/photo-1517849845537-4d257902454a",
    quote: "The portrait captures Max's spirit perfectly. Having his 'voice' through the AI feature brings me comfort every day."
  },
  {
    name: "James Wilson",
    pet: "Luna",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba",
    quote: "The QR code feature lets our whole family share memories of Luna. It's more than just a portrait - it's a living memorial."
  },
  {
    name: "Emily Rodriguez",
    pet: "Bailey",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1",
    quote: "Knowing that part of our purchase helps other animals makes this memorial even more meaningful."
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="font-playfair text-4xl text-center font-bold text-gray-900 mb-16">
          Stories from Pet Parents
        </h2>
        
        <div className="grid md:grid-cols-3 gap-12">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="text-center">
              <div className="mb-6">
                <img
                  src={testimonial.image}
                  alt={`${testimonial.name}'s pet ${testimonial.pet}`}
                  className="w-24 h-24 rounded-full mx-auto object-cover"
                />
              </div>
              <blockquote className="text-gray-600 italic mb-4">
                "{testimonial.quote}"
              </blockquote>
              <p className="font-semibold">{testimonial.name}</p>
              <p className="text-purple-600">with {testimonial.pet}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;