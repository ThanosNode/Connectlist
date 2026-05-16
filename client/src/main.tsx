import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { ModalProvider } from "./context/ModalContext";
import { LocationProvider } from "./context/LocationContext";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <ModalProvider>
      <LocationProvider>
        <App />
      </LocationProvider>
    </ModalProvider>
  </AuthProvider>
);
