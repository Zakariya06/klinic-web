import React, { useRef, useState } from "react";
import { cn } from "@/utils/utils";
import { FaArrowUp } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

import { FaBrain, FaHeartPulse } from "react-icons/fa6";
import { MdRestaurant } from "react-icons/md";
import { GiBrain } from "react-icons/gi";
import { GoArrowRight } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { AiChat } from "@/components/AiChat";

const LandingPage = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [showChat, setShowChat] = useState(false);
  const [question, setQuestion] = useState("");

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  const redirectToLogin = () => {
    navigate("/login");
  };

  const redirectToRegister = () => {
    navigate("/register");
  };

  const buttonClassNames =
    "text-black py-0.5 px-1 text-base font-regular border-b-2 border-transparent hover:border-[#00B0AB] hover:text-[#00B0AB] transition-all duration-300 cursor-pointer";

  const specialties = [
    {
      name: "Mental Health",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      icon: FaBrain,
      description:
        "Support your emotional well-being with compassionate Mental Health care at Health Clinics Services. Our experienced professionals provide personalized therapy, counseling, and treatment plans to help you achieve balance and peace of mind.",
    },
    {
      name: "Cardiology",
      image: "https://randomuser.me/api/portraits/men/41.jpg",
      icon: FaHeartPulse,
      description:
        "Protect your heart with advanced Cardiology care at Health Clinics Services. Our expert cardiologists offer precise diagnosis, preventive care, and personalized treatment plans to keep your heart strong and healthy.",
    },
    {
      name: "Gastroenterology",
      image: "https://randomuser.me/api/portraits/women/65.jpg",
      icon: MdRestaurant,
      description:
        "Restore digestive balance with expert Gastroenterology services at Health Clinics Services. From routine checkups to advanced treatments, our specialists provide tailored care for optimal digestive health.",
    },
    {
      name: "Neurology",
      image: "https://randomuser.me/api/portraits/men/12.jpg",
      icon: GiBrain,
      description:
        "Experience specialized Neurology care at Health Clinics Services. Our skilled neurologists deliver advanced diagnostics and personalized treatments for brain, spine, and nervous system conditions.",
    },
  ];

  if (showChat) {
    return (
      <AiChat
        initialMessage={question}
        onExit={() => {
          setShowChat(false);
          setQuestion("");
        }}
      />
    );
  }

  return (
    <div ref={pageRef}>
      <div className="min-h-screen bg-white">
        {/* Navbar with curved bottom and gradient blend */}
        <nav
          data-aos="fade-in"
          data-aos-duration="1000"
          className="fixed left-1/2 -translate-x-1/2 container mx-auto top-2 z-50 px-2"
        >
          <div className="flex items-center justify-between px-5 py-3 bg-white shadow-[0px_0px_5px_0px_#00000040] rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="lg:text-4xl text-3xl font-bold text-[#00B0AB] font-poppins">
                  Klinic +
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={scrollToBottom}
                className={cn(
                  buttonClassNames,
                  "  text-[#00B0AB]  border-[#00B0AB] lg:block hidden",
                )}
              >
                Get Started
              </button>
              <button
                onClick={scrollToBottom}
                className={cn(buttonClassNames, "lg:block hidden")}
              >
                About
              </button>
              <button onClick={redirectToLogin} className={buttonClassNames}>
                Login
              </button>
              <button onClick={redirectToRegister} className={buttonClassNames}>
                Register
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section with Gradient - seamless blend */}
        <div
          className="lg:py-56 py-34 relative overflow-hidden flex items-center justify-center px-4"
          style={{
            background: `linear-gradient(128.11deg, #00B0AB -50.3%, rgba(0, 176, 171, 0) 45.47%)`,
          }}
        >
          {/* Floating healthcare icons background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute bottom-40 left-1/4 text-white/10 text-5xl">
              🩺
            </div>
            <div className="absolute top-60 left-1/2 text-white/20 text-3xl">
              ❤️
            </div>
            <div className="absolute bottom-60 right-1/3 text-white/10 text-4xl">
              💊
            </div>
            <div className="absolute top-80 left-1/3 text-white/10 text-5xl">
              🧬
            </div>
          </div>

          {/* Hero Content */}
          <div className="text-center w-full relative z-20">
            <h1
              className="text-3xl md:text-4xl font-semibold text-black tracking-wider font-poppins flex items-center gap-1 flex-wrap justify-center"
              data-aos="fade-up"
              data-aos-duration="1000"
            >
              ASK AI DOCTOR{" "}
              <HiSparkles className="text-[#00B0AB] lg:text-5xl text-4xl" />
            </h1>
            <p
              className="text-xl md:text-2xl text-black/90 mb-12 font-normal mt-2 max-w-xl mx-auto "
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay="200"
            >
              Get instant medical advice from our AI-powered healthcare
              assistant
            </p>

            {/* Search Container - Centered */}
            <div className="max-w-3xl w-full mx-auto">
              <div
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-delay="500"
                className="bg-white rounded-2xl border border-[#00B0AB] p-3 shadow-2xl w-full flex items-start justify-between gap-2"
              >
                <textarea
                  rows={3}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type patient details..."
                  className="flex-1 outline-none resize-none"
                />
                <button
                  onClick={() => {
                    if (!question.trim()) return alert("Please Add a message");
                    setShowChat(true);
                  }}
                  className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center"
                >
                  <FaArrowUp />
                </button>
              </div>
            </div>
          </div>

          {/* Multiple K watermarks */}
          <div className="absolute bottom-5 right-5 text-black/5 -rotate-12 text-9xl font-bold pointer-events-none">
            Klinic
          </div>
          <div className="absolute top-10 left-5 text-black/10 text-6xl font-bold pointer-events-none">
            K
          </div>
        </div>

        {/* Doctor Consultation Section */}
        <div className="lg:py-24 py-16 relative overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center">
              <h2
                className="text-3xl md:text-4xl font-semibold text-black tracking-wider font-poppins flex items-center gap-1 flex-wrap justify-center"
                data-aos="fade-up"
                data-aos-duration="1000"
              >
                Online Dr Consultation
              </h2>

              <p
                className="text-xl md:text-2xl text-black/90 mb-12 font-normal mt-1 max-w-2xl mx-auto "
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-delay="200"
              >
                Connect with specialized doctors from the comfort of your home
              </p>
            </div>

            {/* Enhanced Specialists Grid */}
            <div
              className="grid sm:grid-cols-2 grid-cols-1 md:grid-cols-4 sm:gap-4  gap-20 mt-20 mb-5"
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay={`200`}
            >
              {specialties.map((specialty, index) => {
                const Icon = specialty.icon;

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center bg-white shadow-[0px_0px_10px_0px_#00000026] rounded-xl p-4 group cursor-pointer duration-300  hover:shadow-sm transition-all"
                  >
                    <div className="relative -mt-22 mb-5">
                      <img
                        src={specialty.image}
                        alt={specialty.name}
                        className="w-32 h-32 rounded-full object-cover"
                      />

                      <div className="absolute -bottom-3 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-blue-100">
                        <Icon className="text-xl text-blue-600" />
                      </div>
                    </div>

                    <h1 className="text-black font-medium font-poppins lg:text-lg text-base">
                      {specialty.name}
                    </h1>

                    <p className="mt-2 mb-5 text-[#494949] text-sm font-normal">
                      {specialty.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div
              className="text-center flex items-center justify-center"
              data-aos="fade-up"
              data-aos-duration="1000"
            >
              <button
                onClick={redirectToLogin}
                className="border border-[#00B0AB] rounded-full py-3 px-6 flex items-center justify-center gap-3 text-base font-medium bg-transparent text-[#00B0AB] hover:bg-[#00B0AB] hover:text-white duration-300 transition-all cursor-pointer"
              >
                More Specialists <GoArrowRight />
              </button>
            </div>
          </div>
        </div>

        {/* Lab Test Section */}
        <div className="lg:py-24 py-16 relative overflow-hidden bg-[#E8F6FF]">
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center">
              <h2
                className="text-3xl md:text-4xl font-semibold text-black tracking-wider font-poppins flex items-center gap-1 flex-wrap justify-center"
                data-aos="fade-up"
                data-aos-duration="1000"
              >
                Online Dr Consultation
              </h2>

              <p
                className="text-xl md:text-2xl text-black/90 mb-12 font-normal mt-1 max-w-2xl mx-auto "
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-delay="200"
              >
                Connect with specialized doctors from the comfort of your home
              </p>
            </div>

            {/* Enhanced Tests Grid */}
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-7"
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay="200"
            >
              {[
                {
                  name: "Blood Test",
                  icon: "🩸",
                  color: "from-red-400 to-red-600",
                },
                {
                  name: "ECG",
                  icon: "💓",
                  color: "from-green-400 to-green-600",
                },
                {
                  name: "Sugar Test",
                  icon: "🍭",
                  color: "from-yellow-400 to-orange-500",
                },
                {
                  name: "CBC",
                  icon: "🧬",
                  color: "from-purple-400 to-purple-600",
                },
              ].map((test, index) => (
                <button
                  key={index}
                  className="group bg-white hover:bg-blue-50 text-slate-700 p-8 rounded-3xl font-bold shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl transform relative overflow-hidden"
                  style={{
                    border: "3px solid rgba(59, 130, 246, 0.1)",
                  }}
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg bg-gradient-to-r ${test.color} transform group-hover:scale-110 transition-transform duration-300`}
                    >
                      <span className="text-white">{test.icon}</span>
                    </div>
                    <span className="text-lg font-bold text-blue-700 group-hover:text-blue-800">
                      {test.name}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/5 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              ))}
            </div>

            <div
              className="text-center relative flex items-center justify-center"
              data-aos="fade-up"
              data-aos-duration="1000"
            >
              <button
                onClick={redirectToLogin}
                className="border border-[#00B0AB] rounded-full py-3 px-6 flex items-center justify-center gap-3 text-base font-medium bg-white text-[#00B0AB] hover:bg-[#00B0AB] hover:text-white duration-300 transition-all cursor-pointer"
              >
                Book Now <GoArrowRight />
              </button>
            </div>
            {/* Enhanced Lab technician avatar */}
            <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-white rounded-full border border-blue-600 shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">👩‍🔬</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-slate-800 py-8">
          <div className="text-center">
            <p className="text-white/70 text-lg">
              © 2024 Klinic. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
