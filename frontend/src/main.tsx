import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from "@/context/AuthContext.tsx";
import {ThemeProvider} from "@/context/ThemeContext.tsx";
import {TooltipProvider} from "@/components/ui/tooltip.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
        <ThemeProvider>
            <AuthProvider>
                <TooltipProvider>
                    <App />
                </TooltipProvider>
            </AuthProvider>
        </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
