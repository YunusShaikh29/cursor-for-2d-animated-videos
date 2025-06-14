import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';

export interface PythonManimResult {
  success: boolean;
  outputPath?: string;
  fileSize?: number;
  error?: string;
  stdout?: string;
  stderr?: string;
}

export class PythonManimRunner {
  private pythonPath: string;
  private scriptPath: string;
  private virtualEnvPath: string;

  constructor() {
    // Path to Python script
    this.scriptPath = path.join(__dirname, '../python/manim-runner.py');
    
    // Virtual environment path
    this.virtualEnvPath = path.join(__dirname, '../python-env');
    
    // Python executable path (use venv if available)
    const venvPython = path.join(this.virtualEnvPath, 'bin', 'python');
    const venvPythonWin = path.join(this.virtualEnvPath, 'Scripts', 'python.exe');
    
    // Check which Python to use
    if (process.platform === 'win32') {
      this.pythonPath = venvPythonWin;
    } else {
      this.pythonPath = venvPython;
    }
    
    console.log(`PythonManimRunner initialized:`);
    console.log(`- Python path: ${this.pythonPath}`);
    console.log(`- Script path: ${this.scriptPath}`);
  }

  async runManimScript(
    scriptContent: string,
    sceneClassName: string,
    outputPath: string,
    quality: 'low' | 'high' = 'low'
  ): Promise<PythonManimResult> {

    process.env.HOME = "Users/Yunus Shaikh"
    
    console.log(`Starting Manim execution:`);
    console.log(`- Scene: ${sceneClassName}`);
    console.log(`- Output: ${outputPath}`);
    console.log(`- Quality: ${quality}`);

    return new Promise((resolve) => {
      const pythonProcess = spawn(this.pythonPath, [
        this.scriptPath,
        scriptContent,
        sceneClassName,
        outputPath,
        quality
      ], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 300000, // 5 minutes
        cwd: path.dirname(this.scriptPath),
        env: process.env
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        console.log('Python stdout:', output.trim());
      });

      pythonProcess.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        console.warn('Python stderr:', output.trim());
      });

      pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code: ${code}`);
        
        try {
          // Python script outputs JSON result
          const lines = stdout.trim().split('\n');
          const lastLine = lines[lines.length - 1];
          if(lastLine === undefined) return;
          const result = JSON.parse(lastLine);
          
          console.log('Python result:', result);
          resolve(result);
        } catch (parseError) {
          console.error('Failed to parse Python output:', parseError);
          resolve({
            success: false,
            error: `Failed to parse Python output. Exit code: ${code}. Stdout: ${stdout}. Stderr: ${stderr}`
          });
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('Python process error:', error);
        resolve({
          success: false,
          error: `Python process failed to start: ${error.message}`
        });
      });

      // Handle timeout
      pythonProcess.on('timeout', () => {
        console.error('Python process timed out');
        resolve({
          success: false,
          error: 'Python process timed out after 5 minutes'
        });
      });
    });
  }

  async validateSetup(): Promise<boolean> {
    try {
      // Check if Python script exists
      await fs.access(this.scriptPath);
      
      // Check if Python executable exists
      await fs.access(this.pythonPath);
      
      console.log('Python setup validation passed');
      return true;
    } catch (error) {
      console.error('Python setup validation failed:', error);
      return false;
    }
  }
}