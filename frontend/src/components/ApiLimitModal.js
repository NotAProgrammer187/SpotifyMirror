// src/components/ApiLimitModal.js
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Coffee, AlertTriangle, X } from 'lucide-react';

const ApiLimitModal = ({ isOpen, onClose }) => {
  const handleEmailClick = () => {
    window.open('mailto:ryancamado@gmail.com?subject=SpotifyMirror API Access Request&body=Hi! I would like to request access to SpotifyMirror. Thank you!', '_blank');
  };

  const handleDonateClick = () => {
    window.open('https://www.paypal.com/paypalme/xyen187', '_blank');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <h2 className="text-xl font-bold text-white">API Limit Reached</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4 mb-6">
            <p className="text-white/90 leading-relaxed">
              Thanks for trying SpotifyMirror! 🎵 
            </p>
            <p className="text-white/80 text-sm leading-relaxed">
              Due to Spotify's API limits, access is currently restricted. You can request access or support the project to help maintain the service.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Email Button */}
            <button
              onClick={handleEmailClick}
              className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-xl p-4 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-white font-semibold">Request Access</h3>
                  <p className="text-white/70 text-sm">ryancamado@gmail.com</p>
                </div>
              </div>
            </button>

            {/* Donate Button */}
            <button
              onClick={handleDonateClick}
              className="w-full bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-xl p-4 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Coffee className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-white font-semibold">Buy Me a Coffee</h3>
                  <p className="text-white/70 text-sm">Support the project ☕</p>
                </div>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-white/60 text-xs text-center">
              Your support helps keep SpotifyMirror running for everyone! 💜
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ApiLimitModal;