import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import "./App.css";

import Layout from "./components/Layout/Layout.jsx";
import HomeDashboard from "./pages/Dashboard/HomeDashboard.jsx";
import SearchPage from "./pages/Search/SearchPage.jsx";
import CompanyProfile from "./pages/CompanyProfile/CompanyProfile.jsx";
import ComparePage from "./pages/ComparePage/ComparePage.jsx";
import { ToastProvider } from "./context/ToastContext";

function App() {
  const [count, setCount] = useState(0);

  return (
    <ToastProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomeDashboard />} />
            <Route path="/search" element={<SearchPage />} />

            {/* ✅ Dynamic company profile route */}
            <Route
              path="/companies/:companyId"
              element={<CompanyProfile />}
            />

            <Route path="/compare" element={<ComparePage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
