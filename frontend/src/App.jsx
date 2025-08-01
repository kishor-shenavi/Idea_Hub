import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute'; // You'll need to create this
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Projects from './pages/Projects';
//import ProjectDetail from './pages/ProjectDetail';
import CreateProject from './components/CreateProject';
import EditProject from './components/EditProject';
import AdminPanel from './components/AdminPanel';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';
import SetUsername from './components/Set_username'; // You'll need to create this
//import ProjectCard from './components/ProjectCard';
//import { GoogleOAuthProvider } from '@react-oauth/google';
import VerifyOtp from './pages/VerifyyOTP';
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />

               <Route path="/set-username" element={<SetUsername />} />
              {/* <Route path="/projects/:id" element={<ProjectCard />} /> */}
              
              {/* Protected routes (require authentication) */}
              <Route element={<ProtectedRoute />}>
             

                <Route path="/projects/create" element={<CreateProject />} />
                 <Route path="/chat/:projectId/:userId" element={<Chat />} />

                <Route path="/projects/:id/edit" element={<EditProject />} />
              </Route>
              
              {/* Admin-only routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminPanel />} />
              </Route>
            </Routes>
         

          </main>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;