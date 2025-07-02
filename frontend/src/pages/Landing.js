import React from 'react';
import { motion } from 'framer-motion';
import { Music, BarChart3, Users, Zap, ArrowRight, Github, ExternalLink } from 'lucide-react';

const Landing = () => {
  const handleStartBarkada = () => {
    // Go directly to Barkada page - no login required
    window.location.href = '/barkada';
  };

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multi-Login Sessions",
      description: "Friends can join simultaneously via popup windows or session codes from any device"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Music Compatibility",
      description: "Discover how compatible your music tastes are with smart compatibility scoring"
    },
    {
      icon: <Music className="w-8 h-8" />,
      title: "Shared Playlists",
      description: "Generate collaborative playlists based on everyone's favorite tracks and artists"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-time Analysis",
      description: "Instant music analysis as friends join with beautiful visualizations"
    }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Main Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-6">
                <Music className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            {/* Title */}
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                SpotifyMirror
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Your Music, <span className="text-purple-400 font-semibold">Together</span>
            </p>
            
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Start a Barkada session with friends, discover your shared musical chemistry, 
              and create collaborative playlists together.
            </p>

            {/* CTA Button */}
            <motion.button
              onClick={handleStartBarkada}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            >
              <Users className="w-5 h-5" />
              Start Barkada Session
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <p className="text-sm text-gray-400 mt-4">
              No login required - start exploring collaborative music sessions!
            </p>
          </motion.div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 text-sm text-gray-400"
          >
            <span className="px-3 py-1 bg-gray-800/50 rounded-full">ReactJS</span>
            <span className="px-3 py-1 bg-gray-800/50 rounded-full">Node.js</span>
            <span className="px-3 py-1 bg-gray-800/50 rounded-full">Spotify Web API</span>
            <span className="px-3 py-1 bg-gray-800/50 rounded-full">TailwindCSS</span>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Barkada <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Bring friends together through music with collaborative sessions and shared playlists
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className="glass rounded-2xl p-8 h-full transition-all duration-300 group-hover:bg-white/5">
                  <div className="text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How It <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Works</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connect",
                description: "Link your Spotify account to start or join a Barkada session"
              },
              {
                step: "02",
                title: "Invite Friends",
                description: "Add friends via popup login or share session codes for remote joining"
              },
              {
                step: "03",
                title: "Discover Together",
                description: "Analyze your group's music compatibility and create collaborative playlists"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xl mb-6">
                  {step.step}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass rounded-3xl p-8 md:p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Your Privacy <span className="text-green-400">Matters</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              We only access your Spotify listening data to provide analytics. 
              Your data is never stored permanently or shared with third parties.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Secure OAuth 2.0
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                No Data Storage
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Open Source
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-purple-400" />
            <span className="text-xl font-bold text-white">SpotifyMirror</span>
          </div>
          
          <div className="flex items-center gap-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
              GitHub
            </a>
            <a
              href="https://developer.spotify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              Spotify API
            </a>
          </div>
          
          <p className="text-gray-400 text-sm">
            Built with ❤️ for music lovers
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;