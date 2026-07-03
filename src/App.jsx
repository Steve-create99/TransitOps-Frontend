// ============================================================
// App.jsx — Root application component
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';

/**
 * App — wraps the entire application in BrowserRouter and
 * delegates all route rendering to AppRouter.
 */
export default function App() {
  return (
    // BrowserRouter provides URL-based routing context to the whole app
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
