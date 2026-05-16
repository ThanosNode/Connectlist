import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { randomUUID } from "crypto";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { pingElasticsearch, createListingsIndex } from "./services/elasticsearch";
import { syncAllListingsToElasticsearch } from "./services/elasticsearch-sync";
import { emergencyRouter } from "./emergency";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Mount emergency router BEFORE session and other middleware
// This provides a CSRF-free emergency login method
app.use(emergencyRouter);

// Set up session middleware with in-memory storage (for development)
// In production, you would use a proper session store like Redis
app.use(session({
  secret: 'hardened-session-key-for-development', // Should be environment variable in production
  resave: true, // Force session to be saved back to the session store
  saveUninitialized: false, // Don't save uninitialized sessions
  cookie: { 
    secure: false, // Set to false for development, true in production
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax' // Prevent CSRF while allowing normal navigation
  },
  genid: () => randomUUID() // Generate unique session IDs
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize Elasticsearch and sync data if possible
  try {
    const isElasticsearchAvailable = await pingElasticsearch();
    if (isElasticsearchAvailable) {
      log('Elasticsearch connected successfully');
      
      // Create listings index if it doesn't exist
      await createListingsIndex();
      log('Elasticsearch listings index created/verified');
      
      // Sync all listings to Elasticsearch
      await syncAllListingsToElasticsearch();
      log('All listings synchronized with Elasticsearch');
    } else {
      log('Elasticsearch not available - advanced search will fall back to standard search');
    }
  } catch (error) {
    log(`Elasticsearch initialization error: ${error instanceof Error ? error.message : String(error)}`);
    log('The application will start, but advanced search will use fallback mode');
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Add a catch-all route for client-side SPA routes
  app.get('*', (req, res, next) => {
    // Skip API routes and static assets
    if (req.path.startsWith('/api') || req.path.match(/\.(js|css|svg|png|jpg|jpeg|gif)$/)) {
      return next();
    }
    
    // For all non-API routes, let the SPA handle routing
    if (app.get("env") === "development") {
      // In development, let Vite handle it but let's log for debugging
      console.log(`SPA route requested: ${req.path}`);
      next();
    } else {
      // In production, serve the SPA's index.html file
      res.sendFile(path.resolve(import.meta.dirname, "public", "index.html"));
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
