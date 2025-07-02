// src/hooks/useApiLimit.js
import { useState } from 'react';

export const useApiLimit = () => {
  const [showModal, setShowModal] = useState(false);

  const handleSpotifyLogin = () => {
    // Instead of calling the actual Spotify login, show the modal
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return {
    showModal,
    handleSpotifyLogin,
    closeModal
  };
};

// Alternative: You can also show it immediately when the app loads
export const useAutoShowModal = () => {
  const [showModal, setShowModal] = useState(true); // Show on load

  const closeModal = () => {
    setShowModal(false);
  };

  return {
    showModal,
    closeModal
  };
};