import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { ensurePortOpen } from "./firewall";
import { diagnostics } from "./startupDiagnostics";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  
  // In production, ensure the firewall allows access to our port
  if (app.get("env") === "production") {
    await ensurePortOpen(port);
  }
  
  server.listen(port, "0.0.0.0", async () => {
    log(`serving on port ${port}`);
    
    // Run comprehensive startup diagnostics
    await diagnostics.runAllDiagnostics(app);
    
    // Show final startup status
    if (diagnostics.hasCriticalErrors()) {
      console.log('❌ Server started with critical errors - some features may not work properly');
    } else if (diagnostics.hasErrors()) {
      console.log('⚠️ Server started with some issues - check diagnostics above');
    } else {
      console.log('🌐 Server ready and all systems operational!');
    }
    
    console.log(`🔗 Access your app at: http://localhost:${port}`);
  });
})();
