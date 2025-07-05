import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import LinkSnapLoader from "@/components/LinkSnapLoader";

const Index = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000); // Simulate loading
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LinkSnapLoader message="Loading Landing Page..." />;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
};

export default Index;