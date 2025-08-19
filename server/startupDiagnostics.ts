import os from 'os';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import { googleCalendarService } from './googleCalendarService';
import type { Express } from 'express';

interface DiagnosticResult {
  service: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
  timing?: number;
}

export class StartupDiagnostics {
  private results: DiagnosticResult[] = [];

  private log(result: DiagnosticResult) {
    this.results.push(result);
    const emoji = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    const timing = result.timing ? ` (${result.timing}ms)` : '';
    console.log(`${emoji} ${result.service}: ${result.message}${timing}`);
  }

  async runSystemDiagnostics(): Promise<void> {
    console.log('\n🔍 System');

    // Node.js and system info
    this.log({
      service: 'Node.js',
      status: 'success',
      message: `${process.version} on ${os.platform()} ${os.arch()}`
    });

    // Environment configuration
    const envStatus = process.env.NODE_ENV || 'development';
    const port = process.env.PORT || '5000';
    this.log({
      service: 'Environment',
      status: 'success',
      message: `${envStatus} mode on port ${port}`
    });

    // Memory usage
    const memUsage = process.memoryUsage();
    this.log({
      service: 'Memory',
      status: 'success',
      message: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB used / ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB allocated`
    });
  }

  async runDatabaseDiagnostics(): Promise<void> {
    console.log('\n💾 Database');

    const startTime = Date.now();
    
    try {
      // Test database connection
      const state = mongoose.connection.readyState;
      const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
      
      if (state === 1) {
        // Test with a simple ping
        await mongoose.connection.db.admin().ping();
        const timing = Date.now() - startTime;
        
        this.log({
          service: 'MongoDB Connection',
          status: 'success',
          message: `Connected to ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`,
          timing
        });

        // Test collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        this.log({
          service: 'MongoDB Collections',
          status: 'success',
          message: `${collections.length} collections: ${collections.map(c => c.name).join(', ')}`
        });

      } else {
        this.log({
          service: 'MongoDB Connection',
          status: 'error',
          message: `Database not connected (state: ${states[state] || 'unknown'})`
        });
      }
    } catch (error: any) {
      this.log({
        service: 'MongoDB Connection',
        status: 'error',
        message: `Connection test failed: ${error.message}`
      });
    }
  }

  async runServiceDiagnostics(): Promise<void> {
    console.log('\n🔌 Services');

    // Stripe API test
    if (process.env.STRIPE_SECRET_KEY) {
      const startTime = Date.now();
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: "2025-06-30.basil",
        });
        
        // Test Stripe connection with a simple API call
        await stripe.balance.retrieve();
        const timing = Date.now() - startTime;
        
        this.log({
          service: 'Stripe API',
          status: 'success',
          message: 'API key validated and responsive',
          timing
        });
      } catch (error: any) {
        this.log({
          service: 'Stripe API',
          status: 'error',
          message: `API test failed: ${error.message}`
        });
      }
    } else {
      this.log({
        service: 'Stripe API',
        status: 'warning',
        message: 'Not configured - payment features disabled'
      });
    }

    // Google Calendar test
    const startTime = Date.now();
    try {
      if (googleCalendarService.isGoogleCalendarEnabled()) {
        // Test Google Calendar connectivity (this will be implemented based on the service)
        const timing = Date.now() - startTime;
        this.log({
          service: 'Google Calendar API',
          status: 'success',
          message: 'Service initialized and configured',
          timing
        });
      } else {
        this.log({
          service: 'Google Calendar API',
          status: 'warning',
          message: 'Not configured - calendar features disabled'
        });
      }
    } catch (error: any) {
      this.log({
        service: 'Google Calendar API',
        status: 'error',
        message: `Service test failed: ${error.message}`
      });
    }
  }

  async runRouteDiagnostics(app: Express): Promise<void> {
    console.log('\n🛣️ Routes');

    try {
      // Count registered routes
      const routes: any[] = [];
      
      // Extract routes from Express app
      app._router?.stack?.forEach((middleware: any) => {
        if (middleware.route) {
          // Direct route
          routes.push({
            path: middleware.route.path,
            methods: Object.keys(middleware.route.methods)
          });
        } else if (middleware.name === 'router') {
          // Router middleware
          middleware.handle?.stack?.forEach((handler: any) => {
            if (handler.route) {
              routes.push({
                path: handler.route.path,
                methods: Object.keys(handler.route.methods)
              });
            }
          });
        }
      });

      const apiRoutes = routes.filter(r => r.path.startsWith('/api'));
      
      this.log({
        service: 'API Routes',
        status: 'success',
        message: `${apiRoutes.length} endpoints registered`
      });

      // Static file serving
      const hasStaticMiddleware = app._router?.stack?.some((middleware: any) => 
        middleware.name === 'serveStatic' || middleware.name === 'vite'
      );
      
      this.log({
        service: 'Static Files',
        status: hasStaticMiddleware ? 'success' : 'warning',
        message: hasStaticMiddleware ? 'Serving configured' : 'No middleware detected'
      });

    } catch (error: any) {
      this.log({
        service: 'Route Analysis',
        status: 'error',
        message: `Route inspection failed: ${error.message}`
      });
    }
  }

  async runAllDiagnostics(app: Express): Promise<void> {
    const overallStartTime = Date.now();
    
    console.log('\n🚀 RideConnect Startup Diagnostics');
    console.log('═══════════════════════════════════');

    await this.runSystemDiagnostics();
    await this.runDatabaseDiagnostics();
    await this.runServiceDiagnostics();
    await this.runRouteDiagnostics(app);

    const totalTime = Date.now() - overallStartTime;
    const successCount = this.results.filter(r => r.status === 'success').length;
    const warningCount = this.results.filter(r => r.status === 'warning').length;
    const errorCount = this.results.filter(r => r.status === 'error').length;

    console.log('\n📊 Summary');
    console.log('──────────');
    console.log(`✅ ${successCount} successful ${warningCount > 0 ? `• ⚠️ ${warningCount} warnings` : ''}${errorCount > 0 ? ` • ❌ ${errorCount} errors` : ''} • ⏱️ ${totalTime}ms`);

    // Show critical issues
    const criticalIssues = this.results.filter(r => r.status === 'error');
    if (criticalIssues.length > 0) {
      console.log('\n⚠️ Critical Issues:');
      criticalIssues.forEach(issue => {
        console.log(`   • ${issue.service}: ${issue.message}`);
      });
    }

    console.log('═══════════════════════════════════\n');
  }

  getResults(): DiagnosticResult[] {
    return this.results;
  }

  hasErrors(): boolean {
    return this.results.some(r => r.status === 'error');
  }

  hasCriticalErrors(): boolean {
    // Define critical services that must work for the app to function
    const criticalServices = ['MongoDB Connection', 'API Routes'];
    return this.results.some(r => 
      r.status === 'error' && criticalServices.includes(r.service)
    );
  }
}

export const diagnostics = new StartupDiagnostics();