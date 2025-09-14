import os
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
from models import DocumentLayout, ReadingProgress, SolanaTransaction, ADHDReadingSettings


class MongoDBService:
    def __init__(self):
        self.mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        self.database_name = os.getenv("MONGODB_DATABASE", "adhd_reader")
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        
        # Collection names
        self.collections = {
            "documents": os.getenv("MONGODB_COLLECTION_DOCUMENTS", "documents"),
            "users": os.getenv("MONGODB_COLLECTION_USERS", "users"),
            "progress": os.getenv("MONGODB_COLLECTION_PROGRESS", "reading_progress"),
            "transactions": os.getenv("MONGODB_COLLECTION_TRANSACTIONS", "solana_transactions")
        }
    
    async def connect(self):
        """Connect to MongoDB Atlas"""
        try:
            # Skip MongoDB connection for development
            if self.mongodb_uri == "mongodb://localhost:27017":
                print("Warning: Skipping MongoDB connection for development")
                self.client = None
                self.db = None
                return
            
            self.client = AsyncIOMotorClient(self.mongodb_uri)
            self.db = self.client[self.database_name]
            
            # Test connection
            await self.client.admin.command('ping')
            print(f"Connected to MongoDB Atlas: {self.database_name}")
            
            # Create indexes for better performance
            await self._create_indexes()
            
        except ConnectionFailure as e:
            print(f"Failed to connect to MongoDB: {e}")
            raise
    
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
    
    async def _create_indexes(self):
        """Create database indexes for better performance"""
        try:
            # Documents collection indexes
            await self.db[self.collections["documents"]].create_index("user_id")
            await self.db[self.collections["documents"]].create_index("created_at")
            
            # Progress collection indexes
            await self.db[self.collections["progress"]].create_index([("user_id", 1), ("document_id", 1)])
            await self.db[self.collections["progress"]].create_index("created_at")
            
            # Transactions collection indexes
            await self.db[self.collections["transactions"]].create_index("user_id")
            await self.db[self.collections["transactions"]].create_index("signature", unique=True)
            await self.db[self.collections["transactions"]].create_index("created_at")
            
            print("Database indexes created successfully")
        except Exception as e:
            print(f"Error creating indexes: {e}")
    
    async def save_document(self, user_id: str, document: DocumentLayout, 
                          file_name: str, file_size: int) -> str:
        """Save document layout to MongoDB"""
        if not self.db:
            # Return a mock document ID for development
            return "mock_doc_id_123"
        
        try:
            document_data = {
                "user_id": user_id,
                "file_name": file_name,
                "file_size": file_size,
                "pages": [page.model_dump() for page in document.pages],
                "characters": document.characters,
                "genre": document.genre,
                "reading_level": document.reading_level,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            result = await self.db[self.collections["documents"]].insert_one(document_data)
            return str(result.inserted_id)
            
        except Exception as e:
            print(f"Error saving document: {e}")
            raise
    
    async def get_document(self, document_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get document by ID and user"""
        try:
            document = await self.db[self.collections["documents"]].find_one({
                "_id": document_id,
                "user_id": user_id
            })
            
            if document:
                document["_id"] = str(document["_id"])
            
            return document
            
        except Exception as e:
            print(f"Error getting document: {e}")
            return None
    
    async def list_user_documents(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """List documents for a user"""
        try:
            cursor = self.db[self.collections["documents"]].find(
                {"user_id": user_id}
            ).sort("created_at", -1).limit(limit)
            
            documents = []
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                documents.append(doc)
            
            return documents
            
        except Exception as e:
            print(f"Error listing documents: {e}")
            return []
    
    async def save_reading_progress(self, progress: ReadingProgress) -> str:
        """Save reading progress to MongoDB"""
        try:
            progress_data = {
                "user_id": progress.user_id,
                "document_id": progress.document_id,
                "current_line": progress.current_line,
                "total_lines": progress.total_lines,
                "reading_speed": progress.reading_speed,
                "comprehension_score": progress.comprehension_score,
                "time_spent": progress.time_spent,
                "characters_encountered": progress.characters_encountered,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            result = await self.db[self.collections["progress"]].insert_one(progress_data)
            return str(result.inserted_id)
            
        except Exception as e:
            print(f"Error saving reading progress: {e}")
            raise
    
    async def get_reading_progress(self, user_id: str, document_id: str) -> Optional[Dict[str, Any]]:
        """Get reading progress for a user and document"""
        try:
            progress = await self.db[self.collections["progress"]].find_one({
                "user_id": user_id,
                "document_id": document_id
            })
            
            if progress:
                progress["_id"] = str(progress["_id"])
            
            return progress
            
        except Exception as e:
            print(f"Error getting reading progress: {e}")
            return None
    
    async def save_solana_transaction(self, transaction: SolanaTransaction) -> str:
        """Save Solana transaction to MongoDB"""
        try:
            transaction_data = {
                "signature": transaction.signature,
                "user_id": transaction.user_id,
                "document_id": transaction.document_id,
                "progress_data": transaction.progress_data.model_dump(),
                "timestamp": transaction.timestamp,
                "created_at": datetime.utcnow()
            }
            
            result = await self.db[self.collections["transactions"]].insert_one(transaction_data)
            return str(result.inserted_id)
            
        except Exception as e:
            print(f"Error saving Solana transaction: {e}")
            raise
    
    async def get_user_transactions(self, user_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Get Solana transactions for a user"""
        try:
            cursor = self.db[self.collections["transactions"]].find(
                {"user_id": user_id}
            ).sort("created_at", -1).limit(limit)
            
            transactions = []
            async for tx in cursor:
                tx["_id"] = str(tx["_id"])
                transactions.append(tx)
            
            return transactions
            
        except Exception as e:
            print(f"Error getting user transactions: {e}")
            return []
    
    async def update_user_settings(self, user_id: str, settings: ADHDReadingSettings) -> bool:
        """Update or create user settings"""
        try:
            settings_data = settings.model_dump()
            settings_data["updated_at"] = datetime.utcnow()
            
            await self.db[self.collections["users"]].update_one(
                {"user_id": user_id},
                {
                    "$set": settings_data,
                    "$setOnInsert": {"created_at": datetime.utcnow()}
                },
                upsert=True
            )
            
            return True
            
        except Exception as e:
            print(f"Error updating user settings: {e}")
            return False
    
    async def get_user_settings(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user settings"""
        try:
            settings = await self.db[self.collections["users"]].find_one({"user_id": user_id})
            
            if settings:
                settings["_id"] = str(settings["_id"])
            
            return settings
            
        except Exception as e:
            print(f"Error getting user settings: {e}")
            return None
    
    async def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive user statistics"""
        try:
            # Get document count
            doc_count = await self.db[self.collections["documents"]].count_documents({"user_id": user_id})
            
            # Get progress records
            progress_count = await self.db[self.collections["progress"]].count_documents({"user_id": user_id})
            
            # Get transaction count
            tx_count = await self.db[self.collections["transactions"]].count_documents({"user_id": user_id})
            
            # Get total reading time
            total_time_pipeline = [
                {"$match": {"user_id": user_id}},
                {"$group": {"_id": None, "total_time": {"$sum": "$time_spent"}}}
            ]
            total_time_result = await self.db[self.collections["progress"]].aggregate(total_time_pipeline).to_list(1)
            total_reading_time = total_time_result[0]["total_time"] if total_time_result else 0
            
            return {
                "documents_uploaded": doc_count,
                "reading_sessions": progress_count,
                "blockchain_transactions": tx_count,
                "total_reading_time_seconds": total_reading_time,
                "total_reading_time_minutes": total_reading_time // 60,
                "total_reading_time_hours": total_reading_time // 3600
            }
            
        except Exception as e:
            print(f"Error getting user stats: {e}")
            return {
                "documents_uploaded": 0,
                "reading_sessions": 0,
                "blockchain_transactions": 0,
                "total_reading_time_seconds": 0,
                "total_reading_time_minutes": 0,
                "total_reading_time_hours": 0
            }


# Global instance
mongodb_service = None

async def get_mongodb_service() -> MongoDBService:
    global mongodb_service
    if mongodb_service is None:
        mongodb_service = MongoDBService()
        await mongodb_service.connect()
    return mongodb_service
