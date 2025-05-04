import React from 'react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-green-800 text-white py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">NurseryMap</h3>
            <p className="text-sm text-gray-300">Manage your nursery with precision</p>
          </div>
          
          <div className="text-sm text-gray-300">
            &copy; {year} NurseryMap. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;