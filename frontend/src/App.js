import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HyperliquidTracker from "./pages/HyperliquidTracker";

// BACKEND URL
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8001';
const API = `${API_BASE}/api`;

// THIS IS WHERE OUR WEBSITE IS HOSTED, [ generate share links relative to this url ]
const MY_HOMEPAGE_URL = API_BASE?.match(/-([a-z0-9]+)\./)?.[1]
  ? `https://${API_BASE?.match(/-([a-z0-9]+)\./)?.[1]}.previewer.live`
  : window.location.origin;

console.log(`MY_HOMEPAGE_URL: ${MY_HOMEPAGE_URL}`);

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HyperliquidTracker />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
