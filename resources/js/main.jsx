import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout, GuestLayout, HomeRedirect, LearnerLayout, RequireAuth } from './components/Layouts';
import { AuthProvider } from './context/AuthContext';
import ForgotPassword from './pages/auth/ForgotPassword';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import Profile from './pages/Profile';
import VerifyCertificate from './pages/VerifyCertificate';
import Attempts from './pages/learner/Attempts';
import AttemptShow from './pages/learner/AttemptShow';
import Certificates from './pages/learner/Certificates';
import CourseShow from './pages/learner/CourseShow';
import Dashboard from './pages/learner/Dashboard';
import Formations from './pages/learner/Formations';
import FormationShow from './pages/learner/FormationShow';
import QuizShow from './pages/learner/QuizShow';
import AdminAttempts from './pages/admin/Attempts';
import AdminAttemptShow from './pages/admin/AttemptShow';
import AdminCertificates from './pages/admin/Certificates';
import AdminDashboard from './pages/admin/Dashboard';
import AdminFormations from './pages/admin/Formations';
import AdminFormationShow from './pages/admin/FormationShow';
import AdminQuizzes from './pages/admin/Quizzes';
import AdminQuizShow from './pages/admin/QuizShow';
import AdminStatistics from './pages/admin/Statistics';
import AdminUsers from './pages/admin/Users';
import AdminUserShow from './pages/admin/UserShow';

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/verify/:number?" element={<VerifyCertificate />} />

            <Route element={<GuestLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            <Route
                element={
                    <RequireAuth>
                        <LearnerLayout />
                    </RequireAuth>
                }
            >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/formations" element={<Formations />} />
                <Route path="/formations/:id" element={<FormationShow />} />
                <Route path="/courses/:id" element={<CourseShow />} />
                <Route path="/quizzes/:id" element={<QuizShow />} />
                <Route path="/attempts" element={<Attempts />} />
                <Route path="/attempts/:id" element={<AttemptShow />} />
                <Route path="/certificates" element={<Certificates />} />
                <Route path="/profile" element={<Profile />} />
            </Route>

            <Route
                path="/admin"
                element={
                    <RequireAuth staff>
                        <AdminLayout />
                    </RequireAuth>
                }
            >
                <Route index element={<AdminDashboard />} />
                <Route path="statistics" element={<AdminStatistics />} />
                <Route path="users" element={<RequireAuth admin><AdminUsers /></RequireAuth>} />
                <Route path="users/:id" element={<RequireAuth admin><AdminUserShow /></RequireAuth>} />
                <Route path="formations" element={<AdminFormations />} />
                <Route path="formations/:id" element={<AdminFormationShow />} />
                <Route path="quizzes" element={<AdminQuizzes />} />
                <Route path="quizzes/:id" element={<AdminQuizShow />} />
                <Route path="attempts" element={<AdminAttempts />} />
                <Route path="attempts/:id" element={<AdminAttemptShow />} />
                <Route path="certificates" element={<RequireAuth admin><AdminCertificates /></RequireAuth>} />
                <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

createRoot(document.getElementById('app')).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
);
