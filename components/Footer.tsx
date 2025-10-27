'use client';

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black min-h-screen flex items-end justify-center pb-8 sm:pb-12 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center">
          <h1 className="text-[4rem] sm:text-[6rem] md:text-[10rem] lg:text-[12rem] xl:text-[16rem] font-black text-white uppercase leading-none mb-6 sm:mb-8">
            <span className="italic">TOXIC</span>54<sup className="text-4xl sm:text-5xl md:text-8xl lg:text-10xl xl:text-12xl -mt-2 sm:-mt-3 md:-mt-6 lg:-mt-8 xl:-mt-10 text-green-500">+</sup>
          </h1>
          
          <div className="w-full h-px bg-gray-600"></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
