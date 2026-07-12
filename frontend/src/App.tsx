import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FleetProvider } from './context/FleetContext';
import { DriverProvider } from './context/DriverContext';
import { TripProvider } from './context/TripContext';
import { AppRoutes } from './routes/AppRoutes';
import { Toaster } from 'sonner';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FleetProvider>
          <DriverProvider>
            <TripProvider>
              <AppRoutes />
              <Toaster position="top-right" closeButton richColors duration={4000} />
            </TripProvider>
          </DriverProvider>
        </FleetProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
