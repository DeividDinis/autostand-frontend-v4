import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, RoleRoute, StaffRoute, CustomerRoute } from './routes/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { VehiclesPage, ClientsPage, StandsPage, UsersPage, ProcessesPage, ContractsPage, PaymentsPage, RentalReturnsPage, TransfersPage } from './pages/EntityListPages';
import { VehicleFormPage, ClientFormPage, StandFormPage, ProcessFormPage, PaymentFormPage, ReturnFormPage, TransferFormPage, UserFormPage, SaleContractFormPage, RentalContractFormPage } from './pages/FormPages';
import { VehicleDetailPage, ClientDetailPage, StandDetailPage, GenericDetailPage, TransferDetailPage } from './pages/DetailPages';
import { ReportsIndex, ReportDetailPage } from './pages/ReportsPages';
import { AuditPage } from './pages/AuditPage';
import { ProfilePage, SettingsPage } from './pages/MiscPages';
import { CustomerCatalogPage, CustomerVehicleDetailPage } from './pages/CustomerCatalogPage';

export default function App() {
  return <AuthProvider><BrowserRouter><Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/catalog" element={<CustomerCatalogPage />} />
    <Route path="/catalog/vehicles/:id" element={<CustomerVehicleDetailPage />} />
    <Route path="/login" element={<LoginPage />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<StaffRoute />}>
        <Route element={<AppLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="vehicles/:id" element={<VehicleDetailPage />} />
          <Route element={<RoleRoute roles={['ADMIN_GLOBAL', 'MINI_ADMIN']} />}>
            <Route path="vehicles/new" element={<VehicleFormPage />} />
            <Route path="vehicles/:id/edit" element={<VehicleFormPage />} />
          </Route>
          <Route path="clients" element={<ClientsPage />} />
          <Route path="clients/new" element={<ClientFormPage />} />
          <Route path="clients/:id" element={<ClientDetailPage />} />
          <Route path="processes" element={<ProcessesPage />} />
          <Route path="processes/new" element={<ProcessFormPage />} />
          <Route path="processes/:id" element={<GenericDetailPage kind="process" />} />
          <Route path="sales" element={<ContractsPage type="SALE" />} />
          <Route path="sales/:id" element={<GenericDetailPage kind="contract" />} />
          <Route path="rentals" element={<ContractsPage type="RENTAL" />} />
          <Route path="rentals/:id" element={<GenericDetailPage kind="contract" />} />
          <Route path="contracts" element={<ContractsPage />} />
          <Route path="contracts/:id" element={<GenericDetailPage kind="contract" />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="payments/new" element={<PaymentFormPage />} />
          <Route path="rental-returns" element={<RentalReturnsPage />} />
          <Route path="rental-returns/new" element={<ReturnFormPage />} />
          <Route path="contracts/sale/new" element={<SaleContractFormPage />} />
          <Route path="contracts/rental/new" element={<RentalContractFormPage />} />
          <Route path="profile" element={<ProfilePage />} />

          <Route element={<RoleRoute roles={['ADMIN_GLOBAL', 'MINI_ADMIN']} />}>
            <Route path="transfers" element={<TransfersPage />} />
            <Route path="transfers/new" element={<TransferFormPage />} />
            <Route path="transfers/:id" element={<TransferDetailPage />} />
            <Route path="stands" element={<StandsPage />} />
            <Route path="stands/:id" element={<StandDetailPage />} />
          </Route>

          <Route element={<RoleRoute roles={['ADMIN_GLOBAL']} />}>
            <Route path="stands/new" element={<StandFormPage />} />
            <Route path="stands/:id/edit" element={<StandFormPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/new" element={<UserFormPage />} />
            <Route path="users/:id" element={<GenericDetailPage kind="user" />} />
            <Route path="reports" element={<ReportsIndex />} />
            <Route path="reports/:type" element={<ReportDetailPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route element={<RoleRoute roles={['ADMIN_GLOBAL', 'MINI_ADMIN']} />}>
            <Route path="audit" element={<AuditPage />} />
          </Route>
        </Route>
      </Route>

      <Route element={<CustomerRoute />}>
        <Route path="portal" element={<CustomerCatalogPage />} />
        <Route path="portal/vehicles/:id" element={<CustomerVehicleDetailPage />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter></AuthProvider>;
}
