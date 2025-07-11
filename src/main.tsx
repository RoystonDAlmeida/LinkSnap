import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { LinksProvider } from './context/LinksContext';

createRoot(document.getElementById("root")!).render(
  <LinksProvider>
    <App />
  </LinksProvider>
);
