import React, { useState, useRef } from "react";
import Navbar from "../components/navbar";
import PlanCard from "../components/PlanCard";
import FeatureCarousel from "../components/FeatureCarousel";

function Windo_landing() {
  const faqs = [
    { question: "What is your refund policy?", answer: "We offer a 7-day refund policy." },
    { question: "How do I contact support?", answer: "Email us at support@itzthere.com." },
    { question: "Can I upgrade later?", answer: "Yes, you can upgrade at any time." }
  ];

  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (index) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  const plans = [
  {
    title: "PERSONAL",
    desc: "For individuals",
    price: "₹0",
    trial: true,
    features: [
      "1 user",
      "1 GB storage",
      "Basic document upload",
      "View-only access",
      "Email support"
    ]
  },
  {
    title: "BUSINESS",
    desc: "For small teams",
    price: "₹0",
    trial: true,
    features: [
      "Up to 15 users & 20 clients",
      "5 GB storage",
      "Unlimited signature requests",
      "PDF editing",
      "Set up admins",
      "Track shared content usage",
      "Role-based access control"
    ]
  },
  {
    title: "BUSINESS +",
    desc: "For large teams",
    price: "₹0",
    trial: true,
    features: [
      "Up to 25 users & 100 clients",
      "20 GB storage",
      "Unlimited signature requests",
      "PDF editing",
      "Set up multiple admins",
      "Track shared content",
      "Advanced folder permissions",
      "Audit logs & priority support",
      "Custom branding"
    ]
  }
];


  const featuresRef = useRef(null); // 🔁 Added reference for Features section

  return (
    <div className="font-roboto text-gray-800">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="flex flex-col mt-32 py-24 justify-center items-center text-center bg-white bg-[url('/bg.png')] bg-cover bg-center">
        <h2 className="text-6xl font-bebas leading-snug tracking-wider text-black">
          A BETTER WAY TO <br />
          <span className="text-[#2c787c]">ORGANIZE, CENTRALIZE</span> <br />
          AND <span className="text-[#2c787c]">SHARE DATA</span>
        </h2>
        <button
          onClick={() => featuresRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="mt-2 px-6 py-2 bg-teal-400 text-white rounded-full hover:bg-teal-500 transition"
        >
          Explore Features
        </button>
      </section>

      {/* Tagline + Illustration */}
      <section id="about" className="flex flex-col px-12 items-center md:flex-row justify-around">
        <p className="text-4xl w-1/2 text-center md:text-left">
          A transformative experience just for you and your business
        </p>
        <img src="img3.png" alt="Illustration" className="object-cover w-50 h-50" />
      </section>

      {/* Features */}
      <section ref={featuresRef} className="flex justify-center px-8 py-5 bg-white">
        <FeatureCarousel />
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gray-100 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold font-bebas mb-10">Choose Your Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <PlanCard key={plan.title} {...plan} />
            ))}
          </div>
          <div className="w-full h-2 mt-16 bg-fuchsia-800/50 mx-auto rounded"></div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-8 md:px-32 py-12 bg-gray-50">
        <h1 className="font-bebas text-6xl mb-10">FAQ</h1>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-300 rounded-xl bg-white shadow">
              <button
                className="w-full text-left px-6 py-4 font-semibold flex justify-between items-center"
                onClick={() => toggle(index)}
              >
                {faq.question}
                <span>{openIndex === index ? "−" : "+"}</span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-700">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Windo_landing;
