import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { AuthProvider } from '@/features/auth/api/AuthContext';
import { useAuth } from '@/features/auth/api/useAuth';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { BookingSuccessPage } from '@/features/booking/pages/BookingSuccessPage';
import { PassengerInfoPage } from '@/features/booking/pages/PassengerInfoPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { FlightDetailsPage } from '@/features/flights/pages/FlightDetailsPage';
import { HomePage } from '@/features/flights/pages/HomePage';
import { ResultsPage } from '@/features/flights/pages/ResultsPage';
import { PaymentPage } from '@/features/payment/pages/PaymentPage';
import { AppLayout } from '@/shared/ui/AppLayout';
import { LoadingState } from '@/shared/ui/StatusView';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingState label="Checking your session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/flights" element={<ResultsPage />} />
            <Route path="/flights/:flightId" element={<FlightDetailsPage />} />
            <Route
              path="/booking/passengers"
              element={
                <ProtectedRoute>
                  <PassengerInfoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking/payment"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking/success"
              element={
                <ProtectedRoute>
                  <BookingSuccessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
