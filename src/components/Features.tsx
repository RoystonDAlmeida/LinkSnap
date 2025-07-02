
import { BarChart3, Globe, QrCode, MousePointer, Users, Lock } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track clicks, geographic data, and user behavior with detailed analytics dashboard."
    },
    {
      icon: Globe,
      title: "Global CDN",
      description: "Lightning-fast redirects powered by our global content delivery network."
    },
    {
      icon: QrCode,
      title: "QR Code Generation",
      description: "Automatically generate QR codes for your shortened URLs for offline sharing."
    },
    {
      icon: MousePointer,
      title: "Click Tracking",
      description: "Monitor every click with real-time data and comprehensive reporting."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share and manage links with your team members and set permissions."
    },
    {
      icon: Lock,
      title: "Password Protection",
      description: "Secure your links with password protection and expiration dates."
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage, track, and optimize your shortened URLs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-8 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
