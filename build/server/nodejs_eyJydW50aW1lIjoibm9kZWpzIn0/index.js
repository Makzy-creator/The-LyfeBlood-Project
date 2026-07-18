import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withErrorBoundaryProps, UNSAFE_withComponentProps, Outlet, useRouteError, useAsyncError, useNavigate, useLocation, Meta, Links, ScrollRestoration, Scripts } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { useButton } from "@react-aria/button";
import { useState, useRef, useEffect, useCallback, Component, createContext, useContext, useMemo } from "react";
import { SessionProvider, signIn } from "@hono/auth-js/react";
import { toPng } from "html-to-image";
import { serializeError } from "serialize-error";
import { toast, Toaster } from "sonner";
import { useIdleTimer } from "react-idle-timer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { Droplets, Clock, Heart, AlertTriangle, Users, ChevronRight, Shield, ArrowRight, Bell, Home, ClipboardList, User, Plus, Trash2, LogOut, X, ChevronLeft, Award, MapPin, CheckCircle2, Circle, Building2, Navigation, MessageCircle, Radio, RefreshCw, EyeOff, Eye, AlertCircle, Send, Upload, ClipboardCheck, ShieldCheck, Phone, Flag } from "lucide-react";
import { useNavigate as useNavigate$1, useParams, useLocation as useLocation$1 } from "react-router-dom";
import fg from "fast-glob";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
function LoadFonts() {
  return /* @__PURE__ */ jsx(Fragment, {});
}
const originalFetch = fetch;
const isBackend = () => typeof window === "undefined";
const safeStringify = (value) => JSON.stringify(value, (_k, v) => {
  if (v instanceof Date) return { __t: "Date", v: v.toISOString() };
  if (v instanceof Error)
    return { __t: "Error", v: { name: v.name, message: v.message, stack: v.stack } };
  return v;
});
const postToParent = (level, text, extra) => {
  try {
    if (isBackend() || !window.parent || window.parent === window) {
      const consoleMethod = console[level];
      if (typeof consoleMethod === "function") {
        consoleMethod(text, extra);
      } else {
        console.log(text, extra);
      }
      return;
    }
    window.parent.postMessage(
      {
        type: "sandbox:web:console-write",
        __viteConsole: true,
        level,
        text,
        args: [safeStringify(extra)]
      },
      "*"
    );
  } catch {
  }
};
const getUrlFromArgs = (...args) => {
  const [input] = args;
  if (typeof input === "string") return input;
  if (input instanceof Request) return input.url;
  return `${input.protocol}//${input.host}${input.pathname}`;
};
const isFirstPartyURL = (url) => {
  return url.startsWith("/integrations") || url.startsWith("/_create");
};
const isSecondPartyUrl = (url) => {
  return process.env.NEXT_PUBLIC_CREATE_API_BASE_URL && url.startsWith(process.env.NEXT_PUBLIC_CREATE_API_BASE_URL) || process.env.NEXT_PUBLIC_CREATE_BASE_URL && url.startsWith(process.env.NEXT_PUBLIC_CREATE_BASE_URL) || url.startsWith("https://www.create.xyz") || url.startsWith("https://api.create.xyz/") || url.startsWith("https://www.createanything.com") || url.startsWith("https://api.createanything.com");
};
const fetchWithHeaders = async (input, init) => {
  const url = getUrlFromArgs(input, init);
  const additionalHeaders = {
    "x-createxyz-project-group-id": process.env.NEXT_PUBLIC_PROJECT_GROUP_ID
  };
  const isExternalFetch = !isFirstPartyURL(url) && !isSecondPartyUrl(url);
  if (isExternalFetch || url.startsWith("/api")) {
    return originalFetch(input, init);
  }
  let finalInit;
  if (input instanceof Request) {
    const hasBody = !!input.body;
    finalInit = {
      method: input.method,
      headers: new Headers(input.headers),
      body: input.body,
      mode: input.mode,
      credentials: input.credentials,
      cache: input.cache,
      redirect: input.redirect,
      referrer: input.referrer,
      referrerPolicy: input.referrerPolicy,
      integrity: input.integrity,
      keepalive: input.keepalive,
      signal: input.signal,
      ...hasBody ? { duplex: "half" } : {},
      ...init
    };
  } else {
    finalInit = { ...init, headers: new Headers(init?.headers ?? {}) };
  }
  const finalHeaders = new Headers(finalInit.headers);
  for (const [key, value] of Object.entries(additionalHeaders)) {
    if (value) finalHeaders.set(key, value);
  }
  finalInit.headers = finalHeaders;
  const prefix = !isSecondPartyUrl(url) ? isBackend() ? process.env.NEXT_PUBLIC_CREATE_BASE_URL ?? "https://www.create.xyz" : "" : "";
  try {
    const result = await originalFetch(`${prefix}${url}`, finalInit);
    if (!result.ok) {
      postToParent(
        "error",
        `Failed to load resource: the server responded with a status of ${result.status} (${result.statusText ?? ""})`,
        {
          url,
          status: result.status,
          statusText: result.statusText
        }
      );
    }
    return result;
  } catch (error) {
    postToParent("error", "Fetch error", {
      url,
      error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error
    });
    throw error;
  }
};
function useDevServerHeartbeat() {
  useIdleTimer({
    disabled: typeof window === "undefined",
    throttle: 6e4 * 3,
    timeout: 6e4,
    onAction: () => {
      fetch("/", {
        method: "GET"
      }).catch((error) => {
      });
    }
  });
}
if (typeof window !== "undefined") {
  void import("vanilla-colorful");
}
const links = () => [];
if (globalThis.window && globalThis.window !== void 0) {
  globalThis.window.fetch = fetchWithHeaders;
}
const LoadFontsSSR = LoadFonts;
function InternalErrorBoundary({
  error: errorArg
}) {
  const routeError = useRouteError();
  const asyncError = useAsyncError();
  const error = errorArg ?? asyncError ?? routeError;
  const [isOpen, setIsOpen] = useState(false);
  const shouldScale = typeof window !== "undefined" ? window.innerWidth < 768 : false;
  const scaleFactor = shouldScale ? 1.02 : 1;
  const copyButtonTextClass = shouldScale ? "text-sm" : "text-xs";
  const copyButtonPaddingClass = shouldScale ? "px-[10px] py-[5px]" : "px-[6px] py-[3px]";
  const postCountRef = useRef(0);
  const lastPostTimeRef = useRef(0);
  const lastErrorKeyRef = useRef(null);
  const MAX_ERROR_POSTS_PER_ERROR = 5;
  const THROTTLE_MS = 1e3;
  useEffect(() => {
    const serialized = serializeError(error);
    const errorKey = JSON.stringify(serialized);
    if (errorKey !== lastErrorKeyRef.current) {
      lastErrorKeyRef.current = errorKey;
      postCountRef.current = 0;
    }
    if (postCountRef.current >= MAX_ERROR_POSTS_PER_ERROR) {
      return;
    }
    const now = Date.now();
    const timeSinceLastPost = now - lastPostTimeRef.current;
    const post = () => {
      if (postCountRef.current >= MAX_ERROR_POSTS_PER_ERROR) {
        return;
      }
      postCountRef.current += 1;
      lastPostTimeRef.current = Date.now();
      window.parent.postMessage({
        type: "sandbox:error:detected",
        error: serialized
      }, "*");
    };
    if (timeSinceLastPost < THROTTLE_MS) {
      const timer = setTimeout(post, THROTTLE_MS - timeSinceLastPost);
      return () => clearTimeout(timer);
    }
    post();
  }, [error]);
  useEffect(() => {
    const animateTimer = setTimeout(() => setIsOpen(true), 100);
    return () => clearTimeout(animateTimer);
  }, []);
  const {
    buttonProps: copyButtonProps
  } = useButton({
    onPress: useCallback(() => {
      const toastScale = shouldScale ? 1.2 : 1;
      const toastStyle = {
        padding: `${16 * toastScale}px`,
        background: "#18191B",
        border: "1px solid #2C2D2F",
        color: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        width: `${280 * toastScale}px`,
        fontSize: `${13 * toastScale}px`,
        display: "flex",
        alignItems: "center",
        gap: `${6 * toastScale}px`,
        justifyContent: "flex-start",
        margin: "0 auto"
      };
      navigator.clipboard.writeText(JSON.stringify(serializeError(error)));
      toast.custom(() => /* @__PURE__ */ jsxs("div", {
        style: toastStyle,
        children: [/* @__PURE__ */ jsxs("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          viewBox: "0 0 20 20",
          fill: "currentColor",
          height: "20",
          width: "20",
          children: [/* @__PURE__ */ jsx("title", {
            children: "Success"
          }), /* @__PURE__ */ jsx("path", {
            fillRule: "evenodd",
            d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z",
            clipRule: "evenodd"
          })]
        }), /* @__PURE__ */ jsx("span", {
          children: "Copied successfully!"
        })]
      }), {
        id: "copy-error-success",
        duration: 3e3
      });
    }, [error, shouldScale])
  }, useRef(null));
  function isInIframe() {
    try {
      return window.parent !== window;
    } catch {
      return true;
    }
  }
  return /* @__PURE__ */ jsx(Fragment, {
    children: !isInIframe() && /* @__PURE__ */ jsx("div", {
      className: `fixed bottom-4 left-1/2 transform -translate-x-1/2 max-w-md z-50 transition-all duration-500 ease-out ${isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`,
      style: {
        width: "75vw"
      },
      children: /* @__PURE__ */ jsx("div", {
        className: "bg-[#18191B] text-[#F2F2F2] rounded-lg p-4 shadow-lg w-full",
        style: scaleFactor !== 1 ? {
          transform: `scale(${scaleFactor})`,
          transformOrigin: "bottom center"
        } : void 0,
        children: /* @__PURE__ */ jsxs("div", {
          className: "flex items-start gap-3",
          children: [/* @__PURE__ */ jsx("div", {
            className: "flex-shrink-0",
            children: /* @__PURE__ */ jsx("div", {
              className: "w-8 h-8 bg-[#F2F2F2] rounded-full flex items-center justify-center",
              children: /* @__PURE__ */ jsx("span", {
                className: "text-black text-[1.125rem] leading-none",
                children: "!"
              })
            })
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex flex-col gap-2 flex-1",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "flex flex-col gap-1",
              children: [/* @__PURE__ */ jsx("p", {
                className: "font-light text-[#F2F2F2] text-sm",
                children: "App Error Detected"
              }), /* @__PURE__ */ jsx("p", {
                className: "text-[#959697] text-sm font-light",
                children: "It looks like an error occurred while trying to use your app."
              })]
            }), /* @__PURE__ */ jsx("button", {
              className: `flex flex-row items-center justify-center gap-[4px] outline-none transition-colors rounded-[8px] border-[1px] bg-[#2C2D2F] hover:bg-[#414243] active:bg-[#555658] border-[#414243] text-white ${copyButtonTextClass} ${copyButtonPaddingClass} w-fit`,
              type: "button",
              ...copyButtonProps,
              children: "Copy error"
            })]
          })]
        })
      })
    })
  });
}
class ErrorBoundaryWrapper extends Component {
  state = {
    hasError: false,
    error: null
  };
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }
  componentDidCatch(error, info) {
    console.error(error, info);
  }
  render() {
    if (this.state.hasError) {
      return /* @__PURE__ */ jsx(InternalErrorBoundary, {
        error: this.state.error,
        params: {}
      });
    }
    return this.props.children;
  }
}
function LoaderWrapper({
  loader: loader2
}) {
  return /* @__PURE__ */ jsx(Fragment, {
    children: loader2()
  });
}
const ClientOnly = ({
  loader: loader2
}) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  return /* @__PURE__ */ jsx(ErrorBoundaryWrapper, {
    children: isMounted ? /* @__PURE__ */ jsx(LoaderWrapper, {
      loader: loader2
    }) : null
  });
};
function useHmrConnection() {
  const [connected, setConnected] = useState(() => false);
  useEffect(() => {
    return;
  }, []);
  return connected;
}
const healthyResponseType = "sandbox:web:healthcheck:response";
const useHandshakeParent = () => {
  const isHmrConnected = useHmrConnection();
  useEffect(() => {
    const healthyResponse = {
      type: healthyResponseType,
      healthy: isHmrConnected,
      supportsErrorDetected: true
    };
    const handleMessage = (event) => {
      if (event.data.type === "sandbox:web:healthcheck") {
        window.parent.postMessage(healthyResponse, "*");
      }
    };
    window.addEventListener("message", handleMessage);
    window.parent.postMessage(healthyResponse, "*");
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [isHmrConnected]);
};
const waitForScreenshotReady = async () => {
  const images = Array.from(document.images);
  await Promise.all([
    // make sure custom fonts are loaded
    "fonts" in document ? document.fonts.ready : Promise.resolve(),
    ...images.map((img) => new Promise((resolve) => {
      img.crossOrigin = "anonymous";
      if (img.complete) {
        resolve(true);
        return;
      }
      img.onload = () => resolve(true);
      img.onerror = () => resolve(true);
    }))
  ]);
  await new Promise((resolve) => setTimeout(resolve, 250));
};
const useHandleScreenshotRequest = () => {
  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.data.type === "sandbox:web:screenshot:request") {
        try {
          await waitForScreenshotReady();
          const width = window.innerWidth;
          const aspectRatio = 16 / 9;
          const height = Math.floor(width / aspectRatio);
          const dataUrl = await toPng(document.body, {
            cacheBust: true,
            skipFonts: false,
            width,
            height,
            style: {
              // force snapshot sizing
              width: `${width}px`,
              height: `${height}px`,
              margin: "0"
            }
          });
          window.parent.postMessage({
            type: "sandbox:web:screenshot:response",
            dataUrl
          }, "*");
        } catch (error) {
          window.parent.postMessage({
            type: "sandbox:web:screenshot:error",
            error: error instanceof Error ? error.message : String(error)
          }, "*");
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);
};
function Layout({
  children
}) {
  useHandshakeParent();
  useHandleScreenshotRequest();
  useDevServerHeartbeat();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location?.pathname;
  const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === "sandbox:navigation") {
        navigate(event.data.pathname);
      }
    };
    window.addEventListener("message", handleMessage);
    window.parent.postMessage({
      type: "sandbox:web:ready"
    }, "*");
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [navigate]);
  useEffect(() => {
    if (pathname) {
      window.parent.postMessage({
        type: "sandbox:web:navigation",
        pathname
      }, "*");
    }
  }, [pathname]);
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {}), /* @__PURE__ */ jsx("script", {
        type: "module",
        src: "/src/__create/dev-error-overlay.js"
      }), /* @__PURE__ */ jsx("link", {
        rel: "icon",
        href: "/src/__create/favicon.png"
      }), LoadFontsSSR ? /* @__PURE__ */ jsx(LoadFontsSSR, {}) : null]
    }), /* @__PURE__ */ jsxs("body", {
      children: [/* @__PURE__ */ jsx(ClientOnly, {
        loader: () => children
      }), /* @__PURE__ */ jsx(Toaster, {
        position: isMobile ? "top-center" : "bottom-right"
      }), /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {}), /* @__PURE__ */ jsx("link", {
        rel: "preconnect",
        href: "https://ka-p.fontawesome.com",
        crossOrigin: "anonymous"
      }), /* @__PURE__ */ jsx("link", {
        rel: "stylesheet",
        href: "https://ka-p.fontawesome.com/releases/v6.3.0/css/pro.min.css?token=2c15cc0cc7",
        crossOrigin: "anonymous"
      })]
    })]
  });
}
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(InternalErrorBoundary);
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(SessionProvider, {
    children: /* @__PURE__ */ jsx(Outlet, {})
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ClientOnly,
  ErrorBoundary,
  Layout,
  default: root,
  links,
  useHandleScreenshotRequest,
  useHmrConnection
}, Symbol.toStringTag, { value: "Module" }));
const __vite_import_meta_env__ = { "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "REACT_ROUTER_HONO_SERVER_ASSETS_DIR": "assets", "REACT_ROUTER_HONO_SERVER_BASENAME": "/", "REACT_ROUTER_HONO_SERVER_BUILD_DIRECTORY": "build", "REACT_ROUTER_HONO_SERVER_RUNTIME": "node", "SSR": true, "VITE_SUPABASE_ANON_KEY": "smoke-anon-key", "VITE_SUPABASE_URL": "https://smoke.supabase.co" };
const getEnv = (key) => {
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key];
  }
  return __vite_import_meta_env__[key];
};
const supabaseUrl = getEnv("VITE_SUPABASE_URL") ?? getEnv("SUPABASE_URL") ?? getEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = getEnv("VITE_SUPABASE_ANON_KEY") ?? getEnv("SUPABASE_ANON_KEY") ?? getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
let cachedClient = null;
function getClient() {
  if (cachedClient) return cachedClient;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase client configuration is missing. Please ensure VITE_SUPABASE_URL (or SUPABASE_URL) and VITE_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY) are set in the environment."
    );
  }
  cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });
  return cachedClient;
}
const supabase = new Proxy({}, {
  get(target, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
  set(target, prop, value) {
    return Reflect.set(getClient(), prop, value);
  }
});
const SAFE_USER_SELECT = "id, full_name, email, phone, role, blood_type, location, availability_status, is_verified, last_donation_at, reward_points, created_at";
function throwIfSupabaseError(error, fallbackMessage = "Request failed") {
  if (!error) return;
  const rawMessage = error.message ?? error.error_description ?? error.error ?? fallbackMessage;
  const message = typeof rawMessage === "string" ? rawMessage : fallbackMessage;
  const nextError = new Error(message);
  nextError.status = error.status;
  nextError.data = error;
  throw nextError;
}
async function loadUserProfile(userId) {
  if (!userId) {
    throw new Error("User session is missing");
  }
  const { data, error } = await supabase.from("users").select(SAFE_USER_SELECT).eq("id", userId).maybeSingle();
  throwIfSupabaseError(error, "Failed to load profile");
  if (!data) {
    throw new Error("Account profile was not created. Please contact support or try again after verifying your email.");
  }
  return data;
}
const BASE_URL = process.env.NEXT_PUBLIC_WORKER_URL ?? // Cloudflare Worker (external)
"";
const AUTH_TOKEN_STORAGE_KEY$1 = "lyfeblood.auth.token";
function getStoredAuthToken() {
  try {
    return typeof window !== "undefined" ? window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY$1) : null;
  } catch {
    return null;
  }
}
async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const token = getStoredAuthToken();
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...token ? { Authorization: `Bearer ${token}` } : {},
      ...options.headers ?? {}
    },
    ...options
  });
  let data;
  try {
    data = await response.json();
  } catch {
    data = { error: "Invalid JSON response from server" };
  }
  if (!response.ok) {
    const message = data?.error ?? `Request failed: ${response.status} ${response.statusText}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}
async function apiRegister(payload) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function apiLogin(payload) {
  const { data, error } = await supabase.auth.signInWithPassword(payload);
  throwIfSupabaseError(error, "Sign-in failed");
  const user = await loadUserProfile(data.user?.id);
  return {
    user,
    token: data.session?.access_token ?? null,
    session: data.session ?? null,
    message: "Login successful"
  };
}
async function apiGetProfile() {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  throwIfSupabaseError(sessionError, "Failed to restore session");
  const authUser = sessionData?.session?.user ?? null;
  const user = await loadUserProfile(authUser?.id);
  return { user };
}
async function apiDeleteRequest(requestId) {
  return apiFetch(`/api/requests/${encodeURIComponent(requestId)}`, {
    method: "DELETE"
  });
}
async function apiUpdateRequestStatus(payload) {
  return apiFetch("/api/requests", {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}
async function apiCreateRequest(payload) {
  return supabase.rpc("create_blood_request", payload);
}
async function apiGetMatches(params = {}) {
  const qs = new URLSearchParams();
  if (params.id) qs.set("id", params.id);
  if (params.request_id) qs.set("request_id", params.request_id);
  const query = qs.toString() ? `?${qs}` : "";
  return apiFetch(`/api/matches${query}`);
}
async function apiGetMatch(matchId) {
  const { matches } = await apiGetMatches({ id: matchId });
  return { match: matches?.[0] ?? null };
}
async function apiRespondToMatch(payload) {
  return supabase.rpc("respond_to_match", payload);
}
async function apiSendMatches(payload) {
  return supabase.rpc("send_matches", payload);
}
async function apiGetMatchChat(matchId) {
  const qs = new URLSearchParams({ match_id: matchId });
  return apiFetch(`/api/matches/chat?${qs.toString()}`);
}
async function apiSendMatchChatMessage(payload) {
  return supabase.rpc("send_match_chat_message", payload);
}
async function apiGetMatchTracking(matchId) {
  const qs = new URLSearchParams({ match_id: matchId });
  return apiFetch(`/api/matches/tracking?${qs.toString()}`);
}
async function apiUpdateMatchTracking(payload) {
  return supabase.rpc("update_match_tracking", payload);
}
async function apiVerifyToken(payload) {
  return supabase.rpc("verify_token", payload);
}
async function apiUpdateHospitalMatchStatus(payload) {
  return supabase.rpc("update_hospital_match_status", payload);
}
async function apiGetNotifications(params = {}) {
  const qs = new URLSearchParams();
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.unread) qs.set("unread", "true");
  const query = qs.toString() ? `?${qs}` : "";
  return apiFetch(`/api/notifications${query}`);
}
async function apiUpdateNotifications(payload = {}) {
  return supabase.rpc("update_notifications", payload);
}
const BLOOD_GROUPS$1 = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const REQUEST_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  DONOR_MATCHED: "donor_matched",
  CHECKED_IN: "checked_in",
  BLOOD_COLLECTED: "blood_collected",
  FULFILLED: "fulfilled",
  CANCELLED: "cancelled"
};
const AppContext = createContext(null);
const AUTH_STORAGE_KEY = "lyfeblood.auth.user";
const AUTH_TOKEN_STORAGE_KEY = "lyfeblood.auth.token";
function canUseStorage() {
  try {
    return typeof window !== "undefined" && !!window.sessionStorage;
  } catch {
    return false;
  }
}
function getInitialUser() {
  if (!canUseStorage()) return null;
  try {
    const stored = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
    const token = window.sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    return stored && token ? JSON.parse(stored) : null;
  } catch {
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    window.sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    return null;
  }
}
function normalizeDbUser(u) {
  const fullName = u.full_name ?? u.name ?? "LyfeBlood User";
  const initials = fullName.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  return {
    id: u.id,
    role: u.role,
    roleLabel: u.role === "donor" ? "Blood Donor" : u.role === "hospital" ? "Hospital Officer" : "Patient / Family",
    name: fullName,
    avatar: initials || "LB",
    bloodGroup: u.blood_type ?? u.bloodGroup ?? null,
    location: u.location ?? null,
    isAvailable: u.availability_status === 1 || u.availability_status === true,
    lastDonationAt: u.last_donation_at ?? u.lastDonationAt ?? u.lastDonated ?? null,
    lastDonated: u.last_donation_at ?? u.lastDonationAt ?? u.lastDonated ?? null,
    rewardPoints: Number(u.reward_points ?? u.rewardPoints ?? 0),
    email: u.email ?? null,
    phone: u.phone ?? null
  };
}
function normalizeRequestStatus$1(status) {
  switch (status) {
    case "Pending":
    case REQUEST_STATUS.PENDING:
      return REQUEST_STATUS.PENDING;
    case "Verified":
    case REQUEST_STATUS.VERIFIED:
      return REQUEST_STATUS.VERIFIED;
    case "Donor Matched":
    case REQUEST_STATUS.DONOR_MATCHED:
      return REQUEST_STATUS.DONOR_MATCHED;
    case "Arrived":
    case "Arrived At Lab":
    case REQUEST_STATUS.CHECKED_IN:
      return REQUEST_STATUS.CHECKED_IN;
    case "Blood Collected":
    case REQUEST_STATUS.BLOOD_COLLECTED:
      return REQUEST_STATUS.BLOOD_COLLECTED;
    case "Completed":
    case REQUEST_STATUS.FULFILLED:
      return REQUEST_STATUS.FULFILLED;
    case "Cancelled":
    case REQUEST_STATUS.CANCELLED:
      return REQUEST_STATUS.CANCELLED;
    default:
      return REQUEST_STATUS.PENDING;
  }
}
function normalizeBloodRequest$1(r) {
  return {
    id: r.id,
    tier: r.urgency_tier === "SOS" ? "sos" : "standard",
    bloodGroup: r.blood_type_needed ?? r.bloodGroup ?? null,
    unitsNeeded: r.units_needed ?? r.unitsNeeded ?? 1,
    unitsFulfilled: r.units_fulfilled ?? r.unitsFulfilled ?? 0,
    hospitalName: r.hospital_name ?? r.hospitalName ?? "Hospital",
    ward: r.ward ?? r.patient_ref ?? r.patientCode ?? "Blood request",
    patientCode: r.patient_ref ?? r.patientCode ?? null,
    status: normalizeRequestStatus$1(r.status),
    requestedBy: r.requested_by ?? r.requestedBy ?? null,
    requestDate: r.created_at ?? r.requestDate ?? (/* @__PURE__ */ new Date()).toISOString(),
    urgencyNote: r.urgency_note ?? r.urgencyNote ?? null,
    location: r.location ?? null,
    requestType: r.request_type ?? r.requestType ?? "Emergency",
    scheduledFor: r.scheduled_for ?? r.scheduledFor ?? null,
    matchingStatus: r.matching_status ?? r.matchingStatus ?? "pending"
  };
}
function requestSortPriority(urgencyTier) {
  switch (urgencyTier) {
    case "SOS":
      return 0;
    case "Urgent":
      return 1;
    default:
      return 2;
  }
}
function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(getInitialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!getInitialUser();
  });
  const [bloodRequests, setBloodRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeNav, setActiveNav] = useState("home");
  const [donorAvailable, setDonorAvailable] = useState(true);
  const [incomingMatchAlert, setIncomingMatchAlert] = useState(null);
  const refreshBloodRequests = useCallback(async () => {
    const { data, error } = await supabase.from("blood_requests").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    const requests = (data ?? []).sort((a, b) => {
      const aPriority = requestSortPriority(a?.urgency_tier);
      const bPriority = requestSortPriority(b?.urgency_tier);
      if (aPriority !== bPriority) return aPriority - bPriority;
      return new Date(b?.created_at ?? 0).getTime() - new Date(a?.created_at ?? 0).getTime();
    });
    setBloodRequests(requests.map(normalizeBloodRequest$1));
  }, []);
  const refreshNotifications = useCallback(async () => {
    if (!getInitialUser()) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    const { notifications: rows, unread_count } = await apiGetNotifications();
    setNotifications(
      (rows ?? []).map((notification) => ({
        ...notification,
        isRead: Boolean(notification.read_at),
        requestId: notification.request_id,
        matchId: notification.match_id,
        timestamp: notification.created_at
      }))
    );
    setUnreadCount(unread_count ?? 0);
  }, []);
  useEffect(() => {
    if (!isAuthenticated) {
      setBloodRequests([]);
      return;
    }
    refreshBloodRequests().catch((error) => {
      console.error("[AppContext] Failed to load blood requests:", error);
      setBloodRequests([]);
    });
  }, [isAuthenticated, refreshBloodRequests]);
  useEffect(() => {
    if (!isAuthenticated) return;
    refreshNotifications().catch((error) => {
      console.error("[AppContext] Failed to load notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    });
  }, [isAuthenticated, refreshNotifications]);
  const login = useCallback(
    (authPayload) => {
      if (!authPayload || typeof authPayload !== "object") return;
      const authUser = authPayload.user ?? authPayload;
      const token = authPayload.token ?? null;
      const user = normalizeDbUser(authUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setBloodRequests([]);
      setNotifications([]);
      setUnreadCount(0);
      setDonorAvailable(user.isAvailable);
      if (canUseStorage()) {
        window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        if (token) window.sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      }
      refreshBloodRequests().catch((error) => {
        console.error(
          "[AppContext] Failed to refresh blood requests after login:",
          error
        );
      });
      refreshNotifications().catch((error) => {
        console.error(
          "[AppContext] Failed to refresh notifications after login:",
          error
        );
      });
    },
    [refreshBloodRequests, refreshNotifications]
  );
  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setCurrentUser(null);
    setIsAuthenticated(false);
    setActiveNav("home");
    setIncomingMatchAlert(null);
    setNotifications([]);
    setUnreadCount(0);
    if (canUseStorage()) {
      window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
      window.sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
  }, []);
  const updateCurrentUser = useCallback((nextUser) => {
    const normalized = normalizeDbUser(nextUser);
    setCurrentUser(normalized);
    setDonorAvailable(normalized.isAvailable);
    if (canUseStorage()) {
      window.sessionStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify(normalized)
      );
    }
  }, []);
  const refreshCurrentUser = useCallback(async () => {
    const { user } = await apiGetProfile();
    updateCurrentUser(user);
    return user;
  }, [updateCurrentUser]);
  useEffect(() => {
    let active = true;
    async function applySession(session) {
      if (!session?.access_token || !canUseStorage()) return;
      window.sessionStorage.setItem(
        AUTH_TOKEN_STORAGE_KEY,
        session.access_token
      );
      try {
        const { user } = await apiGetProfile();
        if (!active) return;
        updateCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error(
          "[AppContext] Failed to restore Supabase session:",
          error
        );
      }
    }
    supabase.auth.getSession().then(({ data }) => {
      applySession(data?.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          if (canUseStorage()) {
            window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
            window.sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
          }
          setCurrentUser(null);
          setIsAuthenticated(false);
          return;
        }
        if (session?.access_token) {
          applySession(session);
        }
      }
    );
    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, [updateCurrentUser]);
  const toggleDonorAvailable = useCallback(() => {
    setDonorAvailable((v) => !v);
  }, []);
  const triggerMatchAlert = useCallback((matchData) => {
    if (matchData) setIncomingMatchAlert(matchData);
  }, []);
  const dismissMatchAlert = useCallback(() => {
    setIncomingMatchAlert(null);
  }, []);
  const updateRequestStatus = useCallback(
    async (requestId, newStatus, options = {}) => {
      const statusByUiStatus = {
        [REQUEST_STATUS.PENDING]: "pending",
        [REQUEST_STATUS.VERIFIED]: "verified",
        [REQUEST_STATUS.DONOR_MATCHED]: "donor_matched",
        [REQUEST_STATUS.CHECKED_IN]: "checked_in",
        [REQUEST_STATUS.BLOOD_COLLECTED]: "blood_collected",
        [REQUEST_STATUS.FULFILLED]: "fulfilled",
        [REQUEST_STATUS.CANCELLED]: "cancelled"
      };
      if (options.persist !== false) {
        await apiUpdateRequestStatus({
          request_id: requestId,
          status: statusByUiStatus[newStatus] ?? newStatus
        });
        refreshNotifications().catch((error) => {
          console.error(
            "[AppContext] Failed to refresh notifications after status update:",
            error
          );
        });
      }
      setBloodRequests(
        (prev) => prev.map(
          (req) => req.id === requestId ? { ...req, status: newStatus } : req
        )
      );
    },
    [refreshNotifications]
  );
  const addRequest = useCallback(
    async (newRequest) => {
      const { request } = await apiCreateRequest({
        hospital_name: newRequest.hospitalName,
        blood_type_needed: newRequest.bloodGroup,
        urgency_tier: newRequest.tier === "sos" ? "SOS" : "Standard",
        units_needed: newRequest.unitsNeeded,
        patient_ref: newRequest.patientCode ?? newRequest.ward ?? null,
        location: newRequest.location ?? null,
        urgency_note: newRequest.urgencyNote ?? null,
        requested_by: newRequest.requestedBy ?? null,
        request_type: newRequest.requestType ?? "Emergency",
        scheduled_for: newRequest.scheduledFor ?? null
      });
      const normalizedRequest = normalizeBloodRequest$1(request);
      setBloodRequests((prev) => [normalizedRequest, ...prev]);
      refreshNotifications().catch((error) => {
        console.error(
          "[AppContext] Failed to refresh notifications after request create:",
          error
        );
      });
      return { request: normalizedRequest };
    },
    [refreshNotifications]
  );
  const deleteRequest = useCallback(
    async (requestId) => {
      await apiDeleteRequest(requestId);
      setBloodRequests(
        (prev) => prev.filter((request) => request.id !== requestId)
      );
      refreshNotifications().catch((error) => {
        console.error(
          "[AppContext] Failed to refresh notifications after request delete:",
          error
        );
      });
    },
    [refreshNotifications]
  );
  const markAllNotificationsRead = useCallback(async () => {
    await apiUpdateNotifications({ read: true });
    setNotifications(
      (prev) => prev.map((notification) => ({
        ...notification,
        isRead: true,
        read_at: notification.read_at ?? (/* @__PURE__ */ new Date()).toISOString()
      }))
    );
    setUnreadCount(0);
  }, []);
  const markNotificationsUnread = useCallback(
    async (ids) => {
      await apiUpdateNotifications({ ids, read: false });
      setNotifications(
        (prev) => prev.map((notification) => {
          if (ids?.length && !ids.includes(notification.id))
            return notification;
          return { ...notification, isRead: false, read_at: null };
        })
      );
      refreshNotifications().catch((error) => {
        console.error(
          "[AppContext] Failed to refresh notifications after unread update:",
          error
        );
      });
    },
    [refreshNotifications]
  );
  return /* @__PURE__ */ jsx(
    AppContext.Provider,
    {
      value: {
        currentUser,
        updateCurrentUser,
        refreshCurrentUser,
        isAuthenticated,
        login,
        logout,
        bloodRequests,
        updateRequestStatus,
        addRequest,
        deleteRequest,
        notifications,
        unreadCount,
        markAllNotificationsRead,
        markNotificationsUnread,
        refreshNotifications,
        activeNav,
        setActiveNav,
        donorAvailable,
        toggleDonorAvailable,
        incomingMatchAlert,
        triggerMatchAlert,
        dismissMatchAlert
      },
      children
    }
  );
}
function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1e3 * 60 * 5,
      cacheTime: 1e3 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});
function RootLayout({ children }) {
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxs(AppProvider, { children: [
    /* @__PURE__ */ jsx("div", { className: "lb-viewport", children: /* @__PURE__ */ jsx("div", { className: "lb-frame", children }) }),
    /* @__PURE__ */ jsx("style", { jsx: true, global: true, children: `
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
            --lb-frame-max-width: 480px;
            min-height: 100vh;
            overflow-x: hidden;
            background-color: #F4F4F4;
            position: relative;
          }

          /* ── App column — mobile default ──────────────────── */
          .lb-frame {
            width: 100%;
            max-width: var(--lb-frame-max-width);
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
              --lb-frame-max-width: 1100px;
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
        ` })
  ] }) });
}
function PrimaryButton({
  children,
  onClick,
  disabled = false,
  type = "button",
  icon: Icon,
  style = {}
}) {
  const [pressed, setPressed] = useState(false);
  const base = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    minHeight: "52px",
    height: "auto",
    paddingBlock: "14px",
    paddingInline: "16px",
    backgroundColor: pressed ? "#922B21" : "#C0392B",
    color: "#FFFFFF",
    fontSize: "15px",
    fontWeight: "600",
    fontFamily: "inherit",
    borderRadius: "8px",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
    transform: pressed ? "scale(0.98)" : "scale(1)",
    transition: "background-color 120ms ease, transform 100ms ease",
    letterSpacing: "0.01em",
    lineHeight: "1.3",
    textAlign: "center",
    whiteSpace: "normal",
    wordBreak: "break-word",
    outline: "none",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    boxSizing: "border-box",
    ...style
  };
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type,
      disabled,
      style: base,
      onPointerDown: () => !disabled && setPressed(true),
      onPointerUp: () => setPressed(false),
      onPointerLeave: () => setPressed(false),
      onClick,
      children: [
        Icon && /* @__PURE__ */ jsx(Icon, { size: 18, strokeWidth: 2.2 }),
        children
      ]
    }
  );
}
function SecondaryButton({
  children,
  onClick,
  disabled = false,
  type = "button",
  icon: Icon,
  style = {}
}) {
  const [pressed, setPressed] = useState(false);
  const base = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    minHeight: "52px",
    height: "auto",
    paddingBlock: "14px",
    paddingInline: "16px",
    backgroundColor: pressed ? "#FADBD8" : "#FFFFFF",
    color: pressed ? "#922B21" : "#C0392B",
    fontSize: "15px",
    fontWeight: "600",
    fontFamily: "inherit",
    borderRadius: "8px",
    border: "1.5px solid #C0392B",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
    transform: pressed ? "scale(0.98)" : "scale(1)",
    transition: "background-color 120ms ease, transform 100ms ease, color 120ms ease",
    letterSpacing: "0.01em",
    lineHeight: "1.3",
    textAlign: "center",
    whiteSpace: "normal",
    wordBreak: "break-word",
    outline: "none",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    boxSizing: "border-box",
    ...style
  };
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type,
      disabled,
      style: base,
      onPointerDown: () => !disabled && setPressed(true),
      onPointerUp: () => setPressed(false),
      onPointerLeave: () => setPressed(false),
      onClick,
      children: [
        Icon && /* @__PURE__ */ jsx(Icon, { size: 18, strokeWidth: 2.2 }),
        children
      ]
    }
  );
}
function BloodGroupTag({ group, size = "md" }) {
  const fontSize = size === "lg" ? "16px" : size === "sm" ? "11px" : "13px";
  const height = size === "lg" ? "38px" : size === "sm" ? "26px" : "32px";
  const minWidth = size === "lg" ? "52px" : size === "sm" ? "34px" : "40px";
  return /* @__PURE__ */ jsx(
    "span",
    {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth,
        height,
        paddingInline: "8px",
        backgroundColor: "#FADBD8",
        color: "#922B21",
        fontSize,
        fontWeight: "700",
        fontFamily: "inherit",
        borderRadius: "8px",
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
        flexShrink: 0
      },
      children: group
    }
  );
}
const STATUS_CONFIG = {
  [REQUEST_STATUS.PENDING]: {
    label: "Pending",
    bg: "#FEF9C3",
    color: "#92400E",
    dot: "#D97706"
  },
  [REQUEST_STATUS.VERIFIED]: {
    label: "Verified",
    bg: "#E0F2FE",
    color: "#075985",
    dot: "#0284C7"
  },
  [REQUEST_STATUS.DONOR_MATCHED]: {
    label: "Donor Matched",
    bg: "#DBEAFE",
    color: "#1E40AF",
    dot: "#3B82F6"
  },
  [REQUEST_STATUS.CHECKED_IN]: {
    label: "Checked In",
    bg: "#EDE9FE",
    color: "#5B21B6",
    dot: "#7C3AED"
  },
  [REQUEST_STATUS.BLOOD_COLLECTED]: {
    label: "Blood Collected",
    bg: "#FADBD8",
    color: "#922B21",
    dot: "#C0392B"
  },
  [REQUEST_STATUS.FULFILLED]: {
    label: "Completed",
    bg: "#D5F5E3",
    color: "#1E8449",
    dot: "#27AE60"
  },
  [REQUEST_STATUS.CANCELLED]: {
    label: "Cancelled",
    bg: "#F4F4F4",
    color: "#6B6B6B",
    dot: "#9CA3AF"
  }
};
function RequestStatusBadge({ status, size = "md" }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG[REQUEST_STATUS.PENDING];
  const fontSize = size === "sm" ? "11px" : "12px";
  const dotSize = size === "sm" ? "5px" : "6px";
  return /* @__PURE__ */ jsxs(
    "span",
    {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        paddingInline: size === "sm" ? "8px" : "10px",
        paddingBlock: size === "sm" ? "3px" : "4px",
        backgroundColor: cfg.bg,
        color: cfg.color,
        fontSize,
        fontWeight: "600",
        fontFamily: "inherit",
        borderRadius: "999px",
        whiteSpace: "nowrap",
        flexShrink: 0
      },
      children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            style: {
              width: dotSize,
              height: dotSize,
              borderRadius: "50%",
              backgroundColor: cfg.dot,
              flexShrink: 0
            }
          }
        ),
        cfg.label
      ]
    }
  );
}
function RequestCard({ request, onClick }) {
  const isSOS = request.tier === "sos";
  const accentColor2 = isSOS ? "#922B21" : "#C0392B";
  const formattedDate = (() => {
    const d = new Date(request.requestDate);
    const now = /* @__PURE__ */ new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 6e4);
    const diffHrs = Math.floor(diffMins / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
  })();
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick,
      style: {
        display: "flex",
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
        overflow: "hidden",
        textAlign: "left",
        cursor: "pointer",
        outline: "none",
        padding: 0,
        border: "none",
        borderLeft: `4px solid ${accentColor2}`
      },
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          style: {
            display: "flex",
            width: "100%",
            padding: "14px 14px 14px 12px",
            gap: "12px",
            alignItems: "flex-start"
          },
          children: [
            /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  flexShrink: 0
                },
                children: [
                  /* @__PURE__ */ jsx(BloodGroupTag, { group: request.bloodGroup, size: "lg" }),
                  isSOS && /* @__PURE__ */ jsx(
                    "span",
                    {
                      style: {
                        fontSize: "9px",
                        fontWeight: "800",
                        color: "#922B21",
                        backgroundColor: "#FADBD8",
                        paddingInline: "5px",
                        paddingBlock: "2px",
                        borderRadius: "4px",
                        letterSpacing: "0.08em"
                      },
                      children: "SOS"
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px"
                },
                children: [
                  /* @__PURE__ */ jsx(
                    "p",
                    {
                      style: {
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#1A1A1A",
                        margin: 0,
                        lineHeight: "1.35",
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                        whiteSpace: "normal"
                      },
                      children: request.hospitalName
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "p",
                    {
                      style: {
                        fontSize: "12px",
                        color: "#4A4A4A",
                        margin: 0,
                        lineHeight: "1.3"
                      },
                      children: request.ward
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginTop: "6px",
                        flexWrap: "wrap"
                      },
                      children: [
                        /* @__PURE__ */ jsxs("span", { style: { display: "flex", alignItems: "center", gap: "3px" }, children: [
                          /* @__PURE__ */ jsx(Droplets, { size: 11, color: "#C0392B" }),
                          /* @__PURE__ */ jsxs("span", { style: { fontSize: "11px", color: "#4A4A4A" }, children: [
                            request.unitsFulfilled,
                            "/",
                            request.unitsNeeded,
                            " units"
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxs("span", { style: { display: "flex", alignItems: "center", gap: "3px" }, children: [
                          /* @__PURE__ */ jsx(Clock, { size: 11, color: "#6B6B6B" }),
                          /* @__PURE__ */ jsx("span", { style: { fontSize: "11px", color: "#6B6B6B" }, children: formattedDate })
                        ] })
                      ]
                    }
                  ),
                  request.urgencyNote && /* @__PURE__ */ jsx(
                    "p",
                    {
                      style: {
                        fontSize: "11px",
                        color: isSOS ? "#922B21" : "#6B6B6B",
                        margin: "4px 0 0",
                        fontStyle: "italic",
                        lineHeight: "1.4",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical"
                      },
                      children: request.urgencyNote
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "6px",
                  flexShrink: 0
                },
                children: /* @__PURE__ */ jsx(RequestStatusBadge, { status: request.status, size: "sm" })
              }
            )
          ]
        }
      )
    }
  );
}
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const STATS = [
  {
    value: "47%",
    label: "Blood shortage rate\nin Southeast Nigeria",
    icon: AlertTriangle,
    color: "#C0392B"
  },
  {
    value: "3 min",
    label: "Avg. donor match\nresponse time",
    icon: Heart,
    color: "#27AE60"
  },
  {
    value: "1,200+",
    label: "Registered donors\nacross Imo State",
    icon: Users,
    color: "#1A1A1A"
  }
];
function LandingPage() {
  const { bloodRequests, isAuthenticated } = useApp();
  const [showAll, setShowAll] = useState(false);
  const visibleRequests = showAll ? bloodRequests : bloodRequests.slice(0, 2);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          flex: 1
        },
        children: [
          /* @__PURE__ */ jsxs(
            "header",
            {
              style: {
                position: "sticky",
                top: 0,
                zIndex: 50,
                backgroundColor: "#FFFFFF",
                borderBottom: "1px solid #C8C8C8",
                height: "56px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingInline: "20px"
              },
              children: [
                /* @__PURE__ */ jsxs(
                  "span",
                  {
                    style: {
                      fontSize: "20px",
                      fontWeight: "800",
                      letterSpacing: "-0.03em"
                    },
                    children: [
                      /* @__PURE__ */ jsx("span", { style: { color: "#C0392B" }, children: "Lyfe" }),
                      /* @__PURE__ */ jsx("span", { style: { color: "#1A1A1A" }, children: "Blood" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: "/login",
                    style: {
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#C0392B",
                      textDecoration: "none",
                      padding: "6px 14px",
                      border: "1.5px solid #C0392B",
                      borderRadius: "8px"
                    },
                    children: "Sign In"
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "section",
            {
              style: {
                background: "linear-gradient(160deg, #922B21 0%, #C0392B 55%, #E74C3C 100%)",
                padding: "40px 20px 44px",
                position: "relative",
                overflow: "hidden"
              },
              children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    style: {
                      position: "absolute",
                      top: "-40px",
                      right: "-40px",
                      width: "180px",
                      height: "180px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(255,255,255,0.06)"
                    }
                  }
                ),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    style: {
                      position: "absolute",
                      bottom: "-60px",
                      left: "-30px",
                      width: "220px",
                      height: "220px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(255,255,255,0.04)"
                    }
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    style: {
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "rgba(255,255,255,0.18)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      borderRadius: "999px",
                      paddingInline: "12px",
                      paddingBlock: "5px",
                      marginBottom: "18px"
                    },
                    children: [
                      /* @__PURE__ */ jsx(
                        "span",
                        {
                          style: {
                            fontSize: "8px",
                            color: "#FFFFFF",
                            fontWeight: "800",
                            letterSpacing: "0.12em"
                          },
                          children: "LIVE"
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "span",
                        {
                          style: {
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor: "#FFFFFF",
                            animation: "pulse 1.5s infinite"
                          }
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "span",
                        {
                          style: {
                            fontSize: "12px",
                            color: "#FFFFFF",
                            fontWeight: "600"
                          },
                          children: "3 active blood requests in Owerri"
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "h1",
                  {
                    style: {
                      fontSize: "32px",
                      fontWeight: "800",
                      color: "#FFFFFF",
                      lineHeight: "1.18",
                      letterSpacing: "-0.03em",
                      margin: "0 0 12px"
                    },
                    children: [
                      "Every Drop",
                      /* @__PURE__ */ jsx("br", {}),
                      "Saves a Life."
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(
                  "p",
                  {
                    style: {
                      fontSize: "15px",
                      color: "rgba(255,255,255,0.85)",
                      lineHeight: "1.6",
                      margin: "0 0 28px",
                      maxWidth: "320px"
                    },
                    children: "Connecting blood donors directly with patients and hospitals across Owerri and Imo State — in minutes, not hours."
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    style: { display: "flex", flexDirection: "column", gap: "12px" },
                    children: [
                      /* @__PURE__ */ jsx("a", { href: "/login", style: { textDecoration: "none" }, children: /* @__PURE__ */ jsxs(
                        "button",
                        {
                          style: {
                            width: "100%",
                            height: "52px",
                            backgroundColor: "#FFFFFF",
                            color: "#C0392B",
                            fontSize: "15px",
                            fontWeight: "700",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            letterSpacing: "0.01em"
                          },
                          children: [
                            /* @__PURE__ */ jsx(Droplets, { size: 18, color: "#C0392B" }),
                            "Find Blood Now"
                          ]
                        }
                      ) }),
                      /* @__PURE__ */ jsx("a", { href: "/login", style: { textDecoration: "none" }, children: /* @__PURE__ */ jsxs(
                        "button",
                        {
                          style: {
                            width: "100%",
                            height: "52px",
                            backgroundColor: "transparent",
                            color: "#FFFFFF",
                            fontSize: "15px",
                            fontWeight: "600",
                            borderRadius: "8px",
                            border: "1.5px solid rgba(255,255,255,0.5)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px"
                          },
                          children: [
                            /* @__PURE__ */ jsx(Heart, { size: 18, color: "#FFFFFF" }),
                            "Become a Donor"
                          ]
                        }
                      ) })
                    ]
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "section",
            {
              style: {
                padding: "20px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "0"
              },
              children: /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: "10px" }, children: STATS.map(({ value, label, icon: Icon, color }) => /* @__PURE__ */ jsxs(
                "div",
                {
                  style: {
                    flex: 1,
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    padding: "14px 10px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
                    gap: "5px"
                  },
                  children: [
                    /* @__PURE__ */ jsx(Icon, { size: 16, color, strokeWidth: 2 }),
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        style: {
                          fontSize: "18px",
                          fontWeight: "800",
                          color: "#1A1A1A",
                          lineHeight: 1
                        },
                        children: value
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        style: {
                          fontSize: "10px",
                          color: "#4A4A4A",
                          lineHeight: "1.35",
                          whiteSpace: "pre-line"
                        },
                        children: label
                      }
                    )
                  ]
                },
                value
              )) })
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              style: {
                height: "1px",
                backgroundColor: "#C8C8C8",
                marginInline: "16px"
              }
            }
          ),
          /* @__PURE__ */ jsxs("section", { style: { padding: "20px 16px" }, children: [
            /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "14px"
                },
                children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(
                      "h2",
                      {
                        style: {
                          fontSize: "18px",
                          fontWeight: "700",
                          color: "#1A1A1A",
                          margin: 0
                        },
                        children: "Active Requests"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "p",
                      {
                        style: {
                          fontSize: "12px",
                          color: "#6B6B6B",
                          margin: "2px 0 0"
                        },
                        children: "Owerri & surroundings · updated live"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs(
                    "span",
                    {
                      style: {
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#C0392B",
                        backgroundColor: "#FADBD8",
                        paddingInline: "8px",
                        paddingBlock: "3px",
                        borderRadius: "999px"
                      },
                      children: [
                        bloodRequests.length,
                        " open"
                      ]
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                style: { display: "flex", flexDirection: "column", gap: "10px" },
                children: visibleRequests.map((req) => /* @__PURE__ */ jsx(
                  RequestCard,
                  {
                    request: req,
                    onClick: () => {
                      window.location.href = "/login";
                    }
                  },
                  req.id
                ))
              }
            ),
            bloodRequests.length > 2 && /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setShowAll((v) => !v),
                style: {
                  width: "100%",
                  marginTop: "12px",
                  backgroundColor: "transparent",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#C0392B",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  padding: "8px"
                },
                children: [
                  showAll ? "Show less" : `View all ${bloodRequests.length} requests`,
                  /* @__PURE__ */ jsx(ChevronRight, { size: 14 })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(
            "section",
            {
              style: {
                margin: "0 16px 20px",
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                padding: "18px 16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.07)"
              },
              children: [
                /* @__PURE__ */ jsx(
                  "h2",
                  {
                    style: {
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#1A1A1A",
                      margin: "0 0 4px"
                    },
                    children: "Search by Blood Group"
                  }
                ),
                /* @__PURE__ */ jsx("p", { style: { fontSize: "12px", color: "#6B6B6B", margin: "0 0 14px" }, children: "Tap a group to view active donors" }),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    style: {
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px"
                    },
                    children: BLOOD_GROUPS.map((g) => /* @__PURE__ */ jsx("a", { href: "/login", style: { textDecoration: "none" }, children: /* @__PURE__ */ jsx(BloodGroupTag, { group: g, size: "lg" }) }, g))
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs("section", { style: { padding: "0 16px 20px" }, children: [
            /* @__PURE__ */ jsx(
              "h2",
              {
                style: {
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#1A1A1A",
                  margin: "0 0 14px"
                },
                children: "How LyfeBlood Works"
              }
            ),
            [
              {
                step: "01",
                title: "Post a Request",
                body: "Hospital officers or patient families log an urgent blood need.",
                color: "#FADBD8",
                textColor: "#922B21"
              },
              {
                step: "02",
                title: "Donors are Notified",
                body: "Nearby registered donors matching the blood group get an instant alert.",
                color: "#D5F5E3",
                textColor: "#1E8449"
              },
              {
                step: "03",
                title: "Match & Arrive",
                body: "A donor confirms, travels to the hospital lab, and donation is completed.",
                color: "#DBEAFE",
                textColor: "#1E40AF"
              }
            ].map(({ step, title, body, color, textColor }) => /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  display: "flex",
                  gap: "14px",
                  marginBottom: "16px",
                  alignItems: "flex-start"
                },
                children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      style: {
                        width: "36px",
                        height: "36px",
                        borderRadius: "999px",
                        backgroundColor: color,
                        color: textColor,
                        fontSize: "12px",
                        fontWeight: "800",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      },
                      children: step
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(
                      "p",
                      {
                        style: {
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#1A1A1A",
                          margin: "0 0 2px"
                        },
                        children: title
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "p",
                      {
                        style: {
                          fontSize: "13px",
                          color: "#4A4A4A",
                          margin: 0,
                          lineHeight: "1.5"
                        },
                        children: body
                      }
                    )
                  ] })
                ]
              },
              step
            ))
          ] }),
          /* @__PURE__ */ jsxs(
            "section",
            {
              style: {
                margin: "0 16px 20px",
                backgroundColor: "#FADBD8",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start"
              },
              children: [
                /* @__PURE__ */ jsx(
                  Shield,
                  {
                    size: 22,
                    color: "#922B21",
                    style: { flexShrink: 0, marginTop: "2px" }
                  }
                ),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(
                    "p",
                    {
                      style: {
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "#922B21",
                        margin: "0 0 3px"
                      },
                      children: "Safety & Compliance"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "p",
                    {
                      style: {
                        fontSize: "12px",
                        color: "#922B21",
                        margin: 0,
                        lineHeight: "1.5",
                        opacity: 0.85
                      },
                      children: "LyfeBlood facilitates donor–hospital connections only. All clinical screening, compatibility testing, and transfusion decisions are performed exclusively by licensed medical professionals."
                    }
                  )
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "section",
            {
              style: {
                padding: "0 16px 40px",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              },
              children: [
                /* @__PURE__ */ jsx("a", { href: "/login", style: { textDecoration: "none" }, children: /* @__PURE__ */ jsx(PrimaryButton, { icon: ArrowRight, children: "Get Started — It's Free" }) }),
                /* @__PURE__ */ jsx(
                  "p",
                  {
                    style: {
                      textAlign: "center",
                      fontSize: "11px",
                      color: "#6B6B6B",
                      margin: "4px 0 0"
                    },
                    children: "Serving Owerri, Orlu, Okigwe & all Imo State LGAs"
                  }
                )
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx("style", { jsx: true, global: true, children: `
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { margin: 0; padding: 0; }
      ` })
  ] });
}
const page$q = UNSAFE_withComponentProps(function WrappedPage(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(LandingPage, {
      ...props
    })
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$q
}, Symbol.toStringTag, { value: "Module" }));
const isDev = process.env.NEXT_PUBLIC_CREATE_ENV === "DEVELOPMENT";
const PROVIDER_LABELS = {
  google: "Google",
  facebook: "Facebook",
  twitter: "Twitter / X",
  apple: "Apple"
};
function SocialDevShimPage() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isDev) {
      navigate("/");
    }
  }, [navigate]);
  if (!isDev) {
    return null;
  }
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const provider = params.get("provider") || "google";
  const callbackUrl = params.get("callbackUrl") || "/";
  const label = PROVIDER_LABELS[provider] || provider;
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [missingSecrets, setMissingSecrets] = useState(null);
  useEffect(() => {
    fetch(
      `/api/__create/check-social-secrets?provider=${encodeURIComponent(provider)}`
    ).then((r) => r.json()).then((data) => setMissingSecrets(data.missing || [])).catch((err) => {
      console.error("Failed to check social secrets:", err);
    });
  }, [provider]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn("dev-social", { email, name, provider, callbackUrl });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Sign-in failed. Please try again."
      );
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center font-sans bg-gray-100", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-8 w-full max-w-[400px] shadow-md", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-400 rounded-lg p-3 mb-4 text-[13px] text-amber-800", children: [
      /* @__PURE__ */ jsx("strong", { children: "Development Mode" }),
      " — This is a simulated",
      " ",
      label,
      " sign-in. In production, users will see the real",
      " ",
      label,
      " OAuth screen."
    ] }),
    error && /* @__PURE__ */ jsxs("div", { className: "bg-red-50 border border-red-400 rounded-lg p-3 mb-4 text-[13px] text-red-900", children: [
      /* @__PURE__ */ jsx("strong", { children: "Sign-in error" }),
      " — ",
      error
    ] }),
    missingSecrets && missingSecrets.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-red-50 border border-red-400 rounded-lg p-3 mb-4 text-[13px] text-red-900", children: [
      /* @__PURE__ */ jsx("strong", { children: "Missing secrets" }),
      " — ",
      label,
      " sign-in won't work in production until you add these secrets to your project:",
      " ",
      missingSecrets.map((s) => /* @__PURE__ */ jsx(
        "code",
        {
          className: "bg-red-200 px-1 rounded text-[12px]",
          children: s
        },
        s
      ))
    ] }),
    /* @__PURE__ */ jsxs("h2", { className: "mt-0 mb-6 text-xl font-semibold", children: [
      "Sign in with ",
      label
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs("label", { className: "block mb-4", children: [
        /* @__PURE__ */ jsx("span", { className: "block text-sm font-medium mb-1.5", children: "Email" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "email",
            required: true,
            value: email,
            onChange: (e) => setEmail(e.target.value),
            placeholder: "test@example.com",
            className: "w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "block mb-6", children: [
        /* @__PURE__ */ jsxs("span", { className: "block text-sm font-medium mb-1.5", children: [
          "Display Name",
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "(optional)" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: name,
            onChange: (e) => setName(e.target.value),
            placeholder: "Test User",
            className: "w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "w-full py-2.5 rounded-lg border-none text-white text-sm font-medium bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-default cursor-pointer",
          children: loading ? "Signing in..." : `Continue as ${label} user`
        }
      )
    ] })
  ] }) });
}
const page$p = UNSAFE_withComponentProps(function WrappedPage2(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(SocialDevShimPage, {
      ...props
    })
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$p
}, Symbol.toStringTag, { value: "Module" }));
function TopAppBar({ title = "LyfeBlood", onBellPress }) {
  const { unreadCount } = useApp();
  return /* @__PURE__ */ jsxs(
    "header",
    {
      style: {
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        height: "56px",
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #C8C8C8",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingInline: "16px",
        boxSizing: "border-box"
      },
      children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            style: {
              fontSize: "18px",
              fontWeight: "700",
              color: "#1A1A1A",
              fontFamily: "inherit",
              letterSpacing: "-0.02em",
              lineHeight: 1,
              whiteSpace: "nowrap"
            },
            children: title === "LyfeBlood" ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { style: { color: "#C0392B" }, children: "Lyfe" }),
              /* @__PURE__ */ jsx("span", { style: { color: "#1A1A1A" }, children: "Blood" })
            ] }) : title
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: onBellPress,
            "aria-label": unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications",
            style: {
              position: "relative",
              width: "44px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: unreadCount > 0 ? "#FADBD8" : "transparent",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              outline: "none",
              transition: "background-color 150ms",
              flexShrink: 0
            },
            children: [
              /* @__PURE__ */ jsx(
                Bell,
                {
                  size: 22,
                  color: unreadCount > 0 ? "#C0392B" : "#1A1A1A",
                  strokeWidth: 1.8
                }
              ),
              unreadCount > 0 && /* @__PURE__ */ jsx(
                "span",
                {
                  "aria-hidden": "true",
                  style: {
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    width: "8px",
                    height: "8px",
                    backgroundColor: "#C0392B",
                    borderRadius: "50%",
                    border: "1.5px solid #FFFFFF",
                    display: "block"
                  }
                }
              )
            ]
          }
        )
      ]
    }
  );
}
const NAV_ITEMS = [
  { key: "home", label: "Home", Icon: Home },
  { key: "donate", label: "Donate", Icon: Droplets },
  { key: "requests", label: "Requests", Icon: ClipboardList },
  { key: "profile", label: "Profile", Icon: User }
];
function BottomNavBar({ onNavigate }) {
  const { activeNav, setActiveNav } = useApp();
  const navigate = useNavigate$1();
  const handlePress = (key) => {
    setActiveNav(key);
    if (key === "donate") {
      navigate("/donations/history");
      return;
    }
    if (key === "requests") {
      navigate("/requests/history");
      return;
    }
    onNavigate?.(key);
  };
  return /* @__PURE__ */ jsx(
    "nav",
    {
      style: {
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "var(--lb-frame-max-width, 480px)",
        /* 64px nav + env() bottom inset for safe area (iOS notch) */
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        backgroundColor: "#FFFFFF",
        borderTop: "1px solid #C8C8C8",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.07)",
        display: "flex",
        alignItems: "stretch",
        zIndex: 100,
        boxSizing: "border-box"
      },
      children: NAV_ITEMS.map(({ key, label, Icon }) => {
        const isActive = activeNav === key;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => handlePress(key),
            "aria-label": label,
            "aria-current": isActive ? "page" : void 0,
            style: {
              flex: 1,
              height: "64px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              outline: "none",
              WebkitTapHighlightColor: "transparent",
              paddingBlock: "10px",
              position: "relative",
              transition: "background-color 150ms"
            },
            children: [
              isActive && /* @__PURE__ */ jsx(
                "span",
                {
                  "aria-hidden": "true",
                  style: {
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "28px",
                    height: "2px",
                    backgroundColor: "#C0392B",
                    borderRadius: "0 0 2px 2px"
                  }
                }
              ),
              /* @__PURE__ */ jsx(
                Icon,
                {
                  size: 22,
                  strokeWidth: isActive ? 2.2 : 1.7,
                  color: isActive ? "#C0392B" : "#6B6B6B"
                }
              ),
              /* @__PURE__ */ jsx(
                "span",
                {
                  style: {
                    fontSize: "10px",
                    fontWeight: isActive ? "700" : "400",
                    color: isActive ? "#C0392B" : "#6B6B6B",
                    fontFamily: "inherit",
                    letterSpacing: "0.01em",
                    lineHeight: 1
                  },
                  children: label
                }
              )
            ]
          },
          key
        );
      })
    }
  );
}
const ROLE_HOME_CONFIG = {
  donor: {
    greeting: "Ready to give?",
    body: "Your next donation could save up to 3 lives. Nearby requests are waiting for your blood type.",
    cta: "Respond to a Request",
    ctaIcon: Droplets
  },
  patient_family: {
    greeting: "We're here to help.",
    body: "Post a blood request or track an existing one. Matched donors will be notified immediately.",
    cta: "Create a Request",
    ctaIcon: AlertTriangle
  },
  requester: {
    greeting: "We're here to help.",
    body: "Post a blood request or track an existing one. Matched donors will be notified immediately.",
    cta: "Create a Request",
    ctaIcon: AlertTriangle
  },
  hospital_officer: {
    greeting: "Blood Bank Overview",
    body: "Manage all active procurement requests for your facility. Respond to incoming donor matches.",
    cta: "New Procurement Request",
    ctaIcon: AlertTriangle
  },
  hospital: {
    greeting: "Blood Bank Overview",
    body: "Manage all active procurement requests for your facility. Respond to incoming donor matches.",
    cta: "New Procurement Request",
    ctaIcon: AlertTriangle
  }
};
const DELETE_AFTER_MS$1 = 24 * 60 * 60 * 1e3;
function canDeleteRequest$1(request) {
  const createdAt = new Date(request.requestDate).getTime();
  return Number.isFinite(createdAt) && Date.now() - createdAt >= DELETE_AFTER_MS$1;
}
function PatientRequestSheet({ onClose, onSubmit, isSubmitting, submitError }) {
  const [form, setForm] = useState({
    hospitalName: "",
    bloodGroup: "",
    unitsNeeded: 1,
    patientCode: "",
    urgencyNote: "",
    requestType: "Emergency",
    scheduledFor: ""
  });
  const [errors, setErrors] = useState({});
  const inputStyle2 = {
    width: "100%",
    minHeight: "46px",
    borderRadius: "8px",
    border: "1.5px solid #C8C8C8",
    paddingInline: "12px",
    fontSize: "14px",
    color: "#1A1A1A",
    backgroundColor: "#FFFFFF",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box"
  };
  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };
  const validate = () => {
    const nextErrors = {};
    if (!form.hospitalName.trim()) nextErrors.hospitalName = "Hospital is required.";
    if (!form.bloodGroup) nextErrors.bloodGroup = "Blood group is required.";
    if (!Number(form.unitsNeeded) || Number(form.unitsNeeded) < 1) {
      nextErrors.unitsNeeded = "Units must be at least 1.";
    }
    if (Number(form.unitsNeeded) > 5) {
      nextErrors.unitsNeeded = "Patient requests cannot exceed 5 pints.";
    }
    if (form.requestType === "Scheduled") {
      const scheduledTime = new Date(form.scheduledFor).getTime();
      if (!form.scheduledFor || !Number.isFinite(scheduledTime)) {
        nextErrors.scheduledFor = "Select a scheduled donation date.";
      } else if (scheduledTime <= Date.now()) {
        nextErrors.scheduledFor = "Scheduled date must be in the future.";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      hospitalName: form.hospitalName.trim(),
      patientCode: form.patientCode.trim(),
      urgencyNote: form.urgencyNote.trim(),
      unitsNeeded: Number(form.unitsNeeded),
      requestType: form.requestType,
      scheduledFor: form.requestType === "Scheduled" ? new Date(form.scheduledFor).toISOString() : null
    });
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center"
      },
      children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onClose,
            "aria-label": "Close request form",
            style: {
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              border: "none",
              cursor: "pointer"
            }
          }
        ),
        /* @__PURE__ */ jsxs(
          "form",
          {
            onSubmit: handleSubmit,
            style: {
              position: "relative",
              width: "100%",
              maxWidth: "480px",
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor: "#FFFFFF",
              borderRadius: "16px 16px 0 0",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            },
            children: [
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
                /* @__PURE__ */ jsx("h2", { style: { margin: 0, fontSize: "17px", fontWeight: "800", color: "#1A1A1A" }, children: "Create a Request" }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: onClose,
                    style: {
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "#F4F4F4",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer"
                    },
                    children: /* @__PURE__ */ jsx(X, { size: 18, color: "#1A1A1A" })
                  }
                )
              ] }),
              submitError && /* @__PURE__ */ jsx(
                "p",
                {
                  role: "alert",
                  style: {
                    margin: 0,
                    padding: "10px 12px",
                    borderRadius: "8px",
                    backgroundColor: "#FADBD8",
                    color: "#922B21",
                    fontSize: "13px",
                    fontWeight: "700"
                  },
                  children: submitError
                }
              ),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "8px" }, children: [
                /* @__PURE__ */ jsxs("label", { style: { fontSize: "13px", fontWeight: "700", color: "#1A1A1A" }, children: [
                  "Request Type ",
                  /* @__PURE__ */ jsx("span", { style: { color: "#C0392B" }, children: "*" })
                ] }),
                /* @__PURE__ */ jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }, children: ["Emergency", "Scheduled"].map((type) => /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => updateField("requestType", type),
                    disabled: isSubmitting,
                    style: {
                      minHeight: "42px",
                      borderRadius: "8px",
                      border: `1.5px solid ${form.requestType === type ? "#C0392B" : "#C8C8C8"}`,
                      backgroundColor: form.requestType === type ? "#FADBD8" : "#FFFFFF",
                      color: form.requestType === type ? "#922B21" : "#1A1A1A",
                      fontSize: "13px",
                      fontWeight: "800",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      fontFamily: "inherit"
                    },
                    children: type
                  },
                  type
                )) })
              ] }),
              form.requestType === "Scheduled" && /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "6px" }, children: [
                /* @__PURE__ */ jsxs("label", { style: { fontSize: "13px", fontWeight: "700", color: "#1A1A1A" }, children: [
                  "Scheduled Date ",
                  /* @__PURE__ */ jsx("span", { style: { color: "#C0392B" }, children: "*" })
                ] }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    style: inputStyle2,
                    type: "date",
                    value: form.scheduledFor,
                    min: new Date(Date.now() + 864e5).toISOString().slice(0, 10),
                    onChange: (event) => updateField("scheduledFor", event.target.value),
                    disabled: isSubmitting
                  }
                ),
                errors.scheduledFor && /* @__PURE__ */ jsx("span", { style: { fontSize: "12px", color: "#922B21" }, children: errors.scheduledFor })
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "6px" }, children: [
                /* @__PURE__ */ jsxs("label", { style: { fontSize: "13px", fontWeight: "700", color: "#1A1A1A" }, children: [
                  "Hospital / Facility ",
                  /* @__PURE__ */ jsx("span", { style: { color: "#C0392B" }, children: "*" })
                ] }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    style: inputStyle2,
                    value: form.hospitalName,
                    onChange: (event) => updateField("hospitalName", event.target.value),
                    placeholder: "e.g. Federal Medical Centre Owerri",
                    disabled: isSubmitting
                  }
                ),
                errors.hospitalName && /* @__PURE__ */ jsx("span", { style: { fontSize: "12px", color: "#922B21" }, children: errors.hospitalName })
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "6px" }, children: [
                /* @__PURE__ */ jsxs("label", { style: { fontSize: "13px", fontWeight: "700", color: "#1A1A1A" }, children: [
                  "Blood Group Needed ",
                  /* @__PURE__ */ jsx("span", { style: { color: "#C0392B" }, children: "*" })
                ] }),
                /* @__PURE__ */ jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: "8px" }, children: BLOOD_GROUPS$1.map((group) => /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => updateField("bloodGroup", group),
                    disabled: isSubmitting,
                    style: {
                      background: "none",
                      border: `2px solid ${form.bloodGroup === group ? "#C0392B" : "#C8C8C8"}`,
                      borderRadius: "8px",
                      padding: 0,
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      boxShadow: form.bloodGroup === group ? "0 0 0 3px #FADBD8" : "none"
                    },
                    children: /* @__PURE__ */ jsx(BloodGroupTag, { group, size: "md" })
                  },
                  group
                )) }),
                errors.bloodGroup && /* @__PURE__ */ jsx("span", { style: { fontSize: "12px", color: "#922B21" }, children: errors.bloodGroup })
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "6px" }, children: [
                /* @__PURE__ */ jsxs("label", { style: { fontSize: "13px", fontWeight: "700", color: "#1A1A1A" }, children: [
                  "Units Needed ",
                  /* @__PURE__ */ jsx("span", { style: { color: "#C0392B" }, children: "*" })
                ] }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    style: inputStyle2,
                    type: "number",
                    min: "1",
                    max: "5",
                    value: form.unitsNeeded,
                    onChange: (event) => updateField("unitsNeeded", event.target.value),
                    disabled: isSubmitting
                  }
                ),
                errors.unitsNeeded && /* @__PURE__ */ jsx("span", { style: { fontSize: "12px", color: "#922B21" }, children: errors.unitsNeeded })
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "6px" }, children: [
                /* @__PURE__ */ jsx("label", { style: { fontSize: "13px", fontWeight: "700", color: "#1A1A1A" }, children: "Patient / Case Reference" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    style: inputStyle2,
                    value: form.patientCode,
                    onChange: (event) => updateField("patientCode", event.target.value),
                    placeholder: "Optional",
                    disabled: isSubmitting
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "6px" }, children: [
                /* @__PURE__ */ jsx("label", { style: { fontSize: "13px", fontWeight: "700", color: "#1A1A1A" }, children: "Note" }),
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    style: { ...inputStyle2, minHeight: "80px", paddingTop: "10px", resize: "none" },
                    value: form.urgencyNote,
                    onChange: (event) => updateField("urgencyNote", event.target.value),
                    placeholder: "Optional",
                    disabled: isSubmitting
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(PrimaryButton, { type: "submit", disabled: isSubmitting, icon: Plus, children: isSubmitting ? "Creating..." : "Create Request" }),
              /* @__PURE__ */ jsx(SecondaryButton, { onClick: onClose, disabled: isSubmitting, children: "Cancel" })
            ]
          }
        )
      ]
    }
  );
}
function DashboardPage() {
  const navigate = useNavigate$1();
  const {
    currentUser,
    isAuthenticated,
    bloodRequests,
    addRequest,
    deleteRequest,
    logout,
    unreadCount,
    markAllNotificationsRead
  } = useApp();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");
  const [deletingRequestId, setDeletingRequestId] = useState(null);
  const [matchingState, setMatchingState] = useState({
    loading: false,
    request: null,
    matches: [],
    selectedIds: [],
    error: "",
    sent: false,
    sending: false
  });
  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthenticated]);
  const handleOpenCreateRequest = () => {
    if (!["patient_family", "requester"].includes(currentUser?.role)) return;
    setRequestError("");
    setRequestSuccess("");
    setMatchingState({
      loading: false,
      request: null,
      matches: [],
      selectedIds: [],
      error: "",
      sent: false,
      sending: false
    });
    setShowRequestForm(true);
  };
  const handleCreateRequest = async (formData) => {
    setRequestSubmitting(true);
    setRequestError("");
    try {
      const { request } = await addRequest({
        tier: "standard",
        bloodGroup: formData.bloodGroup,
        unitsNeeded: formData.unitsNeeded,
        hospitalName: formData.hospitalName,
        patientCode: formData.patientCode,
        requestedBy: currentUser.email ? currentUser.id : null,
        urgencyNote: formData.urgencyNote,
        requestType: formData.requestType,
        scheduledFor: formData.scheduledFor
      });
      setShowRequestForm(false);
      setMatchingState({
        loading: true,
        request,
        matches: [],
        selectedIds: [],
        error: "",
        sent: false,
        sending: false
      });
      window.setTimeout(async () => {
        try {
          const { matches } = await apiGetMatches({ request_id: request.id });
          const candidates = (matches ?? []).filter((match) => match.match_status === "Candidate").slice(0, 4);
          setMatchingState((current) => ({
            ...current,
            loading: false,
            matches: candidates,
            selectedIds: candidates.map((match) => match.id),
            error: candidates.length ? "" : "No eligible donors found yet."
          }));
        } catch (error) {
          setMatchingState((current) => ({
            ...current,
            loading: false,
            error: error?.message ?? "Unable to load eligible donors."
          }));
        }
      }, 6500);
    } catch (error) {
      setRequestError(error?.message ?? "Failed to create request.");
    } finally {
      setRequestSubmitting(false);
    }
  };
  const toggleSelectedMatch = (matchId) => {
    setMatchingState((current) => {
      const selected = new Set(current.selectedIds);
      if (selected.has(matchId)) selected.delete(matchId);
      else if (selected.size < 4) selected.add(matchId);
      return { ...current, selectedIds: [...selected], error: "" };
    });
  };
  const handleSendSelectedDonors = async () => {
    if (!matchingState.request?.id || !matchingState.selectedIds.length) {
      setMatchingState((current) => ({
        ...current,
        error: "Select at least one donor."
      }));
      return;
    }
    setMatchingState((current) => ({ ...current, sending: true, error: "" }));
    try {
      await apiSendMatches({
        request_id: matchingState.request.id,
        match_ids: matchingState.selectedIds
      });
      setRequestSuccess("Request sent to selected donors.");
      setMatchingState((current) => ({
        ...current,
        sending: false,
        sent: true,
        matches: current.matches.map(
          (match) => current.selectedIds.includes(match.id) ? { ...match, match_status: "Alerted" } : match
        )
      }));
    } catch (error) {
      setMatchingState((current) => ({
        ...current,
        sending: false,
        error: error?.message ?? "Unable to send donor requests."
      }));
    }
  };
  const handleDeleteRequest = async (request) => {
    if (!canDeleteRequest$1(request) || deletingRequestId) return;
    const confirmed = window.confirm("Delete this request permanently?");
    if (!confirmed) return;
    setDeletingRequestId(request.id);
    setRequestError("");
    setRequestSuccess("");
    try {
      await deleteRequest(request.id);
      setRequestSuccess("Request deleted.");
    } catch (error) {
      setRequestError(error?.message ?? "Unable to delete request.");
    } finally {
      setDeletingRequestId(null);
    }
  };
  if (!currentUser) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          flex: 1,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px"
            },
            children: [
              /* @__PURE__ */ jsx(Droplets, { size: 32, color: "#C0392B" }),
              /* @__PURE__ */ jsx(
                "p",
                {
                  style: {
                    fontSize: "14px",
                    color: "#4A4A4A",
                    fontFamily: "inherit"
                  },
                  children: "Loading…"
                }
              )
            ]
          }
        )
      }
    );
  }
  const config = ROLE_HOME_CONFIG[currentUser.role] ?? ROLE_HOME_CONFIG.donor;
  const activeRequests = bloodRequests.filter(
    (r) => ![REQUEST_STATUS.FULFILLED, REQUEST_STATUS.CANCELLED].includes(
      r.status
    )
  );
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          flex: 1,
          paddingBottom: "80px"
        },
        children: [
          /* @__PURE__ */ jsx(TopAppBar, { title: "LyfeBlood", onBellPress: markAllNotificationsRead }),
          /* @__PURE__ */ jsxs(
            "section",
            {
              style: {
                background: "linear-gradient(135deg, #922B21 0%, #C0392B 100%)",
                padding: "20px 16px",
                margin: "12px 12px 0",
                borderRadius: "12px"
              },
              children: [
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "14px"
                    },
                    children: [
                      /* @__PURE__ */ jsx(
                        "div",
                        {
                          style: {
                            width: "44px",
                            height: "44px",
                            borderRadius: "50%",
                            backgroundColor: "rgba(255,255,255,0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "15px",
                            fontWeight: "800",
                            color: "#FFFFFF",
                            letterSpacing: "0.02em",
                            flexShrink: 0
                          },
                          children: currentUser.avatar
                        }
                      ),
                      /* @__PURE__ */ jsxs("div", { style: { flex: 1 }, children: [
                        /* @__PURE__ */ jsx(
                          "p",
                          {
                            style: {
                              fontSize: "11px",
                              color: "rgba(255,255,255,0.7)",
                              margin: "0 0 1px"
                            },
                            children: currentUser.roleLabel
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "p",
                          {
                            style: {
                              fontSize: "14px",
                              fontWeight: "700",
                              color: "#FFFFFF",
                              margin: 0
                            },
                            children: currentUser.name
                          }
                        )
                      ] }),
                      currentUser.bloodGroup && /* @__PURE__ */ jsx(BloodGroupTag, { group: currentUser.bloodGroup }),
                      currentUser.isAvailable && /* @__PURE__ */ jsxs(
                        "span",
                        {
                          style: {
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            backgroundColor: "#D5F5E3",
                            color: "#1E8449",
                            fontSize: "10px",
                            fontWeight: "700",
                            paddingInline: "8px",
                            paddingBlock: "4px",
                            borderRadius: "999px"
                          },
                          children: [
                            /* @__PURE__ */ jsx(
                              "span",
                              {
                                style: {
                                  width: "5px",
                                  height: "5px",
                                  borderRadius: "50%",
                                  backgroundColor: "#27AE60"
                                }
                              }
                            ),
                            "Available"
                          ]
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(
                  "h2",
                  {
                    style: {
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#FFFFFF",
                      margin: "0 0 6px"
                    },
                    children: config.greeting
                  }
                ),
                /* @__PURE__ */ jsx(
                  "p",
                  {
                    style: {
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.82)",
                      margin: "0 0 16px",
                      lineHeight: "1.5"
                    },
                    children: config.body
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: handleOpenCreateRequest,
                    style: {
                      width: "100%",
                      height: "44px",
                      backgroundColor: "#FFFFFF",
                      color: "#C0392B",
                      fontSize: "14px",
                      fontWeight: "700",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "7px",
                      fontFamily: "inherit"
                    },
                    children: [
                      /* @__PURE__ */ jsx(config.ctaIcon, { size: 16, color: "#C0392B" }),
                      config.cta
                    ]
                  }
                )
              ]
            }
          ),
          requestSuccess && /* @__PURE__ */ jsx(
            "div",
            {
              role: "status",
              style: {
                margin: "12px 12px 0",
                backgroundColor: "#D5F5E3",
                borderRadius: "10px",
                padding: "12px 14px",
                color: "#1E8449",
                fontSize: "13px",
                fontWeight: "700",
                border: "1px solid #ABEBC6"
              },
              children: requestSuccess
            }
          ),
          (matchingState.loading || matchingState.request) && /* @__PURE__ */ jsxs(
            "section",
            {
              style: {
                margin: "12px 12px 0",
                backgroundColor: "#FFFFFF",
                borderRadius: "10px",
                padding: "14px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              },
              children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h2", { style: { margin: "0 0 3px", fontSize: "15px", fontWeight: "800", color: "#1A1A1A" }, children: "Eligible Donors" }),
                  /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: "12px", color: "#6B6B6B", lineHeight: "1.5" }, children: matchingState.loading ? "Searching compatible verified donors nearby..." : "Select up to 4 donors to notify." })
                ] }),
                matchingState.loading && /* @__PURE__ */ jsxs(
                  "div",
                  {
                    style: {
                      minHeight: "92px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      backgroundColor: "#F4F4F4",
                      borderRadius: "8px"
                    },
                    children: [
                      /* @__PURE__ */ jsx(
                        "span",
                        {
                          style: {
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            border: "3px solid #FADBD8",
                            borderTopColor: "#C0392B",
                            animation: "spin 900ms linear infinite"
                          }
                        }
                      ),
                      /* @__PURE__ */ jsx("span", { style: { fontSize: "12px", color: "#922B21", fontWeight: "800" }, children: "Matching donors" })
                    ]
                  }
                ),
                !matchingState.loading && matchingState.matches.length > 0 && /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: "8px" }, children: matchingState.matches.map((match) => {
                  const checked = matchingState.selectedIds.includes(match.id);
                  return /* @__PURE__ */ jsxs(
                    "label",
                    {
                      style: {
                        display: "grid",
                        gridTemplateColumns: "auto 1fr auto",
                        gap: "10px",
                        alignItems: "center",
                        border: `1.5px solid ${checked ? "#C0392B" : "#E0E0E0"}`,
                        borderRadius: "8px",
                        padding: "10px",
                        cursor: matchingState.sent ? "default" : "pointer",
                        backgroundColor: checked ? "#FADBD8" : "#FFFFFF"
                      },
                      children: [
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            type: "checkbox",
                            checked,
                            disabled: matchingState.sent,
                            onChange: () => toggleSelectedMatch(match.id),
                            style: { width: "18px", height: "18px", accentColor: "#C0392B" }
                          }
                        ),
                        /* @__PURE__ */ jsxs("div", { children: [
                          /* @__PURE__ */ jsx("p", { style: { margin: "0 0 2px", fontSize: "13px", fontWeight: "800", color: "#1A1A1A" }, children: match.donor?.full_name ?? "Eligible donor" }),
                          /* @__PURE__ */ jsxs("p", { style: { margin: 0, fontSize: "11px", color: "#6B6B6B" }, children: [
                            match.donor?.blood_type ?? "Blood type",
                            " donor",
                            match.distance_km != null ? ` · ${match.distance_km} km away` : ""
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxs("span", { style: { fontSize: "11px", fontWeight: "800", color: "#922B21" }, children: [
                          "#",
                          match.match_rank ?? "-"
                        ] })
                      ]
                    },
                    match.id
                  );
                }) }),
                matchingState.error && /* @__PURE__ */ jsx(
                  "p",
                  {
                    role: "alert",
                    style: {
                      margin: 0,
                      borderRadius: "8px",
                      backgroundColor: "#FADBD8",
                      color: "#922B21",
                      fontSize: "12px",
                      fontWeight: "700",
                      padding: "10px 12px"
                    },
                    children: matchingState.error
                  }
                ),
                !matchingState.loading && matchingState.matches.length > 0 && /* @__PURE__ */ jsx(
                  PrimaryButton,
                  {
                    onClick: handleSendSelectedDonors,
                    disabled: matchingState.sent || matchingState.sending || matchingState.selectedIds.length === 0,
                    icon: Plus,
                    children: matchingState.sent ? "Sent to Donors" : matchingState.sending ? "Sending..." : "Send to Selected Donors"
                  }
                )
              ]
            }
          ),
          unreadCount > 0 && /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                margin: "12px 12px 0",
                backgroundColor: "#FADBD8",
                borderRadius: "10px",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                border: "1px solid #F1948A"
              },
              children: [
                /* @__PURE__ */ jsx(Bell, { size: 16, color: "#922B21" }),
                /* @__PURE__ */ jsxs(
                  "span",
                  {
                    style: {
                      flex: 1,
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#922B21"
                    },
                    children: [
                      unreadCount,
                      " unread notification",
                      unreadCount > 1 ? "s" : "",
                      " — tap the bell to clear"
                    ]
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs("section", { style: { padding: "20px 12px 0" }, children: [
            /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px"
                },
                children: [
                  /* @__PURE__ */ jsx(
                    "h2",
                    {
                      style: {
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#1A1A1A",
                        margin: 0
                      },
                      children: "Active Requests"
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "span",
                    {
                      style: {
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#C0392B",
                        backgroundColor: "#FADBD8",
                        paddingInline: "8px",
                        paddingBlock: "3px",
                        borderRadius: "999px"
                      },
                      children: [
                        activeRequests.length,
                        " ",
                        "active"
                      ]
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                style: { display: "flex", flexDirection: "column", gap: "10px" },
                children: activeRequests.map((req) => /* @__PURE__ */ jsxs("div", { style: { position: "relative" }, children: [
                  /* @__PURE__ */ jsx(
                    RequestCard,
                    {
                      request: req,
                      onClick: () => navigate(`/requests/${req.id}`)
                    }
                  ),
                  canDeleteRequest$1(req) && /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      "aria-label": "Delete request",
                      onClick: () => handleDeleteRequest(req),
                      disabled: deletingRequestId === req.id,
                      style: {
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        border: "1px solid #F1948A",
                        backgroundColor: "#FFFFFF",
                        color: "#922B21",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: deletingRequestId === req.id ? "not-allowed" : "pointer"
                      },
                      children: /* @__PURE__ */ jsx(Trash2, { size: 15 })
                    }
                  )
                ] }, req.id))
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { style: { padding: "24px 12px 0" }, children: /* @__PURE__ */ jsx(SecondaryButton, { onClick: logout, icon: LogOut, children: "Sign Out" }) })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      BottomNavBar,
      {
        onNavigate: (key) => {
          if (key === "profile") navigate("/profile");
        }
      }
    ),
    showRequestForm && /* @__PURE__ */ jsx(
      PatientRequestSheet,
      {
        onClose: () => setShowRequestForm(false),
        onSubmit: handleCreateRequest,
        isSubmitting: requestSubmitting,
        submitError: requestError
      }
    ),
    /* @__PURE__ */ jsx("style", { jsx: true, global: true, children: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { margin: 0; padding: 0; }
      ` })
  ] });
}
const page$o = UNSAFE_withComponentProps(function WrappedPage3(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(DashboardPage, {
      ...props
    })
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$o
}, Symbol.toStringTag, { value: "Module" }));
const ROLE_HOME_ROUTE$3 = {
  donor: "/donor/home",
  requester: "/dashboard",
  patient_family: "/dashboard",
  hospital: "/hospital/dashboard",
  hospital_officer: "/hospital/dashboard"
};
function formatDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Not recorded";
  return date.toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}
function DonationHistoryPage() {
  const navigate = useNavigate$1();
  const { currentUser, isAuthenticated, markAllNotificationsRead } = useApp();
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);
  useEffect(() => {
    if (!isAuthenticated) return;
    let alive = true;
    setLoading(true);
    apiGetMatches().then(({ matches: rows }) => {
      if (!alive) return;
      setMatches((rows ?? []).filter((match) => match.donation_completed_at));
      setError(null);
    }).catch((err) => {
      if (!alive) return;
      setMatches([]);
      setError(err?.message ?? "Unable to load donation history.");
    }).finally(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [isAuthenticated]);
  if (!currentUser) return null;
  const homeRoute = ROLE_HOME_ROUTE$3[currentUser.role] ?? "/dashboard";
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", flex: 1, paddingBottom: "80px" }, children: [
      /* @__PURE__ */ jsx(TopAppBar, { title: "Donation History", onBellPress: markAllNotificationsRead }),
      /* @__PURE__ */ jsxs("main", { style: { padding: "16px 12px 20px", display: "flex", flexDirection: "column", gap: "12px" }, children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => navigate(-1),
            "aria-label": "Back",
            style: {
              width: "36px",
              height: "36px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#F4F4F4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            },
            children: /* @__PURE__ */ jsx(ChevronLeft, { size: 20, color: "#1A1A1A" })
          }
        ),
        /* @__PURE__ */ jsxs(
          "section",
          {
            style: {
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
              padding: "16px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            },
            children: [
              /* @__PURE__ */ jsx(Award, { size: 22, color: "#C0392B" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { style: { margin: "0 0 2px", fontSize: "22px", fontWeight: "800", color: "#1A1A1A" }, children: matches.length }),
                /* @__PURE__ */ jsxs("p", { style: { margin: 0, fontSize: "12px", color: "#6B6B6B", fontWeight: "700" }, children: [
                  "completed donation",
                  matches.length === 1 ? "" : "s"
                ] })
              ] })
            ]
          }
        ),
        loading && /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: "13px", color: "#6B6B6B" }, children: "Loading donation history..." }),
        error && /* @__PURE__ */ jsx("p", { style: { margin: 0, color: "#922B21", fontSize: "13px", fontWeight: "700" }, children: error }),
        !loading && !error && matches.length === 0 && /* @__PURE__ */ jsxs(
          "section",
          {
            style: {
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
              padding: "32px 18px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              textAlign: "center"
            },
            children: [
              /* @__PURE__ */ jsx(Droplets, { size: 38, color: "#C8C8C8" }),
              /* @__PURE__ */ jsx("p", { style: { margin: "10px 0 0", fontSize: "14px", fontWeight: "700", color: "#6B6B6B" }, children: "No completed donations yet" })
            ]
          }
        ),
        matches.map((match) => /* @__PURE__ */ jsxs(
          "section",
          {
            style: {
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
              padding: "14px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            },
            children: [
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "flex-start" }, children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { style: { margin: "0 0 3px", fontSize: "14px", fontWeight: "800", color: "#1A1A1A" }, children: match.request?.hospital_name ?? "Blood request" }),
                  /* @__PURE__ */ jsxs("p", { style: { margin: 0, fontSize: "12px", color: "#6B6B6B" }, children: [
                    match.request?.blood_type_needed ?? "Blood",
                    " donation"
                  ] })
                ] }),
                /* @__PURE__ */ jsx(RequestStatusBadge, { status: "fulfilled", size: "sm" })
              ] }),
              /* @__PURE__ */ jsxs("span", { style: { display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#4A4A4A" }, children: [
                /* @__PURE__ */ jsx(Clock, { size: 13, color: "#6B6B6B" }),
                formatDate(match.donation_completed_at)
              ] })
            ]
          },
          match.id
        ))
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      BottomNavBar,
      {
        onNavigate: (key) => {
          if (key === "home") navigate(homeRoute);
          if (key === "profile") navigate("/profile");
        }
      }
    )
  ] });
}
const page$n = UNSAFE_withComponentProps(function WrappedPage4(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(DonationHistoryPage, {
      ...props
    })
  });
});
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$n
}, Symbol.toStringTag, { value: "Module" }));
function normalizeAssignedMatch(match) {
  const request = match.request ?? {};
  return {
    matchId: match.id,
    id: request.id ?? match.request_id,
    tier: request.urgency_tier === "SOS" ? "sos" : "standard",
    bloodGroup: request.blood_type_needed ?? null,
    unitsNeeded: request.units_needed ?? 1,
    unitsFulfilled: request.units_fulfilled ?? 0,
    hospitalName: request.hospital_name ?? "Hospital",
    ward: request.patient_ref ?? "Blood request",
    patientCode: request.patient_ref ?? null,
    status: "pending",
    requestDate: match.notified_at ?? request.created_at ?? (/* @__PURE__ */ new Date()).toISOString(),
    urgencyNote: request.urgency_note ?? null,
    location: request.location ?? null,
    distanceKm: match.distance_km
  };
}
const DONATION_COOLDOWN_DAYS$1 = 56;
const MS_PER_DAY$1 = 864e5;
function getCooldownDaysRemaining$1(lastDonationAt) {
  if (!lastDonationAt) return 0;
  const lastDonationTime = new Date(lastDonationAt).getTime();
  if (!Number.isFinite(lastDonationTime)) return 0;
  const daysSinceDonation = (Date.now() - lastDonationTime) / MS_PER_DAY$1;
  return Math.max(0, Math.ceil(DONATION_COOLDOWN_DAYS$1 - daysSinceDonation));
}
function formatDonationDate(lastDonationAt) {
  if (!lastDonationAt) return "Never";
  const date = new Date(lastDonationAt);
  if (Number.isNaN(date.getTime())) return "Never";
  return date.toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}
function DonorHomePage() {
  const {
    currentUser,
    isAuthenticated,
    donorAvailable,
    toggleDonorAvailable,
    incomingMatchAlert,
    dismissMatchAlert,
    markAllNotificationsRead,
    refreshCurrentUser
  } = useApp();
  const navigate = useNavigate$1();
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  const [toggling, setToggling] = useState(false);
  const [assignedMatches, setAssignedMatches] = useState([]);
  const [matchesError, setMatchesError] = useState(null);
  const [rewardPoints, setRewardPoints] = useState(currentUser?.rewardPoints ?? 0);
  useEffect(() => {
    if (!isAuthenticated) return;
    refreshCurrentUser?.().catch((error) => {
      console.error("[DonorHome] Failed to refresh donor profile:", error);
    });
    let alive = true;
    apiGetMatches().then(({ matches }) => {
      if (!alive) return;
      setAssignedMatches((matches ?? []).map(normalizeAssignedMatch));
      setMatchesError(null);
    }).catch((error) => {
      if (!alive) return;
      console.error("[DonorHome] Failed to load assigned matches:", error);
      setAssignedMatches([]);
      setMatchesError(error.message ?? "Failed to load matches");
    });
    return () => {
      alive = false;
    };
  }, [isAuthenticated, refreshCurrentUser]);
  useEffect(() => {
    if (!currentUser?.id) return;
    let alive = true;
    setRewardPoints(currentUser.rewardPoints ?? 0);
    supabase.from("users").select("reward_points").eq("id", currentUser.id).maybeSingle().then(({ data, error }) => {
      if (!alive) return;
      if (error) {
        console.error("[DonorHome] Failed to load reward points:", error);
        return;
      }
      setRewardPoints(Number(data?.reward_points ?? currentUser.rewardPoints ?? 0));
    });
    return () => {
      alive = false;
    };
  }, [currentUser?.id, currentUser?.rewardPoints]);
  const handleToggle = async () => {
    if (isCoolingDown) return;
    setToggling(true);
    await new Promise((r) => setTimeout(r, 250));
    toggleDonorAvailable();
    setToggling(false);
  };
  const activeRequests = assignedMatches;
  const realIncomingMatchAlert = incomingMatchAlert && assignedMatches.some((assignedMatch) => assignedMatch.matchId === incomingMatchAlert.matchId) ? incomingMatchAlert : null;
  const handleAcceptMatch = () => {
    if (typeof window !== "undefined" && realIncomingMatchAlert) {
      navigate(`/donor/match/${realIncomingMatchAlert.matchId}`);
    }
  };
  if (!currentUser) return null;
  const today = /* @__PURE__ */ new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const lastDonationAt = currentUser.lastDonationAt ?? currentUser.lastDonated ?? null;
  const lastDonationLabel = formatDonationDate(lastDonationAt);
  const cooldownDays = getCooldownDaysRemaining$1(lastDonationAt);
  const isCoolingDown = cooldownDays > 0;
  const hasDonationHistory = Boolean(lastDonationAt) || Number(currentUser.totalDonations ?? 0) > 0;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          flex: 1,
          paddingBottom: "80px"
        },
        children: [
          /* @__PURE__ */ jsx(TopAppBar, { title: "LyfeBlood", onBellPress: markAllNotificationsRead }),
          realIncomingMatchAlert && /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                backgroundColor: "#FADBD8",
                borderBottom: "1px solid #F1948A",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                animation: "slideDown 0.3s ease"
              },
              children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    style: {
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#C0392B",
                      flexShrink: 0,
                      animation: "pulseDot 1.2s infinite"
                    }
                  }
                ),
                /* @__PURE__ */ jsxs("div", { style: { flex: 1 }, children: [
                  /* @__PURE__ */ jsx(
                    "p",
                    {
                      style: {
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "#922B21",
                        margin: "0 0 2px"
                      },
                      children: "🚨 Urgent Match Found"
                    }
                  ),
                  /* @__PURE__ */ jsxs("p", { style: { fontSize: "12px", color: "#922B21", margin: 0 }, children: [
                    realIncomingMatchAlert.bloodGroup,
                    " needed at",
                    " ",
                    realIncomingMatchAlert.hospitalName
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: handleAcceptMatch,
                    style: {
                      backgroundColor: "#C0392B",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "8px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      flexShrink: 0
                    },
                    children: "View →"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: dismissMatchAlert,
                    style: {
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      color: "#922B21",
                      flexShrink: 0
                    },
                    children: /* @__PURE__ */ jsx(X, { size: 16 })
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                margin: "12px 12px 0",
                background: "linear-gradient(135deg, #922B21 0%, #C0392B 100%)",
                borderRadius: "12px",
                padding: "20px",
                position: "relative",
                overflow: "hidden"
              },
              children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    style: {
                      position: "absolute",
                      top: "-30px",
                      right: "-30px",
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(255,255,255,0.06)"
                    }
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: "16px"
                    },
                    children: [
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsxs(
                          "p",
                          {
                            style: {
                              fontSize: "12px",
                              color: "rgba(255,255,255,0.7)",
                              margin: "0 0 3px"
                            },
                            children: [
                              greeting,
                              ","
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxs(
                          "h2",
                          {
                            style: {
                              fontSize: "20px",
                              fontWeight: "800",
                              color: "#FFFFFF",
                              margin: 0,
                              letterSpacing: "-0.02em"
                            },
                            children: [
                              currentUser.name?.split(" ")[0],
                              " 👋"
                            ]
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsx(BloodGroupTag, { group: currentUser.bloodGroup, size: "lg" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    style: {
                      display: "flex",
                      gap: "8px",
                      marginBottom: "18px"
                    },
                    children: [
                      {
                        icon: Award,
                        label: "Donations",
                        value: currentUser.totalDonations || 0
                      },
                      {
                        icon: Clock,
                        label: "Last Donated",
                        value: lastDonationLabel
                      },
                      { icon: MapPin, label: "Location", value: "Owerri N." }
                    ].map(({ icon: Icon, label, value }) => /* @__PURE__ */ jsxs(
                      "div",
                      {
                        style: {
                          flex: 1,
                          backgroundColor: "rgba(255,255,255,0.12)",
                          borderRadius: "8px",
                          padding: "10px 8px",
                          textAlign: "center"
                        },
                        children: [
                          /* @__PURE__ */ jsx(
                            Icon,
                            {
                              size: 14,
                              color: "rgba(255,255,255,0.7)",
                              style: { marginBottom: "4px" }
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            "p",
                            {
                              style: {
                                fontSize: "16px",
                                fontWeight: "800",
                                color: "#FFFFFF",
                                margin: "0 0 1px",
                                lineHeight: 1
                              },
                              children: value
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            "p",
                            {
                              style: {
                                fontSize: "9px",
                                color: "rgba(255,255,255,0.6)",
                                margin: 0,
                                textTransform: "uppercase",
                                letterSpacing: "0.04em"
                              },
                              children: label
                            }
                          )
                        ]
                      },
                      label
                    ))
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    style: {
                      backgroundColor: "rgba(255,255,255,0.12)",
                      borderRadius: "10px",
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      border: "1px solid rgba(255,255,255,0.15)"
                    },
                    children: [
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx(
                          "p",
                          {
                            style: {
                              fontSize: "13px",
                              fontWeight: "700",
                              color: "#FFFFFF",
                              margin: "0 0 2px"
                            },
                            children: "Live Availability"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "p",
                          {
                            style: {
                              fontSize: "11px",
                              color: "rgba(255,255,255,0.65)",
                              margin: 0
                            },
                            children: donorAvailable ? isCoolingDown ? "Cooldown active. Donation actions are disabled" : "You are visible to hospitals & patients" : "You are hidden from all requests"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxs(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexShrink: 0
                          },
                          children: [
                            donorAvailable && !isCoolingDown && /* @__PURE__ */ jsxs(
                              "span",
                              {
                                style: {
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  backgroundColor: "#D5F5E3",
                                  color: "#1E8449",
                                  fontSize: "10px",
                                  fontWeight: "700",
                                  paddingInline: "8px",
                                  paddingBlock: "3px",
                                  borderRadius: "999px"
                                },
                                children: [
                                  /* @__PURE__ */ jsx(
                                    "span",
                                    {
                                      style: {
                                        width: "5px",
                                        height: "5px",
                                        borderRadius: "50%",
                                        backgroundColor: "#27AE60",
                                        animation: "pulseDot 1.5s infinite"
                                      }
                                    }
                                  ),
                                  "Available"
                                ]
                              }
                            ),
                            /* @__PURE__ */ jsx(
                              "button",
                              {
                                onClick: handleToggle,
                                disabled: toggling || isCoolingDown,
                                "aria-label": "Toggle availability",
                                style: {
                                  width: "52px",
                                  height: "28px",
                                  borderRadius: "14px",
                                  backgroundColor: donorAvailable && !isCoolingDown ? "#27AE60" : "rgba(255,255,255,0.25)",
                                  border: "none",
                                  cursor: toggling || isCoolingDown ? "not-allowed" : "pointer",
                                  position: "relative",
                                  transition: "background-color 250ms",
                                  outline: "none",
                                  flexShrink: 0
                                },
                                children: /* @__PURE__ */ jsx(
                                  "span",
                                  {
                                    style: {
                                      position: "absolute",
                                      top: "3px",
                                      left: donorAvailable && !isCoolingDown ? "26px" : "3px",
                                      width: "22px",
                                      height: "22px",
                                      borderRadius: "50%",
                                      backgroundColor: "#FFFFFF",
                                      transition: "left 250ms cubic-bezier(0.4, 0, 0.2, 1)",
                                      boxShadow: "0 1px 4px rgba(0,0,0,0.2)"
                                    }
                                  }
                                )
                              }
                            )
                          ]
                        }
                      )
                    ]
                  }
                ),
                hasDonationHistory && /* @__PURE__ */ jsxs(
                  "div",
                  {
                    style: {
                      marginTop: "10px",
                      backgroundColor: cooldownDays > 0 ? "rgba(250, 219, 216, 0.18)" : "rgba(213, 245, 227, 0.16)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      borderRadius: "8px",
                      padding: "10px 12px"
                    },
                    children: [
                      /* @__PURE__ */ jsx(
                        "p",
                        {
                          style: {
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "#FFFFFF",
                            margin: "0 0 2px"
                          },
                          children: "56-day donation cooldown"
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "p",
                        {
                          style: {
                            fontSize: "11px",
                            color: "rgba(255,255,255,0.72)",
                            margin: 0,
                            lineHeight: "1.4"
                          },
                          children: cooldownDays > 0 ? `${cooldownDays} day${cooldownDays === 1 ? "" : "s"} remaining before you can accept another donation.` : "Cooldown complete. You can accept assigned requests when available."
                        }
                      )
                    ]
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs("section", { style: { padding: "20px 12px 0" }, children: [
            /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px"
                },
                children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(
                      "h2",
                      {
                        style: {
                          fontSize: "16px",
                          fontWeight: "700",
                          color: "#1A1A1A",
                          margin: 0
                        },
                        children: "Assigned Requests"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "p",
                      {
                        style: {
                          fontSize: "11px",
                          color: "#6B6B6B",
                          margin: "2px 0 0"
                        },
                        children: "Real matches assigned to you"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs(
                    "span",
                    {
                      style: {
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#C0392B",
                        backgroundColor: "#FADBD8",
                        paddingInline: "8px",
                        paddingBlock: "3px",
                        borderRadius: "999px"
                      },
                      children: [
                        activeRequests.length,
                        " open"
                      ]
                    }
                  )
                ]
              }
            ),
            activeRequests.length === 0 ? /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "48px 24px",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "12px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.07)"
                },
                children: [
                  /* @__PURE__ */ jsx(
                    Droplets,
                    {
                      size: 48,
                      color: "#C8C8C8",
                      strokeWidth: 1.5,
                      style: { marginBottom: "12px" }
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "p",
                    {
                      style: {
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#6B6B6B",
                        margin: "0 0 4px",
                        textAlign: "center"
                      },
                      children: matchesError ? "Unable to load matches" : "No assigned requests right now"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "p",
                    {
                      style: {
                        fontSize: "12px",
                        color: "#C8C8C8",
                        margin: 0,
                        textAlign: "center",
                        lineHeight: "1.5"
                      },
                      children: matchesError ?? "When the backend matching engine assigns you to a request, it will appear here."
                    }
                  )
                ]
              }
            ) : /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                },
                children: [
                  isCoolingDown && /* @__PURE__ */ jsx(
                    "p",
                    {
                      style: {
                        margin: 0,
                        borderRadius: "8px",
                        backgroundColor: "#FADBD8",
                        color: "#922B21",
                        fontSize: "12px",
                        fontWeight: "700",
                        padding: "10px 12px"
                      },
                      children: "Donation actions are disabled until your cooldown ends."
                    }
                  ),
                  activeRequests.map((req) => /* @__PURE__ */ jsx(
                    RequestCard,
                    {
                      request: req,
                      onClick: () => {
                        if (isCoolingDown) return;
                        if (typeof window !== "undefined") {
                          navigate(`/donor/match/${req.matchId}`);
                        }
                      }
                    },
                    req.id
                  ))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx("section", { style: { padding: "16px 12px 0" }, children: /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                backgroundColor: "#FFFFFF",
                borderRadius: "8px",
                padding: "16px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              },
              children: [
                /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }, children: [
                  /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
                    /* @__PURE__ */ jsx(Award, { size: 18, color: "#C0392B" }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("h2", { style: { fontSize: "15px", fontWeight: "800", color: "#1A1A1A", margin: 0 }, children: "Rewards" }),
                      /* @__PURE__ */ jsx("p", { style: { fontSize: "12px", color: "#6B6B6B", margin: "2px 0 0" }, children: "Benefits marketplace coming soon" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      style: {
                        backgroundColor: "#FADBD8",
                        color: "#922B21",
                        borderRadius: "999px",
                        padding: "5px 10px",
                        fontSize: "11px",
                        fontWeight: "800",
                        whiteSpace: "nowrap"
                      },
                      children: "Coming Soon"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }, children: [
                  /* @__PURE__ */ jsxs("div", { style: { backgroundColor: "#F8F8F8", borderRadius: "8px", padding: "12px" }, children: [
                    /* @__PURE__ */ jsx("p", { style: { fontSize: "10px", fontWeight: "800", color: "#6B6B6B", margin: "0 0 4px", textTransform: "uppercase" }, children: "Points" }),
                    /* @__PURE__ */ jsx("p", { style: { fontSize: "22px", fontWeight: "800", color: "#1A1A1A", margin: 0 }, children: rewardPoints })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { style: { backgroundColor: "#F8F8F8", borderRadius: "8px", padding: "12px" }, children: [
                    /* @__PURE__ */ jsx("p", { style: { fontSize: "10px", fontWeight: "800", color: "#6B6B6B", margin: "0 0 4px", textTransform: "uppercase" }, children: "History" }),
                    /* @__PURE__ */ jsx("p", { style: { fontSize: "12px", fontWeight: "700", color: "#4A4A4A", margin: 0, lineHeight: "1.4" }, children: "Reward history will appear after partner rewards launch." })
                  ] })
                ] })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxs("section", { style: { padding: "16px 12px 0" }, children: [
            /* @__PURE__ */ jsx(
              "h2",
              {
                style: {
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#1A1A1A",
                  margin: "0 0 10px"
                },
                children: "Quick Actions"
              }
            ),
            /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: "8px" }, children: [
              { label: "Donation History", icon: Clock, href: "#" },
              { label: "Update Profile", icon: Award, href: "/profile" }
            ].map(({ label, icon: Icon, href }) => /* @__PURE__ */ jsx(
              "a",
              {
                href,
                style: { flex: 1, textDecoration: "none" },
                children: /* @__PURE__ */ jsxs(
                  "div",
                  {
                    style: {
                      backgroundColor: "#FFFFFF",
                      borderRadius: "10px",
                      padding: "14px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.07)"
                    },
                    children: [
                      /* @__PURE__ */ jsxs(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                          },
                          children: [
                            /* @__PURE__ */ jsx(Icon, { size: 16, color: "#C0392B" }),
                            /* @__PURE__ */ jsx(
                              "span",
                              {
                                style: {
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  color: "#1A1A1A"
                                },
                                children: label
                              }
                            )
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsx(ChevronRight, { size: 14, color: "#C8C8C8" })
                    ]
                  }
                )
              },
              label
            )) })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      BottomNavBar,
      {
        onNavigate: (key) => {
          if (typeof window === "undefined") return;
          if (key === "home") navigate("/donor/home");
          if (key === "profile") navigate("/profile");
        }
      }
    ),
    /* @__PURE__ */ jsx("style", { jsx: true, global: true, children: `
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { margin: 0; padding: 0; }
      ` })
  ] });
}
const page$m = UNSAFE_withComponentProps(function WrappedPage5(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(DonorHomePage, {
      ...props
    })
  });
});
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$m
}, Symbol.toStringTag, { value: "Module" }));
const REQUEST_ORDER = [
  "pending",
  "verified",
  "donor_matched",
  "checked_in",
  "blood_collected",
  "fulfilled"
];
function requestAtLeast(status, target) {
  const statusIndex = REQUEST_ORDER.indexOf(status);
  const targetIndex = REQUEST_ORDER.indexOf(target);
  return statusIndex >= targetIndex && targetIndex >= 0;
}
function hasAnyMatch(matches) {
  return (matches ?? []).length > 0;
}
function hasAcceptedMatch(matches, match) {
  return match?.match_status === "Accepted" || (matches ?? []).some((item) => item.match_status === "Accepted");
}
function findActiveMatch(matches, match) {
  return match ?? (matches ?? []).find((item) => item.match_status === "Accepted") ?? (matches ?? [])[0] ?? null;
}
function buildDonationJourney({ request, match, matches = [] }) {
  const activeMatch = findActiveMatch(matches, match);
  const requestStatus = request?.status ?? "pending";
  const matchingStatus = request?.matching_status ?? request?.matchingStatus ?? "pending";
  const donorAccepted = hasAcceptedMatch(matches, activeMatch);
  const rewardIssued = Boolean(request?.reward_issued_at) || Boolean(activeMatch?.reward_issued_at) || Boolean(activeMatch?.reward_issued) || Boolean(activeMatch?.donation_completed_at) || requestStatus === "fulfilled";
  return [
    {
      key: "request_created",
      label: "Request Created",
      done: Boolean(request?.id || request?.created_at || request?.requestDate)
    },
    {
      key: "donors_matched",
      label: "Donors Matched",
      done: hasAnyMatch(matches) || ["matched", "sent", "accepted", "completed"].includes(matchingStatus) || requestAtLeast(requestStatus, "donor_matched")
    },
    {
      key: "donor_accepted",
      label: "Donor Accepted",
      done: donorAccepted || ["accepted", "completed"].includes(matchingStatus)
    },
    {
      key: "donor_traveling",
      label: "Donor on the Way",
      done: Boolean(activeMatch?.on_the_way_at)
    },
    {
      key: "donor_arrived",
      label: "Donor Arrived",
      done: Boolean(activeMatch?.arrived_at) || requestAtLeast(requestStatus, "checked_in")
    },
    {
      key: "otp_verified",
      label: "OTP Verified",
      done: requestAtLeast(requestStatus, "checked_in")
    },
    {
      key: "blood_collected",
      label: "Blood Collected",
      done: Boolean(activeMatch?.blood_collected_at) || requestAtLeast(requestStatus, "blood_collected")
    },
    {
      key: "donation_confirmed",
      label: "Donation Confirmed",
      done: Boolean(activeMatch?.donation_completed_at) || requestStatus === "fulfilled"
    },
    {
      key: "reward_issued",
      label: "Reward Issued",
      done: rewardIssued
    }
  ];
}
function DonationJourney({ request, match, matches = [] }) {
  const stages = buildDonationJourney({ request, match, matches });
  const completedCount = stages.filter((stage) => stage.done).length;
  const currentIndex = stages.findIndex((stage) => !stage.done);
  const activeIndex = currentIndex === -1 ? stages.length - 1 : currentIndex;
  const progress = Math.round(completedCount / stages.length * 100);
  return /* @__PURE__ */ jsxs(
    "section",
    {
      style: {
        backgroundColor: "#FFFFFF",
        borderRadius: "8px",
        padding: "16px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "14px"
      },
      children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { style: { margin: 0, fontSize: "15px", fontWeight: "800", color: "#1A1A1A" }, children: "Donation Journey" }),
            /* @__PURE__ */ jsxs("p", { style: { margin: "2px 0 0", fontSize: "12px", color: "#6B6B6B" }, children: [
              progress,
              "% complete"
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "span",
            {
              style: {
                backgroundColor: "#FADBD8",
                color: "#922B21",
                borderRadius: "999px",
                padding: "4px 9px",
                fontSize: "11px",
                fontWeight: "800",
                whiteSpace: "nowrap"
              },
              children: stages[activeIndex]?.label
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { style: { height: "8px", borderRadius: "999px", backgroundColor: "#F4F4F4", overflow: "hidden" }, children: /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              width: `${progress}%`,
              height: "100%",
              backgroundColor: "#C0392B",
              borderRadius: "999px",
              transition: "width 200ms ease"
            }
          }
        ) }),
        /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: "10px" }, children: stages.map((stage, index) => {
          const isCurrent = index === activeIndex && !stage.done;
          const Icon = stage.done ? CheckCircle2 : isCurrent ? Clock : Circle;
          return /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, children: [
            /* @__PURE__ */ jsx(
              Icon,
              {
                size: 18,
                color: stage.done ? "#1E8449" : isCurrent ? "#C0392B" : "#C8C8C8",
                style: { flexShrink: 0 }
              }
            ),
            /* @__PURE__ */ jsx(
              "span",
              {
                style: {
                  fontSize: "13px",
                  fontWeight: isCurrent || stage.done ? "800" : "600",
                  color: stage.done ? "#1A1A1A" : isCurrent ? "#922B21" : "#6B6B6B"
                },
                children: stage.label
              }
            )
          ] }, stage.key);
        }) })
      ]
    }
  );
}
const DONATION_COOLDOWN_DAYS = 56;
const MS_PER_DAY = 864e5;
function getCooldownDaysRemaining(lastDonationAt) {
  if (!lastDonationAt) return 0;
  const lastDonationTime = new Date(lastDonationAt).getTime();
  if (!Number.isFinite(lastDonationTime)) return 0;
  const daysSinceDonation = (Date.now() - lastDonationTime) / MS_PER_DAY;
  return Math.max(0, Math.ceil(DONATION_COOLDOWN_DAYS - daysSinceDonation));
}
function MapWidget({ distanceKm, hospitalName }) {
  const [bearing, setBearing] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setBearing((b) => (b + 0.4) % 360), 50);
    return () => clearInterval(interval);
  }, []);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        position: "relative",
        width: "100%",
        height: "220px",
        borderRadius: "12px",
        overflow: "hidden",
        background: "linear-gradient(160deg, #1a3a2a 0%, #1e4530 50%, #162d20 100%)"
      },
      children: [
        Array.from({ length: 7 }).map((_, i) => /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              position: "absolute",
              left: 0,
              right: 0,
              top: `${(i + 1) * 13}%`,
              height: "1px",
              backgroundColor: "rgba(255,255,255,0.06)"
            }
          },
          `h${i}`
        )),
        Array.from({ length: 7 }).map((_, i) => /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${(i + 1) * 13}%`,
              width: "1px",
              backgroundColor: "rgba(255,255,255,0.06)"
            }
          },
          `v${i}`
        )),
        /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "160px",
              height: "160px",
              borderRadius: "50%",
              border: "1.5px dashed rgba(192, 57, 43, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            },
            children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  style: {
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    fontSize: "9px",
                    color: "rgba(192,57,43,0.7)",
                    fontWeight: "600"
                  },
                  children: "20km"
                }
              ),
              /* @__PURE__ */ jsxs("div", { style: { position: "relative" }, children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    style: {
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      backgroundColor: "#27AE60",
                      border: "2.5px solid #FFFFFF",
                      boxShadow: "0 0 0 6px rgba(39,174,96,0.2)",
                      animation: "gpsPulse 2s infinite"
                    }
                  }
                ),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    style: {
                      position: "absolute",
                      top: "-20px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "9px",
                      color: "#27AE60",
                      fontWeight: "700",
                      whiteSpace: "nowrap"
                    },
                    children: "YOU"
                  }
                )
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              position: "absolute",
              top: "28%",
              right: "22%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px"
            },
            children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  style: {
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: "#C0392B",
                    border: "2.5px solid #FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                    animation: "pinBounce 2s ease-in-out infinite"
                  },
                  children: /* @__PURE__ */ jsx(Building2, { size: 13, color: "#FFFFFF" })
                }
              ),
              /* @__PURE__ */ jsx(
                "div",
                {
                  style: {
                    backgroundColor: "rgba(192,57,43,0.9)",
                    borderRadius: "4px",
                    paddingInline: "5px",
                    paddingBlock: "2px"
                  },
                  children: /* @__PURE__ */ jsx(
                    "span",
                    {
                      style: {
                        fontSize: "8px",
                        color: "#FFFFFF",
                        fontWeight: "700",
                        whiteSpace: "nowrap"
                      },
                      children: "FMC Owerri"
                    }
                  )
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "svg",
          {
            style: {
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none"
            },
            children: /* @__PURE__ */ jsx(
              "line",
              {
                x1: "50%",
                y1: "50%",
                x2: "78%",
                y2: "30%",
                stroke: "#C0392B",
                strokeWidth: "2",
                strokeDasharray: "6 4",
                strokeOpacity: "0.7"
              }
            )
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              position: "absolute",
              bottom: "12px",
              left: "12px",
              backgroundColor: "rgba(0,0,0,0.7)",
              borderRadius: "8px",
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backdropFilter: "blur(4px)"
            },
            children: [
              /* @__PURE__ */ jsx(Navigation, { size: 13, color: "#27AE60" }),
              /* @__PURE__ */ jsxs("span", { style: { fontSize: "13px", fontWeight: "700", color: "#FFFFFF" }, children: [
                distanceKm ?? 4.2,
                " km away"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              position: "absolute",
              top: "12px",
              right: "12px",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            },
            children: /* @__PURE__ */ jsx(
              Navigation,
              {
                size: 15,
                color: "#FFFFFF",
                style: {
                  transform: `rotate(${bearing}deg)`,
                  transition: "transform 50ms linear"
                }
              }
            )
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              position: "absolute",
              top: "12px",
              left: "12px",
              backgroundColor: "rgba(0,0,0,0.5)",
              borderRadius: "6px",
              paddingInline: "8px",
              paddingBlock: "4px",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            },
            children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  style: {
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#C0392B",
                    animation: "gpsPulse 1.5s infinite"
                  }
                }
              ),
              /* @__PURE__ */ jsx("span", { style: { fontSize: "10px", color: "#FFFFFF", fontWeight: "600" }, children: "Live · Owerri" })
            ]
          }
        )
      ]
    }
  );
}
function MatchPage({ params }) {
  const { matchId } = params;
  const { currentUser, isAuthenticated, dismissMatchAlert, refreshCurrentUser } = useApp();
  const [match, setMatch] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [responding, setResponding] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [respondError, setRespondError] = useState(null);
  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated) {
      window.location.href = "/login";
    }
    if (isAuthenticated) {
      refreshCurrentUser?.().catch((error) => {
        console.error("[DonorMatch] Failed to refresh donor profile:", error);
      });
    }
  }, [isAuthenticated, refreshCurrentUser]);
  useEffect(() => {
    if (!isAuthenticated || !matchId) return;
    let alive = true;
    apiGetMatch(matchId).then(({ match: match2 }) => {
      if (!alive) return;
      if (!match2) {
        setLoadError("Match not found");
        return;
      }
      const request = match2.request ?? {};
      setMatch({
        matchId: match2.id,
        requestId: match2.request_id,
        bloodGroup: request.blood_type_needed ?? null,
        hospitalName: request.hospital_name ?? "Hospital",
        ward: request.patient_ref ?? "Blood request",
        location: request.location ?? "Location unavailable",
        distanceKm: match2.distance_km,
        unitsNeeded: request.units_needed ?? 1,
        urgencyNote: request.urgency_note ?? null,
        patientCode: request.patient_ref ?? null,
        tier: request.urgency_tier === "SOS" ? "sos" : "standard",
        status: match2.match_status,
        rawMatch: match2,
        rawRequest: request
      });
      setLoadError(null);
    }).catch((error) => {
      if (!alive) return;
      setLoadError(error.message ?? "Failed to load match");
    });
    return () => {
      alive = false;
    };
  }, [isAuthenticated, matchId]);
  const handleAccept = async () => {
    setResponding(true);
    setRespondError(null);
    try {
      const response = await apiRespondToMatch({
        match_id: matchId,
        decision: "Accepted"
      });
      if (!response?.otp || !response?.expires_at) {
        throw new Error("OTP was not issued. Please try again.");
      }
      if (typeof window !== "undefined" && response?.otp) {
        window.sessionStorage.setItem(
          `lyfeblood.match.${matchId}.otp`,
          response.otp
        );
        window.sessionStorage.setItem(
          `lyfeblood.match.${matchId}.expires_at`,
          response.expires_at
        );
        window.sessionStorage.setItem(
          `lyfeblood.match.${matchId}.ttl_seconds`,
          String(response.otp_ttl_seconds ?? 900)
        );
        window.sessionStorage.setItem(
          `lyfeblood.match.${matchId}.unlocked_routes`,
          JSON.stringify(response.unlocked_routes ?? {})
        );
      }
      if (typeof window !== "undefined") {
        window.location.href = `/matches/${matchId}/tracking`;
      }
    } catch (error) {
      setRespondError(error?.message ?? "Unable to accept this request");
    } finally {
      setResponding(false);
    }
  };
  const handleDecline = async () => {
    setDeclining(true);
    setRespondError(null);
    try {
      await apiRespondToMatch({ match_id: matchId, decision: "Declined" });
      setDeclined(true);
      dismissMatchAlert();
      await new Promise((r) => setTimeout(r, 800));
      if (typeof window !== "undefined") window.location.href = "/donor/home";
    } catch (error) {
      setRespondError(error?.message ?? "Unable to decline this request");
    } finally {
      setDeclining(false);
    }
  };
  if (declined) {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          flex: 1,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px",
          padding: "24px"
        },
        children: [
          /* @__PURE__ */ jsx(X, { size: 48, color: "#C8C8C8", strokeWidth: 1.5 }),
          /* @__PURE__ */ jsx(
            "p",
            {
              style: {
                fontSize: "16px",
                fontWeight: "600",
                color: "#6B6B6B",
                textAlign: "center"
              },
              children: "Request declined. Redirecting you home…"
            }
          )
        ]
      }
    );
  }
  if (loadError || !match) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          flex: 1,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          color: "#6B6B6B",
          fontWeight: 600
        },
        children: loadError ?? "Loading match..."
      }
    );
  }
  const cooldownDays = getCooldownDaysRemaining(
    currentUser?.lastDonationAt ?? currentUser?.lastDonated
  );
  const isCoolingDown = cooldownDays > 0;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: "100vh"
        },
        children: [
          /* @__PURE__ */ jsxs(
            "header",
            {
              style: {
                backgroundColor: "#922B21",
                padding: "0 16px",
                height: "56px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0
              },
              children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => {
                      if (typeof window !== "undefined")
                        window.location.href = "/donor/home";
                    },
                    style: {
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "rgba(255,255,255,0.8)",
                      padding: 0
                    },
                    children: [
                      /* @__PURE__ */ jsx(ChevronLeft, { size: 18 }),
                      /* @__PURE__ */ jsx("span", { style: { fontSize: "13px", fontWeight: "500" }, children: "Dashboard" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      style: {
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        backgroundColor: "#FFFFFF",
                        animation: "gpsPulse 1.2s infinite"
                      }
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      style: {
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#FFFFFF",
                        letterSpacing: "0.06em"
                      },
                      children: "MATCH ALERT"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(AlertTriangle, { size: 20, color: "#FFFFFF" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                backgroundColor: "#FADBD8",
                padding: "14px 16px",
                borderBottom: "1px solid #F1948A",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              },
              children: [
                /* @__PURE__ */ jsx(AlertTriangle, { size: 18, color: "#922B21" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs(
                    "p",
                    {
                      style: {
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "#922B21",
                        margin: "0 0 1px"
                      },
                      children: [
                        "You have been matched for a ",
                        match.bloodGroup,
                        " request"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "p",
                    {
                      style: {
                        fontSize: "11px",
                        color: "#922B21",
                        margin: 0,
                        opacity: 0.8
                      },
                      children: "Please review and respond quickly to keep your response rate high."
                    }
                  )
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { style: { flex: 1, padding: "16px", overflowY: "auto" }, children: [
            /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "20px 0 16px",
                  gap: "8px"
                },
                children: [
                  /* @__PURE__ */ jsx(
                    "p",
                    {
                      style: {
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "#C0392B",
                        margin: 0,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em"
                      },
                      children: "Blood Group Required"
                    }
                  ),
                  /* @__PURE__ */ jsx(BloodGroupTag, { group: match.bloodGroup, size: "lg" }),
                  /* @__PURE__ */ jsxs(
                    "span",
                    {
                      style: {
                        fontSize: "11px",
                        color: "#6B6B6B",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      },
                      children: [
                        /* @__PURE__ */ jsx(
                          "span",
                          {
                            style: {
                              width: "8px",
                              height: "8px",
                              borderRadius: "2px",
                              backgroundColor: "#922B21",
                              display: "inline-block"
                            }
                          }
                        ),
                        match.tier === "sos" ? "SOS" : "Standard",
                        " · ",
                        match.unitsNeeded,
                        " units needed"
                      ]
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              MapWidget,
              {
                distanceKm: match.distanceKm,
                hospitalName: match.hospitalName
              }
            ),
            /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  backgroundColor: "#FFFFFF",
                  borderRadius: "12px",
                  padding: "18px",
                  marginTop: "12px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
                },
                children: [
                  /* @__PURE__ */ jsx(
                    "p",
                    {
                      style: {
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "#6B6B6B",
                        margin: "0 0 10px",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em"
                      },
                      children: "Request Details"
                    }
                  ),
                  [
                    {
                      icon: Building2,
                      label: "Hospital",
                      value: match.hospitalName
                    },
                    { icon: MapPin, label: "Ward", value: match.ward },
                    { icon: MapPin, label: "Address", value: match.location },
                    {
                      icon: Navigation,
                      label: "Distance",
                      value: `${match.distanceKm} km from your location`
                    },
                    {
                      icon: Clock,
                      label: "Patient Code",
                      value: match.patientCode
                    }
                  ].map(({ icon: Icon, label, value }) => /* @__PURE__ */ jsxs(
                    "div",
                    {
                      style: {
                        display: "flex",
                        gap: "10px",
                        marginBottom: "10px",
                        alignItems: "flex-start"
                      },
                      children: [
                        /* @__PURE__ */ jsx(
                          Icon,
                          {
                            size: 14,
                            color: "#C0392B",
                            style: { marginTop: "2px", flexShrink: 0 }
                          }
                        ),
                        /* @__PURE__ */ jsxs("div", { children: [
                          /* @__PURE__ */ jsx(
                            "p",
                            {
                              style: {
                                fontSize: "11px",
                                color: "#6B6B6B",
                                margin: "0 0 1px"
                              },
                              children: label
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            "p",
                            {
                              style: {
                                fontSize: "13px",
                                fontWeight: "600",
                                color: "#1A1A1A",
                                margin: 0
                              },
                              children: value
                            }
                          )
                        ] })
                      ]
                    },
                    label
                  )),
                  /* @__PURE__ */ jsxs(
                    "div",
                    {
                      style: {
                        backgroundColor: "#FADBD8",
                        borderRadius: "8px",
                        padding: "10px 12px",
                        marginTop: "4px",
                        borderLeft: "3px solid #922B21"
                      },
                      children: [
                        /* @__PURE__ */ jsx(
                          "p",
                          {
                            style: {
                              fontSize: "11px",
                              fontWeight: "700",
                              color: "#922B21",
                              margin: "0 0 2px"
                            },
                            children: "Clinical Note"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "p",
                          {
                            style: {
                              fontSize: "12px",
                              color: "#922B21",
                              margin: 0,
                              lineHeight: "1.5",
                              opacity: 0.9
                            },
                            children: match.urgencyNote
                          }
                        )
                      ]
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsx(DonationJourney, { request: match.rawRequest, match: match.rawMatch }),
            /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  backgroundColor: "#FFFFFF",
                  borderRadius: "12px",
                  padding: "16px",
                  marginTop: "12px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
                },
                children: [
                  /* @__PURE__ */ jsx(
                    "p",
                    {
                      style: {
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#6B6B6B",
                        margin: "0 0 12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em"
                      },
                      children: "If you accept"
                    }
                  ),
                  [
                    {
                      step: "1",
                      text: "A secure 6-digit OTP check-in code will be issued."
                    },
                    {
                      step: "2",
                      text: "Chat and route tracking are unlocked for the accepted match."
                    },
                    {
                      step: "3",
                      text: "Travel to the hospital and present the code to the Lab Manager."
                    },
                    {
                      step: "4",
                      text: "Clinical staff will handle all screening and procedures."
                    }
                  ].map(({ step, text }) => /* @__PURE__ */ jsxs(
                    "div",
                    {
                      style: {
                        display: "flex",
                        gap: "10px",
                        marginBottom: "10px",
                        alignItems: "flex-start"
                      },
                      children: [
                        /* @__PURE__ */ jsx(
                          "span",
                          {
                            style: {
                              width: "22px",
                              height: "22px",
                              borderRadius: "50%",
                              backgroundColor: "#D5F5E3",
                              color: "#1E8449",
                              fontSize: "11px",
                              fontWeight: "700",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0
                            },
                            children: step
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "p",
                          {
                            style: {
                              fontSize: "13px",
                              color: "#4A4A4A",
                              margin: 0,
                              lineHeight: "1.5"
                            },
                            children: text
                          }
                        )
                      ]
                    },
                    step
                  ))
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginTop: "20px",
                  paddingBottom: "32px"
                },
                children: [
                  match.status === "Accepted" && /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(
                      PrimaryButton,
                      {
                        onClick: () => {
                          if (typeof window !== "undefined") window.location.href = `/matches/${matchId}/tracking`;
                        },
                        icon: Navigation,
                        children: "Open Tracking"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      SecondaryButton,
                      {
                        onClick: () => {
                          if (typeof window !== "undefined") window.location.href = `/matches/${matchId}/chat`;
                        },
                        icon: MessageCircle,
                        children: "Open Chat"
                      }
                    )
                  ] }),
                  match.status === "Alerted" && /* @__PURE__ */ jsx(
                    PrimaryButton,
                    {
                      onClick: handleAccept,
                      disabled: responding || declining || isCoolingDown,
                      icon: CheckCircle2,
                      children: responding ? "Accepting..." : "Accept This Request"
                    }
                  ),
                  match.status === "Alerted" && isCoolingDown && /* @__PURE__ */ jsxs(
                    "p",
                    {
                      style: {
                        backgroundColor: "#FADBD8",
                        borderRadius: "8px",
                        color: "#922B21",
                        fontSize: "12px",
                        fontWeight: "600",
                        margin: 0,
                        padding: "10px 12px",
                        textAlign: "center"
                      },
                      children: [
                        "Donation actions are disabled for ",
                        cooldownDays,
                        " more day",
                        cooldownDays === 1 ? "" : "s",
                        "."
                      ]
                    }
                  ),
                  respondError && /* @__PURE__ */ jsx(
                    "p",
                    {
                      style: {
                        backgroundColor: "#FADBD8",
                        borderRadius: "8px",
                        color: "#922B21",
                        fontSize: "12px",
                        fontWeight: "600",
                        margin: 0,
                        padding: "10px 12px",
                        textAlign: "center"
                      },
                      children: respondError
                    }
                  ),
                  match.status === "Alerted" && /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(
                      SecondaryButton,
                      {
                        onClick: handleDecline,
                        disabled: responding || declining || match.status !== "Alerted",
                        icon: X,
                        children: declining ? "Declining…" : "Decline"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "p",
                      {
                        style: {
                          textAlign: "center",
                          fontSize: "11px",
                          color: "#6B6B6B",
                          margin: 0,
                          lineHeight: "1.5"
                        },
                        children: "Declining will pass this match to another available donor. Your availability status will remain on."
                      }
                    )
                  ] })
                ]
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx("style", { jsx: true, global: true, children: `
        @keyframes gpsPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.75); }
        }
        @keyframes pinBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { margin: 0; padding: 0; }
      ` })
  ] });
}
const page$l = UNSAFE_withComponentProps(function WrappedPage6(props) {
  const params = useParams();
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(MatchPage, {
      ...props,
      matchId: params.matchId
    })
  });
});
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$l
}, Symbol.toStringTag, { value: "Module" }));
const OTP_DURATION_SECONDS = 15 * 60;
function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
function CheckInPage({ params }) {
  const { matchId } = params;
  const { isAuthenticated } = useApp();
  const [otp, setOtp] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [durationSeconds, setDurationSeconds] = useState(OTP_DURATION_SECONDS);
  const [match, setMatch] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(OTP_DURATION_SECONDS);
  const [copied, setCopied] = useState(false);
  const [loadError, setLoadError] = useState(null);
  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthenticated]);
  useEffect(() => {
    if (!isAuthenticated || !matchId) return;
    if (typeof window !== "undefined") {
      const storedOtp = window.sessionStorage.getItem(`lyfeblood.match.${matchId}.otp`) ?? "";
      const storedExpiresAt = window.sessionStorage.getItem(
        `lyfeblood.match.${matchId}.expires_at`
      );
      const storedTtl = Number.parseInt(
        window.sessionStorage.getItem(`lyfeblood.match.${matchId}.ttl_seconds`) ?? "",
        10
      );
      setOtp(storedOtp);
      setExpiresAt(storedExpiresAt);
      if (Number.isFinite(storedTtl) && storedTtl > 0) {
        setDurationSeconds(storedTtl);
      }
      if (!storedOtp || !storedExpiresAt) {
        setLoadError("OTP details are unavailable. Please accept the match again.");
      }
    }
    let alive = true;
    apiGetMatch(matchId).then(({ match: match2 }) => {
      if (!alive || !match2) return;
      const request = match2.request ?? {};
      setMatch({
        requestId: match2.request_id,
        hospitalName: request.hospital_name ?? "Hospital",
        ward: request.patient_ref ?? "Blood request",
        patientCode: request.patient_ref ?? null,
        bloodGroup: request.blood_type_needed ?? null
      });
    }).catch((error) => {
      console.error("[CheckIn] Failed to load match:", error);
      setLoadError(error?.message ?? "Failed to load check-in details");
    });
    return () => {
      alive = false;
    };
  }, [isAuthenticated, matchId]);
  useEffect(() => {
    if (!expiresAt) return;
    const updateSecondsLeft = () => {
      setSecondsLeft(
        Math.max(0, Math.ceil((Date.parse(expiresAt) - Date.now()) / 1e3))
      );
    };
    updateSecondsLeft();
    const interval = setInterval(() => {
      updateSecondsLeft();
    }, 1e3);
    return () => clearInterval(interval);
  }, [expiresAt]);
  const isExpired = secondsLeft === 0;
  const urgencyColor = secondsLeft < 120 ? "#922B21" : secondsLeft < 300 ? "#E67E22" : "#C0392B";
  const handleCopyOTP = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard?.writeText(otp).catch(() => {
      });
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: "100vh"
        },
        children: [
          /* @__PURE__ */ jsx(
            "header",
            {
              style: {
                height: "56px",
                backgroundColor: "#FFFFFF",
                borderBottom: "1px solid #C8C8C8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                paddingInline: "16px",
                flexShrink: 0
              },
              children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
                /* @__PURE__ */ jsx(Shield, { size: 18, color: "#27AE60" }),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    style: {
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#1A1A1A"
                    },
                    children: "Secure Check-In"
                  }
                )
              ] })
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                backgroundColor: "#D5F5E3",
                padding: "14px 16px",
                borderBottom: "1px solid #A9DFBF",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px"
              },
              children: [
                /* @__PURE__ */ jsx(
                  Shield,
                  {
                    size: 18,
                    color: "#1E8449",
                    style: { flexShrink: 0, marginTop: "1px" }
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "p",
                  {
                    style: {
                      fontSize: "13px",
                      color: "#1E8449",
                      margin: 0,
                      lineHeight: "1.5"
                    },
                    children: [
                      /* @__PURE__ */ jsx("strong", { children: "Present this secure code token" }),
                      " to the hospital laboratory manager upon arrival. Do not share this code with anyone else."
                    ]
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                flex: 1,
                padding: "24px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              },
              children: [
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    style: {
                      backgroundColor: "#FFFFFF",
                      borderRadius: "12px",
                      padding: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
                    },
                    children: [
                      /* @__PURE__ */ jsx(
                        "div",
                        {
                          style: {
                            width: "44px",
                            height: "44px",
                            borderRadius: "10px",
                            backgroundColor: "#FADBD8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                          },
                          children: /* @__PURE__ */ jsx(Building2, { size: 20, color: "#C0392B" })
                        }
                      ),
                      /* @__PURE__ */ jsxs("div", { style: { flex: 1 }, children: [
                        /* @__PURE__ */ jsx(
                          "p",
                          {
                            style: {
                              fontSize: "13px",
                              fontWeight: "700",
                              color: "#1A1A1A",
                              margin: "0 0 2px"
                            },
                            children: match?.hospitalName ?? "Loading hospital..."
                          }
                        ),
                        /* @__PURE__ */ jsxs("p", { style: { fontSize: "12px", color: "#6B6B6B", margin: 0 }, children: [
                          match?.ward ?? "Blood request",
                          " · ",
                          match?.patientCode ?? matchId
                        ] })
                      ] }),
                      /* @__PURE__ */ jsx(BloodGroupTag, { group: match?.bloodGroup, size: "md" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    style: {
                      backgroundColor: "#FFFFFF",
                      borderRadius: "12px",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                      overflow: "hidden"
                    },
                    children: [
                      /* @__PURE__ */ jsxs(
                        "div",
                        {
                          style: {
                            backgroundColor: isExpired ? "#C8C8C8" : "#1A1A1A",
                            padding: "14px 18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            transition: "background-color 500ms"
                          },
                          children: [
                            /* @__PURE__ */ jsxs(
                              "div",
                              {
                                style: { display: "flex", alignItems: "center", gap: "8px" },
                                children: [
                                  /* @__PURE__ */ jsx(Shield, { size: 15, color: isExpired ? "#6B6B6B" : "#FFFFFF" }),
                                  /* @__PURE__ */ jsx(
                                    "span",
                                    {
                                      style: {
                                        fontSize: "12px",
                                        fontWeight: "700",
                                        color: isExpired ? "#6B6B6B" : "#FFFFFF",
                                        letterSpacing: "0.04em"
                                      },
                                      children: isExpired ? "TOKEN EXPIRED" : "SECURE TOKEN"
                                    }
                                  )
                                ]
                              }
                            ),
                            !isExpired && /* @__PURE__ */ jsx(
                              "span",
                              {
                                style: {
                                  fontSize: "10px",
                                  fontWeight: "600",
                                  color: "rgba(255,255,255,0.6)",
                                  backgroundColor: "rgba(255,255,255,0.1)",
                                  paddingInline: "8px",
                                  paddingBlock: "3px",
                                  borderRadius: "999px"
                                },
                                children: "Single-use · Encrypted"
                              }
                            )
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxs(
                        "div",
                        {
                          style: {
                            padding: "32px 24px 24px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "8px"
                          },
                          children: [
                            /* @__PURE__ */ jsx(
                              "p",
                              {
                                style: {
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  color: "#6B6B6B",
                                  margin: 0,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.08em"
                                },
                                children: "6-Digit Verification Code"
                              }
                            ),
                            /* @__PURE__ */ jsx(
                              "div",
                              {
                                onClick: handleCopyOTP,
                                style: {
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0",
                                  cursor: isExpired ? "default" : "pointer",
                                  userSelect: "none"
                                },
                                children: (otp || "------").split("").map((digit, i) => /* @__PURE__ */ jsx(
                                  "span",
                                  {
                                    style: {
                                      fontSize: "36px",
                                      fontWeight: "800",
                                      color: isExpired ? "#C8C8C8" : "#1A1A1A",
                                      letterSpacing: i === 2 ? "16px" : "8px",
                                      fontVariantNumeric: "tabular-nums",
                                      lineHeight: 1,
                                      transition: "color 300ms"
                                    },
                                    children: digit
                                  },
                                  i
                                ))
                              }
                            ),
                            !isExpired && /* @__PURE__ */ jsx(
                              "button",
                              {
                                onClick: handleCopyOTP,
                                style: {
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "11px",
                                  color: copied ? "#27AE60" : "#C0392B",
                                  fontWeight: "600",
                                  fontFamily: "inherit",
                                  marginTop: "4px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px"
                                },
                                children: copied ? /* @__PURE__ */ jsxs(Fragment, { children: [
                                  /* @__PURE__ */ jsx(CheckCircle2, { size: 12 }),
                                  " Copied!"
                                ] }) : "Tap to copy"
                              }
                            )
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxs("div", { style: { paddingInline: "24px", paddingBottom: "20px" }, children: [
                        /* @__PURE__ */ jsx(
                          "div",
                          {
                            style: {
                              height: "4px",
                              backgroundColor: "#F4F4F4",
                              borderRadius: "2px",
                              overflow: "hidden",
                              marginBottom: "8px"
                            },
                            children: /* @__PURE__ */ jsx(
                              "div",
                              {
                                style: {
                                  height: "100%",
                                  width: `${secondsLeft / durationSeconds * 100}%`,
                                  backgroundColor: urgencyColor,
                                  borderRadius: "2px",
                                  transition: "width 1s linear, background-color 500ms"
                                }
                              }
                            )
                          }
                        ),
                        /* @__PURE__ */ jsxs(
                          "div",
                          {
                            style: {
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between"
                            },
                            children: [
                              /* @__PURE__ */ jsx("span", { style: { fontSize: "12px", color: "#6B6B6B" }, children: isExpired ? "Token has expired" : "Expires in" }),
                              /* @__PURE__ */ jsx(
                                "span",
                                {
                                  style: {
                                    fontSize: "15px",
                                    fontWeight: "800",
                                    color: urgencyColor,
                                    fontVariantNumeric: "tabular-nums",
                                    animation: secondsLeft < 60 ? "timerPulse 1s infinite" : "none"
                                  },
                                  children: isExpired ? "00:00" : formatCountdown(secondsLeft)
                                }
                              )
                            ]
                          }
                        )
                      ] })
                    ]
                  }
                ),
                isExpired && /* @__PURE__ */ jsxs(
                  "div",
                  {
                    style: {
                      backgroundColor: "#FADBD8",
                      borderRadius: "10px",
                      padding: "14px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px"
                    },
                    children: [
                      /* @__PURE__ */ jsx(
                        AlertTriangle,
                        {
                          size: 16,
                          color: "#922B21",
                          style: { flexShrink: 0, marginTop: "1px" }
                        }
                      ),
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx(
                          "p",
                          {
                            style: {
                              fontSize: "13px",
                              fontWeight: "700",
                              color: "#922B21",
                              margin: "0 0 2px"
                            },
                            children: "Token Expired"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "p",
                          {
                            style: {
                              fontSize: "12px",
                              color: "#922B21",
                              margin: 0,
                              lineHeight: "1.5",
                              opacity: 0.9
                            },
                            children: "Your 15-minute verification window has lapsed. Please contact the hospital directly or return to dashboard and re-accept the request."
                          }
                        )
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    style: {
                      backgroundColor: "#FFFFFF",
                      borderRadius: "12px",
                      padding: "16px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
                    },
                    children: [
                      /* @__PURE__ */ jsx(
                        "p",
                        {
                          style: {
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "#6B6B6B",
                            margin: "0 0 12px",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em"
                          },
                          children: "What to do on arrival"
                        }
                      ),
                      [
                        "Go directly to the Blood Bank / Laboratory department.",
                        "Show this screen to the Laboratory Manager.",
                        `Read out or present the 6-digit code: ${otp}.`,
                        "The lab team will take it from there. Do not leave until confirmed."
                      ].map((step, i) => /* @__PURE__ */ jsxs(
                        "div",
                        {
                          style: {
                            display: "flex",
                            gap: "10px",
                            marginBottom: i < 3 ? "10px" : "0",
                            alignItems: "flex-start"
                          },
                          children: [
                            /* @__PURE__ */ jsx(
                              "span",
                              {
                                style: {
                                  width: "20px",
                                  height: "20px",
                                  borderRadius: "50%",
                                  backgroundColor: "#D5F5E3",
                                  color: "#1E8449",
                                  fontSize: "10px",
                                  fontWeight: "700",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  marginTop: "1px"
                                },
                                children: i + 1
                              }
                            ),
                            /* @__PURE__ */ jsx(
                              "p",
                              {
                                style: {
                                  fontSize: "13px",
                                  color: "#4A4A4A",
                                  margin: 0,
                                  lineHeight: "1.5"
                                },
                                children: step
                              }
                            )
                          ]
                        },
                        i
                      ))
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs("div", { style: { paddingBottom: "32px" }, children: [
                  loadError && /* @__PURE__ */ jsx(
                    "p",
                    {
                      style: {
                        backgroundColor: "#FADBD8",
                        borderRadius: "8px",
                        color: "#922B21",
                        fontSize: "12px",
                        fontWeight: "600",
                        margin: "0 0 10px",
                        padding: "10px 12px",
                        textAlign: "center"
                      },
                      children: loadError
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    PrimaryButton,
                    {
                      onClick: () => {
                      },
                      disabled: true,
                      icon: CheckCircle2,
                      children: "Awaiting Hospital Verification"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "p",
                    {
                      style: {
                        textAlign: "center",
                        fontSize: "11px",
                        color: "#6B6B6B",
                        marginTop: "12px",
                        lineHeight: "1.5"
                      },
                      children: "Tap only after you have physically arrived at the hospital laboratory."
                    }
                  )
                ] })
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx("style", { jsx: true, global: true, children: `
        @keyframes timerPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { margin: 0; padding: 0; }
      ` })
  ] });
}
const page$k = UNSAFE_withComponentProps(function WrappedPage7(props) {
  const params = useParams();
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(CheckInPage, {
      ...props,
      matchId: params.matchId
    })
  });
});
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$k
}, Symbol.toStringTag, { value: "Module" }));
function Page$8() {
  useEffect(() => {
    const run = async () => {
      throw new Error("async effect exploded");
    };
    run();
  }, []);
  return /* @__PURE__ */ jsx("div", { children: "async effect error" });
}
const page$j = UNSAFE_withComponentProps(function WrappedPage8(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(Page$8, {
      ...props
    })
  });
});
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$j
}, Symbol.toStringTag, { value: "Module" }));
function Page$7() {
  const handleClick = () => {
    throw new Error("click handler exploded");
  };
  return /* @__PURE__ */ jsx("button", { onClick: handleClick, children: "Click me" });
}
const page$i = UNSAFE_withComponentProps(function WrappedPage9(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(Page$7, {
      ...props
    })
  });
});
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$i
}, Symbol.toStringTag, { value: "Module" }));
function BadHook({ flag }) {
  if (flag) {
    const [n, setValue] = useState(0);
    return /* @__PURE__ */ jsxs("div", { children: [
      n,
      /* @__PURE__ */ jsx("button", { onClick: () => setValue(n + 1), children: "Increment" })
    ] });
  }
  return "ok";
}
function Page$6() {
  const [count, setCount] = useState(0);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h1", { children: "Bad Hook Example" }),
    /* @__PURE__ */ jsx(BadHook, { flag: count % 2 === 0 }),
    /* @__PURE__ */ jsx("button", { onClick: () => setCount(count + 1), children: "Toggle Hook" })
  ] });
}
const page$h = UNSAFE_withComponentProps(function WrappedPage10(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(Page$6, {
      ...props
    })
  });
});
const route10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$h
}, Symbol.toStringTag, { value: "Module" }));
function Page$5() {
  const [count, setCount] = useState(0);
  setCount(count + 1);
  return /* @__PURE__ */ jsx("div", { children: count });
}
const page$g = UNSAFE_withComponentProps(function WrappedPage11(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(Page$5, {
      ...props
    })
  });
});
const route11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$g
}, Symbol.toStringTag, { value: "Module" }));
function Page$4() {
  const data = JSON.parse("not valid json {{{");
  return /* @__PURE__ */ jsx("div", { children: data.name });
}
const page$f = UNSAFE_withComponentProps(function WrappedPage12(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(Page$4, {
      ...props
    })
  });
});
const route12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$f
}, Symbol.toStringTag, { value: "Module" }));
function Page$3() {
  return /* @__PURE__ */ jsx("div", { children: "Missing component test page disabled in production build." });
}
const page$e = UNSAFE_withComponentProps(function WrappedPage13(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(Page$3, {
      ...props
    })
  });
});
const route13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$e
}, Symbol.toStringTag, { value: "Module" }));
function Bug() {
  const obj = null;
  return /* @__PURE__ */ jsx("p", { children: obj.key });
}
const page$d = UNSAFE_withComponentProps(function WrappedPage14(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(Bug, {
      ...props
    })
  });
});
const route14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$d
}, Symbol.toStringTag, { value: "Module" }));
function Page$2() {
  const data = { name: "test", value: 42 };
  return /* @__PURE__ */ jsx("div", { children: data });
}
const page$c = UNSAFE_withComponentProps(function WrappedPage15(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(Page$2, {
      ...props
    })
  });
});
const route15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$c
}, Symbol.toStringTag, { value: "Module" }));
function Page$1() {
  const notAFunction = 42;
  return /* @__PURE__ */ jsx("p", { children: notAFunction() });
}
const page$b = UNSAFE_withComponentProps(function WrappedPage16(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(Page$1, {
      ...props
    })
  });
});
const route16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$b
}, Symbol.toStringTag, { value: "Module" }));
function Page() {
  const obj = void 0;
  return /* @__PURE__ */ jsx("p", { children: obj.key });
}
const page$a = UNSAFE_withComponentProps(function WrappedPage17(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(Page, {
      ...props
    })
  });
});
const route17 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$a
}, Symbol.toStringTag, { value: "Module" }));
function Fetcher() {
  useEffect(() => {
    fetch("/unknown");
  }, []);
  return /* @__PURE__ */ jsx("div", { children: "unhandled promise" });
}
const page$9 = UNSAFE_withComponentProps(function WrappedPage18(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(Fetcher, {
      ...props
    })
  });
});
const route18 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$9
}, Symbol.toStringTag, { value: "Module" }));
const DELETE_AFTER_MS = 24 * 60 * 60 * 1e3;
function canDeleteRequest(request) {
  const createdAt = new Date(request.requestDate).getTime();
  return Number.isFinite(createdAt) && Date.now() - createdAt >= DELETE_AFTER_MS;
}
function NewRequestSheet({ onClose, onSubmit, isSOS }) {
  const [form, setForm] = useState({
    bloodGroup: "",
    ward: "",
    unitsNeeded: 1,
    urgencyNote: "",
    patientCode: ""
  });
  const canSubmit = form.bloodGroup && form.ward && form.unitsNeeded >= 1;
  const inputStyle2 = {
    width: "100%",
    height: "46px",
    borderRadius: "8px",
    border: "1.5px solid #C8C8C8",
    paddingInline: "12px",
    fontSize: "14px",
    color: "#1A1A1A",
    backgroundColor: "#FFFFFF",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box"
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center"
      },
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            onClick: onClose,
            style: {
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(2px)"
            }
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              position: "relative",
              width: "100%",
              maxWidth: "480px",
              backgroundColor: "#FFFFFF",
              borderRadius: "16px 16px 0 0",
              maxHeight: "90vh",
              overflowY: "auto",
              animation: "sheetUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)"
            },
            children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  style: {
                    display: "flex",
                    justifyContent: "center",
                    padding: "12px 0 4px"
                  },
                  children: /* @__PURE__ */ jsx(
                    "div",
                    {
                      style: {
                        width: "36px",
                        height: "4px",
                        borderRadius: "2px",
                        backgroundColor: "#C8C8C8"
                      }
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxs(
                "div",
                {
                  style: {
                    padding: "8px 16px 16px",
                    borderBottom: "1px solid #F4F4F4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  },
                  children: [
                    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
                      isSOS && /* @__PURE__ */ jsx(AlertTriangle, { size: 18, color: "#922B21" }),
                      /* @__PURE__ */ jsx(
                        "h2",
                        {
                          style: {
                            fontSize: "17px",
                            fontWeight: "800",
                            color: "#1A1A1A",
                            margin: 0
                          },
                          children: isSOS ? "SOS Broadcast Request" : "New Blood Request"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: onClose,
                        style: {
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px",
                          color: "#6B6B6B"
                        },
                        children: /* @__PURE__ */ jsx(X, { size: 20 })
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "div",
                {
                  style: {
                    padding: "20px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px"
                  },
                  children: [
                    isSOS && /* @__PURE__ */ jsxs(
                      "div",
                      {
                        style: {
                          backgroundColor: "#FADBD8",
                          borderRadius: "10px",
                          padding: "12px 14px",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px"
                        },
                        children: [
                          /* @__PURE__ */ jsx(
                            Radio,
                            {
                              size: 15,
                              color: "#922B21",
                              style: { flexShrink: 0, marginTop: "1px" }
                            }
                          ),
                          /* @__PURE__ */ jsxs(
                            "p",
                            {
                              style: {
                                fontSize: "12px",
                                color: "#922B21",
                                margin: 0,
                                lineHeight: "1.5"
                              },
                              children: [
                                /* @__PURE__ */ jsx("strong", { children: "SOS mode:" }),
                                " This request will be broadcast immediately to ALL available matching donors in Imo State with the highest priority alert."
                              ]
                            }
                          )
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "6px" }, children: [
                      /* @__PURE__ */ jsxs(
                        "label",
                        {
                          style: { fontSize: "13px", fontWeight: "600", color: "#1A1A1A" },
                          children: [
                            "Blood Group Required ",
                            /* @__PURE__ */ jsx("span", { style: { color: "#C0392B" }, children: "*" })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: "8px" }, children: BLOOD_GROUPS$1.map((g) => /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => setForm((f) => ({ ...f, bloodGroup: g })),
                          style: {
                            background: "none",
                            border: `2px solid ${form.bloodGroup === g ? "#C0392B" : "#C8C8C8"}`,
                            borderRadius: "8px",
                            padding: 0,
                            cursor: "pointer",
                            outline: "none",
                            transform: form.bloodGroup === g ? "scale(1.06)" : "scale(1)",
                            boxShadow: form.bloodGroup === g ? "0 0 0 3px #FADBD8" : "none",
                            transition: "all 150ms"
                          },
                          children: /* @__PURE__ */ jsx(BloodGroupTag, { group: g, size: "md" })
                        },
                        g
                      )) })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "6px" }, children: [
                      /* @__PURE__ */ jsxs(
                        "label",
                        {
                          style: { fontSize: "13px", fontWeight: "600", color: "#1A1A1A" },
                          children: [
                            "Requesting Ward ",
                            /* @__PURE__ */ jsx("span", { style: { color: "#C0392B" }, children: "*" })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxs(
                        "select",
                        {
                          style: { ...inputStyle2, cursor: "pointer" },
                          value: form.ward,
                          onChange: (e) => setForm((f) => ({ ...f, ward: e.target.value })),
                          children: [
                            /* @__PURE__ */ jsx("option", { value: "", children: "Select ward" }),
                            /* @__PURE__ */ jsx("option", { children: "Accident & Emergency" }),
                            /* @__PURE__ */ jsx("option", { children: "Maternity & Obstetrics" }),
                            /* @__PURE__ */ jsx("option", { children: "Surgical Ward A" }),
                            /* @__PURE__ */ jsx("option", { children: "Surgical Ward B" }),
                            /* @__PURE__ */ jsx("option", { children: "Surgical Ward C" }),
                            /* @__PURE__ */ jsx("option", { children: "Intensive Care Unit (ICU)" }),
                            /* @__PURE__ */ jsx("option", { children: "Paediatric Ward" }),
                            /* @__PURE__ */ jsx("option", { children: "General Medical Ward" })
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "6px" }, children: [
                      /* @__PURE__ */ jsxs(
                        "label",
                        {
                          style: { fontSize: "13px", fontWeight: "600", color: "#1A1A1A" },
                          children: [
                            "Units Required ",
                            /* @__PURE__ */ jsx("span", { style: { color: "#C0392B" }, children: "*" })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsx("div", { style: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }, children: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => setForm((f) => ({ ...f, unitsNeeded: n })),
                          style: {
                            width: "40px",
                            height: "40px",
                            borderRadius: "8px",
                            backgroundColor: form.unitsNeeded === n ? "#C0392B" : "#F4F4F4",
                            color: form.unitsNeeded === n ? "#FFFFFF" : "#1A1A1A",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "700",
                            fontSize: "15px",
                            fontFamily: "inherit",
                            transition: "all 150ms"
                          },
                          children: n
                        },
                        n
                      )) })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "6px" }, children: [
                      /* @__PURE__ */ jsx(
                        "label",
                        {
                          style: { fontSize: "13px", fontWeight: "600", color: "#1A1A1A" },
                          children: "Patient / Case Reference Code"
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          style: inputStyle2,
                          type: "text",
                          placeholder: "e.g. FMC-AE-2077",
                          value: form.patientCode,
                          onChange: (e) => setForm((f) => ({ ...f, patientCode: e.target.value }))
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "6px" }, children: [
                      /* @__PURE__ */ jsx(
                        "label",
                        {
                          style: { fontSize: "13px", fontWeight: "600", color: "#1A1A1A" },
                          children: "Clinical Note (optional)"
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "textarea",
                        {
                          style: {
                            ...inputStyle2,
                            height: "80px",
                            paddingTop: "10px",
                            paddingBottom: "10px",
                            resize: "none"
                          },
                          placeholder: "Brief clinical context for the donor (no diagnostic criteria)",
                          value: form.urgencyNote,
                          onChange: (e) => setForm((f) => ({ ...f, urgencyNote: e.target.value }))
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs(
                      "div",
                      {
                        style: {
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          paddingBottom: "16px"
                        },
                        children: [
                          /* @__PURE__ */ jsx(
                            PrimaryButton,
                            {
                              onClick: () => {
                                if (canSubmit) onSubmit({ ...form, isSOS });
                              },
                              disabled: !canSubmit,
                              icon: isSOS ? AlertTriangle : Plus,
                              children: isSOS ? "Trigger SOS Broadcast" : "Post Blood Request"
                            }
                          ),
                          /* @__PURE__ */ jsx(SecondaryButton, { onClick: onClose, children: "Cancel" })
                        ]
                      }
                    )
                  ]
                }
              )
            ]
          }
        )
      ]
    }
  );
}
function HospitalDashboardPage() {
  const navigate = useNavigate$1();
  const {
    currentUser,
    isAuthenticated,
    bloodRequests,
    addRequest,
    deleteRequest,
    updateRequestStatus,
    markAllNotificationsRead
  } = useApp();
  const [showSheet, setShowSheet] = useState(false);
  const [sheetIsSOS, setSheetIsSOS] = useState(false);
  const [sosPressed, setSosPressed] = useState(false);
  const [acceptedMatches, setAcceptedMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [checkInMatchId, setCheckInMatchId] = useState("");
  const [checkInOtp, setCheckInOtp] = useState("");
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInError, setCheckInError] = useState(null);
  const [checkInSuccess, setCheckInSuccess] = useState(null);
  const [matchStatusLoading, setMatchStatusLoading] = useState(null);
  const [deletingRequestId, setDeletingRequestId] = useState(null);
  const [statusAction, setStatusAction] = useState({
    id: null,
    loading: false,
    error: null,
    success: null
  });
  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthenticated]);
  const loadAcceptedMatches = useCallback(async () => {
    if (!isAuthenticated) return;
    setMatchesLoading(true);
    try {
      const { matches } = await apiGetMatches();
      const accepted = (matches ?? []).filter(
        (match) => match.match_status === "Accepted"
      );
      setAcceptedMatches(accepted);
      setCheckInMatchId((current) => current || accepted[0]?.id || "");
    } catch (error) {
      setCheckInError(error?.message ?? "Unable to load accepted matches");
    } finally {
      setMatchesLoading(false);
    }
  }, [isAuthenticated]);
  useEffect(() => {
    loadAcceptedMatches();
  }, [loadAcceptedMatches]);
  const handleNewRequest = async (formData) => {
    await addRequest({
      tier: formData.isSOS ? "sos" : "standard",
      bloodGroup: formData.bloodGroup,
      unitsNeeded: formData.unitsNeeded,
      unitsFulfilled: 0,
      hospitalName: currentUser?.hospital || "Federal Medical Centre Owerri",
      ward: formData.ward,
      patientCode: formData.patientCode || `FMC-${Date.now().toString().slice(-4)}`,
      status: REQUEST_STATUS.PENDING,
      requestedBy: "hospital_officer",
      urgencyNote: formData.urgencyNote,
      location: currentUser?.location || "Owerri Municipal, Imo State"
    });
    setShowSheet(false);
  };
  const handleVerifyCheckIn = async () => {
    setCheckInError(null);
    setCheckInSuccess(null);
    if (!checkInMatchId) {
      setCheckInError("Select the donor match before verifying check-in.");
      return;
    }
    if (!/^\d{6}$/.test(checkInOtp.trim())) {
      setCheckInError("Enter the donor's 6-digit OTP.");
      return;
    }
    setCheckInLoading(true);
    try {
      const response = await apiVerifyToken({
        match_id: checkInMatchId,
        otp: checkInOtp.trim()
      });
      updateRequestStatus(response.request_id, REQUEST_STATUS.CHECKED_IN, {
        persist: false
      });
      setCheckInSuccess(response.message ?? "Check-in verified.");
      setCheckInOtp("");
      await loadAcceptedMatches();
    } catch (error) {
      setCheckInError(error?.message ?? "Unable to verify check-in");
    } finally {
      setCheckInLoading(false);
    }
  };
  const handleHospitalMatchStatus = async (action) => {
    setCheckInError(null);
    setCheckInSuccess(null);
    if (!checkInMatchId) {
      setCheckInError("Select the donor match before updating hospital status.");
      return;
    }
    setMatchStatusLoading(action);
    try {
      const response = await apiUpdateHospitalMatchStatus({
        match_id: checkInMatchId,
        action
      });
      const nextStatus = response.new_status === "fulfilled" ? REQUEST_STATUS.FULFILLED : response.new_status === "blood_collected" ? REQUEST_STATUS.BLOOD_COLLECTED : REQUEST_STATUS.CHECKED_IN;
      updateRequestStatus(response.request.id, nextStatus, { persist: false });
      setCheckInSuccess(response.message ?? "Hospital status updated.");
      await loadAcceptedMatches();
    } catch (error) {
      setCheckInError(error?.message ?? "Unable to update hospital status");
    } finally {
      setMatchStatusLoading(null);
    }
  };
  const handleStatusUpdate = async (requestId, nextStatus) => {
    setStatusAction({ id: requestId, loading: true, error: null, success: null });
    try {
      await updateRequestStatus(requestId, nextStatus);
      setStatusAction({
        id: requestId,
        loading: false,
        error: null,
        success: `Status updated to ${nextStatus.replaceAll("_", " ")}.`
      });
    } catch (error) {
      setStatusAction({
        id: requestId,
        loading: false,
        error: error?.message ?? "Unable to update request status.",
        success: null
      });
    }
  };
  const handleDeleteRequest = async (request) => {
    if (!canDeleteRequest(request) || deletingRequestId) return;
    const confirmed = window.confirm("Delete this request permanently?");
    if (!confirmed) return;
    setDeletingRequestId(request.id);
    setStatusAction({ id: request.id, loading: false, error: null, success: null });
    try {
      await deleteRequest(request.id);
    } catch (error) {
      setStatusAction({
        id: request.id,
        loading: false,
        error: error?.message ?? "Unable to delete request.",
        success: null
      });
    } finally {
      setDeletingRequestId(null);
    }
  };
  if (!currentUser) return null;
  const activeRequests = bloodRequests.filter(
    (r) => ![REQUEST_STATUS.FULFILLED, REQUEST_STATUS.CANCELLED].includes(r.status)
  );
  const pendingCount = bloodRequests.filter(
    (r) => r.status === REQUEST_STATUS.PENDING
  ).length;
  const matchedCount = bloodRequests.filter(
    (r) => r.status === REQUEST_STATUS.DONOR_MATCHED
  ).length;
  const selectedMatch = acceptedMatches.find(
    (match) => String(match.id) === String(checkInMatchId)
  );
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          flex: 1,
          paddingBottom: "80px"
        },
        children: [
          /* @__PURE__ */ jsx(
            TopAppBar,
            {
              title: "Blood Bank Command",
              onBellPress: markAllNotificationsRead
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                margin: "12px 12px 0",
                background: "linear-gradient(135deg, #1A1A1A 0%, #2C2C2C 100%)",
                borderRadius: "12px",
                padding: "18px"
              },
              children: [
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "16px"
                    },
                    children: [
                      /* @__PURE__ */ jsx(
                        "div",
                        {
                          style: {
                            width: "44px",
                            height: "44px",
                            borderRadius: "50%",
                            backgroundColor: "rgba(255,255,255,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "15px",
                            fontWeight: "800",
                            color: "#FFFFFF"
                          },
                          children: currentUser.avatar
                        }
                      ),
                      /* @__PURE__ */ jsxs("div", { style: { flex: 1 }, children: [
                        /* @__PURE__ */ jsx(
                          "p",
                          {
                            style: {
                              fontSize: "11px",
                              color: "rgba(255,255,255,0.5)",
                              margin: "0 0 2px"
                            },
                            children: currentUser.roleLabel
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "p",
                          {
                            style: {
                              fontSize: "15px",
                              fontWeight: "700",
                              color: "#FFFFFF",
                              margin: 0
                            },
                            children: currentUser.name
                          }
                        ),
                        /* @__PURE__ */ jsxs(
                          "p",
                          {
                            style: {
                              fontSize: "11px",
                              color: "rgba(255,255,255,0.5)",
                              margin: "1px 0 0"
                            },
                            children: [
                              currentUser.hospital,
                              " · ",
                              currentUser.department
                            ]
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsx(Building2, { size: 22, color: "rgba(255,255,255,0.3)" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: "8px" }, children: [
                  {
                    label: "Pending",
                    value: pendingCount,
                    color: "#F39C12",
                    bg: "rgba(243,156,18,0.2)"
                  },
                  {
                    label: "Matched",
                    value: matchedCount,
                    color: "#3B82F6",
                    bg: "rgba(59,130,246,0.2)"
                  },
                  {
                    label: "Total Active",
                    value: activeRequests.length,
                    color: "#27AE60",
                    bg: "rgba(39,174,96,0.2)"
                  }
                ].map(({ label, value, color, bg }) => /* @__PURE__ */ jsxs(
                  "div",
                  {
                    style: {
                      flex: 1,
                      backgroundColor: bg,
                      borderRadius: "8px",
                      padding: "10px 8px",
                      textAlign: "center"
                    },
                    children: [
                      /* @__PURE__ */ jsx(
                        "p",
                        {
                          style: {
                            fontSize: "20px",
                            fontWeight: "800",
                            color,
                            margin: "0 0 2px",
                            lineHeight: 1
                          },
                          children: value
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "p",
                        {
                          style: {
                            fontSize: "9px",
                            color: "rgba(255,255,255,0.5)",
                            margin: 0,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em"
                          },
                          children: label
                        }
                      )
                    ]
                  },
                  label
                )) })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                margin: "12px 12px 0",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              },
              children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onPointerDown: () => setSosPressed(true),
                    onPointerUp: () => setSosPressed(false),
                    onPointerLeave: () => setSosPressed(false),
                    onClick: () => {
                      setSheetIsSOS(true);
                      setShowSheet(true);
                    },
                    style: {
                      width: "100%",
                      height: "58px",
                      backgroundColor: sosPressed ? "#7B241C" : "#922B21",
                      borderRadius: "10px",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      fontFamily: "inherit",
                      transform: sosPressed ? "scale(0.98)" : "scale(1)",
                      transition: "background-color 100ms, transform 100ms",
                      boxShadow: "0 4px 16px rgba(146,43,33,0.4)"
                    },
                    children: [
                      /* @__PURE__ */ jsx(Radio, { size: 20, color: "#FFFFFF" }),
                      /* @__PURE__ */ jsx(
                        "span",
                        {
                          style: {
                            fontSize: "16px",
                            fontWeight: "800",
                            color: "#FFFFFF",
                            letterSpacing: "0.04em"
                          },
                          children: "TRIGGER SOS BROADCAST"
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: "8px" }, children: /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => {
                      setSheetIsSOS(false);
                      setShowSheet(true);
                    },
                    style: {
                      flex: 1,
                      height: "46px",
                      backgroundColor: "#FFFFFF",
                      border: "1.5px solid #C0392B",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    },
                    children: [
                      /* @__PURE__ */ jsx(Plus, { size: 16, color: "#C0392B" }),
                      /* @__PURE__ */ jsx(
                        "span",
                        {
                          style: {
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "#C0392B"
                          },
                          children: "New Request"
                        }
                      )
                    ]
                  }
                ) })
              ]
            }
          ),
          /* @__PURE__ */ jsx("section", { style: { padding: "16px 12px 0" }, children: /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                backgroundColor: "#FFFFFF",
                borderRadius: "8px",
                padding: "16px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              },
              children: [
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px"
                    },
                    children: [
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx(
                          "h2",
                          {
                            style: {
                              fontSize: "15px",
                              fontWeight: "800",
                              color: "#1A1A1A",
                              margin: "0 0 2px"
                            },
                            children: "Donor Check-In"
                          }
                        ),
                        /* @__PURE__ */ jsx("p", { style: { fontSize: "12px", color: "#6B6B6B", margin: 0 }, children: "Verify the donor identity and OTP before marking arrival." })
                      ] }),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: loadAcceptedMatches,
                          disabled: matchesLoading,
                          "aria-label": "Refresh accepted matches",
                          style: {
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            border: "1px solid #C8C8C8",
                            backgroundColor: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: matchesLoading ? "not-allowed" : "pointer"
                          },
                          children: /* @__PURE__ */ jsx(
                            RefreshCw,
                            {
                              size: 16,
                              color: "#1A1A1A",
                              style: {
                                animation: matchesLoading ? "spin 1s linear infinite" : "none"
                              }
                            }
                          )
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: checkInMatchId,
                    onChange: (event) => {
                      setCheckInMatchId(event.target.value);
                      setCheckInError(null);
                      setCheckInSuccess(null);
                    },
                    disabled: matchesLoading || checkInLoading || acceptedMatches.length === 0,
                    style: {
                      width: "100%",
                      height: "44px",
                      borderRadius: "8px",
                      border: "1.5px solid #C8C8C8",
                      paddingInline: "12px",
                      fontSize: "13px",
                      color: "#1A1A1A",
                      backgroundColor: "#FFFFFF",
                      fontFamily: "inherit"
                    },
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "", children: matchesLoading ? "Loading accepted matches..." : "Select accepted donor match" }),
                      acceptedMatches.map((match) => /* @__PURE__ */ jsxs("option", { value: match.id, children: [
                        match.donor?.full_name ?? "Assigned donor",
                        " ·",
                        " ",
                        match.request?.blood_type_needed ?? "Blood",
                        " · ",
                        match.id
                      ] }, match.id))
                    ]
                  }
                ),
                selectedMatch && /* @__PURE__ */ jsx(
                  "div",
                  {
                    style: {
                      backgroundColor: "#F4F4F4",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px"
                    },
                    children: [
                      ["Donor", selectedMatch.donor?.full_name],
                      ["Phone", selectedMatch.donor?.phone],
                      ["Blood", selectedMatch.donor?.blood_type],
                      ["Request", selectedMatch.request?.patient_ref]
                    ].map(([label, value]) => /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx(
                        "p",
                        {
                          style: {
                            fontSize: "10px",
                            fontWeight: "700",
                            color: "#6B6B6B",
                            margin: "0 0 2px",
                            textTransform: "uppercase"
                          },
                          children: label
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "p",
                        {
                          style: {
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "#1A1A1A",
                            margin: 0
                          },
                          children: value || "Not provided"
                        }
                      )
                    ] }, label))
                  }
                ),
                selectedMatch && /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr", gap: "8px" }, children: [
                  /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }, children: [
                    /* @__PURE__ */ jsx(
                      SecondaryButton,
                      {
                        onClick: () => handleHospitalMatchStatus("arrived"),
                        disabled: checkInLoading || Boolean(matchStatusLoading) || Boolean(selectedMatch.arrived_at),
                        icon: MapPin,
                        children: matchStatusLoading === "arrived" ? "Saving..." : "Mark Arrived"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      PrimaryButton,
                      {
                        onClick: () => handleHospitalMatchStatus("blood_collected"),
                        disabled: checkInLoading || Boolean(matchStatusLoading) || !selectedMatch.arrived_at || Boolean(selectedMatch.blood_collected_at),
                        icon: Droplets,
                        children: matchStatusLoading === "blood_collected" ? "Saving..." : "Blood Collected"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx(
                    PrimaryButton,
                    {
                      onClick: () => handleHospitalMatchStatus("donation_completed"),
                      disabled: checkInLoading || Boolean(matchStatusLoading) || !selectedMatch.blood_collected_at || Boolean(selectedMatch.donation_completed_at),
                      icon: CheckCircle2,
                      children: matchStatusLoading === "donation_completed" ? "Saving..." : "Donation Completed"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    value: checkInOtp,
                    onChange: (event) => {
                      setCheckInOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                      setCheckInError(null);
                      setCheckInSuccess(null);
                    },
                    inputMode: "numeric",
                    placeholder: "Enter 6-digit OTP",
                    disabled: checkInLoading || !checkInMatchId,
                    style: {
                      width: "100%",
                      height: "46px",
                      borderRadius: "8px",
                      border: "1.5px solid #C8C8C8",
                      paddingInline: "12px",
                      fontSize: "18px",
                      fontWeight: "800",
                      letterSpacing: "4px",
                      color: "#1A1A1A",
                      backgroundColor: "#FFFFFF",
                      fontFamily: "inherit",
                      boxSizing: "border-box"
                    }
                  }
                ),
                checkInError && /* @__PURE__ */ jsx(
                  "p",
                  {
                    style: {
                      margin: 0,
                      borderRadius: "8px",
                      backgroundColor: "#FADBD8",
                      color: "#922B21",
                      fontSize: "12px",
                      fontWeight: "700",
                      padding: "10px 12px"
                    },
                    children: checkInError
                  }
                ),
                checkInSuccess && /* @__PURE__ */ jsx(
                  "p",
                  {
                    style: {
                      margin: 0,
                      borderRadius: "8px",
                      backgroundColor: "#D5F5E3",
                      color: "#1E8449",
                      fontSize: "12px",
                      fontWeight: "700",
                      padding: "10px 12px"
                    },
                    children: checkInSuccess
                  }
                ),
                /* @__PURE__ */ jsx(
                  PrimaryButton,
                  {
                    onClick: handleVerifyCheckIn,
                    disabled: checkInLoading || !checkInMatchId || checkInOtp.length !== 6,
                    icon: checkInLoading ? RefreshCw : CheckCircle2,
                    children: checkInLoading ? "Verifying..." : "Verify Check-In"
                  }
                )
              ]
            }
          ) }),
          /* @__PURE__ */ jsxs("section", { style: { padding: "20px 12px 0" }, children: [
            /* @__PURE__ */ jsx(
              "h2",
              {
                style: {
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#1A1A1A",
                  margin: "0 0 12px"
                },
                children: "Status Pipeline"
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  display: "flex",
                  gap: "6px",
                  overflowX: "auto",
                  paddingBottom: "4px"
                },
                children: [
                  { status: REQUEST_STATUS.PENDING, label: "Pending" },
                  { status: REQUEST_STATUS.VERIFIED, label: "Verified" },
                  { status: REQUEST_STATUS.DONOR_MATCHED, label: "Matched" },
                  { status: REQUEST_STATUS.CHECKED_IN, label: "Checked In" },
                  { status: REQUEST_STATUS.BLOOD_COLLECTED, label: "Collected" },
                  { status: REQUEST_STATUS.FULFILLED, label: "Completed" },
                  { status: REQUEST_STATUS.CANCELLED, label: "Cancelled" }
                ].map(({ status, label }) => {
                  const count = bloodRequests.filter(
                    (r) => r.status === status
                  ).length;
                  return /* @__PURE__ */ jsxs(
                    "div",
                    {
                      style: {
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                        flexShrink: 0,
                        minWidth: "64px"
                      },
                      children: [
                        /* @__PURE__ */ jsx(RequestStatusBadge, { status, size: "sm" }),
                        /* @__PURE__ */ jsx(
                          "span",
                          {
                            style: {
                              fontSize: "16px",
                              fontWeight: "800",
                              color: "#1A1A1A"
                            },
                            children: count
                          }
                        )
                      ]
                    },
                    status
                  );
                })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("section", { style: { padding: "20px 12px 0" }, children: [
            /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px"
                },
                children: [
                  /* @__PURE__ */ jsx(
                    "h2",
                    {
                      style: {
                        fontSize: "15px",
                        fontWeight: "700",
                        color: "#1A1A1A",
                        margin: 0
                      },
                      children: "All Active Requests"
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "span",
                    {
                      style: {
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#C0392B",
                        backgroundColor: "#FADBD8",
                        paddingInline: "8px",
                        paddingBlock: "3px",
                        borderRadius: "999px"
                      },
                      children: [
                        activeRequests.length,
                        " open"
                      ]
                    }
                  )
                ]
              }
            ),
            activeRequests.length === 0 ? /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "48px 24px",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "12px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.07)"
                },
                children: [
                  /* @__PURE__ */ jsx(
                    ClipboardList,
                    {
                      size: 48,
                      color: "#C8C8C8",
                      strokeWidth: 1.5,
                      style: { marginBottom: "12px" }
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "p",
                    {
                      style: {
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#6B6B6B",
                        margin: "0 0 4px",
                        textAlign: "center"
                      },
                      children: "No active requests"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "p",
                    {
                      style: {
                        fontSize: "12px",
                        color: "#C8C8C8",
                        margin: 0,
                        textAlign: "center",
                        lineHeight: "1.5"
                      },
                      children: 'Tap "New Request" or "TRIGGER SOS BROADCAST" above to create your first blood procurement request.'
                    }
                  )
                ]
              }
            ) : /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                },
                children: activeRequests.map((req) => /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("div", { style: { position: "relative" }, children: [
                    /* @__PURE__ */ jsx(
                      RequestCard,
                      {
                        request: req,
                        onClick: () => navigate(`/requests/${req.id}`)
                      }
                    ),
                    canDeleteRequest(req) && /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        "aria-label": "Delete request",
                        onClick: () => handleDeleteRequest(req),
                        disabled: deletingRequestId === req.id,
                        style: {
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          border: "1px solid #F1948A",
                          backgroundColor: "#FFFFFF",
                          color: "#922B21",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: deletingRequestId === req.id ? "not-allowed" : "pointer"
                        },
                        children: /* @__PURE__ */ jsx(Trash2, { size: 15 })
                      }
                    )
                  ] }),
                  ![REQUEST_STATUS.FULFILLED, REQUEST_STATUS.CANCELLED].includes(req.status) && /* @__PURE__ */ jsxs(
                    "div",
                    {
                      style: {
                        backgroundColor: "#FAFAFA",
                        borderRadius: "0 0 10px 10px",
                        borderTop: "1px solid #F4F4F4",
                        padding: "8px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "-2px"
                      },
                      children: [
                        /* @__PURE__ */ jsx(
                          "span",
                          {
                            style: {
                              fontSize: "11px",
                              color: "#6B6B6B",
                              flexShrink: 0
                            },
                            children: "Advance:"
                          }
                        ),
                        [
                          {
                            label: "Verify",
                            next: REQUEST_STATUS.VERIFIED,
                            from: REQUEST_STATUS.PENDING
                          },
                          {
                            label: "Matched",
                            next: REQUEST_STATUS.DONOR_MATCHED,
                            from: REQUEST_STATUS.VERIFIED
                          },
                          {
                            label: "Collected",
                            next: REQUEST_STATUS.BLOOD_COLLECTED,
                            from: REQUEST_STATUS.CHECKED_IN
                          },
                          {
                            label: "Complete",
                            next: REQUEST_STATUS.FULFILLED,
                            from: REQUEST_STATUS.BLOOD_COLLECTED
                          },
                          {
                            label: "Cancel",
                            next: REQUEST_STATUS.CANCELLED,
                            from: req.status
                          }
                        ].filter((a) => a.from === req.status).map(({ label, next }) => /* @__PURE__ */ jsx(
                          "button",
                          {
                            onClick: () => handleStatusUpdate(req.id, next),
                            disabled: statusAction.loading && statusAction.id === req.id,
                            style: {
                              fontSize: "11px",
                              fontWeight: "700",
                              color: statusAction.loading && statusAction.id === req.id ? "#6B6B6B" : "#C0392B",
                              backgroundColor: statusAction.loading && statusAction.id === req.id ? "#F4F4F4" : "#FADBD8",
                              border: "none",
                              borderRadius: "6px",
                              padding: "4px 10px",
                              cursor: statusAction.loading && statusAction.id === req.id ? "not-allowed" : "pointer",
                              fontFamily: "inherit"
                            },
                            children: statusAction.loading && statusAction.id === req.id ? "Saving..." : label
                          },
                          next
                        ))
                      ]
                    }
                  ),
                  statusAction.id === req.id && (statusAction.error || statusAction.success) && /* @__PURE__ */ jsx(
                    "p",
                    {
                      style: {
                        margin: "6px 0 0",
                        borderRadius: "8px",
                        backgroundColor: statusAction.error ? "#FADBD8" : "#D5F5E3",
                        color: statusAction.error ? "#922B21" : "#1E8449",
                        fontSize: "12px",
                        fontWeight: "700",
                        padding: "8px 10px"
                      },
                      children: statusAction.error ?? statusAction.success
                    }
                  )
                ] }, req.id))
              }
            )
          ] }),
          bloodRequests.filter((r) => r.status === REQUEST_STATUS.FULFILLED).length > 0 && /* @__PURE__ */ jsxs("section", { style: { padding: "20px 12px" }, children: [
            /* @__PURE__ */ jsx(
              "h2",
              {
                style: {
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#6B6B6B",
                  margin: "0 0 10px"
                },
                children: "Completed"
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  opacity: 0.65
                },
                children: bloodRequests.filter((r) => r.status === REQUEST_STATUS.FULFILLED).map((req) => /* @__PURE__ */ jsx(
                  RequestCard,
                  {
                    request: req,
                    onClick: () => navigate(`/requests/${req.id}`)
                  },
                  req.id
                ))
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      BottomNavBar,
      {
        onNavigate: (key) => {
          if (typeof window === "undefined") return;
          if (key === "home") navigate("/hospital/dashboard");
          if (key === "profile") navigate("/profile");
        }
      }
    ),
    showSheet && /* @__PURE__ */ jsx(
      NewRequestSheet,
      {
        onClose: () => setShowSheet(false),
        onSubmit: handleNewRequest,
        isSOS: sheetIsSOS
      }
    ),
    /* @__PURE__ */ jsx("style", { jsx: true, global: true, children: `
        @keyframes sheetUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.75); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { margin: 0; padding: 0; }
        input:focus, select:focus, textarea:focus {
          border-color: #C0392B !important;
          box-shadow: 0 0 0 3px #FADBD8;
          outline: none;
        }
      ` })
  ] });
}
const page$8 = UNSAFE_withComponentProps(function WrappedPage19(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(HospitalDashboardPage, {
      ...props
    })
  });
});
const route19 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$8
}, Symbol.toStringTag, { value: "Module" }));
const ROLE_ROUTE_MAP = {
  donor: "/donor/home",
  requester: "/dashboard",
  hospital: "/hospital/dashboard"
};
const inputStyle$2 = {
  width: "100%",
  height: "48px",
  borderRadius: "10px",
  border: "1.5px solid #C8C8C8",
  paddingInline: "14px",
  fontSize: "15px",
  color: "#1A1A1A",
  backgroundColor: "#FFFFFF",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 150ms, box-shadow 150ms"
};
const accentColor = "#C0392B";
function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate$1();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const canSubmit = email.trim().length > 0 && password.length >= 1 && !loading && !done;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const { user, token, session } = await apiLogin({ email: email.trim(), password });
      if (session?.access_token && session?.refresh_token) {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
      }
      login({ user, token });
      setLoading(false);
      setDone(true);
      const destination = ROLE_ROUTE_MAP[user.role] ?? "/dashboard";
      navigate(destination);
    } catch (err) {
      setError(
        err?.status === 401 ? "Incorrect email or password. Please try again." : err?.message ?? "Sign-in failed. Please try again."
      );
      setLoading(false);
    }
  };
  const ctaLabel = done ? "Signed In!" : loading ? "Signing in…" : "Sign In";
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: "100vh"
        },
        children: [
          /* @__PURE__ */ jsxs(
            "header",
            {
              style: {
                height: "56px",
                backgroundColor: "#FFFFFF",
                borderBottom: "1px solid #C8C8C8",
                display: "flex",
                alignItems: "center",
                paddingInline: "16px",
                gap: "12px",
                flexShrink: 0
              },
              children: [
                /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: "/",
                    style: {
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#F4F4F4",
                      borderRadius: "8px",
                      textDecoration: "none"
                    },
                    children: /* @__PURE__ */ jsx(ChevronLeft, { size: 20, color: "#1A1A1A" })
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "span",
                  {
                    style: { fontSize: "16px", fontWeight: "700", color: "#1A1A1A" },
                    children: [
                      /* @__PURE__ */ jsx("span", { style: { color: "#C0392B" }, children: "Lyfe" }),
                      "Blood"
                    ]
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                flex: 1,
                padding: "28px 16px 40px",
                display: "flex",
                flexDirection: "column"
              },
              children: [
                /* @__PURE__ */ jsxs("div", { style: { marginBottom: "24px" }, children: [
                  /* @__PURE__ */ jsx(
                    "h1",
                    {
                      style: {
                        fontSize: "24px",
                        fontWeight: "800",
                        color: "#1A1A1A",
                        margin: "0 0 6px",
                        letterSpacing: "-0.02em"
                      },
                      children: "Welcome Back"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "p",
                    {
                      style: {
                        fontSize: "14px",
                        color: "#4A4A4A",
                        margin: 0,
                        lineHeight: "1.5"
                      },
                      children: "Enter your credentials to continue."
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs(
                  "form",
                  {
                    onSubmit: handleSubmit,
                    noValidate: true,
                    style: {
                      backgroundColor: "#FFFFFF",
                      borderRadius: "14px",
                      border: `1.5px solid ${accentColor}30`,
                      padding: "20px 16px",
                      marginBottom: "20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                    },
                    children: [
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx(
                          "label",
                          {
                            style: {
                              display: "block",
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#4A4A4A",
                              marginBottom: "6px"
                            },
                            children: "Email Address"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            style: inputStyle$2,
                            type: "email",
                            placeholder: "you@example.com",
                            value: email,
                            autoComplete: "email",
                            onChange: (e) => {
                              setEmail(e.target.value);
                              setError(null);
                            }
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx(
                          "label",
                          {
                            style: {
                              display: "block",
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#4A4A4A",
                              marginBottom: "6px"
                            },
                            children: "Password"
                          }
                        ),
                        /* @__PURE__ */ jsxs("div", { style: { position: "relative" }, children: [
                          /* @__PURE__ */ jsx(
                            "input",
                            {
                              style: { ...inputStyle$2, paddingRight: "48px" },
                              type: showPassword ? "text" : "password",
                              placeholder: "Your password",
                              value: password,
                              autoComplete: "current-password",
                              onChange: (e) => {
                                setPassword(e.target.value);
                                setError(null);
                              }
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            "button",
                            {
                              type: "button",
                              onClick: () => setShowPassword((v) => !v),
                              style: {
                                position: "absolute",
                                right: "12px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#6B6B6B",
                                padding: 0,
                                display: "flex",
                                alignItems: "center"
                              },
                              children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { size: 18 }) : /* @__PURE__ */ jsx(Eye, { size: 18 })
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            type: "button",
                            onClick: () => navigate("/forgot-password"),
                            style: {
                              background: "none",
                              border: "none",
                              color: "#DC2626",
                              cursor: "pointer",
                              fontSize: "14px",
                              alignSelf: "flex-end"
                            },
                            children: "Forgot password?"
                          }
                        )
                      ] }),
                      error && /* @__PURE__ */ jsxs(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "10px",
                            backgroundColor: "#FADBD8",
                            border: "1px solid #F1948A",
                            borderRadius: "10px",
                            padding: "12px 14px"
                          },
                          children: [
                            /* @__PURE__ */ jsx(
                              AlertCircle,
                              {
                                size: 16,
                                color: "#922B21",
                                style: { flexShrink: 0, marginTop: "1px" }
                              }
                            ),
                            /* @__PURE__ */ jsx(
                              "p",
                              {
                                style: {
                                  fontSize: "13px",
                                  color: "#922B21",
                                  fontWeight: "600",
                                  margin: 0,
                                  lineHeight: "1.5"
                                },
                                children: error
                              }
                            )
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        PrimaryButton,
                        {
                          type: "submit",
                          disabled: !canSubmit,
                          icon: done ? CheckCircle2 : ArrowRight,
                          children: ctaLabel
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "p",
                  {
                    style: {
                      textAlign: "center",
                      fontSize: "13px",
                      color: "#4A4A4A",
                      marginTop: "20px"
                    },
                    children: [
                      "Don't have an account?",
                      " ",
                      /* @__PURE__ */ jsx(
                        "a",
                        {
                          href: "/register",
                          style: {
                            color: "#C0392B",
                            fontWeight: "700",
                            textDecoration: "none"
                          },
                          children: "Create one"
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(
                  "p",
                  {
                    style: {
                      textAlign: "center",
                      fontSize: "11px",
                      color: "#6B6B6B",
                      marginTop: "12px",
                      lineHeight: "1.5"
                    },
                    children: "By continuing, you acknowledge that LyfeBlood facilitates donor matching only. All clinical decisions remain with licensed medical staff."
                  }
                )
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx("style", { jsx: true, global: true, children: `
        * {
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
        }
        body {
          margin: 0;
          padding: 0;
        }
        input:focus {
          outline: none;
          border-color: #c0392b !important;
          box-shadow: 0 0 0 3px #fadbd8;
        }
      ` })
  ] });
}
const page$7 = UNSAFE_withComponentProps(function WrappedPage20(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(LoginPage, {
      ...props
    })
  });
});
const route20 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$7
}, Symbol.toStringTag, { value: "Module" }));
const QUICK_REPLIES = [
  { quick_type: "on_the_way", label: "I'm on my way" },
  { quick_type: "delayed", label: "I'm delayed" },
  { quick_type: "arrived", label: "I've arrived" }
];
function MatchChatPage() {
  const navigate = useNavigate$1();
  const { matchId } = useParams();
  const { currentUser, isAuthenticated, markAllNotificationsRead } = useApp();
  const [messages, setMessages] = useState([]);
  const [request, setRequest] = useState(null);
  const [participantRole, setParticipantRole] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const loadChat = async ({ silent = false } = {}) => {
    if (!matchId) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await apiGetMatchChat(matchId);
      setMessages(data.messages ?? []);
      setRequest(data.request ?? null);
      setParticipantRole(data.participant_role ?? null);
    } catch (err) {
      setError(err?.message ?? "Unable to load chat");
    } finally {
      if (!silent) setLoading(false);
    }
  };
  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);
  useEffect(() => {
    if (!isAuthenticated || !matchId) return void 0;
    loadChat();
    const interval = window.setInterval(() => loadChat({ silent: true }), 15e3);
    return () => window.clearInterval(interval);
  }, [isAuthenticated, matchId]);
  const title = useMemo(() => {
    if (!request) return "Match Chat";
    return `${request.blood_type_needed ?? "Blood"} at ${request.hospital_name ?? "Hospital"}`;
  }, [request]);
  const sendMessage = async (payload) => {
    setSending(true);
    setError(null);
    try {
      const { message } = await apiSendMatchChatMessage({
        match_id: matchId,
        ...payload
      });
      setMessages((current) => [...current, message]);
      setText("");
    } catch (err) {
      setError(err?.message ?? "Unable to send message");
    } finally {
      setSending(false);
    }
  };
  if (!currentUser) return null;
  return /* @__PURE__ */ jsxs("div", { style: { minHeight: "100vh", backgroundColor: "#F7F3F1", display: "flex", flexDirection: "column" }, children: [
    /* @__PURE__ */ jsx(TopAppBar, { title: "Care Chat", onBellPress: markAllNotificationsRead }),
    /* @__PURE__ */ jsxs("div", { style: { padding: "12px", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }, children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate(-1),
          "aria-label": "Back",
          style: {
            width: "36px",
            height: "36px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          },
          children: /* @__PURE__ */ jsx(ChevronLeft, { size: 20, color: "#1A1A1A" })
        }
      ),
      /* @__PURE__ */ jsx(
        "section",
        {
          style: {
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            padding: "14px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
          },
          children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
            /* @__PURE__ */ jsx(MessageCircle, { size: 18, color: "#C0392B" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h1", { style: { margin: 0, fontSize: "16px", fontWeight: "800", color: "#1A1A1A" }, children: title }),
              /* @__PURE__ */ jsx("p", { style: { margin: "2px 0 0", fontSize: "12px", color: "#6B6B6B" }, children: participantRole === "donor" ? "Accepted donor" : "Matched patient" })
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        "section",
        {
          style: {
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            padding: "12px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            flex: 1,
            minHeight: "320px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            overflowY: "auto"
          },
          children: loading ? /* @__PURE__ */ jsx("p", { style: { margin: "auto", fontSize: "14px", color: "#6B6B6B", fontWeight: "600" }, children: "Loading chat..." }) : error ? /* @__PURE__ */ jsx("p", { style: { margin: "auto", fontSize: "14px", color: "#922B21", fontWeight: "700", textAlign: "center" }, children: error }) : messages.length === 0 ? /* @__PURE__ */ jsx("p", { style: { margin: "auto", fontSize: "14px", color: "#6B6B6B", fontWeight: "600", textAlign: "center" }, children: "No messages yet." }) : messages.map((message) => {
            const mine = message.sender_id === currentUser.id;
            return /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  alignSelf: mine ? "flex-end" : "flex-start",
                  maxWidth: "82%",
                  backgroundColor: mine ? "#C0392B" : "#F4F4F4",
                  color: mine ? "#FFFFFF" : "#1A1A1A",
                  borderRadius: "8px",
                  padding: "10px 12px"
                },
                children: [
                  /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: "14px", fontWeight: "600", lineHeight: "1.4" }, children: message.message }),
                  /* @__PURE__ */ jsx("p", { style: { margin: "4px 0 0", fontSize: "10px", opacity: 0.72 }, children: new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })
                ]
              },
              message.id
            );
          })
        }
      ),
      /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr", gap: "8px" }, children: [
        /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: "8px", overflowX: "auto" }, children: QUICK_REPLIES.map((reply) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => sendMessage({ quick_type: reply.quick_type }),
            disabled: sending,
            style: {
              minHeight: "36px",
              flexShrink: 0,
              border: "1px solid #F1C4BE",
              borderRadius: "8px",
              backgroundColor: "#FFFFFF",
              color: "#922B21",
              fontSize: "12px",
              fontWeight: "800",
              paddingInline: "10px",
              cursor: sending ? "default" : "pointer"
            },
            children: reply.label
          },
          reply.quick_type
        )) }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "8px" }, children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              value: text,
              onChange: (event) => setText(event.target.value),
              placeholder: "Type a message",
              maxLength: 500,
              style: {
                flex: 1,
                minHeight: "44px",
                borderRadius: "8px",
                border: "1.5px solid #C8C8C8",
                paddingInline: "12px",
                fontSize: "14px",
                fontFamily: "inherit"
              }
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => sendMessage({ message: text }),
              disabled: sending || !text.trim(),
              "aria-label": "Send",
              style: {
                width: "48px",
                border: "none",
                borderRadius: "8px",
                backgroundColor: text.trim() ? "#C0392B" : "#C8C8C8",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: text.trim() && !sending ? "pointer" : "default"
              },
              children: /* @__PURE__ */ jsx(Send, { size: 18 })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }, children: [
          /* @__PURE__ */ jsx(SecondaryButton, { onClick: () => navigate(-1), icon: ChevronLeft, children: "Back" }),
          /* @__PURE__ */ jsx(PrimaryButton, { onClick: () => navigate(`/matches/${matchId}/tracking`), icon: Navigation, children: "Tracking" })
        ] })
      ] })
    ] })
  ] });
}
const page$6 = UNSAFE_withComponentProps(function WrappedPage21(props) {
  const params = useParams();
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(MatchChatPage, {
      ...props,
      matchId: params.matchId
    })
  });
});
const route21 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$6
}, Symbol.toStringTag, { value: "Module" }));
function formatDistance(value) {
  if (value === null || value === void 0) return "Waiting";
  return `${Number(value).toFixed(1)} km`;
}
function formatEta(value) {
  if (value === 0) return "Arrived";
  if (value === null || value === void 0) return "Waiting";
  return `${value} min`;
}
function progressPercent(latestLocation, match) {
  if (latestLocation?.status === "arrived" || match?.arrived_at) return 100;
  if (match?.on_the_way_at || latestLocation) return 55;
  return 15;
}
function MatchTrackingPage() {
  const navigate = useNavigate$1();
  const { matchId } = useParams();
  const { currentUser, isAuthenticated, markAllNotificationsRead } = useApp();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const loadTracking = async ({ silent = false } = {}) => {
    if (!matchId) return;
    if (!silent) setLoading(true);
    try {
      const data = await apiGetMatchTracking(matchId);
      setTracking(data);
      setError(null);
    } catch (err) {
      setError(err?.message ?? "Unable to load tracking");
    } finally {
      if (!silent) setLoading(false);
    }
  };
  const updateLocation = async (status = "on_the_way") => {
    if (!navigator.geolocation) {
      setError("Location services are not available in this browser");
      return;
    }
    setUpdating(true);
    setError(null);
    setSuccess(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { location } = await apiUpdateMatchTracking({
            match_id: matchId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            status
          });
          setTracking((current) => ({
            ...current,
            latest_location: location,
            locations: [location, ...current?.locations ?? []],
            match: status === "arrived" ? { ...current?.match ?? {}, arrived_at: (/* @__PURE__ */ new Date()).toISOString() } : { ...current?.match ?? {}, on_the_way_at: current?.match?.on_the_way_at ?? (/* @__PURE__ */ new Date()).toISOString() }
          }));
          setSuccess(status === "arrived" ? "Arrival shared." : "Location updated.");
          if (status === "arrived") setSharing(false);
        } catch (err) {
          setError(err?.message ?? "Unable to update location");
        } finally {
          setUpdating(false);
        }
      },
      () => {
        setUpdating(false);
        setError("Location permission is required to update tracking");
      },
      { enableHighAccuracy: true, timeout: 1e4, maximumAge: 15e3 }
    );
  };
  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);
  useEffect(() => {
    if (!isAuthenticated || !matchId) return void 0;
    loadTracking();
    const interval = window.setInterval(() => loadTracking({ silent: true }), 15e3);
    return () => window.clearInterval(interval);
  }, [isAuthenticated, matchId]);
  useEffect(() => {
    if (!sharing) return void 0;
    updateLocation("on_the_way");
    const interval = window.setInterval(() => updateLocation("on_the_way"), 2e4);
    return () => window.clearInterval(interval);
  }, [sharing, matchId]);
  const latestLocation = tracking?.latest_location ?? null;
  const match = tracking?.match ?? null;
  const request = tracking?.request ?? null;
  const isDonor = tracking?.participant_role === "donor";
  const percent = progressPercent(latestLocation, match);
  const title = useMemo(() => {
    if (!request) return "Tracking";
    return `${request.hospital_name ?? "Hospital"} route`;
  }, [request]);
  if (!currentUser) return null;
  return /* @__PURE__ */ jsxs("div", { style: { minHeight: "100vh", backgroundColor: "#F7F3F1", display: "flex", flexDirection: "column" }, children: [
    /* @__PURE__ */ jsx(TopAppBar, { title: "Donor Tracking", onBellPress: markAllNotificationsRead }),
    /* @__PURE__ */ jsxs("div", { style: { padding: "12px", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }, children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate(-1),
          "aria-label": "Back",
          style: {
            width: "36px",
            height: "36px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          },
          children: /* @__PURE__ */ jsx(ChevronLeft, { size: 20, color: "#1A1A1A" })
        }
      ),
      /* @__PURE__ */ jsxs(
        "section",
        {
          style: {
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            padding: "14px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          },
          children: [
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
              /* @__PURE__ */ jsx(Navigation, { size: 18, color: "#C0392B" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h1", { style: { margin: 0, fontSize: "16px", fontWeight: "800", color: "#1A1A1A" }, children: title }),
                /* @__PURE__ */ jsx("p", { style: { margin: "2px 0 0", fontSize: "12px", color: "#6B6B6B" }, children: loading ? "Loading route..." : latestLocation ? "Live donor progress" : "Waiting for donor location" })
              ] })
            ] }),
            error && /* @__PURE__ */ jsx("p", { style: { margin: 0, color: "#922B21", fontSize: "12px", fontWeight: "700" }, children: error }),
            success && /* @__PURE__ */ jsx("p", { style: { margin: 0, color: "#1E8449", fontSize: "12px", fontWeight: "700" }, children: success }),
            /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  height: "220px",
                  borderRadius: "8px",
                  backgroundColor: "#EBF3EF",
                  border: "1px solid #D8E8E0",
                  position: "relative",
                  overflow: "hidden"
                },
                children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      style: {
                        position: "absolute",
                        left: "12%",
                        right: "12%",
                        top: "50%",
                        height: "8px",
                        borderRadius: "999px",
                        backgroundColor: "#D5DBDB"
                      }
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      style: {
                        position: "absolute",
                        left: "12%",
                        top: "50%",
                        width: `${Math.max(8, percent * 0.76)}%`,
                        height: "8px",
                        borderRadius: "999px",
                        backgroundColor: "#27AE60"
                      }
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      style: {
                        position: "absolute",
                        left: `calc(12% + ${percent * 0.76}% - 12px)`,
                        top: "calc(50% - 18px)",
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: "#C0392B",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.18)"
                      },
                      children: /* @__PURE__ */ jsx(MapPin, { size: 20, color: "#FFFFFF" })
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { style: { position: "absolute", left: "10%", bottom: "46px", fontSize: "11px", fontWeight: "800", color: "#566573" }, children: "Donor" }),
                  /* @__PURE__ */ jsx("span", { style: { position: "absolute", right: "8%", bottom: "46px", fontSize: "11px", fontWeight: "800", color: "#566573" }, children: "Hospital" })
                ]
              }
            ),
            /* @__PURE__ */ jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }, children: [
              { label: "Distance", value: formatDistance(latestLocation?.distance_km) },
              { label: "ETA", value: formatEta(latestLocation?.eta_minutes) },
              { label: "Status", value: latestLocation?.status?.replaceAll("_", " ") ?? "waiting" }
            ].map((item) => /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  backgroundColor: "#F8F8F8",
                  borderRadius: "8px",
                  padding: "10px",
                  textAlign: "center"
                },
                children: [
                  /* @__PURE__ */ jsx("p", { style: { margin: "0 0 3px", fontSize: "10px", color: "#6B6B6B", fontWeight: "800", textTransform: "uppercase" }, children: item.label }),
                  /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: "14px", color: "#1A1A1A", fontWeight: "800", textTransform: item.label === "Status" ? "capitalize" : "none" }, children: item.value })
                ]
              },
              item.label
            )) })
          ]
        }
      ),
      /* @__PURE__ */ jsx(DonationJourney, { request, match }),
      isDonor && /* @__PURE__ */ jsxs("section", { style: { backgroundColor: "#FFFFFF", borderRadius: "8px", padding: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: "10px" }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
          /* @__PURE__ */ jsx(Radio, { size: 18, color: "#C0392B" }),
          /* @__PURE__ */ jsx("h2", { style: { margin: 0, fontSize: "15px", color: "#1A1A1A", fontWeight: "800" }, children: "Share Location" })
        ] }),
        /* @__PURE__ */ jsx(
          PrimaryButton,
          {
            onClick: () => setSharing((value) => !value),
            disabled: updating || latestLocation?.status === "arrived",
            icon: Navigation,
            children: sharing ? "Stop Sharing" : "Start Live Updates"
          }
        ),
        /* @__PURE__ */ jsx(
          SecondaryButton,
          {
            onClick: () => updateLocation("arrived"),
            disabled: updating || latestLocation?.status === "arrived",
            icon: MapPin,
            children: updating ? "Updating..." : "I've Arrived"
          }
        ),
        /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: "11px", color: "#6B6B6B", lineHeight: "1.5" }, children: "Live updates run every 20 seconds while you are traveling and stop after arrival." })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }, children: [
        /* @__PURE__ */ jsx(SecondaryButton, { onClick: () => navigate(`/matches/${matchId}/chat`), icon: MessageCircle, children: "Chat" }),
        isDonor ? /* @__PURE__ */ jsx(PrimaryButton, { onClick: () => navigate(`/donor/match/${matchId}/checkin`), icon: MapPin, children: "Check-in OTP" }) : /* @__PURE__ */ jsx(PrimaryButton, { onClick: () => loadTracking(), icon: Radio, children: "Refresh" })
      ] })
    ] })
  ] });
}
const page$5 = UNSAFE_withComponentProps(function WrappedPage22(props) {
  const params = useParams();
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(MatchTrackingPage, {
      ...props,
      matchId: params.matchId
    })
  });
});
const route22 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$5
}, Symbol.toStringTag, { value: "Module" }));
const inputStyle$1 = {
  width: "100%",
  height: "48px",
  borderRadius: "8px",
  border: "1.5px solid #C8C8C8",
  paddingInline: "14px",
  fontSize: "15px",
  color: "#1A1A1A",
  backgroundColor: "#FFFFFF",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box"
};
const ROLE_HOME_ROUTE$2 = {
  donor: "/donor/home",
  requester: "/dashboard",
  hospital: "/hospital/dashboard"
};
function normalizeProfileRole(role) {
  if (role === "patient_family") return "requester";
  if (role === "hospital_officer") return "hospital";
  return role ?? "donor";
}
function Field$1({ label, children }) {
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "6px" }, children: [
    /* @__PURE__ */ jsx("label", { style: { fontSize: "13px", fontWeight: "600", color: "#1A1A1A" }, children: label }),
    children
  ] });
}
function ProfilePage() {
  const {
    currentUser,
    isAuthenticated,
    updateCurrentUser,
    markAllNotificationsRead,
    logout
  } = useApp();
  const navigate = useNavigate$1();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(null);
  const [done, setDone] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Profile updated.");
  const [roleSwitchConfirmed, setRoleSwitchConfirmed] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    bloodGroup: "",
    location: "",
    phone: "",
    role: "donor",
    isAvailable: false
  });
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  useEffect(() => {
    if (!currentUser) return;
    setForm({
      fullName: currentUser.name ?? "",
      bloodGroup: currentUser.bloodGroup ?? "",
      location: currentUser.location ?? "",
      phone: currentUser.phone ?? "",
      role: normalizeProfileRole(currentUser.role),
      isAvailable: !!currentUser.isAvailable
    });
    setRoleSwitchConfirmed(false);
  }, [currentUser]);
  if (!currentUser) return null;
  const originalRole = normalizeProfileRole(currentUser.role);
  const isHospitalAccount = originalRole === "hospital";
  const roleChanged = form.role !== originalRole;
  const canSave = form.fullName.trim().length > 0 && form.role && (!roleChanged || roleSwitchConfirmed) && (form.role !== "donor" || !!form.bloodGroup);
  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError(null);
    try {
      await logout();
    } catch (e) {
      setLogoutError(e?.message ?? "Failed to sign out");
      setLoggingOut(false);
    }
  };
  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    setError(null);
    setDone(false);
    setSuccessMessage("Profile updated.");
    try {
      const { data: user, error: updateError } = await supabase.from("users").update({
        full_name: form.fullName.trim(),
        phone: form.phone.trim() || null,
        blood_type: form.bloodGroup || null,
        location: form.location.trim() || null,
        availability_status: form.isAvailable ? 1 : 0
      }).eq("id", currentUser.id).select(
        "id, full_name, email, phone, role, blood_type, location, availability_status, is_verified, last_donation_at, created_at"
      ).single();
      if (updateError) throw updateError;
      updateCurrentUser({
        ...user,
        name: user.full_name,
        bloodGroup: user.blood_type,
        isAvailable: !!user.availability_status
      });
      if (roleChanged) {
        const { error: roleChangeError } = await supabase.rpc(
          "request_role_change",
          {
            target_role: form.role
          }
        );
        if (roleChangeError) throw roleChangeError;
        setSuccessMessage("Profile updated. Role change request submitted.");
      }
      setDone(true);
      setRoleSwitchConfirmed(false);
    } catch (e) {
      setError(e?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          flex: 1,
          paddingBottom: "80px"
        },
        children: [
          /* @__PURE__ */ jsx(TopAppBar, { title: "Profile", onBellPress: markAllNotificationsRead }),
          /* @__PURE__ */ jsxs("div", { style: { padding: "16px 12px 20px" }, children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => navigate(-1),
                style: {
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#F4F4F4",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  marginBottom: "16px"
                },
                children: /* @__PURE__ */ jsx(ChevronLeft, { size: 20, color: "#1A1A1A" })
              }
            ),
            /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  backgroundColor: "#FFFFFF",
                  borderRadius: "12px",
                  padding: "18px 16px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px"
                },
                children: [
                  /* @__PURE__ */ jsx(Field$1, { label: "Full Name", children: /* @__PURE__ */ jsx(
                    "input",
                    {
                      style: inputStyle$1,
                      type: "text",
                      value: form.fullName,
                      onChange: (e) => setForm((f) => ({ ...f, fullName: e.target.value }))
                    }
                  ) }),
                  /* @__PURE__ */ jsx(Field$1, { label: "Blood Type", children: /* @__PURE__ */ jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: "8px" }, children: BLOOD_GROUPS$1.map((group) => /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setForm((f) => ({ ...f, bloodGroup: group })),
                      style: {
                        background: "none",
                        border: `2px solid ${form.bloodGroup === group ? "#C0392B" : "#C8C8C8"}`,
                        borderRadius: "8px",
                        padding: 0,
                        cursor: "pointer",
                        boxShadow: form.bloodGroup === group ? "0 0 0 3px #FADBD8" : "none"
                      },
                      children: /* @__PURE__ */ jsx(BloodGroupTag, { group, size: "md" })
                    },
                    group
                  )) }) }),
                  /* @__PURE__ */ jsx(Field$1, { label: "Location", children: /* @__PURE__ */ jsx(
                    "input",
                    {
                      style: inputStyle$1,
                      type: "text",
                      value: form.location,
                      onChange: (e) => setForm((f) => ({ ...f, location: e.target.value }))
                    }
                  ) }),
                  /* @__PURE__ */ jsx(Field$1, { label: "Phone / Contact", children: /* @__PURE__ */ jsx(
                    "input",
                    {
                      style: inputStyle$1,
                      type: "tel",
                      value: form.phone,
                      onChange: (e) => setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  ) }),
                  /* @__PURE__ */ jsx(Field$1, { label: "Role", children: isHospitalAccount ? /* @__PURE__ */ jsxs(
                    "div",
                    {
                      style: {
                        minHeight: "48px",
                        borderRadius: "8px",
                        border: "1.5px solid #C8C8C8",
                        padding: "12px 14px",
                        backgroundColor: "#FAFAFA",
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#1A1A1A"
                      },
                      children: [
                        "Hospital",
                        /* @__PURE__ */ jsx(
                          "p",
                          {
                            style: {
                              margin: "4px 0 0",
                              fontSize: "12px",
                              fontWeight: "500",
                              color: "#6B6B6B",
                              lineHeight: "1.4"
                            },
                            children: "Hospital accounts cannot switch into donor or patient mode from profile."
                          }
                        )
                      ]
                    }
                  ) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        style: {
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "8px"
                        },
                        children: [
                          { value: "donor", label: "Donor", Icon: Droplets },
                          {
                            value: "requester",
                            label: "Patient / Family",
                            Icon: User
                          }
                        ].map(({ value, label, Icon }) => {
                          const active = form.role === value;
                          return /* @__PURE__ */ jsxs(
                            "button",
                            {
                              type: "button",
                              onClick: () => {
                                setForm((f) => ({ ...f, role: value }));
                                setRoleSwitchConfirmed(false);
                                setDone(false);
                              },
                              style: {
                                height: "48px",
                                borderRadius: "8px",
                                border: `1.5px solid ${active ? "#C0392B" : "#C8C8C8"}`,
                                backgroundColor: active ? "#FADBD8" : "#FFFFFF",
                                color: active ? "#922B21" : "#1A1A1A",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                fontSize: "13px",
                                fontWeight: "800",
                                cursor: "pointer",
                                fontFamily: "inherit"
                              },
                              children: [
                                /* @__PURE__ */ jsx(Icon, { size: 16 }),
                                label
                              ]
                            },
                            value
                          );
                        })
                      }
                    ),
                    roleChanged && /* @__PURE__ */ jsxs(
                      "label",
                      {
                        style: {
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          padding: "12px 14px",
                          backgroundColor: "#FFF7ED",
                          border: "1px solid #FDBA74",
                          borderRadius: "8px",
                          cursor: "pointer"
                        },
                        children: [
                          /* @__PURE__ */ jsx(
                            "input",
                            {
                              type: "checkbox",
                              checked: roleSwitchConfirmed,
                              onChange: (e) => setRoleSwitchConfirmed(e.target.checked),
                              style: {
                                width: "18px",
                                height: "18px",
                                accentColor: "#C0392B",
                                flexShrink: 0
                              }
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            "span",
                            {
                              style: {
                                fontSize: "12px",
                                color: "#9A3412",
                                lineHeight: "1.5"
                              },
                              children: "I understand this changes my active app mode and the screens I use after saving."
                            }
                          )
                        ]
                      }
                    )
                  ] }) }),
                  form.role === "donor" && !form.bloodGroup && /* @__PURE__ */ jsxs(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        backgroundColor: "#FADBD8",
                        border: "1px solid #F1948A",
                        borderRadius: "8px",
                        padding: "12px 14px"
                      },
                      children: [
                        /* @__PURE__ */ jsx(
                          AlertTriangle,
                          {
                            size: 16,
                            color: "#922B21",
                            style: { flexShrink: 0, marginTop: "1px" }
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "span",
                          {
                            style: {
                              fontSize: "12px",
                              color: "#922B21",
                              fontWeight: "600",
                              lineHeight: "1.5"
                            },
                            children: "Blood type is required before using donor mode."
                          }
                        )
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "label",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 12px",
                        backgroundColor: "#FAFAFA",
                        borderRadius: "10px",
                        border: "1px solid #EFEFEF",
                        cursor: "pointer"
                      },
                      children: [
                        /* @__PURE__ */ jsx(
                          "span",
                          {
                            style: {
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#1A1A1A"
                            },
                            children: "Availability"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            type: "checkbox",
                            checked: form.isAvailable,
                            onChange: (e) => setForm((f) => ({ ...f, isAvailable: e.target.checked })),
                            style: {
                              width: "18px",
                              height: "18px",
                              accentColor: "#C0392B"
                            }
                          }
                        )
                      ]
                    }
                  ),
                  error && /* @__PURE__ */ jsx(
                    "div",
                    {
                      style: {
                        backgroundColor: "#FADBD8",
                        border: "1px solid #F1948A",
                        borderRadius: "8px",
                        padding: "12px 14px",
                        fontSize: "13px",
                        color: "#922B21",
                        fontWeight: "600"
                      },
                      children: error
                    }
                  ),
                  done && /* @__PURE__ */ jsx(
                    "div",
                    {
                      style: {
                        backgroundColor: "#D5F5E3",
                        border: "1px solid #A9DFBF",
                        borderRadius: "8px",
                        padding: "12px 14px",
                        fontSize: "13px",
                        color: "#1E8449",
                        fontWeight: "600"
                      },
                      children: successMessage
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "10px" }, children: [
                    /* @__PURE__ */ jsx(SecondaryButton, { onClick: () => navigate(-1), style: { flex: 1 }, children: "Cancel" }),
                    /* @__PURE__ */ jsx(
                      PrimaryButton,
                      {
                        onClick: handleSave,
                        disabled: !canSave || saving,
                        icon: CheckCircle2,
                        style: { flex: 1 },
                        children: saving ? "Saving..." : "Save Changes"
                      }
                    )
                  ] }),
                  logoutError && /* @__PURE__ */ jsx(
                    "div",
                    {
                      style: {
                        backgroundColor: "#FADBD8",
                        border: "1px solid #F1948A",
                        borderRadius: "8px",
                        padding: "12px 14px",
                        fontSize: "13px",
                        color: "#922B21",
                        fontWeight: "600"
                      },
                      children: logoutError
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    SecondaryButton,
                    {
                      onClick: handleLogout,
                      disabled: loggingOut,
                      icon: LogOut,
                      children: loggingOut ? "Logging out..." : "Logout"
                    }
                  )
                ]
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      BottomNavBar,
      {
        onNavigate: (key) => {
          if (key === "home")
            navigate(
              ROLE_HOME_ROUTE$2[normalizeProfileRole(currentUser.role)] ?? "/dashboard"
            );
          if (key === "profile") navigate("/profile");
        }
      }
    )
  ] });
}
const page$4 = UNSAFE_withComponentProps(function WrappedPage23(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(ProfilePage, {
      ...props
    })
  });
});
const route23 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$4
}, Symbol.toStringTag, { value: "Module" }));
const ROLE_META = {
  donor: {
    label: "Blood Donor",
    icon: Droplets,
    color: "#C0392B",
    tint: "#FADBD8"
  },
  requester: {
    label: "Patient / Family",
    icon: User,
    color: "#1E40AF",
    tint: "#DBEAFE"
  },
  hospital: {
    label: "Hospital Officer",
    icon: Building2,
    color: "#5B21B6",
    tint: "#EDE9FE"
  }
};
const TOTAL_STEPS = 3;
function Field({ label, required, children }) {
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "6px" }, children: [
    /* @__PURE__ */ jsxs("label", { style: { fontSize: "13px", fontWeight: "600", color: "#1A1A1A" }, children: [
      label,
      required && /* @__PURE__ */ jsx("span", { style: { color: "#C0392B", marginLeft: "2px" }, children: "*" })
    ] }),
    children
  ] });
}
const inputStyle = {
  width: "100%",
  height: "48px",
  borderRadius: "8px",
  border: "1.5px solid #C8C8C8",
  paddingInline: "14px",
  fontSize: "15px",
  color: "#1A1A1A",
  backgroundColor: "#FFFFFF",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  transition: "border-color 150ms"
};
function StepBar({ current, role }) {
  const meta = ROLE_META[role] || ROLE_META.donor;
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        marginBottom: "28px"
      },
      children: Array.from({ length: TOTAL_STEPS }).map((_, i) => {
        const done = i < current - 1;
        const active = i === current - 1;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              flex: i < TOTAL_STEPS - 1 ? 1 : "none",
              gap: "6px"
            },
            children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  style: {
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: done ? "#27AE60" : active ? meta.color : "#F4F4F4",
                    border: done || active ? "none" : "2px solid #C8C8C8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 200ms"
                  },
                  children: done ? /* @__PURE__ */ jsx(CheckCircle2, { size: 14, color: "#FFFFFF", strokeWidth: 2.5 }) : /* @__PURE__ */ jsx(
                    "span",
                    {
                      style: {
                        fontSize: "11px",
                        fontWeight: "700",
                        color: active ? "#FFFFFF" : "#6B6B6B"
                      },
                      children: i + 1
                    }
                  )
                }
              ),
              i < TOTAL_STEPS - 1 && /* @__PURE__ */ jsx(
                "div",
                {
                  style: {
                    flex: 1,
                    height: "2px",
                    backgroundColor: done ? "#27AE60" : "#E0E0E0",
                    borderRadius: "1px",
                    transition: "background-color 300ms"
                  }
                }
              )
            ]
          },
          i
        );
      })
    }
  );
}
function Step1({ form, setForm }) {
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "18px" }, children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(
        "h2",
        {
          style: {
            fontSize: "20px",
            fontWeight: "800",
            color: "#1A1A1A",
            margin: "0 0 4px"
          },
          children: "Account Credentials"
        }
      ),
      /* @__PURE__ */ jsx("p", { style: { fontSize: "13px", color: "#6B6B6B", margin: 0 }, children: "Create your secure LyfeBlood account." })
    ] }),
    /* @__PURE__ */ jsx(Field, { label: "Full Name", required: true, children: /* @__PURE__ */ jsx(
      "input",
      {
        style: inputStyle,
        type: "text",
        placeholder: "e.g. Chukwuemeka Obi",
        value: form.fullName,
        onChange: (e) => setForm((f) => ({ ...f, fullName: e.target.value }))
      }
    ) }),
    /* @__PURE__ */ jsx(Field, { label: "Email Address", required: true, children: /* @__PURE__ */ jsx(
      "input",
      {
        style: inputStyle,
        type: "email",
        placeholder: "you@example.com",
        value: form.email,
        onChange: (e) => setForm((f) => ({ ...f, email: e.target.value }))
      }
    ) }),
    /* @__PURE__ */ jsx(Field, { label: "Phone Number", required: true, children: /* @__PURE__ */ jsx(
      "input",
      {
        style: inputStyle,
        type: "tel",
        placeholder: "+234 800 000 0000",
        value: form.phone,
        onChange: (e) => setForm((f) => ({ ...f, phone: e.target.value }))
      }
    ) }),
    /* @__PURE__ */ jsx(Field, { label: "Password", required: true, children: /* @__PURE__ */ jsxs("div", { style: { position: "relative" }, children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          style: { ...inputStyle, paddingRight: "44px" },
          type: showPw ? "text" : "password",
          placeholder: "Min. 8 characters",
          value: form.password,
          onChange: (e) => setForm((f) => ({ ...f, password: e.target.value }))
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setShowPw((v) => !v),
          style: {
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#6B6B6B",
            padding: 0
          },
          children: showPw ? /* @__PURE__ */ jsx(EyeOff, { size: 18 }) : /* @__PURE__ */ jsx(Eye, { size: 18 })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs(Field, { label: "Confirm Password", required: true, children: [
      /* @__PURE__ */ jsxs("div", { style: { position: "relative" }, children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            style: {
              ...inputStyle,
              paddingRight: "44px",
              borderColor: form.confirmPassword && form.confirmPassword !== form.password ? "#C0392B" : "#C8C8C8"
            },
            type: showConfirm ? "text" : "password",
            placeholder: "Re-enter your password",
            value: form.confirmPassword,
            onChange: (e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setShowConfirm((v) => !v),
            style: {
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6B6B6B",
              padding: 0
            },
            children: showConfirm ? /* @__PURE__ */ jsx(EyeOff, { size: 18 }) : /* @__PURE__ */ jsx(Eye, { size: 18 })
          }
        )
      ] }),
      form.confirmPassword && form.confirmPassword !== form.password && /* @__PURE__ */ jsx("span", { style: { fontSize: "11px", color: "#C0392B" }, children: "Passwords do not match." })
    ] })
  ] });
}
function Step2Donor({ form, setForm }) {
  const ageNum = parseInt(form.age, 10);
  const ageValid = !form.age || ageNum >= 18 && ageNum <= 55;
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "20px" }, children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(
        "h2",
        {
          style: {
            fontSize: "20px",
            fontWeight: "800",
            color: "#1A1A1A",
            margin: "0 0 4px"
          },
          children: "Donor Profile"
        }
      ),
      /* @__PURE__ */ jsx("p", { style: { fontSize: "13px", color: "#6B6B6B", margin: 0 }, children: "Tell us about your blood type and location." })
    ] }),
    /* @__PURE__ */ jsx(Field, { label: "Blood Group", required: true, children: /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginTop: "2px"
        },
        children: BLOOD_GROUPS$1.map((g) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setForm((f) => ({ ...f, bloodGroup: g })),
            style: {
              background: "none",
              border: `2px solid ${form.bloodGroup === g ? "#C0392B" : "#C8C8C8"}`,
              borderRadius: "8px",
              padding: "0",
              cursor: "pointer",
              outline: "none",
              transform: form.bloodGroup === g ? "scale(1.06)" : "scale(1)",
              transition: "border-color 150ms, transform 150ms",
              boxShadow: form.bloodGroup === g ? "0 0 0 3px #FADBD8" : "none"
            },
            children: /* @__PURE__ */ jsx(BloodGroupTag, { group: g, size: "lg" })
          },
          g
        ))
      }
    ) }),
    /* @__PURE__ */ jsxs(Field, { label: "Age", required: true, children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          style: {
            ...inputStyle,
            borderColor: form.age && !ageValid ? "#C0392B" : "#C8C8C8",
            width: "120px"
          },
          type: "number",
          min: "18",
          max: "55",
          placeholder: "e.g. 28",
          value: form.age,
          onChange: (e) => setForm((f) => ({ ...f, age: e.target.value }))
        }
      ),
      form.age && !ageValid && /* @__PURE__ */ jsx("span", { style: { fontSize: "11px", color: "#C0392B" }, children: "Donors must be between 18 and 55 years old." }),
      !form.age && /* @__PURE__ */ jsx("span", { style: { fontSize: "11px", color: "#6B6B6B" }, children: "Must be between 18 – 55 years." })
    ] }),
    /* @__PURE__ */ jsx(Field, { label: "City / Local Government Area", required: true, children: /* @__PURE__ */ jsx(
      "input",
      {
        style: inputStyle,
        type: "text",
        placeholder: "e.g. Owerri North, Imo State",
        value: form.city,
        onChange: (e) => setForm((f) => ({ ...f, city: e.target.value }))
      }
    ) })
  ] });
}
function Step2Requester({ form, setForm }) {
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "18px" }, children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(
        "h2",
        {
          style: {
            fontSize: "20px",
            fontWeight: "800",
            color: "#1A1A1A",
            margin: "0 0 4px"
          },
          children: "Patient Details"
        }
      ),
      /* @__PURE__ */ jsx("p", { style: { fontSize: "13px", color: "#6B6B6B", margin: 0 }, children: "Tell us about the patient you're requesting blood for." })
    ] }),
    /* @__PURE__ */ jsx(Field, { label: "Patient Full Name", required: true, children: /* @__PURE__ */ jsx(
      "input",
      {
        style: inputStyle,
        type: "text",
        placeholder: "e.g. Mr. Emeka Obi",
        value: form.patientName,
        onChange: (e) => setForm((f) => ({ ...f, patientName: e.target.value }))
      }
    ) }),
    /* @__PURE__ */ jsx(Field, { label: "Your Relationship to Patient", required: true, children: /* @__PURE__ */ jsxs(
      "select",
      {
        style: { ...inputStyle, cursor: "pointer" },
        value: form.relationship,
        onChange: (e) => setForm((f) => ({ ...f, relationship: e.target.value })),
        children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Select relationship" }),
          /* @__PURE__ */ jsx("option", { children: "Spouse" }),
          /* @__PURE__ */ jsx("option", { children: "Parent" }),
          /* @__PURE__ */ jsx("option", { children: "Child" }),
          /* @__PURE__ */ jsx("option", { children: "Sibling" }),
          /* @__PURE__ */ jsx("option", { children: "Extended Family" }),
          /* @__PURE__ */ jsx("option", { children: "Friend / Colleague" }),
          /* @__PURE__ */ jsx("option", { children: "Other" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(Field, { label: "Blood Group Needed", required: true, children: /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginTop: "2px"
        },
        children: BLOOD_GROUPS$1.map((g) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setForm((f) => ({ ...f, bloodGroup: g })),
            style: {
              background: "none",
              border: `2px solid ${form.bloodGroup === g ? "#1E40AF" : "#C8C8C8"}`,
              borderRadius: "8px",
              padding: 0,
              cursor: "pointer",
              outline: "none",
              transform: form.bloodGroup === g ? "scale(1.06)" : "scale(1)",
              transition: "all 150ms",
              boxShadow: form.bloodGroup === g ? "0 0 0 3px #DBEAFE" : "none"
            },
            children: /* @__PURE__ */ jsx(BloodGroupTag, { group: g, size: "lg" })
          },
          g
        ))
      }
    ) }),
    /* @__PURE__ */ jsx(Field, { label: "Hospital / Location", required: true, children: /* @__PURE__ */ jsx(
      "input",
      {
        style: inputStyle,
        type: "text",
        placeholder: "e.g. St. David's Hospital, Owerri",
        value: form.hospital,
        onChange: (e) => setForm((f) => ({ ...f, hospital: e.target.value }))
      }
    ) })
  ] });
}
function Step2Hospital({ form, setForm }) {
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "18px" }, children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(
        "h2",
        {
          style: {
            fontSize: "20px",
            fontWeight: "800",
            color: "#1A1A1A",
            margin: "0 0 4px"
          },
          children: "Facility Details"
        }
      ),
      /* @__PURE__ */ jsx("p", { style: { fontSize: "13px", color: "#6B6B6B", margin: 0 }, children: "Provide your hospital's official information." })
    ] }),
    /* @__PURE__ */ jsx(Field, { label: "Hospital / Facility Name", required: true, children: /* @__PURE__ */ jsx(
      "input",
      {
        style: inputStyle,
        type: "text",
        placeholder: "e.g. Federal Medical Centre Owerri",
        value: form.hospitalName,
        onChange: (e) => setForm((f) => ({ ...f, hospitalName: e.target.value }))
      }
    ) }),
    /* @__PURE__ */ jsx(Field, { label: "Department", required: true, children: /* @__PURE__ */ jsx(
      "input",
      {
        style: inputStyle,
        type: "text",
        placeholder: "e.g. Blood Bank & Procurement",
        value: form.department,
        onChange: (e) => setForm((f) => ({ ...f, department: e.target.value }))
      }
    ) }),
    /* @__PURE__ */ jsx(Field, { label: "Full Address", required: true, children: /* @__PURE__ */ jsx(
      "input",
      {
        style: inputStyle,
        type: "text",
        placeholder: "e.g. Orlu Road, Owerri Municipal",
        value: form.address,
        onChange: (e) => setForm((f) => ({ ...f, address: e.target.value }))
      }
    ) }),
    /* @__PURE__ */ jsx(Field, { label: "Facility Type", required: true, children: /* @__PURE__ */ jsxs(
      "select",
      {
        style: { ...inputStyle, cursor: "pointer" },
        value: form.facilityType,
        onChange: (e) => setForm((f) => ({ ...f, facilityType: e.target.value })),
        children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Select type" }),
          /* @__PURE__ */ jsx("option", { children: "Federal Teaching / Medical Centre" }),
          /* @__PURE__ */ jsx("option", { children: "State General Hospital" }),
          /* @__PURE__ */ jsx("option", { children: "Private Hospital / Clinic" }),
          /* @__PURE__ */ jsx("option", { children: "Mission / Faith-based Hospital" }),
          /* @__PURE__ */ jsx("option", { children: "Primary Health Centre" })
        ]
      }
    ) })
  ] });
}
function Step3Donor({ form, setForm }) {
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setForm((f) => ({ ...f, kycFile: file, kycPreview: e.target.result }));
    reader.readAsDataURL(file);
  };
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "20px" }, children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(
        "h2",
        {
          style: {
            fontSize: "20px",
            fontWeight: "800",
            color: "#1A1A1A",
            margin: "0 0 4px"
          },
          children: "Identity Verification"
        }
      ),
      /* @__PURE__ */ jsx("p", { style: { fontSize: "13px", color: "#6B6B6B", margin: 0 }, children: "Upload a government-issued ID to complete your donor profile." })
    ] }),
    /* @__PURE__ */ jsxs(Field, { label: "National ID / Voter Card / Driver's Licence", required: true, children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          onClick: () => fileRef.current?.click(),
          onDragOver: (e) => {
            e.preventDefault();
            setDragOver(true);
          },
          onDragLeave: () => setDragOver(false),
          onDrop: (e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files[0]);
          },
          style: {
            border: `2px dashed ${dragOver ? "#C0392B" : form.kycPreview ? "#27AE60" : "#C8C8C8"}`,
            borderRadius: "12px",
            padding: "32px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            cursor: "pointer",
            backgroundColor: dragOver ? "#FADBD8" : form.kycPreview ? "#D5F5E3" : "#FAFAFA",
            transition: "all 200ms",
            minHeight: "160px"
          },
          children: form.kycPreview ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: form.kycPreview,
                alt: "ID preview",
                style: {
                  width: "100%",
                  maxWidth: "280px",
                  height: "140px",
                  objectFit: "cover",
                  borderRadius: "8px"
                }
              }
            ),
            /* @__PURE__ */ jsxs(
              "p",
              {
                style: {
                  fontSize: "12px",
                  color: "#27AE60",
                  fontWeight: "600",
                  margin: 0
                },
                children: [
                  "✓ ",
                  form.kycFile?.name || "File selected",
                  " — tap to replace"
                ]
              }
            )
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  backgroundColor: "#FADBD8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                },
                children: /* @__PURE__ */ jsx(Upload, { size: 22, color: "#C0392B" })
              }
            ),
            /* @__PURE__ */ jsxs("div", { style: { textAlign: "center" }, children: [
              /* @__PURE__ */ jsx(
                "p",
                {
                  style: {
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#1A1A1A",
                    margin: "0 0 4px"
                  },
                  children: "Tap to upload National ID / Voter Card"
                }
              ),
              /* @__PURE__ */ jsx("p", { style: { fontSize: "12px", color: "#6B6B6B", margin: 0 }, children: "or drag and drop here · JPG, PNG, PDF up to 5MB" })
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          ref: fileRef,
          type: "file",
          accept: "image/*,.pdf",
          style: { display: "none" },
          onChange: (e) => handleFile(e.target.files[0])
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          backgroundColor: "#FADBD8",
          borderRadius: "10px",
          padding: "14px",
          display: "flex",
          gap: "10px"
        },
        children: [
          /* @__PURE__ */ jsx("span", { style: { fontSize: "18px", lineHeight: 1 }, children: "🔒" }),
          /* @__PURE__ */ jsx(
            "p",
            {
              style: {
                fontSize: "12px",
                color: "#922B21",
                margin: 0,
                lineHeight: "1.5"
              },
              children: "Your ID is encrypted and used solely to verify donor identity. It is never shared with third parties."
            }
          )
        ]
      }
    )
  ] });
}
function Step3Declaration({ form, setForm, role }) {
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "20px" }, children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(
        "h2",
        {
          style: {
            fontSize: "20px",
            fontWeight: "800",
            color: "#1A1A1A",
            margin: "0 0 4px"
          },
          children: role === "hospital" ? "Licence & Declaration" : "Declaration"
        }
      ),
      /* @__PURE__ */ jsx("p", { style: { fontSize: "13px", color: "#6B6B6B", margin: 0 }, children: "Final step before your account is created." })
    ] }),
    role === "hospital" && /* @__PURE__ */ jsxs(Field, { label: "HEFAMAA / State Ministry Licence Number", required: true, children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          style: inputStyle,
          type: "text",
          placeholder: "e.g. IMO/HEFA/2024/00142",
          value: form.licenceNumber,
          onChange: (e) => setForm((f) => ({ ...f, licenceNumber: e.target.value }))
        }
      ),
      /* @__PURE__ */ jsx("span", { style: { fontSize: "11px", color: "#6B6B6B" }, children: "Issued by the Imo State Ministry of Health." })
    ] }),
    [
      role === "hospital" ? "I confirm this facility is a licensed medical institution operating legally in Imo State." : "I confirm that the patient information provided is accurate to the best of my knowledge.",
      "I understand that LyfeBlood facilitates donor connections only — all clinical and transfusion decisions remain with licensed medical professionals.",
      "I agree to the LyfeBlood Terms of Service and Community Safety Guidelines."
    ].map((text, i) => /* @__PURE__ */ jsxs(
      "label",
      {
        style: {
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          cursor: "pointer"
        },
        children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: !!form.declarations?.[i],
              onChange: (e) => {
                const d = [...form.declarations || [false, false, false]];
                d[i] = e.target.checked;
                setForm((f) => ({ ...f, declarations: d }));
              },
              style: {
                width: "18px",
                height: "18px",
                marginTop: "2px",
                accentColor: "#C0392B",
                flexShrink: 0
              }
            }
          ),
          /* @__PURE__ */ jsx(
            "span",
            {
              style: { fontSize: "13px", color: "#4A4A4A", lineHeight: "1.5" },
              children: text
            }
          )
        ]
      },
      i
    ))
  ] });
}
function RegisterPage() {
  const navigate = useNavigate$1();
  const [role, setRole] = useState("donor");
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    bloodGroup: "",
    age: "",
    city: "",
    patientName: "",
    relationship: "",
    hospital: "",
    hospitalName: "",
    department: "",
    address: "",
    facilityType: "",
    licenceNumber: "",
    kycFile: null,
    kycPreview: null,
    declarations: [false, false, false]
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const r = params.get("role");
      if (r && ROLE_META[r]) setRole(r);
    }
  }, []);
  const meta = ROLE_META[role];
  const getRegistrationErrorMessage = (error) => {
    const message = typeof error?.message === "string" ? error.message : "Registration failed. Please try again.";
    if (message.toLowerCase().includes("database error saving new user")) {
      return "Registration failed while creating your profile. Please apply the latest Supabase migration, then try again.";
    }
    return message;
  };
  const canProceed = () => {
    if (step === 1) {
      return form.fullName && form.email && form.phone && form.password.length >= 8 && form.password === form.confirmPassword;
    }
    if (step === 2) {
      if (role === "donor")
        return form.bloodGroup && form.age && parseInt(form.age, 10) >= 18 && parseInt(form.age, 10) <= 55 && form.city;
      if (role === "requester")
        return form.patientName && form.relationship && form.bloodGroup && form.hospital;
      if (role === "hospital")
        return form.hospitalName && form.department && form.address && form.facilityType;
    }
    if (step === 3) {
      if (role === "donor") return !!form.kycFile;
      return form.declarations?.every(Boolean);
    }
    return true;
  };
  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }
    setSubmitting(true);
    setApiError(null);
    try {
      const { session, requiresEmailConfirmation, email: registeredEmail } = await apiRegister({
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: role === "requester" ? "requester" : role === "hospital" ? "hospital" : "donor",
        blood_type: form.bloodGroup || null,
        location: form.city || form.address || null
      });
      if (session?.access_token && session?.refresh_token) {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
      }
      navigate("/register/confirmation", {
        state: {
          requiresEmailConfirmation,
          email: registeredEmail ?? form.email
        }
      });
    } catch (e) {
      setApiError(getRegistrationErrorMessage(e));
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
  };
  const handleBack = () => {
    setApiError(null);
    if (step > 1) setStep((s) => s - 1);
    else navigate("/login");
  };
  const ctaLabel = submitting ? "Creating Account…" : step === TOTAL_STEPS ? "Create Account" : "Continue";
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: "100vh"
        },
        children: [
          /* @__PURE__ */ jsxs(
            "header",
            {
              style: {
                height: "56px",
                backgroundColor: "#FFFFFF",
                borderBottom: "1px solid #C8C8C8",
                display: "flex",
                alignItems: "center",
                paddingInline: "16px",
                gap: "12px",
                flexShrink: 0
              },
              children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: handleBack,
                    style: {
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#F4F4F4",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer"
                    },
                    children: /* @__PURE__ */ jsx(ChevronLeft, { size: 20, color: "#1A1A1A" })
                  }
                ),
                /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(
                  "span",
                  {
                    style: {
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "#1A1A1A"
                    },
                    children: "Create Account"
                  }
                ) }),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    style: {
                      fontSize: "11px",
                      fontWeight: "600",
                      color: meta.color,
                      backgroundColor: meta.tint,
                      paddingInline: "10px",
                      paddingBlock: "4px",
                      borderRadius: "999px"
                    },
                    children: meta.label
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              style: {
                display: "flex",
                gap: "0",
                backgroundColor: "#FFFFFF",
                borderBottom: "1px solid #C8C8C8"
              },
              children: Object.entries(ROLE_META).map(([key, m]) => {
                const Icon = m.icon;
                const active = role === key;
                return /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => {
                      setRole(key);
                      setStep(1);
                    },
                    style: {
                      flex: 1,
                      height: "44px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                      backgroundColor: "transparent",
                      border: "none",
                      borderBottom: `2.5px solid ${active ? m.color : "transparent"}`,
                      cursor: "pointer",
                      transition: "all 150ms",
                      paddingBottom: "2px"
                    },
                    children: [
                      /* @__PURE__ */ jsx(Icon, { size: 14, color: active ? m.color : "#6B6B6B" }),
                      /* @__PURE__ */ jsx(
                        "span",
                        {
                          style: {
                            fontSize: "12px",
                            fontWeight: active ? "700" : "500",
                            color: active ? m.color : "#6B6B6B"
                          },
                          children: m.label
                        }
                      )
                    ]
                  },
                  key
                );
              })
            }
          ),
          /* @__PURE__ */ jsxs("div", { style: { flex: 1, padding: "24px 16px 100px", overflowY: "auto" }, children: [
            /* @__PURE__ */ jsx(StepBar, { current: step, role }),
            step === 1 && /* @__PURE__ */ jsx(Step1, { form, setForm }),
            step === 2 && role === "donor" && /* @__PURE__ */ jsx(Step2Donor, { form, setForm }),
            step === 2 && role === "requester" && /* @__PURE__ */ jsx(Step2Requester, { form, setForm }),
            step === 2 && role === "hospital" && /* @__PURE__ */ jsx(Step2Hospital, { form, setForm }),
            step === 3 && role === "donor" && /* @__PURE__ */ jsx(Step3Donor, { form, setForm }),
            step === 3 && (role === "requester" || role === "hospital") && /* @__PURE__ */ jsx(Step3Declaration, { form, setForm, role }),
            apiError && /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  marginTop: "16px",
                  backgroundColor: "#FADBD8",
                  border: "1px solid #F1948A",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  fontSize: "13px",
                  color: "#922B21",
                  fontWeight: "600",
                  lineHeight: "1.5"
                },
                children: apiError
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                position: "sticky",
                bottom: 0,
                zIndex: 40,
                width: "100%",
                backgroundColor: "#FFFFFF",
                borderTop: "1px solid #C8C8C8",
                padding: "14px 16px",
                display: "flex",
                gap: "10px",
                boxSizing: "border-box",
                boxShadow: "0 -2px 12px rgba(0,0,0,0.06)"
              },
              children: [
                step > 1 && /* @__PURE__ */ jsx(
                  SecondaryButton,
                  {
                    onClick: handleBack,
                    style: { width: "80px", flexShrink: 0 },
                    children: "Back"
                  }
                ),
                /* @__PURE__ */ jsx(
                  PrimaryButton,
                  {
                    onClick: handleNext,
                    disabled: !canProceed() || submitting,
                    icon: step === TOTAL_STEPS ? CheckCircle2 : ChevronRight,
                    style: { flex: 1 },
                    children: ctaLabel
                  }
                )
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx("style", { jsx: true, global: true, children: `
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { margin: 0; padding: 0; }
        input:focus, select:focus { border-color: #C0392B !important; box-shadow: 0 0 0 3px #FADBD8; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      ` })
  ] });
}
const page$3 = UNSAFE_withComponentProps(function WrappedPage24(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(RegisterPage, {
      ...props
    })
  });
});
const route24 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$3
}, Symbol.toStringTag, { value: "Module" }));
function RegistrationConfirmationPage() {
  const location = useLocation$1();
  const requiresEmailConfirmation = Boolean(location.state?.requiresEmailConfirmation);
  const email = location.state?.email;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px"
        },
        children: [
          /* @__PURE__ */ jsxs("div", { style: { position: "relative", marginBottom: "28px" }, children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  backgroundColor: "#D5F5E3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both"
                },
                children: /* @__PURE__ */ jsx(CheckCircle2, { size: 64, color: "#27AE60", strokeWidth: 1.8 })
              }
            ),
            [
              { top: "-8px", left: "10px", color: "#C0392B", size: "10px" },
              { top: "-4px", right: "8px", color: "#27AE60", size: "8px" },
              { bottom: "4px", left: "-4px", color: "#F39C12", size: "7px" },
              { bottom: "-6px", right: "14px", color: "#C0392B", size: "9px" }
            ].map((dot, i) => /* @__PURE__ */ jsx(
              "span",
              {
                style: {
                  position: "absolute",
                  width: dot.size,
                  height: dot.size,
                  borderRadius: "50%",
                  backgroundColor: dot.color,
                  top: dot.top,
                  right: dot.right,
                  bottom: dot.bottom,
                  left: dot.left,
                  animation: `popIn ${0.3 + i * 0.08}s cubic-bezier(0.34, 1.56, 0.64, 1) both`
                }
              },
              i
            ))
          ] }),
          /* @__PURE__ */ jsx(
            "h1",
            {
              style: {
                fontSize: "28px",
                fontWeight: "800",
                color: "#1A1A1A",
                textAlign: "center",
                letterSpacing: "-0.02em",
                margin: "0 0 10px"
              },
              children: requiresEmailConfirmation ? "Check Your Email" : "You're All Set!"
            }
          ),
          /* @__PURE__ */ jsx(
            "p",
            {
              style: {
                fontSize: "15px",
                color: "#4A4A4A",
                textAlign: "center",
                lineHeight: "1.6",
                margin: "0 0 32px",
                maxWidth: "300px"
              },
              children: requiresEmailConfirmation ? `We sent a verification link${email ? ` to ${email}` : ""}. Please verify your email before signing in.` : "Your LyfeBlood account has been created. You can now respond to urgent blood requests and help save lives across Imo State."
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                width: "100%",
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                padding: "18px 20px",
                marginBottom: "32px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              },
              children: [
                /* @__PURE__ */ jsx(
                  "p",
                  {
                    style: {
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#6B6B6B",
                      margin: 0,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em"
                    },
                    children: "Your Account Status"
                  }
                ),
                [
                  {
                    label: requiresEmailConfirmation ? "Email Verification" : "Identity Verification",
                    value: "Under Review (24–48h)",
                    color: "#F39C12",
                    bg: "#FEF9C3"
                  },
                  {
                    label: "Profile Visibility",
                    value: requiresEmailConfirmation ? "Pending" : "Active",
                    color: requiresEmailConfirmation ? "#F39C12" : "#1E8449",
                    bg: requiresEmailConfirmation ? "#FEF9C3" : "#D5F5E3"
                  },
                  {
                    label: "Notifications",
                    value: "Enabled",
                    color: "#1E40AF",
                    bg: "#DBEAFE"
                  }
                ].map(({ label, value, color, bg }) => /* @__PURE__ */ jsxs(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    },
                    children: [
                      /* @__PURE__ */ jsx("span", { style: { fontSize: "13px", color: "#4A4A4A" }, children: label }),
                      /* @__PURE__ */ jsx(
                        "span",
                        {
                          style: {
                            fontSize: "12px",
                            fontWeight: "600",
                            color,
                            backgroundColor: bg,
                            paddingInline: "10px",
                            paddingBlock: "3px",
                            borderRadius: "999px"
                          },
                          children: value
                        }
                      )
                    ]
                  },
                  label
                ))
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                backgroundColor: "#FADBD8",
                borderRadius: "12px",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                width: "100%",
                marginBottom: "28px"
              },
              children: [
                /* @__PURE__ */ jsx(Heart, { size: 22, color: "#C0392B" }),
                /* @__PURE__ */ jsxs(
                  "p",
                  {
                    style: {
                      fontSize: "13px",
                      color: "#922B21",
                      margin: 0,
                      lineHeight: "1.5"
                    },
                    children: [
                      /* @__PURE__ */ jsx("strong", { children: "One donation" }),
                      " can save up to",
                      " ",
                      /* @__PURE__ */ jsx("strong", { children: "3 lives" }),
                      ". Your presence on LyfeBlood matters."
                    ]
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { style: { width: "100%" }, children: [
            /* @__PURE__ */ jsx(
              PrimaryButton,
              {
                onClick: () => {
                  if (typeof window !== "undefined")
                    window.location.href = "/login";
                },
                children: "Sign In to Your Account"
              }
            ),
            /* @__PURE__ */ jsx(
              "p",
              {
                style: {
                  textAlign: "center",
                  fontSize: "11px",
                  color: "#6B6B6B",
                  marginTop: "14px"
                },
                children: "Serving Owerri · Orlu · Okigwe and all Imo State LGAs"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx("style", { jsx: true, global: true, children: `
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { margin: 0; padding: 0; }
      ` })
  ] });
}
const page$2 = UNSAFE_withComponentProps(function WrappedPage25(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(RegistrationConfirmationPage, {
      ...props
    })
  });
});
const route25 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$2
}, Symbol.toStringTag, { value: "Module" }));
const ROLE_HOME_ROUTE$1 = {
  donor: "/donor/home",
  requester: "/dashboard",
  hospital: "/hospital/dashboard",
  patient_family: "/dashboard",
  hospital_officer: "/hospital/dashboard"
};
function normalizeRequestStatus(status) {
  switch (status) {
    case "Pending":
    case REQUEST_STATUS.PENDING:
      return REQUEST_STATUS.PENDING;
    case "Verified":
    case REQUEST_STATUS.VERIFIED:
      return REQUEST_STATUS.VERIFIED;
    case "Donor Matched":
    case REQUEST_STATUS.DONOR_MATCHED:
      return REQUEST_STATUS.DONOR_MATCHED;
    case "Arrived":
    case "Arrived At Lab":
    case REQUEST_STATUS.CHECKED_IN:
      return REQUEST_STATUS.CHECKED_IN;
    case "Blood Collected":
    case REQUEST_STATUS.BLOOD_COLLECTED:
      return REQUEST_STATUS.BLOOD_COLLECTED;
    case "Completed":
    case REQUEST_STATUS.FULFILLED:
      return REQUEST_STATUS.FULFILLED;
    case "Cancelled":
    case REQUEST_STATUS.CANCELLED:
      return REQUEST_STATUS.CANCELLED;
    default:
      return REQUEST_STATUS.PENDING;
  }
}
function normalizeBloodRequest(r) {
  return {
    id: r.id,
    tier: r.urgency_tier === "SOS" ? "sos" : "standard",
    bloodGroup: r.blood_type_needed ?? r.bloodGroup ?? null,
    unitsNeeded: r.units_needed ?? r.unitsNeeded ?? 1,
    unitsFulfilled: r.units_fulfilled ?? r.unitsFulfilled ?? 0,
    hospitalName: r.hospital_name ?? r.hospitalName ?? "Hospital",
    ward: r.ward ?? r.patient_ref ?? r.patientCode ?? "Blood request",
    patientCode: r.patient_ref ?? r.patientCode ?? null,
    status: normalizeRequestStatus(r.status),
    requestedBy: r.requested_by ?? r.requestedBy ?? null,
    requestDate: r.created_at ?? r.requestDate ?? (/* @__PURE__ */ new Date()).toISOString(),
    urgencyNote: r.urgency_note ?? r.urgencyNote ?? null,
    location: r.location ?? null,
    matching_status: r.matching_status ?? r.matchingStatus ?? "pending"
  };
}
function DetailRow({ label, value }) {
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "3px" }, children: [
    /* @__PURE__ */ jsx("span", { style: { fontSize: "11px", fontWeight: "700", color: "#6B6B6B", textTransform: "uppercase" }, children: label }),
    /* @__PURE__ */ jsx("span", { style: { fontSize: "14px", fontWeight: "600", color: "#1A1A1A", lineHeight: "1.4" }, children: value || "Not provided" })
  ] });
}
function Section({ title, icon: Icon, children }) {
  return /* @__PURE__ */ jsxs(
    "section",
    {
      style: {
        backgroundColor: "#FFFFFF",
        borderRadius: "8px",
        padding: "16px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "14px"
      },
      children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
          /* @__PURE__ */ jsx(Icon, { size: 18, color: "#C0392B" }),
          /* @__PURE__ */ jsx("h2", { style: { margin: 0, fontSize: "15px", fontWeight: "800", color: "#1A1A1A" }, children: title })
        ] }),
        children
      ]
    }
  );
}
function RequestDetailsPage() {
  const navigate = useNavigate$1();
  const { requestId } = useParams();
  const {
    currentUser,
    isAuthenticated,
    markAllNotificationsRead,
    updateRequestStatus
  } = useApp();
  const [request, setRequest] = useState(null);
  const [requestLoading, setRequestLoading] = useState(true);
  const [requestNotFound, setRequestNotFound] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const [consented, setConsented] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [flagged, setFlagged] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [statusSuccess, setStatusSuccess] = useState(null);
  const [requestMatches, setRequestMatches] = useState([]);
  const [acceptedMatches, setAcceptedMatches] = useState([]);
  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);
  useEffect(() => {
    if (!isAuthenticated || !requestId) return void 0;
    let isActive = true;
    setRequestLoading(true);
    setRequestNotFound(false);
    setRequestError(null);
    supabase.from("blood_requests").select("*").eq("id", requestId).maybeSingle().then(async ({ data: loadedRequest, error }) => {
      if (error) throw error;
      if (!isActive) return;
      if (!loadedRequest) {
        setRequest(null);
        setRequestMatches([]);
        setAcceptedMatches([]);
        setRequestNotFound(true);
        return;
      }
      setRequest(normalizeBloodRequest(loadedRequest));
      const { matches } = await apiGetMatches({ request_id: loadedRequest.id });
      if (!isActive) return;
      setRequestMatches(matches ?? []);
      setAcceptedMatches((matches ?? []).filter((match) => match.match_status === "Accepted"));
    }).catch((error) => {
      if (!isActive) return;
      setRequest(null);
      setRequestMatches([]);
      setAcceptedMatches([]);
      if (error?.status === 404) {
        setRequestNotFound(true);
        return;
      }
      setRequestError(error?.message ?? "Unable to load request details.");
    }).finally(() => {
      if (isActive) setRequestLoading(false);
    });
    return () => {
      isActive = false;
    };
  }, [isAuthenticated, requestId]);
  if (!currentUser) return null;
  const role = currentUser.role;
  const homeRoute = ROLE_HOME_ROUTE$1[role] ?? "/dashboard";
  const isHospital = role === "hospital" || role === "hospital_officer";
  const isPatient = ["requester", "patient", "patient_family"].includes(role);
  if (requestLoading) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", flex: 1, paddingBottom: "80px" }, children: [
        /* @__PURE__ */ jsx(TopAppBar, { title: "Request Details", onBellPress: markAllNotificationsRead }),
        /* @__PURE__ */ jsx("div", { style: { padding: "24px 12px" }, children: /* @__PURE__ */ jsx(Section, { title: "Loading request", icon: ClipboardCheck, children: /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: "14px", color: "#4A4A4A", lineHeight: "1.5" }, children: "Fetching the latest request details from the hospital record." }) }) })
      ] }),
      /* @__PURE__ */ jsx(BottomNavBar, { onNavigate: (key) => {
        if (key === "home") navigate(homeRoute);
        if (key === "profile") navigate("/profile");
      } })
    ] });
  }
  if (requestError) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", flex: 1, paddingBottom: "80px" }, children: [
        /* @__PURE__ */ jsx(TopAppBar, { title: "Request Details", onBellPress: markAllNotificationsRead }),
        /* @__PURE__ */ jsx("div", { style: { padding: "24px 12px" }, children: /* @__PURE__ */ jsxs(Section, { title: "Unable to load request", icon: AlertTriangle, children: [
          /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: "14px", color: "#4A4A4A", lineHeight: "1.5" }, children: requestError }),
          /* @__PURE__ */ jsx(SecondaryButton, { onClick: () => navigate(homeRoute), icon: ChevronLeft, children: "Back to Dashboard" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx(BottomNavBar, { onNavigate: (key) => {
        if (key === "home") navigate(homeRoute);
        if (key === "profile") navigate("/profile");
      } })
    ] });
  }
  if (requestNotFound || !request) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", flex: 1, paddingBottom: "80px" }, children: [
        /* @__PURE__ */ jsx(TopAppBar, { title: "Request Details", onBellPress: markAllNotificationsRead }),
        /* @__PURE__ */ jsx("div", { style: { padding: "24px 12px" }, children: /* @__PURE__ */ jsxs(Section, { title: "Request not found", icon: AlertTriangle, children: [
          /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: "14px", color: "#4A4A4A", lineHeight: "1.5" }, children: "This request could not be found or is not available to your account." }),
          /* @__PURE__ */ jsx(SecondaryButton, { onClick: () => navigate(homeRoute), icon: ChevronLeft, children: "Back to Dashboard" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx(BottomNavBar, { onNavigate: (key) => {
        if (key === "home") navigate(homeRoute);
        if (key === "profile") navigate("/profile");
      } })
    ] });
  }
  const handleFlag = () => {
    if (!flagReason) return;
    setFlagged(true);
  };
  const handleStatusUpdate = async (nextStatus) => {
    setStatusUpdating(true);
    setStatusError(null);
    setStatusSuccess(null);
    try {
      await updateRequestStatus(request.id, nextStatus);
      setRequest((prev) => prev ? { ...prev, status: nextStatus } : prev);
      setStatusSuccess(`Status updated to ${nextStatus.replaceAll("_", " ")}.`);
    } catch (error) {
      setStatusError(error?.message ?? "Unable to update request status.");
    } finally {
      setStatusUpdating(false);
    }
  };
  const statusActions = isHospital ? [
    request.status === REQUEST_STATUS.PENDING && {
      label: "Mark Verified",
      next: REQUEST_STATUS.VERIFIED
    },
    request.status === REQUEST_STATUS.VERIFIED && {
      label: "Mark Donor Matched",
      next: REQUEST_STATUS.DONOR_MATCHED
    },
    request.status === REQUEST_STATUS.CHECKED_IN && {
      label: "Mark Blood Collected",
      next: REQUEST_STATUS.BLOOD_COLLECTED
    },
    request.status === REQUEST_STATUS.BLOOD_COLLECTED && {
      label: "Mark Completed",
      next: REQUEST_STATUS.FULFILLED
    },
    ![REQUEST_STATUS.FULFILLED, REQUEST_STATUS.CANCELLED].includes(request.status) && {
      label: "Cancel Request",
      next: REQUEST_STATUS.CANCELLED,
      secondary: true
    }
  ].filter(Boolean) : [];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", flex: 1, paddingBottom: "80px" }, children: [
      /* @__PURE__ */ jsx(TopAppBar, { title: "Request Details", onBellPress: markAllNotificationsRead }),
      /* @__PURE__ */ jsxs("div", { style: { padding: "16px 12px 20px", display: "flex", flexDirection: "column", gap: "12px" }, children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => navigate(-1),
            "aria-label": "Back",
            style: {
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#F4F4F4",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer"
            },
            children: /* @__PURE__ */ jsx(ChevronLeft, { size: 20, color: "#1A1A1A" })
          }
        ),
        /* @__PURE__ */ jsxs(Section, { title: "Request Summary", icon: ClipboardCheck, children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }, children: [
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, children: [
              /* @__PURE__ */ jsx(BloodGroupTag, { group: request.bloodGroup, size: "lg" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { style: { margin: "0 0 3px", fontSize: "15px", fontWeight: "800", color: "#1A1A1A" }, children: request.hospitalName }),
                /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: "12px", color: "#6B6B6B" }, children: request.ward })
              ] })
            ] }),
            /* @__PURE__ */ jsx(RequestStatusBadge, { status: request.status, size: "sm" })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }, children: [
            /* @__PURE__ */ jsx(DetailRow, { label: "Units", value: `${request.unitsFulfilled}/${request.unitsNeeded}` }),
            /* @__PURE__ */ jsx(DetailRow, { label: "Priority", value: request.tier === "sos" ? "SOS" : "Standard" }),
            /* @__PURE__ */ jsx(DetailRow, { label: "Case Ref", value: request.patientCode }),
            /* @__PURE__ */ jsx(DetailRow, { label: "Location", value: request.location })
          ] }),
          request.urgencyNote && /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: "13px", color: "#922B21", lineHeight: "1.5", fontWeight: "600" }, children: request.urgencyNote })
        ] }),
        /* @__PURE__ */ jsx(DonationJourney, { request, matches: requestMatches }),
        /* @__PURE__ */ jsxs(Section, { title: "Verification & Status", icon: ShieldCheck, children: [
          /* @__PURE__ */ jsx(DetailRow, { label: "Current status", value: request.status.replaceAll("_", " ") }),
          /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: "12px", color: "#4A4A4A", lineHeight: "1.5" }, children: "Donors should only proceed after confirming this request with hospital staff. Hospital staff should update the status only after verification at the facility." }),
          statusError && /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: "12px", color: "#922B21", fontWeight: "700" }, children: statusError }),
          statusSuccess && /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: "12px", color: "#1E8449", fontWeight: "700" }, children: statusSuccess }),
          statusActions.map(
            (action) => action.secondary ? /* @__PURE__ */ jsx(
              SecondaryButton,
              {
                onClick: () => handleStatusUpdate(action.next),
                disabled: statusUpdating,
                children: statusUpdating ? "Saving..." : action.label
              },
              action.next
            ) : /* @__PURE__ */ jsx(
              PrimaryButton,
              {
                onClick: () => handleStatusUpdate(action.next),
                disabled: statusUpdating,
                icon: CheckCircle2,
                children: statusUpdating ? "Saving..." : action.label
              },
              action.next
            )
          )
        ] }),
        isPatient && acceptedMatches.length > 0 && /* @__PURE__ */ jsxs(Section, { title: "Donor Coordination", icon: Navigation, children: [
          /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: "12px", color: "#4A4A4A", lineHeight: "1.5" }, children: "Chat and live tracking are available because a matched donor accepted this request." }),
          acceptedMatches.map((match) => /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px"
              },
              children: [
                /* @__PURE__ */ jsx(
                  SecondaryButton,
                  {
                    onClick: () => navigate(`/matches/${match.id}/chat`),
                    icon: MessageCircle,
                    children: "Chat"
                  }
                ),
                /* @__PURE__ */ jsx(
                  PrimaryButton,
                  {
                    onClick: () => navigate(`/matches/${match.id}/tracking`),
                    icon: Navigation,
                    children: "Track Donor"
                  }
                )
              ]
            },
            match.id
          ))
        ] }),
        /* @__PURE__ */ jsxs(Section, { title: "Emergency Contact", icon: Phone, children: [
          /* @__PURE__ */ jsx(DetailRow, { label: "Facility", value: request.hospitalName }),
          /* @__PURE__ */ jsx(DetailRow, { label: "Where to go", value: request.location || request.ward }),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: "tel:112",
              style: {
                minHeight: "44px",
                borderRadius: "8px",
                backgroundColor: "#FADBD8",
                color: "#922B21",
                fontSize: "14px",
                fontWeight: "800",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                textDecoration: "none"
              },
              children: [
                /* @__PURE__ */ jsx(Phone, { size: 16 }),
                "Call Emergency Line"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(Section, { title: "Privacy & Consent", icon: ShieldCheck, children: [
          /* @__PURE__ */ jsxs("label", { style: { display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }, children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: consented,
                onChange: (event) => setConsented(event.target.checked),
                style: { width: "18px", height: "18px", accentColor: "#C0392B", flexShrink: 0 }
              }
            ),
            /* @__PURE__ */ jsx("span", { style: { fontSize: "12px", color: "#4A4A4A", lineHeight: "1.5" }, children: "I understand this request may contain sensitive medical context and should only be used for donation coordination with authorized hospital staff." })
          ] }),
          consented && /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: "12px", color: "#1E8449", fontWeight: "700" }, children: "Consent acknowledged for this session." })
        ] }),
        /* @__PURE__ */ jsxs(Section, { title: "Report / Flag Request", icon: Flag, children: [
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: flagReason,
              onChange: (event) => {
                setFlagReason(event.target.value);
                setFlagged(false);
              },
              style: {
                width: "100%",
                height: "46px",
                borderRadius: "8px",
                border: "1.5px solid #C8C8C8",
                paddingInline: "12px",
                fontSize: "14px",
                color: "#1A1A1A",
                backgroundColor: "#FFFFFF",
                fontFamily: "inherit"
              },
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Select a reason" }),
                /* @__PURE__ */ jsx("option", { value: "incorrect_details", children: "Incorrect request details" }),
                /* @__PURE__ */ jsx("option", { value: "duplicate", children: "Duplicate request" }),
                /* @__PURE__ */ jsx("option", { value: "unsafe_contact", children: "Unsafe or suspicious contact" }),
                /* @__PURE__ */ jsx("option", { value: "privacy", children: "Privacy concern" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(SecondaryButton, { onClick: handleFlag, disabled: !flagReason, icon: Flag, children: "Flag Request" }),
          flagged && /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: "12px", color: "#922B21", fontWeight: "700" }, children: "Flag recorded locally for hospital-testing review." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(BottomNavBar, { onNavigate: (key) => {
      if (key === "home") navigate(homeRoute);
      if (key === "profile") navigate("/profile");
    } })
  ] });
}
const page$1 = UNSAFE_withComponentProps(function WrappedPage26(props) {
  const params = useParams();
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(RequestDetailsPage, {
      ...props,
      requestId: params.requestId
    })
  });
});
const route26 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$1
}, Symbol.toStringTag, { value: "Module" }));
const ROLE_HOME_ROUTE = {
  donor: "/donor/home",
  requester: "/dashboard",
  patient_family: "/dashboard",
  hospital: "/hospital/dashboard",
  hospital_officer: "/hospital/dashboard"
};
function isDonorRole(role) {
  return role === "donor";
}
function RequestHistoryPage() {
  const navigate = useNavigate$1();
  const {
    currentUser,
    isAuthenticated,
    bloodRequests,
    markAllNotificationsRead
  } = useApp();
  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);
  if (!currentUser) return null;
  const donor = isDonorRole(currentUser.role);
  const homeRoute = ROLE_HOME_ROUTE[currentUser.role] ?? "/dashboard";
  const visibleRequests = donor ? bloodRequests.filter((request) => request.status !== REQUEST_STATUS.FULFILLED) : bloodRequests;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", flex: 1, paddingBottom: "80px" }, children: [
      /* @__PURE__ */ jsx(
        TopAppBar,
        {
          title: donor ? "Available Requests" : "Request History",
          onBellPress: markAllNotificationsRead
        }
      ),
      /* @__PURE__ */ jsxs("main", { style: { padding: "16px 12px 20px", display: "flex", flexDirection: "column", gap: "12px" }, children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => navigate(-1),
            "aria-label": "Back",
            style: {
              width: "36px",
              height: "36px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#F4F4F4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            },
            children: /* @__PURE__ */ jsx(ChevronLeft, { size: 20, color: "#1A1A1A" })
          }
        ),
        /* @__PURE__ */ jsxs(
          "section",
          {
            style: {
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
              padding: "16px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            },
            children: [
              /* @__PURE__ */ jsx(ClipboardList, { size: 22, color: "#C0392B" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { style: { margin: "0 0 2px", fontSize: "22px", fontWeight: "800", color: "#1A1A1A" }, children: visibleRequests.length }),
                /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: "12px", color: "#6B6B6B", fontWeight: "700" }, children: donor ? `request${visibleRequests.length === 1 ? "" : "s"} available for your blood group` : `request${visibleRequests.length === 1 ? "" : "s"} in history` })
              ] })
            ]
          }
        ),
        visibleRequests.length === 0 ? /* @__PURE__ */ jsxs(
          "section",
          {
            style: {
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
              padding: "32px 18px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              textAlign: "center"
            },
            children: [
              /* @__PURE__ */ jsx(ClipboardList, { size: 38, color: "#C8C8C8" }),
              /* @__PURE__ */ jsx("p", { style: { margin: "10px 0 0", fontSize: "14px", fontWeight: "700", color: "#6B6B6B" }, children: donor ? "No compatible requests yet" : "No request history yet" })
            ]
          }
        ) : /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: "10px" }, children: visibleRequests.map((request) => /* @__PURE__ */ jsx(
          RequestCard,
          {
            request,
            onClick: donor ? void 0 : () => navigate(`/requests/${request.id}`)
          },
          request.id
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      BottomNavBar,
      {
        onNavigate: (key) => {
          if (key === "home") navigate(homeRoute);
          if (key === "profile") navigate("/profile");
        }
      }
    )
  ] });
}
const page = UNSAFE_withComponentProps(function WrappedPage27(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(RequestHistoryPage, {
      ...props
    })
  });
});
const route27 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page
}, Symbol.toStringTag, { value: "Module" }));
async function loader({
  params
}) {
  const matches = await fg("src/**/page.{js,jsx,ts,tsx}");
  return {
    path: `/${params["*"]}`,
    pages: matches.sort((a, b) => a.length - b.length).map((match) => {
      const url = match.replace("src/app", "").replace(/\/page\.(js|jsx|ts|tsx)$/, "") || "/";
      const path = url.replaceAll("[", "").replaceAll("]", "");
      const displayPath = path === "/" ? "Homepage" : path;
      return {
        url,
        path: displayPath
      };
    })
  };
}
const notFound = UNSAFE_withComponentProps(function CreateDefaultNotFoundPage({
  loaderData
}) {
  const [siteMap, setSitemap] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window !== "undefined" && window.parent && window.parent !== window) {
      const handler = (event) => {
        if (event.data.type === "sandbox:sitemap") {
          window.removeEventListener("message", handler);
          setSitemap(event.data.sitemap);
        }
      };
      window.parent.postMessage({
        type: "sandbox:sitemap"
      }, "*");
      window.addEventListener("message", handler);
      return () => {
        window.removeEventListener("message", handler);
      };
    }
  }, []);
  const missingPath = loaderData.path.replace(/^\//, "");
  const existingRoutes = loaderData.pages.map((page2) => ({
    path: page2.path,
    url: page2.url
  }));
  const handleBack = () => {
    navigate("/");
  };
  const handleSearch = (value) => {
    if (!siteMap) {
      const path = `/${value}`;
      navigate(path);
    } else {
      navigate(value);
    }
  };
  const handleCreatePage = useCallback(() => {
    window.parent.postMessage({
      type: "sandbox:web:create",
      path: missingPath,
      view: "web"
    }, "*");
  }, [missingPath]);
  return /* @__PURE__ */ jsxs("div", {
    className: "flex sm:w-full w-screen sm:min-w-[850px] flex-col",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex w-full items-center gap-2 p-5",
      children: [/* @__PURE__ */ jsx("button", {
        type: "button",
        onClick: handleBack,
        className: "flex items-center justify-center w-10 h-10 rounded-md",
        children: /* @__PURE__ */ jsxs("svg", {
          width: "18",
          height: "18",
          viewBox: "0 0 18 18",
          fill: "none",
          xmlns: "http://www.w3.org/2000/svg",
          "aria-label": "Back",
          role: "img",
          children: [/* @__PURE__ */ jsx("path", {
            d: "M8.5957 2.65435L2.25005 9L8.5957 15.3457",
            stroke: "currentColor",
            strokeWidth: "1.5",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }), /* @__PURE__ */ jsx("path", {
            d: "M2.25007 9L15.75 9",
            stroke: "currentColor",
            strokeWidth: "1.5",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          })]
        })
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex flex-row divide-x divide-gray-200 rounded-[8px] h-8 w-[300px] border border-gray-200 bg-gray-50 text-gray-500",
        children: [/* @__PURE__ */ jsx("div", {
          className: "flex items-center px-[14px] py-[5px]",
          children: /* @__PURE__ */ jsx("span", {
            children: "/"
          })
        }), /* @__PURE__ */ jsx("div", {
          className: "flex items-center min-w-0",
          children: /* @__PURE__ */ jsx("p", {
            className: "border-0 bg-transparent px-3 py-2 focus:outline-none truncate max-w-[300px]",
            style: {
              minWidth: 0
            },
            title: missingPath,
            children: missingPath
          })
        })]
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex flex-grow flex-col items-center justify-center pt-[100px] text-center gap-[20px]",
      children: [/* @__PURE__ */ jsx("h1", {
        className: "text-4xl font-medium text-gray-900 px-2",
        children: "Uh-oh! This page doesn't exist (yet)."
      }), /* @__PURE__ */ jsxs("p", {
        className: "pt-4 pb-12 px-2 text-gray-500",
        children: ['Looks like "', /* @__PURE__ */ jsxs("span", {
          className: "font-bold",
          children: ["/", missingPath]
        }), `" isn't part of your project. But no worries, you've got options!`]
      }), /* @__PURE__ */ jsx("div", {
        className: "px-[20px] w-full",
        children: /* @__PURE__ */ jsxs("div", {
          className: "flex flex-row justify-center items-center w-full max-w-[800px] mx-auto border border-gray-200 rounded-lg p-[20px] mb-[40px] gap-[20px]",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex flex-col gap-[5px] items-start self-start w-1/2",
            children: [/* @__PURE__ */ jsx("p", {
              className: "text-sm text-black text-left",
              children: "Build it from scratch"
            }), /* @__PURE__ */ jsxs("p", {
              className: "text-sm text-gray-500 text-left",
              children: ['Create a new page to live at "', /* @__PURE__ */ jsxs("span", {
                children: ["/", missingPath]
              }), '"']
            })]
          }), /* @__PURE__ */ jsx("div", {
            className: "flex flex-row items-center justify-end w-1/2",
            children: /* @__PURE__ */ jsx("button", {
              type: "button",
              className: "bg-black text-white px-[10px] py-[5px] rounded-md",
              onClick: () => handleCreatePage(),
              children: "Create Page"
            })
          })]
        })
      }), /* @__PURE__ */ jsx("div", {
        className: "pb-20 lg:pb-[80px]",
        children: /* @__PURE__ */ jsx("p", {
          className: "flex items-center text-gray-500",
          children: "Check out all your project's routes here ↓"
        })
      }), siteMap ? /* @__PURE__ */ jsx("div", {
        className: "flex flex-col justify-center items-center w-full px-[50px]",
        children: /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col justify-between items-center w-full max-w-[600px] gap-[10px]",
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-sm text-gray-300 pb-[10px] self-start p-4",
            children: "PAGES"
          }), siteMap.webPages?.map((route) => /* @__PURE__ */ jsxs("button", {
            type: "button",
            onClick: () => handleSearch(route.cleanRoute || ""),
            className: "flex flex-row justify-between text-center items-center p-4 rounded-lg bg-white shadow-sm w-full hover:bg-gray-50",
            children: [/* @__PURE__ */ jsx("h3", {
              className: "font-medium text-gray-900",
              children: route.name
            }), /* @__PURE__ */ jsx("p", {
              className: "text-sm text-gray-400",
              children: route.cleanRoute
            })]
          }, route.id))]
        })
      }) : /* @__PURE__ */ jsx("div", {
        className: "flex flex-wrap gap-3 w-full max-w-[80rem] mx-auto pb-5 px-2",
        children: existingRoutes.map((route) => /* @__PURE__ */ jsx("div", {
          className: "flex flex-col flex-grow basis-full sm:basis-[calc(50%-0.375rem)] xl:basis-[calc(33.333%-0.5rem)]",
          children: /* @__PURE__ */ jsxs("div", {
            className: "w-full flex-1 flex flex-col items-center ",
            children: [/* @__PURE__ */ jsx("div", {
              className: "relative w-full max-w-[350px] h-48 sm:h-56 lg:h-64 overflow-hidden rounded-[8px] border border-comeback-gray-75 transition-all group-hover:shadow-md",
              children: /* @__PURE__ */ jsx("button", {
                type: "button",
                onClick: () => handleSearch(route.url.replace(/^\//, "")),
                className: "h-full w-full rounded-[8px] bg-gray-50 bg-cover"
              })
            }), /* @__PURE__ */ jsx("p", {
              className: "pt-3 text-left text-gray-500 w-full max-w-[350px]",
              children: route.path
            })]
          })
        }, route.path))
      })]
    })]
  });
});
const route28 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: notFound,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-Be_XWhGa.js", "imports": ["/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/index-CPeHbM7i.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": true, "module": "/assets/root-BgPvaNyf.js", "imports": ["/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/index-CPeHbM7i.js", "/assets/index-BBR7LY95.js", "/assets/react-C8Yct5VK.js"], "css": ["/assets/root-DU6sRI_X.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "page": { "id": "page", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-DoqFjSxz.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js", "/assets/PrimaryButton-CcXLLn3T.js", "/assets/SecondaryButton-BtwSS6BD.js", "/assets/RequestCard-CjRWiEuS.js", "/assets/BloodGroupTag-CaAbzrMG.js", "/assets/droplets-BR8g60x5.js", "/assets/heart-CVSkSldV.js", "/assets/triangle-alert-BHxrKIDF.js", "/assets/createLucideIcon-BXZsnm7B.js", "/assets/chevron-right-C4boRnmd.js", "/assets/shield-DRqVHdCw.js", "/assets/arrow-right-DzKW4eV6.js", "/assets/RequestStatusBadge-jCEKYDhd.js", "/assets/clock-Duc3rNtg.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "__create/social-dev-shim/page": { "id": "__create/social-dev-shim/page", "parentId": "root", "path": "__create/social-dev-shim", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-awMW5ewv.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js", "/assets/react-C8Yct5VK.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "dashboard/page": { "id": "dashboard/page", "parentId": "root", "path": "dashboard", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-CrSar8JU.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js", "/assets/TopAppBar-D4hKT0IM.js", "/assets/BottomNavBar-CpdYy9-p.js", "/assets/RequestCard-CjRWiEuS.js", "/assets/PrimaryButton-CcXLLn3T.js", "/assets/SecondaryButton-BtwSS6BD.js", "/assets/BloodGroupTag-CaAbzrMG.js", "/assets/droplets-BR8g60x5.js", "/assets/triangle-alert-BHxrKIDF.js", "/assets/trash-2-C9Quis7X.js", "/assets/log-out-AuiJ132Q.js", "/assets/x-sWGG2rUX.js", "/assets/createLucideIcon-BXZsnm7B.js", "/assets/user-CpOuaacA.js", "/assets/RequestStatusBadge-jCEKYDhd.js", "/assets/clock-Duc3rNtg.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "donations/history/page": { "id": "donations/history/page", "parentId": "root", "path": "donations/history", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-CVUOpBFA.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js", "/assets/TopAppBar-D4hKT0IM.js", "/assets/BottomNavBar-CpdYy9-p.js", "/assets/RequestStatusBadge-jCEKYDhd.js", "/assets/chevron-left-BhrYdvp-.js", "/assets/award-BuP6E2OY.js", "/assets/droplets-BR8g60x5.js", "/assets/clock-Duc3rNtg.js", "/assets/createLucideIcon-BXZsnm7B.js", "/assets/user-CpOuaacA.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "donor/home/page": { "id": "donor/home/page", "parentId": "root", "path": "donor/home", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-D7M7noIs.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js", "/assets/TopAppBar-D4hKT0IM.js", "/assets/BottomNavBar-CpdYy9-p.js", "/assets/BloodGroupTag-CaAbzrMG.js", "/assets/RequestCard-CjRWiEuS.js", "/assets/x-sWGG2rUX.js", "/assets/award-BuP6E2OY.js", "/assets/clock-Duc3rNtg.js", "/assets/map-pin-D8z38SKV.js", "/assets/droplets-BR8g60x5.js", "/assets/chevron-right-C4boRnmd.js", "/assets/createLucideIcon-BXZsnm7B.js", "/assets/user-CpOuaacA.js", "/assets/RequestStatusBadge-jCEKYDhd.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "donor/match/[matchId]/page": { "id": "donor/match/[matchId]/page", "parentId": "root", "path": "donor/match/:matchId", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-Dlyu_-Kq.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js", "/assets/PrimaryButton-CcXLLn3T.js", "/assets/SecondaryButton-BtwSS6BD.js", "/assets/BloodGroupTag-CaAbzrMG.js", "/assets/DonationJourney-BMYMIq9T.js", "/assets/x-sWGG2rUX.js", "/assets/chevron-left-BhrYdvp-.js", "/assets/triangle-alert-BHxrKIDF.js", "/assets/building-2-BJy9Nv-p.js", "/assets/map-pin-D8z38SKV.js", "/assets/navigation-CmiqVavm.js", "/assets/clock-Duc3rNtg.js", "/assets/circle-check-TvxkBSQE.js", "/assets/createLucideIcon-BXZsnm7B.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "donor/match/[matchId]/checkin/page": { "id": "donor/match/[matchId]/checkin/page", "parentId": "root", "path": "donor/match/:matchId/checkin", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-BP0YlC1s.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js", "/assets/PrimaryButton-CcXLLn3T.js", "/assets/BloodGroupTag-CaAbzrMG.js", "/assets/shield-DRqVHdCw.js", "/assets/building-2-BJy9Nv-p.js", "/assets/circle-check-TvxkBSQE.js", "/assets/triangle-alert-BHxrKIDF.js", "/assets/createLucideIcon-BXZsnm7B.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "errors/async-effect-error/page": { "id": "errors/async-effect-error/page", "parentId": "root", "path": "errors/async-effect-error", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-CTKx647v.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "errors/event-handler-error/page": { "id": "errors/event-handler-error/page", "parentId": "root", "path": "errors/event-handler-error", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-B4CAB5LQ.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "errors/hook-rule/page": { "id": "errors/hook-rule/page", "parentId": "root", "path": "errors/hook-rule", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-B9pNaQY1.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "errors/infinite-render-loop/page": { "id": "errors/infinite-render-loop/page", "parentId": "root", "path": "errors/infinite-render-loop", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-BByT0Nu3.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "errors/json-parse-error/page": { "id": "errors/json-parse-error/page", "parentId": "root", "path": "errors/json-parse-error", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-D12YNnm-.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "errors/missing-component/page": { "id": "errors/missing-component/page", "parentId": "root", "path": "errors/missing-component", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-IfQW3h0c.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "errors/null-access/page": { "id": "errors/null-access/page", "parentId": "root", "path": "errors/null-access", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-gqYmF6xf.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "errors/render-object/page": { "id": "errors/render-object/page", "parentId": "root", "path": "errors/render-object", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-DSk9v1Sg.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "errors/type-error-not-function/page": { "id": "errors/type-error-not-function/page", "parentId": "root", "path": "errors/type-error-not-function", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-DBz-T9hC.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "errors/undefined-access/page": { "id": "errors/undefined-access/page", "parentId": "root", "path": "errors/undefined-access", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-mi7ixEWC.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "errors/unhandled-promise/page": { "id": "errors/unhandled-promise/page", "parentId": "root", "path": "errors/unhandled-promise", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-BpKEcoVH.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "hospital/dashboard/page": { "id": "hospital/dashboard/page", "parentId": "root", "path": "hospital/dashboard", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-D19ZhMFT.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js", "/assets/TopAppBar-D4hKT0IM.js", "/assets/BottomNavBar-CpdYy9-p.js", "/assets/BloodGroupTag-CaAbzrMG.js", "/assets/RequestCard-CjRWiEuS.js", "/assets/RequestStatusBadge-jCEKYDhd.js", "/assets/PrimaryButton-CcXLLn3T.js", "/assets/SecondaryButton-BtwSS6BD.js", "/assets/building-2-BJy9Nv-p.js", "/assets/radio-Bhd4r7uQ.js", "/assets/trash-2-C9Quis7X.js", "/assets/createLucideIcon-BXZsnm7B.js", "/assets/map-pin-D8z38SKV.js", "/assets/droplets-BR8g60x5.js", "/assets/circle-check-TvxkBSQE.js", "/assets/triangle-alert-BHxrKIDF.js", "/assets/x-sWGG2rUX.js", "/assets/user-CpOuaacA.js", "/assets/clock-Duc3rNtg.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "login/page": { "id": "login/page", "parentId": "root", "path": "login", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-BddtvV2L.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js", "/assets/PrimaryButton-CcXLLn3T.js", "/assets/chevron-left-BhrYdvp-.js", "/assets/eye-CgS2qebF.js", "/assets/createLucideIcon-BXZsnm7B.js", "/assets/circle-check-TvxkBSQE.js", "/assets/arrow-right-DzKW4eV6.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "matches/[matchId]/chat/page": { "id": "matches/[matchId]/chat/page", "parentId": "root", "path": "matches/:matchId/chat", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-DLVZiWPH.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js", "/assets/TopAppBar-D4hKT0IM.js", "/assets/PrimaryButton-CcXLLn3T.js", "/assets/SecondaryButton-BtwSS6BD.js", "/assets/chevron-left-BhrYdvp-.js", "/assets/navigation-CmiqVavm.js", "/assets/createLucideIcon-BXZsnm7B.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "matches/[matchId]/tracking/page": { "id": "matches/[matchId]/tracking/page", "parentId": "root", "path": "matches/:matchId/tracking", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-Rqz9gj-t.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js", "/assets/TopAppBar-D4hKT0IM.js", "/assets/PrimaryButton-CcXLLn3T.js", "/assets/SecondaryButton-BtwSS6BD.js", "/assets/DonationJourney-BMYMIq9T.js", "/assets/chevron-left-BhrYdvp-.js", "/assets/navigation-CmiqVavm.js", "/assets/map-pin-D8z38SKV.js", "/assets/radio-Bhd4r7uQ.js", "/assets/createLucideIcon-BXZsnm7B.js", "/assets/circle-check-TvxkBSQE.js", "/assets/clock-Duc3rNtg.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "profile/page": { "id": "profile/page", "parentId": "root", "path": "profile", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-16ppmgCB.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js", "/assets/TopAppBar-D4hKT0IM.js", "/assets/BottomNavBar-CpdYy9-p.js", "/assets/PrimaryButton-CcXLLn3T.js", "/assets/SecondaryButton-BtwSS6BD.js", "/assets/BloodGroupTag-CaAbzrMG.js", "/assets/chevron-left-BhrYdvp-.js", "/assets/droplets-BR8g60x5.js", "/assets/user-CpOuaacA.js", "/assets/triangle-alert-BHxrKIDF.js", "/assets/circle-check-TvxkBSQE.js", "/assets/log-out-AuiJ132Q.js", "/assets/createLucideIcon-BXZsnm7B.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "register/page": { "id": "register/page", "parentId": "root", "path": "register", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-C1rIHjMf.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js", "/assets/PrimaryButton-CcXLLn3T.js", "/assets/SecondaryButton-BtwSS6BD.js", "/assets/BloodGroupTag-CaAbzrMG.js", "/assets/building-2-BJy9Nv-p.js", "/assets/user-CpOuaacA.js", "/assets/droplets-BR8g60x5.js", "/assets/chevron-left-BhrYdvp-.js", "/assets/circle-check-TvxkBSQE.js", "/assets/chevron-right-C4boRnmd.js", "/assets/eye-CgS2qebF.js", "/assets/createLucideIcon-BXZsnm7B.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "register/confirmation/page": { "id": "register/confirmation/page", "parentId": "root", "path": "register/confirmation", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-Cq52h5GC.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js", "/assets/PrimaryButton-CcXLLn3T.js", "/assets/circle-check-TvxkBSQE.js", "/assets/heart-CVSkSldV.js", "/assets/createLucideIcon-BXZsnm7B.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "requests/[requestId]/page": { "id": "requests/[requestId]/page", "parentId": "root", "path": "requests/:requestId", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-DjPkVYmm.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js", "/assets/TopAppBar-D4hKT0IM.js", "/assets/BottomNavBar-CpdYy9-p.js", "/assets/BloodGroupTag-CaAbzrMG.js", "/assets/RequestStatusBadge-jCEKYDhd.js", "/assets/PrimaryButton-CcXLLn3T.js", "/assets/SecondaryButton-BtwSS6BD.js", "/assets/DonationJourney-BMYMIq9T.js", "/assets/createLucideIcon-BXZsnm7B.js", "/assets/triangle-alert-BHxrKIDF.js", "/assets/chevron-left-BhrYdvp-.js", "/assets/circle-check-TvxkBSQE.js", "/assets/navigation-CmiqVavm.js", "/assets/droplets-BR8g60x5.js", "/assets/user-CpOuaacA.js", "/assets/clock-Duc3rNtg.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "requests/history/page": { "id": "requests/history/page", "parentId": "root", "path": "requests/history", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-BOip4Wdf.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-BouThegK.js", "/assets/TopAppBar-D4hKT0IM.js", "/assets/BottomNavBar-CpdYy9-p.js", "/assets/RequestCard-CjRWiEuS.js", "/assets/chevron-left-BhrYdvp-.js", "/assets/createLucideIcon-BXZsnm7B.js", "/assets/droplets-BR8g60x5.js", "/assets/user-CpOuaacA.js", "/assets/BloodGroupTag-CaAbzrMG.js", "/assets/RequestStatusBadge-jCEKYDhd.js", "/assets/clock-Duc3rNtg.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "__create/not-found": { "id": "__create/not-found", "parentId": "root", "path": "*?", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/not-found-CMtY-Dr3.js", "imports": ["/assets/index-BBR7LY95.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-5ae0ba81.js", "version": "5ae0ba81", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "v8_passThroughRequests": false, "v8_trailingSlashAwareDataRequests": false, "unstable_previewServerPrerendering": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "page": {
    id: "page",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "__create/social-dev-shim/page": {
    id: "__create/social-dev-shim/page",
    parentId: "root",
    path: "__create/social-dev-shim",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "dashboard/page": {
    id: "dashboard/page",
    parentId: "root",
    path: "dashboard",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "donations/history/page": {
    id: "donations/history/page",
    parentId: "root",
    path: "donations/history",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "donor/home/page": {
    id: "donor/home/page",
    parentId: "root",
    path: "donor/home",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "donor/match/[matchId]/page": {
    id: "donor/match/[matchId]/page",
    parentId: "root",
    path: "donor/match/:matchId",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "donor/match/[matchId]/checkin/page": {
    id: "donor/match/[matchId]/checkin/page",
    parentId: "root",
    path: "donor/match/:matchId/checkin",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "errors/async-effect-error/page": {
    id: "errors/async-effect-error/page",
    parentId: "root",
    path: "errors/async-effect-error",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "errors/event-handler-error/page": {
    id: "errors/event-handler-error/page",
    parentId: "root",
    path: "errors/event-handler-error",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  },
  "errors/hook-rule/page": {
    id: "errors/hook-rule/page",
    parentId: "root",
    path: "errors/hook-rule",
    index: void 0,
    caseSensitive: void 0,
    module: route10
  },
  "errors/infinite-render-loop/page": {
    id: "errors/infinite-render-loop/page",
    parentId: "root",
    path: "errors/infinite-render-loop",
    index: void 0,
    caseSensitive: void 0,
    module: route11
  },
  "errors/json-parse-error/page": {
    id: "errors/json-parse-error/page",
    parentId: "root",
    path: "errors/json-parse-error",
    index: void 0,
    caseSensitive: void 0,
    module: route12
  },
  "errors/missing-component/page": {
    id: "errors/missing-component/page",
    parentId: "root",
    path: "errors/missing-component",
    index: void 0,
    caseSensitive: void 0,
    module: route13
  },
  "errors/null-access/page": {
    id: "errors/null-access/page",
    parentId: "root",
    path: "errors/null-access",
    index: void 0,
    caseSensitive: void 0,
    module: route14
  },
  "errors/render-object/page": {
    id: "errors/render-object/page",
    parentId: "root",
    path: "errors/render-object",
    index: void 0,
    caseSensitive: void 0,
    module: route15
  },
  "errors/type-error-not-function/page": {
    id: "errors/type-error-not-function/page",
    parentId: "root",
    path: "errors/type-error-not-function",
    index: void 0,
    caseSensitive: void 0,
    module: route16
  },
  "errors/undefined-access/page": {
    id: "errors/undefined-access/page",
    parentId: "root",
    path: "errors/undefined-access",
    index: void 0,
    caseSensitive: void 0,
    module: route17
  },
  "errors/unhandled-promise/page": {
    id: "errors/unhandled-promise/page",
    parentId: "root",
    path: "errors/unhandled-promise",
    index: void 0,
    caseSensitive: void 0,
    module: route18
  },
  "hospital/dashboard/page": {
    id: "hospital/dashboard/page",
    parentId: "root",
    path: "hospital/dashboard",
    index: void 0,
    caseSensitive: void 0,
    module: route19
  },
  "login/page": {
    id: "login/page",
    parentId: "root",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: route20
  },
  "matches/[matchId]/chat/page": {
    id: "matches/[matchId]/chat/page",
    parentId: "root",
    path: "matches/:matchId/chat",
    index: void 0,
    caseSensitive: void 0,
    module: route21
  },
  "matches/[matchId]/tracking/page": {
    id: "matches/[matchId]/tracking/page",
    parentId: "root",
    path: "matches/:matchId/tracking",
    index: void 0,
    caseSensitive: void 0,
    module: route22
  },
  "profile/page": {
    id: "profile/page",
    parentId: "root",
    path: "profile",
    index: void 0,
    caseSensitive: void 0,
    module: route23
  },
  "register/page": {
    id: "register/page",
    parentId: "root",
    path: "register",
    index: void 0,
    caseSensitive: void 0,
    module: route24
  },
  "register/confirmation/page": {
    id: "register/confirmation/page",
    parentId: "root",
    path: "register/confirmation",
    index: void 0,
    caseSensitive: void 0,
    module: route25
  },
  "requests/[requestId]/page": {
    id: "requests/[requestId]/page",
    parentId: "root",
    path: "requests/:requestId",
    index: void 0,
    caseSensitive: void 0,
    module: route26
  },
  "requests/history/page": {
    id: "requests/history/page",
    parentId: "root",
    path: "requests/history",
    index: void 0,
    caseSensitive: void 0,
    module: route27
  },
  "__create/not-found": {
    id: "__create/not-found",
    parentId: "root",
    path: "*?",
    index: void 0,
    caseSensitive: void 0,
    module: route28
  }
};
const allowedActionOrigins = false;
export {
  allowedActionOrigins,
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
