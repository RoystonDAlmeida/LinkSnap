// Footer component

const Footer = () => {
    return (
      <footer className="bg-gray-900 text-white py-4">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-4">
          <div className="flex justify-center items-center w-full sm:w-auto">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
              <img src="/linksnap_icon.svg" alt="LinkSnap Icon" className="w-8 h-8" />
              LinkSnap
            </div>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto mt-2">
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