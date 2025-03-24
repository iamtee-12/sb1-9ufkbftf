import React from 'react';

const faqs = [
  {
    question: "How long does the creation process take?",
    answer: "Most memorial portraits are completed within 3-5 business days. With rush delivery, you can receive your portrait in just 48 hours."
  },
  {
    question: "How does the voice tribute feature work?",
    answer: "Using advanced AI technology, we analyze videos or recordings of your pet to create a natural-sounding voice tribute that captures their unique personality."
  },
  {
    question: "What happens to my pet's data?",
    answer: "Your pet's photos and recordings are treated with the utmost respect and privacy. All data is encrypted and can be permanently deleted upon request."
  },
  {
    question: "Can I preview my portrait before finalizing?",
    answer: "Yes! You'll receive a digital proof of your portrait for approval before we create the final piece."
  },
  {
    question: "How do the QR codes work?",
    answer: "Each portrait includes a unique QR code that links to your pet's digital memorial page. Simply scan with any smartphone to access photos, videos, and voice tributes."
  }
];

const FAQ = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="font-playfair text-4xl text-center font-bold text-gray-900 mb-16">
          Frequently Asked Questions
        </h2>
        
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-8">
              <h3 className="text-xl font-bold mb-3">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;