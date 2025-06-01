import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LoginPage from "./Pages/Login/LoginPage";
import Register from "./Pages/Register/Register";
import AIChat from "./Pages/AIChat/AIChat";
import { Navbar } from "./Components/Navbar/Navbar";
import { ThemeProvider } from "./Context/ThemeContext";
import { MyCases } from "./Pages/MyCases/MyCases";
import { SearchProvider } from "./Context/SearchContext";
import { SearchResults } from "./Pages/SearchResults/SearchResults";
import { AuthProvider, useAuth } from "./Context/AuthContext";
import { ProtectedRoute } from "./Components/ProtectedRoute/ProtectedRoute";
import Profile from "./Pages/Profile";
import ProfileCreatePage from "./Pages/ProfileCreatePage/ProfileCreatePage";
import { Home } from "@mui/icons-material";
import HomePage from "./Pages/HomePage/HomePage";
import CourtroomPage from "./Pages/Courtroom/CourtroomPage";
import DocumentSummaryChat from "./Pages/DocumentSummaryChat/DocumentSummaryChat";
import { NotificationsPage } from "./Pages/NotificationsPage/NotifcationsPage";
import ClientCaseRequestsPage from "./Pages/ClientCaseRequestPage/ClientCaseRequestPage";
import SingleCasePage from "./Pages/SingleCasePage/SingleCasePage";
import { TinyCats } from "./Pages/TinyCats/TinyCats";
import QuizPage from "./Pages/QuizPage/QuizPage";

function AppContent() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navbar />
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-cases"
          element={
            <ProtectedRoute>
              <Navbar />
              <MyCases />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client-request-page"
          element={
            <ProtectedRoute>
              <Navbar />
              <ClientCaseRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/qa"
          element={
            <ProtectedRoute>
              <Navbar />
              <AIChat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Navbar />
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courtroom"
          element={
            <ProtectedRoute>
              <Navbar />
              <CourtroomPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/summarize"
          element={
            <ProtectedRoute>
              <Navbar />
              <DocumentSummaryChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-profile"
          element={
            <ProtectedRoute>
              <Navbar />
              <ProfileCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search-results"
          element={
            <ProtectedRoute>
              <Navbar />
              <SearchResults />
            </ProtectedRoute>
          }
        />

        <Route
          path="/case/:caseId"
          element={
            <ProtectedRoute>
              <Navbar />
              <SingleCasePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/legalcats"
          element={
            <ProtectedRoute>
              <Navbar />
              <TinyCats />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Navbar />
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz"
          element={
            <ProtectedRoute>
              <Navbar />
              <QuizPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <SearchProvider>
            <AppContent />
          </SearchProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
