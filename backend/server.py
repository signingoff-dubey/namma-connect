from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Namma Metro Stations Data
NAMMA_METRO_STATIONS = {
    "purple": [
        "Baiyappanahalli", "Swami Vivekananda Road", "Indiranagar", "Halasuru",
        "Trinity", "MG Road", "Cubbon Park", "Vidhana Soudha", "Sir M Visvesvaraya",
        "Majestic", "Chickpet", "KR Market", "National College", "Lalbagh",
        "South End Circle", "Jayanagar", "RV Road", "Banashankari",
        "Jaya Prakash Nagar", "Yelachenahalli", "Konanakunte Cross",
        "Doddakallasandra", "Vajarahalli", "Thalaghattapura", "Silk Institute"
    ],
    "green": [
        "Nagasandra", "Dasarahalli", "Jalahalli", "Peenya Industry",
        "Peenya", "Goraguntepalya", "Yeshwanthpur", "Sandal Soap Factory",
        "Mahalakshmi", "Rajajinagar", "Kuvempu Road", "Srirampura",
        "Mantri Square Sampige Road", "Majestic", "Chickpet", "KR Market",
        "National College", "Lalbagh", "South End Circle", "Jayanagar",
        "RV Road", "Banashankari", "Jaya Prakash Nagar", "Yelachenahalli"
    ],
    "yellow": [
        "RV Road", "Jayanagar", "South End Circle", "Lalbagh",
        "National College", "KR Market", "Chickpet", "Majestic"
    ]
}

# === MODELS ===
class User(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")
    id: str = Field(alias="_id")
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    profile_photo: Optional[str] = None
    organization_type: Optional[str] = None
    organization_name: Optional[str] = None
    organization_email: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    home_station: Optional[str] = None
    work_station: Optional[str] = None
    commute_times: Optional[dict] = None
    travel_days: Optional[List[str]] = None
    bio: Optional[str] = None
    interests: Optional[List[str]] = None
    privacy_settings: Optional[dict] = None
    is_verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Connection(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    connected_user_id: str
    status: str  # pending, accepted, rejected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    from_user_id: str
    to_user_id: str
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    read: bool = False

class Wave(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    from_user_id: str
    to_user_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Trip(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    from_station: str
    to_station: str
    line: str
    current_station: Optional[str] = None
    start_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_time: Optional[datetime] = None
    active: bool = True

# === AUTH HELPER ===
async def get_current_user(request: Request, authorization: Optional[str] = Header(None)) -> Optional[User]:
    # Try cookie first
    session_token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not session_token and authorization:
        if authorization.startswith("Bearer "):
            session_token = authorization.replace("Bearer ", "")
    
    if not session_token:
        return None
    
    # Find session
    session = await db.user_sessions.find_one({"session_token": session_token})
    if not session or session["expires_at"] < datetime.now(timezone.utc):
        return None
    
    # Find user
    user_doc = await db.users.find_one({"_id": session["user_id"]})
    if not user_doc:
        return None
    
    return User(**user_doc)

# === AUTH ROUTES ===
@api_router.post("/auth/session")
async def create_session(request: Request, response: Response, x_session_id: str = Header(None)):
    if not x_session_id:
        raise HTTPException(status_code=400, detail="X-Session-ID header required")
    
    # Call Emergent auth service
    async with httpx.AsyncClient() as client:
        auth_response = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": x_session_id}
        )
    
    if auth_response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session ID")
    
    data = auth_response.json()
    user_id = data["id"]
    
    # Check if user exists
    existing_user = await db.users.find_one({"_id": user_id})
    
    if not existing_user:
        # Create new user
        user_doc = {
            "_id": user_id,
            "email": data["email"],
            "name": data["name"],
            "picture": data.get("picture"),
            "created_at": datetime.now(timezone.utc)
        }
        await db.users.insert_one(user_doc)
    
    # Create session
    session_token = data["session_token"]
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    return {"success": True, "user": {"id": user_id, "email": data["email"], "name": data["name"]}}

@api_router.get("/auth/me")
async def get_me(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/")
    return {"success": True}

# === PROFILE ROUTES ===
@api_router.get("/profile")
async def get_profile(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    profile = await db.user_profiles.find_one({"user_id": user.id}, {"_id": 0})
    if not profile:
        return None
    return profile

@api_router.post("/profile")
async def create_or_update_profile(profile_data: dict, request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    profile_data["user_id"] = user.id
    profile_data["updated_at"] = datetime.now(timezone.utc)
    
    existing = await db.user_profiles.find_one({"user_id": user.id})
    if existing:
        await db.user_profiles.update_one({"user_id": user.id}, {"$set": profile_data})
    else:
        profile_data["created_at"] = datetime.now(timezone.utc)
        await db.user_profiles.insert_one(profile_data)
    
    return {"success": True}

@api_router.get("/profile/{user_id}")
async def get_user_profile(user_id: str, request: Request, authorization: Optional[str] = Header(None)):
    current_user = await get_current_user(request, authorization)
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    profile = await db.user_profiles.find_one({"user_id": user_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Apply privacy settings
    privacy = profile.get("privacy_settings", {})
    
    return profile

# === STATIONS ===
@api_router.get("/stations")
async def get_stations():
    return NAMMA_METRO_STATIONS

# === DISCOVERY ===
@api_router.get("/discover")
async def discover_users(
    request: Request,
    authorization: Optional[str] = Header(None),
    organization: Optional[str] = None,
    same_destination: Optional[bool] = None,
    line: Optional[str] = None
):
    user = await get_current_user(request, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Get current user profile
    my_profile = await db.user_profiles.find_one({"user_id": user.id})
    
    # Build query
    query = {"user_id": {"$ne": user.id}}
    
    if organization:
        query["organization_name"] = organization
    
    if same_destination and my_profile:
        query["work_station"] = my_profile.get("work_station")
    
    profiles = await db.user_profiles.find(query, {"_id": 0}).to_list(50)
    
    # Get active trips for each user
    result = []
    for profile in profiles:
        user_data = await db.users.find_one({"_id": profile["user_id"]}, {"_id": 0})
        trip = await db.trips.find_one({"user_id": profile["user_id"], "active": True}, {"_id": 0})
        
        result.append({
            "user": user_data,
            "profile": profile,
            "current_trip": trip
        })
    
    return result

# === CONNECTIONS ===
@api_router.get("/connections")
async def get_connections(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    connections = await db.connections.find(
        {"$or": [{"user_id": user.id}, {"connected_user_id": user.id}], "status": "accepted"},
        {"_id": 0}
    ).to_list(100)
    
    # Enrich with user data
    result = []
    for conn in connections:
        other_user_id = conn["connected_user_id"] if conn["user_id"] == user.id else conn["user_id"]
        other_user = await db.users.find_one({"_id": other_user_id}, {"_id": 0})
        other_profile = await db.user_profiles.find_one({"user_id": other_user_id}, {"_id": 0})
        
        result.append({
            "connection": conn,
            "user": other_user,
            "profile": other_profile
        })
    
    return result

@api_router.post("/connections")
async def create_connection(request: Request, connected_user_id: str, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if already exists
    existing = await db.connections.find_one({
        "$or": [
            {"user_id": user.id, "connected_user_id": connected_user_id},
            {"user_id": connected_user_id, "connected_user_id": user.id}
        ]
    })
    
    if existing:
        return {"success": False, "message": "Connection already exists"}
    
    conn = Connection(
        user_id=user.id,
        connected_user_id=connected_user_id,
        status="pending"
    )
    
    await db.connections.insert_one(conn.model_dump())
    return {"success": True}

@api_router.put("/connections/{connection_id}")
async def update_connection(connection_id: str, request: Request, status: str, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    await db.connections.update_one({"id": connection_id}, {"$set": {"status": status}})
    return {"success": True}

# === WAVES ===
@api_router.get("/waves")
async def get_waves(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    waves = await db.waves.find({"to_user_id": user.id}, {"_id": 0}).sort("timestamp", -1).to_list(50)
    
    result = []
    for wave in waves:
        from_user = await db.users.find_one({"_id": wave["from_user_id"]}, {"_id": 0})
        from_profile = await db.user_profiles.find_one({"user_id": wave["from_user_id"]}, {"_id": 0})
        result.append({"wave": wave, "user": from_user, "profile": from_profile})
    
    return result

@api_router.post("/waves")
async def send_wave(request: Request, to_user_id: str, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    wave = Wave(from_user_id=user.id, to_user_id=to_user_id)
    await db.waves.insert_one(wave.model_dump())
    return {"success": True}

# === MESSAGES ===
@api_router.get("/messages")
async def get_conversations(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Get all messages involving the user
    messages = await db.messages.find(
        {"$or": [{"from_user_id": user.id}, {"to_user_id": user.id}]},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(500)
    
    # Group by conversation
    conversations = {}
    for msg in messages:
        other_id = msg["to_user_id"] if msg["from_user_id"] == user.id else msg["from_user_id"]
        if other_id not in conversations:
            conversations[other_id] = []
        conversations[other_id].append(msg)
    
    result = []
    for other_id, msgs in conversations.items():
        other_user = await db.users.find_one({"_id": other_id}, {"_id": 0})
        other_profile = await db.user_profiles.find_one({"user_id": other_id}, {"_id": 0})
        result.append({
            "user": other_user,
            "profile": other_profile,
            "last_message": msgs[0],
            "unread_count": len([m for m in msgs if m["to_user_id"] == user.id and not m["read"]])
        })
    
    return result

@api_router.get("/messages/{other_user_id}")
async def get_messages_with_user(other_user_id: str, request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    messages = await db.messages.find(
        {"$or": [
            {"from_user_id": user.id, "to_user_id": other_user_id},
            {"from_user_id": other_user_id, "to_user_id": user.id}
        ]},
        {"_id": 0}
    ).sort("timestamp", 1).to_list(500)
    
    # Mark as read
    await db.messages.update_many(
        {"from_user_id": other_user_id, "to_user_id": user.id, "read": False},
        {"$set": {"read": True}}
    )
    
    return messages

@api_router.post("/messages")
async def send_message(request: Request, to_user_id: str, content: str, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    message = Message(from_user_id=user.id, to_user_id=to_user_id, content=content)
    await db.messages.insert_one(message.model_dump())
    return {"success": True, "message": message.model_dump()}

# === TRIPS ===
@api_router.get("/trips")
async def get_trips(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    trips = await db.trips.find({"user_id": user.id}, {"_id": 0}).sort("start_time", -1).to_list(100)
    return trips

@api_router.post("/trips")
async def start_trip(request: Request, from_station: str, to_station: str, line: str, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # End any active trips
    await db.trips.update_many(
        {"user_id": user.id, "active": True},
        {"$set": {"active": False, "end_time": datetime.now(timezone.utc)}}
    )
    
    trip = Trip(user_id=user.id, from_station=from_station, to_station=to_station, line=line, current_station=from_station)
    await db.trips.insert_one(trip.model_dump())
    return {"success": True, "trip": trip.model_dump()}

@api_router.put("/trips/{trip_id}")
async def update_trip(trip_id: str, request: Request, current_station: Optional[str] = None, active: Optional[bool] = None, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    update_data = {}
    if current_station:
        update_data["current_station"] = current_station
    if active is not None:
        update_data["active"] = active
        if not active:
            update_data["end_time"] = datetime.now(timezone.utc)
    
    await db.trips.update_one({"id": trip_id, "user_id": user.id}, {"$set": update_data})
    return {"success": True}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()