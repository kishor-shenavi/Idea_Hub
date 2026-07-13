import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOTP';
import Projects from './pages/Projects';
import Chat from './pages/Chat';
import SeniorPaths from './pages/SeniorPaths';
import Internships from './pages/Internships';
import RegretBoard from './pages/RegretBoard';
import Roadmap from './pages/Roadmap';
import ResumeScan from './pages/ResumeScan';
import MockInterview from './pages/MockInterview';

import CreateProject from './components/CreateProject';
import EditProject from './components/EditProject';
import AdminPanel from './components/AdminPanel';
import GithubIntelligence from './pages/GithubIntelligence';
import ExtemporeCoach from './pages/ExtemporeCoach';
import GDSimulator from './pages/GDSimulator';
import './index.css';

function AppContent() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/paths" element={<SeniorPaths />} />
        <Route path="/internships" element={<Internships />} />
        <Route path="/regrets" element={<RegretBoard />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/projects/create" element={<CreateProject />} />
          <Route path="/projects/:id/edit" element={<EditProject />} />
          <Route path="/chat/:projectId" element={<Chat />} />
          <Route path="/chat/:projectId/:userId" element={<Chat />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/resume" element={<ResumeScan />} />
          <Route path="/interview" element={<MockInterview />} />
          <Route path="/github-intelligence" element={<GithubIntelligence />} />
          <Route path="/extempore-coach" element={<ExtemporeCoach />} />
          <Route path="/gd-simulator" element={<GDSimulator />} />
        </Route>

        {/* Admin */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>404</div>
            <p style={{ color: 'var(--muted)' }}>Page not found</p>
          </div>
        } />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
