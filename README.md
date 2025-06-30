# CtrlEnter (More than Cheating)

A powerful, desktop AI assistant built with React and Electron that provides intelligent responses with web search capabilities and screen capture functionality.

![PromptlyAI Interface](https://img.shields.io/badge/Built%20with-React-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-2B2E3A?style=for-the-badge&logo=electron&logoColor=9FEAF9)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

## ✨ Features

### 🧠 AI-Powered Responses
- **Real-time streaming responses** for instant feedback
- **Multiple AI model support** (Gemini, Grok 3, GPT-4, Claude, Llama)
- **Intelligent query processing** with context awareness

### 🌐 Web Search Integration
- **Toggle web search** for current information and facts
- **Source citations** with automatic link generation
- **Recent data fetching** for up-to-date responses

### 📸 Screen Capture
- **One-click screen capture** functionality
- **Image analysis** with AI-powered insights
- **Seamless integration** with query processing

### 💻 Developer-Friendly
- **Syntax highlighting** for code blocks
- **One-click code copying** with language detection
- **Markdown rendering** with full formatting support
- **Responsive design** for optimal user experience

### ⚡ Performance & UX
- **Keyboard shortcuts** for quick access
- **Always-on-top** desktop application
- **Clean, modern interface** with dark theme
- **Multi-app usage** without interruption

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/PromptlyAI.git
   cd PromptlyAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

6. **Run as Electron app**
   ```bash
   npm run electron
   ```

## 🔧 Configuration

### API Setup

#### Google Gemini API (Recommended)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Generate your API key
3. Add it to your `.env` file as `VITE_GEMINI_API_KEY`

### Environment Variables
```env
# Required for Gemini AI functionality
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## 🎯 Usage

### Basic Search
1. Type your query in the search input
2. Press `Enter` or click the search button
3. View the AI-generated response with syntax highlighting

### Web Search Mode
- **Toggle**: Click the "Web Search" button or use `Ctrl+W`
- **Functionality**: Enables real-time web data retrieval for current information

### Screen Capture
- **Activate**: Click the "Capture Screen" button
- **Usage**: Capture your screen and ask AI questions about the content
- **Integration**: Automatically includes captured image in your query

### Code Interaction
- **Copy Code**: Click the "Copy" button on any code block
- **Language Detection**: Automatic syntax highlighting for multiple languages
- **Formatted Output**: Clean, readable code presentation

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send query |
| `Ctrl+W` | Toggle web search |
| `Escape` | Hide application |
| `Ctrl+Enter` | Show/hide application |

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **React Markdown** - Markdown rendering
- **Prism.js** - Syntax highlighting

### AI & APIs
- **Google Generative AI** - Primary AI model
- **OnClick AI API** - Alternative AI service
- **Streaming responses** - Real-time data processing

### Desktop
- **Electron** - Cross-platform desktop application
- **Native integrations** - Screen capture, clipboard access

### Styling
- **Custom CSS** - Modern, responsive design
- **CSS Variables** - Consistent theming
- **Flexbox/Grid** - Responsive layouts

## 📁 Project Structure

```
PromptlyAI/
├── public/
│   ├── electron.cjs          # Electron main process
│   └── vite.svg             # Vite logo
├── src/
│   ├── App.jsx              # Main application component
│   ├── App.css              # Application styles
│   ├── main.jsx             # React entry point
│   ├── index.css            # Global styles
│   └── assets/              # Static assets
├── package.json             # Dependencies and scripts
├── vite.config.js          # Vite configuration
└── eslint.config.js        # ESLint configuration
```

## 🚀 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Run Electron app
npm run electron
```

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Areas for Contribution
- 🐛 Bug fixes and improvements
- ✨ New AI model integrations
- 🎨 UI/UX enhancements
- 📚 Documentation improvements
- 🧪 Testing and quality assurance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google AI** for the Gemini API
- **React team** for the amazing framework
- **Vite team** for the lightning-fast build tool
- **Electron team** for cross-platform desktop capabilities

## 📞 Support

- 📧 **Email**: support@promptlyai.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/PromptlyAI/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/PromptlyAI/discussions)

---

<div align="center">
  <strong>Made with ❤️ by the PromptlyAI Team</strong>
</div>