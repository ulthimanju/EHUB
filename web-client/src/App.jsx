import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, PublicRoute } from './layouts/MainLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import BrowseEvents from './pages/BrowseEvents'
import CreateEvent from './pages/CreateEvent'
import AddProblemStatement from './pages/AddProblemStatement'
import EventDetails from './pages/EventDetails'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/events/browse" element={<BrowseEvents />} />
            <Route path="/events/create" element={<CreateEvent />} />
            <Route path="/events/:eventId/edit" element={<CreateEvent />} />
            <Route path="/events/:eventId" element={<EventDetails />} />
            <Route path="/events/:eventId/add-problem" element={<AddProblemStatement />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App