import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider } from "./AppContext";
import { ValidationProvider } from "./state/ValidationContext";
import { VoiceProvider } from "./features/voice/VoiceContext";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import LearnDashboard from "./features/learning/LearnDashboard";
import VoiceTranscriptBar from "./features/voice/VoiceTranscriptBar";
import VoiceHelpPanel from "./features/voice/VoiceHelpPanel";

function Layout() {
  const { pathname } = useLocation();
  const studyViewportLock = pathname.startsWith("/doctor/study");

  return (
    <>
      <Navbar />
      <main className={`app-container${studyViewportLock ? " app-container--study-viewport" : ""}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/doctor/results" element={<Navigate to="/doctor/study/results" replace />} />
          <Route path="/doctor/clinical" element={<Navigate to="/doctor/study/clinical" replace />} />
          <Route path="/doctor/*" element={<DoctorDashboard />} />
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/learn" element={<LearnDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <VoiceTranscriptBar />
      <VoiceHelpPanel />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ValidationProvider>
        <VoiceProvider>
          <Layout />
        </VoiceProvider>
      </ValidationProvider>
    </AppProvider>
  );
}

