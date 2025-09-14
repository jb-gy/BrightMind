import os
import json
import time
from typing import Dict, Any, Optional, List
from models import ReadingProgress, SolanaTransaction

try:
    from solana.rpc.api import Client
    from solana.keypair import Keypair
    from solana.publickey import PublicKey
    from solana.transaction import Transaction
    from solana.system_program import TransferParams, transfer
    from base58 import b58encode, b58decode
    SOLANA_AVAILABLE = True
except ImportError:
    SOLANA_AVAILABLE = False
    print("Warning: Solana dependencies not available. Blockchain features will be disabled.")


class SolanaService:
    def __init__(self):
        if not SOLANA_AVAILABLE:
            self.rpc_url = None
            self.client = None
            self.wallet = None
            self.program_id = None
            return
            
        self.rpc_url = os.getenv("SOLANA_RPC_URL", "https://api.devnet.solana.com")
        self.client = Client(self.rpc_url)
        
        # Load or create wallet
        self.wallet_path = os.getenv("SOLANA_WALLET_PATH", "wallet.json")
        self.wallet = self._load_or_create_wallet()
        
        # Program ID for our reading progress tracking
        self.program_id = os.getenv("READING_PROGRAM_ID", "11111111111111111111111111111111")
    
    def _load_or_create_wallet(self):
        """Load existing wallet or create new one"""
        if not SOLANA_AVAILABLE:
            return None
            
        try:
            if os.path.exists(self.wallet_path):
                with open(self.wallet_path, 'r') as f:
                    wallet_data = json.load(f)
                return Keypair.from_secret_key(b58decode(wallet_data['secret_key']))
            else:
                # Create new wallet
                wallet = Keypair()
                wallet_data = {
                    'public_key': str(wallet.public_key),
                    'secret_key': b58encode(wallet.secret_key).decode('utf-8')
                }
                with open(self.wallet_path, 'w') as f:
                    json.dump(wallet_data, f)
                print(f"Created new wallet: {wallet.public_key}")
                return wallet
        except Exception as e:
            print(f"Error loading wallet: {e}")
            # Create new wallet as fallback
            wallet = Keypair()
            return wallet
    
    def get_wallet_balance(self) -> float:
        """Get current wallet balance in SOL"""
        if not SOLANA_AVAILABLE or not self.client or not self.wallet:
            return 0.0
            
        try:
            balance = self.client.get_balance(self.wallet.public_key)
            return balance.value / 1e9  # Convert lamports to SOL
        except Exception as e:
            print(f"Error getting balance: {e}")
            return 0.0
    
    def create_reading_progress_nft(self, progress: ReadingProgress) -> Optional[str]:
        """Create an NFT representing reading progress"""
        if not SOLANA_AVAILABLE:
            return None
            
        try:
            # This is a simplified implementation
            # In a real application, you'd interact with an NFT program
            
            # Create metadata for the NFT
            metadata = {
                "name": f"Reading Progress - {progress.document_id}",
                "description": f"Reading progress for user {progress.user_id}",
                "image": "https://example.com/reading-progress.png",
                "attributes": [
                    {"trait_type": "Progress", "value": f"{progress.current_line}/{progress.total_lines}"},
                    {"trait_type": "Reading Speed", "value": f"{progress.reading_speed:.2f}"},
                    {"trait_type": "Comprehension Score", "value": f"{progress.comprehension_score:.2f}"},
                    {"trait_type": "Time Spent", "value": f"{progress.time_spent} seconds"},
                    {"trait_type": "Characters Encountered", "value": len(progress.characters_encountered)}
                ]
            }
            
            # For now, return a mock transaction signature
            # In production, this would be a real Solana transaction
            mock_signature = f"reading_progress_{int(time.time())}_{progress.user_id}"
            
            return mock_signature
            
        except Exception as e:
            print(f"Error creating reading progress NFT: {e}")
            return None
    
    def record_reading_milestone(self, progress: ReadingProgress, milestone_type: str) -> Optional[str]:
        """Record a reading milestone on Solana"""
        if not SOLANA_AVAILABLE:
            return f"mock_milestone_{milestone_type}_{int(time.time())}_{progress.user_id}"
            
        try:
            # Create milestone data
            milestone_data = {
                "user_id": progress.user_id,
                "document_id": progress.document_id,
                "milestone_type": milestone_type,
                "progress_percentage": (progress.current_line / progress.total_lines) * 100,
                "timestamp": int(time.time()),
                "characters_encountered": progress.characters_encountered,
                "reading_speed": progress.reading_speed,
                "comprehension_score": progress.comprehension_score
            }
            
            # In a real implementation, this would create a Solana transaction
            # For now, we'll simulate it
            transaction_signature = f"milestone_{milestone_type}_{int(time.time())}_{progress.user_id}"
            
            # Store the transaction record
            transaction = SolanaTransaction(
                signature=transaction_signature,
                user_id=progress.user_id,
                document_id=progress.document_id,
                progress_data=progress,
                timestamp=int(time.time())
            )
            
            # In production, you'd store this in a database
            print(f"Recorded milestone: {milestone_type} for user {progress.user_id}")
            
            return transaction_signature
            
        except Exception as e:
            print(f"Error recording milestone: {e}")
            return None
    
    def get_reading_achievements(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's reading achievements from Solana"""
        try:
            # This would query the blockchain for user's achievements
            # For now, return mock data
            achievements = [
                {
                    "id": f"first_read_{user_id}",
                    "name": "First Steps",
                    "description": "Completed your first reading session",
                    "timestamp": int(time.time()) - 86400,
                    "nft_metadata": "https://example.com/achievements/first_read.json"
                },
                {
                    "id": f"speed_reader_{user_id}",
                    "name": "Speed Reader",
                    "description": "Read at 200+ words per minute",
                    "timestamp": int(time.time()) - 3600,
                    "nft_metadata": "https://example.com/achievements/speed_reader.json"
                }
            ]
            
            return achievements
            
        except Exception as e:
            print(f"Error getting achievements: {e}")
            return []
    
    def create_reading_challenge(self, challenge_data: Dict[str, Any]) -> Optional[str]:
        """Create a reading challenge that users can participate in"""
        try:
            challenge_id = f"challenge_{int(time.time())}"
            
            # Store challenge data (in production, this would be on-chain)
            challenge = {
                "id": challenge_id,
                "title": challenge_data.get("title", "Reading Challenge"),
                "description": challenge_data.get("description", ""),
                "requirements": challenge_data.get("requirements", {}),
                "reward": challenge_data.get("reward", 0.1),  # SOL reward
                "start_time": int(time.time()),
                "end_time": int(time.time()) + (7 * 24 * 3600),  # 7 days
                "participants": [],
                "status": "active"
            }
            
            print(f"Created reading challenge: {challenge_id}")
            return challenge_id
            
        except Exception as e:
            print(f"Error creating challenge: {e}")
            return None
    
    def get_user_reading_stats(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive reading statistics for a user"""
        try:
            # This would aggregate data from multiple sources
            stats = {
                "total_reading_time": 3600,  # seconds
                "documents_completed": 5,
                "average_reading_speed": 150,  # words per minute
                "comprehension_average": 0.85,
                "characters_encountered": 25,
                "achievements_earned": 3,
                "current_streak": 7,  # days
                "longest_streak": 30,
                "favorite_genre": "fiction",
                "reading_level": "middle_school"
            }
            
            return stats
            
        except Exception as e:
            print(f"Error getting user stats: {e}")
            return {}
    
    def transfer_reward(self, to_user_id: str, amount: float, reason: str) -> Optional[str]:
        """Transfer SOL reward to a user"""
        try:
            # In production, you'd have a mapping of user_id to Solana public key
            # For now, we'll simulate the transaction
            
            if self.get_wallet_balance() < amount:
                print(f"Insufficient balance for reward transfer")
                return None
            
            # Create transaction
            transaction = Transaction()
            transaction.add(transfer(TransferParams(
                from_pubkey=self.wallet.public_key,
                to_pubkey=PublicKey("11111111111111111111111111111111"),  # Mock recipient
                lamports=int(amount * 1e9)  # Convert SOL to lamports
            )))
            
            # Sign and send transaction
            signature = self.client.send_transaction(transaction, self.wallet)
            
            print(f"Transferred {amount} SOL to {to_user_id} for: {reason}")
            return signature.value
            
        except Exception as e:
            print(f"Error transferring reward: {e}")
            return None


# Global instance
solana_service = None

def get_solana_service() -> SolanaService:
    global solana_service
    if solana_service is None:
        solana_service = SolanaService()
    return solana_service
