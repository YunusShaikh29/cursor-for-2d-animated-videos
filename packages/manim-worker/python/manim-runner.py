#!/usr/bin/env python3
import sys
import os
import json
import tempfile
import subprocess
from pathlib import Path

def run_manim_script(script_content, scene_name, output_path, quality='low'):
    """
    Run a manim script and generate video
    
    Args:
        script_content (str): The Python script content
        scene_name (str): Name of the Scene class to render
        output_path (str): Where to save the output video
        quality (str): 'low' or 'high'
    
    Returns:
        dict: Result with success status and details
    """
    try:
        # Create temporary script file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(script_content)
            script_path = f.name
        
        print(f"Created temporary script: {script_path}")
        print(f"Rendering scene: {scene_name}")
        print(f"Output path: {output_path}")
        
        # Prepare manim command
        quality_flag = '-ql' if quality == 'low' else '-qh'
        
        cmd = [
            sys.executable, '-m', 'manim',
            script_path,
            scene_name,
            '--format', 'mp4',
            '--output_file', output_path,
            quality_flag,
            '--disable_caching'  # Avoid caching issues
        ]
        
        print(f"Running command: {' '.join(cmd)}")
        
        # Run manim
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        
        # Clean up temporary script
        try:
            os.unlink(script_path)
            print("Cleaned up temporary script")
        except:
            pass
        
        print(f"Manim exit code: {result.returncode}")
        print(f"Manim stdout: {result.stdout}")
        if result.stderr:
            print(f"Manim stderr: {result.stderr}")
        
        # Check if output file was created
        if result.returncode == 0 and os.path.exists(output_path):
            file_size = os.path.getsize(output_path)
            return {
                'success': True,
                'output_path': output_path,
                'file_size': file_size,
                'stdout': result.stdout,
                'stderr': result.stderr
            }
        else:
            return {
                'success': False,
                'error': f'Manim failed with exit code {result.returncode}',
                'stdout': result.stdout,
                'stderr': result.stderr
            }
            
    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'error': 'Manim execution timed out (5 minutes)'
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Python error: {str(e)}'
        }

def main():
    """Main function for CLI usage"""
    if len(sys.argv) != 5:
        result = {
            'success': False, 
            'error': 'Usage: python manim_runner.py <script_content> <scene_name> <output_path> <quality>'
        }
        print(json.dumps(result))
        sys.exit(1)
    
    script_content = sys.argv[1]
    scene_name = sys.argv[2]
    output_path = sys.argv[3]
    quality = sys.argv[4]
    
    # Run the manim script
    result = run_manim_script(script_content, scene_name, output_path, quality)
    
    # Output result as JSON for Node.js to parse
    print(json.dumps(result))

if __name__ == '__main__':
    main()