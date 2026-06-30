import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CreateGamePage } from "@wordshift/pages/CreateGamePage";
import { JoinGamePage } from "@wordshift/pages/JoinGamePage";
import { ResultsPage } from "@wordshift/pages/ResultsPage";
import { RoomPage } from "@wordshift/pages/RoomPage";
import { WordShiftPage } from "@wordshift/pages/WordShiftPage";
import { Layout } from "./components/Layout";
import { LandingPage } from "./pages/LandingPage";

export function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/wordshift" element={<WordShiftPage />} />
          <Route path="/create" element={<CreateGamePage />} />
          <Route path="/join" element={<JoinGamePage />} />
          <Route path="/join/:roomCode" element={<JoinGamePage />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="/room/:roomId/play" element={<RoomPage />} />
          <Route path="/room/:roomId/results" element={<ResultsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
