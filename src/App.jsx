// ============================================================
// App.jsx — Root application component
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppRouter from './routes/AppRouter';

/**
 * App — wraps the entire application in AppProvider and BrowserRouter
 * and delegates all route rendering to AppRouter.
 */
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AppProvider>
  );
}
