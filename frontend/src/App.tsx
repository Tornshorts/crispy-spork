import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Fuliza from './pages/Fuliza';
import UploadPage from './pages/Upload';
import Chat from './pages/Chat';
import Login from './pages/Login';
import { useState } from 'react';

function AppShell() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/fuliza" element={<Fuliza />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem('authed') === '1');

  const handleLogin = () => {
    localStorage.setItem('authed', '1');
    setAuthed(true);
  };

  return (
    <ThemeProvider>
      <BrowserRouter>
        {authed ? (
          <AppShell />
        ) : (
          <Routes>
            <Route path="*" element={<Login onLogin={handleLogin} />} />
          </Routes>
        )}
      </BrowserRouter>
    </ThemeProvider>
  );
}
