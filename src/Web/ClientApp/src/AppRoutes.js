import React from 'react';
import { Home } from "./components/Home";
import { Tickets } from "./components/Tickets";
import { Reports } from "./components/Reports";
import { AdminPanel } from "./components/AdminPanel";
import { TicketDetails } from "./components/TicketDetails";
import { Profile } from "./components/Profile";

const AppRoutes = [
  {
    index: true,
    element: <Home />
  },
  {
    path: '/tickets',
    element: <Tickets />
  },
  {
    path: '/tickets/:id',
    element: <TicketDetails />
  },
  {
    path: '/reports',
    element: <Reports />
  },
  {
    path: '/admin',
    element: <AdminPanel />
  },
  {
    path: '/profile',
    element: <Profile />
  }
];

export default AppRoutes;
