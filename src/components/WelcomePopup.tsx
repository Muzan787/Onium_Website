import { useState, useEffect } from 'react';
import { X, Gift, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Requires: npm install framer-motion

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if user has already seen the popup
    const hasSeenPopup = sessionStorage.getItem('onium_welcome_seen');
    if (!hasSeenPopup) {
      // Show popup after 2 seconds delay
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('onium_welcome_seen', 'true');
  };

  const copyCode = () => {
    navigator.clipboard.writeText('WELCOME10');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 100 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Decorative Header */}
            <div className="bg-gradient-to-br from-primary-600 to-secondary-500 p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <button 
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
                <Gift className="w-8 h-8 text-white animate-bounce" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">First Time Here?</h2>
              <p className="text-primary-50 font-medium">Get 10% OFF your first order!</p>
            </div>

            {/* Content */}
            <div className="p-8 text-center">
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                Join the cleaning revolution. Use the code below at checkout to save on our premium eco-friendly products.
              </p>

              <div 
                onClick={copyCode}
                className="group relative bg-slate-50 border-2 border-dashed border-primary-200 rounded-xl p-4 cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-bold text-slate-900 tracking-widest font-mono">WELCOME10</span>
                  {copied ? (
                    <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded">COPIED!</span>
                  ) : (
                    <Copy className="w-5 h-5 text-slate-400 group-hover:text-primary-500" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wide font-bold">Tap to Copy</p>
              </div>

              <button 
                onClick={handleClose}
                className="mt-6 w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
              >
                Shop Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}