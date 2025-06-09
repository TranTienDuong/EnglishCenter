import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import Home from "./Home/Home.jsx";
import Error from "./Error/Error.jsx";
import Login from "./Login/Login";
import ProtectedRoute from "./Management/ProtectedRoute.jsx";
import Dashboard from "./Management/Dashboard/Dashboard.jsx";
import Test from "./Test/Test";

// Khởi tạo router
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <Error />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/test",
    element: <Test />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [],
  },
]);

// Gắn vào root và bao trong StrictMode
createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
