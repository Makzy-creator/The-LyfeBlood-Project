import { AsyncLocalStorage } from "node:async_hooks";
import nodeConsole from "node:console";
import { skipCSRFCheck } from "@auth/core";
import Credentials from "@auth/core/providers/credentials";
import { initAuthConfig, authHandler } from "@hono/auth-js";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { verify, hash } from "argon2";
import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import { cors } from "hono/cors";
import { proxy } from "hono/proxy";
import { bodyLimit } from "hono/body-limit";
import { requestId } from "hono/request-id";
import { ServerRouter, UNSAFE_withErrorBoundaryProps, UNSAFE_withComponentProps, Outlet, useRouteError, useAsyncError, useNavigate, useLocation, Meta, Links, ScrollRestoration, Scripts, createRequestHandler } from "react-router";
import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import { renderToPipeableStream, renderToString } from "react-dom/server";
import React, { forwardRef, useEffect, createElement, useRef, useState, useCallback, Component, useContext, createContext, useMemo } from "react";
import { useButton } from "@react-aria/button";
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
import ws from "ws";
import "@auth/core/jwt";
import path, { join } from "node:path";
import { readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { route, index } from "@react-router/dev/routes";
import cleanStack from "clean-stack";
import { createHmac, timingSafeEqual, randomInt, randomBytes } from "crypto";
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
const JSX_RENDER_ID_ATTRIBUTE_NAME = "data-render-id";
function buildGridPlaceholder(w, h) {
  const size = Math.max(w, h);
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 895 895" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="895" height="895" fill="#E9E7E7"/>
<g>
<line x1="447.505" y1="-23" x2="447.505" y2="901" stroke="#C0C0C0" stroke-width="1.00975"/>
<line x1="889.335" y1="447.505" x2="5.66443" y2="447.505" stroke="#C0C0C0" stroke-width="1.00975"/>
<line x1="889.335" y1="278.068" x2="5.66443" y2="278.068" stroke="#C0C0C0" stroke-width="1.00975"/>
<line x1="889.335" y1="57.1505" x2="5.66443" y2="57.1504" stroke="#C0C0C0" stroke-width="1.00975"/>
<line x1="61.8051" y1="883.671" x2="61.8051" y2="6.10572e-05" stroke="#C0C0C0" stroke-width="1.00975"/>
<line x1="282.495" y1="907" x2="282.495" y2="-30" stroke="#C0C0C0" stroke-width="1.00975"/>
<line x1="611.495" y1="907" x2="611.495" y2="-30" stroke="#C0C0C0" stroke-width="1.00975"/>
<line x1="832.185" y1="883.671" x2="832.185" y2="6.10572e-05" stroke="#C0C0C0" stroke-width="1.00975"/>
<line x1="889.335" y1="827.53" x2="5.66443" y2="827.53" stroke="#C0C0C0" stroke-width="1.00975"/>
<line x1="889.335" y1="606.613" x2="5.66443" y2="606.612" stroke="#C0C0C0" stroke-width="1.00975"/>
<line x1="4.3568" y1="4.6428" x2="889.357" y2="888.643" stroke="#C0C0C0" stroke-width="1.00975"/>
<line x1="-0.3568" y1="894.643" x2="894.643" y2="0.642772" stroke="#C0C0C0" stroke-width="1.00975"/>
<circle cx="447.5" cy="441.5" r="163.995" stroke="#C0C0C0" stroke-width="1.00975"/>
<circle cx="447.911" cy="447.911" r="237.407" stroke="#C0C0C0" stroke-width="1.00975"/>
<circle cx="448" cy="442" r="384.495" stroke="#C0C0C0" stroke-width="1.00975"/>
</g>
</svg>
`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
function useOptionalRef(ref) {
  const fallbackRef = useRef(null);
  if (ref && "instance" in ref) return fallbackRef;
  return ref ?? fallbackRef;
}
const CreatePolymorphicComponent = /* @__PURE__ */ forwardRef(
  // @ts-expect-error -- generic forwardRef signature doesn't propagate the As type param
  function CreatePolymorphicComponentRender({
    as,
    children,
    renderId,
    onError,
    ...rest
  }, forwardedRef) {
    const props = as === "img" ? {
      ...rest,
      // keep the original type of onError for <img>
      onError: (e) => {
        if (typeof onError === "function") onError(e);
        const img = e.currentTarget;
        const {
          width,
          height
        } = img.getBoundingClientRect();
        img.dataset.hasFallback = "1";
        img.onerror = null;
        img.src = buildGridPlaceholder(Math.round(width) || 128, Math.round(height) || 128);
        img.style.objectFit = "cover";
      }
    } : rest;
    const ref = useOptionalRef(forwardedRef);
    useEffect(() => {
      const el = ref && "current" in ref ? ref.current : null;
      if (!el) return;
      if (as !== "img") {
        const placeholder = () => {
          const {
            width,
            height
          } = el.getBoundingClientRect();
          return buildGridPlaceholder(Math.round(width) || 128, Math.round(height) || 128);
        };
        const applyBgFallback = () => {
          el.dataset.hasFallback = "1";
          el.style.backgroundImage = `url("${placeholder()}")`;
          el.style.backgroundSize = "cover";
        };
        const probeBg = () => {
          const bg = getComputedStyle(el).backgroundImage;
          const match = /url\(["']?(.+?)["']?\)/.exec(bg);
          const src = match?.[1];
          if (!src) return;
          const probe = new Image();
          probe.onerror = applyBgFallback;
          probe.src = src;
        };
        probeBg();
        const ro2 = new ResizeObserver(([entry2]) => {
          if (!el.dataset.hasFallback) return;
          const {
            width,
            height
          } = entry2.contentRect;
          el.style.backgroundImage = `url("${buildGridPlaceholder(Math.round(width) || 128, Math.round(height) || 128)}")`;
        });
        ro2.observe(el);
        const mo = new MutationObserver(probeBg);
        mo.observe(el, {
          attributes: true,
          attributeFilter: ["style", "class"]
        });
        return () => {
          ro2.disconnect();
          mo.disconnect();
        };
      }
      if (!el.dataset.hasFallback) return;
      const ro = new ResizeObserver(([entry2]) => {
        const {
          width,
          height
        } = entry2.contentRect;
        el.src = buildGridPlaceholder(Math.round(width) || 128, Math.round(height) || 128);
      });
      ro.observe(el);
      return () => ro.disconnect();
    }, [as, ref]);
    return /* @__PURE__ */ createElement(as, Object.assign({}, props, {
      ref,
      ...renderId ? {
        [JSX_RENDER_ID_ATTRIBUTE_NAME]: renderId
      } : void 0
    }), children);
  }
);
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
      toast.custom(() => /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: toastStyle,
        renderId: "render-b15edb3e",
        as: "div",
        children: [/* @__PURE__ */ jsxs("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          viewBox: "0 0 20 20",
          fill: "currentColor",
          height: "20",
          width: "20",
          children: [/* @__PURE__ */ jsx("title", {
            children: "Success"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            fillRule: "evenodd",
            d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z",
            clipRule: "evenodd",
            renderId: "render-a8fee68e",
            as: "path"
          })]
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          renderId: "render-1f3d996c",
          as: "span",
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
    children: !isInIframe() && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
      className: `fixed bottom-4 left-1/2 transform -translate-x-1/2 max-w-md z-50 transition-all duration-500 ease-out ${isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`,
      style: {
        width: "75vw"
      },
      renderId: "render-dc9cc967",
      as: "div",
      children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        className: "bg-[#18191B] text-[#F2F2F2] rounded-lg p-4 shadow-lg w-full",
        style: scaleFactor !== 1 ? {
          transform: `scale(${scaleFactor})`,
          transformOrigin: "bottom center"
        } : void 0,
        renderId: "render-d0e01574",
        as: "div",
        children: /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          className: "flex items-start gap-3",
          renderId: "render-d68261a1",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            className: "flex-shrink-0",
            renderId: "render-119524c9",
            as: "div",
            children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              className: "w-8 h-8 bg-[#F2F2F2] rounded-full flex items-center justify-center",
              renderId: "render-04302033",
              as: "div",
              children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                className: "text-black text-[1.125rem] leading-none",
                renderId: "render-0af08716",
                as: "span",
                children: "!"
              })
            })
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            className: "flex flex-col gap-2 flex-1",
            renderId: "render-079cc052",
            as: "div",
            children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
              className: "flex flex-col gap-1",
              renderId: "render-a054b926",
              as: "div",
              children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                className: "font-light text-[#F2F2F2] text-sm",
                renderId: "render-08e3c637",
                as: "p",
                children: "App Error Detected"
              }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                className: "text-[#959697] text-sm font-light",
                renderId: "render-9628d4cd",
                as: "p",
                children: "It looks like an error occurred while trying to use your app."
              })]
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              className: `flex flex-row items-center justify-center gap-[4px] outline-none transition-colors rounded-[8px] border-[1px] bg-[#2C2D2F] hover:bg-[#414243] active:bg-[#555658] border-[#414243] text-white ${copyButtonTextClass} ${copyButtonPaddingClass} w-fit`,
              type: "button",
              ...copyButtonProps,
              renderId: "render-39461b36",
              as: "button",
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
const supabaseUrl$1 = "https://vmjjpesyfdhqwgfmulmq.supabase.co";
const supabaseAnonKey$1 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtampwZXN5ZmRocXdnZm11bG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MDI0NjUsImV4cCI6MjA5ODQ3ODQ2NX0.z6R2Y6GRgrUNdRrEDxpYPjlDK_KhucExG9VKO0XAncI";
const supabase = createClient(supabaseUrl$1, supabaseAnonKey$1, {
  auth: {
    persistSession: false,
    autoRefreshToken: true
  }
});
const BASE_URL = process.env.NEXT_PUBLIC_WORKER_URL ?? // Cloudflare Worker (external)
"";
const AUTH_TOKEN_STORAGE_KEY$1 = "lyfeblood.auth.token";
function getStoredAuthToken() {
  try {
    return typeof window !== "undefined" ? window.sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY$1) : null;
  } catch {
    return null;
  }
}
async function apiFetch(path2, options = {}) {
  const url = `${BASE_URL}${path2}`;
  const token = getStoredAuthToken();
  const response = await fetch(url, {
    credentials: "same-origin",
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
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function apiRestoreSession() {
  return apiFetch("/api/auth/session");
}
async function apiLogout() {
  return apiFetch("/api/auth/logout", {
    method: "POST"
  });
}
async function apiGetProfile() {
  return apiFetch("/api/profile");
}
async function apiDeleteRequest(requestId2) {
  return apiFetch(`/api/requests/${encodeURIComponent(requestId2)}`, {
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
  return apiFetch("/api/requests/create", {
    method: "POST",
    body: JSON.stringify(payload)
  });
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
  return apiFetch("/api/matches/respond", {
    method: "POST",
    body: JSON.stringify(payload)
  });
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
const VALID_BLOOD_TYPES = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
function normalizeBloodTypes(value) {
  const values = Array.isArray(value) ? value.flatMap((item) => normalizeBloodTypes(item)) : String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  return [...new Set(values.filter((item) => VALID_BLOOD_TYPES.includes(item)))];
}
function serializeBloodTypes(value) {
  return normalizeBloodTypes(value).join(", ");
}
function formatBloodTypes(value) {
  const bloodTypes = normalizeBloodTypes(value);
  if (bloodTypes.length) return bloodTypes.join(", ");
  return Array.isArray(value) ? "" : String(value ?? "").trim();
}
function requestIncludesBloodType(requestBloodTypes, bloodType) {
  return normalizeBloodTypes(requestBloodTypes).includes(bloodType);
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
const AppContext = /* @__PURE__ */ createContext(null);
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
function AppProvider({
  children
}) {
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
    const {
      data,
      error
    } = await supabase.from("blood_requests").select("*").order("created_at", {
      ascending: false
    }).limit(100);
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
    const {
      notifications: rows,
      unread_count
    } = await apiGetNotifications();
    setNotifications((rows ?? []).map((notification) => ({
      ...notification,
      isRead: Boolean(notification.read_at),
      requestId: notification.request_id,
      matchId: notification.match_id,
      timestamp: notification.created_at
    })));
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
  const login = useCallback((authPayload) => {
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
      console.error("[AppContext] Failed to refresh blood requests after login:", error);
    });
    refreshNotifications().catch((error) => {
      console.error("[AppContext] Failed to refresh notifications after login:", error);
    });
  }, [refreshBloodRequests, refreshNotifications]);
  const logout = useCallback(async () => {
    await apiLogout();
    const {
      error
    } = await supabase.auth.signOut();
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
      window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalized));
    }
  }, []);
  const refreshCurrentUser = useCallback(async () => {
    const {
      user
    } = await apiGetProfile();
    updateCurrentUser(user);
    return user;
  }, [updateCurrentUser]);
  useEffect(() => {
    let active = true;
    async function applySession(payload) {
      if (!payload?.token || !payload?.user || !canUseStorage()) return;
      window.sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, payload.token);
      try {
        if (!active) return;
        updateCurrentUser(payload.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("[AppContext] Failed to restore Supabase session:", error);
      }
    }
    if (!getInitialUser()) {
      apiRestoreSession().then(applySession).catch(() => {
      });
    }
    const {
      data: listener
    } = supabase.auth.onAuthStateChange((event, session) => {
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
        apiGetProfile().then(({
          user
        }) => applySession({
          user,
          token: session.access_token
        })).catch((error) => {
          console.error("[AppContext] Failed to apply Supabase session:", error);
        });
      }
    });
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
  const updateRequestStatus = useCallback(async (requestId2, newStatus, options = {}) => {
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
        request_id: requestId2,
        status: statusByUiStatus[newStatus] ?? newStatus
      });
      refreshNotifications().catch((error) => {
        console.error("[AppContext] Failed to refresh notifications after status update:", error);
      });
    }
    setBloodRequests((prev) => prev.map((req) => req.id === requestId2 ? {
      ...req,
      status: newStatus
    } : req));
  }, [refreshNotifications]);
  const addRequest = useCallback(async (newRequest) => {
    const {
      request
    } = await apiCreateRequest({
      hospital_name: newRequest.hospitalName,
      blood_type_needed: serializeBloodTypes(newRequest.bloodGroup),
      urgency_tier: newRequest.tier === "sos" ? "SOS" : "Standard",
      units_needed: newRequest.unitsNeeded,
      patient_ref: newRequest.patientCode ?? newRequest.ward ?? null,
      location: newRequest.location ?? null,
      urgency_note: newRequest.urgencyNote ?? null,
      request_type: newRequest.requestType ?? "Emergency",
      scheduled_for: newRequest.scheduledFor ?? null
    });
    const normalizedRequest = normalizeBloodRequest$1(request);
    setBloodRequests((prev) => [normalizedRequest, ...prev]);
    refreshNotifications().catch((error) => {
      console.error("[AppContext] Failed to refresh notifications after request create:", error);
    });
    return {
      request: normalizedRequest
    };
  }, [refreshNotifications]);
  const deleteRequest = useCallback(async (requestId2) => {
    await apiDeleteRequest(requestId2);
    setBloodRequests((prev) => prev.filter((request) => request.id !== requestId2));
    refreshNotifications().catch((error) => {
      console.error("[AppContext] Failed to refresh notifications after request delete:", error);
    });
  }, [refreshNotifications]);
  const markAllNotificationsRead = useCallback(async () => {
    await apiUpdateNotifications({
      read: true
    });
    setNotifications((prev) => prev.map((notification) => ({
      ...notification,
      isRead: true,
      read_at: notification.read_at ?? (/* @__PURE__ */ new Date()).toISOString()
    })));
    setUnreadCount(0);
  }, []);
  const markNotificationsUnread = useCallback(async (ids) => {
    await apiUpdateNotifications({
      ids,
      read: false
    });
    setNotifications((prev) => prev.map((notification) => {
      if (ids?.length && !ids.includes(notification.id)) return notification;
      return {
        ...notification,
        isRead: false,
        read_at: null
      };
    }));
    refreshNotifications().catch((error) => {
      console.error("[AppContext] Failed to refresh notifications after unread update:", error);
    });
  }, [refreshNotifications]);
  return /* @__PURE__ */ jsx(AppContext.Provider, {
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
  });
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
function RootLayout({
  children
}) {
  return /* @__PURE__ */ jsx(QueryClientProvider, {
    client: queryClient,
    children: /* @__PURE__ */ jsxs(AppProvider, {
      children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        className: "lb-viewport",
        renderId: "render-0185f396",
        as: "div",
        children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          className: "lb-frame",
          renderId: "render-a19401f4",
          as: "div",
          children
        })
      }), /* @__PURE__ */ jsx("style", {
        jsx: true,
        global: true,
        children: `
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
        `
      })]
    })
  });
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
  return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
    type,
    disabled,
    style: base,
    onPointerDown: () => !disabled && setPressed(true),
    onPointerUp: () => setPressed(false),
    onPointerLeave: () => setPressed(false),
    onClick,
    renderId: "render-cdf4b62c",
    as: "button",
    children: [Icon && /* @__PURE__ */ jsx(Icon, {
      size: 18,
      strokeWidth: 2.2
    }), children]
  });
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
  return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
    type,
    disabled,
    style: base,
    onPointerDown: () => !disabled && setPressed(true),
    onPointerUp: () => setPressed(false),
    onPointerLeave: () => setPressed(false),
    onClick,
    renderId: "render-491b8a99",
    as: "button",
    children: [Icon && /* @__PURE__ */ jsx(Icon, {
      size: 18,
      strokeWidth: 2.2
    }), children]
  });
}
function BloodGroupTag({
  group,
  size = "md"
}) {
  const fontSize = size === "lg" ? "16px" : size === "sm" ? "11px" : "13px";
  const height = size === "lg" ? "38px" : size === "sm" ? "26px" : "32px";
  const minWidth = size === "lg" ? "52px" : size === "sm" ? "34px" : "40px";
  const groups = normalizeBloodTypes(group);
  const labels = groups.length ? groups : [group].filter(Boolean);
  const renderTag = (label) => /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
    renderId: "render-d9768923",
    as: "span",
    children: label
  }, label);
  if (labels.length > 1) {
    return /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
      style: {
        display: "inline-flex",
        flexWrap: "wrap",
        gap: "4px"
      },
      renderId: "render-bbebb4d0",
      as: "span",
      children: labels.map(renderTag)
    });
  }
  return renderTag(labels[0] ?? "");
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
function RequestStatusBadge({
  status,
  size = "md"
}) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG[REQUEST_STATUS.PENDING];
  const fontSize = size === "sm" ? "11px" : "12px";
  const dotSize = size === "sm" ? "5px" : "6px";
  return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
    renderId: "render-c11f73e7",
    as: "span",
    children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
      style: {
        width: dotSize,
        height: dotSize,
        borderRadius: "50%",
        backgroundColor: cfg.dot,
        flexShrink: 0
      },
      renderId: "render-e98576d1",
      as: "span"
    }), cfg.label]
  });
}
function RequestCard({
  request,
  onClick
}) {
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
    return d.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short"
    });
  })();
  return /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
    renderId: "render-f7f34745",
    as: "button",
    children: /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      style: {
        display: "flex",
        width: "100%",
        padding: "14px 14px 14px 12px",
        gap: "12px",
        alignItems: "flex-start"
      },
      renderId: "render-2f55ce30",
      as: "div",
      children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          flexShrink: 0
        },
        renderId: "render-798777e5",
        as: "div",
        children: [/* @__PURE__ */ jsx(BloodGroupTag, {
          group: request.bloodGroup,
          size: "lg"
        }), isSOS && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
          renderId: "render-6c60dc76",
          as: "span",
          children: "SOS"
        })]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: "4px"
        },
        renderId: "render-c7f2a533",
        as: "div",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
          renderId: "render-ab0548c4",
          as: "p",
          children: request.hospitalName
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            fontSize: "12px",
            color: "#4A4A4A",
            margin: 0,
            lineHeight: "1.3"
          },
          renderId: "render-725e8e65",
          as: "p",
          children: request.ward
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginTop: "6px",
            flexWrap: "wrap"
          },
          renderId: "render-ef2dc1ae",
          as: "div",
          children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "3px"
            },
            renderId: "render-fe9deed9",
            as: "span",
            children: [/* @__PURE__ */ jsx(Droplets, {
              size: 11,
              color: "#C0392B"
            }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
              style: {
                fontSize: "11px",
                color: "#4A4A4A"
              },
              renderId: "render-c2941ba2",
              as: "span",
              children: [request.unitsFulfilled, "/", request.unitsNeeded, " units"]
            })]
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "3px"
            },
            renderId: "render-90b38fc5",
            as: "span",
            children: [/* @__PURE__ */ jsx(Clock, {
              size: 11,
              color: "#6B6B6B"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "11px",
                color: "#6B6B6B"
              },
              renderId: "render-5a5e4bdd",
              as: "span",
              children: formattedDate
            })]
          })]
        }), request.urgencyNote && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
          renderId: "render-179ecc9e",
          as: "p",
          children: request.urgencyNote
        })]
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "6px",
          flexShrink: 0
        },
        renderId: "render-19e73177",
        as: "div",
        children: /* @__PURE__ */ jsx(RequestStatusBadge, {
          status: request.status,
          size: "sm"
        })
      })]
    })
  });
}
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const STATS = [{
  value: "47%",
  label: "Blood shortage rate\nin Southeast Nigeria",
  icon: AlertTriangle,
  color: "#C0392B"
}, {
  value: "3 min",
  label: "Avg. donor match\nresponse time",
  icon: Heart,
  color: "#27AE60"
}, {
  value: "1,200+",
  label: "Registered donors\nacross Imo State",
  icon: Users,
  color: "#1A1A1A"
}];
function LandingPage() {
  const {
    bloodRequests,
    isAuthenticated
  } = useApp();
  const [showAll, setShowAll] = useState(false);
  const visibleRequests = showAll ? bloodRequests : bloodRequests.slice(0, 2);
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      style: {
        display: "flex",
        flexDirection: "column",
        flex: 1
      },
      renderId: "render-6a638472",
      as: "div",
      children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
        renderId: "render-2ff7adcd",
        as: "header",
        children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            fontSize: "20px",
            fontWeight: "800",
            letterSpacing: "-0.03em"
          },
          renderId: "render-25da3d73",
          as: "span",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              color: "#C0392B"
            },
            renderId: "render-9b1302de",
            as: "span",
            children: "Lyfe"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              color: "#1A1A1A"
            },
            renderId: "render-40a25f4c",
            as: "span",
            children: "Blood"
          })]
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
          renderId: "render-b27d76fa",
          as: "a",
          children: "Sign In"
        })]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          background: "linear-gradient(160deg, #922B21 0%, #C0392B 55%, #E74C3C 100%)",
          padding: "40px 20px 44px",
          position: "relative",
          overflow: "hidden"
        },
        renderId: "render-3360b86d",
        as: "section",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.06)"
          },
          renderId: "render-ae5c5cbb",
          as: "div"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            position: "absolute",
            bottom: "-60px",
            left: "-30px",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.04)"
          },
          renderId: "render-9da72126",
          as: "div"
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
          renderId: "render-78edd294",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "8px",
              color: "#FFFFFF",
              fontWeight: "800",
              letterSpacing: "0.12em"
            },
            renderId: "render-3b0fb717",
            as: "span",
            children: "LIVE"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              animation: "pulse 1.5s infinite"
            },
            renderId: "render-5b69f675",
            as: "span"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "12px",
              color: "#FFFFFF",
              fontWeight: "600"
            },
            renderId: "render-5f2b4b63",
            as: "span",
            children: "3 active blood requests in Owerri"
          })]
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            fontSize: "32px",
            fontWeight: "800",
            color: "#FFFFFF",
            lineHeight: "1.18",
            letterSpacing: "-0.03em",
            margin: "0 0 12px"
          },
          renderId: "render-08f16d0a",
          as: "h1",
          children: ["Every Drop", /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            renderId: "render-565c84ed",
            as: "br"
          }), "Saves a Life."]
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            fontSize: "15px",
            color: "rgba(255,255,255,0.85)",
            lineHeight: "1.6",
            margin: "0 0 28px",
            maxWidth: "320px"
          },
          renderId: "render-69b6cc26",
          as: "p",
          children: "Connecting blood donors directly with patients and hospitals across Owerri and Imo State — in minutes, not hours."
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          },
          renderId: "render-5968d925",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            href: "/login",
            style: {
              textDecoration: "none"
            },
            renderId: "render-0d525f28",
            as: "a",
            children: /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
              renderId: "render-0f989d9e",
              as: "button",
              children: [/* @__PURE__ */ jsx(Droplets, {
                size: 18,
                color: "#C0392B"
              }), "Find Blood Now"]
            })
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            href: "/login",
            style: {
              textDecoration: "none"
            },
            renderId: "render-f15224f2",
            as: "a",
            children: /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
              renderId: "render-7455e806",
              as: "button",
              children: [/* @__PURE__ */ jsx(Heart, {
                size: 18,
                color: "#FFFFFF"
              }), "Become a Donor"]
            })
          })]
        })]
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "0"
        },
        renderId: "render-c7ff9306",
        as: "section",
        children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            gap: "10px"
          },
          renderId: "render-eedf7eb4",
          as: "div",
          children: STATS.map(({
            value,
            label,
            icon: Icon,
            color
          }) => /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
            renderId: "render-6e910be0",
            as: "div",
            children: [/* @__PURE__ */ jsx(Icon, {
              size: 16,
              color,
              strokeWidth: 2
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "18px",
                fontWeight: "800",
                color: "#1A1A1A",
                lineHeight: 1
              },
              renderId: "render-133618fa",
              as: "span",
              children: value
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "10px",
                color: "#4A4A4A",
                lineHeight: "1.35",
                whiteSpace: "pre-line"
              },
              renderId: "render-201579ff",
              as: "span",
              children: label
            })]
          }, value))
        })
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          height: "1px",
          backgroundColor: "#C8C8C8",
          marginInline: "16px"
        },
        renderId: "render-805d8473",
        as: "div"
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          padding: "20px 16px"
        },
        renderId: "render-b682ba49",
        as: "section",
        children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "14px"
          },
          renderId: "render-87b152ff",
          as: "div",
          children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            renderId: "render-829022b3",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "18px",
                fontWeight: "700",
                color: "#1A1A1A",
                margin: 0
              },
              renderId: "render-04f56212",
              as: "h2",
              children: "Active Requests"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "12px",
                color: "#6B6B6B",
                margin: "2px 0 0"
              },
              renderId: "render-2cf999b0",
              as: "p",
              children: "Owerri & surroundings · updated live"
            })]
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              fontSize: "11px",
              fontWeight: "600",
              color: "#C0392B",
              backgroundColor: "#FADBD8",
              paddingInline: "8px",
              paddingBlock: "3px",
              borderRadius: "999px"
            },
            renderId: "render-34cde28e",
            as: "span",
            children: [bloodRequests.length, " open"]
          })]
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          },
          renderId: "render-00714f53",
          as: "div",
          children: visibleRequests.map((req) => /* @__PURE__ */ jsx(RequestCard, {
            request: req,
            onClick: () => {
              window.location.href = "/login";
            }
          }, req.id))
        }), bloodRequests.length > 2 && /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
          renderId: "render-a15cf34a",
          as: "button",
          children: [showAll ? "Show less" : `View all ${bloodRequests.length} requests`, /* @__PURE__ */ jsx(ChevronRight, {
            size: 14
          })]
        })]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          margin: "0 16px 20px",
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          padding: "18px 16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.07)"
        },
        renderId: "render-1aa33676",
        as: "section",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            fontSize: "16px",
            fontWeight: "700",
            color: "#1A1A1A",
            margin: "0 0 4px"
          },
          renderId: "render-3562600a",
          as: "h2",
          children: "Search by Blood Group"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            fontSize: "12px",
            color: "#6B6B6B",
            margin: "0 0 14px"
          },
          renderId: "render-39505e1d",
          as: "p",
          children: "Tap a group to view active donors"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            flexWrap: "wrap",
            gap: "8px"
          },
          renderId: "render-900a2b65",
          as: "div",
          children: BLOOD_GROUPS.map((g) => /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            href: "/login",
            style: {
              textDecoration: "none"
            },
            renderId: "render-d6490a09",
            as: "a",
            children: /* @__PURE__ */ jsx(BloodGroupTag, {
              group: g,
              size: "lg"
            })
          }, g))
        })]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          padding: "0 16px 20px"
        },
        renderId: "render-c1643383",
        as: "section",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            fontSize: "18px",
            fontWeight: "700",
            color: "#1A1A1A",
            margin: "0 0 14px"
          },
          renderId: "render-d6e2de8c",
          as: "h2",
          children: "How LyfeBlood Works"
        }), [{
          step: "01",
          title: "Post a Request",
          body: "Hospital officers or patient families log an urgent blood need.",
          color: "#FADBD8",
          textColor: "#922B21"
        }, {
          step: "02",
          title: "Donors are Notified",
          body: "Nearby registered donors matching the blood group get an instant alert.",
          color: "#D5F5E3",
          textColor: "#1E8449"
        }, {
          step: "03",
          title: "Match & Arrive",
          body: "A donor confirms, travels to the hospital lab, and donation is completed.",
          color: "#DBEAFE",
          textColor: "#1E40AF"
        }].map(({
          step,
          title,
          body,
          color,
          textColor
        }) => /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            gap: "14px",
            marginBottom: "16px",
            alignItems: "flex-start"
          },
          renderId: "render-cbbe8ab0",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
            renderId: "render-d088b095",
            as: "span",
            children: step
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            renderId: "render-593be45e",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "14px",
                fontWeight: "700",
                color: "#1A1A1A",
                margin: "0 0 2px"
              },
              renderId: "render-897c2166",
              as: "p",
              children: title
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "13px",
                color: "#4A4A4A",
                margin: 0,
                lineHeight: "1.5"
              },
              renderId: "render-ca0e53b4",
              as: "p",
              children: body
            })]
          })]
        }, step))]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          margin: "0 16px 20px",
          backgroundColor: "#FADBD8",
          borderRadius: "12px",
          padding: "16px",
          display: "flex",
          gap: "12px",
          alignItems: "flex-start"
        },
        renderId: "render-424aa3df",
        as: "section",
        children: [/* @__PURE__ */ jsx(Shield, {
          size: 22,
          color: "#922B21",
          style: {
            flexShrink: 0,
            marginTop: "2px"
          }
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          renderId: "render-8792e842",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "13px",
              fontWeight: "700",
              color: "#922B21",
              margin: "0 0 3px"
            },
            renderId: "render-cd1e8d3d",
            as: "p",
            children: "Safety & Compliance"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "12px",
              color: "#922B21",
              margin: 0,
              lineHeight: "1.5",
              opacity: 0.85
            },
            renderId: "render-a4ac2470",
            as: "p",
            children: "LyfeBlood facilitates donor–hospital connections only. All clinical screening, compatibility testing, and transfusion decisions are performed exclusively by licensed medical professionals."
          })]
        })]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          padding: "0 16px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        },
        renderId: "render-ae6af7fe",
        as: "section",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          href: "/login",
          style: {
            textDecoration: "none"
          },
          renderId: "render-dfc5025f",
          as: "a",
          children: /* @__PURE__ */ jsx(PrimaryButton, {
            icon: ArrowRight,
            children: "Get Started — It's Free"
          })
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            textAlign: "center",
            fontSize: "11px",
            color: "#6B6B6B",
            margin: "4px 0 0"
          },
          renderId: "render-47cf7ed0",
          as: "p",
          children: "Serving Owerri, Orlu, Okigwe & all Imo State LGAs"
        })]
      })]
    }), /* @__PURE__ */ jsx("style", {
      jsx: true,
      global: true,
      children: `
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { margin: 0; padding: 0; }
      `
    })]
  });
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
function TopAppBar({
  title = "LyfeBlood",
  onBellPress
}) {
  const {
    unreadCount
  } = useApp();
  return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
    renderId: "render-07a1f93f",
    as: "header",
    children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
      style: {
        fontSize: "18px",
        fontWeight: "700",
        color: "#1A1A1A",
        fontFamily: "inherit",
        letterSpacing: "-0.02em",
        lineHeight: 1,
        whiteSpace: "nowrap"
      },
      renderId: "render-6d031ffe",
      as: "span",
      children: title === "LyfeBlood" ? /* @__PURE__ */ jsxs(Fragment, {
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            color: "#C0392B"
          },
          renderId: "render-d119e700",
          as: "span",
          children: "Lyfe"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            color: "#1A1A1A"
          },
          renderId: "render-776a8e68",
          as: "span",
          children: "Blood"
        })]
      }) : title
    }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
      renderId: "render-c23ee3bb",
      as: "button",
      children: [/* @__PURE__ */ jsx(Bell, {
        size: 22,
        color: unreadCount > 0 ? "#C0392B" : "#1A1A1A",
        strokeWidth: 1.8
      }), unreadCount > 0 && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
        },
        renderId: "render-7e58bc75",
        as: "span"
      })]
    })]
  });
}
const NAV_ITEMS = [{
  key: "home",
  label: "Home",
  Icon: Home
}, {
  key: "donate",
  label: "Donate",
  Icon: Droplets
}, {
  key: "requests",
  label: "Requests",
  Icon: ClipboardList
}, {
  key: "profile",
  label: "Profile",
  Icon: User
}];
function BottomNavBar({
  onNavigate
}) {
  const {
    activeNav,
    setActiveNav
  } = useApp();
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
  return /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
    renderId: "render-fb3ef90b",
    as: "nav",
    children: NAV_ITEMS.map(({
      key,
      label,
      Icon
    }) => {
      const isActive = activeNav === key;
      return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
        renderId: "render-e1f0080b",
        as: "button",
        children: [isActive && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
          },
          renderId: "render-91c00a7e",
          as: "span"
        }), /* @__PURE__ */ jsx(Icon, {
          size: 22,
          strokeWidth: isActive ? 2.2 : 1.7,
          color: isActive ? "#C0392B" : "#6B6B6B"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            fontSize: "10px",
            fontWeight: isActive ? "700" : "400",
            color: isActive ? "#C0392B" : "#6B6B6B",
            fontFamily: "inherit",
            letterSpacing: "0.01em",
            lineHeight: 1
          },
          renderId: "render-e1b46011",
          as: "span",
          children: label
        })]
      }, key);
    })
  });
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
const DELETE_AFTER_MS$2 = 24 * 60 * 60 * 1e3;
function canDeleteRequest$1(request) {
  const createdAt = new Date(request.requestDate).getTime();
  return Number.isFinite(createdAt) && Date.now() - createdAt >= DELETE_AFTER_MS$2;
}
function PatientRequestSheet({
  onClose,
  onSubmit,
  isSubmitting,
  submitError
}) {
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
    setForm((current) => ({
      ...current,
      [key]: value
    }));
    setErrors((current) => ({
      ...current,
      [key]: ""
    }));
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
  return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 200,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center"
    },
    renderId: "render-c48a797b",
    as: "div",
    children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
      type: "button",
      onClick: onClose,
      "aria-label": "Close request form",
      style: {
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        border: "none",
        cursor: "pointer"
      },
      renderId: "render-a54945d1",
      as: "button"
    }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
      renderId: "render-240fc7de",
      as: "form",
      children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        },
        renderId: "render-b6a3a788",
        as: "div",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            margin: 0,
            fontSize: "17px",
            fontWeight: "800",
            color: "#1A1A1A"
          },
          renderId: "render-09dbc7fa",
          as: "h2",
          children: "Create a Request"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
          renderId: "render-e7e56580",
          as: "button",
          children: /* @__PURE__ */ jsx(X, {
            size: 18,
            color: "#1A1A1A"
          })
        })]
      }), submitError && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
        renderId: "render-6ddb827d",
        as: "p",
        children: submitError
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        },
        renderId: "render-0309a012",
        as: "div",
        children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            fontSize: "13px",
            fontWeight: "700",
            color: "#1A1A1A"
          },
          renderId: "render-90e03894",
          as: "label",
          children: ["Request Type ", /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              color: "#C0392B"
            },
            renderId: "render-fd000b34",
            as: "span",
            children: "*"
          })]
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px"
          },
          renderId: "render-cd712642",
          as: "div",
          children: ["Emergency", "Scheduled"].map((type) => /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
            renderId: "render-ab8b684d",
            as: "button",
            children: type
          }, type))
        })]
      }), form.requestType === "Scheduled" && /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        },
        renderId: "render-89e13131",
        as: "div",
        children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            fontSize: "13px",
            fontWeight: "700",
            color: "#1A1A1A"
          },
          renderId: "render-679a343a",
          as: "label",
          children: ["Scheduled Date ", /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              color: "#C0392B"
            },
            renderId: "render-43555ecb",
            as: "span",
            children: "*"
          })]
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: inputStyle2,
          type: "date",
          value: form.scheduledFor,
          min: new Date(Date.now() + 864e5).toISOString().slice(0, 10),
          onChange: (event) => updateField("scheduledFor", event.target.value),
          disabled: isSubmitting,
          renderId: "render-cc9d0347",
          as: "input"
        }), errors.scheduledFor && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            fontSize: "12px",
            color: "#922B21"
          },
          renderId: "render-2cff3810",
          as: "span",
          children: errors.scheduledFor
        })]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        },
        renderId: "render-a652a657",
        as: "div",
        children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            fontSize: "13px",
            fontWeight: "700",
            color: "#1A1A1A"
          },
          renderId: "render-5e5f0b34",
          as: "label",
          children: ["Hospital / Facility ", /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              color: "#C0392B"
            },
            renderId: "render-92146f1d",
            as: "span",
            children: "*"
          })]
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: inputStyle2,
          value: form.hospitalName,
          onChange: (event) => updateField("hospitalName", event.target.value),
          placeholder: "e.g. Federal Medical Centre Owerri",
          disabled: isSubmitting,
          renderId: "render-e7625931",
          as: "input"
        }), errors.hospitalName && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            fontSize: "12px",
            color: "#922B21"
          },
          renderId: "render-13a4ecc2",
          as: "span",
          children: errors.hospitalName
        })]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        },
        renderId: "render-910ec003",
        as: "div",
        children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            fontSize: "13px",
            fontWeight: "700",
            color: "#1A1A1A"
          },
          renderId: "render-1deb916e",
          as: "label",
          children: ["Blood Group Needed ", /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              color: "#C0392B"
            },
            renderId: "render-78fba262",
            as: "span",
            children: "*"
          })]
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            flexWrap: "wrap",
            gap: "8px"
          },
          renderId: "render-083d581f",
          as: "div",
          children: BLOOD_GROUPS$1.map((group) => /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
            renderId: "render-54fa51e6",
            as: "button",
            children: /* @__PURE__ */ jsx(BloodGroupTag, {
              group,
              size: "md"
            })
          }, group))
        }), errors.bloodGroup && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            fontSize: "12px",
            color: "#922B21"
          },
          renderId: "render-b58796a5",
          as: "span",
          children: errors.bloodGroup
        })]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        },
        renderId: "render-a2e01f2c",
        as: "div",
        children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            fontSize: "13px",
            fontWeight: "700",
            color: "#1A1A1A"
          },
          renderId: "render-2065f17a",
          as: "label",
          children: ["Units Needed ", /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              color: "#C0392B"
            },
            renderId: "render-53ff66fd",
            as: "span",
            children: "*"
          })]
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: inputStyle2,
          type: "number",
          min: "1",
          max: "5",
          value: form.unitsNeeded,
          onChange: (event) => updateField("unitsNeeded", event.target.value),
          disabled: isSubmitting,
          renderId: "render-1ba2aef4",
          as: "input"
        }), errors.unitsNeeded && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            fontSize: "12px",
            color: "#922B21"
          },
          renderId: "render-653da49d",
          as: "span",
          children: errors.unitsNeeded
        })]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        },
        renderId: "render-345db7cd",
        as: "div",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            fontSize: "13px",
            fontWeight: "700",
            color: "#1A1A1A"
          },
          renderId: "render-db56e7c5",
          as: "label",
          children: "Patient / Case Reference"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: inputStyle2,
          value: form.patientCode,
          onChange: (event) => updateField("patientCode", event.target.value),
          placeholder: "Optional",
          disabled: isSubmitting,
          renderId: "render-b64dd68e",
          as: "input"
        })]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        },
        renderId: "render-058c7b54",
        as: "div",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            fontSize: "13px",
            fontWeight: "700",
            color: "#1A1A1A"
          },
          renderId: "render-9da73305",
          as: "label",
          children: "Note"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            ...inputStyle2,
            minHeight: "80px",
            paddingTop: "10px",
            resize: "none"
          },
          value: form.urgencyNote,
          onChange: (event) => updateField("urgencyNote", event.target.value),
          placeholder: "Optional",
          disabled: isSubmitting,
          renderId: "render-d3401018",
          as: "textarea"
        })]
      }), /* @__PURE__ */ jsx(PrimaryButton, {
        type: "submit",
        disabled: isSubmitting,
        icon: Plus,
        children: isSubmitting ? "Creating..." : "Create Request"
      }), /* @__PURE__ */ jsx(SecondaryButton, {
        onClick: onClose,
        disabled: isSubmitting,
        children: "Cancel"
      })]
    })]
  });
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
      const {
        request
      } = await addRequest({
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
          const {
            matches
          } = await apiGetMatches({
            request_id: request.id
          });
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
      return {
        ...current,
        selectedIds: [...selected],
        error: ""
      };
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
    setMatchingState((current) => ({
      ...current,
      sending: true,
      error: ""
    }));
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
        matches: current.matches.map((match) => current.selectedIds.includes(match.id) ? {
          ...match,
          match_status: "Alerted"
        } : match)
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
    return /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
      style: {
        flex: 1,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      },
      renderId: "render-965e2ebe",
      as: "div",
      children: /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px"
        },
        renderId: "render-97995b9e",
        as: "div",
        children: [/* @__PURE__ */ jsx(Droplets, {
          size: 32,
          color: "#C0392B"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            fontSize: "14px",
            color: "#4A4A4A",
            fontFamily: "inherit"
          },
          renderId: "render-cd748787",
          as: "p",
          children: "Loading…"
        })]
      })
    });
  }
  const config = ROLE_HOME_CONFIG[currentUser.role] ?? ROLE_HOME_CONFIG.donor;
  const activeRequests = bloodRequests.filter((r) => ![REQUEST_STATUS.FULFILLED, REQUEST_STATUS.CANCELLED].includes(r.status));
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      style: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        paddingBottom: "80px"
      },
      renderId: "render-2b8f3085",
      as: "div",
      children: [/* @__PURE__ */ jsx(TopAppBar, {
        title: "LyfeBlood",
        onBellPress: markAllNotificationsRead
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          background: "linear-gradient(135deg, #922B21 0%, #C0392B 100%)",
          padding: "20px 16px",
          margin: "12px 12px 0",
          borderRadius: "12px"
        },
        renderId: "render-2a6b1840",
        as: "section",
        children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "14px"
          },
          renderId: "render-d9076a7a",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
            renderId: "render-b05834f0",
            as: "div",
            children: currentUser.avatar
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              flex: 1
            },
            renderId: "render-7802fa71",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "11px",
                color: "rgba(255,255,255,0.7)",
                margin: "0 0 1px"
              },
              renderId: "render-f2790cf5",
              as: "p",
              children: currentUser.roleLabel
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "14px",
                fontWeight: "700",
                color: "#FFFFFF",
                margin: 0
              },
              renderId: "render-48b2de2e",
              as: "p",
              children: currentUser.name
            })]
          }), currentUser.bloodGroup && /* @__PURE__ */ jsx(BloodGroupTag, {
            group: currentUser.bloodGroup
          }), currentUser.isAvailable && /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
            renderId: "render-f7d5142d",
            as: "span",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                backgroundColor: "#27AE60"
              },
              renderId: "render-3cd2411c",
              as: "span"
            }), "Available"]
          })]
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            fontSize: "18px",
            fontWeight: "700",
            color: "#FFFFFF",
            margin: "0 0 6px"
          },
          renderId: "render-4c2d5014",
          as: "h2",
          children: config.greeting
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            fontSize: "13px",
            color: "rgba(255,255,255,0.82)",
            margin: "0 0 16px",
            lineHeight: "1.5"
          },
          renderId: "render-12f86883",
          as: "p",
          children: config.body
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
          renderId: "render-f5e8b787",
          as: "button",
          children: [/* @__PURE__ */ jsx(config.ctaIcon, {
            size: 16,
            color: "#C0392B"
          }), config.cta]
        })]
      }), requestSuccess && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
        renderId: "render-f0575aa3",
        as: "div",
        children: requestSuccess
      }), (matchingState.loading || matchingState.request) && /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
        renderId: "render-d870369b",
        as: "section",
        children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          renderId: "render-961f2087",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              margin: "0 0 3px",
              fontSize: "15px",
              fontWeight: "800",
              color: "#1A1A1A"
            },
            renderId: "render-e3f2ba33",
            as: "h2",
            children: "Eligible Donors"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              margin: 0,
              fontSize: "12px",
              color: "#6B6B6B",
              lineHeight: "1.5"
            },
            renderId: "render-6585a1b8",
            as: "p",
            children: matchingState.loading ? "Searching compatible verified donors nearby..." : "Select up to 4 donors to notify."
          })]
        }), matchingState.loading && /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
          renderId: "render-a6508275",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              border: "3px solid #FADBD8",
              borderTopColor: "#C0392B",
              animation: "spin 900ms linear infinite"
            },
            renderId: "render-4d4d6380",
            as: "span"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "12px",
              color: "#922B21",
              fontWeight: "800"
            },
            renderId: "render-b7460b49",
            as: "span",
            children: "Matching donors"
          })]
        }), !matchingState.loading && matchingState.matches.length > 0 && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          },
          renderId: "render-cea9693f",
          as: "div",
          children: matchingState.matches.map((match) => {
            const checked = matchingState.selectedIds.includes(match.id);
            return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
              renderId: "render-4949377b",
              as: "label",
              children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                type: "checkbox",
                checked,
                disabled: matchingState.sent,
                onChange: () => toggleSelectedMatch(match.id),
                style: {
                  width: "18px",
                  height: "18px",
                  accentColor: "#C0392B"
                },
                renderId: "render-e78f557b",
                as: "input"
              }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
                renderId: "render-28c9a9a2",
                as: "div",
                children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                  style: {
                    margin: "0 0 2px",
                    fontSize: "13px",
                    fontWeight: "800",
                    color: "#1A1A1A"
                  },
                  renderId: "render-e8618ba5",
                  as: "p",
                  children: match.donor?.full_name ?? "Eligible donor"
                }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
                  style: {
                    margin: 0,
                    fontSize: "11px",
                    color: "#6B6B6B"
                  },
                  renderId: "render-36195a98",
                  as: "p",
                  children: [match.donor?.blood_type ?? "Blood type", " donor", match.distance_km != null ? ` · ${match.distance_km} km away` : ""]
                })]
              }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
                style: {
                  fontSize: "11px",
                  fontWeight: "800",
                  color: "#922B21"
                },
                renderId: "render-0dfa22fa",
                as: "span",
                children: ["#", match.match_rank ?? "-"]
              })]
            }, match.id);
          })
        }), matchingState.error && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
          renderId: "render-5798d948",
          as: "p",
          children: matchingState.error
        }), !matchingState.loading && matchingState.matches.length > 0 && /* @__PURE__ */ jsx(PrimaryButton, {
          onClick: handleSendSelectedDonors,
          disabled: matchingState.sent || matchingState.sending || matchingState.selectedIds.length === 0,
          icon: Plus,
          children: matchingState.sent ? "Sent to Donors" : matchingState.sending ? "Sending..." : "Send to Selected Donors"
        })]
      }), unreadCount > 0 && /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
        renderId: "render-9cccab3a",
        as: "div",
        children: [/* @__PURE__ */ jsx(Bell, {
          size: 16,
          color: "#922B21"
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            flex: 1,
            fontSize: "13px",
            fontWeight: "600",
            color: "#922B21"
          },
          renderId: "render-b44b05e1",
          as: "span",
          children: [unreadCount, " unread notification", unreadCount > 1 ? "s" : "", " — tap the bell to clear"]
        })]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          padding: "20px 12px 0"
        },
        renderId: "render-cedffacc",
        as: "section",
        children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px"
          },
          renderId: "render-2d94459f",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "16px",
              fontWeight: "700",
              color: "#1A1A1A",
              margin: 0
            },
            renderId: "render-5363a31e",
            as: "h2",
            children: "Active Requests"
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              fontSize: "11px",
              fontWeight: "600",
              color: "#C0392B",
              backgroundColor: "#FADBD8",
              paddingInline: "8px",
              paddingBlock: "3px",
              borderRadius: "999px"
            },
            renderId: "render-c7d27afc",
            as: "span",
            children: [activeRequests.length, " ", "active"]
          })]
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          },
          renderId: "render-e4a90fec",
          as: "div",
          children: activeRequests.map((req) => /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              position: "relative"
            },
            renderId: "render-d332e2e8",
            as: "div",
            children: [/* @__PURE__ */ jsx(RequestCard, {
              request: req,
              onClick: () => navigate(`/requests/${req.id}`)
            }), canDeleteRequest$1(req) && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
              renderId: "render-af6f4eb1",
              as: "button",
              children: /* @__PURE__ */ jsx(Trash2, {
                size: 15
              })
            })]
          }, req.id))
        })]
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          padding: "24px 12px 0"
        },
        renderId: "render-646bc51b",
        as: "div",
        children: /* @__PURE__ */ jsx(SecondaryButton, {
          onClick: logout,
          icon: LogOut,
          children: "Sign Out"
        })
      })]
    }), /* @__PURE__ */ jsx(BottomNavBar, {
      onNavigate: (key) => {
        if (key === "profile") navigate("/profile");
      }
    }), showRequestForm && /* @__PURE__ */ jsx(PatientRequestSheet, {
      onClose: () => setShowRequestForm(false),
      onSubmit: handleCreateRequest,
      isSubmitting: requestSubmitting,
      submitError: requestError
    }), /* @__PURE__ */ jsx("style", {
      jsx: true,
      global: true,
      children: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { margin: 0; padding: 0; }
      `
    })]
  });
}
const page$p = UNSAFE_withComponentProps(function WrappedPage2(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(DashboardPage, {
      ...props
    })
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$p
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
  const {
    currentUser,
    isAuthenticated,
    markAllNotificationsRead
  } = useApp();
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
    apiGetMatches().then(({
      matches: rows
    }) => {
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
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      style: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        paddingBottom: "80px"
      },
      renderId: "render-f070abfe",
      as: "div",
      children: [/* @__PURE__ */ jsx(TopAppBar, {
        title: "Donation History",
        onBellPress: markAllNotificationsRead
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          padding: "16px 12px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        },
        renderId: "render-2344e087",
        as: "main",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
          renderId: "render-f2c14f12",
          as: "button",
          children: /* @__PURE__ */ jsx(ChevronLeft, {
            size: 20,
            color: "#1A1A1A"
          })
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          },
          renderId: "render-ac5e09d8",
          as: "section",
          children: [/* @__PURE__ */ jsx(Award, {
            size: 22,
            color: "#C0392B"
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            renderId: "render-70ea3070",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                margin: "0 0 2px",
                fontSize: "22px",
                fontWeight: "800",
                color: "#1A1A1A"
              },
              renderId: "render-7260ff58",
              as: "p",
              children: matches.length
            }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
              style: {
                margin: 0,
                fontSize: "12px",
                color: "#6B6B6B",
                fontWeight: "700"
              },
              renderId: "render-4bb36f1a",
              as: "p",
              children: ["completed donation", matches.length === 1 ? "" : "s"]
            })]
          })]
        }), loading && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            margin: 0,
            fontSize: "13px",
            color: "#6B6B6B"
          },
          renderId: "render-7eab5933",
          as: "p",
          children: "Loading donation history..."
        }), error && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            margin: 0,
            color: "#922B21",
            fontSize: "13px",
            fontWeight: "700"
          },
          renderId: "render-ef2be067",
          as: "p",
          children: error
        }), !loading && !error && matches.length === 0 && /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            padding: "32px 18px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            textAlign: "center"
          },
          renderId: "render-73c4ba3b",
          as: "section",
          children: [/* @__PURE__ */ jsx(Droplets, {
            size: 38,
            color: "#C8C8C8"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              margin: "10px 0 0",
              fontSize: "14px",
              fontWeight: "700",
              color: "#6B6B6B"
            },
            renderId: "render-28a8bb00",
            as: "p",
            children: "No completed donations yet"
          })]
        }), matches.map((match) => /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            padding: "14px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          },
          renderId: "render-32501e14",
          as: "section",
          children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              display: "flex",
              justifyContent: "space-between",
              gap: "10px",
              alignItems: "flex-start"
            },
            renderId: "render-338168f8",
            as: "div",
            children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
              renderId: "render-b8e94b0c",
              as: "div",
              children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                style: {
                  margin: "0 0 3px",
                  fontSize: "14px",
                  fontWeight: "800",
                  color: "#1A1A1A"
                },
                renderId: "render-94954292",
                as: "p",
                children: match.request?.hospital_name ?? "Blood request"
              }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
                style: {
                  margin: 0,
                  fontSize: "12px",
                  color: "#6B6B6B"
                },
                renderId: "render-a622f951",
                as: "p",
                children: [match.request?.blood_type_needed ?? "Blood", " donation"]
              })]
            }), /* @__PURE__ */ jsx(RequestStatusBadge, {
              status: "fulfilled",
              size: "sm"
            })]
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "12px",
              color: "#4A4A4A"
            },
            renderId: "render-b7848de6",
            as: "span",
            children: [/* @__PURE__ */ jsx(Clock, {
              size: 13,
              color: "#6B6B6B"
            }), formatDate(match.donation_completed_at)]
          })]
        }, match.id))]
      })]
    }), /* @__PURE__ */ jsx(BottomNavBar, {
      onNavigate: (key) => {
        if (key === "home") navigate(homeRoute);
        if (key === "profile") navigate("/profile");
      }
    })]
  });
}
const page$o = UNSAFE_withComponentProps(function WrappedPage3(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(DonationHistoryPage, {
      ...props
    })
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$o
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
    apiGetMatches().then(({
      matches
    }) => {
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
    supabase.from("users").select("reward_points").eq("id", currentUser.id).maybeSingle().then(({
      data,
      error
    }) => {
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
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      style: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        paddingBottom: "80px"
      },
      renderId: "render-35bd2133",
      as: "div",
      children: [/* @__PURE__ */ jsx(TopAppBar, {
        title: "LyfeBlood",
        onBellPress: markAllNotificationsRead
      }), realIncomingMatchAlert && /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          backgroundColor: "#FADBD8",
          borderBottom: "1px solid #F1948A",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          animation: "slideDown 0.3s ease"
        },
        renderId: "render-b38aa2bd",
        as: "div",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#C0392B",
            flexShrink: 0,
            animation: "pulseDot 1.2s infinite"
          },
          renderId: "render-457c8e28",
          as: "div"
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            flex: 1
          },
          renderId: "render-0537f8e7",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "13px",
              fontWeight: "700",
              color: "#922B21",
              margin: "0 0 2px"
            },
            renderId: "render-c4a51d1d",
            as: "p",
            children: "🚨 Urgent Match Found"
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              fontSize: "12px",
              color: "#922B21",
              margin: 0
            },
            renderId: "render-15118d9e",
            as: "p",
            children: [realIncomingMatchAlert.bloodGroup, " needed at", " ", realIncomingMatchAlert.hospitalName]
          })]
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
          renderId: "render-37c31d06",
          as: "button",
          children: "View →"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          onClick: dismissMatchAlert,
          style: {
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            color: "#922B21",
            flexShrink: 0
          },
          renderId: "render-ca6581fb",
          as: "button",
          children: /* @__PURE__ */ jsx(X, {
            size: 16
          })
        })]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          margin: "12px 12px 0",
          background: "linear-gradient(135deg, #922B21 0%, #C0392B 100%)",
          borderRadius: "12px",
          padding: "20px",
          position: "relative",
          overflow: "hidden"
        },
        renderId: "render-a184ce74",
        as: "div",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            position: "absolute",
            top: "-30px",
            right: "-30px",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.06)"
          },
          renderId: "render-6adabca7",
          as: "div"
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "16px"
          },
          renderId: "render-22100c9b",
          as: "div",
          children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            renderId: "render-10e472e6",
            as: "div",
            children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
              style: {
                fontSize: "12px",
                color: "rgba(255,255,255,0.7)",
                margin: "0 0 3px"
              },
              renderId: "render-21cd285f",
              as: "p",
              children: [greeting, ","]
            }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
              style: {
                fontSize: "20px",
                fontWeight: "800",
                color: "#FFFFFF",
                margin: 0,
                letterSpacing: "-0.02em"
              },
              renderId: "render-8d8cdefa",
              as: "h2",
              children: [currentUser.name?.split(" ")[0], " 👋"]
            })]
          }), /* @__PURE__ */ jsx(BloodGroupTag, {
            group: currentUser.bloodGroup,
            size: "lg"
          })]
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            gap: "8px",
            marginBottom: "18px"
          },
          renderId: "render-db493870",
          as: "div",
          children: [{
            icon: Award,
            label: "Donations",
            value: currentUser.totalDonations || 0
          }, {
            icon: Clock,
            label: "Last Donated",
            value: lastDonationLabel
          }, {
            icon: MapPin,
            label: "Location",
            value: "Owerri N."
          }].map(({
            icon: Icon,
            label,
            value
          }) => /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              flex: 1,
              backgroundColor: "rgba(255,255,255,0.12)",
              borderRadius: "8px",
              padding: "10px 8px",
              textAlign: "center"
            },
            renderId: "render-ce2c037b",
            as: "div",
            children: [/* @__PURE__ */ jsx(Icon, {
              size: 14,
              color: "rgba(255,255,255,0.7)",
              style: {
                marginBottom: "4px"
              }
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "16px",
                fontWeight: "800",
                color: "#FFFFFF",
                margin: "0 0 1px",
                lineHeight: 1
              },
              renderId: "render-e684a969",
              as: "p",
              children: value
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "9px",
                color: "rgba(255,255,255,0.6)",
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "0.04em"
              },
              renderId: "render-8ce18bff",
              as: "p",
              children: label
            })]
          }, label))
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            backgroundColor: "rgba(255,255,255,0.12)",
            borderRadius: "10px",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px solid rgba(255,255,255,0.15)"
          },
          renderId: "render-c7dc315f",
          as: "div",
          children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            renderId: "render-f06e9310",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "13px",
                fontWeight: "700",
                color: "#FFFFFF",
                margin: "0 0 2px"
              },
              renderId: "render-4c99c129",
              as: "p",
              children: "Live Availability"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "11px",
                color: "rgba(255,255,255,0.65)",
                margin: 0
              },
              renderId: "render-d8dd2d7b",
              as: "p",
              children: donorAvailable ? isCoolingDown ? "Cooldown active. Donation actions are disabled" : "You are visible to hospitals & patients" : "You are hidden from all requests"
            })]
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexShrink: 0
            },
            renderId: "render-97046a36",
            as: "div",
            children: [donorAvailable && !isCoolingDown && /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
              renderId: "render-e4cb4909",
              as: "span",
              children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                style: {
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  backgroundColor: "#27AE60",
                  animation: "pulseDot 1.5s infinite"
                },
                renderId: "render-493ab4ed",
                as: "span"
              }), "Available"]
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
              renderId: "render-216081b0",
              as: "button",
              children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
                },
                renderId: "render-bda92810",
                as: "span"
              })
            })]
          })]
        }), hasDonationHistory && /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            marginTop: "10px",
            backgroundColor: cooldownDays > 0 ? "rgba(250, 219, 216, 0.18)" : "rgba(213, 245, 227, 0.16)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: "8px",
            padding: "10px 12px"
          },
          renderId: "render-0f91344c",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "11px",
              fontWeight: "700",
              color: "#FFFFFF",
              margin: "0 0 2px"
            },
            renderId: "render-9027be2c",
            as: "p",
            children: "56-day donation cooldown"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "11px",
              color: "rgba(255,255,255,0.72)",
              margin: 0,
              lineHeight: "1.4"
            },
            renderId: "render-e1d4df30",
            as: "p",
            children: cooldownDays > 0 ? `${cooldownDays} day${cooldownDays === 1 ? "" : "s"} remaining before you can accept another donation.` : "Cooldown complete. You can accept assigned requests when available."
          })]
        })]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          padding: "20px 12px 0"
        },
        renderId: "render-cc0e6287",
        as: "section",
        children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px"
          },
          renderId: "render-2e6f9043",
          as: "div",
          children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            renderId: "render-8e69f696",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "16px",
                fontWeight: "700",
                color: "#1A1A1A",
                margin: 0
              },
              renderId: "render-48eeaabb",
              as: "h2",
              children: "Assigned Requests"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "11px",
                color: "#6B6B6B",
                margin: "2px 0 0"
              },
              renderId: "render-f15f0dec",
              as: "p",
              children: "Real matches assigned to you"
            })]
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              fontSize: "11px",
              fontWeight: "600",
              color: "#C0392B",
              backgroundColor: "#FADBD8",
              paddingInline: "8px",
              paddingBlock: "3px",
              borderRadius: "999px"
            },
            renderId: "render-a6273f49",
            as: "span",
            children: [activeRequests.length, " open"]
          })]
        }), activeRequests.length === 0 ? /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
          renderId: "render-170528b3",
          as: "div",
          children: [/* @__PURE__ */ jsx(Droplets, {
            size: 48,
            color: "#C8C8C8",
            strokeWidth: 1.5,
            style: {
              marginBottom: "12px"
            }
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "14px",
              fontWeight: "600",
              color: "#6B6B6B",
              margin: "0 0 4px",
              textAlign: "center"
            },
            renderId: "render-fd5afd08",
            as: "p",
            children: matchesError ? "Unable to load matches" : "No assigned requests right now"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "12px",
              color: "#C8C8C8",
              margin: 0,
              textAlign: "center",
              lineHeight: "1.5"
            },
            renderId: "render-485ee11e",
            as: "p",
            children: matchesError ?? "When the backend matching engine assigns you to a request, it will appear here."
          })]
        }) : /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          },
          renderId: "render-def94913",
          as: "div",
          children: [isCoolingDown && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              margin: 0,
              borderRadius: "8px",
              backgroundColor: "#FADBD8",
              color: "#922B21",
              fontSize: "12px",
              fontWeight: "700",
              padding: "10px 12px"
            },
            renderId: "render-3e21b22f",
            as: "p",
            children: "Donation actions are disabled until your cooldown ends."
          }), activeRequests.map((req) => /* @__PURE__ */ jsx(RequestCard, {
            request: req,
            onClick: () => {
              if (isCoolingDown) return;
              if (typeof window !== "undefined") {
                navigate(`/donor/match/${req.matchId}`);
              }
            }
          }, req.id))]
        })]
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          padding: "16px 12px 0"
        },
        renderId: "render-d44b94c5",
        as: "section",
        children: /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          },
          renderId: "render-05fe3e14",
          as: "div",
          children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px"
            },
            renderId: "render-9dd2fa69",
            as: "div",
            children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
              style: {
                display: "flex",
                alignItems: "center",
                gap: "8px"
              },
              renderId: "render-7b064334",
              as: "div",
              children: [/* @__PURE__ */ jsx(Award, {
                size: 18,
                color: "#C0392B"
              }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
                renderId: "render-b871d8be",
                as: "div",
                children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                  style: {
                    fontSize: "15px",
                    fontWeight: "800",
                    color: "#1A1A1A",
                    margin: 0
                  },
                  renderId: "render-fc717a41",
                  as: "h2",
                  children: "Rewards"
                }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                  style: {
                    fontSize: "12px",
                    color: "#6B6B6B",
                    margin: "2px 0 0"
                  },
                  renderId: "render-4e2baf80",
                  as: "p",
                  children: "Benefits marketplace coming soon"
                })]
              })]
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                backgroundColor: "#FADBD8",
                color: "#922B21",
                borderRadius: "999px",
                padding: "5px 10px",
                fontSize: "11px",
                fontWeight: "800",
                whiteSpace: "nowrap"
              },
              renderId: "render-aaaad0fc",
              as: "span",
              children: "Coming Soon"
            })]
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px"
            },
            renderId: "render-3645e238",
            as: "div",
            children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
              style: {
                backgroundColor: "#F8F8F8",
                borderRadius: "8px",
                padding: "12px"
              },
              renderId: "render-c94efcb6",
              as: "div",
              children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                style: {
                  fontSize: "10px",
                  fontWeight: "800",
                  color: "#6B6B6B",
                  margin: "0 0 4px",
                  textTransform: "uppercase"
                },
                renderId: "render-d2aa9383",
                as: "p",
                children: "Points"
              }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                style: {
                  fontSize: "22px",
                  fontWeight: "800",
                  color: "#1A1A1A",
                  margin: 0
                },
                renderId: "render-e03bd64a",
                as: "p",
                children: rewardPoints
              })]
            }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
              style: {
                backgroundColor: "#F8F8F8",
                borderRadius: "8px",
                padding: "12px"
              },
              renderId: "render-60e3989e",
              as: "div",
              children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                style: {
                  fontSize: "10px",
                  fontWeight: "800",
                  color: "#6B6B6B",
                  margin: "0 0 4px",
                  textTransform: "uppercase"
                },
                renderId: "render-56e0fe66",
                as: "p",
                children: "History"
              }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                style: {
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#4A4A4A",
                  margin: 0,
                  lineHeight: "1.4"
                },
                renderId: "render-74c35967",
                as: "p",
                children: "Reward history will appear after partner rewards launch."
              })]
            })]
          })]
        })
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          padding: "16px 12px 0"
        },
        renderId: "render-7c9daffa",
        as: "section",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            fontSize: "14px",
            fontWeight: "700",
            color: "#1A1A1A",
            margin: "0 0 10px"
          },
          renderId: "render-37ddf540",
          as: "h2",
          children: "Quick Actions"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            gap: "8px"
          },
          renderId: "render-ce34b8de",
          as: "div",
          children: [{
            label: "Donation History",
            icon: Clock,
            href: "#"
          }, {
            label: "Update Profile",
            icon: Award,
            href: "/profile"
          }].map(({
            label,
            icon: Icon,
            href
          }) => /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            href,
            style: {
              flex: 1,
              textDecoration: "none"
            },
            renderId: "render-f1d01ca3",
            as: "a",
            children: /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
              style: {
                backgroundColor: "#FFFFFF",
                borderRadius: "10px",
                padding: "14px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 1px 3px rgba(0,0,0,0.07)"
              },
              renderId: "render-95a91fbb",
              as: "div",
              children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                },
                renderId: "render-02288d7d",
                as: "div",
                children: [/* @__PURE__ */ jsx(Icon, {
                  size: 16,
                  color: "#C0392B"
                }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                  style: {
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#1A1A1A"
                  },
                  renderId: "render-37468dfc",
                  as: "span",
                  children: label
                })]
              }), /* @__PURE__ */ jsx(ChevronRight, {
                size: 14,
                color: "#C8C8C8"
              })]
            })
          }, label))
        })]
      })]
    }), /* @__PURE__ */ jsx(BottomNavBar, {
      onNavigate: (key) => {
        if (typeof window === "undefined") return;
        if (key === "home") navigate("/donor/home");
        if (key === "profile") navigate("/profile");
      }
    }), /* @__PURE__ */ jsx("style", {
      jsx: true,
      global: true,
      children: `
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
      `
    })]
  });
}
const page$n = UNSAFE_withComponentProps(function WrappedPage4(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(DonorHomePage, {
      ...props
    })
  });
});
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$n
}, Symbol.toStringTag, { value: "Module" }));
const REQUEST_ORDER = ["pending", "verified", "donor_matched", "checked_in", "blood_collected", "fulfilled"];
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
function buildDonationJourney({
  request,
  match,
  matches = []
}) {
  const activeMatch = findActiveMatch(matches, match);
  const requestStatus = request?.status ?? "pending";
  const matchingStatus = request?.matching_status ?? request?.matchingStatus ?? "pending";
  const donorAccepted = hasAcceptedMatch(matches, activeMatch);
  const rewardIssued = Boolean(request?.reward_issued_at) || Boolean(activeMatch?.reward_issued_at) || Boolean(activeMatch?.reward_issued) || Boolean(activeMatch?.donation_completed_at) || requestStatus === "fulfilled";
  return [{
    key: "request_created",
    label: "Request Created",
    done: Boolean(request?.id || request?.created_at || request?.requestDate)
  }, {
    key: "donors_matched",
    label: "Donors Matched",
    done: hasAnyMatch(matches) || ["matched", "sent", "accepted", "completed"].includes(matchingStatus) || requestAtLeast(requestStatus, "donor_matched")
  }, {
    key: "donor_accepted",
    label: "Donor Accepted",
    done: donorAccepted || ["accepted", "completed"].includes(matchingStatus)
  }, {
    key: "donor_traveling",
    label: "Donor on the Way",
    done: Boolean(activeMatch?.on_the_way_at)
  }, {
    key: "donor_arrived",
    label: "Donor Arrived",
    done: Boolean(activeMatch?.arrived_at) || requestAtLeast(requestStatus, "checked_in")
  }, {
    key: "otp_verified",
    label: "OTP Verified",
    done: requestAtLeast(requestStatus, "checked_in")
  }, {
    key: "blood_collected",
    label: "Blood Collected",
    done: Boolean(activeMatch?.blood_collected_at) || requestAtLeast(requestStatus, "blood_collected")
  }, {
    key: "donation_confirmed",
    label: "Donation Confirmed",
    done: Boolean(activeMatch?.donation_completed_at) || requestStatus === "fulfilled"
  }, {
    key: "reward_issued",
    label: "Reward Issued",
    done: rewardIssued
  }];
}
function DonationJourney({
  request,
  match,
  matches = []
}) {
  const stages = buildDonationJourney({
    request,
    match,
    matches
  });
  const completedCount = stages.filter((stage) => stage.done).length;
  const currentIndex = stages.findIndex((stage) => !stage.done);
  const activeIndex = currentIndex === -1 ? stages.length - 1 : currentIndex;
  const progress = Math.round(completedCount / stages.length * 100);
  return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
    style: {
      backgroundColor: "#FFFFFF",
      borderRadius: "8px",
      padding: "16px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      display: "flex",
      flexDirection: "column",
      gap: "14px"
    },
    renderId: "render-049a6aa0",
    as: "section",
    children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      style: {
        display: "flex",
        justifyContent: "space-between",
        gap: "12px",
        alignItems: "center"
      },
      renderId: "render-133c4a9b",
      as: "div",
      children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        renderId: "render-251ad2ef",
        as: "div",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            margin: 0,
            fontSize: "15px",
            fontWeight: "800",
            color: "#1A1A1A"
          },
          renderId: "render-7baf0f0b",
          as: "h2",
          children: "Donation Journey"
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            margin: "2px 0 0",
            fontSize: "12px",
            color: "#6B6B6B"
          },
          renderId: "render-275c54a7",
          as: "p",
          children: [progress, "% complete"]
        })]
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          backgroundColor: "#FADBD8",
          color: "#922B21",
          borderRadius: "999px",
          padding: "4px 9px",
          fontSize: "11px",
          fontWeight: "800",
          whiteSpace: "nowrap"
        },
        renderId: "render-efb68fc4",
        as: "span",
        children: stages[activeIndex]?.label
      })]
    }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
      style: {
        height: "8px",
        borderRadius: "999px",
        backgroundColor: "#F4F4F4",
        overflow: "hidden"
      },
      renderId: "render-89f43edb",
      as: "div",
      children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          width: `${progress}%`,
          height: "100%",
          backgroundColor: "#C0392B",
          borderRadius: "999px",
          transition: "width 200ms ease"
        },
        renderId: "render-29fe16d3",
        as: "div"
      })
    }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      },
      renderId: "render-af876da8",
      as: "div",
      children: stages.map((stage, index2) => {
        const isCurrent = index2 === activeIndex && !stage.done;
        const Icon = stage.done ? CheckCircle2 : isCurrent ? Clock : Circle;
        return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            alignItems: "center",
            gap: "10px"
          },
          renderId: "render-644e30e1",
          as: "div",
          children: [/* @__PURE__ */ jsx(Icon, {
            size: 18,
            color: stage.done ? "#1E8449" : isCurrent ? "#C0392B" : "#C8C8C8",
            style: {
              flexShrink: 0
            }
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "13px",
              fontWeight: isCurrent || stage.done ? "800" : "600",
              color: stage.done ? "#1A1A1A" : isCurrent ? "#922B21" : "#6B6B6B"
            },
            renderId: "render-5f1782d5",
            as: "span",
            children: stage.label
          })]
        }, stage.key);
      })
    })]
  });
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
function MapWidget({
  distanceKm,
  hospitalName
}) {
  const [bearing, setBearing] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setBearing((b) => (b + 0.4) % 360), 50);
    return () => clearInterval(interval);
  }, []);
  return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
    style: {
      position: "relative",
      width: "100%",
      height: "220px",
      borderRadius: "12px",
      overflow: "hidden",
      background: "linear-gradient(160deg, #1a3a2a 0%, #1e4530 50%, #162d20 100%)"
    },
    renderId: "render-c784ed15",
    as: "div",
    children: [Array.from({
      length: 7
    }).map((_, i) => /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
      style: {
        position: "absolute",
        left: 0,
        right: 0,
        top: `${(i + 1) * 13}%`,
        height: "1px",
        backgroundColor: "rgba(255,255,255,0.06)"
      },
      renderId: "render-17c1fee6",
      as: "div"
    }, `h${i}`)), Array.from({
      length: 7
    }).map((_, i) => /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
      style: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: `${(i + 1) * 13}%`,
        width: "1px",
        backgroundColor: "rgba(255,255,255,0.06)"
      },
      renderId: "render-548b67c1",
      as: "div"
    }, `v${i}`)), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
      renderId: "render-3f86a558",
      as: "div",
      children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          position: "absolute",
          top: "8px",
          right: "8px",
          fontSize: "9px",
          color: "rgba(192,57,43,0.7)",
          fontWeight: "600"
        },
        renderId: "render-71b0abf5",
        as: "span",
        children: "20km"
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          position: "relative"
        },
        renderId: "render-928194fa",
        as: "div",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            backgroundColor: "#27AE60",
            border: "2.5px solid #FFFFFF",
            boxShadow: "0 0 0 6px rgba(39,174,96,0.2)",
            animation: "gpsPulse 2s infinite"
          },
          renderId: "render-032e053f",
          as: "div"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
          renderId: "render-43e56064",
          as: "span",
          children: "YOU"
        })]
      })]
    }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      style: {
        position: "absolute",
        top: "28%",
        right: "22%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2px"
      },
      renderId: "render-9ca94be5",
      as: "div",
      children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
        renderId: "render-ea8ad141",
        as: "div",
        children: /* @__PURE__ */ jsx(Building2, {
          size: 13,
          color: "#FFFFFF"
        })
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          backgroundColor: "rgba(192,57,43,0.9)",
          borderRadius: "4px",
          paddingInline: "5px",
          paddingBlock: "2px"
        },
        renderId: "render-5fe87f15",
        as: "div",
        children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            fontSize: "8px",
            color: "#FFFFFF",
            fontWeight: "700",
            whiteSpace: "nowrap"
          },
          renderId: "render-41f30cd4",
          as: "span",
          children: "FMC Owerri"
        })
      })]
    }), /* @__PURE__ */ jsx("svg", {
      style: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none"
      },
      children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        x1: "50%",
        y1: "50%",
        x2: "78%",
        y2: "30%",
        stroke: "#C0392B",
        strokeWidth: "2",
        strokeDasharray: "6 4",
        strokeOpacity: "0.7",
        renderId: "render-fb416602",
        as: "line"
      })
    }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
      renderId: "render-2709a021",
      as: "div",
      children: [/* @__PURE__ */ jsx(Navigation, {
        size: 13,
        color: "#27AE60"
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          fontSize: "13px",
          fontWeight: "700",
          color: "#FFFFFF"
        },
        renderId: "render-8da576fd",
        as: "span",
        children: [distanceKm ?? 4.2, " km away"]
      })]
    }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
      renderId: "render-da2a7e1a",
      as: "div",
      children: /* @__PURE__ */ jsx(Navigation, {
        size: 15,
        color: "#FFFFFF",
        style: {
          transform: `rotate(${bearing}deg)`,
          transition: "transform 50ms linear"
        }
      })
    }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
      renderId: "render-bbe7c88e",
      as: "div",
      children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: "#C0392B",
          animation: "gpsPulse 1.5s infinite"
        },
        renderId: "render-27b8e5a4",
        as: "span"
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          fontSize: "10px",
          color: "#FFFFFF",
          fontWeight: "600"
        },
        renderId: "render-e22358af",
        as: "span",
        children: "Live · Owerri"
      })]
    })]
  });
}
function MatchPage({
  params
}) {
  const {
    matchId
  } = params;
  const {
    currentUser,
    isAuthenticated,
    dismissMatchAlert,
    refreshCurrentUser
  } = useApp();
  const [match, setMatch] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [responding, setResponding] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [respondError, setRespondError] = useState(null);
  const [respondSuccess, setRespondSuccess] = useState(null);
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
    apiGetMatch(matchId).then(({
      match: match2
    }) => {
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
    setRespondSuccess(null);
    try {
      if (!match?.requestId) {
        throw new Error("Request ID is missing. Please refresh and try again.");
      }
      const response = await apiRespondToMatch({
        request_id: match.requestId,
        decision: "Accepted"
      });
      if (!response?.otp || !response?.expires_at) {
        throw new Error("OTP was not issued. Please try again.");
      }
      if (typeof window !== "undefined" && response?.otp) {
        window.sessionStorage.setItem(`lyfeblood.match.${matchId}.otp`, response.otp);
        window.sessionStorage.setItem(`lyfeblood.match.${matchId}.expires_at`, response.expires_at);
        window.sessionStorage.setItem(`lyfeblood.match.${matchId}.ttl_seconds`, String(response.otp_ttl_seconds ?? 900));
        window.sessionStorage.setItem(`lyfeblood.match.${matchId}.unlocked_routes`, JSON.stringify(response.unlocked_routes ?? {}));
      }
      setMatch((current) => current ? {
        ...current,
        status: "Accepted"
      } : current);
      setRespondSuccess(response.message ?? "Request accepted. Opening tracking...");
      dismissMatchAlert();
      await new Promise((r) => setTimeout(r, 700));
      if (typeof window !== "undefined") {
        window.location.href = `/matches/${matchId}/tracking`;
      }
    } catch (error) {
      console.error("[DonorMatch] Failed to accept request:", error);
      setRespondError(error?.message ?? "Unable to accept this request");
    } finally {
      setResponding(false);
    }
  };
  const handleDecline = async () => {
    setDeclining(true);
    setRespondError(null);
    setRespondSuccess(null);
    try {
      if (!match?.requestId) {
        throw new Error("Request ID is missing. Please refresh and try again.");
      }
      await apiRespondToMatch({
        request_id: match.requestId,
        decision: "Declined"
      });
      setRespondSuccess("Request declined. Returning home...");
      setDeclined(true);
      dismissMatchAlert();
      await new Promise((r) => setTimeout(r, 800));
      if (typeof window !== "undefined") window.location.href = "/donor/home";
    } catch (error) {
      console.error("[DonorMatch] Failed to decline request:", error);
      setRespondError(error?.message ?? "Unable to decline this request");
    } finally {
      setDeclining(false);
    }
  };
  if (declined) {
    return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
      renderId: "render-ce19864d",
      as: "div",
      children: [/* @__PURE__ */ jsx(X, {
        size: 48,
        color: "#C8C8C8",
        strokeWidth: 1.5
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          fontSize: "16px",
          fontWeight: "600",
          color: "#6B6B6B",
          textAlign: "center"
        },
        renderId: "render-389cd247",
        as: "p",
        children: "Request declined. Redirecting you home…"
      })]
    });
  }
  if (loadError || !match) {
    return /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
      renderId: "render-c2b71472",
      as: "div",
      children: loadError ?? "Loading match..."
    });
  }
  const cooldownDays = getCooldownDaysRemaining(currentUser?.lastDonationAt ?? currentUser?.lastDonated);
  const isCoolingDown = cooldownDays > 0;
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      style: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: "100vh"
      },
      renderId: "render-6f4597c0",
      as: "div",
      children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          backgroundColor: "#922B21",
          padding: "0 16px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0
        },
        renderId: "render-5dc8b19f",
        as: "header",
        children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          onClick: () => {
            if (typeof window !== "undefined") window.location.href = "/donor/home";
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
          renderId: "render-a6cc401e",
          as: "button",
          children: [/* @__PURE__ */ jsx(ChevronLeft, {
            size: 18
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "13px",
              fontWeight: "500"
            },
            renderId: "render-f40891c6",
            as: "span",
            children: "Dashboard"
          })]
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            alignItems: "center",
            gap: "6px"
          },
          renderId: "render-efe9ac88",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              animation: "gpsPulse 1.2s infinite"
            },
            renderId: "render-4dd1f496",
            as: "span"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "12px",
              fontWeight: "700",
              color: "#FFFFFF",
              letterSpacing: "0.06em"
            },
            renderId: "render-84618bb2",
            as: "span",
            children: "MATCH ALERT"
          })]
        }), /* @__PURE__ */ jsx(AlertTriangle, {
          size: 20,
          color: "#FFFFFF"
        })]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          backgroundColor: "#FADBD8",
          padding: "14px 16px",
          borderBottom: "1px solid #F1948A",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        },
        renderId: "render-34c55ed9",
        as: "div",
        children: [/* @__PURE__ */ jsx(AlertTriangle, {
          size: 18,
          color: "#922B21"
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          renderId: "render-8aff5016",
          as: "div",
          children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              fontSize: "13px",
              fontWeight: "700",
              color: "#922B21",
              margin: "0 0 1px"
            },
            renderId: "render-7b525aca",
            as: "p",
            children: ["You have been matched for a ", formatBloodTypes(match.bloodGroup), " request"]
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "11px",
              color: "#922B21",
              margin: 0,
              opacity: 0.8
            },
            renderId: "render-71967c0b",
            as: "p",
            children: "Please review and respond quickly to keep your response rate high."
          })]
        })]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          flex: 1,
          padding: "16px",
          overflowY: "auto"
        },
        renderId: "render-e930a993",
        as: "div",
        children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px 0 16px",
            gap: "8px"
          },
          renderId: "render-1244036f",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "11px",
              fontWeight: "700",
              color: "#C0392B",
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.1em"
            },
            renderId: "render-b159ec74",
            as: "p",
            children: "Blood Group Required"
          }), /* @__PURE__ */ jsx(BloodGroupTag, {
            group: match.bloodGroup,
            size: "lg"
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              fontSize: "11px",
              color: "#6B6B6B",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            },
            renderId: "render-531b4747",
            as: "span",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                width: "8px",
                height: "8px",
                borderRadius: "2px",
                backgroundColor: "#922B21",
                display: "inline-block"
              },
              renderId: "render-dd3f2e83",
              as: "span"
            }), match.tier === "sos" ? "SOS" : "Standard", " · ", match.unitsNeeded, " units needed"]
          })]
        }), /* @__PURE__ */ jsx(MapWidget, {
          distanceKm: match.distanceKm,
          hospitalName: match.hospitalName
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            padding: "18px",
            marginTop: "12px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
          },
          renderId: "render-4a3b53fe",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "11px",
              fontWeight: "700",
              color: "#6B6B6B",
              margin: "0 0 10px",
              textTransform: "uppercase",
              letterSpacing: "0.06em"
            },
            renderId: "render-10311584",
            as: "p",
            children: "Request Details"
          }), [{
            icon: Building2,
            label: "Hospital",
            value: match.hospitalName
          }, {
            icon: MapPin,
            label: "Ward",
            value: match.ward
          }, {
            icon: MapPin,
            label: "Address",
            value: match.location
          }, {
            icon: Navigation,
            label: "Distance",
            value: `${match.distanceKm} km from your location`
          }, {
            icon: Clock,
            label: "Patient Code",
            value: match.patientCode
          }].map(({
            icon: Icon,
            label,
            value
          }) => /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              display: "flex",
              gap: "10px",
              marginBottom: "10px",
              alignItems: "flex-start"
            },
            renderId: "render-1e77542d",
            as: "div",
            children: [/* @__PURE__ */ jsx(Icon, {
              size: 14,
              color: "#C0392B",
              style: {
                marginTop: "2px",
                flexShrink: 0
              }
            }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
              renderId: "render-a7a5c2ef",
              as: "div",
              children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                style: {
                  fontSize: "11px",
                  color: "#6B6B6B",
                  margin: "0 0 1px"
                },
                renderId: "render-4cd45d90",
                as: "p",
                children: label
              }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                style: {
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#1A1A1A",
                  margin: 0
                },
                renderId: "render-b15b2e25",
                as: "p",
                children: value
              })]
            })]
          }, label)), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              backgroundColor: "#FADBD8",
              borderRadius: "8px",
              padding: "10px 12px",
              marginTop: "4px",
              borderLeft: "3px solid #922B21"
            },
            renderId: "render-3a9045b7",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "11px",
                fontWeight: "700",
                color: "#922B21",
                margin: "0 0 2px"
              },
              renderId: "render-ba924412",
              as: "p",
              children: "Clinical Note"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "12px",
                color: "#922B21",
                margin: 0,
                lineHeight: "1.5",
                opacity: 0.9
              },
              renderId: "render-4b280f96",
              as: "p",
              children: match.urgencyNote
            })]
          })]
        }), /* @__PURE__ */ jsx(DonationJourney, {
          request: match.rawRequest,
          match: match.rawMatch
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            padding: "16px",
            marginTop: "12px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
          },
          renderId: "render-85c90761",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "12px",
              fontWeight: "700",
              color: "#6B6B6B",
              margin: "0 0 12px",
              textTransform: "uppercase",
              letterSpacing: "0.06em"
            },
            renderId: "render-e8804636",
            as: "p",
            children: "If you accept"
          }), [{
            step: "1",
            text: "A secure 6-digit OTP check-in code will be issued."
          }, {
            step: "2",
            text: "Chat and route tracking are unlocked for the accepted match."
          }, {
            step: "3",
            text: "Travel to the hospital and present the code to the Lab Manager."
          }, {
            step: "4",
            text: "Clinical staff will handle all screening and procedures."
          }].map(({
            step,
            text
          }) => /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              display: "flex",
              gap: "10px",
              marginBottom: "10px",
              alignItems: "flex-start"
            },
            renderId: "render-362ffca2",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
              renderId: "render-d82f360e",
              as: "span",
              children: step
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "13px",
                color: "#4A4A4A",
                margin: 0,
                lineHeight: "1.5"
              },
              renderId: "render-52f954bb",
              as: "p",
              children: text
            })]
          }, step))]
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginTop: "20px",
            paddingBottom: "32px"
          },
          renderId: "render-7eba10df",
          as: "div",
          children: [match.status === "Accepted" && /* @__PURE__ */ jsxs(Fragment, {
            children: [/* @__PURE__ */ jsx(PrimaryButton, {
              onClick: () => {
                if (typeof window !== "undefined") window.location.href = `/matches/${matchId}/tracking`;
              },
              icon: Navigation,
              children: "Open Tracking"
            }), /* @__PURE__ */ jsx(SecondaryButton, {
              onClick: () => {
                if (typeof window !== "undefined") window.location.href = `/matches/${matchId}/chat`;
              },
              icon: MessageCircle,
              children: "Open Chat"
            })]
          }), match.status === "Alerted" && /* @__PURE__ */ jsx(PrimaryButton, {
            onClick: handleAccept,
            disabled: responding || declining || isCoolingDown,
            icon: CheckCircle2,
            children: responding ? "Accepting..." : "Accept This Request"
          }), respondSuccess && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              backgroundColor: "#D5F5E3",
              borderRadius: "8px",
              color: "#1E8449",
              fontSize: "12px",
              fontWeight: "600",
              margin: 0,
              padding: "10px 12px",
              textAlign: "center"
            },
            renderId: "render-10822129",
            as: "p",
            children: respondSuccess
          }), match.status === "Alerted" && isCoolingDown && /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
            renderId: "render-c804f2c2",
            as: "p",
            children: ["Donation actions are disabled for ", cooldownDays, " more day", cooldownDays === 1 ? "" : "s", "."]
          }), respondError && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
            renderId: "render-eaec2505",
            as: "p",
            children: respondError
          }), match.status === "Alerted" && /* @__PURE__ */ jsxs(Fragment, {
            children: [/* @__PURE__ */ jsx(SecondaryButton, {
              onClick: handleDecline,
              disabled: responding || declining || match.status !== "Alerted",
              icon: X,
              children: declining ? "Declining…" : "Decline"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                textAlign: "center",
                fontSize: "11px",
                color: "#6B6B6B",
                margin: 0,
                lineHeight: "1.5"
              },
              renderId: "render-462fff27",
              as: "p",
              children: "Declining will pass this match to another available donor. Your availability status will remain on."
            })]
          })]
        })]
      })]
    }), /* @__PURE__ */ jsx("style", {
      jsx: true,
      global: true,
      children: `
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
      `
    })]
  });
}
const page$m = UNSAFE_withComponentProps(function WrappedPage5(props) {
  const params = useParams();
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(MatchPage, {
      ...props,
      matchId: params.matchId
    })
  });
});
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$m
}, Symbol.toStringTag, { value: "Module" }));
const OTP_DURATION_SECONDS = 15 * 60;
function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
function CheckInPage({
  params
}) {
  const {
    matchId
  } = params;
  const {
    isAuthenticated
  } = useApp();
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
      const storedExpiresAt = window.sessionStorage.getItem(`lyfeblood.match.${matchId}.expires_at`);
      const storedTtl = Number.parseInt(window.sessionStorage.getItem(`lyfeblood.match.${matchId}.ttl_seconds`) ?? "", 10);
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
    apiGetMatch(matchId).then(({
      match: match2
    }) => {
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
      setSecondsLeft(Math.max(0, Math.ceil((Date.parse(expiresAt) - Date.now()) / 1e3)));
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
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      style: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: "100vh"
      },
      renderId: "render-081517ea",
      as: "div",
      children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
        renderId: "render-1d99f5e1",
        as: "header",
        children: /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            alignItems: "center",
            gap: "8px"
          },
          renderId: "render-9490244e",
          as: "div",
          children: [/* @__PURE__ */ jsx(Shield, {
            size: 18,
            color: "#27AE60"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "16px",
              fontWeight: "700",
              color: "#1A1A1A"
            },
            renderId: "render-e4f5f6c7",
            as: "span",
            children: "Secure Check-In"
          })]
        })
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          backgroundColor: "#D5F5E3",
          padding: "14px 16px",
          borderBottom: "1px solid #A9DFBF",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px"
        },
        renderId: "render-d74df013",
        as: "div",
        children: [/* @__PURE__ */ jsx(Shield, {
          size: 18,
          color: "#1E8449",
          style: {
            flexShrink: 0,
            marginTop: "1px"
          }
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            fontSize: "13px",
            color: "#1E8449",
            margin: 0,
            lineHeight: "1.5"
          },
          renderId: "render-7fb850d1",
          as: "p",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            renderId: "render-5b825694",
            as: "strong",
            children: "Present this secure code token"
          }), " to the hospital laboratory manager upon arrival. Do not share this code with anyone else."]
        })]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          flex: 1,
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        },
        renderId: "render-5fc57561",
        as: "div",
        children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
          },
          renderId: "render-2efbe940",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
            renderId: "render-bff2c961",
            as: "div",
            children: /* @__PURE__ */ jsx(Building2, {
              size: 20,
              color: "#C0392B"
            })
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              flex: 1
            },
            renderId: "render-4d975fde",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "13px",
                fontWeight: "700",
                color: "#1A1A1A",
                margin: "0 0 2px"
              },
              renderId: "render-e9d0232e",
              as: "p",
              children: match?.hospitalName ?? "Loading hospital..."
            }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
              style: {
                fontSize: "12px",
                color: "#6B6B6B",
                margin: 0
              },
              renderId: "render-3a2edf2c",
              as: "p",
              children: [match?.ward ?? "Blood request", " · ", match?.patientCode ?? matchId]
            })]
          }), /* @__PURE__ */ jsx(BloodGroupTag, {
            group: match?.bloodGroup,
            size: "md"
          })]
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
            overflow: "hidden"
          },
          renderId: "render-ce54d176",
          as: "div",
          children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              backgroundColor: isExpired ? "#C8C8C8" : "#1A1A1A",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "background-color 500ms"
            },
            renderId: "render-2572fa9b",
            as: "div",
            children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
              style: {
                display: "flex",
                alignItems: "center",
                gap: "8px"
              },
              renderId: "render-d37db4e3",
              as: "div",
              children: [/* @__PURE__ */ jsx(Shield, {
                size: 15,
                color: isExpired ? "#6B6B6B" : "#FFFFFF"
              }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                style: {
                  fontSize: "12px",
                  fontWeight: "700",
                  color: isExpired ? "#6B6B6B" : "#FFFFFF",
                  letterSpacing: "0.04em"
                },
                renderId: "render-364f1bf0",
                as: "span",
                children: isExpired ? "TOKEN EXPIRED" : "SECURE TOKEN"
              })]
            }), !isExpired && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "10px",
                fontWeight: "600",
                color: "rgba(255,255,255,0.6)",
                backgroundColor: "rgba(255,255,255,0.1)",
                paddingInline: "8px",
                paddingBlock: "3px",
                borderRadius: "999px"
              },
              renderId: "render-192dbd4b",
              as: "span",
              children: "Single-use · Encrypted"
            })]
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              padding: "32px 24px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px"
            },
            renderId: "render-f9f576eb",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "11px",
                fontWeight: "600",
                color: "#6B6B6B",
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "0.08em"
              },
              renderId: "render-8e21d212",
              as: "p",
              children: "6-Digit Verification Code"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              onClick: handleCopyOTP,
              style: {
                display: "flex",
                alignItems: "center",
                gap: "0",
                cursor: isExpired ? "default" : "pointer",
                userSelect: "none"
              },
              renderId: "render-26cc3618",
              as: "div",
              children: (otp || "------").split("").map((digit, i) => /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                style: {
                  fontSize: "36px",
                  fontWeight: "800",
                  color: isExpired ? "#C8C8C8" : "#1A1A1A",
                  letterSpacing: i === 2 ? "16px" : "8px",
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1,
                  transition: "color 300ms"
                },
                renderId: "render-d58e6679",
                as: "span",
                children: digit
              }, i))
            }), !isExpired && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
              renderId: "render-429b7936",
              as: "button",
              children: copied ? /* @__PURE__ */ jsxs(Fragment, {
                children: [/* @__PURE__ */ jsx(CheckCircle2, {
                  size: 12
                }), " Copied!"]
              }) : "Tap to copy"
            })]
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              paddingInline: "24px",
              paddingBottom: "20px"
            },
            renderId: "render-ca1879e6",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                height: "4px",
                backgroundColor: "#F4F4F4",
                borderRadius: "2px",
                overflow: "hidden",
                marginBottom: "8px"
              },
              renderId: "render-4c6ef191",
              as: "div",
              children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                style: {
                  height: "100%",
                  width: `${secondsLeft / durationSeconds * 100}%`,
                  backgroundColor: urgencyColor,
                  borderRadius: "2px",
                  transition: "width 1s linear, background-color 500ms"
                },
                renderId: "render-3347c4a4",
                as: "div"
              })
            }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              },
              renderId: "render-cf6b1d3f",
              as: "div",
              children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                style: {
                  fontSize: "12px",
                  color: "#6B6B6B"
                },
                renderId: "render-13316ef8",
                as: "span",
                children: isExpired ? "Token has expired" : "Expires in"
              }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                style: {
                  fontSize: "15px",
                  fontWeight: "800",
                  color: urgencyColor,
                  fontVariantNumeric: "tabular-nums",
                  animation: secondsLeft < 60 ? "timerPulse 1s infinite" : "none"
                },
                renderId: "render-e9e7df93",
                as: "span",
                children: isExpired ? "00:00" : formatCountdown(secondsLeft)
              })]
            })]
          })]
        }), isExpired && /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            backgroundColor: "#FADBD8",
            borderRadius: "10px",
            padding: "14px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px"
          },
          renderId: "render-ee4f70db",
          as: "div",
          children: [/* @__PURE__ */ jsx(AlertTriangle, {
            size: 16,
            color: "#922B21",
            style: {
              flexShrink: 0,
              marginTop: "1px"
            }
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            renderId: "render-fbd4621c",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "13px",
                fontWeight: "700",
                color: "#922B21",
                margin: "0 0 2px"
              },
              renderId: "render-e8844c05",
              as: "p",
              children: "Token Expired"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "12px",
                color: "#922B21",
                margin: 0,
                lineHeight: "1.5",
                opacity: 0.9
              },
              renderId: "render-b7c97c29",
              as: "p",
              children: "Your 15-minute verification window has lapsed. Please contact the hospital directly or return to dashboard and re-accept the request."
            })]
          })]
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
          },
          renderId: "render-74f4a148",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "11px",
              fontWeight: "700",
              color: "#6B6B6B",
              margin: "0 0 12px",
              textTransform: "uppercase",
              letterSpacing: "0.06em"
            },
            renderId: "render-222617bb",
            as: "p",
            children: "What to do on arrival"
          }), ["Go directly to the Blood Bank / Laboratory department.", "Show this screen to the Laboratory Manager.", `Read out or present the 6-digit code: ${otp}.`, "The lab team will take it from there. Do not leave until confirmed."].map((step, i) => /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              display: "flex",
              gap: "10px",
              marginBottom: i < 3 ? "10px" : "0",
              alignItems: "flex-start"
            },
            renderId: "render-5371eb34",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
              renderId: "render-fc8cd0fb",
              as: "span",
              children: i + 1
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "13px",
                color: "#4A4A4A",
                margin: 0,
                lineHeight: "1.5"
              },
              renderId: "render-5e8d5028",
              as: "p",
              children: step
            })]
          }, i))]
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            paddingBottom: "32px"
          },
          renderId: "render-27635acb",
          as: "div",
          children: [loadError && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
            renderId: "render-0dc7bbab",
            as: "p",
            children: loadError
          }), /* @__PURE__ */ jsx(PrimaryButton, {
            onClick: () => {
            },
            disabled: true,
            icon: CheckCircle2,
            children: "Awaiting Hospital Verification"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              textAlign: "center",
              fontSize: "11px",
              color: "#6B6B6B",
              marginTop: "12px",
              lineHeight: "1.5"
            },
            renderId: "render-398844e4",
            as: "p",
            children: "Tap only after you have physically arrived at the hospital laboratory."
          })]
        })]
      })]
    }), /* @__PURE__ */ jsx("style", {
      jsx: true,
      global: true,
      children: `
        @keyframes timerPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { margin: 0; padding: 0; }
      `
    })]
  });
}
const page$l = UNSAFE_withComponentProps(function WrappedPage6(props) {
  const params = useParams();
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(CheckInPage, {
      ...props,
      matchId: params.matchId
    })
  });
});
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$l
}, Symbol.toStringTag, { value: "Module" }));
function Page$8() {
  useEffect(() => {
    const run = async () => {
      throw new Error("async effect exploded");
    };
    run();
  }, []);
  return /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
    renderId: "render-7b88a5b6",
    as: "div",
    children: "async effect error"
  });
}
const page$k = UNSAFE_withComponentProps(function WrappedPage7(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(Page$8, {
      ...props
    })
  });
});
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$k
}, Symbol.toStringTag, { value: "Module" }));
function Page$7() {
  const handleClick = () => {
    throw new Error("click handler exploded");
  };
  return /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
    onClick: handleClick,
    renderId: "render-c634605d",
    as: "button",
    children: "Click me"
  });
}
const page$j = UNSAFE_withComponentProps(function WrappedPage8(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(Page$7, {
      ...props
    })
  });
});
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$j
}, Symbol.toStringTag, { value: "Module" }));
function BadHook({
  flag
}) {
  if (flag) {
    const [n, setValue] = useState(0);
    return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      renderId: "render-054e08f8",
      as: "div",
      children: [n, /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        onClick: () => setValue(n + 1),
        renderId: "render-3a9646d5",
        as: "button",
        children: "Increment"
      })]
    });
  }
  return "ok";
}
function Page$6() {
  const [count, setCount] = useState(0);
  return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
    renderId: "render-015f00dc",
    as: "div",
    children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
      renderId: "render-72b84fba",
      as: "h1",
      children: "Bad Hook Example"
    }), /* @__PURE__ */ jsx(BadHook, {
      flag: count % 2 === 0
    }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
      onClick: () => setCount(count + 1),
      renderId: "render-c504a9f7",
      as: "button",
      children: "Toggle Hook"
    })]
  });
}
const page$i = UNSAFE_withComponentProps(function WrappedPage9(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(Page$6, {
      ...props
    })
  });
});
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$i
}, Symbol.toStringTag, { value: "Module" }));
function Page$5() {
  const [count, setCount] = useState(0);
  setCount(count + 1);
  return /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
    renderId: "render-2e770534",
    as: "div",
    children: count
  });
}
const page$h = UNSAFE_withComponentProps(function WrappedPage10(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(Page$5, {
      ...props
    })
  });
});
const route10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$h
}, Symbol.toStringTag, { value: "Module" }));
function Page$4() {
  const data = JSON.parse("not valid json {{{");
  return /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
    renderId: "render-4e5d1c7b",
    as: "div",
    children: data.name
  });
}
const page$g = UNSAFE_withComponentProps(function WrappedPage11(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(Page$4, {
      ...props
    })
  });
});
const route11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$g
}, Symbol.toStringTag, { value: "Module" }));
function Page$3() {
  return /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
    renderId: "render-955fe68a",
    as: "div",
    children: "Missing component test page disabled in production build."
  });
}
const page$f = UNSAFE_withComponentProps(function WrappedPage12(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(Page$3, {
      ...props
    })
  });
});
const route12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$f
}, Symbol.toStringTag, { value: "Module" }));
function Bug() {
  const obj = null;
  return /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
    renderId: "render-36ea336c",
    as: "p",
    children: obj.key
  });
}
const page$e = UNSAFE_withComponentProps(function WrappedPage13(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(Bug, {
      ...props
    })
  });
});
const route13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$e
}, Symbol.toStringTag, { value: "Module" }));
function Page$2() {
  const data = {
    name: "test",
    value: 42
  };
  return /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
    renderId: "render-96e36b90",
    as: "div",
    children: data
  });
}
const page$d = UNSAFE_withComponentProps(function WrappedPage14(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(Page$2, {
      ...props
    })
  });
});
const route14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$d
}, Symbol.toStringTag, { value: "Module" }));
function Page$1() {
  const notAFunction = 42;
  return /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
    renderId: "render-d55c7924",
    as: "p",
    children: notAFunction()
  });
}
const page$c = UNSAFE_withComponentProps(function WrappedPage15(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(Page$1, {
      ...props
    })
  });
});
const route15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$c
}, Symbol.toStringTag, { value: "Module" }));
function Page() {
  const obj = void 0;
  return /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
    renderId: "render-e0f2df6e",
    as: "p",
    children: obj.key
  });
}
const page$b = UNSAFE_withComponentProps(function WrappedPage16(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(Page, {
      ...props
    })
  });
});
const route16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$b
}, Symbol.toStringTag, { value: "Module" }));
function Fetcher() {
  useEffect(() => {
    fetch("/unknown");
  }, []);
  return /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
    renderId: "render-0bf4d473",
    as: "div",
    children: "unhandled promise"
  });
}
const page$a = UNSAFE_withComponentProps(function WrappedPage17(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(Fetcher, {
      ...props
    })
  });
});
const route17 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$a
}, Symbol.toStringTag, { value: "Module" }));
const DELETE_AFTER_MS$1 = 24 * 60 * 60 * 1e3;
function canDeleteRequest(request) {
  const createdAt = new Date(request.requestDate).getTime();
  return Number.isFinite(createdAt) && Date.now() - createdAt >= DELETE_AFTER_MS$1;
}
function NewRequestSheet({
  onClose,
  onSubmit,
  isSOS
}) {
  const [form, setForm] = useState({
    bloodGroups: [],
    ward: "",
    unitsNeeded: 1,
    urgencyNote: "",
    patientCode: ""
  });
  const canSubmit = form.bloodGroups.length > 0 && form.ward && form.unitsNeeded >= 1;
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
  return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 200,
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      alignItems: "center"
    },
    renderId: "render-d91b52b1",
    as: "div",
    children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
      onClick: onClose,
      style: {
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)"
      },
      renderId: "render-db132057",
      as: "div"
    }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
      renderId: "render-82749a55",
      as: "div",
      children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          display: "flex",
          justifyContent: "center",
          padding: "12px 0 4px"
        },
        renderId: "render-99134183",
        as: "div",
        children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            width: "36px",
            height: "4px",
            borderRadius: "2px",
            backgroundColor: "#C8C8C8"
          },
          renderId: "render-2320c8cf",
          as: "div"
        })
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          padding: "8px 16px 16px",
          borderBottom: "1px solid #F4F4F4",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        },
        renderId: "render-41248c8a",
        as: "div",
        children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            alignItems: "center",
            gap: "8px"
          },
          renderId: "render-e8209642",
          as: "div",
          children: [isSOS && /* @__PURE__ */ jsx(AlertTriangle, {
            size: 18,
            color: "#922B21"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "17px",
              fontWeight: "800",
              color: "#1A1A1A",
              margin: 0
            },
            renderId: "render-df7b14ba",
            as: "h2",
            children: isSOS ? "SOS Broadcast Request" : "New Blood Request"
          })]
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          onClick: onClose,
          style: {
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            color: "#6B6B6B"
          },
          renderId: "render-c30e5d01",
          as: "button",
          children: /* @__PURE__ */ jsx(X, {
            size: 20
          })
        })]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        },
        renderId: "render-7e4e2de9",
        as: "div",
        children: [isSOS && /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            backgroundColor: "#FADBD8",
            borderRadius: "10px",
            padding: "12px 14px",
            display: "flex",
            alignItems: "flex-start",
            gap: "8px"
          },
          renderId: "render-1d2ee4ac",
          as: "div",
          children: [/* @__PURE__ */ jsx(Radio, {
            size: 15,
            color: "#922B21",
            style: {
              flexShrink: 0,
              marginTop: "1px"
            }
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              fontSize: "12px",
              color: "#922B21",
              margin: 0,
              lineHeight: "1.5"
            },
            renderId: "render-10a0c44a",
            as: "p",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              renderId: "render-a43c88bb",
              as: "strong",
              children: "SOS mode:"
            }), " This request will be broadcast immediately to ALL available matching donors in Imo State with the highest priority alert."]
          })]
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          },
          renderId: "render-f9b803e7",
          as: "div",
          children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              fontSize: "13px",
              fontWeight: "600",
              color: "#1A1A1A"
            },
            renderId: "render-8b3aa421",
            as: "label",
            children: ["Blood Group Required ", /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                color: "#C0392B"
              },
              renderId: "render-37b70926",
              as: "span",
              children: "*"
            })]
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              display: "flex",
              flexWrap: "wrap",
              gap: "8px"
            },
            renderId: "render-8e8772d7",
            as: "div",
            children: BLOOD_GROUPS$1.map((g) => /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              type: "button",
              onClick: () => setForm((f) => ({
                ...f,
                bloodGroups: f.bloodGroups.includes(g) ? f.bloodGroups.filter((group) => group !== g) : [...f.bloodGroups, g]
              })),
              style: {
                background: "none",
                border: `2px solid ${form.bloodGroups.includes(g) ? "#C0392B" : "#C8C8C8"}`,
                borderRadius: "8px",
                padding: 0,
                cursor: "pointer",
                outline: "none",
                transform: form.bloodGroups.includes(g) ? "scale(1.06)" : "scale(1)",
                boxShadow: form.bloodGroups.includes(g) ? "0 0 0 3px #FADBD8" : "none",
                transition: "all 150ms"
              },
              renderId: "render-1623a4b1",
              as: "button",
              children: /* @__PURE__ */ jsx(BloodGroupTag, {
                group: g,
                size: "md"
              })
            }, g))
          }), form.bloodGroups.length > 0 && /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap"
            },
            renderId: "render-e7d2b50d",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "12px",
                color: "#6B6B6B",
                fontWeight: "700"
              },
              renderId: "render-4b051eb5",
              as: "span",
              children: "Selected:"
            }), /* @__PURE__ */ jsx(BloodGroupTag, {
              group: form.bloodGroups,
              size: "sm"
            })]
          })]
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          },
          renderId: "render-4e986bfd",
          as: "div",
          children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              fontSize: "13px",
              fontWeight: "600",
              color: "#1A1A1A"
            },
            renderId: "render-4e388488",
            as: "label",
            children: ["Requesting Ward ", /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                color: "#C0392B"
              },
              renderId: "render-8cb7bcfb",
              as: "span",
              children: "*"
            })]
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              ...inputStyle2,
              cursor: "pointer"
            },
            value: form.ward,
            onChange: (e) => setForm((f) => ({
              ...f,
              ward: e.target.value
            })),
            renderId: "render-350c95f2",
            as: "select",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              value: "",
              renderId: "render-7e40f5be",
              as: "option",
              children: "Select ward"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              renderId: "render-662ab5dc",
              as: "option",
              children: "Accident & Emergency"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              renderId: "render-480f8213",
              as: "option",
              children: "Maternity & Obstetrics"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              renderId: "render-b0949e33",
              as: "option",
              children: "Surgical Ward A"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              renderId: "render-404dea01",
              as: "option",
              children: "Surgical Ward B"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              renderId: "render-9fd8b828",
              as: "option",
              children: "Surgical Ward C"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              renderId: "render-586a7cf5",
              as: "option",
              children: "Intensive Care Unit (ICU)"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              renderId: "render-237f771d",
              as: "option",
              children: "Paediatric Ward"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              renderId: "render-498f82f7",
              as: "option",
              children: "General Medical Ward"
            })]
          })]
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          },
          renderId: "render-6f934c8b",
          as: "div",
          children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              fontSize: "13px",
              fontWeight: "600",
              color: "#1A1A1A"
            },
            renderId: "render-04e4e4d1",
            as: "label",
            children: ["Units Required ", /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                color: "#C0392B"
              },
              renderId: "render-4c14be3f",
              as: "span",
              children: "*"
            })]
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap"
            },
            renderId: "render-cb9659df",
            as: "div",
            children: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              type: "button",
              onClick: () => setForm((f) => ({
                ...f,
                unitsNeeded: n
              })),
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
              renderId: "render-2b5bdec1",
              as: "button",
              children: n
            }, n))
          })]
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          },
          renderId: "render-2d3d5674",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "13px",
              fontWeight: "600",
              color: "#1A1A1A"
            },
            renderId: "render-97f6c07c",
            as: "label",
            children: "Patient / Case Reference Code"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: inputStyle2,
            type: "text",
            placeholder: "e.g. FMC-AE-2077",
            value: form.patientCode,
            onChange: (e) => setForm((f) => ({
              ...f,
              patientCode: e.target.value
            })),
            renderId: "render-e58a361b",
            as: "input"
          })]
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          },
          renderId: "render-6de33038",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "13px",
              fontWeight: "600",
              color: "#1A1A1A"
            },
            renderId: "render-d50191b4",
            as: "label",
            children: "Clinical Note (optional)"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              ...inputStyle2,
              height: "80px",
              paddingTop: "10px",
              paddingBottom: "10px",
              resize: "none"
            },
            placeholder: "Brief clinical context for the donor (no diagnostic criteria)",
            value: form.urgencyNote,
            onChange: (e) => setForm((f) => ({
              ...f,
              urgencyNote: e.target.value
            })),
            renderId: "render-7857af6b",
            as: "textarea"
          })]
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            paddingBottom: "16px"
          },
          renderId: "render-1a3e939d",
          as: "div",
          children: [/* @__PURE__ */ jsx(PrimaryButton, {
            onClick: () => {
              if (canSubmit) onSubmit({
                ...form,
                isSOS
              });
            },
            disabled: !canSubmit,
            icon: isSOS ? AlertTriangle : Plus,
            children: isSOS ? "Trigger SOS Broadcast" : "Post Blood Request"
          }), /* @__PURE__ */ jsx(SecondaryButton, {
            onClick: onClose,
            children: "Cancel"
          })]
        })]
      })]
    })]
  });
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
      const {
        matches
      } = await apiGetMatches();
      const accepted = (matches ?? []).filter((match) => match.match_status === "Accepted");
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
      bloodGroup: formData.bloodGroups,
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
      updateRequestStatus(response.request.id, nextStatus, {
        persist: false
      });
      setCheckInSuccess(response.message ?? "Hospital status updated.");
      await loadAcceptedMatches();
    } catch (error) {
      setCheckInError(error?.message ?? "Unable to update hospital status");
    } finally {
      setMatchStatusLoading(null);
    }
  };
  const handleStatusUpdate = async (requestId2, nextStatus) => {
    setStatusAction({
      id: requestId2,
      loading: true,
      error: null,
      success: null
    });
    try {
      await updateRequestStatus(requestId2, nextStatus);
      setStatusAction({
        id: requestId2,
        loading: false,
        error: null,
        success: `Status updated to ${nextStatus.replaceAll("_", " ")}.`
      });
    } catch (error) {
      setStatusAction({
        id: requestId2,
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
    setStatusAction({
      id: request.id,
      loading: false,
      error: null,
      success: null
    });
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
  const activeRequests = bloodRequests.filter((r) => ![REQUEST_STATUS.FULFILLED, REQUEST_STATUS.CANCELLED].includes(r.status));
  const pendingCount = bloodRequests.filter((r) => r.status === REQUEST_STATUS.PENDING).length;
  const matchedCount = bloodRequests.filter((r) => r.status === REQUEST_STATUS.DONOR_MATCHED).length;
  const selectedMatch = acceptedMatches.find((match) => String(match.id) === String(checkInMatchId));
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      style: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        paddingBottom: "80px"
      },
      renderId: "render-0ebc892e",
      as: "div",
      children: [/* @__PURE__ */ jsx(TopAppBar, {
        title: "Blood Bank Command",
        onBellPress: markAllNotificationsRead
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          margin: "12px 12px 0",
          background: "linear-gradient(135deg, #1A1A1A 0%, #2C2C2C 100%)",
          borderRadius: "12px",
          padding: "18px"
        },
        renderId: "render-7c66f3fe",
        as: "div",
        children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px"
          },
          renderId: "render-6f3df39d",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
            renderId: "render-acc5ad0d",
            as: "div",
            children: currentUser.avatar
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              flex: 1
            },
            renderId: "render-ce2e285d",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "11px",
                color: "rgba(255,255,255,0.5)",
                margin: "0 0 2px"
              },
              renderId: "render-7cb65133",
              as: "p",
              children: currentUser.roleLabel
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "15px",
                fontWeight: "700",
                color: "#FFFFFF",
                margin: 0
              },
              renderId: "render-fbc3471b",
              as: "p",
              children: currentUser.name
            }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
              style: {
                fontSize: "11px",
                color: "rgba(255,255,255,0.5)",
                margin: "1px 0 0"
              },
              renderId: "render-6f4b7f60",
              as: "p",
              children: [currentUser.hospital, " · ", currentUser.department]
            })]
          }), /* @__PURE__ */ jsx(Building2, {
            size: 22,
            color: "rgba(255,255,255,0.3)"
          })]
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            gap: "8px"
          },
          renderId: "render-7bc785b8",
          as: "div",
          children: [{
            label: "Pending",
            value: pendingCount,
            color: "#F39C12",
            bg: "rgba(243,156,18,0.2)"
          }, {
            label: "Matched",
            value: matchedCount,
            color: "#3B82F6",
            bg: "rgba(59,130,246,0.2)"
          }, {
            label: "Total Active",
            value: activeRequests.length,
            color: "#27AE60",
            bg: "rgba(39,174,96,0.2)"
          }].map(({
            label,
            value,
            color,
            bg
          }) => /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              flex: 1,
              backgroundColor: bg,
              borderRadius: "8px",
              padding: "10px 8px",
              textAlign: "center"
            },
            renderId: "render-24a89284",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "20px",
                fontWeight: "800",
                color,
                margin: "0 0 2px",
                lineHeight: 1
              },
              renderId: "render-042303b6",
              as: "p",
              children: value
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "9px",
                color: "rgba(255,255,255,0.5)",
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "0.04em"
              },
              renderId: "render-08eeb464",
              as: "p",
              children: label
            })]
          }, label))
        })]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          margin: "12px 12px 0",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        },
        renderId: "render-41aa14f8",
        as: "div",
        children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
          renderId: "render-b559e739",
          as: "button",
          children: [/* @__PURE__ */ jsx(Radio, {
            size: 20,
            color: "#FFFFFF"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "16px",
              fontWeight: "800",
              color: "#FFFFFF",
              letterSpacing: "0.04em"
            },
            renderId: "render-90c9620c",
            as: "span",
            children: "TRIGGER SOS BROADCAST"
          })]
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            gap: "8px"
          },
          renderId: "render-02fa339c",
          as: "div",
          children: /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
            renderId: "render-ed0ffb11",
            as: "button",
            children: [/* @__PURE__ */ jsx(Plus, {
              size: 16,
              color: "#C0392B"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "13px",
                fontWeight: "700",
                color: "#C0392B"
              },
              renderId: "render-7d9c1cd6",
              as: "span",
              children: "New Request"
            })]
          })
        })]
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          padding: "16px 12px 0"
        },
        renderId: "render-7caf34bd",
        as: "section",
        children: /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          },
          renderId: "render-41143229",
          as: "div",
          children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px"
            },
            renderId: "render-db3b999c",
            as: "div",
            children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
              renderId: "render-cec1264e",
              as: "div",
              children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                style: {
                  fontSize: "15px",
                  fontWeight: "800",
                  color: "#1A1A1A",
                  margin: "0 0 2px"
                },
                renderId: "render-42a22169",
                as: "h2",
                children: "Donor Check-In"
              }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                style: {
                  fontSize: "12px",
                  color: "#6B6B6B",
                  margin: 0
                },
                renderId: "render-ea744d58",
                as: "p",
                children: "Verify the donor identity and OTP before marking arrival."
              })]
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
              renderId: "render-284282b9",
              as: "button",
              children: /* @__PURE__ */ jsx(RefreshCw, {
                size: 16,
                color: "#1A1A1A",
                style: {
                  animation: matchesLoading ? "spin 1s linear infinite" : "none"
                }
              })
            })]
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
            renderId: "render-3f0002de",
            as: "select",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              value: "",
              renderId: "render-0a712c60",
              as: "option",
              children: matchesLoading ? "Loading accepted matches..." : "Select accepted donor match"
            }), acceptedMatches.map((match) => /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
              value: match.id,
              renderId: "render-31c5b3a4",
              as: "option",
              children: [match.donor?.full_name ?? "Assigned donor", " ·", " ", match.request?.blood_type_needed ?? "Blood", " · ", match.id]
            }, match.id))]
          }), selectedMatch && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              backgroundColor: "#F4F4F4",
              borderRadius: "8px",
              padding: "10px 12px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px"
            },
            renderId: "render-0ece3b50",
            as: "div",
            children: [["Donor", selectedMatch.donor?.full_name], ["Phone", selectedMatch.donor?.phone], ["Blood", selectedMatch.donor?.blood_type], ["Request", selectedMatch.request?.patient_ref]].map(([label, value]) => /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
              renderId: "render-d6859d94",
              as: "div",
              children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                style: {
                  fontSize: "10px",
                  fontWeight: "700",
                  color: "#6B6B6B",
                  margin: "0 0 2px",
                  textTransform: "uppercase"
                },
                renderId: "render-1126680b",
                as: "p",
                children: label
              }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                style: {
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#1A1A1A",
                  margin: 0
                },
                renderId: "render-b63d2818",
                as: "p",
                children: value || "Not provided"
              })]
            }, label))
          }), selectedMatch && /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "8px"
            },
            renderId: "render-b4e5e420",
            as: "div",
            children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
              style: {
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px"
              },
              renderId: "render-87d8297c",
              as: "div",
              children: [/* @__PURE__ */ jsx(SecondaryButton, {
                onClick: () => handleHospitalMatchStatus("arrived"),
                disabled: checkInLoading || Boolean(matchStatusLoading) || Boolean(selectedMatch.arrived_at),
                icon: MapPin,
                children: matchStatusLoading === "arrived" ? "Saving..." : "Mark Arrived"
              }), /* @__PURE__ */ jsx(PrimaryButton, {
                onClick: () => handleHospitalMatchStatus("blood_collected"),
                disabled: checkInLoading || Boolean(matchStatusLoading) || !selectedMatch.arrived_at || Boolean(selectedMatch.blood_collected_at),
                icon: Droplets,
                children: matchStatusLoading === "blood_collected" ? "Saving..." : "Blood Collected"
              })]
            }), /* @__PURE__ */ jsx(PrimaryButton, {
              onClick: () => handleHospitalMatchStatus("donation_completed"),
              disabled: checkInLoading || Boolean(matchStatusLoading) || !selectedMatch.blood_collected_at || Boolean(selectedMatch.donation_completed_at),
              icon: CheckCircle2,
              children: matchStatusLoading === "donation_completed" ? "Saving..." : "Donation Completed"
            })]
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
            },
            renderId: "render-7fa08466",
            as: "input"
          }), checkInError && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              margin: 0,
              borderRadius: "8px",
              backgroundColor: "#FADBD8",
              color: "#922B21",
              fontSize: "12px",
              fontWeight: "700",
              padding: "10px 12px"
            },
            renderId: "render-bdd1ac6b",
            as: "p",
            children: checkInError
          }), checkInSuccess && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              margin: 0,
              borderRadius: "8px",
              backgroundColor: "#D5F5E3",
              color: "#1E8449",
              fontSize: "12px",
              fontWeight: "700",
              padding: "10px 12px"
            },
            renderId: "render-92a41627",
            as: "p",
            children: checkInSuccess
          }), /* @__PURE__ */ jsx(PrimaryButton, {
            onClick: handleVerifyCheckIn,
            disabled: checkInLoading || !checkInMatchId || checkInOtp.length !== 6,
            icon: checkInLoading ? RefreshCw : CheckCircle2,
            children: checkInLoading ? "Verifying..." : "Verify Check-In"
          })]
        })
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          padding: "20px 12px 0"
        },
        renderId: "render-d8ed966f",
        as: "section",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            fontSize: "15px",
            fontWeight: "700",
            color: "#1A1A1A",
            margin: "0 0 12px"
          },
          renderId: "render-329f5f70",
          as: "h2",
          children: "Status Pipeline"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            gap: "6px",
            overflowX: "auto",
            paddingBottom: "4px"
          },
          renderId: "render-6a6ef306",
          as: "div",
          children: [{
            status: REQUEST_STATUS.PENDING,
            label: "Pending"
          }, {
            status: REQUEST_STATUS.VERIFIED,
            label: "Verified"
          }, {
            status: REQUEST_STATUS.DONOR_MATCHED,
            label: "Matched"
          }, {
            status: REQUEST_STATUS.CHECKED_IN,
            label: "Checked In"
          }, {
            status: REQUEST_STATUS.BLOOD_COLLECTED,
            label: "Collected"
          }, {
            status: REQUEST_STATUS.FULFILLED,
            label: "Completed"
          }, {
            status: REQUEST_STATUS.CANCELLED,
            label: "Cancelled"
          }].map(({
            status,
            label
          }) => {
            const count = bloodRequests.filter((r) => r.status === status).length;
            return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                flexShrink: 0,
                minWidth: "64px"
              },
              renderId: "render-656fe850",
              as: "div",
              children: [/* @__PURE__ */ jsx(RequestStatusBadge, {
                status,
                size: "sm"
              }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                style: {
                  fontSize: "16px",
                  fontWeight: "800",
                  color: "#1A1A1A"
                },
                renderId: "render-a6be24dc",
                as: "span",
                children: count
              })]
            }, status);
          })
        })]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          padding: "20px 12px 0"
        },
        renderId: "render-063b9f19",
        as: "section",
        children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px"
          },
          renderId: "render-e7acf794",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "15px",
              fontWeight: "700",
              color: "#1A1A1A",
              margin: 0
            },
            renderId: "render-d88476b8",
            as: "h2",
            children: "All Active Requests"
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              fontSize: "11px",
              fontWeight: "600",
              color: "#C0392B",
              backgroundColor: "#FADBD8",
              paddingInline: "8px",
              paddingBlock: "3px",
              borderRadius: "999px"
            },
            renderId: "render-ca8b9153",
            as: "span",
            children: [activeRequests.length, " open"]
          })]
        }), activeRequests.length === 0 ? /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
          renderId: "render-68642063",
          as: "div",
          children: [/* @__PURE__ */ jsx(ClipboardList, {
            size: 48,
            color: "#C8C8C8",
            strokeWidth: 1.5,
            style: {
              marginBottom: "12px"
            }
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "14px",
              fontWeight: "600",
              color: "#6B6B6B",
              margin: "0 0 4px",
              textAlign: "center"
            },
            renderId: "render-44891b9f",
            as: "p",
            children: "No active requests"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "12px",
              color: "#C8C8C8",
              margin: 0,
              textAlign: "center",
              lineHeight: "1.5"
            },
            renderId: "render-46a76def",
            as: "p",
            children: 'Tap "New Request" or "TRIGGER SOS BROADCAST" above to create your first blood procurement request.'
          })]
        }) : /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          },
          renderId: "render-a39e025d",
          as: "div",
          children: activeRequests.map((req) => /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            renderId: "render-eca561a9",
            as: "div",
            children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
              style: {
                position: "relative"
              },
              renderId: "render-2956e8cf",
              as: "div",
              children: [/* @__PURE__ */ jsx(RequestCard, {
                request: req,
                onClick: () => navigate(`/requests/${req.id}`)
              }), canDeleteRequest(req) && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
                renderId: "render-62913b2e",
                as: "button",
                children: /* @__PURE__ */ jsx(Trash2, {
                  size: 15
                })
              })]
            }), ![REQUEST_STATUS.FULFILLED, REQUEST_STATUS.CANCELLED].includes(req.status) && /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
              renderId: "render-4dbfff8c",
              as: "div",
              children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                style: {
                  fontSize: "11px",
                  color: "#6B6B6B",
                  flexShrink: 0
                },
                renderId: "render-8e9b4cb1",
                as: "span",
                children: "Advance:"
              }), [{
                label: "Verify",
                next: REQUEST_STATUS.VERIFIED,
                from: REQUEST_STATUS.PENDING
              }, {
                label: "Matched",
                next: REQUEST_STATUS.DONOR_MATCHED,
                from: REQUEST_STATUS.VERIFIED
              }, {
                label: "Collected",
                next: REQUEST_STATUS.BLOOD_COLLECTED,
                from: REQUEST_STATUS.CHECKED_IN
              }, {
                label: "Complete",
                next: REQUEST_STATUS.FULFILLED,
                from: REQUEST_STATUS.BLOOD_COLLECTED
              }, {
                label: "Cancel",
                next: REQUEST_STATUS.CANCELLED,
                from: req.status
              }].filter((a) => a.from === req.status).map(({
                label,
                next
              }) => /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
                renderId: "render-2e7c0fc2",
                as: "button",
                children: statusAction.loading && statusAction.id === req.id ? "Saving..." : label
              }, next))]
            }), statusAction.id === req.id && (statusAction.error || statusAction.success) && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                margin: "6px 0 0",
                borderRadius: "8px",
                backgroundColor: statusAction.error ? "#FADBD8" : "#D5F5E3",
                color: statusAction.error ? "#922B21" : "#1E8449",
                fontSize: "12px",
                fontWeight: "700",
                padding: "8px 10px"
              },
              renderId: "render-b510de1e",
              as: "p",
              children: statusAction.error ?? statusAction.success
            })]
          }, req.id))
        })]
      }), bloodRequests.filter((r) => r.status === REQUEST_STATUS.FULFILLED).length > 0 && /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          padding: "20px 12px"
        },
        renderId: "render-5ed21be1",
        as: "section",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            fontSize: "14px",
            fontWeight: "700",
            color: "#6B6B6B",
            margin: "0 0 10px"
          },
          renderId: "render-3e18b072",
          as: "h2",
          children: "Completed"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            opacity: 0.65
          },
          renderId: "render-9a86ee33",
          as: "div",
          children: bloodRequests.filter((r) => r.status === REQUEST_STATUS.FULFILLED).map((req) => /* @__PURE__ */ jsx(RequestCard, {
            request: req,
            onClick: () => navigate(`/requests/${req.id}`)
          }, req.id))
        })]
      })]
    }), /* @__PURE__ */ jsx(BottomNavBar, {
      onNavigate: (key) => {
        if (typeof window === "undefined") return;
        if (key === "home") navigate("/hospital/dashboard");
        if (key === "profile") navigate("/profile");
      }
    }), showSheet && /* @__PURE__ */ jsx(NewRequestSheet, {
      onClose: () => setShowSheet(false),
      onSubmit: handleNewRequest,
      isSOS: sheetIsSOS
    }), /* @__PURE__ */ jsx("style", {
      jsx: true,
      global: true,
      children: `
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
      `
    })]
  });
}
const page$9 = UNSAFE_withComponentProps(function WrappedPage18(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(HospitalDashboardPage, {
      ...props
    })
  });
});
const route18 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$9
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
  const {
    login
  } = useApp();
  const navigate = useNavigate$1();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
      const {
        user,
        token
      } = await apiLogin({
        email: email.trim(),
        password,
        rememberMe
      });
      login({
        user,
        token
      });
      setLoading(false);
      setDone(true);
      const destination = ROLE_ROUTE_MAP[user.role] ?? "/dashboard";
      navigate(destination);
    } catch (err) {
      setError(err?.status === 401 ? "Incorrect email or password. Please try again." : err?.message ?? "Sign-in failed. Please try again.");
      setLoading(false);
    }
  };
  const ctaLabel = done ? "Signed In!" : loading ? "Signing in…" : "Sign In";
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      style: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: "100vh"
      },
      renderId: "render-70ad153c",
      as: "div",
      children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
        renderId: "render-3ec0a5ec",
        as: "header",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
          renderId: "render-9bcf6340",
          as: "a",
          children: /* @__PURE__ */ jsx(ChevronLeft, {
            size: 20,
            color: "#1A1A1A"
          })
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            fontSize: "16px",
            fontWeight: "700",
            color: "#1A1A1A"
          },
          renderId: "render-156d6e64",
          as: "span",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              color: "#C0392B"
            },
            renderId: "render-9ee26417",
            as: "span",
            children: "Lyfe"
          }), "Blood"]
        })]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          flex: 1,
          padding: "28px 16px 40px",
          display: "flex",
          flexDirection: "column"
        },
        renderId: "render-a096502b",
        as: "div",
        children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            marginBottom: "24px"
          },
          renderId: "render-0cbf80b7",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "24px",
              fontWeight: "800",
              color: "#1A1A1A",
              margin: "0 0 6px",
              letterSpacing: "-0.02em"
            },
            renderId: "render-fa2a2d41",
            as: "h1",
            children: "Welcome Back"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "14px",
              color: "#4A4A4A",
              margin: 0,
              lineHeight: "1.5"
            },
            renderId: "render-5da437d8",
            as: "p",
            children: "Enter your credentials to continue."
          })]
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
          renderId: "render-f66f81c2",
          as: "form",
          children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            renderId: "render-47040f1b",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                color: "#4A4A4A",
                marginBottom: "6px"
              },
              renderId: "render-9ff5b919",
              as: "label",
              children: "Email Address"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: inputStyle$2,
              type: "email",
              placeholder: "you@example.com",
              value: email,
              autoComplete: "email",
              onChange: (e) => {
                setEmail(e.target.value);
                setError(null);
              },
              renderId: "render-f0a6ca01",
              as: "input"
            })]
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            renderId: "render-5ba0fd35",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                color: "#4A4A4A",
                marginBottom: "6px"
              },
              renderId: "render-7f9d78b4",
              as: "label",
              children: "Password"
            }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
              style: {
                position: "relative"
              },
              renderId: "render-5c27693c",
              as: "div",
              children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                style: {
                  ...inputStyle$2,
                  paddingRight: "48px"
                },
                type: showPassword ? "text" : "password",
                placeholder: "Your password",
                value: password,
                autoComplete: "current-password",
                onChange: (e) => {
                  setPassword(e.target.value);
                  setError(null);
                },
                renderId: "render-3ad87004",
                as: "input"
              }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
                renderId: "render-31213aa2",
                as: "button",
                children: showPassword ? /* @__PURE__ */ jsx(EyeOff, {
                  size: 18
                }) : /* @__PURE__ */ jsx(Eye, {
                  size: 18
                })
              })]
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
              renderId: "render-fbe0738d",
              as: "button",
              children: "Forgot password?"
            })]
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#4A4A4A",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer"
            },
            renderId: "render-e6251f31",
            as: "label",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              type: "checkbox",
              checked: rememberMe,
              onChange: (e) => setRememberMe(e.target.checked),
              style: {
                width: "16px",
                height: "16px",
                accentColor,
                cursor: "pointer"
              },
              renderId: "render-7e5afb76",
              as: "input"
            }), "Remember me"]
          }), error && /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              backgroundColor: "#FADBD8",
              border: "1px solid #F1948A",
              borderRadius: "10px",
              padding: "12px 14px"
            },
            renderId: "render-94b21cdb",
            as: "div",
            children: [/* @__PURE__ */ jsx(AlertCircle, {
              size: 16,
              color: "#922B21",
              style: {
                flexShrink: 0,
                marginTop: "1px"
              }
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "13px",
                color: "#922B21",
                fontWeight: "600",
                margin: 0,
                lineHeight: "1.5"
              },
              renderId: "render-60ca0ee4",
              as: "p",
              children: error
            })]
          }), /* @__PURE__ */ jsx(PrimaryButton, {
            type: "submit",
            disabled: !canSubmit,
            icon: done ? CheckCircle2 : ArrowRight,
            children: ctaLabel
          })]
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            textAlign: "center",
            fontSize: "13px",
            color: "#4A4A4A",
            marginTop: "20px"
          },
          renderId: "render-309fa71a",
          as: "p",
          children: ["Don't have an account?", " ", /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            href: "/register",
            style: {
              color: "#C0392B",
              fontWeight: "700",
              textDecoration: "none"
            },
            renderId: "render-21b4c390",
            as: "a",
            children: "Create one"
          })]
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            textAlign: "center",
            fontSize: "11px",
            color: "#6B6B6B",
            marginTop: "12px",
            lineHeight: "1.5"
          },
          renderId: "render-764b4e5c",
          as: "p",
          children: "By continuing, you acknowledge that LyfeBlood facilitates donor matching only. All clinical decisions remain with licensed medical staff."
        })]
      })]
    }), /* @__PURE__ */ jsx("style", {
      jsx: true,
      global: true,
      children: `
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
      `
    })]
  });
}
const page$8 = UNSAFE_withComponentProps(function WrappedPage19(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(LoginPage, {
      ...props
    })
  });
});
const route19 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$8
}, Symbol.toStringTag, { value: "Module" }));
const QUICK_REPLIES$1 = [{
  quick_type: "on_the_way",
  label: "I'm on my way"
}, {
  quick_type: "delayed",
  label: "I'm delayed"
}, {
  quick_type: "arrived",
  label: "I've arrived"
}];
function MatchChatPage() {
  const navigate = useNavigate$1();
  const {
    matchId
  } = useParams();
  const {
    currentUser,
    isAuthenticated,
    markAllNotificationsRead
  } = useApp();
  const [messages, setMessages] = useState([]);
  const [request, setRequest] = useState(null);
  const [participantRole, setParticipantRole] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const loadChat = async ({
    silent = false
  } = {}) => {
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
    const interval = window.setInterval(() => loadChat({
      silent: true
    }), 15e3);
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
      const {
        message
      } = await apiSendMatchChatMessage({
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
  return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
    style: {
      minHeight: "100vh",
      backgroundColor: "#F7F3F1",
      display: "flex",
      flexDirection: "column"
    },
    renderId: "render-673152f9",
    as: "div",
    children: [/* @__PURE__ */ jsx(TopAppBar, {
      title: "Care Chat",
      onBellPress: markAllNotificationsRead
    }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      style: {
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        flex: 1
      },
      renderId: "render-99bd728f",
      as: "div",
      children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
        renderId: "render-b139dcf7",
        as: "button",
        children: /* @__PURE__ */ jsx(ChevronLeft, {
          size: 20,
          color: "#1A1A1A"
        })
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          backgroundColor: "#FFFFFF",
          borderRadius: "8px",
          padding: "14px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
        },
        renderId: "render-95250188",
        as: "section",
        children: /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            alignItems: "center",
            gap: "8px"
          },
          renderId: "render-c382589c",
          as: "div",
          children: [/* @__PURE__ */ jsx(MessageCircle, {
            size: 18,
            color: "#C0392B"
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            renderId: "render-147ab053",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                margin: 0,
                fontSize: "16px",
                fontWeight: "800",
                color: "#1A1A1A"
              },
              renderId: "render-a614cd19",
              as: "h1",
              children: title
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                margin: "2px 0 0",
                fontSize: "12px",
                color: "#6B6B6B"
              },
              renderId: "render-c15d2c39",
              as: "p",
              children: participantRole === "donor" ? "Accepted donor" : "Matched patient"
            })]
          })]
        })
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
        renderId: "render-91d3dd36",
        as: "section",
        children: loading ? /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            margin: "auto",
            fontSize: "14px",
            color: "#6B6B6B",
            fontWeight: "600"
          },
          renderId: "render-d278e0ea",
          as: "p",
          children: "Loading chat..."
        }) : error ? /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            margin: "auto",
            fontSize: "14px",
            color: "#922B21",
            fontWeight: "700",
            textAlign: "center"
          },
          renderId: "render-8d5711a8",
          as: "p",
          children: error
        }) : messages.length === 0 ? /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            margin: "auto",
            fontSize: "14px",
            color: "#6B6B6B",
            fontWeight: "600",
            textAlign: "center"
          },
          renderId: "render-c9e28ea7",
          as: "p",
          children: "No messages yet."
        }) : messages.map((message) => {
          const mine = message.sender_id === currentUser.id;
          return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              alignSelf: mine ? "flex-end" : "flex-start",
              maxWidth: "82%",
              backgroundColor: mine ? "#C0392B" : "#F4F4F4",
              color: mine ? "#FFFFFF" : "#1A1A1A",
              borderRadius: "8px",
              padding: "10px 12px"
            },
            renderId: "render-f57c8a86",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                margin: 0,
                fontSize: "14px",
                fontWeight: "600",
                lineHeight: "1.4"
              },
              renderId: "render-7bc33cdd",
              as: "p",
              children: message.message
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                margin: "4px 0 0",
                fontSize: "10px",
                opacity: 0.72
              },
              renderId: "render-96a17a91",
              as: "p",
              children: new Date(message.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })
            })]
          }, message.id);
        })
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "8px"
        },
        renderId: "render-afde09ac",
        as: "div",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            gap: "8px",
            overflowX: "auto"
          },
          renderId: "render-4fd186c1",
          as: "div",
          children: QUICK_REPLIES$1.map((reply) => /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            onClick: () => sendMessage({
              quick_type: reply.quick_type
            }),
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
            renderId: "render-2cc41048",
            as: "button",
            children: reply.label
          }, reply.quick_type))
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            gap: "8px"
          },
          renderId: "render-03106117",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
            },
            renderId: "render-e4e29535",
            as: "input"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            onClick: () => sendMessage({
              message: text
            }),
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
            renderId: "render-b24d6451",
            as: "button",
            children: /* @__PURE__ */ jsx(Send, {
              size: 18
            })
          })]
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px"
          },
          renderId: "render-8017ce62",
          as: "div",
          children: [/* @__PURE__ */ jsx(SecondaryButton, {
            onClick: () => navigate(-1),
            icon: ChevronLeft,
            children: "Back"
          }), /* @__PURE__ */ jsx(PrimaryButton, {
            onClick: () => navigate(`/matches/${matchId}/tracking`),
            icon: Navigation,
            children: "Tracking"
          })]
        })]
      })]
    })]
  });
}
const page$7 = UNSAFE_withComponentProps(function WrappedPage20(props) {
  const params = useParams();
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(MatchChatPage, {
      ...props,
      matchId: params.matchId
    })
  });
});
const route20 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$7
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
  const {
    matchId
  } = useParams();
  const {
    currentUser,
    isAuthenticated,
    markAllNotificationsRead
  } = useApp();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const loadTracking = async ({
    silent = false
  } = {}) => {
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
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const {
          location
        } = await apiUpdateMatchTracking({
          match_id: matchId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          status
        });
        setTracking((current) => ({
          ...current,
          latest_location: location,
          locations: [location, ...current?.locations ?? []],
          match: status === "arrived" ? {
            ...current?.match ?? {},
            arrived_at: (/* @__PURE__ */ new Date()).toISOString()
          } : {
            ...current?.match ?? {},
            on_the_way_at: current?.match?.on_the_way_at ?? (/* @__PURE__ */ new Date()).toISOString()
          }
        }));
        setSuccess(status === "arrived" ? "Arrival shared." : "Location updated.");
        if (status === "arrived") setSharing(false);
      } catch (err) {
        setError(err?.message ?? "Unable to update location");
      } finally {
        setUpdating(false);
      }
    }, () => {
      setUpdating(false);
      setError("Location permission is required to update tracking");
    }, {
      enableHighAccuracy: true,
      timeout: 1e4,
      maximumAge: 15e3
    });
  };
  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);
  useEffect(() => {
    if (!isAuthenticated || !matchId) return void 0;
    loadTracking();
    const interval = window.setInterval(() => loadTracking({
      silent: true
    }), 15e3);
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
  return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
    style: {
      minHeight: "100vh",
      backgroundColor: "#F7F3F1",
      display: "flex",
      flexDirection: "column"
    },
    renderId: "render-b0c58c19",
    as: "div",
    children: [/* @__PURE__ */ jsx(TopAppBar, {
      title: "Donor Tracking",
      onBellPress: markAllNotificationsRead
    }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      style: {
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        flex: 1
      },
      renderId: "render-b5b2885c",
      as: "div",
      children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
        renderId: "render-9aa0310e",
        as: "button",
        children: /* @__PURE__ */ jsx(ChevronLeft, {
          size: 20,
          color: "#1A1A1A"
        })
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          backgroundColor: "#FFFFFF",
          borderRadius: "8px",
          padding: "14px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        },
        renderId: "render-6721639b",
        as: "section",
        children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            alignItems: "center",
            gap: "8px"
          },
          renderId: "render-cbf2b77a",
          as: "div",
          children: [/* @__PURE__ */ jsx(Navigation, {
            size: 18,
            color: "#C0392B"
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            renderId: "render-5f4e1460",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                margin: 0,
                fontSize: "16px",
                fontWeight: "800",
                color: "#1A1A1A"
              },
              renderId: "render-75eed516",
              as: "h1",
              children: title
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                margin: "2px 0 0",
                fontSize: "12px",
                color: "#6B6B6B"
              },
              renderId: "render-2c878cc1",
              as: "p",
              children: loading ? "Loading route..." : latestLocation ? "Live donor progress" : "Waiting for donor location"
            })]
          })]
        }), error && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            margin: 0,
            color: "#922B21",
            fontSize: "12px",
            fontWeight: "700"
          },
          renderId: "render-7a8846f1",
          as: "p",
          children: error
        }), success && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            margin: 0,
            color: "#1E8449",
            fontSize: "12px",
            fontWeight: "700"
          },
          renderId: "render-9c33b5f4",
          as: "p",
          children: success
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            height: "220px",
            borderRadius: "8px",
            backgroundColor: "#EBF3EF",
            border: "1px solid #D8E8E0",
            position: "relative",
            overflow: "hidden"
          },
          renderId: "render-2664b7e0",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              position: "absolute",
              left: "12%",
              right: "12%",
              top: "50%",
              height: "8px",
              borderRadius: "999px",
              backgroundColor: "#D5DBDB"
            },
            renderId: "render-398b8b6d",
            as: "div"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              position: "absolute",
              left: "12%",
              top: "50%",
              width: `${Math.max(8, percent * 0.76)}%`,
              height: "8px",
              borderRadius: "999px",
              backgroundColor: "#27AE60"
            },
            renderId: "render-3a4b4ee6",
            as: "div"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
            renderId: "render-3c387e8a",
            as: "div",
            children: /* @__PURE__ */ jsx(MapPin, {
              size: 20,
              color: "#FFFFFF"
            })
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              position: "absolute",
              left: "10%",
              bottom: "46px",
              fontSize: "11px",
              fontWeight: "800",
              color: "#566573"
            },
            renderId: "render-b132939d",
            as: "span",
            children: "Donor"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              position: "absolute",
              right: "8%",
              bottom: "46px",
              fontSize: "11px",
              fontWeight: "800",
              color: "#566573"
            },
            renderId: "render-6b4abbee",
            as: "span",
            children: "Hospital"
          })]
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "8px"
          },
          renderId: "render-b622bf96",
          as: "div",
          children: [{
            label: "Distance",
            value: formatDistance(latestLocation?.distance_km)
          }, {
            label: "ETA",
            value: formatEta(latestLocation?.eta_minutes)
          }, {
            label: "Status",
            value: latestLocation?.status?.replaceAll("_", " ") ?? "waiting"
          }].map((item) => /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              backgroundColor: "#F8F8F8",
              borderRadius: "8px",
              padding: "10px",
              textAlign: "center"
            },
            renderId: "render-7905591e",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                margin: "0 0 3px",
                fontSize: "10px",
                color: "#6B6B6B",
                fontWeight: "800",
                textTransform: "uppercase"
              },
              renderId: "render-68e087d4",
              as: "p",
              children: item.label
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                margin: 0,
                fontSize: "14px",
                color: "#1A1A1A",
                fontWeight: "800",
                textTransform: item.label === "Status" ? "capitalize" : "none"
              },
              renderId: "render-5e896e11",
              as: "p",
              children: item.value
            })]
          }, item.label))
        })]
      }), /* @__PURE__ */ jsx(DonationJourney, {
        request,
        match
      }), isDonor && /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          backgroundColor: "#FFFFFF",
          borderRadius: "8px",
          padding: "14px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        },
        renderId: "render-daa9273a",
        as: "section",
        children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            alignItems: "center",
            gap: "8px"
          },
          renderId: "render-71073847",
          as: "div",
          children: [/* @__PURE__ */ jsx(Radio, {
            size: 18,
            color: "#C0392B"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              margin: 0,
              fontSize: "15px",
              color: "#1A1A1A",
              fontWeight: "800"
            },
            renderId: "render-ed6b069f",
            as: "h2",
            children: "Share Location"
          })]
        }), /* @__PURE__ */ jsx(PrimaryButton, {
          onClick: () => setSharing((value) => !value),
          disabled: updating || latestLocation?.status === "arrived",
          icon: Navigation,
          children: sharing ? "Stop Sharing" : "Start Live Updates"
        }), /* @__PURE__ */ jsx(SecondaryButton, {
          onClick: () => updateLocation("arrived"),
          disabled: updating || latestLocation?.status === "arrived",
          icon: MapPin,
          children: updating ? "Updating..." : "I've Arrived"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            margin: 0,
            fontSize: "11px",
            color: "#6B6B6B",
            lineHeight: "1.5"
          },
          renderId: "render-ddaf4e76",
          as: "p",
          children: "Live updates run every 20 seconds while you are traveling and stop after arrival."
        })]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px"
        },
        renderId: "render-5435a909",
        as: "div",
        children: [/* @__PURE__ */ jsx(SecondaryButton, {
          onClick: () => navigate(`/matches/${matchId}/chat`),
          icon: MessageCircle,
          children: "Chat"
        }), isDonor ? /* @__PURE__ */ jsx(PrimaryButton, {
          onClick: () => navigate(`/donor/match/${matchId}/checkin`),
          icon: MapPin,
          children: "Check-in OTP"
        }) : /* @__PURE__ */ jsx(PrimaryButton, {
          onClick: () => loadTracking(),
          icon: Radio,
          children: "Refresh"
        })]
      })]
    })]
  });
}
const page$6 = UNSAFE_withComponentProps(function WrappedPage21(props) {
  const params = useParams();
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(MatchTrackingPage, {
      ...props,
      matchId: params.matchId
    })
  });
});
const route21 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$6
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
function Field$1({
  label,
  children
}) {
  return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "6px"
    },
    renderId: "render-e58e20b0",
    as: "div",
    children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
      style: {
        fontSize: "13px",
        fontWeight: "600",
        color: "#1A1A1A"
      },
      renderId: "render-03cc86b2",
      as: "label",
      children: label
    }), children]
  });
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
  const [loggingOut, setLoggingOut] = useState(false);
  const logoutInFlightRef = useRef(false);
  const [error, setError] = useState(null);
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
  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    setError(null);
    setDone(false);
    setSuccessMessage("Profile updated.");
    try {
      const {
        data: user,
        error: updateError
      } = await supabase.from("users").update({
        full_name: form.fullName.trim(),
        phone: form.phone.trim() || null,
        blood_type: form.bloodGroup || null,
        location: form.location.trim() || null,
        availability_status: form.isAvailable ? 1 : 0
      }).eq("id", currentUser.id).select("id, full_name, email, phone, role, blood_type, location, availability_status, is_verified, last_donation_at, created_at").single();
      if (updateError) throw updateError;
      updateCurrentUser({
        ...user,
        name: user.full_name,
        bloodGroup: user.blood_type,
        isAvailable: !!user.availability_status
      });
      if (roleChanged) {
        const {
          error: roleChangeError
        } = await supabase.rpc("request_role_change", {
          target_role: form.role
        });
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
  const handleLogout = async () => {
    if (logoutInFlightRef.current) return;
    logoutInFlightRef.current = true;
    setLoggingOut(true);
    setError(null);
    setDone(false);
    try {
      await logout();
      navigate("/login", {
        replace: true
      });
    } catch (e) {
      setError(e?.message ?? "Failed to log out. Please try again.");
    } finally {
      logoutInFlightRef.current = false;
      setLoggingOut(false);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      style: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        paddingBottom: "80px"
      },
      renderId: "render-d79236d5",
      as: "div",
      children: [/* @__PURE__ */ jsx(TopAppBar, {
        title: "Profile",
        onBellPress: markAllNotificationsRead
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          padding: "16px 12px 20px"
        },
        renderId: "render-4a5bcd52",
        as: "div",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
          renderId: "render-7a01befe",
          as: "button",
          children: /* @__PURE__ */ jsx(ChevronLeft, {
            size: 20,
            color: "#1A1A1A"
          })
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            padding: "18px 16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          },
          renderId: "render-536af6d1",
          as: "div",
          children: [/* @__PURE__ */ jsx(Field$1, {
            label: "Full Name",
            children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: inputStyle$1,
              type: "text",
              value: form.fullName,
              onChange: (e) => setForm((f) => ({
                ...f,
                fullName: e.target.value
              })),
              renderId: "render-c4a83099",
              as: "input"
            })
          }), /* @__PURE__ */ jsx(Field$1, {
            label: "Blood Type",
            children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                display: "flex",
                flexWrap: "wrap",
                gap: "8px"
              },
              renderId: "render-a7a788e9",
              as: "div",
              children: BLOOD_GROUPS$1.map((group) => /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                type: "button",
                onClick: () => setForm((f) => ({
                  ...f,
                  bloodGroup: group
                })),
                style: {
                  background: "none",
                  border: `2px solid ${form.bloodGroup === group ? "#C0392B" : "#C8C8C8"}`,
                  borderRadius: "8px",
                  padding: 0,
                  cursor: "pointer",
                  boxShadow: form.bloodGroup === group ? "0 0 0 3px #FADBD8" : "none"
                },
                renderId: "render-fb650e39",
                as: "button",
                children: /* @__PURE__ */ jsx(BloodGroupTag, {
                  group,
                  size: "md"
                })
              }, group))
            })
          }), /* @__PURE__ */ jsx(Field$1, {
            label: "Location",
            children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: inputStyle$1,
              type: "text",
              value: form.location,
              onChange: (e) => setForm((f) => ({
                ...f,
                location: e.target.value
              })),
              renderId: "render-84ff04f5",
              as: "input"
            })
          }), /* @__PURE__ */ jsx(Field$1, {
            label: "Phone / Contact",
            children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: inputStyle$1,
              type: "tel",
              value: form.phone,
              onChange: (e) => setForm((f) => ({
                ...f,
                phone: e.target.value
              })),
              renderId: "render-8c1086f1",
              as: "input"
            })
          }), /* @__PURE__ */ jsx(Field$1, {
            label: "Role",
            children: isHospitalAccount ? /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
              renderId: "render-5f9278c3",
              as: "div",
              children: ["Hospital", /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                style: {
                  margin: "4px 0 0",
                  fontSize: "12px",
                  fontWeight: "500",
                  color: "#6B6B6B",
                  lineHeight: "1.4"
                },
                renderId: "render-96d54573",
                as: "p",
                children: "Hospital accounts cannot switch into donor or patient mode from profile."
              })]
            }) : /* @__PURE__ */ jsxs(Fragment, {
              children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                style: {
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px"
                },
                renderId: "render-1a92b353",
                as: "div",
                children: [{
                  value: "donor",
                  label: "Donor",
                  Icon: Droplets
                }, {
                  value: "requester",
                  label: "Patient / Family",
                  Icon: User
                }].map(({
                  value,
                  label,
                  Icon
                }) => {
                  const active = form.role === value;
                  return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
                    type: "button",
                    onClick: () => {
                      setForm((f) => ({
                        ...f,
                        role: value
                      }));
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
                    renderId: "render-5386747b",
                    as: "button",
                    children: [/* @__PURE__ */ jsx(Icon, {
                      size: 16
                    }), label]
                  }, value);
                })
              }), roleChanged && /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
                renderId: "render-07c2c7e1",
                as: "label",
                children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                  type: "checkbox",
                  checked: roleSwitchConfirmed,
                  onChange: (e) => setRoleSwitchConfirmed(e.target.checked),
                  style: {
                    width: "18px",
                    height: "18px",
                    accentColor: "#C0392B",
                    flexShrink: 0
                  },
                  renderId: "render-586c59a5",
                  as: "input"
                }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                  style: {
                    fontSize: "12px",
                    color: "#9A3412",
                    lineHeight: "1.5"
                  },
                  renderId: "render-d26c0a5d",
                  as: "span",
                  children: "I understand this changes my active app mode and the screens I use after saving."
                })]
              })]
            })
          }), form.role === "donor" && !form.bloodGroup && /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              backgroundColor: "#FADBD8",
              border: "1px solid #F1948A",
              borderRadius: "8px",
              padding: "12px 14px"
            },
            renderId: "render-c9cf98b8",
            as: "div",
            children: [/* @__PURE__ */ jsx(AlertTriangle, {
              size: 16,
              color: "#922B21",
              style: {
                flexShrink: 0,
                marginTop: "1px"
              }
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "12px",
                color: "#922B21",
                fontWeight: "600",
                lineHeight: "1.5"
              },
              renderId: "render-5503ba52",
              as: "span",
              children: "Blood type is required before using donor mode."
            })]
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
            renderId: "render-64f9bcf1",
            as: "label",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "13px",
                fontWeight: "600",
                color: "#1A1A1A"
              },
              renderId: "render-eacd5961",
              as: "span",
              children: "Availability"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              type: "checkbox",
              checked: form.isAvailable,
              onChange: (e) => setForm((f) => ({
                ...f,
                isAvailable: e.target.checked
              })),
              style: {
                width: "18px",
                height: "18px",
                accentColor: "#C0392B"
              },
              renderId: "render-b6a6186a",
              as: "input"
            })]
          }), error && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              backgroundColor: "#FADBD8",
              border: "1px solid #F1948A",
              borderRadius: "8px",
              padding: "12px 14px",
              fontSize: "13px",
              color: "#922B21",
              fontWeight: "600"
            },
            renderId: "render-7b6df96d",
            as: "div",
            children: error
          }), done && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              backgroundColor: "#D5F5E3",
              border: "1px solid #A9DFBF",
              borderRadius: "8px",
              padding: "12px 14px",
              fontSize: "13px",
              color: "#1E8449",
              fontWeight: "600"
            },
            renderId: "render-b07c46ff",
            as: "div",
            children: successMessage
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              display: "flex",
              gap: "10px"
            },
            renderId: "render-ddafb794",
            as: "div",
            children: [/* @__PURE__ */ jsx(SecondaryButton, {
              onClick: () => navigate(-1),
              style: {
                flex: 1
              },
              children: "Cancel"
            }), /* @__PURE__ */ jsx(PrimaryButton, {
              onClick: handleSave,
              disabled: !canSave || saving,
              icon: CheckCircle2,
              style: {
                flex: 1
              },
              children: saving ? "Saving..." : "Save Changes"
            })]
          }), /* @__PURE__ */ jsx(SecondaryButton, {
            onClick: handleLogout,
            disabled: loggingOut,
            icon: LogOut,
            children: loggingOut ? "Logging out..." : "Logout"
          })]
        })]
      })]
    }), /* @__PURE__ */ jsx(BottomNavBar, {
      onNavigate: (key) => {
        if (key === "home") navigate(ROLE_HOME_ROUTE$2[normalizeProfileRole(currentUser.role)] ?? "/dashboard");
        if (key === "profile") navigate("/profile");
      }
    })]
  });
}
const page$5 = UNSAFE_withComponentProps(function WrappedPage22(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(ProfilePage, {
      ...props
    })
  });
});
const route22 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$5
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
function Field({
  label,
  required,
  children
}) {
  return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "6px"
    },
    renderId: "render-f885feff",
    as: "div",
    children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      style: {
        fontSize: "13px",
        fontWeight: "600",
        color: "#1A1A1A"
      },
      renderId: "render-930169b2",
      as: "label",
      children: [label, required && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          color: "#C0392B",
          marginLeft: "2px"
        },
        renderId: "render-6cc0390f",
        as: "span",
        children: "*"
      })]
    }), children]
  });
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
function StepBar({
  current,
  role
}) {
  const meta = ROLE_META[role] || ROLE_META.donor;
  return /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      marginBottom: "28px"
    },
    renderId: "render-2794bbba",
    as: "div",
    children: Array.from({
      length: TOTAL_STEPS
    }).map((_, i) => {
      const done = i < current - 1;
      const active = i === current - 1;
      return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          display: "flex",
          alignItems: "center",
          flex: i < TOTAL_STEPS - 1 ? 1 : "none",
          gap: "6px"
        },
        renderId: "render-98e6904c",
        as: "div",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
          renderId: "render-8b58cad5",
          as: "div",
          children: done ? /* @__PURE__ */ jsx(CheckCircle2, {
            size: 14,
            color: "#FFFFFF",
            strokeWidth: 2.5
          }) : /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "11px",
              fontWeight: "700",
              color: active ? "#FFFFFF" : "#6B6B6B"
            },
            renderId: "render-86b0c057",
            as: "span",
            children: i + 1
          })
        }), i < TOTAL_STEPS - 1 && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            flex: 1,
            height: "2px",
            backgroundColor: done ? "#27AE60" : "#E0E0E0",
            borderRadius: "1px",
            transition: "background-color 300ms"
          },
          renderId: "render-0c36cab6",
          as: "div"
        })]
      }, i);
    })
  });
}
function Step1({
  form,
  setForm
}) {
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "18px"
    },
    renderId: "render-a187a361",
    as: "div",
    children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      renderId: "render-ae991d1f",
      as: "div",
      children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          fontSize: "20px",
          fontWeight: "800",
          color: "#1A1A1A",
          margin: "0 0 4px"
        },
        renderId: "render-53461ff7",
        as: "h2",
        children: "Account Credentials"
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          fontSize: "13px",
          color: "#6B6B6B",
          margin: 0
        },
        renderId: "render-418980f8",
        as: "p",
        children: "Create your secure LyfeBlood account."
      })]
    }), /* @__PURE__ */ jsx(Field, {
      label: "Full Name",
      required: true,
      children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: inputStyle,
        type: "text",
        placeholder: "e.g. Chukwuemeka Obi",
        value: form.fullName,
        onChange: (e) => setForm((f) => ({
          ...f,
          fullName: e.target.value
        })),
        renderId: "render-50ff0af5",
        as: "input"
      })
    }), /* @__PURE__ */ jsx(Field, {
      label: "Email Address",
      required: true,
      children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: inputStyle,
        type: "email",
        placeholder: "you@example.com",
        value: form.email,
        onChange: (e) => setForm((f) => ({
          ...f,
          email: e.target.value
        })),
        renderId: "render-1c958a4c",
        as: "input"
      })
    }), /* @__PURE__ */ jsx(Field, {
      label: "Phone Number",
      required: true,
      children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: inputStyle,
        type: "tel",
        placeholder: "+234 800 000 0000",
        value: form.phone,
        onChange: (e) => setForm((f) => ({
          ...f,
          phone: e.target.value
        })),
        renderId: "render-c2fca8a9",
        as: "input"
      })
    }), /* @__PURE__ */ jsx(Field, {
      label: "Password",
      required: true,
      children: /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          position: "relative"
        },
        renderId: "render-7c9076f1",
        as: "div",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            ...inputStyle,
            paddingRight: "44px"
          },
          type: showPw ? "text" : "password",
          placeholder: "Min. 8 characters",
          value: form.password,
          onChange: (e) => setForm((f) => ({
            ...f,
            password: e.target.value
          })),
          renderId: "render-3a3b39d1",
          as: "input"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
          renderId: "render-5e6e4867",
          as: "button",
          children: showPw ? /* @__PURE__ */ jsx(EyeOff, {
            size: 18
          }) : /* @__PURE__ */ jsx(Eye, {
            size: 18
          })
        })]
      })
    }), /* @__PURE__ */ jsxs(Field, {
      label: "Confirm Password",
      required: true,
      children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          position: "relative"
        },
        renderId: "render-705f8a4d",
        as: "div",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            ...inputStyle,
            paddingRight: "44px",
            borderColor: form.confirmPassword && form.confirmPassword !== form.password ? "#C0392B" : "#C8C8C8"
          },
          type: showConfirm ? "text" : "password",
          placeholder: "Re-enter your password",
          value: form.confirmPassword,
          onChange: (e) => setForm((f) => ({
            ...f,
            confirmPassword: e.target.value
          })),
          renderId: "render-28e1b7c9",
          as: "input"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
          renderId: "render-2b8f50ba",
          as: "button",
          children: showConfirm ? /* @__PURE__ */ jsx(EyeOff, {
            size: 18
          }) : /* @__PURE__ */ jsx(Eye, {
            size: 18
          })
        })]
      }), form.confirmPassword && form.confirmPassword !== form.password && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          fontSize: "11px",
          color: "#C0392B"
        },
        renderId: "render-4d3c8de2",
        as: "span",
        children: "Passwords do not match."
      })]
    })]
  });
}
function Step2Donor({
  form,
  setForm
}) {
  const ageNum = parseInt(form.age, 10);
  const ageValid = !form.age || ageNum >= 18 && ageNum <= 55;
  return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "20px"
    },
    renderId: "render-7732d3a2",
    as: "div",
    children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      renderId: "render-d85b857e",
      as: "div",
      children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          fontSize: "20px",
          fontWeight: "800",
          color: "#1A1A1A",
          margin: "0 0 4px"
        },
        renderId: "render-c21b5137",
        as: "h2",
        children: "Donor Profile"
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          fontSize: "13px",
          color: "#6B6B6B",
          margin: 0
        },
        renderId: "render-995a9000",
        as: "p",
        children: "Tell us about your blood type and location."
      })]
    }), /* @__PURE__ */ jsx(Field, {
      label: "Blood Group",
      required: true,
      children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginTop: "2px"
        },
        renderId: "render-58ac6b74",
        as: "div",
        children: BLOOD_GROUPS$1.map((g) => /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          type: "button",
          onClick: () => setForm((f) => ({
            ...f,
            bloodGroup: g
          })),
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
          renderId: "render-d66c2b84",
          as: "button",
          children: /* @__PURE__ */ jsx(BloodGroupTag, {
            group: g,
            size: "lg"
          })
        }, g))
      })
    }), /* @__PURE__ */ jsxs(Field, {
      label: "Age",
      required: true,
      children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
        onChange: (e) => setForm((f) => ({
          ...f,
          age: e.target.value
        })),
        renderId: "render-c8a6032b",
        as: "input"
      }), form.age && !ageValid && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          fontSize: "11px",
          color: "#C0392B"
        },
        renderId: "render-3d187649",
        as: "span",
        children: "Donors must be between 18 and 55 years old."
      }), !form.age && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          fontSize: "11px",
          color: "#6B6B6B"
        },
        renderId: "render-b9dd5508",
        as: "span",
        children: "Must be between 18 – 55 years."
      })]
    }), /* @__PURE__ */ jsx(Field, {
      label: "City / Local Government Area",
      required: true,
      children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: inputStyle,
        type: "text",
        placeholder: "e.g. Owerri North, Imo State",
        value: form.city,
        onChange: (e) => setForm((f) => ({
          ...f,
          city: e.target.value
        })),
        renderId: "render-70f00026",
        as: "input"
      })
    })]
  });
}
function Step2Requester({
  form,
  setForm
}) {
  return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "18px"
    },
    renderId: "render-1e8e883c",
    as: "div",
    children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      renderId: "render-a340ed9d",
      as: "div",
      children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          fontSize: "20px",
          fontWeight: "800",
          color: "#1A1A1A",
          margin: "0 0 4px"
        },
        renderId: "render-ad4b6280",
        as: "h2",
        children: "Patient Details"
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          fontSize: "13px",
          color: "#6B6B6B",
          margin: 0
        },
        renderId: "render-403ab5e1",
        as: "p",
        children: "Tell us about the patient you're requesting blood for."
      })]
    }), /* @__PURE__ */ jsx(Field, {
      label: "Patient Full Name",
      required: true,
      children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: inputStyle,
        type: "text",
        placeholder: "e.g. Mr. Emeka Obi",
        value: form.patientName,
        onChange: (e) => setForm((f) => ({
          ...f,
          patientName: e.target.value
        })),
        renderId: "render-5247fbbf",
        as: "input"
      })
    }), /* @__PURE__ */ jsx(Field, {
      label: "Your Relationship to Patient",
      required: true,
      children: /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          ...inputStyle,
          cursor: "pointer"
        },
        value: form.relationship,
        onChange: (e) => setForm((f) => ({
          ...f,
          relationship: e.target.value
        })),
        renderId: "render-555f807e",
        as: "select",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          value: "",
          renderId: "render-999d8d1d",
          as: "option",
          children: "Select relationship"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          renderId: "render-f46753c4",
          as: "option",
          children: "Spouse"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          renderId: "render-814932f9",
          as: "option",
          children: "Parent"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          renderId: "render-da51b982",
          as: "option",
          children: "Child"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          renderId: "render-589ec683",
          as: "option",
          children: "Sibling"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          renderId: "render-42d1bb4d",
          as: "option",
          children: "Extended Family"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          renderId: "render-9a5af5e2",
          as: "option",
          children: "Friend / Colleague"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          renderId: "render-92df2b77",
          as: "option",
          children: "Other"
        })]
      })
    }), /* @__PURE__ */ jsx(Field, {
      label: "Blood Group Needed",
      required: true,
      children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginTop: "2px"
        },
        renderId: "render-c9e5f86f",
        as: "div",
        children: BLOOD_GROUPS$1.map((g) => /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          type: "button",
          onClick: () => setForm((f) => ({
            ...f,
            bloodGroup: g
          })),
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
          renderId: "render-d3fb0837",
          as: "button",
          children: /* @__PURE__ */ jsx(BloodGroupTag, {
            group: g,
            size: "lg"
          })
        }, g))
      })
    }), /* @__PURE__ */ jsx(Field, {
      label: "Hospital / Location",
      required: true,
      children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: inputStyle,
        type: "text",
        placeholder: "e.g. St. David's Hospital, Owerri",
        value: form.hospital,
        onChange: (e) => setForm((f) => ({
          ...f,
          hospital: e.target.value
        })),
        renderId: "render-8c046142",
        as: "input"
      })
    })]
  });
}
function Step2Hospital({
  form,
  setForm
}) {
  return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "18px"
    },
    renderId: "render-50c44d79",
    as: "div",
    children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      renderId: "render-5d73999b",
      as: "div",
      children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          fontSize: "20px",
          fontWeight: "800",
          color: "#1A1A1A",
          margin: "0 0 4px"
        },
        renderId: "render-a9c197d9",
        as: "h2",
        children: "Facility Details"
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          fontSize: "13px",
          color: "#6B6B6B",
          margin: 0
        },
        renderId: "render-1073f59f",
        as: "p",
        children: "Provide your hospital's official information."
      })]
    }), /* @__PURE__ */ jsx(Field, {
      label: "Hospital / Facility Name",
      required: true,
      children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: inputStyle,
        type: "text",
        placeholder: "e.g. Federal Medical Centre Owerri",
        value: form.hospitalName,
        onChange: (e) => setForm((f) => ({
          ...f,
          hospitalName: e.target.value
        })),
        renderId: "render-930cdcf0",
        as: "input"
      })
    }), /* @__PURE__ */ jsx(Field, {
      label: "Department",
      required: true,
      children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: inputStyle,
        type: "text",
        placeholder: "e.g. Blood Bank & Procurement",
        value: form.department,
        onChange: (e) => setForm((f) => ({
          ...f,
          department: e.target.value
        })),
        renderId: "render-46e0b694",
        as: "input"
      })
    }), /* @__PURE__ */ jsx(Field, {
      label: "Full Address",
      required: true,
      children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: inputStyle,
        type: "text",
        placeholder: "e.g. Orlu Road, Owerri Municipal",
        value: form.address,
        onChange: (e) => setForm((f) => ({
          ...f,
          address: e.target.value
        })),
        renderId: "render-5f412b13",
        as: "input"
      })
    }), /* @__PURE__ */ jsx(Field, {
      label: "Facility Type",
      required: true,
      children: /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          ...inputStyle,
          cursor: "pointer"
        },
        value: form.facilityType,
        onChange: (e) => setForm((f) => ({
          ...f,
          facilityType: e.target.value
        })),
        renderId: "render-06890e2b",
        as: "select",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          value: "",
          renderId: "render-053978ff",
          as: "option",
          children: "Select type"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          renderId: "render-fe2a652f",
          as: "option",
          children: "Federal Teaching / Medical Centre"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          renderId: "render-bca4b2e1",
          as: "option",
          children: "State General Hospital"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          renderId: "render-893302be",
          as: "option",
          children: "Private Hospital / Clinic"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          renderId: "render-b584102b",
          as: "option",
          children: "Mission / Faith-based Hospital"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          renderId: "render-575f23a1",
          as: "option",
          children: "Primary Health Centre"
        })]
      })
    })]
  });
}
function Step3Donor({
  form,
  setForm
}) {
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setForm((f) => ({
      ...f,
      kycFile: file,
      kycPreview: e.target.result
    }));
    reader.readAsDataURL(file);
  };
  return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "20px"
    },
    renderId: "render-b14f18ff",
    as: "div",
    children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      renderId: "render-f96b998f",
      as: "div",
      children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          fontSize: "20px",
          fontWeight: "800",
          color: "#1A1A1A",
          margin: "0 0 4px"
        },
        renderId: "render-2b8a000e",
        as: "h2",
        children: "Identity Verification"
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          fontSize: "13px",
          color: "#6B6B6B",
          margin: 0
        },
        renderId: "render-48b89342",
        as: "p",
        children: "Upload a government-issued ID to complete your donor profile."
      })]
    }), /* @__PURE__ */ jsxs(Field, {
      label: "National ID / Voter Card / Driver's Licence",
      required: true,
      children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
        renderId: "render-92995aaa",
        as: "div",
        children: form.kycPreview ? /* @__PURE__ */ jsxs(Fragment, {
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            src: form.kycPreview,
            alt: "ID preview",
            style: {
              width: "100%",
              maxWidth: "280px",
              height: "140px",
              objectFit: "cover",
              borderRadius: "8px"
            },
            renderId: "render-6cfc8ce8",
            as: "img"
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              fontSize: "12px",
              color: "#27AE60",
              fontWeight: "600",
              margin: 0
            },
            renderId: "render-462950fd",
            as: "p",
            children: ["✓ ", form.kycFile?.name || "File selected", " — tap to replace"]
          })]
        }) : /* @__PURE__ */ jsxs(Fragment, {
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              backgroundColor: "#FADBD8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            },
            renderId: "render-b8bb932a",
            as: "div",
            children: /* @__PURE__ */ jsx(Upload, {
              size: 22,
              color: "#C0392B"
            })
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              textAlign: "center"
            },
            renderId: "render-1153c34b",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "14px",
                fontWeight: "700",
                color: "#1A1A1A",
                margin: "0 0 4px"
              },
              renderId: "render-00eec5fb",
              as: "p",
              children: "Tap to upload National ID / Voter Card"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "12px",
                color: "#6B6B6B",
                margin: 0
              },
              renderId: "render-05a1b083",
              as: "p",
              children: "or drag and drop here · JPG, PNG, PDF up to 5MB"
            })]
          })]
        })
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        ref: fileRef,
        type: "file",
        accept: "image/*,.pdf",
        style: {
          display: "none"
        },
        onChange: (e) => handleFile(e.target.files[0]),
        renderId: "render-c72fc44b",
        as: "input"
      })]
    }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      style: {
        backgroundColor: "#FADBD8",
        borderRadius: "10px",
        padding: "14px",
        display: "flex",
        gap: "10px"
      },
      renderId: "render-5f9431b2",
      as: "div",
      children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          fontSize: "18px",
          lineHeight: 1
        },
        renderId: "render-412bf759",
        as: "span",
        children: "🔒"
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          fontSize: "12px",
          color: "#922B21",
          margin: 0,
          lineHeight: "1.5"
        },
        renderId: "render-3681cbbc",
        as: "p",
        children: "Your ID is encrypted and used solely to verify donor identity. It is never shared with third parties."
      })]
    })]
  });
}
function Step3Declaration({
  form,
  setForm,
  role
}) {
  return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "20px"
    },
    renderId: "render-9185c060",
    as: "div",
    children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      renderId: "render-56963863",
      as: "div",
      children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          fontSize: "20px",
          fontWeight: "800",
          color: "#1A1A1A",
          margin: "0 0 4px"
        },
        renderId: "render-2b42344a",
        as: "h2",
        children: role === "hospital" ? "Licence & Declaration" : "Declaration"
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          fontSize: "13px",
          color: "#6B6B6B",
          margin: 0
        },
        renderId: "render-ae01b9c2",
        as: "p",
        children: "Final step before your account is created."
      })]
    }), role === "hospital" && /* @__PURE__ */ jsxs(Field, {
      label: "HEFAMAA / State Ministry Licence Number",
      required: true,
      children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: inputStyle,
        type: "text",
        placeholder: "e.g. IMO/HEFA/2024/00142",
        value: form.licenceNumber,
        onChange: (e) => setForm((f) => ({
          ...f,
          licenceNumber: e.target.value
        })),
        renderId: "render-0f53cea3",
        as: "input"
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          fontSize: "11px",
          color: "#6B6B6B"
        },
        renderId: "render-306671e0",
        as: "span",
        children: "Issued by the Imo State Ministry of Health."
      })]
    }), [role === "hospital" ? "I confirm this facility is a licensed medical institution operating legally in Imo State." : "I confirm that the patient information provided is accurate to the best of my knowledge.", "I understand that LyfeBlood facilitates donor connections only — all clinical and transfusion decisions remain with licensed medical professionals.", "I agree to the LyfeBlood Terms of Service and Community Safety Guidelines."].map((text, i) => /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        cursor: "pointer"
      },
      renderId: "render-285d63a7",
      as: "label",
      children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        type: "checkbox",
        checked: !!form.declarations?.[i],
        onChange: (e) => {
          const d = [...form.declarations || [false, false, false]];
          d[i] = e.target.checked;
          setForm((f) => ({
            ...f,
            declarations: d
          }));
        },
        style: {
          width: "18px",
          height: "18px",
          marginTop: "2px",
          accentColor: "#C0392B",
          flexShrink: 0
        },
        renderId: "render-07c52331",
        as: "input"
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          fontSize: "13px",
          color: "#4A4A4A",
          lineHeight: "1.5"
        },
        renderId: "render-1d2a84b8",
        as: "span",
        children: text
      })]
    }, i))]
  });
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
      if (role === "donor") return form.bloodGroup && form.age && parseInt(form.age, 10) >= 18 && parseInt(form.age, 10) <= 55 && form.city;
      if (role === "requester") return form.patientName && form.relationship && form.bloodGroup && form.hospital;
      if (role === "hospital") return form.hospitalName && form.department && form.address && form.facilityType;
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
      const {
        session,
        requiresEmailConfirmation,
        email: registeredEmail
      } = await apiRegister({
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
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      style: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: "100vh"
      },
      renderId: "render-d18d50f7",
      as: "div",
      children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
        renderId: "render-c28ad9b0",
        as: "header",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
          renderId: "render-519ec993",
          as: "button",
          children: /* @__PURE__ */ jsx(ChevronLeft, {
            size: 20,
            color: "#1A1A1A"
          })
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            flex: 1
          },
          renderId: "render-a4a1c431",
          as: "div",
          children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "15px",
              fontWeight: "700",
              color: "#1A1A1A"
            },
            renderId: "render-16e1e1f3",
            as: "span",
            children: "Create Account"
          })
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            fontSize: "11px",
            fontWeight: "600",
            color: meta.color,
            backgroundColor: meta.tint,
            paddingInline: "10px",
            paddingBlock: "4px",
            borderRadius: "999px"
          },
          renderId: "render-f5404076",
          as: "span",
          children: meta.label
        })]
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          display: "flex",
          gap: "0",
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #C8C8C8"
        },
        renderId: "render-7aace5c5",
        as: "div",
        children: Object.entries(ROLE_META).map(([key, m]) => {
          const Icon = m.icon;
          const active = role === key;
          return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
            renderId: "render-7ede70f5",
            as: "button",
            children: [/* @__PURE__ */ jsx(Icon, {
              size: 14,
              color: active ? m.color : "#6B6B6B"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "12px",
                fontWeight: active ? "700" : "500",
                color: active ? m.color : "#6B6B6B"
              },
              renderId: "render-51bd1529",
              as: "span",
              children: m.label
            })]
          }, key);
        })
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          flex: 1,
          padding: "24px 16px 100px",
          overflowY: "auto"
        },
        renderId: "render-528bbfaf",
        as: "div",
        children: [/* @__PURE__ */ jsx(StepBar, {
          current: step,
          role
        }), step === 1 && /* @__PURE__ */ jsx(Step1, {
          form,
          setForm
        }), step === 2 && role === "donor" && /* @__PURE__ */ jsx(Step2Donor, {
          form,
          setForm
        }), step === 2 && role === "requester" && /* @__PURE__ */ jsx(Step2Requester, {
          form,
          setForm
        }), step === 2 && role === "hospital" && /* @__PURE__ */ jsx(Step2Hospital, {
          form,
          setForm
        }), step === 3 && role === "donor" && /* @__PURE__ */ jsx(Step3Donor, {
          form,
          setForm
        }), step === 3 && (role === "requester" || role === "hospital") && /* @__PURE__ */ jsx(Step3Declaration, {
          form,
          setForm,
          role
        }), apiError && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
          renderId: "render-c9b133bb",
          as: "div",
          children: apiError
        })]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
        renderId: "render-9b2f6d99",
        as: "div",
        children: [step > 1 && /* @__PURE__ */ jsx(SecondaryButton, {
          onClick: handleBack,
          style: {
            width: "80px",
            flexShrink: 0
          },
          children: "Back"
        }), /* @__PURE__ */ jsx(PrimaryButton, {
          onClick: handleNext,
          disabled: !canProceed() || submitting,
          icon: step === TOTAL_STEPS ? CheckCircle2 : ChevronRight,
          style: {
            flex: 1
          },
          children: ctaLabel
        })]
      })]
    }), /* @__PURE__ */ jsx("style", {
      jsx: true,
      global: true,
      children: `
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { margin: 0; padding: 0; }
        input:focus, select:focus { border-color: #C0392B !important; box-shadow: 0 0 0 3px #FADBD8; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `
    })]
  });
}
const page$4 = UNSAFE_withComponentProps(function WrappedPage23(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(RegisterPage, {
      ...props
    })
  });
});
const route23 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$4
}, Symbol.toStringTag, { value: "Module" }));
function RegistrationConfirmationPage() {
  const location = useLocation$1();
  const requiresEmailConfirmation = Boolean(location.state?.requiresEmailConfirmation);
  const email = location.state?.email;
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      style: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px"
      },
      renderId: "render-960ba58f",
      as: "div",
      children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          position: "relative",
          marginBottom: "28px"
        },
        renderId: "render-63b2c647",
        as: "div",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
          renderId: "render-4127615c",
          as: "div",
          children: /* @__PURE__ */ jsx(CheckCircle2, {
            size: 64,
            color: "#27AE60",
            strokeWidth: 1.8
          })
        }), [{
          top: "-8px",
          left: "10px",
          color: "#C0392B",
          size: "10px"
        }, {
          top: "-4px",
          right: "8px",
          color: "#27AE60",
          size: "8px"
        }, {
          bottom: "4px",
          left: "-4px",
          color: "#F39C12",
          size: "7px"
        }, {
          bottom: "-6px",
          right: "14px",
          color: "#C0392B",
          size: "9px"
        }].map((dot, i) => /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
          },
          renderId: "render-1ce13116",
          as: "span"
        }, i))]
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          fontSize: "28px",
          fontWeight: "800",
          color: "#1A1A1A",
          textAlign: "center",
          letterSpacing: "-0.02em",
          margin: "0 0 10px"
        },
        renderId: "render-e5bc1180",
        as: "h1",
        children: requiresEmailConfirmation ? "Check Your Email" : "You're All Set!"
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          fontSize: "15px",
          color: "#4A4A4A",
          textAlign: "center",
          lineHeight: "1.6",
          margin: "0 0 32px",
          maxWidth: "300px"
        },
        renderId: "render-1a5cffa5",
        as: "p",
        children: requiresEmailConfirmation ? `We sent a verification link${email ? ` to ${email}` : ""}. Please verify your email before signing in.` : "Your LyfeBlood account has been created. You can now respond to urgent blood requests and help save lives across Imo State."
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
        renderId: "render-210ea883",
        as: "div",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            fontSize: "12px",
            fontWeight: "700",
            color: "#6B6B6B",
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "0.06em"
          },
          renderId: "render-f11473c9",
          as: "p",
          children: "Your Account Status"
        }), [{
          label: requiresEmailConfirmation ? "Email Verification" : "Identity Verification",
          value: "Under Review (24–48h)",
          color: "#F39C12",
          bg: "#FEF9C3"
        }, {
          label: "Profile Visibility",
          value: requiresEmailConfirmation ? "Pending" : "Active",
          color: requiresEmailConfirmation ? "#F39C12" : "#1E8449",
          bg: requiresEmailConfirmation ? "#FEF9C3" : "#D5F5E3"
        }, {
          label: "Notifications",
          value: "Enabled",
          color: "#1E40AF",
          bg: "#DBEAFE"
        }].map(({
          label,
          value,
          color,
          bg
        }) => /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          },
          renderId: "render-6c9a30d5",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "13px",
              color: "#4A4A4A"
            },
            renderId: "render-a21b2e93",
            as: "span",
            children: label
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              fontSize: "12px",
              fontWeight: "600",
              color,
              backgroundColor: bg,
              paddingInline: "10px",
              paddingBlock: "3px",
              borderRadius: "999px"
            },
            renderId: "render-8f4c0acd",
            as: "span",
            children: value
          })]
        }, label))]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
        renderId: "render-eeff5d75",
        as: "div",
        children: [/* @__PURE__ */ jsx(Heart, {
          size: 22,
          color: "#C0392B"
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            fontSize: "13px",
            color: "#922B21",
            margin: 0,
            lineHeight: "1.5"
          },
          renderId: "render-fe37b712",
          as: "p",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            renderId: "render-1c5c57cb",
            as: "strong",
            children: "One donation"
          }), " can save up to", " ", /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            renderId: "render-554e80e9",
            as: "strong",
            children: "3 lives"
          }), ". Your presence on LyfeBlood matters."]
        })]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          width: "100%"
        },
        renderId: "render-15115d83",
        as: "div",
        children: [/* @__PURE__ */ jsx(PrimaryButton, {
          onClick: () => {
            if (typeof window !== "undefined") window.location.href = "/login";
          },
          children: "Sign In to Your Account"
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            textAlign: "center",
            fontSize: "11px",
            color: "#6B6B6B",
            marginTop: "14px"
          },
          renderId: "render-e9e9b476",
          as: "p",
          children: "Serving Owerri · Orlu · Okigwe and all Imo State LGAs"
        })]
      })]
    }), /* @__PURE__ */ jsx("style", {
      jsx: true,
      global: true,
      children: `
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { margin: 0; padding: 0; }
      `
    })]
  });
}
const page$3 = UNSAFE_withComponentProps(function WrappedPage24(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(RegistrationConfirmationPage, {
      ...props
    })
  });
});
const route24 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$3
}, Symbol.toStringTag, { value: "Module" }));
const ROLE_HOME_ROUTE$1 = {
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
  const homeRoute = ROLE_HOME_ROUTE$1[currentUser.role] ?? "/dashboard";
  const visibleRequests = donor ? bloodRequests.filter((request) => request.status !== REQUEST_STATUS.FULFILLED) : bloodRequests;
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      style: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        paddingBottom: "80px"
      },
      renderId: "render-bd9fe620",
      as: "div",
      children: [/* @__PURE__ */ jsx(TopAppBar, {
        title: donor ? "Available Requests" : "Request History",
        onBellPress: markAllNotificationsRead
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          padding: "16px 12px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        },
        renderId: "render-c692fa70",
        as: "main",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
          renderId: "render-36045179",
          as: "button",
          children: /* @__PURE__ */ jsx(ChevronLeft, {
            size: 20,
            color: "#1A1A1A"
          })
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          },
          renderId: "render-0f41699c",
          as: "section",
          children: [/* @__PURE__ */ jsx(ClipboardList, {
            size: 22,
            color: "#C0392B"
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            renderId: "render-5114ce04",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                margin: "0 0 2px",
                fontSize: "22px",
                fontWeight: "800",
                color: "#1A1A1A"
              },
              renderId: "render-46e29ac3",
              as: "p",
              children: visibleRequests.length
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                margin: 0,
                fontSize: "12px",
                color: "#6B6B6B",
                fontWeight: "700"
              },
              renderId: "render-8236f3b7",
              as: "p",
              children: donor ? `request${visibleRequests.length === 1 ? "" : "s"} available for your blood group` : `request${visibleRequests.length === 1 ? "" : "s"} in history`
            })]
          })]
        }), visibleRequests.length === 0 ? /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          style: {
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            padding: "32px 18px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            textAlign: "center"
          },
          renderId: "render-8a169f96",
          as: "section",
          children: [/* @__PURE__ */ jsx(ClipboardList, {
            size: 38,
            color: "#C8C8C8"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              margin: "10px 0 0",
              fontSize: "14px",
              fontWeight: "700",
              color: "#6B6B6B"
            },
            renderId: "render-de93b211",
            as: "p",
            children: donor ? "No compatible requests yet" : "No request history yet"
          })]
        }) : /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          },
          renderId: "render-cdda0d96",
          as: "div",
          children: visibleRequests.map((request) => /* @__PURE__ */ jsx(RequestCard, {
            request,
            onClick: donor ? void 0 : () => navigate(`/requests/${request.id}`)
          }, request.id))
        })]
      })]
    }), /* @__PURE__ */ jsx(BottomNavBar, {
      onNavigate: (key) => {
        if (key === "home") navigate(homeRoute);
        if (key === "profile") navigate("/profile");
      }
    })]
  });
}
const page$2 = UNSAFE_withComponentProps(function WrappedPage25(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(RequestHistoryPage, {
      ...props
    })
  });
});
const route25 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: page$2
}, Symbol.toStringTag, { value: "Module" }));
const ROLE_HOME_ROUTE = {
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
function DetailRow({
  label,
  value
}) {
  return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "3px"
    },
    renderId: "render-92042449",
    as: "div",
    children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
      style: {
        fontSize: "11px",
        fontWeight: "700",
        color: "#6B6B6B",
        textTransform: "uppercase"
      },
      renderId: "render-241c4540",
      as: "span",
      children: label
    }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
      style: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#1A1A1A",
        lineHeight: "1.4"
      },
      renderId: "render-5ebd2d7f",
      as: "span",
      children: value || "Not provided"
    })]
  });
}
function Section({
  title,
  icon: Icon,
  children
}) {
  return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
    style: {
      backgroundColor: "#FFFFFF",
      borderRadius: "8px",
      padding: "16px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      display: "flex",
      flexDirection: "column",
      gap: "14px"
    },
    renderId: "render-3ee4e37e",
    as: "section",
    children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "8px"
      },
      renderId: "render-06abb198",
      as: "div",
      children: [/* @__PURE__ */ jsx(Icon, {
        size: 18,
        color: "#C0392B"
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        style: {
          margin: 0,
          fontSize: "15px",
          fontWeight: "800",
          color: "#1A1A1A"
        },
        renderId: "render-c45bc740",
        as: "h2",
        children: title
      })]
    }), children]
  });
}
function RequestDetailsPage() {
  const navigate = useNavigate$1();
  const {
    requestId: requestId2
  } = useParams();
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
    if (!isAuthenticated || !requestId2) return void 0;
    let isActive = true;
    setRequestLoading(true);
    setRequestNotFound(false);
    setRequestError(null);
    supabase.from("blood_requests").select("*").eq("id", requestId2).maybeSingle().then(async ({
      data: loadedRequest,
      error
    }) => {
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
      const {
        matches
      } = await apiGetMatches({
        request_id: loadedRequest.id
      });
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
  }, [isAuthenticated, requestId2]);
  if (!currentUser) return null;
  const role = currentUser.role;
  const homeRoute = ROLE_HOME_ROUTE[role] ?? "/dashboard";
  const isHospital = role === "hospital" || role === "hospital_officer";
  const isPatient = ["requester", "patient", "patient_family"].includes(role);
  if (requestLoading) {
    return /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          display: "flex",
          flexDirection: "column",
          flex: 1,
          paddingBottom: "80px"
        },
        renderId: "render-8d9c4b87",
        as: "div",
        children: [/* @__PURE__ */ jsx(TopAppBar, {
          title: "Request Details",
          onBellPress: markAllNotificationsRead
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            padding: "24px 12px"
          },
          renderId: "render-f9f1c61a",
          as: "div",
          children: /* @__PURE__ */ jsx(Section, {
            title: "Loading request",
            icon: ClipboardCheck,
            children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                margin: 0,
                fontSize: "14px",
                color: "#4A4A4A",
                lineHeight: "1.5"
              },
              renderId: "render-c8b9cb75",
              as: "p",
              children: "Fetching the latest request details from the hospital record."
            })
          })
        })]
      }), /* @__PURE__ */ jsx(BottomNavBar, {
        onNavigate: (key) => {
          if (key === "home") navigate(homeRoute);
          if (key === "profile") navigate("/profile");
        }
      })]
    });
  }
  if (requestError) {
    return /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          display: "flex",
          flexDirection: "column",
          flex: 1,
          paddingBottom: "80px"
        },
        renderId: "render-d08ca455",
        as: "div",
        children: [/* @__PURE__ */ jsx(TopAppBar, {
          title: "Request Details",
          onBellPress: markAllNotificationsRead
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            padding: "24px 12px"
          },
          renderId: "render-9b4e9ce5",
          as: "div",
          children: /* @__PURE__ */ jsxs(Section, {
            title: "Unable to load request",
            icon: AlertTriangle,
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                margin: 0,
                fontSize: "14px",
                color: "#4A4A4A",
                lineHeight: "1.5"
              },
              renderId: "render-a1046d84",
              as: "p",
              children: requestError
            }), /* @__PURE__ */ jsx(SecondaryButton, {
              onClick: () => navigate(homeRoute),
              icon: ChevronLeft,
              children: "Back to Dashboard"
            })]
          })
        })]
      }), /* @__PURE__ */ jsx(BottomNavBar, {
        onNavigate: (key) => {
          if (key === "home") navigate(homeRoute);
          if (key === "profile") navigate("/profile");
        }
      })]
    });
  }
  if (requestNotFound || !request) {
    return /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          display: "flex",
          flexDirection: "column",
          flex: 1,
          paddingBottom: "80px"
        },
        renderId: "render-b43bc8cf",
        as: "div",
        children: [/* @__PURE__ */ jsx(TopAppBar, {
          title: "Request Details",
          onBellPress: markAllNotificationsRead
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          style: {
            padding: "24px 12px"
          },
          renderId: "render-2b7c0edc",
          as: "div",
          children: /* @__PURE__ */ jsxs(Section, {
            title: "Request not found",
            icon: AlertTriangle,
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                margin: 0,
                fontSize: "14px",
                color: "#4A4A4A",
                lineHeight: "1.5"
              },
              renderId: "render-c3edcc72",
              as: "p",
              children: "This request could not be found or is not available to your account."
            }), /* @__PURE__ */ jsx(SecondaryButton, {
              onClick: () => navigate(homeRoute),
              icon: ChevronLeft,
              children: "Back to Dashboard"
            })]
          })
        })]
      }), /* @__PURE__ */ jsx(BottomNavBar, {
        onNavigate: (key) => {
          if (key === "home") navigate(homeRoute);
          if (key === "profile") navigate("/profile");
        }
      })]
    });
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
      setRequest((prev) => prev ? {
        ...prev,
        status: nextStatus
      } : prev);
      setStatusSuccess(`Status updated to ${nextStatus.replaceAll("_", " ")}.`);
    } catch (error) {
      setStatusError(error?.message ?? "Unable to update request status.");
    } finally {
      setStatusUpdating(false);
    }
  };
  const statusActions = isHospital ? [request.status === REQUEST_STATUS.PENDING && {
    label: "Mark Verified",
    next: REQUEST_STATUS.VERIFIED
  }, request.status === REQUEST_STATUS.VERIFIED && {
    label: "Mark Donor Matched",
    next: REQUEST_STATUS.DONOR_MATCHED
  }, request.status === REQUEST_STATUS.CHECKED_IN && {
    label: "Mark Blood Collected",
    next: REQUEST_STATUS.BLOOD_COLLECTED
  }, request.status === REQUEST_STATUS.BLOOD_COLLECTED && {
    label: "Mark Completed",
    next: REQUEST_STATUS.FULFILLED
  }, ![REQUEST_STATUS.FULFILLED, REQUEST_STATUS.CANCELLED].includes(request.status) && {
    label: "Cancel Request",
    next: REQUEST_STATUS.CANCELLED,
    secondary: true
  }].filter(Boolean) : [];
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      style: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        paddingBottom: "80px"
      },
      renderId: "render-5800bb5d",
      as: "div",
      children: [/* @__PURE__ */ jsx(TopAppBar, {
        title: "Request Details",
        onBellPress: markAllNotificationsRead
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        style: {
          padding: "16px 12px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        },
        renderId: "render-52aad22d",
        as: "div",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
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
          renderId: "render-3aa03514",
          as: "button",
          children: /* @__PURE__ */ jsx(ChevronLeft, {
            size: 20,
            color: "#1A1A1A"
          })
        }), /* @__PURE__ */ jsxs(Section, {
          title: "Request Summary",
          icon: ClipboardCheck,
          children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              alignItems: "flex-start"
            },
            renderId: "render-b425a237",
            as: "div",
            children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
              style: {
                display: "flex",
                alignItems: "center",
                gap: "10px"
              },
              renderId: "render-710c64d6",
              as: "div",
              children: [/* @__PURE__ */ jsx(BloodGroupTag, {
                group: request.bloodGroup,
                size: "lg"
              }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
                renderId: "render-f1db9b9b",
                as: "div",
                children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                  style: {
                    margin: "0 0 3px",
                    fontSize: "15px",
                    fontWeight: "800",
                    color: "#1A1A1A"
                  },
                  renderId: "render-e1c5edb9",
                  as: "p",
                  children: request.hospitalName
                }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                  style: {
                    margin: 0,
                    fontSize: "12px",
                    color: "#6B6B6B"
                  },
                  renderId: "render-9af726af",
                  as: "p",
                  children: request.ward
                })]
              })]
            }), /* @__PURE__ */ jsx(RequestStatusBadge, {
              status: request.status,
              size: "sm"
            })]
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px"
            },
            renderId: "render-fcc305f2",
            as: "div",
            children: [/* @__PURE__ */ jsx(DetailRow, {
              label: "Units",
              value: `${request.unitsFulfilled}/${request.unitsNeeded}`
            }), /* @__PURE__ */ jsx(DetailRow, {
              label: "Blood Types",
              value: formatBloodTypes(request.bloodGroup)
            }), /* @__PURE__ */ jsx(DetailRow, {
              label: "Priority",
              value: request.tier === "sos" ? "SOS" : "Standard"
            }), /* @__PURE__ */ jsx(DetailRow, {
              label: "Case Ref",
              value: request.patientCode
            }), /* @__PURE__ */ jsx(DetailRow, {
              label: "Location",
              value: request.location
            })]
          }), request.urgencyNote && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              margin: 0,
              fontSize: "13px",
              color: "#922B21",
              lineHeight: "1.5",
              fontWeight: "600"
            },
            renderId: "render-62f1e380",
            as: "p",
            children: request.urgencyNote
          })]
        }), /* @__PURE__ */ jsx(DonationJourney, {
          request,
          matches: requestMatches
        }), /* @__PURE__ */ jsxs(Section, {
          title: "Verification & Status",
          icon: ShieldCheck,
          children: [/* @__PURE__ */ jsx(DetailRow, {
            label: "Current status",
            value: request.status.replaceAll("_", " ")
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              margin: 0,
              fontSize: "12px",
              color: "#4A4A4A",
              lineHeight: "1.5"
            },
            renderId: "render-4032a5d7",
            as: "p",
            children: "Donors should only proceed after confirming this request with hospital staff. Hospital staff should update the status only after verification at the facility."
          }), statusError && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              margin: 0,
              fontSize: "12px",
              color: "#922B21",
              fontWeight: "700"
            },
            renderId: "render-f2b05033",
            as: "p",
            children: statusError
          }), statusSuccess && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              margin: 0,
              fontSize: "12px",
              color: "#1E8449",
              fontWeight: "700"
            },
            renderId: "render-bdaf889b",
            as: "p",
            children: statusSuccess
          }), statusActions.map((action) => action.secondary ? /* @__PURE__ */ jsx(SecondaryButton, {
            onClick: () => handleStatusUpdate(action.next),
            disabled: statusUpdating,
            children: statusUpdating ? "Saving..." : action.label
          }, action.next) : /* @__PURE__ */ jsx(PrimaryButton, {
            onClick: () => handleStatusUpdate(action.next),
            disabled: statusUpdating,
            icon: CheckCircle2,
            children: statusUpdating ? "Saving..." : action.label
          }, action.next))]
        }), isPatient && acceptedMatches.length > 0 && /* @__PURE__ */ jsxs(Section, {
          title: "Donor Coordination",
          icon: Navigation,
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              margin: 0,
              fontSize: "12px",
              color: "#4A4A4A",
              lineHeight: "1.5"
            },
            renderId: "render-b2c5c69d",
            as: "p",
            children: "Chat and live tracking are available because a matched donor accepted this request."
          }), acceptedMatches.map((match) => /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px"
            },
            renderId: "render-e7b78af7",
            as: "div",
            children: [/* @__PURE__ */ jsx(SecondaryButton, {
              onClick: () => navigate(`/matches/${match.id}/chat`),
              icon: MessageCircle,
              children: "Chat"
            }), /* @__PURE__ */ jsx(PrimaryButton, {
              onClick: () => navigate(`/matches/${match.id}/tracking`),
              icon: Navigation,
              children: "Track Donor"
            })]
          }, match.id))]
        }), /* @__PURE__ */ jsxs(Section, {
          title: "Emergency Contact",
          icon: Phone,
          children: [/* @__PURE__ */ jsx(DetailRow, {
            label: "Facility",
            value: request.hospitalName
          }), /* @__PURE__ */ jsx(DetailRow, {
            label: "Where to go",
            value: request.location || request.ward
          }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
            renderId: "render-1af865b9",
            as: "a",
            children: [/* @__PURE__ */ jsx(Phone, {
              size: 16
            }), "Call Emergency Line"]
          })]
        }), /* @__PURE__ */ jsxs(Section, {
          title: "Privacy & Consent",
          icon: ShieldCheck,
          children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            style: {
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              cursor: "pointer"
            },
            renderId: "render-0e48d8d9",
            as: "label",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              type: "checkbox",
              checked: consented,
              onChange: (event) => setConsented(event.target.checked),
              style: {
                width: "18px",
                height: "18px",
                accentColor: "#C0392B",
                flexShrink: 0
              },
              renderId: "render-03ed5b35",
              as: "input"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              style: {
                fontSize: "12px",
                color: "#4A4A4A",
                lineHeight: "1.5"
              },
              renderId: "render-e9f8aab9",
              as: "span",
              children: "I understand this request may contain sensitive medical context and should only be used for donation coordination with authorized hospital staff."
            })]
          }), consented && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              margin: 0,
              fontSize: "12px",
              color: "#1E8449",
              fontWeight: "700"
            },
            renderId: "render-e55c9f5e",
            as: "p",
            children: "Consent acknowledged for this session."
          })]
        }), /* @__PURE__ */ jsxs(Section, {
          title: "Report / Flag Request",
          icon: Flag,
          children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
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
            renderId: "render-990e46af",
            as: "select",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              value: "",
              renderId: "render-3edeb3e1",
              as: "option",
              children: "Select a reason"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              value: "incorrect_details",
              renderId: "render-b0a951c4",
              as: "option",
              children: "Incorrect request details"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              value: "duplicate",
              renderId: "render-07c3eeac",
              as: "option",
              children: "Duplicate request"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              value: "unsafe_contact",
              renderId: "render-fb83aa1c",
              as: "option",
              children: "Unsafe or suspicious contact"
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              value: "privacy",
              renderId: "render-7af43294",
              as: "option",
              children: "Privacy concern"
            })]
          }), /* @__PURE__ */ jsx(SecondaryButton, {
            onClick: handleFlag,
            disabled: !flagReason,
            icon: Flag,
            children: "Flag Request"
          }), flagged && /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            style: {
              margin: 0,
              fontSize: "12px",
              color: "#922B21",
              fontWeight: "700"
            },
            renderId: "render-a047d6e0",
            as: "p",
            children: "Flag recorded locally for hospital-testing review."
          })]
        })]
      })]
    }), /* @__PURE__ */ jsx(BottomNavBar, {
      onNavigate: (key) => {
        if (key === "home") navigate(homeRoute);
        if (key === "profile") navigate("/profile");
      }
    })]
  });
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
    fetch(`/api/__create/check-social-secrets?provider=${encodeURIComponent(provider)}`).then((r) => r.json()).then((data) => setMissingSecrets(data.missing || [])).catch((err) => {
      console.error("Failed to check social secrets:", err);
    });
  }, [provider]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn("dev-social", {
        email,
        name,
        provider,
        callbackUrl
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
    className: "min-h-screen flex items-center justify-center font-sans bg-gray-100",
    renderId: "render-d768d95e",
    as: "div",
    children: /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      className: "bg-white rounded-xl p-8 w-full max-w-[400px] shadow-md",
      renderId: "render-8f606cbc",
      as: "div",
      children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        className: "bg-amber-50 border border-amber-400 rounded-lg p-3 mb-4 text-[13px] text-amber-800",
        renderId: "render-964031ee",
        as: "div",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          renderId: "render-290e122a",
          as: "strong",
          children: "Development Mode"
        }), " — This is a simulated", " ", label, " sign-in. In production, users will see the real", " ", label, " OAuth screen."]
      }), error && /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        className: "bg-red-50 border border-red-400 rounded-lg p-3 mb-4 text-[13px] text-red-900",
        renderId: "render-d9bf8991",
        as: "div",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          renderId: "render-edc2ca23",
          as: "strong",
          children: "Sign-in error"
        }), " — ", error]
      }), missingSecrets && missingSecrets.length > 0 && /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        className: "bg-red-50 border border-red-400 rounded-lg p-3 mb-4 text-[13px] text-red-900",
        renderId: "render-c4adb0de",
        as: "div",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          renderId: "render-c4d645b1",
          as: "strong",
          children: "Missing secrets"
        }), " — ", label, " sign-in won't work in production until you add these secrets to your project:", " ", missingSecrets.map((s) => /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          className: "bg-red-200 px-1 rounded text-[12px]",
          renderId: "render-5c25a7f4",
          as: "code",
          children: s
        }, s))]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        className: "mt-0 mb-6 text-xl font-semibold",
        renderId: "render-0aaee34c",
        as: "h2",
        children: ["Sign in with ", label]
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        onSubmit: handleSubmit,
        renderId: "render-abb857df",
        as: "form",
        children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          className: "block mb-4",
          renderId: "render-a676646f",
          as: "label",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            className: "block text-sm font-medium mb-1.5",
            renderId: "render-146e1b94",
            as: "span",
            children: "Email"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            type: "email",
            required: true,
            value: email,
            onChange: (e) => setEmail(e.target.value),
            placeholder: "test@example.com",
            className: "w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm",
            renderId: "render-962c3ae3",
            as: "input"
          })]
        }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          className: "block mb-6",
          renderId: "render-00cf20fe",
          as: "label",
          children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            className: "block text-sm font-medium mb-1.5",
            renderId: "render-fefe5863",
            as: "span",
            children: ["Display Name", " ", /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              className: "text-gray-400",
              renderId: "render-c1cc7632",
              as: "span",
              children: "(optional)"
            })]
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            type: "text",
            value: name,
            onChange: (e) => setName(e.target.value),
            placeholder: "Test User",
            className: "w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm",
            renderId: "render-c1d8c70d",
            as: "input"
          })]
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          type: "submit",
          disabled: loading,
          className: "w-full py-2.5 rounded-lg border-none text-white text-sm font-medium bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-default cursor-pointer",
          renderId: "render-37901de0",
          as: "button",
          children: loading ? "Signing in..." : `Continue as ${label} user`
        })]
      })]
    })
  });
}
const page = UNSAFE_withComponentProps(function WrappedPage27(props) {
  return /* @__PURE__ */ jsx(RootLayout, {
    children: /* @__PURE__ */ jsx(SocialDevShimPage, {
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
      const path2 = url.replaceAll("[", "").replaceAll("]", "");
      const displayPath = path2 === "/" ? "Homepage" : path2;
      return {
        url,
        path: displayPath
      };
    })
  };
}
const notFound$1 = UNSAFE_withComponentProps(function CreateDefaultNotFoundPage({
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
      const path2 = `/${value}`;
      navigate(path2);
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
  return /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
    className: "flex sm:w-full w-screen sm:min-w-[850px] flex-col",
    renderId: "render-d689828b",
    as: "div",
    children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      className: "flex w-full items-center gap-2 p-5",
      renderId: "render-6e2a4939",
      as: "div",
      children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        type: "button",
        onClick: handleBack,
        className: "flex items-center justify-center w-10 h-10 rounded-md",
        renderId: "render-dbafa18c",
        as: "button",
        children: /* @__PURE__ */ jsxs("svg", {
          width: "18",
          height: "18",
          viewBox: "0 0 18 18",
          fill: "none",
          xmlns: "http://www.w3.org/2000/svg",
          "aria-label": "Back",
          role: "img",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            d: "M8.5957 2.65435L2.25005 9L8.5957 15.3457",
            stroke: "currentColor",
            strokeWidth: "1.5",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            renderId: "render-19284698",
            as: "path"
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            d: "M2.25007 9L15.75 9",
            stroke: "currentColor",
            strokeWidth: "1.5",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            renderId: "render-45597838",
            as: "path"
          })]
        })
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        className: "flex flex-row divide-x divide-gray-200 rounded-[8px] h-8 w-[300px] border border-gray-200 bg-gray-50 text-gray-500",
        renderId: "render-6167d1a2",
        as: "div",
        children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          className: "flex items-center px-[14px] py-[5px]",
          renderId: "render-f91be180",
          as: "div",
          children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            renderId: "render-ed48bd40",
            as: "span",
            children: "/"
          })
        }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          className: "flex items-center min-w-0",
          renderId: "render-ab77a917",
          as: "div",
          children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            className: "border-0 bg-transparent px-3 py-2 focus:outline-none truncate max-w-[300px]",
            style: {
              minWidth: 0
            },
            title: missingPath,
            renderId: "render-c9557f41",
            as: "p",
            children: missingPath
          })
        })]
      })]
    }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
      className: "flex flex-grow flex-col items-center justify-center pt-[100px] text-center gap-[20px]",
      renderId: "render-4b6dbd34",
      as: "div",
      children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        className: "text-4xl font-medium text-gray-900 px-2",
        renderId: "render-c9a4a290",
        as: "h1",
        children: "Uh-oh! This page doesn't exist (yet)."
      }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
        className: "pt-4 pb-12 px-2 text-gray-500",
        renderId: "render-8d81bb78",
        as: "p",
        children: ['Looks like "', /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          className: "font-bold",
          renderId: "render-ad783a9d",
          as: "span",
          children: ["/", missingPath]
        }), `" isn't part of your project. But no worries, you've got options!`]
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        className: "px-[20px] w-full",
        renderId: "render-baad3d40",
        as: "div",
        children: /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          className: "flex flex-row justify-center items-center w-full max-w-[800px] mx-auto border border-gray-200 rounded-lg p-[20px] mb-[40px] gap-[20px]",
          renderId: "render-bff20210",
          as: "div",
          children: [/* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            className: "flex flex-col gap-[5px] items-start self-start w-1/2",
            renderId: "render-43b12987",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              className: "text-sm text-black text-left",
              renderId: "render-10fc79a9",
              as: "p",
              children: "Build it from scratch"
            }), /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
              className: "text-sm text-gray-500 text-left",
              renderId: "render-d8617961",
              as: "p",
              children: ['Create a new page to live at "', /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
                renderId: "render-3edd864f",
                as: "span",
                children: ["/", missingPath]
              }), '"']
            })]
          }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            className: "flex flex-row items-center justify-end w-1/2",
            renderId: "render-e7f02201",
            as: "div",
            children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              type: "button",
              className: "bg-black text-white px-[10px] py-[5px] rounded-md",
              onClick: () => handleCreatePage(),
              renderId: "render-d0f5cbf1",
              as: "button",
              children: "Create Page"
            })
          })]
        })
      }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        className: "pb-20 lg:pb-[80px]",
        renderId: "render-680e92b1",
        as: "div",
        children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          className: "flex items-center text-gray-500",
          renderId: "render-ada509be",
          as: "p",
          children: "Check out all your project's routes here ↓"
        })
      }), siteMap ? /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        className: "flex flex-col justify-center items-center w-full px-[50px]",
        renderId: "render-92891cc6",
        as: "div",
        children: /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
          className: "flex flex-col justify-between items-center w-full max-w-[600px] gap-[10px]",
          renderId: "render-a3ba9377",
          as: "div",
          children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
            className: "text-sm text-gray-300 pb-[10px] self-start p-4",
            renderId: "render-3d575e1c",
            as: "p",
            children: "PAGES"
          }), siteMap.webPages?.map((route29) => /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            type: "button",
            onClick: () => handleSearch(route29.cleanRoute || ""),
            className: "flex flex-row justify-between text-center items-center p-4 rounded-lg bg-white shadow-sm w-full hover:bg-gray-50",
            renderId: "render-24fef9f0",
            as: "button",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              className: "font-medium text-gray-900",
              renderId: "render-f0f1583b",
              as: "h3",
              children: route29.name
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              className: "text-sm text-gray-400",
              renderId: "render-b6396117",
              as: "p",
              children: route29.cleanRoute
            })]
          }, route29.id))]
        })
      }) : /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
        className: "flex flex-wrap gap-3 w-full max-w-[80rem] mx-auto pb-5 px-2",
        renderId: "render-8bf7415c",
        as: "div",
        children: existingRoutes.map((route29) => /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
          className: "flex flex-col flex-grow basis-full sm:basis-[calc(50%-0.375rem)] xl:basis-[calc(33.333%-0.5rem)]",
          renderId: "render-48b4d781",
          as: "div",
          children: /* @__PURE__ */ jsxs(CreatePolymorphicComponent, {
            className: "w-full flex-1 flex flex-col items-center ",
            renderId: "render-5eddf1fe",
            as: "div",
            children: [/* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              className: "relative w-full max-w-[350px] h-48 sm:h-56 lg:h-64 overflow-hidden rounded-[8px] border border-comeback-gray-75 transition-all group-hover:shadow-md",
              renderId: "render-9331f04d",
              as: "div",
              children: /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
                type: "button",
                onClick: () => handleSearch(route29.url.replace(/^\//, "")),
                className: "h-full w-full rounded-[8px] bg-gray-50 bg-cover",
                renderId: "render-1268b5a7",
                as: "button"
              })
            }), /* @__PURE__ */ jsx(CreatePolymorphicComponent, {
              className: "pt-3 text-left text-gray-500 w-full max-w-[350px]",
              renderId: "render-62a69672",
              as: "p",
              children: route29.path
            })]
          })
        }, route29.path))
      })]
    })]
  });
});
const route28 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: notFound$1,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-Be_XWhGa.js", "imports": ["/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/index-CPeHbM7i.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": true, "module": "/assets/root-Dt8I1P7n.js", "imports": ["/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/index-CPeHbM7i.js", "/assets/PolymorphicComponent-DIPgcu30.js", "/assets/react-C8Yct5VK.js"], "css": ["/assets/root-DU6sRI_X.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "page": { "id": "page", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-BnFU6cm3.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js", "/assets/PrimaryButton-cORFDqGn.js", "/assets/SecondaryButton-Bhe-T8fQ.js", "/assets/RequestCard-C1pXpLHZ.js", "/assets/BloodGroupTag-DLg-rHnH.js", "/assets/droplets-BR8g60x5.js", "/assets/heart-CVSkSldV.js", "/assets/triangle-alert-BHxrKIDF.js", "/assets/createLucideIcon-BXZsnm7B.js", "/assets/chevron-right-C4boRnmd.js", "/assets/shield-DRqVHdCw.js", "/assets/arrow-right-DzKW4eV6.js", "/assets/RequestStatusBadge-KDJFv602.js", "/assets/clock-Duc3rNtg.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "dashboard/page": { "id": "dashboard/page", "parentId": "root", "path": "dashboard", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-CMwWYPEd.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js", "/assets/TopAppBar-BSX8oX9J.js", "/assets/BottomNavBar-DawXcCZJ.js", "/assets/RequestCard-C1pXpLHZ.js", "/assets/PrimaryButton-cORFDqGn.js", "/assets/SecondaryButton-Bhe-T8fQ.js", "/assets/BloodGroupTag-DLg-rHnH.js", "/assets/droplets-BR8g60x5.js", "/assets/triangle-alert-BHxrKIDF.js", "/assets/trash-2-C9Quis7X.js", "/assets/log-out-AuiJ132Q.js", "/assets/x-sWGG2rUX.js", "/assets/createLucideIcon-BXZsnm7B.js", "/assets/user-CpOuaacA.js", "/assets/RequestStatusBadge-KDJFv602.js", "/assets/clock-Duc3rNtg.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "donations/history/page": { "id": "donations/history/page", "parentId": "root", "path": "donations/history", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-CeRTTBcJ.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js", "/assets/TopAppBar-BSX8oX9J.js", "/assets/BottomNavBar-DawXcCZJ.js", "/assets/RequestStatusBadge-KDJFv602.js", "/assets/chevron-left-BhrYdvp-.js", "/assets/award-BuP6E2OY.js", "/assets/droplets-BR8g60x5.js", "/assets/clock-Duc3rNtg.js", "/assets/createLucideIcon-BXZsnm7B.js", "/assets/user-CpOuaacA.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "donor/home/page": { "id": "donor/home/page", "parentId": "root", "path": "donor/home", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-BSfY-0LV.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js", "/assets/TopAppBar-BSX8oX9J.js", "/assets/BottomNavBar-DawXcCZJ.js", "/assets/BloodGroupTag-DLg-rHnH.js", "/assets/RequestCard-C1pXpLHZ.js", "/assets/x-sWGG2rUX.js", "/assets/award-BuP6E2OY.js", "/assets/clock-Duc3rNtg.js", "/assets/map-pin-D8z38SKV.js", "/assets/droplets-BR8g60x5.js", "/assets/chevron-right-C4boRnmd.js", "/assets/createLucideIcon-BXZsnm7B.js", "/assets/user-CpOuaacA.js", "/assets/RequestStatusBadge-KDJFv602.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "donor/match/[matchId]/page": { "id": "donor/match/[matchId]/page", "parentId": "root", "path": "donor/match/:matchId", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-CxbH_zH5.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js", "/assets/PrimaryButton-cORFDqGn.js", "/assets/SecondaryButton-Bhe-T8fQ.js", "/assets/BloodGroupTag-DLg-rHnH.js", "/assets/DonationJourney-DKkdta4j.js", "/assets/x-sWGG2rUX.js", "/assets/chevron-left-BhrYdvp-.js", "/assets/triangle-alert-BHxrKIDF.js", "/assets/building-2-BJy9Nv-p.js", "/assets/map-pin-D8z38SKV.js", "/assets/navigation-CmiqVavm.js", "/assets/clock-Duc3rNtg.js", "/assets/circle-check-TvxkBSQE.js", "/assets/createLucideIcon-BXZsnm7B.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "donor/match/[matchId]/checkin/page": { "id": "donor/match/[matchId]/checkin/page", "parentId": "root", "path": "donor/match/:matchId/checkin", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-C8o03xUj.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js", "/assets/PrimaryButton-cORFDqGn.js", "/assets/BloodGroupTag-DLg-rHnH.js", "/assets/shield-DRqVHdCw.js", "/assets/building-2-BJy9Nv-p.js", "/assets/circle-check-TvxkBSQE.js", "/assets/triangle-alert-BHxrKIDF.js", "/assets/createLucideIcon-BXZsnm7B.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "errors/async-effect-error/page": { "id": "errors/async-effect-error/page", "parentId": "root", "path": "errors/async-effect-error", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-DBu5DjQN.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "errors/event-handler-error/page": { "id": "errors/event-handler-error/page", "parentId": "root", "path": "errors/event-handler-error", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-BuN1mFYk.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "errors/hook-rule/page": { "id": "errors/hook-rule/page", "parentId": "root", "path": "errors/hook-rule", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-ByAIO1nI.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "errors/infinite-render-loop/page": { "id": "errors/infinite-render-loop/page", "parentId": "root", "path": "errors/infinite-render-loop", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-BcgDERIJ.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "errors/json-parse-error/page": { "id": "errors/json-parse-error/page", "parentId": "root", "path": "errors/json-parse-error", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-BoaRIJOL.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "errors/missing-component/page": { "id": "errors/missing-component/page", "parentId": "root", "path": "errors/missing-component", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-56Gzgo5-.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "errors/null-access/page": { "id": "errors/null-access/page", "parentId": "root", "path": "errors/null-access", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-hnnJmqBr.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "errors/render-object/page": { "id": "errors/render-object/page", "parentId": "root", "path": "errors/render-object", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-BclCCMts.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "errors/type-error-not-function/page": { "id": "errors/type-error-not-function/page", "parentId": "root", "path": "errors/type-error-not-function", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-D74oxI0R.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "errors/undefined-access/page": { "id": "errors/undefined-access/page", "parentId": "root", "path": "errors/undefined-access", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-D3eXZSS1.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "errors/unhandled-promise/page": { "id": "errors/unhandled-promise/page", "parentId": "root", "path": "errors/unhandled-promise", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-BCCvPqK-.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "hospital/dashboard/page": { "id": "hospital/dashboard/page", "parentId": "root", "path": "hospital/dashboard", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-DrddBe1f.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js", "/assets/TopAppBar-BSX8oX9J.js", "/assets/BottomNavBar-DawXcCZJ.js", "/assets/BloodGroupTag-DLg-rHnH.js", "/assets/RequestCard-C1pXpLHZ.js", "/assets/RequestStatusBadge-KDJFv602.js", "/assets/PrimaryButton-cORFDqGn.js", "/assets/SecondaryButton-Bhe-T8fQ.js", "/assets/building-2-BJy9Nv-p.js", "/assets/radio-Bhd4r7uQ.js", "/assets/trash-2-C9Quis7X.js", "/assets/createLucideIcon-BXZsnm7B.js", "/assets/map-pin-D8z38SKV.js", "/assets/droplets-BR8g60x5.js", "/assets/circle-check-TvxkBSQE.js", "/assets/triangle-alert-BHxrKIDF.js", "/assets/x-sWGG2rUX.js", "/assets/user-CpOuaacA.js", "/assets/clock-Duc3rNtg.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "login/page": { "id": "login/page", "parentId": "root", "path": "login", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-DbGqNUog.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js", "/assets/PrimaryButton-cORFDqGn.js", "/assets/chevron-left-BhrYdvp-.js", "/assets/eye-CgS2qebF.js", "/assets/createLucideIcon-BXZsnm7B.js", "/assets/circle-check-TvxkBSQE.js", "/assets/arrow-right-DzKW4eV6.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "matches/[matchId]/chat/page": { "id": "matches/[matchId]/chat/page", "parentId": "root", "path": "matches/:matchId/chat", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-BAGRg2B3.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js", "/assets/TopAppBar-BSX8oX9J.js", "/assets/PrimaryButton-cORFDqGn.js", "/assets/SecondaryButton-Bhe-T8fQ.js", "/assets/chevron-left-BhrYdvp-.js", "/assets/navigation-CmiqVavm.js", "/assets/createLucideIcon-BXZsnm7B.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "matches/[matchId]/tracking/page": { "id": "matches/[matchId]/tracking/page", "parentId": "root", "path": "matches/:matchId/tracking", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-h5wgaLYH.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js", "/assets/TopAppBar-BSX8oX9J.js", "/assets/PrimaryButton-cORFDqGn.js", "/assets/SecondaryButton-Bhe-T8fQ.js", "/assets/DonationJourney-DKkdta4j.js", "/assets/chevron-left-BhrYdvp-.js", "/assets/navigation-CmiqVavm.js", "/assets/map-pin-D8z38SKV.js", "/assets/radio-Bhd4r7uQ.js", "/assets/createLucideIcon-BXZsnm7B.js", "/assets/circle-check-TvxkBSQE.js", "/assets/clock-Duc3rNtg.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "profile/page": { "id": "profile/page", "parentId": "root", "path": "profile", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-BG1jgfgi.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js", "/assets/TopAppBar-BSX8oX9J.js", "/assets/BottomNavBar-DawXcCZJ.js", "/assets/PrimaryButton-cORFDqGn.js", "/assets/SecondaryButton-Bhe-T8fQ.js", "/assets/BloodGroupTag-DLg-rHnH.js", "/assets/chevron-left-BhrYdvp-.js", "/assets/droplets-BR8g60x5.js", "/assets/user-CpOuaacA.js", "/assets/triangle-alert-BHxrKIDF.js", "/assets/circle-check-TvxkBSQE.js", "/assets/log-out-AuiJ132Q.js", "/assets/createLucideIcon-BXZsnm7B.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "register/page": { "id": "register/page", "parentId": "root", "path": "register", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-BGJavvql.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js", "/assets/PrimaryButton-cORFDqGn.js", "/assets/SecondaryButton-Bhe-T8fQ.js", "/assets/BloodGroupTag-DLg-rHnH.js", "/assets/building-2-BJy9Nv-p.js", "/assets/user-CpOuaacA.js", "/assets/droplets-BR8g60x5.js", "/assets/chevron-left-BhrYdvp-.js", "/assets/circle-check-TvxkBSQE.js", "/assets/chevron-right-C4boRnmd.js", "/assets/eye-CgS2qebF.js", "/assets/createLucideIcon-BXZsnm7B.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "register/confirmation/page": { "id": "register/confirmation/page", "parentId": "root", "path": "register/confirmation", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-mPwNwDVH.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js", "/assets/PrimaryButton-cORFDqGn.js", "/assets/circle-check-TvxkBSQE.js", "/assets/heart-CVSkSldV.js", "/assets/createLucideIcon-BXZsnm7B.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "requests/history/page": { "id": "requests/history/page", "parentId": "root", "path": "requests/history", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-riqtQ9j1.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js", "/assets/TopAppBar-BSX8oX9J.js", "/assets/BottomNavBar-DawXcCZJ.js", "/assets/RequestCard-C1pXpLHZ.js", "/assets/chevron-left-BhrYdvp-.js", "/assets/createLucideIcon-BXZsnm7B.js", "/assets/droplets-BR8g60x5.js", "/assets/user-CpOuaacA.js", "/assets/BloodGroupTag-DLg-rHnH.js", "/assets/RequestStatusBadge-KDJFv602.js", "/assets/clock-Duc3rNtg.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "requests/[requestId]/page": { "id": "requests/[requestId]/page", "parentId": "root", "path": "requests/:requestId", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-BCF75tlo.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js", "/assets/TopAppBar-BSX8oX9J.js", "/assets/BottomNavBar-DawXcCZJ.js", "/assets/BloodGroupTag-DLg-rHnH.js", "/assets/RequestStatusBadge-KDJFv602.js", "/assets/PrimaryButton-cORFDqGn.js", "/assets/SecondaryButton-Bhe-T8fQ.js", "/assets/DonationJourney-DKkdta4j.js", "/assets/createLucideIcon-BXZsnm7B.js", "/assets/triangle-alert-BHxrKIDF.js", "/assets/chevron-left-BhrYdvp-.js", "/assets/circle-check-TvxkBSQE.js", "/assets/navigation-CmiqVavm.js", "/assets/droplets-BR8g60x5.js", "/assets/user-CpOuaacA.js", "/assets/clock-Duc3rNtg.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "__create/social-dev-shim/page": { "id": "__create/social-dev-shim/page", "parentId": "root", "path": "__create/social-dev-shim", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/page-DFhwqM1X.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js", "/assets/layout-6HbzSkXE.js", "/assets/react-C8Yct5VK.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "__create/not-found": { "id": "__create/not-found", "parentId": "root", "path": "*?", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/not-found-PHVTj2gt.js", "imports": ["/assets/PolymorphicComponent-DIPgcu30.js", "/assets/chunk-4ZMWKKQ3-O7EX3nyA.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-a5be4e77.js", "version": "a5be4e77", "sri": void 0 };
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "v8_passThroughRequests": false, "v8_trailingSlashAwareDataRequests": false, "unstable_previewServerPrerendering": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes$1 = {
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
  "dashboard/page": {
    id: "dashboard/page",
    parentId: "root",
    path: "dashboard",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "donations/history/page": {
    id: "donations/history/page",
    parentId: "root",
    path: "donations/history",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "donor/home/page": {
    id: "donor/home/page",
    parentId: "root",
    path: "donor/home",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "donor/match/[matchId]/page": {
    id: "donor/match/[matchId]/page",
    parentId: "root",
    path: "donor/match/:matchId",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "donor/match/[matchId]/checkin/page": {
    id: "donor/match/[matchId]/checkin/page",
    parentId: "root",
    path: "donor/match/:matchId/checkin",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "errors/async-effect-error/page": {
    id: "errors/async-effect-error/page",
    parentId: "root",
    path: "errors/async-effect-error",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "errors/event-handler-error/page": {
    id: "errors/event-handler-error/page",
    parentId: "root",
    path: "errors/event-handler-error",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "errors/hook-rule/page": {
    id: "errors/hook-rule/page",
    parentId: "root",
    path: "errors/hook-rule",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  },
  "errors/infinite-render-loop/page": {
    id: "errors/infinite-render-loop/page",
    parentId: "root",
    path: "errors/infinite-render-loop",
    index: void 0,
    caseSensitive: void 0,
    module: route10
  },
  "errors/json-parse-error/page": {
    id: "errors/json-parse-error/page",
    parentId: "root",
    path: "errors/json-parse-error",
    index: void 0,
    caseSensitive: void 0,
    module: route11
  },
  "errors/missing-component/page": {
    id: "errors/missing-component/page",
    parentId: "root",
    path: "errors/missing-component",
    index: void 0,
    caseSensitive: void 0,
    module: route12
  },
  "errors/null-access/page": {
    id: "errors/null-access/page",
    parentId: "root",
    path: "errors/null-access",
    index: void 0,
    caseSensitive: void 0,
    module: route13
  },
  "errors/render-object/page": {
    id: "errors/render-object/page",
    parentId: "root",
    path: "errors/render-object",
    index: void 0,
    caseSensitive: void 0,
    module: route14
  },
  "errors/type-error-not-function/page": {
    id: "errors/type-error-not-function/page",
    parentId: "root",
    path: "errors/type-error-not-function",
    index: void 0,
    caseSensitive: void 0,
    module: route15
  },
  "errors/undefined-access/page": {
    id: "errors/undefined-access/page",
    parentId: "root",
    path: "errors/undefined-access",
    index: void 0,
    caseSensitive: void 0,
    module: route16
  },
  "errors/unhandled-promise/page": {
    id: "errors/unhandled-promise/page",
    parentId: "root",
    path: "errors/unhandled-promise",
    index: void 0,
    caseSensitive: void 0,
    module: route17
  },
  "hospital/dashboard/page": {
    id: "hospital/dashboard/page",
    parentId: "root",
    path: "hospital/dashboard",
    index: void 0,
    caseSensitive: void 0,
    module: route18
  },
  "login/page": {
    id: "login/page",
    parentId: "root",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: route19
  },
  "matches/[matchId]/chat/page": {
    id: "matches/[matchId]/chat/page",
    parentId: "root",
    path: "matches/:matchId/chat",
    index: void 0,
    caseSensitive: void 0,
    module: route20
  },
  "matches/[matchId]/tracking/page": {
    id: "matches/[matchId]/tracking/page",
    parentId: "root",
    path: "matches/:matchId/tracking",
    index: void 0,
    caseSensitive: void 0,
    module: route21
  },
  "profile/page": {
    id: "profile/page",
    parentId: "root",
    path: "profile",
    index: void 0,
    caseSensitive: void 0,
    module: route22
  },
  "register/page": {
    id: "register/page",
    parentId: "root",
    path: "register",
    index: void 0,
    caseSensitive: void 0,
    module: route23
  },
  "register/confirmation/page": {
    id: "register/confirmation/page",
    parentId: "root",
    path: "register/confirmation",
    index: void 0,
    caseSensitive: void 0,
    module: route24
  },
  "requests/history/page": {
    id: "requests/history/page",
    parentId: "root",
    path: "requests/history",
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
  "__create/social-dev-shim/page": {
    id: "__create/social-dev-shim/page",
    parentId: "root",
    path: "__create/social-dev-shim",
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
const reactRouterBuild = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  allowedActionOrigins,
  assets: serverManifest,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes: routes$1,
  ssr
}, Symbol.toStringTag, { value: "Module" }));
function NeonAdapter(client) {
  return {
    async createVerificationToken(verificationToken) {
      const { identifier, expires, token } = verificationToken;
      const sql = `
        INSERT INTO auth_verification_token ( identifier, expires, token )
        VALUES ($1, $2, $3)
        `;
      await client.query(sql, [identifier, expires, token]);
      return verificationToken;
    },
    async useVerificationToken({
      identifier,
      token
    }) {
      const sql = `delete from auth_verification_token
      where identifier = $1 and token = $2
      RETURNING identifier, expires, token `;
      const result = await client.query(sql, [identifier, token]);
      return result.rowCount !== 0 ? result.rows[0] : null;
    },
    async createUser(user) {
      const { name, email, emailVerified, image } = user;
      const sql = `
        INSERT INTO auth_users (name, email, "emailVerified", image)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, "emailVerified", image`;
      const result = await client.query(sql, [
        name,
        email,
        emailVerified,
        image
      ]);
      return result.rows[0];
    },
    async getUser(id) {
      const sql = "select * from auth_users where id = $1";
      try {
        const result = await client.query(sql, [id]);
        return result.rowCount === 0 ? null : result.rows[0];
      } catch {
        return null;
      }
    },
    async getUserByEmail(email) {
      const sql = "select * from auth_users where email = $1";
      const result = await client.query(sql, [email]);
      if (result.rowCount === 0) {
        return null;
      }
      const userData = result.rows[0];
      const accountsData = await client.query(
        'select * from auth_accounts where "userId" = $1',
        [userData.id]
      );
      return {
        ...userData,
        accounts: accountsData.rows
      };
    },
    async getUserByAccount({
      providerAccountId,
      provider
    }) {
      const sql = `
          select u.* from auth_users u join auth_accounts a on u.id = a."userId"
          where
          a.provider = $1
          and
          a."providerAccountId" = $2`;
      const result = await client.query(sql, [provider, providerAccountId]);
      return result.rowCount !== 0 ? result.rows[0] : null;
    },
    async updateUser(user) {
      const fetchSql = "select * from auth_users where id = $1";
      const query1 = await client.query(fetchSql, [user.id]);
      const oldUser = query1.rows[0];
      const newUser = {
        ...oldUser,
        ...user
      };
      const { id, name, email, emailVerified, image } = newUser;
      const updateSql = `
        UPDATE auth_users set
        name = $2, email = $3, "emailVerified" = $4, image = $5
        where id = $1
        RETURNING name, id, email, "emailVerified", image
      `;
      const query2 = await client.query(updateSql, [
        id,
        name,
        email,
        emailVerified,
        image
      ]);
      return query2.rows[0];
    },
    async linkAccount(account) {
      const sql = `
      insert into auth_accounts
      (
        "userId",
        provider,
        type,
        "providerAccountId",
        access_token,
        expires_at,
        refresh_token,
        id_token,
        scope,
        session_state,
        token_type,
        password
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      returning
        id,
        "userId",
        provider,
        type,
        "providerAccountId",
        access_token,
        expires_at,
        refresh_token,
        id_token,
        scope,
        session_state,
        token_type,
        password
      `;
      const params = [
        account.userId,
        account.provider,
        account.type,
        account.providerAccountId,
        account.access_token,
        account.expires_at,
        account.refresh_token,
        account.id_token,
        account.scope,
        account.session_state,
        account.token_type,
        account.extraData?.password
      ];
      const result = await client.query(sql, params);
      return result.rows[0];
    },
    async createSession({ sessionToken, userId, expires }) {
      if (userId === void 0) {
        throw Error("userId is undef in createSession");
      }
      const sql = `insert into auth_sessions ("userId", expires, "sessionToken")
      values ($1, $2, $3)
      RETURNING id, "sessionToken", "userId", expires`;
      const result = await client.query(sql, [userId, expires, sessionToken]);
      return result.rows[0];
    },
    async getSessionAndUser(sessionToken) {
      if (sessionToken === void 0) {
        return null;
      }
      const result1 = await client.query(
        `select * from auth_sessions where "sessionToken" = $1`,
        [sessionToken]
      );
      if (result1.rowCount === 0) {
        return null;
      }
      const session = result1.rows[0];
      const result2 = await client.query(
        "select * from auth_users where id = $1",
        [session.userId]
      );
      if (result2.rowCount === 0) {
        return null;
      }
      const user = result2.rows[0];
      return {
        session,
        user
      };
    },
    async updateSession(session) {
      const { sessionToken } = session;
      const result1 = await client.query(
        `select * from auth_sessions where "sessionToken" = $1`,
        [sessionToken]
      );
      if (result1.rowCount === 0) {
        return null;
      }
      const originalSession = result1.rows[0];
      const newSession = {
        ...originalSession,
        ...session
      };
      const sql = `
        UPDATE auth_sessions set
        expires = $2
        where "sessionToken" = $1
        `;
      const result = await client.query(sql, [
        newSession.sessionToken,
        newSession.expires
      ]);
      return result.rows[0];
    },
    async deleteSession(sessionToken) {
      const sql = `delete from auth_sessions where "sessionToken" = $1`;
      await client.query(sql, [sessionToken]);
    },
    async unlinkAccount(partialAccount) {
      const { provider, providerAccountId } = partialAccount;
      const sql = `delete from auth_accounts where "providerAccountId" = $1 and provider = $2`;
      await client.query(sql, [providerAccountId, provider]);
    },
    async deleteUser(userId) {
      await client.query("delete from auth_users where id = $1", [userId]);
      await client.query('delete from auth_sessions where "userId" = $1', [
        userId
      ]);
      await client.query('delete from auth_accounts where "userId" = $1', [
        userId
      ]);
    }
  };
}
const getHTMLForErrorPage = (err) => {
  return `
<html>
  <head>
    <script>
    window.onload = () => {
      const error = ${JSON.stringify(serializeError(err))};
      window.parent.postMessage({ type: 'sandbox:web:ready' }, '*');
      window.parent.postMessage({ type: 'sandbox:error:detected', error: error }, '*');

      const healthyResponse = {
        type: 'sandbox:web:healthcheck:response',
        healthy: true,
        hasError: true,
        supportsErrorDetected: true,
      };
      window.addEventListener('message', (event) => {
        if (event.data.type === 'sandbox:navigation') {
          window.location.pathname = event.data.pathname;
        }
        if (event.data.type === 'sandbox:web:healthcheck') {
          window.parent.postMessage(healthyResponse, '*');
        }
      });
      console.error(error);
    }
    <\/script>
  </head>
  <body></body>
</html>
    `;
};
const authActions = [
  "providers",
  "session",
  "csrf",
  "signin",
  "signout",
  "callback",
  "verify-request",
  "error",
  "webauthn-options"
];
function isAuthAction(pathname) {
  const base = "/api/auth";
  const a = pathname.match(new RegExp(`^${base}(.+)`));
  if (a === null) {
    return false;
  }
  const actionAndProviderId = a.at(-1);
  if (!actionAndProviderId) {
    return false;
  }
  const b = actionAndProviderId.replace(/^\//, "").split("/").filter(Boolean);
  if (b.length !== 1 && b.length !== 2) {
    return false;
  }
  const [action] = b;
  if (!authActions.includes(action)) {
    return false;
  }
  return true;
}
const ALLOWED_PROVIDERS = /* @__PURE__ */ new Set(["google", "facebook", "twitter", "apple"]);
function GET$9(request) {
  if (process.env.NEXT_PUBLIC_CREATE_ENV !== "DEVELOPMENT") {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider");
  if (!provider || !ALLOWED_PROVIDERS.has(provider.toLowerCase())) {
    return Response.json({ error: "invalid provider" }, { status: 400 });
  }
  const key = provider.toUpperCase();
  const clientId = `${key}_CLIENT_ID`;
  const clientSecret = `${key}_CLIENT_SECRET`;
  const missing = [];
  if (!process.env[clientId]) missing.push(clientId);
  if (!process.env[clientSecret]) missing.push(clientSecret);
  return Response.json({ provider, missing });
}
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$9
}, Symbol.toStringTag, { value: "Module" }));
const __dirname$1 = fileURLToPath(new URL(".", import.meta.url));
function buildRouteTree(dir, basePath = "") {
  const files = readdirSync(dir);
  const node = {
    path: basePath,
    children: [],
    hasPage: false,
    isParam: false,
    isCatchAll: false,
    paramName: ""
  };
  const dirName = basePath.split("/").pop();
  if (dirName?.startsWith("[") && dirName.endsWith("]")) {
    node.isParam = true;
    const paramName = dirName.slice(1, -1);
    if (paramName.startsWith("...")) {
      node.isCatchAll = true;
      node.paramName = paramName.slice(3);
    } else {
      node.paramName = paramName;
    }
  }
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      const childPath = basePath ? `${basePath}/${file}` : file;
      const childNode = buildRouteTree(filePath, childPath);
      node.children.push(childNode);
    } else if (file === "page.jsx") {
      node.hasPage = true;
    }
  }
  return node;
}
function generateRoutes(node) {
  const routes2 = [];
  if (node.hasPage) {
    const componentPath = node.path === "" ? `./${node.path}page.jsx` : `./${node.path}/page.jsx`;
    if (node.path === "") {
      routes2.push(index(componentPath));
    } else {
      let routePath = node.path;
      const segments = routePath.split("/");
      const processedSegments = segments.map((segment) => {
        if (segment.startsWith("[") && segment.endsWith("]")) {
          const paramName = segment.slice(1, -1);
          if (paramName.startsWith("...")) {
            return "*";
          }
          if (paramName.startsWith("[") && paramName.endsWith("]")) {
            return `:${paramName.slice(1, -1)}?`;
          }
          return `:${paramName}`;
        }
        return segment;
      });
      routePath = processedSegments.join("/");
      routes2.push(route(routePath, componentPath));
    }
  }
  for (const child of node.children) {
    routes2.push(...generateRoutes(child));
  }
  return routes2;
}
const tree = buildRouteTree(__dirname$1);
const notFound = route("*?", "./__create/not-found.tsx");
const routes = [...generateRoutes(tree), notFound];
function serializeClean(err) {
  err.stack = cleanStack(err.stack, {
    pathFilter: (path2) => {
      return !path2.includes("node_modules") && !path2.includes("dist") && !path2.includes("__create");
    }
  });
  return serializeError(err);
}
const getHTMLOrError = (component) => {
  try {
    const html = renderToString(React.createElement(component, {}));
    return { html, error: null };
  } catch (error) {
    return { html: null, error: serializeClean(error) };
  }
};
async function GET$8(request) {
  const results = await Promise.allSettled(
    routes.map(async (route29) => {
      let component = null;
      try {
        const response = await import(
          /* @vite-ignore */
          path.join("../../../", route29.file)
        );
        component = response.default;
      } catch (error) {
        console.debug("Error importing component:", route29.file, error);
      }
      if (!component) {
        return null;
      }
      getHTMLOrError(component);
      return {
        route: route29.file,
        path: route29.path,
        ...getHTMLOrError(component)
      };
    })
  );
  const cleanedResults = results.filter((result) => result.status === "fulfilled").map((result) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    return null;
  }).filter((result) => result !== null);
  return Response.json({ results: cleanedResults });
}
const __vite_glob_0_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$8
}, Symbol.toStringTag, { value: "Module" }));
const REMEMBER_SESSION_COOKIE = "lyfeblood.refresh-token";
const REMEMBER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
function isSecureRequest(request) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) return forwardedProto.split(",")[0]?.trim() === "https";
  return new URL(request.url).protocol === "https:" || process.env.NODE_ENV === "production";
}
function readCookie(request, name) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  return cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) ?? null;
}
function buildRememberSessionCookie(request, refreshToken) {
  const parts = [
    `${REMEMBER_SESSION_COOKIE}=${encodeURIComponent(refreshToken)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${REMEMBER_SESSION_MAX_AGE_SECONDS}`
  ];
  if (isSecureRequest(request)) parts.push("Secure");
  return parts.join("; ");
}
function buildClearRememberSessionCookie(request) {
  const parts = [
    `${REMEMBER_SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0"
  ];
  if (isSecureRequest(request)) parts.push("Secure");
  return parts.join("; ");
}
const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim();
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
function getSupabaseConfig() {
  return {
    url: supabaseUrl ?? null,
    anonKey: supabaseAnonKey ?? null,
    serviceRoleKey: supabaseServiceRoleKey ?? null
  };
}
function normalizeEmail(email) {
  return email?.trim().toLowerCase() ?? "";
}
function createSupabaseServerClient() {
  const apiKey = supabaseServiceRoleKey || supabaseAnonKey;
  if (!supabaseUrl || !apiKey) {
    throw new Error(
      "Supabase server configuration is missing. Set SUPABASE_URL and either SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  return createClient(supabaseUrl, apiKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
function createSupabaseAuthClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase auth configuration is missing. Set SUPABASE_URL and SUPABASE_ANON_KEY."
    );
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
function createSupabaseAdminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Supabase admin configuration is missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
const USER_SELECT$1 = "id, full_name, email, phone, role, blood_type, location, availability_status, is_verified, last_donation_at, created_at";
async function POST$9(request) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;
    if (!email?.trim() || !password)
      return Response.json(
        { error: "email and password are required" },
        { status: 400 }
      );
    const normalizedEmail = normalizeEmail(email);
    const authClient = createSupabaseAuthClient();
    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });
    if (authError || !authData.user || !authData.session) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const supabase2 = createSupabaseServerClient();
    const { data: user, error: profileError } = await supabase2.from("users").select(USER_SELECT$1).eq("id", authData.user.id).maybeSingle();
    if (profileError) {
      throw profileError;
    }
    if (!user) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }
    return Response.json(
      {
        user,
        token: authData.session.access_token,
        expires_at: authData.session.expires_at ?? null,
        message: "Login successful"
      },
      {
        headers: {
          "Set-Cookie": rememberMe ? buildRememberSessionCookie(request, authData.session.refresh_token) : buildClearRememberSessionCookie(request)
        }
      }
    );
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
const __vite_glob_0_2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$9
}, Symbol.toStringTag, { value: "Module" }));
async function POST$8(request) {
  return Response.json(
    { message: "Logged out" },
    {
      headers: {
        "Set-Cookie": buildClearRememberSessionCookie(request)
      }
    }
  );
}
const __vite_glob_0_3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$8
}, Symbol.toStringTag, { value: "Module" }));
const SAFE_USER_SELECT$1 = "id, full_name, email, phone, role, blood_type, location, availability_status, is_verified, created_at";
function normalizeRole$1(role) {
  return ["donor", "requester", "hospital"].includes(role) ? role : null;
}
function getErrorMessage(error, fallback = "Registration failed") {
  const message = error?.message ?? error?.error_description ?? error?.error;
  return typeof message === "string" && message.trim() ? message : fallback;
}
function getCreateUserStatus(error) {
  const message = getErrorMessage(error, "").toLowerCase();
  if (message.includes("already") || message.includes("duplicate")) return 409;
  if (message.includes("database error")) return 500;
  return 400;
}
function buildUserPayload({ userId, fullName, email, phone, role, bloodType, location }) {
  return {
    id: userId,
    full_name: fullName.trim(),
    email,
    phone: phone?.trim() ?? null,
    role,
    blood_type: bloodType ?? null,
    location: location ?? null,
    availability_status: 0,
    is_verified: 0
  };
}
async function POST$7(request) {
  try {
    const body = await request.json();
    const { full_name, email, phone, password, role, blood_type, location } = body;
    if (!full_name?.trim())
      return Response.json({ error: "full_name is required" }, { status: 400 });
    if (!email?.trim())
      return Response.json({ error: "email is required" }, { status: 400 });
    if (!password || password.length < 8)
      return Response.json(
        { error: "password must be at least 8 characters" },
        { status: 400 }
      );
    const normalizedRole = normalizeRole$1(role);
    if (!normalizedRole)
      return Response.json(
        { error: "role must be donor, requester, or hospital" },
        { status: 400 }
      );
    const normalizedEmail = normalizeEmail(email);
    const metadata = {
      full_name: full_name.trim(),
      phone: phone?.trim() ?? null,
      role: normalizedRole,
      blood_type: blood_type ?? null,
      location: location ?? null,
      availability_status: 0,
      is_verified: 0
    };
    const admin = createSupabaseAdminClient();
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: metadata
    });
    if (createError) {
      const status = getCreateUserStatus(createError);
      return Response.json({ error: getErrorMessage(createError) }, { status });
    }
    const authUser = created.user;
    const supabase2 = createSupabaseServerClient();
    const payload = buildUserPayload({
      userId: authUser.id,
      fullName: full_name,
      email: normalizedEmail,
      phone,
      role: normalizedRole,
      bloodType: blood_type,
      location
    });
    const { data: user, error: profileError } = await supabase2.from("users").upsert(payload, { onConflict: "id" }).select(SAFE_USER_SELECT$1).single();
    if (profileError) {
      return Response.json(
        { error: getErrorMessage(profileError, "Account was created, but profile setup failed") },
        { status: 500 }
      );
    }
    const authClient = createSupabaseAuthClient();
    const { data: sessionData, error: signInError } = await authClient.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });
    if (signInError) {
      throw signInError;
    }
    return Response.json(
      {
        user,
        session: sessionData.session,
        token: sessionData.session?.access_token ?? null,
        requiresEmailConfirmation: false,
        email: normalizedEmail,
        message: "Registration successful"
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return Response.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}
const __vite_glob_0_4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$7
}, Symbol.toStringTag, { value: "Module" }));
const USER_SELECT = "id, full_name, email, phone, role, blood_type, location, availability_status, is_verified, last_donation_at, created_at";
async function loadProfile(userId) {
  const supabase2 = createSupabaseServerClient();
  const { data: user, error } = await supabase2.from("users").select(USER_SELECT).eq("id", userId).maybeSingle();
  if (error) throw error;
  return user;
}
async function GET$7(request) {
  try {
    const refreshToken = readCookie(request, REMEMBER_SESSION_COOKIE);
    if (!refreshToken) {
      return Response.json({ error: "No remembered session" }, { status: 401 });
    }
    const authClient = createSupabaseAuthClient();
    const { data, error } = await authClient.auth.refreshSession({
      refresh_token: decodeURIComponent(refreshToken)
    });
    if (error || !data?.session?.access_token || !data?.session?.refresh_token || !data?.user?.id) {
      return Response.json(
        { error: "Remembered session expired" },
        {
          status: 401,
          headers: {
            "Set-Cookie": buildClearRememberSessionCookie(request)
          }
        }
      );
    }
    const user = await loadProfile(data.user.id);
    if (!user) {
      return Response.json(
        { error: "Profile not found" },
        {
          status: 404,
          headers: {
            "Set-Cookie": buildClearRememberSessionCookie(request)
          }
        }
      );
    }
    return Response.json(
      {
        user,
        token: data.session.access_token,
        expires_at: data.session.expires_at ?? null,
        message: "Session restored"
      },
      {
        headers: {
          "Set-Cookie": buildRememberSessionCookie(request, data.session.refresh_token)
        }
      }
    );
  } catch (err) {
    console.error("[GET /api/auth/session]", err);
    return Response.json({ error: "Failed to restore session" }, { status: 500 });
  }
}
const __vite_glob_0_5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$7
}, Symbol.toStringTag, { value: "Module" }));
const ROLE_ALIASES = {
  requester: "patient",
  patient_family: "patient",
  patient: "patient",
  hospital: "hospital_staff",
  hospital_officer: "hospital_staff",
  hospital_staff: "hospital_staff",
  donor: "donor",
  admin: "admin"
};
function getBearerToken(request) {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" ? token : null;
}
function getCanonicalRole(role) {
  return ROLE_ALIASES[role] ?? role;
}
function hasRole(user, allowedRoles) {
  const userRole = getCanonicalRole(user?.role);
  if (userRole === "admin") return true;
  return (allowedRoles ?? []).map(getCanonicalRole).includes(userRole);
}
async function requireAuth(request, allowedRoles) {
  const token = getBearerToken(request);
  if (!token) {
    return {
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
      user: null
    };
  }
  const authClient = createSupabaseAuthClient();
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  const authUser = authData?.user;
  if (authError || !authUser) {
    return {
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
      user: null
    };
  }
  const supabase2 = createSupabaseServerClient();
  const { data: profile, error: profileError } = await supabase2.from("users").select("id, email, role").eq("id", authUser.id).maybeSingle();
  if (profileError || !profile) {
    return {
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
      user: null
    };
  }
  const claims = {
    sub: authUser.id,
    email: authUser.email ?? profile.email ?? null,
    role: profile.role
  };
  if (allowedRoles?.length && !hasRole(claims, allowedRoles)) {
    return {
      error: Response.json({ error: "Forbidden" }, { status: 403 }),
      user: null
    };
  }
  return { error: null, user: claims };
}
async function loadAcceptedPatientDonorMatch(supabase2, matchId, auth) {
  if (!matchId) {
    return {
      error: Response.json({ error: "match_id is required" }, { status: 400 })
    };
  }
  const { data: match, error: matchError } = await supabase2.from("matches").select("*").eq("id", matchId).maybeSingle();
  if (matchError) throw matchError;
  if (!match) {
    return {
      error: Response.json({ error: "Match not found" }, { status: 404 })
    };
  }
  if (match.match_status !== "Accepted") {
    return {
      error: Response.json({ error: "Chat and tracking unlock after donor acceptance" }, { status: 403 })
    };
  }
  const { data: bloodRequest, error: requestError } = await supabase2.from("blood_requests").select("*").eq("id", match.request_id).maybeSingle();
  if (requestError) throw requestError;
  if (!bloodRequest) {
    return {
      error: Response.json({ error: "Request not found" }, { status: 404 })
    };
  }
  const role = getCanonicalRole(auth.user.role);
  const isAcceptedDonor = role === "donor" && match.donor_id === auth.user.sub;
  const isMatchedPatient = role === "patient" && bloodRequest.requested_by === auth.user.sub;
  if (!isAcceptedDonor && !isMatchedPatient) {
    return {
      error: Response.json({ error: "Forbidden" }, { status: 403 })
    };
  }
  return {
    error: null,
    match,
    bloodRequest,
    participantRole: isAcceptedDonor ? "donor" : "patient"
  };
}
const QUICK_REPLIES = {
  on_the_way: "I'm on my way",
  delayed: "I'm delayed",
  arrived: "I've arrived"
};
function getMatchId$1(request) {
  return new URL(request.url).searchParams.get("match_id");
}
function createUserSupabaseClient$6(request) {
  const token = getBearerToken(request);
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || !token) {
    throw new Error("Supabase authenticated client configuration is missing");
  }
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}
async function GET$6(request) {
  try {
    const auth = await requireAuth(request, ["donor", "patient"]);
    if (auth.error) return auth.error;
    const matchId = getMatchId$1(request);
    const supabase2 = createSupabaseServerClient();
    const access = await loadAcceptedPatientDonorMatch(supabase2, matchId, auth);
    if (access.error) return access.error;
    const userSupabase = createUserSupabaseClient$6(request);
    const { data: messages, error } = await userSupabase.from("chat_messages").select("id, match_id, sender_id, message, quick_type, created_at").eq("match_id", matchId).order("created_at", { ascending: true }).limit(100);
    if (error) throw error;
    return Response.json({
      messages: messages ?? [],
      match: access.match,
      request: access.bloodRequest,
      participant_role: access.participantRole,
      quick_replies: QUICK_REPLIES
    });
  } catch (err) {
    console.error("[GET /api/matches/chat]", err);
    return Response.json({ error: "Failed to load chat" }, { status: 500 });
  }
}
async function POST$6(request) {
  try {
    const auth = await requireAuth(request, ["donor", "patient"]);
    if (auth.error) return auth.error;
    const body = await request.json();
    const matchId = body.match_id;
    const quickType = body.quick_type ?? null;
    const quickMessage = quickType ? QUICK_REPLIES[quickType] : null;
    const message = (quickMessage ?? String(body.message ?? "")).trim();
    if (!message) {
      return Response.json({ error: "message is required" }, { status: 400 });
    }
    if (message.length > 500) {
      return Response.json({ error: "message must be 500 characters or fewer" }, { status: 400 });
    }
    if (quickType && !quickMessage) {
      return Response.json({ error: "quick_type is invalid" }, { status: 400 });
    }
    const supabase2 = createSupabaseServerClient();
    const access = await loadAcceptedPatientDonorMatch(supabase2, matchId, auth);
    if (access.error) return access.error;
    const userSupabase = createUserSupabaseClient$6(request);
    const { data: insertedMessage, error } = await userSupabase.from("chat_messages").insert({
      match_id: matchId,
      sender_id: auth.user.sub,
      message,
      quick_type: quickType
    }).select("id, match_id, sender_id, message, quick_type, created_at").single();
    if (error) throw error;
    if (access.participantRole === "donor" && quickType === "on_the_way" && !access.match.on_the_way_at) {
      await supabase2.from("matches").update({ on_the_way_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", matchId).eq("donor_id", auth.user.sub);
    }
    if (access.participantRole === "donor" && quickType === "arrived" && !access.match.arrived_at) {
      await supabase2.from("matches").update({ arrived_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", matchId).eq("donor_id", auth.user.sub);
    }
    return Response.json({ message: insertedMessage });
  } catch (err) {
    console.error("[POST /api/matches/chat]", err);
    return Response.json({ error: "Failed to send message" }, { status: 500 });
  }
}
const __vite_glob_0_6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$6,
  POST: POST$6
}, Symbol.toStringTag, { value: "Module" }));
function unique(values) {
  return [...new Set(values.filter(Boolean))];
}
function requestRecipientIds(request) {
  return unique([request?.requested_by, request?.hospital_id]);
}
async function createNotifications(supabase2, notifications) {
  const rows = (notifications ?? []).filter((notification) => notification?.user_id).map((notification) => ({
    user_id: notification.user_id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    request_id: notification.request_id ?? null,
    match_id: notification.match_id ?? null,
    deliver_at: notification.deliver_at ?? (/* @__PURE__ */ new Date()).toISOString()
  }));
  if (!rows.length) return { count: 0 };
  const { error } = await supabase2.from("notifications").insert(rows);
  if (error) throw error;
  return { count: rows.length };
}
async function notifyRequestRecipients(supabase2, request, notification) {
  return createNotifications(
    supabase2,
    requestRecipientIds(request).map((userId) => ({
      ...notification,
      user_id: userId,
      request_id: notification.request_id ?? request?.id ?? null
    }))
  );
}
const ACTIONS = {
  arrived: {
    matchField: "arrived_at",
    requestStatus: "checked_in",
    message: "Donor marked as arrived.",
    notificationTitle: "Donor arrived"
  },
  blood_collected: {
    matchField: "blood_collected_at",
    requestStatus: "blood_collected",
    message: "Blood collection recorded.",
    notificationTitle: "Blood collected"
  },
  donation_completed: {
    matchField: "donation_completed_at",
    requestStatus: "fulfilled",
    message: "Donation completed.",
    notificationTitle: "Donation completed"
  }
};
function createUserSupabaseClient$5(request) {
  const token = getBearerToken(request);
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || !token) {
    throw new Error("Supabase authenticated client configuration is missing");
  }
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}
function rpcErrorResponse$2(error) {
  const message = error?.message ?? "Failed to update hospital match status";
  if (message.includes("not found")) {
    return Response.json({ error: message }, { status: 404 });
  }
  if (message.includes("Forbidden")) {
    return Response.json({ error: message }, { status: 403 });
  }
  if (message.includes("Only accepted") || message.includes("before") || message.includes("already")) {
    return Response.json({ error: message }, { status: 409 });
  }
  return Response.json({ error: "Failed to update hospital match status" }, { status: 500 });
}
async function POST$5(request) {
  try {
    const auth = await requireAuth(request, ["hospital_staff", "admin"]);
    if (auth.error) return auth.error;
    const body = await request.json();
    const matchId = body.match_id;
    const action = ACTIONS[body.action];
    if (!matchId) {
      return Response.json({ error: "match_id is required" }, { status: 400 });
    }
    if (!action) {
      return Response.json(
        { error: "action must be arrived, blood_collected, or donation_completed" },
        { status: 400 }
      );
    }
    const supabase2 = createSupabaseServerClient();
    const userSupabase = createUserSupabaseClient$5(request);
    const { data: result, error } = await userSupabase.rpc("mark_hospital_status", {
      p_match_id: matchId,
      p_action: body.action
    });
    if (error) throw error;
    const updatedMatch = result?.match;
    const updatedRequest = result?.request;
    const nextRequestStatus = result?.new_status;
    const bloodRequest = updatedRequest;
    const match = updatedMatch;
    const recipients = [...requestRecipientIds(bloodRequest), match.donor_id];
    await createNotifications(
      supabase2,
      [...new Set(recipients.filter(Boolean))].map((userId) => ({
        user_id: userId,
        type: "hospital_status_update",
        title: action.notificationTitle,
        message: `${bloodRequest.blood_type_needed} request at ${bloodRequest.hospital_name} is now ${nextRequestStatus.replaceAll("_", " ")}.`,
        request_id: match.request_id,
        match_id: match.id
      }))
    );
    return Response.json({
      message: action.message,
      match: updatedMatch,
      request: updatedRequest,
      new_status: nextRequestStatus,
      verified_by: auth.user.sub
    });
  } catch (err) {
    console.error("[POST /api/matches/hospital-status]", err);
    return rpcErrorResponse$2(err);
  }
}
const __vite_glob_0_7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$5
}, Symbol.toStringTag, { value: "Module" }));
const DEFAULT_OTP_TTL_MINUTES = 15;
function getOtpSecret() {
  const secret = process.env.OTP_SECRET || process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("OTP_SECRET or AUTH_SECRET is required for OTP hashing");
  }
  return secret;
}
function getOtpTtlMinutes() {
  const value = Number.parseInt(process.env.OTP_TTL_MINUTES ?? "", 10);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_OTP_TTL_MINUTES;
}
function getOtpTtlSeconds() {
  return getOtpTtlMinutes() * 60;
}
function generateOtp() {
  return String(randomInt(1e5, 1e6));
}
function hashOtp(otp) {
  const salt = randomBytes(16).toString("hex");
  const digest = createHmac("sha256", getOtpSecret()).update(`${salt}:${otp}`).digest("hex");
  return `hmac-sha256$${salt}$${digest}`;
}
function verifyOtpHash(otp, storedHash) {
  const [scheme, salt, expected] = String(storedHash ?? "").split("$");
  if (scheme !== "hmac-sha256" || !salt || !expected) return false;
  const actual = createHmac("sha256", getOtpSecret()).update(`${salt}:${otp}`).digest("hex");
  const actualBuffer = Buffer.from(actual, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}
function minutesFromNow(n) {
  return new Date(Date.now() + n * 6e4).toISOString();
}
async function readJsonBody(request) {
  try {
    return { body: await request.json(), error: null };
  } catch (error) {
    console.error("[POST /api/matches/respond] Invalid JSON body", error);
    return {
      body: null,
      error: Response.json({ error: "Invalid JSON body" }, { status: 400 })
    };
  }
}
function createUserSupabaseClient$4(request) {
  const token = getBearerToken(request);
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || !token) {
    throw new Error("Supabase authenticated client configuration is missing");
  }
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}
function rpcErrorResponse$1(error) {
  const message = error?.message ?? "Failed to update match";
  if (message.includes("not found")) {
    return Response.json({ error: message }, { status: 404 });
  }
  if (message.includes("already") || message.includes("cooldown")) {
    return Response.json({ error: message }, { status: 409 });
  }
  if (message.includes("not currently available") || message.includes("not verified") || message.includes("suspended") || message.includes("inactive") || message.includes("opted out")) {
    return Response.json({ error: message }, { status: 403 });
  }
  return Response.json({ error: "Failed to update match" }, { status: 500 });
}
async function resolveDonorMatch(supabase2, { requestId: requestId2, matchId, donorId }) {
  if (!requestId2 && !matchId) {
    return {
      error: Response.json({ error: "request_id is required" }, { status: 400 }),
      match: null
    };
  }
  let query = supabase2.from("matches").select("id, request_id, donor_id, match_status").eq("donor_id", donorId);
  query = requestId2 ? query.eq("request_id", requestId2) : query.eq("id", matchId);
  const { data, error } = await query.limit(1);
  if (error) throw error;
  const match = Array.isArray(data) ? data[0] : data;
  if (!match) {
    return {
      error: Response.json(
        { error: "Request not found or not assigned to this donor" },
        { status: 404 }
      ),
      match: null
    };
  }
  if (match.match_status !== "Alerted") {
    return {
      error: Response.json(
        { error: "Match already responded to" },
        { status: 409 }
      ),
      match: null
    };
  }
  return { error: null, match };
}
function getReturnedRequest(result) {
  const bloodRequest = result?.request;
  if (!bloodRequest?.id) {
    throw new Error("Match response did not return request details");
  }
  return bloodRequest;
}
async function POST$4(request) {
  try {
    const auth = await requireAuth(request, ["donor"]);
    if (auth.error) return auth.error;
    const { body, error: bodyError } = await readJsonBody(request);
    if (bodyError) return bodyError;
    const { request_id, match_id, decision } = body ?? {};
    if (!request_id && !match_id) {
      return Response.json({ error: "request_id is required" }, { status: 400 });
    }
    if (!["Accepted", "Declined"].includes(decision)) {
      return Response.json(
        { error: "decision must be Accepted or Declined" },
        { status: 400 }
      );
    }
    const userSupabase = createUserSupabaseClient$4(request);
    const supabase2 = createSupabaseServerClient();
    const { error: matchError, match } = await resolveDonorMatch(supabase2, {
      requestId: request_id,
      matchId: match_id,
      donorId: auth.user.sub
    });
    if (matchError) return matchError;
    const resolvedMatchId = match.id;
    if (decision === "Declined") {
      const { data: result2, error } = await userSupabase.rpc("respond_to_match", {
        p_match_id: resolvedMatchId,
        p_decision: decision,
        p_secure_otp: null,
        p_expires_at: null
      });
      if (error) throw error;
      const bloodRequest2 = getReturnedRequest(result2);
      await createNotifications(supabase2, [
        {
          user_id: auth.user.sub,
          type: "match_declined",
          title: "Match declined",
          message: `You declined the ${bloodRequest2.blood_type_needed} request at ${bloodRequest2.hospital_name}.`,
          request_id: bloodRequest2.id,
          match_id: resolvedMatchId
        },
        ...requestRecipientIds(bloodRequest2).map((userId) => ({
          user_id: userId,
          type: "match_declined",
          title: "Donor declined",
          message: `A donor declined the ${bloodRequest2.blood_type_needed} request at ${bloodRequest2.hospital_name}.`,
          request_id: bloodRequest2.id,
          match_id: resolvedMatchId
        }))
      ]);
      return Response.json({
        message: "Match declined",
        request_id: bloodRequest2.id,
        match_id: resolvedMatchId,
        status: "Declined"
      });
    }
    const otp = generateOtp();
    const expiresAt = minutesFromNow(getOtpTtlMinutes());
    const { data: result, error: responseError } = await userSupabase.rpc("respond_to_match", {
      p_match_id: resolvedMatchId,
      p_decision: decision,
      p_secure_otp: hashOtp(otp),
      p_expires_at: expiresAt
    });
    if (responseError) throw responseError;
    const bloodRequest = getReturnedRequest(result);
    const token = result?.token;
    await createNotifications(supabase2, [
      {
        user_id: auth.user.sub,
        type: "match_accepted",
        title: "Match accepted",
        message: `You accepted the ${bloodRequest.blood_type_needed} request at ${bloodRequest.hospital_name}.`,
        request_id: bloodRequest.id,
        match_id: resolvedMatchId
      },
      ...requestRecipientIds(bloodRequest).map((userId) => ({
        user_id: userId,
        type: "match_accepted",
        title: "Donor accepted",
        message: `A donor accepted the ${bloodRequest.blood_type_needed} request at ${bloodRequest.hospital_name}.`,
        request_id: bloodRequest.id,
        match_id: resolvedMatchId
      }))
    ]);
    return Response.json({
      message: "Match accepted",
      request_id: bloodRequest.id,
      match_id: resolvedMatchId,
      status: "Accepted",
      otp,
      expires_at: expiresAt,
      otp_ttl_seconds: getOtpTtlSeconds(),
      token_id: token?.id ?? null,
      unlocked_routes: {
        chat: `/matches/${resolvedMatchId}/chat`,
        tracking: `/matches/${resolvedMatchId}/tracking`,
        checkin: `/donor/match/${resolvedMatchId}/checkin`
      },
      request: result?.request ?? null
    });
  } catch (err) {
    console.error("[POST /api/matches/respond]", err);
    return rpcErrorResponse$1(err);
  }
}
const __vite_glob_0_8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$4
}, Symbol.toStringTag, { value: "Module" }));
function byId(rows) {
  return new Map((rows ?? []).map((row) => [row.id, row]));
}
async function GET$5(request) {
  try {
    const auth = await requireAuth(request, ["donor", "patient", "hospital_staff", "admin"]);
    if (auth.error) return auth.error;
    const role = getCanonicalRole(auth.user.role);
    const supabase2 = createSupabaseServerClient();
    const url = new URL(request.url);
    const matchId = url.searchParams.get("id");
    const requestId2 = url.searchParams.get("request_id");
    let matchesQuery = supabase2.from("matches").select("*").order("match_rank", { ascending: true });
    if (matchId) matchesQuery = matchesQuery.eq("id", matchId);
    if (requestId2) matchesQuery = matchesQuery.eq("request_id", requestId2);
    if (role === "donor") {
      matchesQuery = matchesQuery.eq("donor_id", auth.user.sub).in("match_status", ["Alerted", "Accepted"]);
    } else if (role !== "admin") {
      let requestQuery = supabase2.from("blood_requests").select("id");
      if (role === "hospital_staff") {
        requestQuery = requestQuery.or(
          `requested_by.eq.${auth.user.sub},hospital_id.eq.${auth.user.sub}`
        );
      } else {
        requestQuery = requestQuery.eq("requested_by", auth.user.sub);
      }
      if (requestId2) requestQuery = requestQuery.eq("id", requestId2);
      const { data: ownedRequests, error: ownedError } = await requestQuery;
      if (ownedError) throw ownedError;
      const ownedRequestIds = (ownedRequests ?? []).map((row) => row.id);
      if (!ownedRequestIds.length) {
        return Response.json({ matches: [] });
      }
      matchesQuery = matchesQuery.in("request_id", ownedRequestIds);
    }
    const { data: matches, error } = await matchesQuery;
    if (error) throw error;
    const requestIds = [...new Set((matches ?? []).map((m) => m.request_id))];
    const donorIds = [...new Set((matches ?? []).map((m) => m.donor_id))];
    const [{ data: requests, error: requestsError }, { data: donors, error: donorsError }] = await Promise.all([
      requestIds.length ? supabase2.from("blood_requests").select("*").in("id", requestIds) : { data: [], error: null },
      donorIds.length ? supabase2.from("users").select("id, full_name, blood_type, location, phone").in("id", donorIds) : { data: [], error: null }
    ]);
    if (requestsError) throw requestsError;
    if (donorsError) throw donorsError;
    const requestsById = byId(requests);
    const donorsById = byId(donors);
    return Response.json({
      matches: (matches ?? []).map((match) => ({
        ...match,
        request: requestsById.get(match.request_id) ?? null,
        donor: donorsById.get(match.donor_id) ?? null
      }))
    });
  } catch (err) {
    console.error("[GET /api/matches]", err);
    return Response.json({ error: "Failed to load matches" }, { status: 500 });
  }
}
const __vite_glob_0_9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$5
}, Symbol.toStringTag, { value: "Module" }));
function deliveryForRequest(bloodRequest) {
  if (bloodRequest?.request_type !== "Scheduled" || !bloodRequest?.scheduled_for) {
    return (/* @__PURE__ */ new Date()).toISOString();
  }
  const deliverAt = new Date(bloodRequest.scheduled_for).getTime() - 2 * 864e5;
  return new Date(Math.max(Date.now(), deliverAt)).toISOString();
}
function canOwnRequest(role, userId, bloodRequest) {
  return role === "admin" || bloodRequest?.requested_by === userId || bloodRequest?.hospital_id === userId;
}
async function POST$3(request) {
  try {
    const auth = await requireAuth(request, ["patient", "hospital_staff", "admin"]);
    if (auth.error) return auth.error;
    const body = await request.json();
    const requestId2 = body.request_id;
    const matchIds = Array.isArray(body.match_ids) ? [...new Set(body.match_ids.filter(Boolean))] : [];
    if (!requestId2) {
      return Response.json({ error: "request_id is required" }, { status: 400 });
    }
    if (!matchIds.length) {
      return Response.json({ error: "match_ids is required" }, { status: 400 });
    }
    const role = getCanonicalRole(auth.user.role);
    if (role === "patient" && matchIds.length > 4) {
      return Response.json(
        { error: "Patient requests can be sent to at most 4 donors" },
        { status: 400 }
      );
    }
    const supabase2 = createSupabaseServerClient();
    const { data: bloodRequest, error: requestError } = await supabase2.from("blood_requests").select("id, hospital_name, blood_type_needed, requested_by, hospital_id, request_type, scheduled_for").eq("id", requestId2).maybeSingle();
    if (requestError) throw requestError;
    if (!bloodRequest || !canOwnRequest(role, auth.user.sub, bloodRequest)) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }
    const { data: matches, error: matchError } = await supabase2.from("matches").select("id, donor_id, match_status, request_id").eq("request_id", requestId2).in("id", matchIds);
    if (matchError) throw matchError;
    if ((matches ?? []).length !== matchIds.length) {
      return Response.json({ error: "One or more matches were not found" }, { status: 404 });
    }
    const invalidMatch = (matches ?? []).find((match) => match.match_status !== "Candidate");
    if (invalidMatch) {
      return Response.json(
        { error: "Only candidate matches can be sent to donors" },
        { status: 409 }
      );
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const { error: updateError } = await supabase2.from("matches").update({
      match_status: "Alerted",
      selected_at: now,
      notified_at: now
    }).in("id", matchIds).eq("request_id", requestId2);
    if (updateError) throw updateError;
    const deliverAt = deliveryForRequest(bloodRequest);
    await createNotifications(supabase2, [
      ...(matches ?? []).map((match) => ({
        user_id: match.donor_id,
        type: "donor_matched",
        title: "New donor request",
        message: `${bloodRequest.blood_type_needed} needed at ${bloodRequest.hospital_name}.`,
        request_id: requestId2,
        match_id: match.id,
        deliver_at: deliverAt
      })),
      ...requestRecipientIds(bloodRequest).map((userId) => ({
        user_id: userId,
        type: "donor_matched",
        title: "Donor requests sent",
        message: `${matches.length} donor request${matches.length === 1 ? "" : "s"} sent for ${bloodRequest.blood_type_needed}.`,
        request_id: requestId2,
        deliver_at: deliverAt
      }))
    ]);
    await supabase2.from("blood_requests").update({ matching_status: "sent" }).eq("id", requestId2);
    return Response.json({
      message: "Requests sent to selected donors",
      request_id: requestId2,
      sent_count: matches.length
    });
  } catch (err) {
    console.error("[POST /api/matches/send]", err);
    return Response.json({ error: "Failed to send donor requests" }, { status: 500 });
  }
}
const __vite_glob_0_10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$3
}, Symbol.toStringTag, { value: "Module" }));
const TRAVEL_STATUSES = /* @__PURE__ */ new Set(["on_the_way", "arrived"]);
function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
function getMatchId(request) {
  return new URL(request.url).searchParams.get("match_id");
}
function createUserSupabaseClient$3(request) {
  const token = getBearerToken(request);
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || !token) {
    throw new Error("Supabase authenticated client configuration is missing");
  }
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}
async function GET$4(request) {
  try {
    const auth = await requireAuth(request, ["donor", "patient"]);
    if (auth.error) return auth.error;
    const matchId = getMatchId(request);
    const supabase2 = createSupabaseServerClient();
    const access = await loadAcceptedPatientDonorMatch(supabase2, matchId, auth);
    if (access.error) return access.error;
    const userSupabase = createUserSupabaseClient$3(request);
    const { data: locations, error } = await userSupabase.from("donor_locations").select("id, match_id, donor_id, latitude, longitude, distance_km, eta_minutes, status, created_at").eq("match_id", matchId).order("created_at", { ascending: false }).limit(20);
    if (error) throw error;
    return Response.json({
      match: access.match,
      request: access.bloodRequest,
      participant_role: access.participantRole,
      latest_location: locations?.[0] ?? null,
      locations: locations ?? []
    });
  } catch (err) {
    console.error("[GET /api/matches/tracking]", err);
    return Response.json({ error: "Failed to load tracking" }, { status: 500 });
  }
}
async function POST$2(request) {
  try {
    const auth = await requireAuth(request, ["donor"]);
    if (auth.error) return auth.error;
    const body = await request.json();
    const matchId = body.match_id;
    const latitude = toNumber(body.latitude);
    const longitude = toNumber(body.longitude);
    const status = body.status ?? "on_the_way";
    if (!TRAVEL_STATUSES.has(status)) {
      return Response.json({ error: "status must be on_the_way or arrived" }, { status: 400 });
    }
    if (latitude === null || latitude < -90 || latitude > 90) {
      return Response.json({ error: "valid latitude is required" }, { status: 400 });
    }
    if (longitude === null || longitude < -180 || longitude > 180) {
      return Response.json({ error: "valid longitude is required" }, { status: 400 });
    }
    const supabase2 = createSupabaseServerClient();
    const access = await loadAcceptedPatientDonorMatch(supabase2, matchId, auth);
    if (access.error) return access.error;
    if (access.participantRole !== "donor" || access.match.donor_id !== auth.user.sub) {
      return Response.json({ error: "Only the accepted donor can update tracking" }, { status: 403 });
    }
    if (access.match.arrived_at && status !== "arrived") {
      return Response.json({ error: "Location updates are closed after arrival" }, { status: 409 });
    }
    const userSupabase = createUserSupabaseClient$3(request);
    const { data: result, error } = await userSupabase.rpc("update_tracking", {
      p_match_id: matchId,
      p_latitude: latitude,
      p_longitude: longitude,
      p_status: status
    });
    if (error) throw error;
    return Response.json({ location: result?.location ?? null });
  } catch (err) {
    console.error("[POST /api/matches/tracking]", err);
    return Response.json({ error: "Failed to update tracking" }, { status: 500 });
  }
}
const __vite_glob_0_11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$4,
  POST: POST$2
}, Symbol.toStringTag, { value: "Module" }));
function createUserSupabaseClient$2(request) {
  const token = getBearerToken(request);
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || !token) {
    throw new Error("Supabase authenticated client configuration is missing");
  }
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}
async function GET$3(request) {
  try {
    const auth = await requireAuth(request, ["donor", "patient", "hospital_staff", "admin"]);
    if (auth.error) return auth.error;
    const url = new URL(request.url);
    const limit = Math.min(Number.parseInt(url.searchParams.get("limit") ?? "50", 10), 100);
    const unreadOnly = url.searchParams.get("unread") === "true";
    const userSupabase = createUserSupabaseClient$2(request);
    let query = userSupabase.from("notifications").select("*").eq("user_id", auth.user.sub).lte("deliver_at", (/* @__PURE__ */ new Date()).toISOString()).order("created_at", { ascending: false }).limit(limit);
    if (unreadOnly) {
      query = query.is("read_at", null);
    }
    const [{ data: notifications, error }, { count, error: countError }] = await Promise.all([
      query,
      userSupabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", auth.user.sub).lte("deliver_at", (/* @__PURE__ */ new Date()).toISOString()).is("read_at", null)
    ]);
    if (error) throw error;
    if (countError) throw countError;
    return Response.json({
      notifications: notifications ?? [],
      unread_count: count ?? 0
    });
  } catch (err) {
    console.error("[GET /api/notifications]", err);
    return Response.json(
      { error: "Failed to load notifications" },
      { status: 500 }
    );
  }
}
async function PATCH$2(request) {
  try {
    const auth = await requireAuth(request, ["donor", "patient", "hospital_staff", "admin"]);
    if (auth.error) return auth.error;
    const body = await request.json();
    const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : null;
    const read = body.read !== false;
    const readAt = read ? (/* @__PURE__ */ new Date()).toISOString() : null;
    const userSupabase = createUserSupabaseClient$2(request);
    let update = userSupabase.from("notifications").update({ read_at: readAt }).eq("user_id", auth.user.sub);
    if (ids?.length) {
      update = update.in("id", ids);
    }
    const { error } = await update;
    if (error) throw error;
    return Response.json({ message: read ? "Notifications marked read" : "Notifications marked unread" });
  } catch (err) {
    console.error("[PATCH /api/notifications]", err);
    return Response.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
const __vite_glob_0_12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$3,
  PATCH: PATCH$2
}, Symbol.toStringTag, { value: "Module" }));
const store = /* @__PURE__ */ new Map();
function saveBypassUser(email, user) {
  store.set(email, user);
}
function normalizeRole(role) {
  return ["donor", "requester", "hospital"].includes(role) ? role : null;
}
const SAFE_USER_SELECT = "id, full_name, email, phone, role, blood_type, location, availability_status, is_verified, last_donation_at, created_at";
async function GET$2(request) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) return auth.error;
    const supabase2 = createSupabaseServerClient();
    const { data: user, error } = await supabase2.from("users").select(SAFE_USER_SELECT).eq("id", auth.user.sub).maybeSingle();
    if (error) throw error;
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    return Response.json({ user });
  } catch (err) {
    console.error("[GET /api/profile]", err);
    return Response.json({ error: "Failed to load profile" }, { status: 500 });
  }
}
async function PATCH$1(request) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) return auth.error;
    const body = await request.json();
    const {
      id,
      full_name,
      phone,
      role,
      blood_type,
      location,
      availability_status,
      email
    } = body;
    if (!id) {
      return Response.json({ error: "id is required" }, { status: 400 });
    }
    if (id !== auth.user.sub) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!full_name?.trim()) {
      return Response.json({ error: "full_name is required" }, { status: 400 });
    }
    const normalizedRole = role ? normalizeRole(role) : null;
    if (role && !normalizedRole) {
      return Response.json(
        { error: "role must be donor, requester, or hospital" },
        { status: 400 }
      );
    }
    if (normalizedRole && getCanonicalRole(normalizedRole) !== getCanonicalRole(auth.user.role)) {
      return Response.json({ error: "Role changes require admin approval" }, { status: 403 });
    }
    if (getCanonicalRole(auth.user.role) === "donor" && !blood_type) {
      return Response.json(
        { error: "blood_type is required for donor role" },
        { status: 400 }
      );
    }
    const payload = {
      id,
      full_name: full_name.trim(),
      phone: phone?.trim() ?? null,
      role: normalizeRole(auth.user.role) ?? auth.user.role,
      blood_type: blood_type ?? null,
      location: location?.trim() ?? null,
      availability_status: availability_status ? 1 : 0
    };
    if (process.env.NODE_ENV !== "production" && process.env.BYPASS_REGISTER_DB === "true") {
      const normalizedEmail = normalizeEmail(email);
      if (!normalizedEmail) {
        return Response.json({ error: "email is required" }, { status: 400 });
      }
      const user2 = {
        ...payload,
        email: normalizedEmail,
        is_verified: 1,
        reward_points: 0,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      saveBypassUser(normalizedEmail, user2);
      return Response.json({ user: user2, message: "Profile updated (dev)" });
    }
    const supabase2 = createSupabaseServerClient();
    const { data: user, error } = await supabase2.from("users").update({
      full_name: payload.full_name,
      phone: payload.phone,
      blood_type: payload.blood_type,
      location: payload.location,
      availability_status: payload.availability_status
    }).eq("id", id).select(SAFE_USER_SELECT).single();
    if (error) {
      throw error;
    }
    return Response.json({ user, message: "Profile updated" });
  } catch (err) {
    console.error("[PATCH /api/profile]", err);
    return Response.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
const __vite_glob_0_13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$2,
  PATCH: PATCH$1
}, Symbol.toStringTag, { value: "Module" }));
const DELETE_AFTER_MS = 24 * 60 * 60 * 1e3;
const REQUEST_TYPES_BY_DONOR$1 = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
  AB: ["AB-", "AB+"]
};
function getRequestId(request, params) {
  if (params?.requestId) return params.requestId;
  const pathname = new URL(request.url).pathname;
  return decodeURIComponent(pathname.split("/").filter(Boolean).pop() ?? "");
}
async function donorHasAssignedMatch(supabase2, requestId2, donorId) {
  const { data, error } = await supabase2.from("matches").select("id").eq("request_id", requestId2).eq("donor_id", donorId).neq("match_status", "Declined").maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
async function donorCanReadCompatibleRequest(supabase2, bloodRequest, donorId) {
  if (["fulfilled", "cancelled", "Completed", "Cancelled"].includes(bloodRequest.status)) return false;
  const { data: donor, error } = await supabase2.from("users").select("blood_type").eq("id", donorId).maybeSingle();
  if (error) throw error;
  const compatibleRequestTypes = REQUEST_TYPES_BY_DONOR$1[donor?.blood_type] ?? [];
  return compatibleRequestTypes.some(
    (type) => requestIncludesBloodType(bloodRequest.blood_type_needed, type)
  );
}
async function GET$1(request, context = {}) {
  try {
    const auth = await requireAuth(request, ["patient", "donor", "hospital_staff", "admin"]);
    if (auth.error) return auth.error;
    const params = await context.params;
    const requestId2 = getRequestId(request, params);
    if (!requestId2) {
      return Response.json({ error: "request_id is required" }, { status: 400 });
    }
    const supabase2 = createSupabaseServerClient();
    const { data: bloodRequest, error } = await supabase2.from("blood_requests").select("*").eq("id", requestId2).maybeSingle();
    if (error) throw error;
    if (!bloodRequest) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }
    const role = getCanonicalRole(auth.user.role);
    let authorized = role === "admin" || bloodRequest.requested_by === auth.user.sub || bloodRequest.hospital_id === auth.user.sub;
    if (!authorized && role === "donor") {
      authorized = await donorHasAssignedMatch(supabase2, requestId2, auth.user.sub) || await donorCanReadCompatibleRequest(supabase2, bloodRequest, auth.user.sub);
    }
    if (!authorized) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }
    return Response.json({ request: bloodRequest });
  } catch (err) {
    console.error("[GET /api/requests/:id]", err);
    return Response.json(
      { error: "Failed to fetch request" },
      { status: 500 }
    );
  }
}
async function DELETE(request, context = {}) {
  try {
    const auth = await requireAuth(request, ["patient", "hospital_staff", "admin"]);
    if (auth.error) return auth.error;
    const params = await context.params;
    const requestId2 = getRequestId(request, params);
    if (!requestId2) {
      return Response.json({ error: "request_id is required" }, { status: 400 });
    }
    const supabase2 = createSupabaseServerClient();
    const { data: bloodRequest, error: lookupError } = await supabase2.from("blood_requests").select("id, requested_by, hospital_id, created_at").eq("id", requestId2).maybeSingle();
    if (lookupError) throw lookupError;
    if (!bloodRequest) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }
    const role = getCanonicalRole(auth.user.role);
    const authorized = role === "admin" || bloodRequest.requested_by === auth.user.sub || bloodRequest.hospital_id === auth.user.sub;
    if (!authorized) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }
    const createdAt = new Date(bloodRequest.created_at).getTime();
    if (!Number.isFinite(createdAt) || Date.now() - createdAt < DELETE_AFTER_MS) {
      return Response.json(
        { error: "Requests can only be deleted after 24 hours" },
        { status: 409 }
      );
    }
    const { error: notificationDeleteError } = await supabase2.from("notifications").delete().eq("request_id", requestId2);
    if (notificationDeleteError) throw notificationDeleteError;
    const { error: matchDeleteError } = await supabase2.from("matches").delete().eq("request_id", requestId2);
    if (matchDeleteError) throw matchDeleteError;
    const { error: requestDeleteError } = await supabase2.from("blood_requests").delete().eq("id", requestId2);
    if (requestDeleteError) throw requestDeleteError;
    return Response.json({ message: "Request deleted" });
  } catch (err) {
    console.error("[DELETE /api/requests/:id]", err);
    return Response.json(
      { error: "Failed to delete request" },
      { status: 500 }
    );
  }
}
const __vite_glob_0_14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DELETE,
  GET: GET$1
}, Symbol.toStringTag, { value: "Module" }));
async function createMatchesForRequest(supabase2, bloodRequest, options = {}) {
  if (!bloodRequest?.id) {
    return { inserted: 0, skipped: true };
  }
  const { data, error } = await supabase2.rpc("create_matches_for_request", {
    p_request_id: String(bloodRequest.id),
    p_limit: options.limit ?? null,
    p_status: options.status ?? "Candidate"
  });
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  const inserted = Number(result?.inserted ?? 0);
  const skipped = Boolean(result?.skipped);
  if (options.notify !== false) {
    const { data: matches, error: matchesError } = await supabase2.from("matches").select("id, donor_id, request_id").eq("request_id", bloodRequest.id).eq("match_status", options.status ?? "Candidate");
    if (matchesError) throw matchesError;
    const insertedMatches = matches ?? [];
    await createNotifications(supabase2, [
      ...insertedMatches.map((match) => ({
        user_id: match.donor_id,
        type: "donor_matched",
        title: "New donor match",
        message: `${bloodRequest.blood_type_needed} needed at ${bloodRequest.hospital_name}.`,
        request_id: bloodRequest.id,
        match_id: match.id,
        deliver_at: options.deliver_at
      })),
      ...requestRecipientIds(bloodRequest).map((userId) => ({
        user_id: userId,
        type: "donor_matched",
        title: "Donors matched",
        message: `${insertedMatches.length} donor match${insertedMatches.length === 1 ? "" : "es"} created for ${bloodRequest.blood_type_needed}.`,
        request_id: bloodRequest.id,
        deliver_at: options.deliver_at
      }))
    ]);
  }
  return { inserted, skipped };
}
const VALID_TIERS = ["Standard", "Urgent", "SOS"];
const VALID_REQUEST_TYPES = ["Scheduled", "Emergency"];
function notificationDeliveryFor(requestType, scheduledFor) {
  if (requestType !== "Scheduled" || !scheduledFor) return (/* @__PURE__ */ new Date()).toISOString();
  const deliverAt = new Date(scheduledFor).getTime() - 2 * 864e5;
  return new Date(Math.max(Date.now(), deliverAt)).toISOString();
}
function createUserSupabaseClient$1(request) {
  const token = getBearerToken(request);
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || !token) {
    throw new Error("Supabase authenticated client configuration is missing");
  }
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}
async function getRequestCreator(request) {
  const token = getBearerToken(request);
  if (!token) {
    return {
      error: Response.json(
        { error: "Unauthorized. Please sign in to create a blood request." },
        { status: 401 }
      ),
      user: null
    };
  }
  const authClient = createSupabaseAuthClient();
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  const authUser = authData?.user;
  if (authError || !authUser?.id) {
    return {
      error: Response.json(
        { error: "Unauthorized. Please sign in to create a blood request." },
        { status: 401 }
      ),
      user: null
    };
  }
  const supabase2 = createSupabaseServerClient();
  const { data: profile, error: profileError } = await supabase2.from("users").select("id, email, role").eq("id", authUser.id).maybeSingle();
  if (profileError) throw profileError;
  if (!profile) {
    return {
      error: Response.json(
        {
          error: "Your patient/family profile is missing. Please complete registration or contact support before creating a request."
        },
        { status: 409 }
      ),
      user: null
    };
  }
  const claims = {
    sub: authUser.id,
    email: authUser.email ?? profile.email ?? null,
    role: profile.role
  };
  if (!hasRole(claims, ["patient", "hospital_staff", "admin"])) {
    return {
      error: Response.json({ error: "Forbidden" }, { status: 403 }),
      user: null
    };
  }
  return { error: null, user: claims };
}
async function POST$1(request) {
  try {
    const auth = await getRequestCreator(request);
    if (auth.error) return auth.error;
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
    }
    const {
      hospital_name,
      blood_type_needed,
      urgency_tier,
      units_needed,
      patient_ref,
      location,
      latitude,
      longitude,
      urgency_note,
      hospital_id,
      request_type = "Emergency",
      scheduled_for
    } = body;
    if (!hospital_name?.trim()) {
      return Response.json({ error: "hospital_name is required" }, { status: 400 });
    }
    const selectedBloodTypes = normalizeBloodTypes(blood_type_needed);
    const serializedBloodTypes = serializeBloodTypes(selectedBloodTypes);
    if (!serializedBloodTypes) {
      return Response.json({ error: "blood_type_needed is required" }, { status: 400 });
    }
    if (units_needed == null) {
      return Response.json({ error: "units_needed is required" }, { status: 400 });
    }
    if (!VALID_TIERS.includes(urgency_tier)) {
      return Response.json(
        { error: "urgency_tier must be Standard, Urgent, or SOS" },
        { status: 400 }
      );
    }
    if (!VALID_REQUEST_TYPES.includes(request_type)) {
      return Response.json(
        { error: "request_type must be Scheduled or Emergency" },
        { status: 400 }
      );
    }
    const role = getCanonicalRole(auth.user.role);
    if (role === "patient" && selectedBloodTypes.length > 1) {
      return Response.json(
        { error: "Patient requests can include only one blood type" },
        { status: 400 }
      );
    }
    const unitCount = Number(units_needed);
    if (!Number.isInteger(unitCount) || unitCount < 1) {
      return Response.json(
        { error: "units_needed must be a positive integer" },
        { status: 400 }
      );
    }
    if (role === "patient" && unitCount > 5) {
      return Response.json(
        { error: "Patient requests cannot exceed 5 pints" },
        { status: 400 }
      );
    }
    const scheduledForDate = scheduled_for ? new Date(scheduled_for) : null;
    if (request_type === "Scheduled") {
      if (!scheduledForDate || !Number.isFinite(scheduledForDate.getTime())) {
        return Response.json(
          { error: "scheduled_for is required for Scheduled requests" },
          { status: 400 }
        );
      }
      if (scheduledForDate.getTime() <= Date.now()) {
        return Response.json(
          { error: "scheduled_for must be in the future" },
          { status: 400 }
        );
      }
    }
    const scheduledForValue = request_type === "Scheduled" ? scheduledForDate.toISOString() : null;
    const userSupabase = createUserSupabaseClient$1(request);
    const { data: bloodRequest, error: createError } = await userSupabase.rpc("create_blood_request", {
      p_hospital_name: hospital_name.trim(),
      p_blood_type_needed: serializedBloodTypes,
      p_urgency_tier: urgency_tier,
      p_units_needed: unitCount,
      p_patient_ref: patient_ref ?? null,
      p_location: location ?? null,
      p_latitude: latitude ?? null,
      p_longitude: longitude ?? null,
      p_urgency_note: urgency_note ?? null,
      p_hospital_id: role === "admin" ? hospital_id ?? null : null,
      p_request_type: request_type,
      p_scheduled_for: scheduledForValue
    });
    if (createError) throw createError;
    if (!bloodRequest || typeof bloodRequest !== "object") {
      throw new Error("create_blood_request returned no request");
    }
    if (String(bloodRequest.requested_by) !== String(auth.user.sub)) {
      console.error("[POST /api/requests/create] created request owner mismatch", {
        expected: auth.user.sub,
        actual: bloodRequest.requested_by
      });
      return Response.json(
        { error: "Created request ownership could not be verified" },
        { status: 500 }
      );
    }
    const supabase2 = createSupabaseServerClient();
    const deliverAt = notificationDeliveryFor(request_type, scheduledForValue);
    const sideEffectWarnings = [];
    try {
      await notifyRequestRecipients(supabase2, bloodRequest, {
        type: "request_created",
        title: "Blood request created",
        message: `${bloodRequest.blood_type_needed} request created at ${bloodRequest.hospital_name}.`,
        request_id: bloodRequest.id,
        deliver_at: deliverAt
      });
    } catch (error) {
      console.error("[POST /api/requests/create] notification side effect failed", error);
      sideEffectWarnings.push("request_created_notification_failed");
    }
    let matching = { inserted: 0, skipped: true };
    try {
      matching = await createMatchesForRequest(userSupabase, bloodRequest, {
        limit: role === "patient" ? 4 : void 0,
        status: "Candidate",
        notify: false
      });
    } catch (error) {
      console.error("[POST /api/requests/create] matching side effect failed", error);
      sideEffectWarnings.push("matching_failed");
    }
    return Response.json(
      { request: bloodRequest, matching, sideEffectWarnings, message: "Request created" },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/requests/create]", err);
    return Response.json({ error: "Failed to create request" }, { status: 500 });
  }
}
const __vite_glob_0_15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$1
}, Symbol.toStringTag, { value: "Module" }));
const VALID_STATUSES = [
  "pending",
  "verified",
  "donor_matched",
  "checked_in",
  "blood_collected",
  "fulfilled",
  "cancelled"
];
const STATUS_ALIASES = {
  Pending: "pending",
  Verified: "verified",
  "Donor Matched": "donor_matched",
  Arrived: "checked_in",
  "Arrived At Lab": "checked_in",
  "Blood Collected": "blood_collected",
  Completed: "fulfilled",
  Cancelled: "cancelled"
};
const REQUEST_TYPES_BY_DONOR = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
  AB: ["AB-", "AB+"]
};
function normalizeStatusInput(status) {
  return STATUS_ALIASES[status] ?? status;
}
function sortPriority(urgencyTier) {
  switch (urgencyTier) {
    case "SOS":
      return 0;
    case "Urgent":
      return 1;
    default:
      return 2;
  }
}
async function GET(request) {
  try {
    const auth = await requireAuth(request, ["patient", "donor", "hospital_staff", "admin"]);
    if (auth.error) return auth.error;
    const { searchParams } = new URL(request.url);
    const bloodFilter = searchParams.get("blood_type");
    const limit = Math.min(
      parseInt(searchParams.get("limit") ?? "50", 10),
      100
    );
    const supabase2 = createSupabaseServerClient();
    let query = supabase2.from("blood_requests").select("*").neq("status", "cancelled").order("created_at", { ascending: false });
    const role = getCanonicalRole(auth.user.role);
    let compatibleRequestTypes = [];
    if (role === "donor") {
      const { data: donor, error: donorError } = await supabase2.from("users").select("blood_type").eq("id", auth.user.sub).maybeSingle();
      if (donorError) throw donorError;
      compatibleRequestTypes = REQUEST_TYPES_BY_DONOR[donor?.blood_type] ?? [];
      if (!compatibleRequestTypes.length) {
        return Response.json({ requests: [] });
      }
      query = query.neq("status", "fulfilled");
    }
    if (role === "patient") {
      query = query.eq("requested_by", auth.user.sub);
    }
    if (role === "hospital_staff") {
      query = query.or(`requested_by.eq.${auth.user.sub},hospital_id.eq.${auth.user.sub}`);
    }
    const queryLimit = role === "donor" || bloodFilter ? 100 : limit;
    const { data, error } = await query.limit(queryLimit);
    if (error) {
      throw error;
    }
    const filteredData = (data ?? []).filter((bloodRequest) => {
      if (role === "donor") {
        return compatibleRequestTypes.some(
          (type) => requestIncludesBloodType(bloodRequest.blood_type_needed, type)
        );
      }
      if (bloodFilter) {
        return requestIncludesBloodType(bloodRequest.blood_type_needed, bloodFilter);
      }
      return true;
    });
    const requests = filteredData.sort((a, b) => {
      const aPriority = sortPriority(a?.urgency_tier);
      const bPriority = sortPriority(b?.urgency_tier);
      if (aPriority !== bPriority) return aPriority - bPriority;
      return new Date(b?.created_at ?? 0).getTime() - new Date(a?.created_at ?? 0).getTime();
    }).slice(0, limit);
    return Response.json({ requests });
  } catch (err) {
    console.error("[GET /api/requests]", err);
    return Response.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}
async function PATCH(request) {
  try {
    const auth = await requireAuth(request, ["hospital_staff", "admin"]);
    if (auth.error) return auth.error;
    const body = await request.json();
    const { request_id } = body;
    const requestedStatus = normalizeStatusInput(body.status);
    if (!request_id) {
      return Response.json({ error: "request_id is required" }, { status: 400 });
    }
    if (!VALID_STATUSES.includes(requestedStatus)) {
      return Response.json(
        { error: "status must be pending, verified, donor_matched, checked_in, blood_collected, fulfilled, or cancelled" },
        { status: 400 }
      );
    }
    const supabase2 = createSupabaseServerClient();
    const role = getCanonicalRole(auth.user.role);
    let lookup = supabase2.from("blood_requests").select("id, hospital_name, blood_type_needed, status, requested_by, hospital_id").eq("id", request_id);
    if (role !== "admin") {
      lookup = lookup.or(`requested_by.eq.${auth.user.sub},hospital_id.eq.${auth.user.sub}`);
    }
    const { data: currentRequest, error: lookupError } = await lookup.maybeSingle();
    if (lookupError) throw lookupError;
    if (!currentRequest) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }
    if (requestedStatus === "fulfilled") {
      const { data: collectedMatches, error: collectedMatchesError } = await supabase2.from("matches").select("id, donor_id, donation_completed_at").eq("request_id", request_id).eq("match_status", "Accepted").not("blood_collected_at", "is", null);
      if (collectedMatchesError) throw collectedMatchesError;
      if (!collectedMatches?.length) {
        return Response.json(
          { error: "Blood collection must be recorded before completing donation" },
          { status: 409 }
        );
      }
      const completedAt = (/* @__PURE__ */ new Date()).toISOString();
      const newlyCompletedMatches = collectedMatches.filter(
        (match) => !match.donation_completed_at
      );
      if (newlyCompletedMatches.length) {
        const { error: completeMatchesError } = await supabase2.from("matches").update({ donation_completed_at: completedAt }).in("id", newlyCompletedMatches.map((match) => match.id));
        if (completeMatchesError) throw completeMatchesError;
      }
      const donorIds = [...new Set(newlyCompletedMatches.map((match) => match.donor_id).filter(Boolean))];
      if (donorIds.length) {
        const { error: donorCooldownError } = await supabase2.from("users").update({
          last_donation_at: completedAt,
          availability_status: 0
        }).in("id", donorIds);
        if (donorCooldownError) throw donorCooldownError;
      }
    }
    const { data: updatedRequest, error: updateError } = await supabase2.from("blood_requests").update({
      status: requestedStatus,
      ...requestedStatus === "fulfilled" ? { matching_status: "completed" } : {}
    }).eq("id", request_id).select("*").single();
    if (updateError) throw updateError;
    const { data: matches, error: matchesError } = await supabase2.from("matches").select("id, donor_id").eq("request_id", request_id).neq("match_status", "Declined");
    if (matchesError) throw matchesError;
    const recipientIds = [
      ...requestRecipientIds(updatedRequest),
      ...(matches ?? []).map((match) => match.donor_id)
    ];
    await createNotifications(
      supabase2,
      [...new Set(recipientIds.filter(Boolean))].map((userId) => ({
        user_id: userId,
        type: "hospital_status_update",
        title: "Request status updated",
        message: `${updatedRequest.blood_type_needed} request at ${updatedRequest.hospital_name} is now ${requestedStatus.replaceAll("_", " ")}.`,
        request_id
      }))
    );
    return Response.json({
      request: updatedRequest,
      message: "Request status updated"
    });
  } catch (err) {
    console.error("[PATCH /api/requests]", err);
    return Response.json(
      { error: "Failed to update request status" },
      { status: 500 }
    );
  }
}
const __vite_glob_0_16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  PATCH
}, Symbol.toStringTag, { value: "Module" }));
function createUserSupabaseClient(request) {
  const token = getBearerToken(request);
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || !token) {
    throw new Error("Supabase authenticated client configuration is missing");
  }
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}
function rpcErrorResponse(error) {
  const message = error?.message ?? "Verification failed";
  if (message.includes("already been used")) {
    return Response.json({ error: message }, { status: 409 });
  }
  if (message.includes("expired") || message.includes("Invalid")) {
    return Response.json({ error: message }, { status: 401 });
  }
  if (message.includes("Forbidden") || message.includes("not verified")) {
    return Response.json({ error: message }, { status: 403 });
  }
  if (message.includes("not ready")) {
    return Response.json({ error: message }, { status: 409 });
  }
  return Response.json({ error: "Verification failed" }, { status: 500 });
}
async function POST(request) {
  try {
    const auth = await requireAuth(request, ["hospital_staff", "admin"]);
    if (auth.error) return auth.error;
    const body = await request.json();
    const { otp, match_id } = body;
    const normalizedOtp = String(otp ?? "").trim();
    if (!/^\d{6}$/.test(normalizedOtp)) {
      return Response.json(
        { error: "A 6-digit OTP is required" },
        { status: 400 }
      );
    }
    if (!match_id) {
      return Response.json(
        { error: "match_id is required for check-in verification" },
        { status: 400 }
      );
    }
    const supabase2 = createSupabaseServerClient();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await supabase2.from("verification_tokens").update({ status: "Expired" }).eq("status", "Active").lt("expires_at", now);
    const { data: tokenRows, error: tokenLookupError } = await supabase2.from("verification_tokens").select("id, match_id, secure_otp, expires_at, status").eq("match_id", match_id).order("created_at", { ascending: false });
    if (tokenLookupError) throw tokenLookupError;
    const matchingToken = (tokenRows ?? []).find(
      (row) => verifyOtpHash(normalizedOtp, row.secure_otp)
    );
    if (matchingToken?.status === "Used") {
      return Response.json({ error: "OTP has already been used" }, { status: 409 });
    }
    if (matchingToken?.status === "Expired") {
      return Response.json({ error: "OTP has expired" }, { status: 401 });
    }
    const token = matchingToken?.status === "Active" ? matchingToken : null;
    if (!token) {
      return Response.json(
        { error: "Invalid or expired OTP" },
        { status: 401 }
      );
    }
    if (new Date(token.expires_at) < /* @__PURE__ */ new Date()) {
      const { error } = await supabase2.from("verification_tokens").update({ status: "Expired" }).eq("id", token.id);
      if (error) throw error;
      return Response.json({ error: "OTP has expired" }, { status: 401 });
    }
    const userSupabase = createUserSupabaseClient(request);
    const { data: result, error: verifyError } = await userSupabase.rpc("verify_donor_otp", {
      p_token_id: String(token.id),
      p_match_id: match_id,
      p_verified_by: auth.user.sub
    });
    if (verifyError) throw verifyError;
    const match = result?.match;
    const arrivedRequest = result?.request;
    const bloodRequest = result?.request;
    const donor = result?.donor;
    await createNotifications(supabase2, [
      {
        user_id: donor.id,
        type: "otp_checked_in",
        title: "Check-in verified",
        message: `Your arrival at ${arrivedRequest.hospital_name} was verified.`,
        request_id: match.request_id,
        match_id: match.id
      },
      ...requestRecipientIds(bloodRequest).map((userId) => ({
        user_id: userId,
        type: "otp_checked_in",
        title: "Donor checked in",
        message: `${donor.full_name ?? "A donor"} checked in for ${arrivedRequest.blood_type_needed}.`,
        request_id: match.request_id,
        match_id: match.id
      }))
    ]);
    return Response.json({
      message: "Check-in verified. Donor arrival confirmed.",
      token_id: token.id,
      request_id: match.request_id,
      request: arrivedRequest ?? null,
      donor,
      checked_in_at: result?.checked_in_at,
      verified_by: auth.user.sub,
      new_status: "checked_in"
    });
  } catch (err) {
    console.error("[POST /api/tokens/verify]", err);
    return rpcErrorResponse(err);
  }
}
const __vite_glob_0_17 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: "Module" }));
const API_BASENAME = "/api";
const api = new Hono();
if (globalThis.fetch) {
  globalThis.fetch = fetchWithHeaders;
}
const routeModules = /* @__PURE__ */ Object.assign({
  "../src/app/api/__create/check-social-secrets/route.js": __vite_glob_0_0,
  "../src/app/api/__create/ssr-test/route.js": __vite_glob_0_1,
  "../src/app/api/auth/login/route.js": __vite_glob_0_2,
  "../src/app/api/auth/logout/route.js": __vite_glob_0_3,
  "../src/app/api/auth/register/route.js": __vite_glob_0_4,
  "../src/app/api/auth/session/route.js": __vite_glob_0_5,
  "../src/app/api/matches/chat/route.js": __vite_glob_0_6,
  "../src/app/api/matches/hospital-status/route.js": __vite_glob_0_7,
  "../src/app/api/matches/respond/route.js": __vite_glob_0_8,
  "../src/app/api/matches/route.js": __vite_glob_0_9,
  "../src/app/api/matches/send/route.js": __vite_glob_0_10,
  "../src/app/api/matches/tracking/route.js": __vite_glob_0_11,
  "../src/app/api/notifications/route.js": __vite_glob_0_12,
  "../src/app/api/profile/route.js": __vite_glob_0_13,
  "../src/app/api/requests/[requestId]/route.js": __vite_glob_0_14,
  "../src/app/api/requests/create/route.js": __vite_glob_0_15,
  "../src/app/api/requests/route.js": __vite_glob_0_16,
  "../src/app/api/tokens/verify/route.js": __vite_glob_0_17
});
function getHonoPath(routeFile) {
  const normalizedRelativePath = routeFile.replace("../src/app/api", "");
  const parts = normalizedRelativePath.split("/").filter(Boolean);
  const routeParts = parts.slice(0, -1);
  if (routeParts.length === 0) {
    return [{ name: "root", pattern: "" }];
  }
  const transformedParts = routeParts.map((segment) => {
    const match = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
    if (match) {
      const [_, dots, param] = match;
      return dots === "..." ? { name: param, pattern: `:${param}{.+}` } : { name: param, pattern: `:${param}` };
    }
    return { name: segment, pattern: segment };
  });
  return transformedParts;
}
async function registerRoutes() {
  const routeFiles = Object.keys(routeModules).slice().sort((a, b) => {
    return b.length - a.length;
  });
  api.routes = [];
  for (const routeFile of routeFiles) {
    try {
      const route29 = routeModules[routeFile];
      const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
      for (const method of methods) {
        try {
          const routeHandler = route29[method];
          if (routeHandler) {
            const parts = getHonoPath(routeFile);
            const honoPath = `/${parts.map(({ pattern }) => pattern).join("/")}`;
            const handler = async (c) => {
              const params = c.req.param();
              return await routeHandler(c.req.raw, { params });
            };
            const methodLowercase = method.toLowerCase();
            switch (methodLowercase) {
              case "get":
                api.get(honoPath, handler);
                break;
              case "post":
                api.post(honoPath, handler);
                break;
              case "put":
                api.put(honoPath, handler);
                break;
              case "delete":
                api.delete(honoPath, handler);
                break;
              case "patch":
                api.patch(honoPath, handler);
                break;
              default:
                console.warn(`Unsupported method: ${method}`);
                break;
            }
          }
        } catch (error) {
          console.error(`Error registering route ${routeFile} for method ${method}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error importing route file ${routeFile}:`, error);
    }
  }
}
await registerRoutes();
neonConfig.webSocketConstructor = ws;
const als = new AsyncLocalStorage();
for (const method of ["log", "info", "warn", "error", "debug"]) {
  const original = nodeConsole[method].bind(console);
  console[method] = (...args) => {
    const requestId2 = als.getStore()?.requestId;
    if (requestId2) {
      original(`[traceId:${requestId2}]`, ...args);
    } else {
      original(...args);
    }
  };
}
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required for Neon-backed auth, request creation, match response, and token verification routes."
  );
}
const pool = new Pool({
  connectionString: databaseUrl
});
const adapter = NeonAdapter(pool);
const app = new Hono();
app.use("*", requestId());
app.use("*", (c, next) => {
  const requestId2 = c.get("requestId");
  return als.run({ requestId: requestId2 }, () => next());
});
app.use(contextStorage());
app.onError((err, c) => {
  if (c.req.method !== "GET") {
    return c.json(
      {
        error: "An error occurred in your app",
        details: serializeError(err)
      },
      500
    );
  }
  return c.html(getHTMLForErrorPage(err), 200);
});
if (process.env.CORS_ORIGINS) {
  app.use(
    "/*",
    cors({
      origin: process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
    })
  );
}
for (const method of ["post", "put", "patch"]) {
  app[method](
    "*",
    bodyLimit({
      maxSize: 4.5 * 1024 * 1024,
      // 4.5mb to match vercel limit
      onError: (c) => {
        return c.json({ error: "Body size limit exceeded" }, 413);
      }
    })
  );
}
app.use(
  "*",
  initAuthConfig((c) => {
    const authSecret = c.env?.AUTH_SECRET ?? process.env.AUTH_SECRET ?? "dev-auth-secret-change-me";
    const authUrl = c.env?.AUTH_URL ?? process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_CREATE_BASE_URL ?? "http://localhost:4000";
    const secureCookies = authUrl.startsWith("https://");
    return {
      secret: authSecret,
      basePath: "/api/auth",
      trustHost: true,
      pages: {
        signIn: "/account/signin",
        signOut: "/account/logout"
      },
      skipCSRFCheck,
      session: {
        strategy: "jwt"
      },
      callbacks: {
        session({ session, token }) {
          if (token.sub) {
            session.user.id = token.sub;
          }
          return session;
        }
      },
      cookies: {
        csrfToken: {
          options: {
            secure: secureCookies,
            sameSite: secureCookies ? "none" : "lax"
          }
        },
        sessionToken: {
          options: {
            secure: secureCookies,
            sameSite: secureCookies ? "none" : "lax"
          }
        },
        callbackUrl: {
          options: {
            secure: secureCookies,
            sameSite: secureCookies ? "none" : "lax"
          }
        }
      },
      providers: [
        // Dev-only provider for simulated social sign-in (Google, Facebook, etc.)
        // Creates or finds a user by email without requiring a password.
        ...process.env.NEXT_PUBLIC_CREATE_ENV === "DEVELOPMENT" ? [
          Credentials({
            id: "dev-social",
            name: "Development Social Sign-in",
            credentials: {
              email: { label: "Email", type: "email" },
              name: { label: "Name", type: "text" },
              provider: { label: "Provider", type: "text" }
            },
            authorize: async (credentials) => {
              const { email, name, provider } = credentials;
              if (!email || typeof email !== "string") return null;
              const existing = await adapter.getUserByEmail(email);
              if (existing) return existing;
              const allowedProviders = /* @__PURE__ */ new Set(["google", "facebook", "twitter", "apple"]);
              const providerName = typeof provider === "string" && allowedProviders.has(provider.toLowerCase()) ? provider.toLowerCase() : "google";
              const newUser = await adapter.createUser({
                emailVerified: null,
                email,
                name: typeof name === "string" && name.length > 0 ? name : void 0
              });
              await adapter.linkAccount({
                type: "oauth",
                userId: newUser.id,
                provider: providerName,
                providerAccountId: `dev-${newUser.id}`
              });
              return newUser;
            }
          })
        ] : [],
        Credentials({
          id: "credentials-signin",
          name: "Credentials Sign in",
          credentials: {
            email: {
              label: "Email",
              type: "email"
            },
            password: {
              label: "Password",
              type: "password"
            }
          },
          authorize: async (credentials) => {
            const { email, password } = credentials;
            if (!email || !password) {
              return null;
            }
            if (typeof email !== "string" || typeof password !== "string") {
              return null;
            }
            const user = await adapter.getUserByEmail(email);
            if (!user) {
              return null;
            }
            const matchingAccount = user.accounts.find(
              (account) => account.provider === "credentials"
            );
            const accountPassword = matchingAccount?.password;
            if (!accountPassword) {
              return null;
            }
            const isValid = await verify(accountPassword, password);
            if (!isValid) {
              return null;
            }
            return user;
          }
        }),
        Credentials({
          id: "credentials-signup",
          name: "Credentials Sign up",
          credentials: {
            email: {
              label: "Email",
              type: "email"
            },
            password: {
              label: "Password",
              type: "password"
            },
            name: { label: "Name", type: "text" },
            image: { label: "Image", type: "text", required: false }
          },
          authorize: async (credentials) => {
            const { email, password, name, image } = credentials;
            if (!email || !password) {
              return null;
            }
            if (typeof email !== "string" || typeof password !== "string") {
              return null;
            }
            const user = await adapter.getUserByEmail(email);
            if (!user) {
              const newUser = await adapter.createUser({
                emailVerified: null,
                email,
                name: typeof name === "string" && name.length > 0 ? name : void 0,
                image: typeof image === "string" && image.length > 0 ? image : void 0
              });
              await adapter.linkAccount({
                extraData: {
                  password: await hash(password)
                },
                type: "credentials",
                userId: newUser.id,
                providerAccountId: newUser.id,
                provider: "credentials"
              });
              return newUser;
            }
            return null;
          }
        })
      ]
    };
  })
);
app.all("/integrations/:path{.+}", async (c, next) => {
  const queryParams = c.req.query();
  const url = `${process.env.NEXT_PUBLIC_CREATE_BASE_URL ?? "https://www.create.xyz"}/integrations/${c.req.param("path")}${Object.keys(queryParams).length > 0 ? `?${new URLSearchParams(queryParams).toString()}` : ""}`;
  return proxy(url, {
    method: c.req.method,
    body: c.req.raw.body ?? null,
    // @ts-expect-error -- duplex is accepted by the runtime even though the
    // type declarations don't include it; required for streaming integrations
    duplex: "half",
    redirect: "manual",
    headers: {
      ...c.req.header(),
      "X-Forwarded-For": process.env.NEXT_PUBLIC_CREATE_HOST,
      "x-createxyz-host": process.env.NEXT_PUBLIC_CREATE_HOST,
      Host: process.env.NEXT_PUBLIC_CREATE_HOST,
      "x-createxyz-project-group-id": process.env.NEXT_PUBLIC_PROJECT_GROUP_ID
    }
  });
});
app.use("/api/auth/*", async (c, next) => {
  if (isAuthAction(c.req.path)) {
    return authHandler()(c, next);
  }
  return next();
});
app.route(API_BASENAME, api);
const reactRouterHandler = createRequestHandler(
  reactRouterBuild,
  process.env.NODE_ENV === "development" ? "development" : "production"
);
app.all("*", (c) => reactRouterHandler(c.req.raw, {}));
export {
  app as default
};
