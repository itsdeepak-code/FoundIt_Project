import { Route, Routes } from 'react-router';
import MainLayout from './layouts/MainLayout.jsx';
import BrowsePage from './pages/BrowsePage.jsx';
import ClaimDetailsPage from './pages/ClaimDetailsPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import IncomingClaimsPage from './pages/IncomingClaimsPage.jsx';
import ItemDetailsPage from './pages/ItemDetailsPage.jsx';
import ItemFormPage from './pages/ItemFormPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import { GuestRoute, ProtectedRoute } from './routes/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="items" element={<BrowsePage />} />
        <Route path="items/:id" element={<ItemDetailsPage />} />

        <Route element={<GuestRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="items/new" element={<ItemFormPage />} />
          <Route path="items/:id/edit" element={<ItemFormPage />} />
          <Route path="items/:id/claims" element={<IncomingClaimsPage />} />
          <Route path="claims/:id" element={<ClaimDetailsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
