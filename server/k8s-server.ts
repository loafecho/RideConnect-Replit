import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { log } from "./utils/logger";
import { ensurePortOpen } from "./firewall";
import { diagnostics } from "./startupDiagnostics";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Trust proxy for proper IP forwarding in Kubernetes
app.set('trust proxy', true);

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

// Kubernetes health endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/ready', async (req, res) => {
  try {
    // Check database connection and other dependencies
    await diagnostics.runAllDiagnostics(app);
    
    if (diagnostics.hasCriticalErrors()) {
      res.status(503).json({ status: 'not ready', errors: diagnostics.getCriticalErrors() });
    } else {
      res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
    }
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

// Prometheus metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`
# HELP nodejs_process_memory_usage_bytes Node.js process memory usage
# TYPE nodejs_process_memory_usage_bytes gauge
nodejs_process_memory_usage_bytes{type="rss"} ${process.memoryUsage().rss}
nodejs_process_memory_usage_bytes{type="heapTotal"} ${process.memoryUsage().heapTotal}
nodejs_process_memory_usage_bytes{type="heapUsed"} ${process.memoryUsage().heapUsed}
nodejs_process_memory_usage_bytes{type="external"} ${process.memoryUsage().external}

# HELP nodejs_process_uptime_seconds Node.js process uptime
# TYPE nodejs_process_uptime_seconds gauge
nodejs_process_uptime_seconds ${process.uptime()}

# HELP nodejs_process_cpu_usage_seconds Node.js process CPU usage
# TYPE nodejs_process_cpu_usage_seconds gauge
nodejs_process_cpu_usage_seconds{type="user"} ${process.cpuUsage().user / 1000000}
nodejs_process_cpu_usage_seconds{type="system"} ${process.cpuUsage().system / 1000000}
  `.trim());
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Backend API only - no static file serving in Kubernetes
  const port = parseInt(process.env.PORT || '3001', 10);
  
  server.listen(port, "0.0.0.0", async () => {
    log(`Backend API server running on port ${port}`);
    
    // Run startup diagnostics
    await diagnostics.runAllDiagnostics(app);
    
    if (diagnostics.hasCriticalErrors()) {
      console.log('❌ Backend started with critical errors - some features may not work properly');
    } else if (diagnostics.hasErrors()) {
      console.log('⚠️ Backend started with some issues - check diagnostics above');
    } else {
      console.log('🚀 Backend API ready and all systems operational!');
    }
  });
})();