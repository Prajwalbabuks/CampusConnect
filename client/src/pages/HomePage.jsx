import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import DepartmentStrip from '../components/DepartmentStrip';
import FeaturedEvents from '../components/FeaturedEvents';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#161513] text-white selection:bg-[#F2A900] selection:text-[#171715]">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <DepartmentStrip />
        <FeaturedEvents />
      </main>
      <Footer />
    </div>
  );
}
