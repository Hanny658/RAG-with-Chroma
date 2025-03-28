import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import MainPage from './views/MainPage';
import AuthU from './views/AuthU';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthU />} />
        <Route path="/management" element={<MainPage />} />
      </Routes>
    </Router>
  )
}

export default App
