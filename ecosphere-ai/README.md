# EcoSphere AI – Local Ollama version

This version runs the chatbot using Ollama on your own computer. It does not require an OpenAI API key or paid OpenAI API credits.

## Setup (Windows)
1. Install Node.js 18 or newer.
2. Install Ollama from https://ollama.com/download/windows.
3. Open PowerShell and run `ollama pull llama3.2:3b` (the first download may take a few minutes and needs internet).
4. In this project folder, run `npm install`.
5. Copy `.env.example` to `.env` if `.env` does not already exist. The default settings are ready to use.
6. Make sure Ollama is running, then run `npm start`.
7. Open http://localhost:3000.

Ollama runs the model locally after it has been downloaded. Model responses use your computer's RAM/CPU/GPU. Internet is needed for the initial model download, but not normally for local chat.
