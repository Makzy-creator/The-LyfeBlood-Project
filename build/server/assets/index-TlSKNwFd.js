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
import { createMiddleware } from "hono/factory";
import { logger } from "hono/logger";
import { createRequestHandler } from "react-router";
import { serializeError } from "serialize-error";
import ws from "ws";
import "@auth/core/jwt";
import React from "react";
import path, { join } from "node:path";
import { renderToString } from "react-dom/server";
import { readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { route, index as index$1 } from "@react-router/dev/routes";
import cleanStack from "clean-stack";
import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual, randomInt, randomBytes } from "crypto";
function bindIncomingRequestSocketInfo() {
  return createMiddleware((c, next) => {
    c.env.server = {
      incoming: {
        socket: {
          remoteAddress: c.req.raw.headers.get("x-remote-address") || void 0,
          remotePort: Number(c.req.raw.headers.get("x-remote-port")) || void 0,
          remoteFamily: c.req.raw.headers.get("x-remote-family") || void 0
        }
      }
    };
    return next();
  });
}
async function importBuild() {
  return await import(
    // @ts-expect-error - Virtual module provided by React Router at build time
    "./server-build.js"
  );
}
function getBuildMode() {
  return process.env.NODE_ENV === "development" ? "development" : "production";
}
function cache(seconds) {
  return createMiddleware(async (c, next) => {
    if (!c.req.path.match(/\.[a-zA-Z0-9]+$/) || c.req.path.endsWith(".data")) {
      return next();
    }
    await next();
    if (!c.res.ok || c.res.headers.has("cache-control")) {
      return;
    }
    c.res.headers.set("cache-control", `public, max-age=${seconds}`);
  });
}
async function createHonoServer(options) {
  const basename = "/";
  const mergedOptions = {
    ...options,
    defaultLogger: options?.defaultLogger ?? true
  };
  const mode = getBuildMode();
  const PRODUCTION = mode === "production";
  const app2 = new Hono(mergedOptions.app);
  await mergedOptions.beforeAll?.(app2);
  app2.use(
    // https://developers.cloudflare.com/workers/static-assets/binding/#experimental_serve_directly
    `/${"assets"}/*`,
    cache(60 * 60 * 24 * 365),
    // 1 year
    serveCloudflareAssets()
  );
  if (PRODUCTION) {
    app2.use(
      // https://developers.cloudflare.com/workers/static-assets/binding/#experimental_serve_directly
      "*",
      cache(60 * 60),
      // 1 hour
      serveCloudflareAssets()
    );
  } else {
    const { serveStatic } = await import("@hono/node-server/serve-static");
    app2.use(
      "*",
      cache(60 * 60),
      // 1 hour
      serveStatic({ root: "./public" })
    );
    app2.use(bindIncomingRequestSocketInfo());
  }
  if (mergedOptions.defaultLogger) {
    app2.use("*", logger());
  }
  await mergedOptions.configure?.(app2);
  const reactRouterApp = new Hono({
    strict: false
  });
  reactRouterApp.use(async (c, next) => {
    const build = await importBuild();
    return createMiddleware(async (c2) => {
      const requestHandler = createRequestHandler(build, mode);
      const loadContext = mergedOptions.getLoadContext?.(c2, { build, mode });
      return requestHandler(c2.req.raw, loadContext instanceof Promise ? await loadContext : loadContext);
    })(c, next);
  });
  app2.route(`${basename}`, reactRouterApp);
  {
    app2.route(`${basename}.data`, reactRouterApp);
  }
  if (!PRODUCTION) {
    console.log("🚧 Running in development mode");
  }
  return app2;
}
var warned = false;
function serveCloudflareAssets() {
  return createMiddleware(async (c, next) => {
    const binding = c.env?.ASSETS;
    if (!binding) {
      if (!warned) {
        console.info(
          "\x1B[33m\nThe binding ASSETS is not set. Falling back to Cloudflare serving.\nhttps://developers.cloudflare.com/workers/static-assets/binding/#binding\n\x1B[0m"
        );
      }
      warned = true;
      return next();
    }
    try {
      let response = await binding.fetch(
        c.req.url,
        c.req.raw.clone()
      );
      if (response.status >= 400) {
        return next();
      }
      response = new Response(response.body, response);
      return response;
    } catch {
      return next();
    }
  });
}
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
function GET$8(request) {
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
  GET: GET$8
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
      routes2.push(index$1(componentPath));
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
async function GET$7(request) {
  const results = await Promise.allSettled(
    routes.map(async (route2) => {
      let component = null;
      try {
        const response = await import(
          /* @vite-ignore */
          path.join("../../../", route2.file)
        );
        component = response.default;
      } catch (error) {
        console.debug("Error importing component:", route2.file, error);
      }
      if (!component) {
        return null;
      }
      getHTMLOrError(component);
      return {
        route: route2.file,
        path: route2.path,
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
  GET: GET$7
}, Symbol.toStringTag, { value: "Module" }));
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
const USER_SELECT = "id, full_name, email, phone, role, blood_type, location, availability_status, is_verified, last_donation_at, created_at";
async function POST$8(request) {
  try {
    const body = await request.json();
    const { email, password } = body;
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
    const supabase = createSupabaseServerClient();
    const { data: user, error: profileError } = await supabase.from("users").select(USER_SELECT).eq("id", authData.user.id).maybeSingle();
    if (profileError) {
      throw profileError;
    }
    if (!user) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }
    return Response.json({
      user,
      session: authData.session,
      token: authData.session.access_token,
      message: "Login successful"
    });
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
const __vite_glob_0_2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
    const supabase = createSupabaseServerClient();
    const payload = buildUserPayload({
      userId: authUser.id,
      fullName: full_name,
      email: normalizedEmail,
      phone,
      role: normalizedRole,
      bloodType: blood_type,
      location
    });
    const { data: user, error: profileError } = await supabase.from("users").upsert(payload, { onConflict: "id" }).select(SAFE_USER_SELECT$1).single();
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
const __vite_glob_0_3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$7
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
  const supabase = createSupabaseServerClient();
  const { data: profile, error: profileError } = await supabase.from("users").select("id, email, role").eq("id", authUser.id).maybeSingle();
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
async function loadAcceptedPatientDonorMatch(supabase, matchId, auth) {
  if (!matchId) {
    return {
      error: Response.json({ error: "match_id is required" }, { status: 400 })
    };
  }
  const { data: match, error: matchError } = await supabase.from("matches").select("*").eq("id", matchId).maybeSingle();
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
  const { data: bloodRequest, error: requestError } = await supabase.from("blood_requests").select("*").eq("id", match.request_id).maybeSingle();
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
    const supabase = createSupabaseServerClient();
    const access = await loadAcceptedPatientDonorMatch(supabase, matchId, auth);
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
    const supabase = createSupabaseServerClient();
    const access = await loadAcceptedPatientDonorMatch(supabase, matchId, auth);
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
      await supabase.from("matches").update({ on_the_way_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", matchId).eq("donor_id", auth.user.sub);
    }
    if (access.participantRole === "donor" && quickType === "arrived" && !access.match.arrived_at) {
      await supabase.from("matches").update({ arrived_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", matchId).eq("donor_id", auth.user.sub);
    }
    return Response.json({ message: insertedMessage });
  } catch (err) {
    console.error("[POST /api/matches/chat]", err);
    return Response.json({ error: "Failed to send message" }, { status: 500 });
  }
}
const __vite_glob_0_4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
async function createNotifications(supabase, notifications) {
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
  const { error } = await supabase.from("notifications").insert(rows);
  if (error) throw error;
  return { count: rows.length };
}
async function notifyRequestRecipients(supabase, request, notification) {
  return createNotifications(
    supabase,
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
    const supabase = createSupabaseServerClient();
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
      supabase,
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
const __vite_glob_0_5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
async function POST$4(request) {
  try {
    const auth = await requireAuth(request, ["donor"]);
    if (auth.error) return auth.error;
    const body = await request.json();
    const { match_id, decision } = body;
    if (!match_id) {
      return Response.json({ error: "match_id is required" }, { status: 400 });
    }
    if (!["Accepted", "Declined"].includes(decision)) {
      return Response.json(
        { error: "decision must be Accepted or Declined" },
        { status: 400 }
      );
    }
    const userSupabase = createUserSupabaseClient$4(request);
    const supabase = createSupabaseServerClient();
    if (decision === "Declined") {
      const { data: result2, error } = await userSupabase.rpc("respond_to_match", {
        p_match_id: match_id,
        p_decision: decision,
        p_secure_otp: null,
        p_expires_at: null
      });
      if (error) throw error;
      const bloodRequest2 = result2?.request;
      await createNotifications(supabase, [
        {
          user_id: auth.user.sub,
          type: "match_declined",
          title: "Match declined",
          message: `You declined the ${bloodRequest2.blood_type_needed} request at ${bloodRequest2.hospital_name}.`,
          request_id: bloodRequest2.id,
          match_id
        },
        ...requestRecipientIds(bloodRequest2).map((userId) => ({
          user_id: userId,
          type: "match_declined",
          title: "Donor declined",
          message: `A donor declined the ${bloodRequest2.blood_type_needed} request at ${bloodRequest2.hospital_name}.`,
          request_id: bloodRequest2.id,
          match_id
        }))
      ]);
      return Response.json({
        message: "Match declined",
        match_id,
        status: "Declined"
      });
    }
    const otp = generateOtp();
    const expiresAt = minutesFromNow(getOtpTtlMinutes());
    const { data: result, error: responseError } = await userSupabase.rpc("respond_to_match", {
      p_match_id: match_id,
      p_decision: decision,
      p_secure_otp: hashOtp(otp),
      p_expires_at: expiresAt
    });
    if (responseError) throw responseError;
    const bloodRequest = result?.request;
    const token = result?.token;
    await createNotifications(supabase, [
      {
        user_id: auth.user.sub,
        type: "match_accepted",
        title: "Match accepted",
        message: `You accepted the ${bloodRequest.blood_type_needed} request at ${bloodRequest.hospital_name}.`,
        request_id: bloodRequest.id,
        match_id
      },
      ...requestRecipientIds(bloodRequest).map((userId) => ({
        user_id: userId,
        type: "match_accepted",
        title: "Donor accepted",
        message: `A donor accepted the ${bloodRequest.blood_type_needed} request at ${bloodRequest.hospital_name}.`,
        request_id: bloodRequest.id,
        match_id
      }))
    ]);
    return Response.json({
      message: "Match accepted",
      match_id,
      status: "Accepted",
      otp,
      expires_at: expiresAt,
      otp_ttl_seconds: getOtpTtlSeconds(),
      token_id: token?.id ?? null,
      unlocked_routes: {
        chat: `/matches/${match_id}/chat`,
        tracking: `/matches/${match_id}/tracking`,
        checkin: `/donor/match/${match_id}/checkin`
      },
      request: result?.request ?? null
    });
  } catch (err) {
    console.error("[POST /api/matches/respond]", err);
    return rpcErrorResponse$1(err);
  }
}
const __vite_glob_0_6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
    const supabase = createSupabaseServerClient();
    const url = new URL(request.url);
    const matchId = url.searchParams.get("id");
    const requestId2 = url.searchParams.get("request_id");
    let matchesQuery = supabase.from("matches").select("*").order("match_rank", { ascending: true });
    if (matchId) matchesQuery = matchesQuery.eq("id", matchId);
    if (requestId2) matchesQuery = matchesQuery.eq("request_id", requestId2);
    if (role === "donor") {
      matchesQuery = matchesQuery.eq("donor_id", auth.user.sub).in("match_status", ["Alerted", "Accepted"]);
    } else if (role !== "admin") {
      let requestQuery = supabase.from("blood_requests").select("id");
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
      requestIds.length ? supabase.from("blood_requests").select("*").in("id", requestIds) : { data: [], error: null },
      donorIds.length ? supabase.from("users").select("id, full_name, blood_type, location, phone").in("id", donorIds) : { data: [], error: null }
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
const __vite_glob_0_7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
    const supabase = createSupabaseServerClient();
    const { data: bloodRequest, error: requestError } = await supabase.from("blood_requests").select("id, hospital_name, blood_type_needed, requested_by, hospital_id, request_type, scheduled_for").eq("id", requestId2).maybeSingle();
    if (requestError) throw requestError;
    if (!bloodRequest || !canOwnRequest(role, auth.user.sub, bloodRequest)) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }
    const { data: matches, error: matchError } = await supabase.from("matches").select("id, donor_id, match_status, request_id").eq("request_id", requestId2).in("id", matchIds);
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
    const { error: updateError } = await supabase.from("matches").update({
      match_status: "Alerted",
      selected_at: now,
      notified_at: now
    }).in("id", matchIds).eq("request_id", requestId2);
    if (updateError) throw updateError;
    const deliverAt = deliveryForRequest(bloodRequest);
    await createNotifications(supabase, [
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
    await supabase.from("blood_requests").update({ matching_status: "sent" }).eq("id", requestId2);
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
const __vite_glob_0_8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
    const supabase = createSupabaseServerClient();
    const access = await loadAcceptedPatientDonorMatch(supabase, matchId, auth);
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
    const supabase = createSupabaseServerClient();
    const access = await loadAcceptedPatientDonorMatch(supabase, matchId, auth);
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
const __vite_glob_0_9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
const __vite_glob_0_10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
    const supabase = createSupabaseServerClient();
    const { data: user, error } = await supabase.from("users").select(SAFE_USER_SELECT).eq("id", auth.user.sub).maybeSingle();
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
    const supabase = createSupabaseServerClient();
    const { data: user, error } = await supabase.from("users").update({
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
const __vite_glob_0_11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
async function donorHasAssignedMatch(supabase, requestId2, donorId) {
  const { data, error } = await supabase.from("matches").select("id").eq("request_id", requestId2).eq("donor_id", donorId).neq("match_status", "Declined").maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
async function donorCanReadCompatibleRequest(supabase, bloodRequest, donorId) {
  if (["fulfilled", "cancelled", "Completed", "Cancelled"].includes(bloodRequest.status)) return false;
  const { data: donor, error } = await supabase.from("users").select("blood_type").eq("id", donorId).maybeSingle();
  if (error) throw error;
  const compatibleRequestTypes = REQUEST_TYPES_BY_DONOR$1[donor?.blood_type] ?? [];
  return compatibleRequestTypes.includes(bloodRequest.blood_type_needed);
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
    const supabase = createSupabaseServerClient();
    const { data: bloodRequest, error } = await supabase.from("blood_requests").select("*").eq("id", requestId2).maybeSingle();
    if (error) throw error;
    if (!bloodRequest) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }
    const role = getCanonicalRole(auth.user.role);
    let authorized = role === "admin" || bloodRequest.requested_by === auth.user.sub || bloodRequest.hospital_id === auth.user.sub;
    if (!authorized && role === "donor") {
      authorized = await donorHasAssignedMatch(supabase, requestId2, auth.user.sub) || await donorCanReadCompatibleRequest(supabase, bloodRequest, auth.user.sub);
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
    const supabase = createSupabaseServerClient();
    const { data: bloodRequest, error: lookupError } = await supabase.from("blood_requests").select("id, requested_by, hospital_id, created_at").eq("id", requestId2).maybeSingle();
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
    const { error: notificationDeleteError } = await supabase.from("notifications").delete().eq("request_id", requestId2);
    if (notificationDeleteError) throw notificationDeleteError;
    const { error: matchDeleteError } = await supabase.from("matches").delete().eq("request_id", requestId2);
    if (matchDeleteError) throw matchDeleteError;
    const { error: requestDeleteError } = await supabase.from("blood_requests").delete().eq("id", requestId2);
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
const __vite_glob_0_12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DELETE,
  GET: GET$1
}, Symbol.toStringTag, { value: "Module" }));
async function createMatchesForRequest(supabase, bloodRequest, options = {}) {
  if (!bloodRequest?.id) {
    return { inserted: 0, skipped: true };
  }
  const { data, error } = await supabase.rpc("create_matches_for_request", {
    p_request_id: String(bloodRequest.id),
    p_limit: options.limit ?? null,
    p_status: options.status ?? "Candidate"
  });
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  const inserted = Number(result?.inserted ?? 0);
  const skipped = Boolean(result?.skipped);
  if (options.notify !== false) {
    const { data: matches, error: matchesError } = await supabase.from("matches").select("id, donor_id, request_id").eq("request_id", bloodRequest.id).eq("match_status", options.status ?? "Candidate");
    if (matchesError) throw matchesError;
    const insertedMatches = matches ?? [];
    await createNotifications(supabase, [
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
async function POST$1(request) {
  try {
    const auth = await requireAuth(request, ["patient", "hospital_staff", "admin"]);
    if (auth.error) return auth.error;
    const body = await request.json();
    const {
      hospital_name,
      blood_type_needed,
      urgency_tier,
      units_needed = 1,
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
    if (!blood_type_needed) {
      return Response.json({ error: "blood_type_needed is required" }, { status: 400 });
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
      p_blood_type_needed: blood_type_needed,
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
    const supabase = createSupabaseServerClient();
    const deliverAt = notificationDeliveryFor(request_type, scheduledForValue);
    const sideEffectWarnings = [];
    try {
      await notifyRequestRecipients(supabase, bloodRequest, {
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
const __vite_glob_0_13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
    const supabase = createSupabaseServerClient();
    let query = supabase.from("blood_requests").select("*").neq("status", "cancelled").order("created_at", { ascending: false });
    const role = getCanonicalRole(auth.user.role);
    if (role === "donor") {
      const { data: donor, error: donorError } = await supabase.from("users").select("blood_type").eq("id", auth.user.sub).maybeSingle();
      if (donorError) throw donorError;
      const compatibleRequestTypes = REQUEST_TYPES_BY_DONOR[donor?.blood_type] ?? [];
      if (!compatibleRequestTypes.length) {
        return Response.json({ requests: [] });
      }
      query = query.neq("status", "fulfilled").in("blood_type_needed", compatibleRequestTypes);
    }
    if (role === "patient") {
      query = query.eq("requested_by", auth.user.sub);
    }
    if (role === "hospital_staff") {
      query = query.or(`requested_by.eq.${auth.user.sub},hospital_id.eq.${auth.user.sub}`);
    }
    if (bloodFilter) {
      query = query.eq("blood_type_needed", bloodFilter);
    }
    const { data, error } = await query.limit(limit);
    if (error) {
      throw error;
    }
    const requests = (data ?? []).sort((a, b) => {
      const aPriority = sortPriority(a?.urgency_tier);
      const bPriority = sortPriority(b?.urgency_tier);
      if (aPriority !== bPriority) return aPriority - bPriority;
      return new Date(b?.created_at ?? 0).getTime() - new Date(a?.created_at ?? 0).getTime();
    });
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
    const supabase = createSupabaseServerClient();
    const role = getCanonicalRole(auth.user.role);
    let lookup = supabase.from("blood_requests").select("id, hospital_name, blood_type_needed, status, requested_by, hospital_id").eq("id", request_id);
    if (role !== "admin") {
      lookup = lookup.or(`requested_by.eq.${auth.user.sub},hospital_id.eq.${auth.user.sub}`);
    }
    const { data: currentRequest, error: lookupError } = await lookup.maybeSingle();
    if (lookupError) throw lookupError;
    if (!currentRequest) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }
    if (requestedStatus === "fulfilled") {
      const { data: collectedMatches, error: collectedMatchesError } = await supabase.from("matches").select("id, donor_id, donation_completed_at").eq("request_id", request_id).eq("match_status", "Accepted").not("blood_collected_at", "is", null);
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
        const { error: completeMatchesError } = await supabase.from("matches").update({ donation_completed_at: completedAt }).in("id", newlyCompletedMatches.map((match) => match.id));
        if (completeMatchesError) throw completeMatchesError;
      }
      const donorIds = [...new Set(newlyCompletedMatches.map((match) => match.donor_id).filter(Boolean))];
      if (donorIds.length) {
        const { error: donorCooldownError } = await supabase.from("users").update({
          last_donation_at: completedAt,
          availability_status: 0
        }).in("id", donorIds);
        if (donorCooldownError) throw donorCooldownError;
      }
    }
    const { data: updatedRequest, error: updateError } = await supabase.from("blood_requests").update({
      status: requestedStatus,
      ...requestedStatus === "fulfilled" ? { matching_status: "completed" } : {}
    }).eq("id", request_id).select("*").single();
    if (updateError) throw updateError;
    const { data: matches, error: matchesError } = await supabase.from("matches").select("id, donor_id").eq("request_id", request_id).neq("match_status", "Declined");
    if (matchesError) throw matchesError;
    const recipientIds = [
      ...requestRecipientIds(updatedRequest),
      ...(matches ?? []).map((match) => match.donor_id)
    ];
    await createNotifications(
      supabase,
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
const __vite_glob_0_14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
    const supabase = createSupabaseServerClient();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await supabase.from("verification_tokens").update({ status: "Expired" }).eq("status", "Active").lt("expires_at", now);
    const { data: tokenRows, error: tokenLookupError } = await supabase.from("verification_tokens").select("id, match_id, secure_otp, expires_at, status").eq("match_id", match_id).order("created_at", { ascending: false });
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
      const { error } = await supabase.from("verification_tokens").update({ status: "Expired" }).eq("id", token.id);
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
    await createNotifications(supabase, [
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
const __vite_glob_0_15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: "Module" }));
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
const API_BASENAME = "/api";
const api = new Hono();
if (globalThis.fetch) {
  globalThis.fetch = fetchWithHeaders;
}
const routeModules = /* @__PURE__ */ Object.assign({
  "../src/app/api/__create/check-social-secrets/route.js": __vite_glob_0_0,
  "../src/app/api/__create/ssr-test/route.js": __vite_glob_0_1,
  "../src/app/api/auth/login/route.js": __vite_glob_0_2,
  "../src/app/api/auth/register/route.js": __vite_glob_0_3,
  "../src/app/api/matches/chat/route.js": __vite_glob_0_4,
  "../src/app/api/matches/hospital-status/route.js": __vite_glob_0_5,
  "../src/app/api/matches/respond/route.js": __vite_glob_0_6,
  "../src/app/api/matches/route.js": __vite_glob_0_7,
  "../src/app/api/matches/send/route.js": __vite_glob_0_8,
  "../src/app/api/matches/tracking/route.js": __vite_glob_0_9,
  "../src/app/api/notifications/route.js": __vite_glob_0_10,
  "../src/app/api/profile/route.js": __vite_glob_0_11,
  "../src/app/api/requests/[requestId]/route.js": __vite_glob_0_12,
  "../src/app/api/requests/create/route.js": __vite_glob_0_13,
  "../src/app/api/requests/route.js": __vite_glob_0_14,
  "../src/app/api/tokens/verify/route.js": __vite_glob_0_15
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
      const route2 = routeModules[routeFile];
      const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
      for (const method of methods) {
        try {
          const routeHandler = route2[method];
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
const index = await createHonoServer({
  app,
  defaultLogger: false
});
export {
  fetchWithHeaders as f,
  index as i
};
