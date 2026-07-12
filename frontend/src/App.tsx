import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FleetProvider } from './context/FleetContext';
import { DriverProvider } from './context/DriverContext';
import { AppRoutes } from './routes/AppRoutes';
import { Toaster } from 'sonner';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FleetProvider>
          <DriverProvider>
            <AppRoutes />
            <Toaster position="top-right" closeButton richColors duration={4000} />
          </DriverProvider>
        </FleetProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
