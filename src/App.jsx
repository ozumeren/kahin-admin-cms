// admin-cms/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MarketsManagePage from './pages/MarketsManagePage'
import UsersManagePage from './pages/UsersManagePage'
import CreateMarketPage from './pages/CreateMarketPage'
import MarketHealthPage from './pages/MarketHealthPage'
import MarketResolutionPage from './pages/MarketResolutionPage'
import DisputeManagementPage from './pages/DisputeManagementPage'
import TreasuryPage from './pages/TreasuryPage'
import TransactionsPage from './pages/TransactionsPage'
import WithdrawalsPage from './pages/WithdrawalsPage'
import DepositsPage from './pages/DepositsPage'
import './index.css'
import './styles.css'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Admin Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="markets" element={<MarketsManagePage />} />
              <Route path="markets/create" element={<CreateMarketPage />} />
              <Route path="market-health" element={<MarketHealthPage />} />
              <Route path="market-resolution" element={<MarketResolutionPage />} />
              <Route path="disputes" element={<DisputeManagementPage />} />
              <Route path="treasury" element={<TreasuryPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="withdrawals" element={<WithdrawalsPage />} />
              <Route path="deposits" element={<DepositsPage />} />
              <Route path="users" element={<UsersManagePage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#111111',
              color: '#ffffff',
              border: '1px solid #333333',
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App