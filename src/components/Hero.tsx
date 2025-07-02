
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Zap, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="py-20 px-4 text-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
            Shorten URLs with
            <br />
            Lightning Speed
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform your long URLs into powerful, trackable short links. 
            Boost your click-through rates and gain valuable insights.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 max-w-2xl mx-auto border">
          <div className="flex flex-col md:flex-row gap-4">
            <Input 
              placeholder="Enter your long URL here..." 
              className="flex-1 h-14 text-lg border-2 border-gray-200 focus:border-purple-500"
            />
            <Button className="h-14 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg font-semibold">
              Shorten URL
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            No registration required for basic shortening
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
            <p className="text-gray-600">Generate short links in milliseconds</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Link2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Custom Links</h3>
            <p className="text-gray-600">Create branded, memorable URLs</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure & Reliable</h3>
            <p className="text-gray-600">Enterprise-grade security</p>
          </div>
        </div>

        <div className="mt-12">
          <Link to="/signup">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-4 h-auto">
              Start Shortening for Free
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
