'use client';

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black min-h-screen flex items-end justify-center pb-16">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="text-center">
          <h1 className="text-[10rem] md:text-[16rem] font-black text-white uppercase leading-none mb-8">
            <span className="italic">TOXIC</span>54<sup className="text-8xl md:text-12xl -mt-6 md:-mt-10 text-green-500">+</sup>
          </h1>
          
          <div className="w-full h-px bg-gray-600"></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
