#!/usr/bin/env python3
"""
Startup script for the Transparency Microservice
Handles environment setup, health checks, and graceful startup
"""

import os
import sys
import time
import requests
import subprocess
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ is required")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import flask
        import flask_cors
        print("✅ Dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def setup_environment():
    """Setup environment variables"""
    env_file = Path("env.example")
    if env_file.exists() and not Path(".env").exists():
        print("📝 Creating .env file from template...")
        os.system("cp env.example .env")
        print("✅ Environment file created")
    else:
        print("✅ Environment already configured")

def start_microservice():
    """Start the Flask microservice"""
    print("🚀 Starting Transparency Microservice...")
    
    # Set default environment variables
    os.environ.setdefault('FLASK_DEBUG', 'True')
    os.environ.setdefault('HOST', '0.0.0.0')
    os.environ.setdefault('PORT', '5000')
    
    try:
        # Import and run the app
        from app import app
        app.run(
            host=os.environ.get('HOST', '0.0.0.0'),
            port=int(os.environ.get('PORT', 5000)),
            debug=os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
        )
    except KeyboardInterrupt:
        print("\n🛑 Microservice stopped by user")
    except Exception as e:
        print(f"❌ Failed to start microservice: {e}")
        sys.exit(1)

def health_check():
    """Perform health check on the microservice"""
    try:
        response = requests.get("http://localhost:5000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Microservice is healthy")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException:
        print("❌ Microservice is not responding")
        return False

def main():
    """Main startup function"""
    print("🔧 Transparency Microservice Startup")
    print("=" * 40)
    
    # Pre-flight checks
    check_python_version()
    
    if not check_dependencies():
        sys.exit(1)
    
    setup_environment()
    
    print("\n📋 Configuration:")
    print(f"   Host: {os.environ.get('HOST', '0.0.0.0')}")
    print(f"   Port: {os.environ.get('PORT', '5000')}")
    print(f"   Debug: {os.environ.get('FLASK_DEBUG', 'True')}")
    
    print("\n🌐 Available endpoints:")
    print("   GET  /health")
    print("   POST /generate-questions")
    print("   POST /transparency-score")
    print("   GET  /questions/templates")
    
    print("\n📚 Documentation: README.md")
    print("🧪 Testing: python test_microservice.py")
    
    # Start the microservice
    start_microservice()

if __name__ == "__main__":
    main() 