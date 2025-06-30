import { useState, useRef, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showResponse, setShowResponse] = useState(false)
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const [screenCaptureEnabled, setScreenCaptureEnabled] = useState(true)
  const [aiModel, setAiModel] = useState('Gemini')
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [copiedCode, setCopiedCode] = useState(null)

  const modelDropdownRef = useRef(null)
  const parentContainerRef = useRef(null)

  const aiModels = ['Gemini', 'Grok 3', 'GPT-4', 'Claude', 'Llama']

  // Initialize Gemini AI
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
  let genAI = null
  let model = null

  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    try {
      genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
      model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    } catch (error) {
      console.error('Error initializing Gemini AI:', error)
    }
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target)) {
        setShowModelDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Close dropdowns on Escape
      if (event.key === 'Escape') {
        setShowModelDropdown(false)
        // Note: Escape will also hide the window (handled in Electron)
      }

      // Toggle web search with Ctrl+W
      if ((event.ctrlKey || event.metaKey) && event.key === 'w') {
        event.preventDefault()
        setWebSearchEnabled(!webSearchEnabled)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [webSearchEnabled])

  const getSearchPrompt = (originalQuery) => {
    if (webSearchEnabled) {
      return `Search for current information about: ${originalQuery}. Provide recent facts, statistics, and relevant details.`
    }
    return originalQuery
  }

  const callGeminiAPI = async (prompt) => {
    if (!model) {
      throw new Error('Gemini API not configured')
    }

    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini API Error:', error)
      throw error
    }
  }

  const callOnClickAI = async (prompt, useWebSearch = false, useStreaming = true) => {
    const API_URL = 'https://onclick-ai-web.vercel.app/api/query'

    try {
      const requestBody = {
        query: prompt,
        searchEnabled: useWebSearch
      }

      const headers = {
        'Content-Type': 'application/json',
      }

      if (useStreaming) {
        headers['Accept'] = 'text/event-stream'
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      if (useStreaming) {
        return response // Return the response for streaming
      } else {
        const data = await response.json()
        return {
          answer: data.answer,
          sources: data.sources || []
        }
      }
    } catch (error) {
      console.error('OnClick AI API Error:', error)
      throw error
    }
  }

  // const getMockResponse = (prompt) => {
  //   return `🤖 ${aiModel} Response (${searchMode} Mode)\n\n📋 Mode: ${searchMode}\n🧠 Model: ${aiModel}\n\n${prompt}\n\n⚠️ This is a mock response because:\n${!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here' ? '• Gemini API key not configured' : '• Using non-Gemini model'}\n\n✨ Multi-App Usage Enabled!\nYou can now:\n• Click on other applications while this is open\n• Use Ctrl+Enter to show/hide this app\n• Use Ctrl+Escape or Escape to hide\n• Switch between apps normally\n\n📌 Keyboard Shortcuts:\n- Ctrl+1: DeepSearch\n- Ctrl+2: QuickSearch\n- Ctrl+3: WebSearch\n- Ctrl+4: ImageSearch\n\n🔧 To enable real AI responses:\n1. Get API key from https://makersuite.google.com/app/apikey\n2. Create .env file with: VITE_GEMINI_API_KEY=your_key\n3. Restart the app`
  // }

  const handleSearch = async () => {
    if (!query.trim()) {
      return
    }

    setIsLoading(true)
    setShowResponse(true)
    setResponse('') // Clear previous response

    try {
      const searchPrompt = getSearchPrompt(query)

      // Use the web search toggle state
      const useWebSearch = webSearchEnabled

      // Use streaming for real-time response
      const streamResponse = await callOnClickAI(searchPrompt, useWebSearch, true)

      if (!streamResponse.body) {
        throw new Error('No response body received')
      }

      const reader = streamResponse.body.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''
      let sources = []

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })

          // Handle Server-Sent Events format
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                break
              }

              try {
                const parsed = JSON.parse(data)
                if (parsed.answer) {
                  fullResponse += parsed.answer
                }
                if (parsed.sources) {
                  sources = parsed.sources
                }
              } catch (e) {
                // If not JSON, treat as plain text
                fullResponse += data
              }
            } else if (line.trim() && !line.startsWith('event:')) {
              // Handle plain text chunks
              fullResponse += line
            }
          }

          // Update response in real-time
          let displayResponse = fullResponse || '';

          if (sources.length > 0) {
            displayResponse += `\n\n📚 Sources:\n${sources.map(source => `• ${source}`).join('\n')}`;
          }

          setResponse(displayResponse)
        }
      } finally {
        reader.releaseLock()
      }

    } catch (error) {
      console.error('❌ Search Error:', error)
      let errorMessage = `Error: ${error.message}`;

      if (error.message.includes('API request failed')) {
        errorMessage = 'The service is temporarily unavailable. Please try again in a moment.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }

      setResponse(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleThink = () => {
    setQuery('Let me think about this deeply and provide a comprehensive analysis...')
    setTimeout(() => {
      handleSearch()
    }, 100)
  }

  const handleScreenCapture = async () => {
    if (!screenCaptureEnabled) return;
    
    try {
      setIsCapturing(true);
      
      // Hide the UI temporarily for clean capture
      if (parentContainerRef.current) {
        parentContainerRef.current.style.opacity = '0';
      }

      // Wait for UI to hide
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the screen
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { 
          cursor: "always" 
        },
        audio: false
      });

      // Create a video element to capture the stream
      const video = document.createElement('video');
      video.srcObject = stream;
      
      // Wait for the video to be ready
      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
        video.play();
      });

      // Create a canvas to draw the capture
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the video frame to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());

      // Convert to base64 and create image
      const base64Image = canvas.toDataURL('image/png');
      
      // Show UI again
      if (parentContainerRef.current) {
        parentContainerRef.current.style.opacity = '1';
      }

      // Add the image to the query
      setQuery(prev => {
        const imageMarkdown = `![Screen Capture](${base64Image})\n\n${prev}`;
        return imageMarkdown;
      });

    } catch (error) {
      console.error('Screen capture error:', error);
    } finally {
      setIsCapturing(false);
      if (parentContainerRef.current) {
        parentContainerRef.current.style.opacity = '1';
      }
    }
  };



  // Function to copy code to clipboard
  const copyToClipboard = (code, index) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(index);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  return (
    <div className="app">
      <div className="parent-container" ref={parentContainerRef}>
        {/* Combined Search and Controls Container */}
        <div className="combined-container">
          {/* Main Search Container */}
          <div className="search-container">
            <div className="input-wrapper">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask anything...`}
                className="search-input"
                autoFocus
              />
              <button
                onClick={() => {
                  handleSearch()
                }}
                className="search-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="21 21l-4.35-4.35" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Tools Container */}
      <div className="header-controls">
        {/* Web Search Toggle */}
        <button
          className={`web-search-toggle ${webSearchEnabled ? 'active' : ''}`}
          onClick={() => setWebSearchEnabled(!webSearchEnabled)}
          title="Toggle Web Search (Ctrl+W)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          Web Search
          {webSearchEnabled && <span className="toggle-indicator">●</span>}
        </button>

            {/* Screen Capture Toggle */}
            <button
              className={`web-search-toggle ${screenCaptureEnabled ? 'active' : ''} ${isCapturing ? 'capturing' : ''}`}
              onClick={() => setScreenCaptureEnabled(!screenCaptureEnabled)}
              title="Toggle Screen Capture"
              disabled={isCapturing}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              {isCapturing ? 'Capturing...' : 'Capture Screen'}
              {screenCaptureEnabled && !isCapturing && <span className="toggle-indicator">●</span>}
            </button>

        {/* Think Button */}
        {/* <button className="think-button" onClick={handleThink} title="AI Thinking Mode">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5c0-1.66 4-3 9-3s9 1.34 9 3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
          Think
        </button> */}

        {/* AI Model Dropdown */}
        {/* <div className="dropdown" ref={modelDropdownRef}>
          <button 
            className={`dropdown-trigger model-selector ${aiModel === 'Gemini' && model ? 'api-active' : ''}`}
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            title="AI Model Selection"
          >
            {aiModel}
            {aiModel === 'Gemini' && model && <span className="api-indicator">●</span>}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </button>
          {showModelDropdown && (
            <div className="dropdown-menu">
              {aiModels.map((modelName) => (
                <button
                  key={modelName}
                  className={`dropdown-item ${modelName === aiModel ? 'active' : ''}`}
                  onClick={() => {
                    setAiModel(modelName)
                    setShowModelDropdown(false)
                  }}
                >
                  {modelName}
                  {modelName === 'Gemini' && model && <span className="api-indicator">●</span>}
                  {modelName === 'Gemini' && !model && <span className="api-status">(Setup Required)</span>}
                </button>
              ))}
            </div>
          )}
        </div> */}
      </div>
        </div>
      </div>

      {/* Response Container */}
      {showResponse && (
          <div className="response-container">
            <div className="response-header">
              <div className="ai-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
            <span>AI Response</span>
              <div className="response-badges">
                {webSearchEnabled && <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', borderColor: 'rgba(34, 197, 94, 0.3)' }}>Web Search</span>}
              </div>
              <button
                className="close-button"
                onClick={() => {
                  setShowResponse(false)
                }}
              title="Close"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="response-content">
              {isLoading ? (
                <div className="loading-text">
                  <div className="thinking-animation">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                Processing...
                </div>
              ) : (
              <ReactMarkdown
                children={response}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');
                    const language = match ? match[1] : '';
                    
                    if (!inline && language) {
                      const codeId = `code-${Math.random().toString(36).substring(7)}`;
                      return (
                        <div className="code-block-container">
                          <div className="code-header">
                            <span className="code-language">{language}</span>
                            <button 
                              className="copy-button" 
                              onClick={() => copyToClipboard(codeString, codeId)}
                            >
                              {copiedCode === codeId ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                          <SyntaxHighlighter
                            language={language}
                            style={vscDarkPlus}
                            PreTag="div"
                            {...props}
                          >
                            {codeString}
                          </SyntaxHighlighter>
                        </div>
                      );
                    } else if (!inline) {
                      // Handle code blocks without language specification
                      const codeId = `code-${Math.random().toString(36).substring(7)}`;
                      return (
                        <div className="code-block-container">
                          <div className="code-header">
                            <span className="code-language">code</span>
                            <button 
                              className="copy-button" 
                              onClick={() => copyToClipboard(codeString, codeId)}
                            >
                              {copiedCode === codeId ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            PreTag="div"
                            {...props}
                          >
                            {codeString}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }
                    
                    return <code className={className} {...props}>{children}</code>;
                  }
                }}
              />
              )}
            </div>
          </div>
      )}
    </div>
  )
}

export default App
