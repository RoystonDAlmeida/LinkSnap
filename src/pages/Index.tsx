import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import LinkSnapLoader from "@/components/LinkSnapLoader";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

const Index = () => {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  if (!authChecked) {
    // Loading spinner during initial auth check
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