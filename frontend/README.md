# SpotifyMirror Frontend

React frontend for SpotifyMirror - A beautiful music analytics and visualization platform.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**
   ```bash
   npm start
   ```

3. **Open in browser**
   Navigate to `http://localhost:3000`

## 🛠️ Tech Stack

- **React** - UI Framework
- **React Router** - Client-side routing
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Axios** - HTTP client

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.js
│   │   ├── LoadingSpinner.js
│   │   └── ProtectedRoute.js
│   ├── pages/              # Page components
│   │   ├── Landing.js
│   │   ├── Callback.js
│   │   ├── Dashboard.js
│   │   ├── Analytics.js
│   │   ├── Playlists.js
│   │   └── Profile.js
│   ├── context/            # React Context
│   │   └── AuthContext.js
│   ├── services/           # API services
│   │   └── spotifyApi.js
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── tailwind.config.js
```

## 🎨 Features

### Landing Page
- Modern hero section with animations
- Feature showcase
- Privacy information
- Spotify OAuth integration

### Authentication
- Secure OAuth 2.0 flow
- Token management
- Auto-refresh functionality
- Protected routes

### Dashboard
- User profile display
- Navigation system
- Responsive design
- Loading states

### Responsive Design
- Mobile-first approach
- Adaptive navigation
- Touch-friendly interactions
- Cross-browser compatibility

## 🔧 Configuration

The app automatically proxies API requests to `http://localhost:5000` during development.

For production, set the `REACT_APP_API_URL` environment variable:

```bash
REACT_APP_API_URL=https://your-api-domain.com/api/v1
```

## 📱 Key Components

### AuthContext
Manages authentication state, token storage, and API communication.

### Callback Handler
Processes Spotify OAuth redirect with proper error handling and user feedback.

### Protected Routes
Ensures authenticated access to dashboard features.

### Responsive Navigation
Adaptive navigation with mobile menu and user profile integration.

## 🎯 OAuth Flow

1. User clicks "Connect with Spotify" on landing page
2. Redirects to Spotify authorization
3. Spotify redirects to `/callback` with authorization code
4. Frontend exchanges code for tokens via backend API
5. User profile is fetched and stored
6. User is redirected to dashboard

## 🚀 Available Scripts

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

## 🎨 Styling

Uses TailwindCSS with custom configuration:
- Custom color palette
- Spotify brand colors
- Glass morphism effects
- Custom animations
- Responsive utilities

## 📦 Dependencies

### Core
- `react` & `react-dom` - React framework
- `react-router-dom` - Routing
- `axios` - HTTP client

### UI & Animations
- `tailwindcss` - Utility-first CSS
- `framer-motion` - Animation library
- `lucide-react` - Icon library

### Data Visualization
- `recharts` - Chart library

## 🔗 Integration

The frontend integrates with the Node.js backend API:
- Authentication endpoints
- User data endpoints
- Analytics endpoints
- Playlist endpoints

## 🌐 Deployment

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Deploy build folder** to your hosting platform

3. **Set environment variables** for production API URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

Built with ❤️ for music lovers and data enthusiasts!