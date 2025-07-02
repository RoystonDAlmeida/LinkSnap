// Footer component

const Footer = () => {
    return (
      <footer className="bg-gray-900 text-white py-4">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-4">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
            LinkSnap
          </h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            The fastest and most reliable URL shortener.
          </p>
        </div>
      
        <div className="border-t border-gray-800 pt-4">
          <p className="text-gray-400">
            © 2025 LinkSnap. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
    )
};

export default Footer;