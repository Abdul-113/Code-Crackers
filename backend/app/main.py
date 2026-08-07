import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Setup logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Invoice2Credit-Backend")

# Load environment configuration
load_dotenv()

app = FastAPI(
    title="Invoice2Credit AI API",
    description="AI-powered and Blockchain-backed invoice financing protocol backend.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.services.firebase.firebase_service import firebase_service
from app.services.blockchain.polygon_service import polygon_service
from app.api.routes.ai_routes import router as ai_router
from app.api.routes.business_routes import router as business_router
from app.invoice.routes.invoice_routes import router as invoice_router
from app.ai.routes.ai_routes import router as v1_ai_router
from app.ai.routes.copilot_routes import router as copilot_router
from app.verification.routes.verification_routes import router as verification_router
from app.listing.routes.listing_routes import router as listing_router
from app.events.routes.notification_routes import router as notification_router
from app.events.routes.activity_routes import router as activity_router
from app.api.routes.admin_routes import router as admin_router
from app.api.routes.analytics_routes import router as analytics_router

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logger.error(f"Validation error for {request.method} {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "message": "Request validation failed"}
    )

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing Invoice2Credit AI services...")
    firebase_service.initialize()
    if polygon_service.is_connected():
        logger.info(f"Connected to Polygon Network. Latest Block: {polygon_service.get_latest_block()}")
    else:
        logger.warning("Failed to connect to Polygon Network or RPC not configured.")

    # Start blockchain event listener in the background
    import asyncio
    from app.services.blockchain.blockchain_listener import run_blockchain_listener
    asyncio.create_task(run_blockchain_listener())
    logger.info("Blockchain event listener scheduled.")


# Include routes
app.include_router(ai_router, prefix="/api")
app.include_router(business_router, prefix="/api")
app.include_router(invoice_router, prefix="/api")
app.include_router(v1_ai_router, prefix="/api")
app.include_router(copilot_router, prefix="/api")
app.include_router(verification_router, prefix="/api")
app.include_router(listing_router, prefix="/api")
app.include_router(notification_router, prefix="/api")
app.include_router(activity_router, prefix="/api")
app.include_router(admin_router)
app.include_router(analytics_router)





@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "Invoice2Credit AI Engine",
        "version": "1.0.0"
    }
