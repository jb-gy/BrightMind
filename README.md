# 🧠 BrightMind - AI-Powered Reading Assistant

An innovative platform designed to help children with ADHD and other attention issues read more effectively. Built with AI-powered content analysis, character voice switching, visual aids, and blockchain progress tracking.

## ✨ Features

### 🎯 ADHD-Friendly Reading Features
- **Line-by-line focus tracking** - Highlights current reading line with visual emphasis
- **Smart blur effects** - Blurs non-important content to reduce distractions
- **Keyword highlighting** - Emphasizes important concepts and terms using AI analysis
- **Visual content generation** - AI creates images and animations to aid comprehension
- **Focus mode** - Dark theme for reduced visual distractions
- **Customizable reading settings** - Font size, line spacing, and visual preferences

### 🎭 Advanced Audio Features
- **Character voice switching** - Different voices for different characters in literature
- **Multiple voice types** - Narrator, child, adult, and character-specific voices
- **Adjustable reading speed** - Customizable playback rate (0.5x to 2.0x)
- **Real-time word highlighting** - Synchronized audio and visual highlighting
- **Auto-reading mode** - Automated progression through document with pause/resume
- **Enhanced TTS integration** - Google TTS with character voice profiles

### 🤖 AI-Powered Analysis
- **Content analysis** - Gemini AI analyzes text for importance and difficulty
- **Character detection** - Automatically identifies characters for voice switching
- **Genre classification** - Determines content type and reading level
- **Key concept extraction** - Identifies important concepts for highlighting
- **Visualization generation** - Creates contextual images and animations
- **Reading difficulty assessment** - Analyzes text complexity for appropriate pacing

### ⛓️ Blockchain Integration
- **Progress tracking** - Reading milestones recorded on Solana blockchain
- **Achievement system** - NFT-based rewards for reading accomplishments
- **Reading challenges** - Community challenges with token rewards
- **Decentralized progress** - User data stored securely on blockchain
- **Transaction history** - Complete reading session tracking

### 📱 Modern User Interface
- **Responsive design** - Works seamlessly across desktop, tablet, and mobile
- **Real-time updates** - WebSocket integration for live progress tracking
- **Interactive panels** - Floating visualization, settings, and notes panels
- **Progress dashboard** - Visual progress indicators and achievement tracking
- **Keyboard navigation** - Full keyboard support for accessibility

## 🏗️ Architecture Overview

### Frontend (React/TypeScript)
The frontend is built with modern React patterns and includes multiple specialized components:

#### Core Components
- **`NewApp.tsx`** - Main application container with layout and state management
- **`DocumentReader.tsx`** - Primary reading interface with line-by-line navigation
- **`Reader.tsx`** - Legacy reader component with keyboard navigation
- **`SettingsPanel.tsx`** - Comprehensive settings configuration
- **`FloatingVisualizationPanel.tsx`** - AI-generated visual content display
- **`NotesPanel.tsx`** - Note-taking and annotation system
- **`ProgressTracker.tsx`** - Reading progress and achievement tracking
- **`VisualizationSidebar.tsx`** - Sidebar for visual content management

#### State Management
- **Zustand store** (`store.ts`) - Global state management for:
  - Document content and navigation
  - Audio playback state
  - User settings and preferences
  - Reading progress tracking
  - WebSocket connections

#### Key Features
- **WebSocket integration** (`lib/ws.ts`) - Real-time communication with backend
- **Framer Motion animations** - Smooth transitions and micro-interactions
- **Tailwind CSS styling** - Responsive, accessible design system
- **Lucide React icons** - Consistent iconography throughout

### Backend (Python/FastAPI)
The backend provides a robust API with multiple specialized services:

#### API Routes
- **`documents.py`** - Document upload, processing, and layout extraction
- **`tts.py`** - Text-to-speech synthesis with character voice support
- **`analyze.py`** - Content analysis and key phrase extraction
- **`visualizations.py`** - AI-generated visual content creation
- **`auto_reader.py`** - Automated reading session management
- **`image_generation.py`** - Batch image generation and caching

#### Core Services
- **`gemini_service.py`** - Google Gemini AI integration for content analysis
- **`enhanced_tts.py`** - Advanced text-to-speech with character voices
- **`solana_service.py`** - Blockchain integration for progress tracking
- **`mongodb_service.py`** - Database operations and user data management
- **`pdf_extractor.py`** - PDF and DOCX document processing
- **`image_generator.py`** - AI-powered image generation service
- **`auto_reader_service.py`** - Automated reading session orchestration
- **`ws_manager.py`** - WebSocket connection management

#### Data Models
- **`models.py`** - Pydantic models for API requests/responses:
  - Document layout and structure
  - Reading progress tracking
  - TTS requests and responses
  - Visualization data
  - User settings and preferences

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Gemini API key
- Solana wallet (optional)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/BrightMind.git
cd BrightMind
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

# Optional: MongoDB configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=brightmind
MONGODB_COLLECTION_DOCUMENTS=documents
MONGODB_COLLECTION_USERS=users
MONGODB_COLLECTION_PROGRESS=reading_progress
MONGODB_COLLECTION_TRANSACTIONS=solana_transactions

# Application settings
APP_ORIGINS=http://localhost:5173,http://localhost:3000
DEBUG=True
LOG_LEVEL=INFO
```

### 5. Run the Application

**Development Mode:**
```bash
# Quick start script (recommended)
./quick-start.sh

# Manual setup
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
- Document layout is automatically processed for optimal reading experience

### 2. Configure Reading Settings
- Click the Settings icon to customize:
  - Font size and line spacing
  - Blur effects and highlighting intensity
  - Voice type and character selection
  - Reading speed and focus mode preferences
  - Visual theme and color schemes

### 3. Start Reading
- Use arrow keys to navigate between lines
- Press spacebar to play/pause audio
- Press 'F' to toggle focus mode
- Watch as keywords are highlighted and visualizations appear
- Use auto-reader mode for hands-free progression

### 4. Track Progress
- Monitor your reading progress in the sidebar
- Earn achievements for consistent reading
- View your blockchain-tracked milestones
- Take notes and annotations as you read

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

#### MongoDB Configuration (Optional)
For production use, configure MongoDB Atlas:
1. Create a MongoDB Atlas account
2. Create a cluster and get connection string
3. Update `MONGODB_URI` in `.env` file

### Custom Voice Configuration
Edit `server/services/enhanced_tts.py` to add custom voices:

```python
def create_character_voice_profile(self, character_name: str, voice_characteristics: Dict[str, Any]) -> None:
    self.character_voices[character_name.lower()] = {
        "lang": "en",
        "tld": "com",
        "slow": False,
        "pitch": voice_characteristics.get("pitch", 1.0),
        "speed": voice_characteristics.get("speed", 1.0)
    }
```

## 🐳 Docker Deployment

### Using Docker Compose
```bash
# Create environment file
cp env.example .env
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
docker build -t brightmind-backend .
docker run -p 8000:8000 --env-file .env brightmind-backend

# Build and run frontend
cd client
docker build -t brightmind-frontend .
docker run -p 3000:80 brightmind-frontend
```

## 🍓 Raspberry Pi Deployment

### Automated Setup
```bash
# Clone to Raspberry Pi
git clone https://github.com/yourusername/BrightMind.git
cd BrightMind

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
6. Start services: `sudo systemctl start brightmind nginx`

## 🔧 Development

### Project Structure
```
BrightMind/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── NewApp.tsx    # Main application
│   │   │   ├── DocumentReader.tsx # Reading interface
│   │   │   ├── SettingsPanel.tsx  # Settings management
│   │   │   ├── FloatingVisualizationPanel.tsx # Visual content
│   │   │   ├── NotesPanel.tsx     # Note-taking
│   │   │   ├── ProgressTracker.tsx # Progress tracking
│   │   │   ├── VisualizationSidebar.tsx # Visual sidebar
│   │   │   ├── Reader.tsx         # Legacy reader
│   │   │   └── Settings.tsx       # Legacy settings
│   │   ├── lib/              # Utilities
│   │   │   └── ws.ts         # WebSocket management
│   │   ├── store.ts          # Zustand state management
│   │   ├── styles.css        # Tailwind CSS
│   │   └── main.tsx          # React entry point
│   ├── package.json          # Node.js dependencies
│   └── Dockerfile            # Frontend container
├── server/                   # Python backend
│   ├── routes/               # API endpoints
│   │   ├── documents.py      # Document processing
│   │   ├── tts.py           # Text-to-speech
│   │   ├── analyze.py       # Content analysis
│   │   ├── visualizations.py # Visual generation
│   │   ├── auto_reader.py   # Auto-reading
│   │   └── image_generation.py # Image generation
│   ├── services/             # Business logic
│   │   ├── gemini_service.py # AI integration
│   │   ├── enhanced_tts.py   # TTS service
│   │   ├── solana_service.py # Blockchain
│   │   ├── mongodb_service.py # Database
│   │   ├── pdf_extractor.py  # Document processing
│   │   ├── image_generator.py # Image generation
│   │   ├── auto_reader_service.py # Auto-reading
│   │   ├── ws_manager.py     # WebSocket management
│   │   └── tts_mock.py       # Mock TTS for development
│   ├── static/               # Static files
│   │   ├── audio/           # Generated audio files
│   │   └── images/          # Generated images
│   ├── models.py            # Pydantic models
│   ├── app.py              # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Backend container
├── raspberry-pi/           # Pi deployment
│   └── setup.sh           # Automated setup
├── docker-compose.yml      # Container orchestration
├── quick-start.sh         # Development setup
└── env.example            # Environment template
```

### Adding New Features

#### 1. New ADHD Reading Aid
```typescript
// In client/src/components/NewApp.tsx
const newFeature = () => {
  // Implement your feature
  // Update store.ts for state management
  // Add to settings panel if configurable
}
```

#### 2. New AI Analysis
```python
# In server/services/gemini_service.py
async def new_analysis_method(self, text: str) -> Dict[str, Any]:
    # Implement your analysis
    # Add to models.py for data structure
    # Create API endpoint in routes/
    pass
```

#### 3. New Blockchain Feature
```python
# In server/services/solana_service.py
def new_blockchain_feature(self, data: Any) -> str:
    # Implement blockchain interaction
    # Update models.py for transaction structure
    pass
```

#### 4. New UI Component
```typescript
// Create new component in client/src/components/
// Import and use in NewApp.tsx
// Add to store.ts for state management if needed
// Style with Tailwind CSS
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

# End-to-end tests
npm run test:e2e
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
npm run build
```

## 📊 Monitoring and Maintenance

### Health Checks
- Backend: `http://localhost:8000/health`
- Frontend: `http://localhost:3000`
- Full system: `http://localhost` (with Nginx)

### Logs
```bash
# Backend logs
sudo journalctl -u brightmind -f

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

## 🔌 API Documentation

### Core Endpoints

#### Document Processing
- `POST /documents` - Upload and process document
- `GET /documents/{doc_id}` - Get document details

#### Text-to-Speech
- `POST /tts` - Generate audio with character voices
- `GET /voices` - Get available voice options

#### Content Analysis
- `POST /analyze/keyphrases` - Extract key phrases
- `POST /analyze/characters` - Detect characters

#### Visualizations
- `POST /visualizations` - Generate visual content
- `POST /visualizations/batch` - Batch generate visuals

#### Auto Reading
- `POST /auto-reader/start` - Start automated reading
- `POST /auto-reader/pause` - Pause reading session
- `POST /auto-reader/resume` - Resume reading session
- `POST /auto-reader/stop` - Stop reading session
- `GET /auto-reader/status` - Get current status
- `WS /auto-reader/ws/{session_id}` - WebSocket for real-time updates

#### Image Generation
- `POST /images/generate` - Generate image for line
- `POST /images/batch` - Batch generate images
- `GET /images/styles` - Get available styles
- `DELETE /images/cache` - Clear image cache
- `GET /images/stats` - Get cache statistics

### WebSocket Events
- `auto_reader_event` - Auto-reading progress updates
- `tts_complete` - TTS generation completion
- `visualization_ready` - New visualization available

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
- Ensure accessibility compliance
- Test with ADHD-friendly features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for content analysis
- [Solana](https://solana.com/) for blockchain integration
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [React](https://reactjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Zustand](https://github.com/pmndrs/zustand) for state management
- [Lucide React](https://lucide.dev/) for icons



## 🗺️ Future Improvements

### Version 2.1
- [ ] Mobile app (React Native)
- [ ] Offline mode support
- [ ] Advanced analytics dashboard
- [ ] Parent/teacher monitoring tools
- [ ] Multi-language support

### Version 2.2
- [ ] Voice training for custom characters
- [ ] Advanced visualization types (3D, AR)
- [ ] Integration with educational platforms
- [ ] Advanced reading comprehension tests
- [ ] Social reading features

### Version 3.0
- [ ] AR/VR reading experiences
- [ ] Advanced AI tutoring system
- [ ] Gamification elements
- [ ] Community challenges
- [ ] Advanced progress analytics

---

**Built with ❤️ for children with ADHD and attention challenges**

*BrightMind - Empowering minds to focus, learn, and thrive through AI-powered reading assistance.*