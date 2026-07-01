"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "@/context/AppContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        {/*
         * lb-viewport — full viewport shell
         * • overflow-x: hidden stops horizontal shaking on mobile
         * • background shifts slightly on desktop to frame the app column
         */}
        <div className="lb-viewport">
          {/*
           * lb-frame — the 480px app column
           * • mobile: w-full, rounded-none, no border/shadow
           * • desktop (≥768px): centered, shadow-2xl, border-x
           */}
          <div className="lb-frame">{children}</div>
        </div>

        {/* ── GLOBAL DESIGN SYSTEM CSS ──────────────────────────────── */}
        <style jsx global>{`
          /* ── Reset & base ─────────────────────────────────── */
          html, body {
            margin: 0;
            padding: 0;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
          }
          *, *::before, *::after {
            box-sizing: border-box;
          }

          /* ── Viewport shell ───────────────────────────────── */
          .lb-viewport {
            min-height: 100vh;
            overflow-x: hidden;
            background-color: #F4F4F4;
            position: relative;
          }

          /* ── App column — mobile default ──────────────────── */
          .lb-frame {
            width: 100%;
            max-width: 480px;
            min-height: 100vh;
            margin-inline: auto;
            background-color: #F4F4F4;
            position: relative;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
            /* Ensure children with position:sticky work within scroll */
            isolation: isolate;
          }

          /* ── Desktop frame — ≥768px breakpoint ────────────── */
          @media (min-width: 768px) {
            .lb-viewport {
              background-color: #DCDCDC;
              /* Subtle inner vignette to push visual focus to center */
              background-image: radial-gradient(
                ellipse 70% 100% at 50% 0%,
                #E8E8E8 0%,
                #D0D0D0 100%
              );
            }
            .lb-frame {
              box-shadow:
                0 0 0 1px #C8C8C8,
                0 4px 6px -1px rgba(0,0,0,0.08),
                0 20px 60px -10px rgba(0,0,0,0.16);
              border-left: 1px solid #C8C8C8;
              border-right: 1px solid #C8C8C8;
            }
          }

          /* ── Typography — force predictable text flow ─────── */
          p, h1, h2, h3, h4, h5, h6, span, label, li {
            word-break: break-word;
            overflow-wrap: anywhere;
            white-space: normal;
          }

          /* ── Form stacking guard ──────────────────────────── */
          input, select, textarea {
            display: block;
            width: 100%;
            max-width: 100%;
          }

          /* ── Smooth focus ring consistent with design tokens  */
          input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #C0392B !important;
            box-shadow: 0 0 0 3px #FADBD8;
          }

          /* ── Suppress iOS tap highlight ───────────────────── */
          button, a {
            -webkit-tap-highlight-color: transparent;
          }

          /* ── Keyframes shared across all screens ──────────── */
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%       { opacity: 0.5; transform: scale(0.85); }
          }
          @keyframes pulseDot {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%       { opacity: 0.4; transform: scale(0.75); }
          }
          @keyframes slideDown {
            from { transform: translateY(-100%); opacity: 0; }
            to   { transform: translateY(0);     opacity: 1; }
          }
          @keyframes sheetUp {
            from { transform: translateY(100%); }
            to   { transform: translateY(0);    }
          }
          @keyframes popIn {
            0%   { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes gpsPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%       { opacity: 0.4; transform: scale(0.75); }
          }
          @keyframes pinBounce {
            0%, 100% { transform: translateY(0); }
            50%       { transform: translateY(-4px); }
          }
          @keyframes timerPulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.5; }
          }
        `}</style>
      </AppProvider>
    </QueryClientProvider>
  );
}
