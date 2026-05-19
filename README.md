# Flashcard Quiz App 🧠📚

A local AI-powered flashcard quiz app built with Flask, Python, JavaScript, and Ollama.

## 📖 About

Flashcard Quiz App is an AI-powered study assistant that helps users turn lesson files and questionnaires into flashcards and quizzes. Users can upload PDF or DOCX files, generate flashcards automatically, take quizzes, edit cards, export study sets, and review saved history.

## ✨ Features

- Upload PDF or DOCX files
- Generate flashcards from lesson files
- Detect multiple-choice questionnaires
- Use local AI to answer missing quiz answers
- Flashcard mode
- Quiz mode
- Score tracking
- Edit and delete flashcards
- Export JSON, CSV, and TXT
- Save and load history
- Light mode and dark mode

## 🛠️ Tech Stack

- Python
- Flask
- JavaScript
- HTML
- CSS
- Ollama / Local AI Server
- Render

## 📁 Project Structure

```txt
flashcard-quiz-app/
├── backend/
│   └── app.py
│
├── frontend/
│
├── .env.example
├── .gitignore
├── README.md
├── requirements.txt
├── runtime.txt
├── test_ollama.py
└── test_openwebui.py
```

## ⚙️ Requirements

- Python 3.10+
- Ollama or a local AI server running at `http://localhost:11434`
- A local model installed, such as `openai/localmodel:latest`
- Required packages from `requirements.txt`

## 🚀 Setup

Clone the repository:

```bash
git clone https://github.com/IRAH-JANE/flashcard-quiz-app.git
```

Go to the project folder:

```bash
cd flashcard-quiz-app
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate the virtual environment:

For Windows:

```bash
.venv\Scripts\activate
```

For macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create an environment file:

```bash
cp .env.example .env
```

Run the Flask backend:

```bash
python backend/app.py
```

Open the local server link shown in the terminal.

## 🤖 Ollama Setup

Make sure Ollama is installed and running:

```bash
ollama serve
```

You can test the Ollama connection with:

```bash
python test_ollama.py
```

You can also test Open WebUI integration with:

```bash
python test_openwebui.py
```

## 🧑‍🏫 How to Use

1. Open the Flashcard Quiz App.
2. Upload a PDF or DOCX file.
3. Choose the number of flashcards to generate.
4. Click **Generate Flashcards**.
5. Review the generated flashcards.
6. Use **Flashcard Mode** for studying.
7. Use **Quiz Mode** to test your knowledge.
8. Track your score.
9. Edit or delete flashcards if needed.
10. Export your flashcards as JSON, CSV, or TXT.
11. Save and reload study history.

## 📤 Export Options

The app supports exporting flashcards in the following formats:

- JSON
- CSV
- TXT

## 🌗 Theme Support

The app includes both light mode and dark mode for a better user experience.

## 🌍 Deployment

This project is deployed using Render.

Live site:

```txt
https://flashcard-quiz-app-m6ft.onrender.com
```

## 👩‍💻 Author

Created by **IRAH-JANE**

GitHub: [IRAH-JANE](https://github.com/IRAH-JANE)

## 📄 License

This project is for educational purposes.
