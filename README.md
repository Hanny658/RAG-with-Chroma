# RAG-with-Chroma

RAG-with-Chroma is an open-source Retrieval-Augmented Generation (RAG) application designed to be integrated into your server, providing APIs and a user-friendly frontend for managing AI knowledge. The application utilizes Chroma with SQLite as the vector store, OpenAI API for text embedding, ChatGPT and Deepseek as Large Language Models (LLMs), FastAPI for the backend, and React with Vite and TypeScript for the frontend.

## Features

- **AI Knowledge Management**: Efficiently manage and retrieve AI-related information.
- **API Integration**: Seamlessly integrate with your existing systems through robust APIs.
- **User-Friendly Frontend**: Intuitive interface built with React and TypeScript.
- **Flexible Backend**: Powered by FastAPI, ensuring high performance and scalability.

## Requirements

Ensure your system meets the following requirements before setting up RAG-with-Chroma:

- **Python**: Version 3.10 or higher
- **Node.js**: Version 18 or higher
- **SQLite**: Version 3.35 or higher ([Why?](https://docs.trychroma.com/updates/troubleshooting#sqlite))
- **React**: Version 19 or higher

## Installation

### Backend Setup

1. **Navigate to the Backend Directory**:

   ```bash
   cd backend
   ```

2. **Install Dependencies**:

   Use pip to install the required Python packages:

   ```bash
   pip install -r requirements.txt
   ```

3. **Configuration**:

   Create a `config.json` file in the backend directory. Use the provided `config.example.json` as a template. This configuration file includes settings such as CORS and other persistent configurations.

### Frontend Setup

1. **Navigate to the Frontend Directory**:

   ```bash
   cd frontend
   ```

2. **Install Dependencies**:

   Use npm to install the required Node.js packages:

   ```bash
   npm install
   ```

3. **Environment Variables**:

   Create a `.env` file in the frontend directory with the following content:

   ```env
   # Backend URL
   VITE_BACKEND_URL=<your backend domain URI or localhost>

   # Password for Page Login
   VITE_ENTRE_PWD=<your password for system login>
   ```

   Replace `<your backend domain URI or localhost>` with the URL where your backend is hosted, and `<your password for system login>` with your desired login password.

## Running the Application

### Development Mode

To run the application in development mode:

1. **Start the Backend**:

   In the `backend` directory, run:

   ```bash
   python main.py
   # OR
   uvicorn main:app --reload
   ```

   This will start the FastAPI server with automatic reloading enabled.

2. **Start the Frontend**:

   In the `frontend` directory, run:

   ```bash
   npm run dev
   ```

   This will start the development server for the React application.

### Deployment

For production deployment:

1. **Backend Deployment**:

   Use a production-ready ASGI server such as `gunicorn` with `uvicorn` workers:

   ```bash
   gunicorn -k uvicorn.workers.UvicornWorker main:app
   ```

2. **Frontend Deployment**:

   Build the frontend for production:

   ```bash
   npm run build
   ```

   Serve the contents of the `dist` directory using a web server of your choice, such as Nginx or Apache.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

For further assistance or to contribute to the project, please refer to the repository's [GitHub page](https://github.com/Hanny658/RAG-with-Chroma). 
It should be ready for fork and customise by yourself now~
