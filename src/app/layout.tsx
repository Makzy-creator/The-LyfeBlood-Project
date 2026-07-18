'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProvider } from '@/context/AppContext'
import { Toaster } from 'sonner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <div className="lb-viewport">
              <div className="lb-frame">{children}</div>
            </div>
            <Toaster position="bottom-right" />
            <link rel="preconnect" href="https://ka-p.fontawesome.com" crossOrigin="anonymous" />
            <link
              rel="stylesheet"
              href="https://ka-p.fontawesome.com/releases/v6.3.0/css/pro.min.css?token=2c15cc0cc7"
              crossOrigin="anonymous"
            />
          </AppProvider>
        </QueryClientProvider>
        <style jsx global>{`
          html,
          body {
            margin: 0;
            padding: 0;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            font-family:
              'Inter',
              system-ui,
              -apple-system,
              sans-serif;
          }
          *,
          *::before,
          *::after {
            box-sizing: border-box;
          }

          .lb-viewport {
            --lb-frame-max-width: 480px;
            min-height: 100vh;
            overflow-x: hidden;
            background-color: #f4f4f4;
            position: relative;
          }

          .lb-frame {
            width: 100%;
            max-width: var(--lb-frame-max-width);
            min-height: 100vh;
            margin-inline: auto;
            background-color: #f4f4f4;
            position: relative;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
            isolation: isolate;
          }

          @media (min-width: 768px) {
            .lb-viewport {
              --lb-frame-max-width: 1100px;
              background-color: #dcdcdc;
              background-image: radial-gradient(
                ellipse 70% 100% at 50% 0%,
                #e8e8e8 0%,
                #d0d0d0 100%
              );
            }
            .lb-frame {
              box-shadow:
                0 0 0 1px #c8c8c8,
                0 4px 6px -1px rgba(0, 0, 0, 0.08),
                0 20px 60px -10px rgba(0, 0, 0, 0.16);
              border-left: 1px solid #c8c8c8;
              border-right: 1px solid #c8c8c8;
            }
          }

          p,
          h1,
          h2,
          h3,
          h4,
          h5,
          h6,
          span,
          label,
          li {
            word-break: break-word;
            overflow-wrap: anywhere;
            white-space: normal;
          }

          input,
          select,
          textarea {
            display: block;
            width: 100%;
            max-width: 100%;
          }

          input:focus,
          select:focus,
          textarea:focus {
            outline: none;
            border-color: #c0392b !important;
            box-shadow: 0 0 0 3px #fadbd8;
          }

          button,
          a {
            -webkit-tap-highlight-color: transparent;
          }

          @keyframes pulse {
            0%,
            100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.5;
              transform: scale(0.85);
            }
          }
          @keyframes pulseDot {
            0%,
            100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.4;
              transform: scale(0.75);
            }
          }
          @keyframes slideDown {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          @keyframes sheetUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
          @keyframes popIn {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          @keyframes gpsPulse {
            0%,
            100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.4;
              transform: scale(0.75);
            }
          }
          @keyframes pinBounce {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-4px);
            }
          }
          @keyframes timerPulse {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}</style>
      </body>
    </html>
  )
}
