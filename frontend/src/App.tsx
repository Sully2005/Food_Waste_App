import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components/Layout";
import { PreferencesProvider } from "./context/PreferencesProvider";
import { HomePage } from "./pages/HomePage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { PreferencesPage } from "./pages/PreferencesPage";
import { ScanPage } from "./pages/ScanPage";
import { WelcomePage } from "./pages/WelcomePage";
import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <WelcomePage /> },
      { path: "onboarding", element: <OnboardingPage /> },
      { path: "home", element: <HomePage /> },
      { path: "scan", element: <ScanPage /> },
      { path: "preferences", element: <PreferencesPage /> },
    ],
  },
]);

export default function App() {
  return (
    <PreferencesProvider>
      <RouterProvider router={router} />
    </PreferencesProvider>
  );
}
