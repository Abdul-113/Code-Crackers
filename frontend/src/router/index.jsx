import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

// Root Wrapper (houses LenisProvider)
import RootWrapper from '../components/common/RootWrapper';
import ProtectedRoute from '../components/common/ProtectedRoute';
import RoleHome from '../components/common/RoleHome';

// Public standalone pages (no sidebar layout)
import Landing        from '../pages/Landing/Landing';
import Login          from '../pages/Authentication/Login';
import Signup         from '../pages/Authentication/Signup';
import ForgotPassword from '../pages/Authentication/ForgotPassword';
import Onboarding     from '../pages/Onboarding/Onboarding';
import PartnerPortal  from '../pages/PartnerPortal/PartnerPortal';

// App layout (with sidebar) — used for authenticated app screens
import AppLayout      from '../components/layout/AppLayout';
import Dashboard      from '../pages/Dashboard/Dashboard';
import MSME           from '../pages/MSME/MSME';
import Investor       from '../pages/Investor/Investor';
import Buyer          from '../pages/Buyer/Buyer';
import Admin          from '../pages/Admin/Admin';
import Marketplace    from '../pages/Marketplace/Marketplace';
import Analytics      from '../pages/Analytics/Analytics';
import Activity       from '../pages/Activity/Activity';
import Profile        from '../pages/Profile/Profile';
import Blockchain     from '../pages/Blockchain/Blockchain';
import Copilot        from '../pages/Copilot/Copilot';
import InvoiceDetails from '../pages/InvoiceDetails/InvoiceDetails';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootWrapper />,
    children: [
      // ── Public pages (standalone, no sidebar) ──────────────────────────────────
      {
        path: '',
        element: <Landing />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'signup',
        element: <Signup />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'partner',
        element: <PartnerPortal />,
      },

      // ── Protected Onboarding Journey ───────────────────────────────────────────
      {
        path: 'onboarding',
        element: (
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        ),
      },

      // ── Protected App pages (wrapped in AppLayout with sidebar) ───────────────
      {
        path: 'app',
        element: (
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true,         element: <RoleHome />      },
          { path: 'dashboard',   element: <Dashboard />   },
          { path: 'msme',        element: <MSME />        },
          { path: 'investor',    element: <Investor />    },
          { path: 'buyer',       element: <Buyer />       },
          { path: 'admin',       element: <Admin />       },
          { path: 'marketplace', element: <Marketplace /> },
          { path: 'analytics',   element: <Analytics />   },
          { path: 'activity',    element: <Activity />    },
          { path: 'blockchain',  element: <Blockchain />  },
          { path: 'copilot',     element: <Copilot />     },
          { path: 'invoice/:invoiceId', element: <InvoiceDetails /> },
          { path: 'profile',     element: <Profile />     },
        ],
      },
    ],
  },
]);
