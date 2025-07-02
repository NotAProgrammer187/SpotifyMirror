# 🎵 SpotifyMirror - Barkada Playlist Generator

![SpotifyMirror](https://img.shields.io/badge/SpotifyMirror-Barkada%20Sessions-purple?style=for-the-badge&logo=spotify)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![Laravel](https://img.shields.io/badge/Laravel-10.x-FF2D20?style=for-the-badge&logo=laravel)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.0-38B2AC?style=for-the-badge&logo=tailwind-css)

> **Discover your group's musical chemistry together!** SpotifyMirror brings friends together through music with collaborative sessions, real-time compatibility analysis, and shared playlist generation.

## ✨ Features

### 🎯 **Multi-Login Barkada Sessions**
- **Simultaneous Login**: Friends can log in via popup windows at the same time
- **Session Codes**: Generate codes for friends to join from their own devices  
- **Real-time Analysis**: Instant music compatibility scoring as friends join
- **Collaborative Playlists**: Generate shared Spotify playlists based on group taste

### 📊 **Music Analytics**
- **Compatibility Scoring**: AI-powered analysis of group music chemistry
- **Shared Favorites**: Discover songs and artists you all love
- **Mood Analysis**: Audio feature analysis (valence, energy, danceability)
- **Genre Breakdown**: Visual representation of group music diversity

### 🎨 **Beautiful Design**
- **Glassmorphism UI**: Modern design with backdrop blur effects
- **Smooth Animations**: Framer Motion powered transitions
- **Responsive**: Works perfectly on desktop, tablet, and mobile
- **Dark Theme**: Easy on the eyes with purple/pink gradients

## 🚀 Quick Start

### Prerequisites
- **PHP 8.1+** with Composer
- **Node.js 16+** with npm
- **MySQL** (via XAMPP or standalone)
- **Spotify Developer Account**

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/SpotifyMirror.git
cd SpotifyMirror
```

### 2. Backend Setup (Laravel)
```bash
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure your .env file with:
# - Spotify API credentials
# - Database connection
# - Application URLs
```

### 3. Environment Configuration

Update `backend/.env`:
```env
# Spotify API Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:8000/callback

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=spotifymirror
DB_USERNAME=root
DB_PASSWORD=

# Application URLs
APP_URL=http://127.0.0.1:8080
```

Update `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:8080/api/v1
PORT=8000
```

### 4. Database Setup
```bash
# Start MySQL (via XAMPP or standalone)
# Create database 'spotifymirror'

# Run migrations
php artisan migrate
```

### 5. Frontend Setup (React)
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 6. Start Backend Server
```bash
cd backend

# Start Laravel development server
php artisan serve --port=8080
```

### 7. Access the Application
- **Frontend**: http://127.0.0.1:8000
- **Backend API**: http://127.0.0.1:8080

## 🎵 How It Works

### 1. **Start a Session**
- Visit the landing page and click \"Start Barkada Session\"
- No login required - explore the features first!

### 2. **Add Friends**
Choose from multiple ways to add friends:
- **Popup Login**: Friends log in simultaneously via popup windows
- **Session Codes**: Generate and share codes for remote joining
- **QR Codes**: Scan to join sessions instantly

### 3. **Music Analysis**
- System fetches each friend's top tracks and listening history
- AI analyzes music compatibility and shared preferences
- Real-time compatibility scoring and insights

### 4. **Generate Playlists**
- Create collaborative playlists based on group analysis
- Export directly to Spotify
- Share with all session participants

## 🏗️ Architecture

### **Frontend (React)**
```
src/
├── components/          # Reusable UI components
│   ├── MultiLoginBarkada.js    # Multi-login session handler
│   ├── TopTracks.js            # Track visualization
│   └── BarkadaAnalytics.js     # Analysis results
├── pages/              # Main application pages
│   ├── Landing.js             # Landing page
│   ├── BarkadaPage.js         # Main session page
│   └── Dashboard.js           # Personal analytics
├── services/           # API services
│   └── barkadaApi.js          # Spotify API integration
└── context/           # React context providers
    └── AuthContext.js         # Authentication state
```

### **Backend (Laravel)**
```
app/
├── Http/Controllers/
│   ├── AuthController.php         # Spotify OAuth
│   ├── BarkadaSessionController.php # Session management
│   └── AnalyticsController.php     # Music analysis
├── Models/
│   ├── User.php               # User model
│   └── BarkadaSession.php     # Session model
└── routes/
    └── api.php               # API routes
```

## 🔧 API Endpoints

### Authentication
```
GET  /api/v1/auth/login          # Get Spotify auth URL
POST /api/v1/auth/callback       # Handle OAuth callback
POST /api/v1/auth/refresh        # Refresh access token
GET  /api/v1/auth/barkada/users  # Get session users
```

### Barkada Sessions
```
POST /api/v1/sessions            # Create session
GET  /api/v1/sessions/{code}     # Get session details
POST /api/v1/sessions/{code}/join # Join session
```

### Music Analysis
```
POST /api/v1/analytics/barkada   # Analyze group music
GET  /api/v1/user/top-tracks     # Get user's top tracks
GET  /api/v1/user/profile        # Get user profile
```

## 🎨 Tech Stack

### **Frontend**
- **React 18.2.0** - UI framework
- **TailwindCSS 3.3.0** - Styling and design system
- **Framer Motion 10.16.4** - Animations and transitions
- **Lucide React 0.263.1** - Icon library
- **React Router Dom 6.8.1** - Client-side routing

### **Backend**
- **Laravel 10.x** - PHP framework
- **Laravel Sanctum** - API authentication
- **MySQL** - Database
- **Spotify Web API** - Music data source

### **Development Tools**
- **Vite** - Frontend build tool
- **Composer** - PHP dependency management
- **npm** - Node.js package manager

## 🔒 Security & Privacy

### **Data Protection**
- **No permanent storage** of user music data
- **Secure OAuth 2.0** implementation with Spotify
- **Session-based** data management
- **CORS protection** for API endpoints

### **Authentication**
- **Laravel Sanctum** for API token management
- **Spotify OAuth 2.0** for secure user authentication
- **State parameter validation** for CSRF protection
- **Token refresh** handling for expired sessions

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### **Development Setup**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the setup instructions above
4. Make your changes and test thoroughly
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### **Code Style**
- **Frontend**: Follow React best practices and ESLint rules
- **Backend**: Follow PSR-12 coding standards for PHP
- **Commit Messages**: Use conventional commit format

## 📸 Screenshots

### Landing Page
Beautiful gradient design with clear call-to-action

### Barkada Session
Multi-login interface with real-time friend management

### Music Analysis
Compatibility scoring and shared favorites visualization

### Collaborative Playlists
Generated playlists based on group music taste

## 🎯 Roadmap

### **v2.0 - Coming Soon**
- [ ] **Real-time Listening Parties** with WebSocket integration
- [ ] **Advanced ML Algorithms** for better music recommendations
- [ ] **Social Features** - friend networks and music sharing
- [ ] **Mobile App** for iOS and Android

### **v2.1 - Future**
- [ ] **Spotify Connect Integration** for synchronized playback
- [ ] **Custom Playlist Templates** based on occasions
- [ ] **Music Discovery Engine** with AI recommendations
- [ ] **Integration with other streaming platforms**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Spotify Web API** for providing comprehensive music data
- **Laravel Community** for the robust PHP framework
- **React Team** for the excellent frontend library
- **TailwindCSS** for the amazing utility-first CSS framework
- **All contributors** who help make this project better

## 📞 Support

### **Need Help?**
- 📖 **Documentation**: Check our [Wiki](wiki) for detailed guides
- 🐛 **Bug Reports**: Create an [Issue](issues) with details
- 💡 **Feature Requests**: Open a [Discussion](discussions)
- 📧 **Contact**: reach out via email

### **Community**
- 🎵 **Discord**: Join our music-loving community
- 🐦 **Twitter**: Follow for updates and tips
- 📸 **Instagram**: See SpotifyMirror in action

---

<div align=\"center\">

**Made with ❤️ for music lovers everywhere**

[⭐ Star this repo](../../stargazers) • [🐛 Report bug](../../issues) • [✨ Request feature](../../discussions)

</div>