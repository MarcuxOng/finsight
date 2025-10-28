from fastapi import APIRouter, HTTPException

from src.database import get_supabase
from src.utils.schema import Token, UserRegister, UserLogin

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
async def register(user: UserRegister):
    """Register a new user."""
    try:
        supabase = get_supabase()
        
        # Register user with Supabase
        auth_response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password,
            "options": {
                "data": {
                    "name": user.name
                }
            }
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Registration failed")
        
        return Token(
            access_token=auth_response.session.access_token,
            user={
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "name": user.name
            }
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    """Login a user."""
    try:
        supabase = get_supabase()
        
        # Sign in with Supabase
        auth_response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        return Token(
            access_token=auth_response.session.access_token,
            user={
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "name": auth_response.user.user_metadata.get("name", "")
            }
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")