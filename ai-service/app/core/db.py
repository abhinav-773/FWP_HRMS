from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_config = Database()

async def connect_to_mongo():
    logger.info("Connecting to MongoDB Atlas...")
    db_config.client = AsyncIOMotorClient(settings.MONGODB_URI)
    db_config.db = db_config.client[settings.DATABASE_NAME]
    logger.info("Connected to MongoDB Atlas!")

async def close_mongo_connection():
    logger.info("Closing MongoDB Atlas connection...")
    if db_config.client:
        db_config.client.close()
    logger.info("MongoDB Atlas connection closed.")

def get_database():
    return db_config.db
