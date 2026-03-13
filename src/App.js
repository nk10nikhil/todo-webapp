import { lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
const HomePage = lazy(() => import("./components/HomePage"));

function App() {
  return (
    <AppProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route exact path="/" element={<HomePage />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
