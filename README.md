# 🧠 ADHD Reader - AI-Powered Reading Assistant

An innovative platform designed to help children with ADHD and other attention issues read more effectively. Built with AI-powered content analysis, character voice switching, visual aids, and blockchain progress tracking.

## ✨ Features

### 🎯 ADHD-Friendly Reading Features
- **Line-by-line focus tracking** - Highlights current reading line
- **Smart blur effects** - Blurs non-important content to reduce distractions
- **Keyword highlighting** - Emphasizes important concepts and terms
- **Visual content generation** - AI creates images and animations to aid comprehension
- **Focus mode** - Dark theme for reduced visual distractions

### 🎭 Advanced Audio Features
- **Character voice switching** - Different voices for different characters in literature
- **Multiple voice types** - Narrator, child, adult, and character-specific voices
- **Adjustable reading speed** - Customizable playback rate
- **Real-time word highlighting** - Synchronized audio and visual highlighting

### 🤖 AI-Powered Analysis
- **Content analysis** - Gemini AI analyzes text for importance and difficulty
- **Character detection** - Automatically identifies characters for voice switching
- **Genre classification** - Determines content type and reading level
- **Key concept extraction** - Identifies important concepts for highlighting

### ⛓️ Blockchain Integration
- **Progress tracking** - Reading milestones recorded on Solana blockchain
- **Achievement system** - NFT-based rewards for reading accomplishments
- **Reading challenges** - Community challenges with token rewards
- **Decentralized progress** - User data stored securely on blockchain

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Gemini API key
- Solana wallet (optional)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/Book-Flow.git
cd Book-Flow
```

### 2. Backend Setup
```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

### 4. Environment Configuration
Create a `.env` file in the `server` directory:

```env
# Required: Get your API key from https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Solana configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_WALLET_PATH=wallet.json
READING_PROGRAM_ID=11111111111111111111111111111111

# Application settings
APP_ORIGINS=http://localhost:5173,http://localhost:3000
DEBUG=True
LOG_LEVEL=INFO
```

### 5. Run the Application

**Development Mode:**
```bash
# Terminal 1 - Backend
cd server
source venv/bin/activate
uvicorn app:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd client
npm run dev
```

**Production Mode:**
```bash
# Using Docker
docker-compose up -d

# Or using the Raspberry Pi setup script
chmod +x raspberry-pi/setup.sh
./raspberry-pi/setup.sh
```

## 📱 Usage

### 1. Upload a Document
- Click "Choose File" to upload a PDF, DOCX, or TXT file
- The AI will analyze the content and extract characters, key concepts, and reading level

### 2. Configure Reading Settings
- Click the Settings icon to customize:
  - Font size and line spacing
  - Blur effects and highlighting
  - Voice type and character selection
  - Reading speed and focus mode

### 3. Start Reading
- Use arrow keys to navigate between lines
- Press spacebar to play/pause audio
- Press 'F' to toggle focus mode
- Watch as keywords are highlighted and visualizations appear

### 4. Track Progress
- Monitor your reading progress in the sidebar
- Earn achievements for consistent reading
- View your blockchain-tracked milestones

## 🛠️ Configuration

### API Keys Setup

#### Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file as `GEMINI_API_KEY`

#### Solana Configuration (Optional)
1. Install Solana CLI: `sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"`
2. Create a wallet: `solana-keygen new --outfile wallet.json`
3. Fund with test SOL: `solana airdrop 2 <wallet-address>`
4. Update `.env` with your wallet path

### Custom Voice Configuration
Edit `server/services/enhanced_tts.py` to add custom voices:

```python
def create_character_voice_profile(self, character_name: str, voice_characteristics: Dict[str, Any]) -> None:
    self.character_voices[character_name.lower()] = {
        "lang": "en",
        "tld": "com",
        "slow": False,
        "pitch": 1.0,
        "speed": 1.0
    }
```

## 🏗️ Architecture

### Backend (Python/FastAPI)
- **API Layer**: FastAPI with automatic OpenAPI documentation
- **AI Services**: Gemini API integration for content analysis
- **TTS Engine**: Google TTS with character voice support
- **Blockchain**: Solana integration for progress tracking
- **WebSocket**: Real-time word highlighting

### Frontend (React/TypeScript)
- **State Management**: Zustand for global state
- **UI Framework**: Tailwind CSS with custom ADHD-friendly styles
- **Animations**: Framer Motion for smooth transitions
- **Real-time**: WebSocket integration for live updates

### Key Components
```
client/src/
├── components/
│   ├── Reader.tsx          # Main reading interface
│   ├── Settings.tsx        # Configuration panel
│   └── ProgressTracker.tsx # Progress and achievements
├── store.ts                # Global state management
└── lib/ws.ts              # WebSocket utilities

server/
├── routes/
│   ├── documents.py        # Document processing
│   ├── tts.py             # Text-to-speech
│   └── visualizations.py  # AI-generated visuals
├── services/
│   ├── gemini_service.py   # AI content analysis
│   ├── enhanced_tts.py     # Voice synthesis
│   └── solana_service.py   # Blockchain integration
└── models.py              # Data models
```

## 🐳 Docker Deployment

### Using Docker Compose
```bash
# Create environment file
cp .env.example .env
# Edit .env with your API keys

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Services
```bash
# Build and run backend
cd server
docker build -t adhd-reader-backend .
docker run -p 8000:8000 --env-file .env adhd-reader-backend

# Build and run frontend
cd client
docker build -t adhd-reader-frontend .
docker run -p 3000:80 adhd-reader-frontend
```

## 🍓 Raspberry Pi Deployment

### Automated Setup
```bash
# Clone to Raspberry Pi
git clone https://github.com/yourusername/Book-Flow.git
cd Book-Flow

# Run setup script
chmod +x raspberry-pi/setup.sh
./raspberry-pi/setup.sh

# Configure environment
nano server/.env
# Add your API keys

# Start the application
./start.sh
```

### Manual Setup
1. Install dependencies: `sudo apt install python3 python3-pip nodejs npm nginx`
2. Set up Python environment: `python3 -m venv venv && source venv/bin/activate`
3. Install packages: `pip install -r server/requirements.txt && npm install --prefix client`
4. Build frontend: `npm run build --prefix client`
5. Configure Nginx and systemd services
6. Start services: `sudo systemctl start adhd-reader nginx`

## 🔧 Development

### Adding New Features

#### 1. New ADHD Reading Aid
```typescript
// In client/src/components/Reader.tsx
const newFeature = () => {
  // Implement your feature
}
```

#### 2. New AI Analysis
```python
# In server/services/gemini_service.py
async def new_analysis_method(self, text: str) -> Dict[str, Any]:
    # Implement your analysis
    pass
```

#### 3. New Blockchain Feature
```python
# In server/services/solana_service.py
def new_blockchain_feature(self, data: Any) -> str:
    # Implement blockchain interaction
    pass
```

### Testing
```bash
# Backend tests
cd server
python -m pytest tests/

# Frontend tests
cd client
npm test

# Integration tests
npm run test:integration
```

### Code Quality
```bash
# Backend linting
cd server
black .
flake8 .
mypy .

# Frontend linting
cd client
npm run lint
npm run type-check
```

## 📊 Monitoring and Maintenance

### Health Checks
- Backend: `http://localhost:8000/health`
- Frontend: `http://localhost:3000`
- Full system: `http://localhost` (with Nginx)

### Logs
```bash
# Backend logs
sudo journalctl -u adhd-reader -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Performance Monitoring
- CPU usage: `htop` or `docker stats`
- Memory usage: `free -h`
- Disk usage: `df -h`
- Network: `netstat -tulpn`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use TypeScript for all frontend code
- Write tests for new features
- Update documentation
- Follow semantic versioning

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for content analysis
- [Solana](https://solana.com/) for blockchain integration
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [React](https://reactjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/Book-Flow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/Book-Flow/discussions)
- **Email**: support@adhdreader.com

## 🗺️ Roadmap

### Version 2.1
- [ ] Mobile app (React Native)
- [ ] Offline mode support
- [ ] Advanced analytics dashboard
- [ ] Parent/teacher monitoring tools

### Version 2.2
- [ ] Multi-language support
- [ ] Voice training for custom characters
- [ ] Advanced visualization types
- [ ] Integration with educational platforms

### Version 3.0
- [ ] AR/VR reading experiences
- [ ] Advanced AI tutoring
- [ ] Social reading features
- [ ] Gamification elements

---

**Built with ❤️ for children with ADHD and attention challenges**