'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useIsMobile } from '@/app/hooks/use-mobile';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Counter states
  const [exposedCount, setExposedCount] = useState(0);
  const [kidneyDamageCount, setKidneyDamageCount] = useState(0);
  const [neurologicalCount, setNeurologicalCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  const scrollToStep = (step: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = isMobile ? 320 + 16 : 384 + 32; // Mobile: w-80 + gap-4, Desktop: w-96 + gap-8
      const translateX = -step * cardWidth;
      scrollContainerRef.current.style.transform = `translateX(${translateX}px)`;
      setCurrentStep(step);
    }
  };

  const scrollLeft = () => {
    if (currentStep > 0) {
      scrollToStep(currentStep - 1);
    }
  };

  const scrollRight = () => {
    if (currentStep < 3) {
      scrollToStep(currentStep + 1);
    }
  };

  const toggleAccordion = (index: number) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  // Initialize transform on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.transform = 'translateX(0px)';
    }
  }, []);

  // Animate counters
  useEffect(() => {
    if (!hasAnimated) {
      const animateCounter = (
        targetValue: number, 
        setter: React.Dispatch<React.SetStateAction<number>>, 
        duration: number
      ) => {
        const startTime = Date.now();
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const currentValue = Math.floor(targetValue * progress);
          setter(currentValue);
          
          if (progress < 1) {
          requestAnimationFrame(animate);
          }
        };
        animate();
      };

      // Start animations
      animateCounter(100000, setExposedCount, 2000); // 100,000 people exposed
      animateCounter(35000, setKidneyDamageCount, 2500); // 35% of exposed
      animateCounter(25000, setNeurologicalCount, 2500); // 25% of exposed
      
      setHasAnimated(true);
    }
  }, [hasAnimated]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation - Only on Hero Section */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-xl'}`}>
              <span className="italic">TOXIC</span>54<span className="text-green-500">+</span>
            </div>

            <div className="flex items-center">
              <Link 
                href="/signup" 
                className={`bg-gray-200 text-black rounded-full font-medium hover:bg-gray-100 transition-colors ${
                  isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-2'
                }`}
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/herosectionimage.jpeg)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className={`font-bold uppercase leading-tight mb-4 tracking-tight ${
            isMobile ? 'text-2xl sm:text-3xl' : 'text-4xl md:text-5xl'
          }`} style={{ WebkitTextStroke: '2px rgba(34, 197, 94, 0.3)', color: 'white' }}>
            <span className="block">AI-Powered Health &amp; Environmental Monitoring</span>
          </h2>
          
          <p className={`mb-8 max-w-2xl mx-auto text-white ${
            isMobile ? 'text-base' : 'text-lg'
          }`} style={{ WebkitTextStroke: '1px black' }}>
            Detecting Mercury and Chemical Poisoning Through AI, Community Data, and Environmental Sensing
          </p>
          
          <Link 
            href="/login" 
            className={`inline-block bg-black text-white border-2 border-white rounded-full font-medium hover:bg-green-500 hover:text-black transition-all duration-300 shadow-lg relative overflow-hidden group ${
              isMobile ? 'px-6 py-3 text-base' : 'px-8 py-4 text-lg'
            }`}
          >
            <span className="relative z-10">Login</span>
            <div className="absolute inset-0 bg-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className={`bg-black ${isMobile ? 'py-8' : 'py-12'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
            {/* Text Content Card - Left Side */}
            <div className={`bg-white rounded-2xl shadow-lg ${isMobile ? 'p-4' : 'p-6'}`}>
              <div className={`space-y-6 ${isMobile ? 'space-y-4' : ''}`}>
                <h2 className={`font-bold uppercase text-black leading-tight ${
                  isMobile ? 'text-2xl' : 'text-3xl'
                }`}>
                  Background <br />and Problem Statement
                </h2>
                
                <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
                  Mercury and chemical poisoning are major public health concerns in Ghana. The World Health Organization (WHO) estimates that over 100,000 people in Ghana are exposed to mercury and other heavy metals through contaminated air, water, and soil. This exposure can lead to a range of health problems, including kidney damage, neurological damage, and cancer.
                </p>
                
                <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
                  TOXIC54+ addresses this crisis through early detection that saves lives, community-driven monitoring that empowers citizens, AI-powered diagnosis for accurate identification, and real-time risk alerts that enable swift intervention and support.
                </p>
                
                <div className={`space-y-4 ${isMobile ? 'space-y-3' : ''}`}>
                  <div className="flex items-center space-x-3">
                    <span className={`font-bold text-green-500 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                      {exposedCount.toLocaleString()}+
                    </span>
                    <span className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      People exposed to mercury & chemicals
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`font-bold text-green-500 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                      {kidneyDamageCount.toLocaleString()}+
                    </span>
                    <span className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Suffering from kidney damage
                    </span>
                </div>
                
                  <div className="flex items-center space-x-3">
                    <span className={`font-bold text-green-500 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                      {neurologicalCount.toLocaleString()}+
                    </span>
                    <span className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      With neurological damage
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Image Card - Right Side */}
            <div className={`relative rounded-2xl overflow-hidden shadow-lg ${isMobile ? 'h-64' : 'h-full'}`}>
              <img 
                src="http://www.effective-states.org/wp-content/uploads/2017/05/galamsey-ghana-illegal-mining-effective-states-abdulai-manchester2.jpg" 
                alt="Galamsey mining operation in Ghana" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Accordion Section */}
      <section className={`bg-black ${isMobile ? 'py-12' : 'py-20'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className={`font-bold text-white text-center ${
            isMobile ? 'text-2xl mb-8' : 'text-4xl md:text-5xl mb-16'
          }`}>
            What Makes Our Solution <span className="text-green-500">Unique</span>
          </h2>
          
          <div className="space-y-4">
            {/* Accordion Item 1 - AI-Powered Detection */}
            <div className="border-b border-gray-800">
              <button
                onClick={() => toggleAccordion(0)}
                className={`w-full flex items-center justify-between text-left hover:bg-gray-900/50 transition-all duration-300 relative overflow-hidden group ${
                  isMobile ? 'py-4' : 'py-6'
                }`}
              >
                <div className={`flex items-center relative z-10 ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
                  <span className={`font-bold text-white ${isMobile ? 'text-4xl' : 'text-6xl'}`}>01</span>
                  <span className={`font-bold text-white uppercase ${isMobile ? 'text-sm' : 'text-xl'}`}>AI-Powered Detection</span>
                </div>
                <div className={`transform transition-transform duration-200 relative z-10 ${activeAccordion === 0 ? 'rotate-180' : ''}`}>
                  <svg className={`text-white ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </div>
                <div className="absolute inset-0 bg-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </button>
              {activeAccordion === 0 && (
                <div className={`pb-6 ${isMobile ? 'pl-12' : 'pl-20'}`}>
                  <p className={`text-gray-300 leading-relaxed ${isMobile ? 'text-base' : 'text-lg'}`}>
                    Our system uses advanced AI models to detect mercury and chemical poisoning in humans, plants, and the environment. 
                    By analyzing symptoms, images, and sensor data, it identifies early warning signs before severe damage occurs.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion Item 2 - Community-Driven Reporting */}
            <div className="border-b border-gray-800">
              <button
                onClick={() => toggleAccordion(1)}
                className={`w-full flex items-center justify-between text-left hover:bg-gray-900/50 transition-all duration-300 relative overflow-hidden group ${
                  isMobile ? 'py-4' : 'py-6'
                }`}
              >
                <div className={`flex items-center relative z-10 ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
                  <span className={`font-bold text-white ${isMobile ? 'text-4xl' : 'text-6xl'}`}>02</span>
                  <span className={`font-bold text-white uppercase ${isMobile ? 'text-sm' : 'text-xl'}`}>Community-Driven Reporting</span>
                </div>
                <div className={`transform transition-transform duration-200 relative z-10 ${activeAccordion === 1 ? 'rotate-180' : ''}`}>
                  <svg className={`text-white ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </div>
                <div className="absolute inset-0 bg-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </button>
              {activeAccordion === 1 && (
                <div className={`pb-6 ${isMobile ? 'pl-12' : 'pl-20'}`}>
                  <p className={`text-gray-300 leading-relaxed ${isMobile ? 'text-base' : 'text-lg'}`}>
                    Citizens can report suspected contamination or health symptoms directly through the platform—using text, 
                    voice (in local dialects), or images—turning communities into active participants in environmental monitoring.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion Item 3 - Real-Time Risk Mapping */}
            <div className="border-b border-gray-800">
              <button
                onClick={() => toggleAccordion(2)}
                className={`w-full flex items-center justify-between text-left hover:bg-gray-900/50 transition-all duration-300 relative overflow-hidden group ${
                  isMobile ? 'py-4' : 'py-6'
                }`}
              >
                <div className={`flex items-center relative z-10 ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
                  <span className={`font-bold text-white ${isMobile ? 'text-4xl' : 'text-6xl'}`}>03</span>
                  <span className={`font-bold text-white uppercase ${isMobile ? 'text-sm' : 'text-xl'}`}>Real-Time Risk Mapping</span>
                </div>
                <div className={`transform transition-transform duration-200 relative z-10 ${activeAccordion === 2 ? 'rotate-180' : ''}`}>
                  <svg className={`text-white ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </div>
                <div className="absolute inset-0 bg-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </button>
              {activeAccordion === 2 && (
                <div className={`pb-6 ${isMobile ? 'pl-12' : 'pl-20'}`}>
                  <p className={`text-gray-300 leading-relaxed ${isMobile ? 'text-base' : 'text-lg'}`}>
                    An interactive map visualizes pollution hotspots across Ghana using live data from user reports and sensors. 
                    This helps the public, health workers, and environmental agencies respond faster to emerging threats.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion Item 4 - Smart Alerts, Connections & Consultations */}
            <div className="border-b border-gray-800">
              <button
                onClick={() => toggleAccordion(3)}
                className={`w-full flex items-center justify-between text-left hover:bg-gray-900/50 transition-all duration-300 relative overflow-hidden group ${
                  isMobile ? 'py-4' : 'py-6'
                }`}
              >
                <div className={`flex items-center relative z-10 ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
                  <span className={`font-bold text-white ${isMobile ? 'text-4xl' : 'text-6xl'}`}>04</span>
                  <span className={`font-bold text-white uppercase ${isMobile ? 'text-sm' : 'text-xl'}`}>Smart Alerts & Consultations</span>
                </div>
                <div className={`transform transition-transform duration-200 relative z-10 ${activeAccordion === 3 ? 'rotate-180' : ''}`}>
                  <svg className={`text-white ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </div>
                <div className="absolute inset-0 bg-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </button>
              {activeAccordion === 3 && (
                <div className={`pb-6 ${isMobile ? 'pl-12' : 'pl-20'}`}>
                  <p className={`text-gray-300 leading-relaxed ${isMobile ? 'text-base' : 'text-lg'}`}>
                    When a risk is detected, users are automatically connected to nearby health centers or environmental officers 
                    for quick support. Real-time GPS integration ensures help reaches those in need efficiently, while in-app 
                    consultation options allow users to receive medical guidance or environmental advice instantly.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className={`bg-black ${isMobile ? 'py-12' : 'py-20'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className={`font-bold uppercase text-center text-white ${
            isMobile ? 'text-3xl mb-8' : 'text-6xl md:text-7xl mb-16'
          }`}>
            <span className="text-white">How It</span><br />
            <span className="text-yellow-400">Works</span>
          </h2>
          
          {/* Step Navigation */}
          <div className={`flex items-center justify-center relative ${isMobile ? 'mb-8' : 'mb-16'}`}>
            <div className={`flex items-center bg-white/10 backdrop-blur-sm rounded-full border border-white/20 ${
              isMobile ? 'space-x-2 px-4 py-2' : 'space-x-8 px-8 py-4'
            }`}>
              <button 
                onClick={() => scrollToStep(0)}
                className={`flex items-center transition-all ${currentStep === 0 ? 'opacity-100' : 'opacity-70 hover:opacity-100'} ${
                  isMobile ? 'space-x-1' : 'space-x-2'
                }`}
              >
                <div className={`rounded-full flex items-center justify-center transition-all ${
                  currentStep === 0 ? 'bg-white' : 'bg-transparent border-2 border-white/30'
                } ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`}>
                  <span className={`font-bold ${currentStep === 0 ? 'text-black' : 'text-white'} ${
                    isMobile ? 'text-xs' : 'text-sm'
                  }`}>01</span>
                </div>
                {!isMobile && (
                  <span className={`font-medium ${currentStep === 0 ? 'text-white' : 'text-white/70'}`}>AI Chat Bot</span>
                )}
              </button>
              <button 
                onClick={() => scrollToStep(1)}
                className={`flex items-center transition-all ${currentStep === 1 ? 'opacity-100' : 'opacity-70 hover:opacity-100'} ${
                  isMobile ? 'space-x-1' : 'space-x-2'
                }`}
              >
                <div className={`rounded-full flex items-center justify-center transition-all ${
                  currentStep === 1 ? 'bg-white' : 'bg-transparent border-2 border-white/30'
                } ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`}>
                  <span className={`font-bold ${currentStep === 1 ? 'text-black' : 'text-white'} ${
                    isMobile ? 'text-xs' : 'text-sm'
                  }`}>02</span>
                </div>
                {!isMobile && (
                  <span className={`font-medium ${currentStep === 1 ? 'text-white' : 'text-white/70'}`}>Upload Evidence</span>
                )}
              </button>
              <button 
                onClick={() => scrollToStep(2)}
                className={`flex items-center transition-all ${currentStep === 2 ? 'opacity-100' : 'opacity-70 hover:opacity-100'} ${
                  isMobile ? 'space-x-1' : 'space-x-2'
                }`}
              >
                <div className={`rounded-full flex items-center justify-center transition-all ${
                  currentStep === 2 ? 'bg-white' : 'bg-transparent border-2 border-white/30'
                } ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`}>
                  <span className={`font-bold ${currentStep === 2 ? 'text-black' : 'text-white'} ${
                    isMobile ? 'text-xs' : 'text-sm'
                  }`}>03</span>
                </div>
                {!isMobile && (
                  <span className={`font-medium ${currentStep === 2 ? 'text-white' : 'text-white/70'}`}>Live Monitoring</span>
                )}
              </button>
              <button 
                onClick={() => scrollToStep(3)}
                className={`flex items-center transition-all ${currentStep === 3 ? 'opacity-100' : 'opacity-70 hover:opacity-100'} ${
                  isMobile ? 'space-x-1' : 'space-x-2'
                }`}
              >
                <div className={`rounded-full flex items-center justify-center transition-all ${
                  currentStep === 3 ? 'bg-white' : 'bg-transparent border-2 border-white/30'
                } ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`}>
                  <span className={`font-bold ${currentStep === 3 ? 'text-black' : 'text-white'} ${
                    isMobile ? 'text-xs' : 'text-sm'
                  }`}>04</span>
                </div>
                {!isMobile && (
                  <span className={`font-medium ${currentStep === 3 ? 'text-white' : 'text-white/70'}`}>Water Testing</span>
                )}
              </button>
            </div>
            
            {/* Navigation Arrows */}
            {!isMobile && (
            <div className="absolute right-0 flex space-x-2">
              <button 
                onClick={scrollLeft}
                disabled={currentStep === 0}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  currentStep === 0 
                    ? 'bg-white/10 cursor-not-allowed opacity-50' 
                    : 'bg-white/20 hover:bg-white/30 cursor-pointer'
                }`}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={scrollRight}
                disabled={currentStep === 3}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  currentStep === 3 
                    ? 'bg-white/10 cursor-not-allowed opacity-50' 
                    : 'bg-white/20 hover:bg-white/30 cursor-pointer'
                }`}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            )}
          </div>

          {/* Horizontal Scrollable Cards */}
          <div className="overflow-hidden pb-4">
            <div ref={scrollContainerRef} className={`flex transition-transform duration-300 ease-in-out ${
              isMobile ? 'space-x-4' : 'space-x-8'
            }`}>
              {/* Card 1 - Chat Bot */}
              <div className={`bg-yellow-400 rounded-3xl flex-shrink-0 ${
                isMobile ? 'p-4 w-80' : 'p-8 w-96'
              }`}>
                <div className={`flex ${isMobile ? 'flex-col' : ''}`}>
                  <div className={`flex-1 ${isMobile ? 'pr-0 mb-4' : 'pr-6'}`}>
                    <p className={`font-mono uppercase text-black/60 mb-4 ${isMobile ? 'text-xs' : 'text-sm'}`}>01 AI Chat Bot</p>
                    <h3 className={`font-bold uppercase text-black leading-tight ${
                      isMobile ? 'text-lg' : 'text-2xl'
                    }`}>
                      Interactive Assistance<br />
                      with Text and Voice<br />
                      Support
                    </h3>
                    <p className={`text-black/70 mt-3 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Get instant help with text or voice queries in your local dialect
                    </p>
                  </div>
                  <div className={`bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center ${
                    isMobile ? 'w-full h-32' : 'w-48 h-48'
                  }`}>
                    <svg className={`${isMobile ? 'w-20 h-20' : 'w-28 h-28'} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Card 2 - Picture Upload & Live Camera */}
              <div className={`bg-purple-400 rounded-3xl flex-shrink-0 ${
                isMobile ? 'p-4 w-80' : 'p-8 w-96'
              }`}>
                <div className={`flex ${isMobile ? 'flex-col' : ''}`}>
                  <div className={`flex-1 ${isMobile ? 'pr-0 mb-4' : 'pr-6'}`}>
                    <p className={`font-mono uppercase text-black/60 mb-4 ${isMobile ? 'text-xs' : 'text-sm'}`}>02 Upload Evidence</p>
                    <h3 className={`font-bold uppercase text-black leading-tight ${
                      isMobile ? 'text-lg' : 'text-2xl'
                    }`}>
                      Picture Upload<br />
                      or Live Camera<br />
                      Capture
                    </h3>
                    <p className={`text-black/70 mt-3 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Upload photos or use your camera to capture contamination evidence
                    </p>
                  </div>
                  <div className={`bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center ${
                    isMobile ? 'w-full h-32' : 'w-48 h-48'
                  }`}>
                    <svg className={`${isMobile ? 'w-20 h-20' : 'w-28 h-28'} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12a3 3 0 106 0 3 3 0 00-6 0zm13 0a7 7 0 11-14 0 7 7 0 0114 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.5l1.5-3h-4.5l-1.5 3M19.5 7.5h-15m15 0v12a1.5 1.5 0 01-1.5 1.5h-12a1.5 1.5 0 01-1.5-1.5v-12m15 0H4.5" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Card 3 - Real-Time Mapping and Graphs */}
              <div className={`bg-green-400 rounded-3xl flex-shrink-0 ${
                isMobile ? 'p-4 w-80' : 'p-8 w-96'
              }`}>
                <div className={`flex ${isMobile ? 'flex-col' : ''}`}>
                  <div className={`flex-1 ${isMobile ? 'pr-0 mb-4' : 'pr-6'}`}>
                    <p className={`font-mono uppercase text-black/60 mb-4 ${isMobile ? 'text-xs' : 'text-sm'}`}>03 Live Monitoring</p>
                    <h3 className={`font-bold uppercase text-black leading-tight ${
                      isMobile ? 'text-lg' : 'text-2xl'
                    }`}>
                      Real-Time Mapping<br />
                      and Interactive<br />
                      Graphs
                    </h3>
                    <p className={`text-black/70 mt-3 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Visualize pollution hotspots with dynamic maps and data graphs
                    </p>
                  </div>
                  <div className={`bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center ${
                    isMobile ? 'w-full h-32' : 'w-48 h-48'
                  }`}>
                    <svg className={`${isMobile ? 'w-20 h-20' : 'w-28 h-28'} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Card 4 - Water Tests Integration */}
              <div className={`bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl flex-shrink-0 ${
                isMobile ? 'p-4 w-80' : 'p-8 w-96'
              }`}>
                <div className={`flex ${isMobile ? 'flex-col' : ''}`}>
                  <div className={`flex-1 ${isMobile ? 'pr-0 mb-4' : 'pr-6'}`}>
                    <p className={`font-mono uppercase text-white/90 mb-4 ${isMobile ? 'text-xs' : 'text-sm'}`}>04 Water Testing</p>
                    <h3 className={`font-bold uppercase text-white leading-tight ${
                      isMobile ? 'text-lg' : 'text-2xl'
                    }`}>
                      Upcoming Water<br />
                      Quality Tests<br />
                      Integration
                    </h3>
                    <p className={`text-white/80 mt-3 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Automated water quality monitoring to track contamination levels
                    </p>
                  </div>
                  <div className={`bg-white/30 rounded-2xl flex items-center justify-center backdrop-blur-sm ${
                    isMobile ? 'w-full h-32' : 'w-48 h-48'
                  }`}>
                    <svg className={`${isMobile ? 'w-20 h-20' : 'w-28 h-28'} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;