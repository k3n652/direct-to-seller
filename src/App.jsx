import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Tool from "./Tool";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Tool />} />
      </Routes>
    </BrowserRouter>
  );
}
