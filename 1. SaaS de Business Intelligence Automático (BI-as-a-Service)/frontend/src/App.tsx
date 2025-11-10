import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Demo from './pages/Demo'
import Dashboard from './pages/Dashboard'
import Pricing from './pages/Pricing'
import Dashboards from './pages/Dashboards'
import DashboardView from './pages/DashboardView'
import DataSources from './pages/DataSources'
import Insights from './pages/Insights'
import Reports from './pages/Reports'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
      <Routes>
        {/* Public routes with layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
        </Route>

        {/* Auth routes without layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/demo" element={<Demo />} />

        {/* Protected routes with layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboards" element={<Dashboards />} />
          <Route path="/dashboards/:id" element={<DashboardView />} />
          <Route path="/datasources" element={<DataSources />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
