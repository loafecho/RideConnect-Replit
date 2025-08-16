import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function ensurePortOpen(port: number): Promise<void> {
  try {
    // Check if UFW is active
    const { stdout: statusOutput } = await execAsync('sudo ufw status');
    
    if (!statusOutput.includes('Status: active')) {
      console.log(`⚠️  UFW firewall is not active. Port ${port} access depends on system configuration.`);
      return;
    }

    // Check if port is already open
    if (statusOutput.includes(`${port}/tcp`) && statusOutput.includes('ALLOW')) {
      console.log(`✅ Port ${port} is already open in UFW firewall`);
      return;
    }

    // Open the port
    console.log(`🔓 Opening port ${port} in UFW firewall...`);
    await execAsync(`sudo ufw allow ${port}/tcp`);
    console.log(`✅ Port ${port} opened successfully in UFW firewall`);
    
  } catch (error: any) {
    // Handle different types of errors gracefully
    if (error.message.includes('sudo')) {
      console.error(`❌ Failed to configure firewall: sudo access required`);
      console.error(`💡 Please manually run: sudo ufw allow ${port}/tcp`);
    } else if (error.message.includes('ufw')) {
      console.error(`❌ UFW firewall error: ${error.message}`);
      console.error(`💡 Please manually configure firewall for port ${port}`);
    } else {
      console.error(`❌ Unexpected error configuring firewall: ${error.message}`);
    }
    
    // Don't throw - this shouldn't prevent the server from starting
    console.log(`🚀 Server will continue starting, but external access may be limited`);
  }
}