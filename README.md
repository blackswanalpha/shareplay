# 🎵 SharePlay - Synchronized Entertainment Platform

SharePlay is a real-time collaborative platform for synchronized entertainment. Watch videos, listen to music, and play games together with friends across the globe.

## ✨ Features

- **🎬 Synchronized Video Playback** - Watch videos together in perfect sync
- **💬 Real-time Chat** - Live messaging with all participants
- **🏠 Room Management** - Create custom rooms with configurable features
- **🔐 Seamless Authentication** - Secure login with NextAuth.js
- **⚡ Instant Synchronization** - WebSocket technology for real-time updates
- **🎮 Games Area** - Coming soon: Multiplayer party games
- **🎵 Music Player** - Coming soon: Synchronized music streaming
- **📱 Responsive Design** - Works seamlessly on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager
- A backend server (SharePlay backend included)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shareplay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   NEXT_PUBLIC_WS_URL=ws://localhost:8000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000)

## 🛠 Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: CSS Modules, Modern CSS
- **Authentication**: NextAuth.js
- **Real-time**: WebSocket
- **Backend**: FastAPI (Python)
- **Database**: SQLite
- **Deployment**: Vercel

## 📁 Project Structure

```
shareplay/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── room/[roomId]/  # Dynamic room pages
│   │   ├── dashboard/      # User dashboard
│   │   └── api/            # API routes
│   ├── components/         # Reusable components
│   │   ├── ui/            # UI components
│   │   └── room/          # Room-specific components
│   └── lib/               # Utilities and API
├── public/                # Static assets
└── shareplay_backend/     # Python backend
```

## 🎯 Usage

1. **Create an Account** - Sign up or log in
2. **Join/Create Room** - Enter a room code or create a new room
3. **Configure Features** - Enable video, music, or games (host only)
4. **Share & Enjoy** - Share the room code with friends and start watching together

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checker
```

### Backend Setup

The Python backend is included in the `shareplay_backend/` directory:

```bash
cd shareplay_backend
pip install -r requirements.txt
python main.py
```

## 🌐 Deployment

### Deploy to Vercel

1. **Connect to Vercel**
   ```bash
   npx vercel
   ```

2. **Configure environment variables in Vercel dashboard**

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_URL` | Application URL | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret key | Yes |
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🛣 Roadmap

- [ ] Spotify/YouTube Music integration
- [ ] Multiplayer games (trivia, drawing, etc.)
- [ ] Voice chat integration
- [ ] Mobile app development
- [ ] Advanced room permissions
- [ ] Content recommendation system

## 🐛 Known Issues

- Music and Games features are in development
- WebSocket reconnection needs improvement
- Mobile optimization in progress

## 📞 Support

For support, email support@shareplay.com or open an issue on GitHub.

---

Built with ❤️ using Next.js and modern web technologies.
