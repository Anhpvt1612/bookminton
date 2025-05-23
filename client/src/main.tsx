import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.title = "BadmintonHub - Nền tảng đặt sân cầu lông";

createRoot(document.getElementById("root")!).render(<App />);
