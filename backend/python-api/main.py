"""
FastAPI Main Application
AI-Powered Calculation and Analysis Service
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

# Import routers
from cv_analysis import router as cv_router

# Create FastAPI app
app = FastAPI(
    title="Humanitas AI/Calculation API",
    description="AI-powered services for CV analysis, payroll calculations, and predictive analytics",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:1300",  # Tenant frontend dev
        "http://localhost:5173",  # Admin frontend dev
        "*"  # Allow all in development (restrict in production)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    print(f"📥 {request.method} {request.url.path}")
    
    response = await call_next(request)
    
    duration = (time.time() - start_time) * 1000
    print(f"📤 {request.method} {request.url.path} - {response.status_code} - {duration:.2f}ms")
    
    return response

# Error handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "message": str(exc),
                "type": type(exc).__name__
            }
        }
    )

# Include routers
app.include_router(cv_router)

# Health check endpoint
@app.get("/")
@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "service": "Humanitas AI API",
        "version": "1.0.0"
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    print("🚀 Humanitas AI API started")
    print("📊 AI-powered CV analysis ready")
    print("💰 Calculation services active")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes (dev only)
        log_level="info"
    )
