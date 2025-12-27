const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-orange-600 to-orange-400 dark:from-gray-900 dark:to-gray-700 text-white py-2 shadow-inner transition-colors">
      <div className="flex flex-col items-center">
        <div className="flex items-center mb-2 space-x-2">
          <span className="font-semibold tracking-wide">Convo Chat App</span>
        </div>
        <p className="text-center text-sm opacity-80">
          © 2025 Convo Chat App. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
