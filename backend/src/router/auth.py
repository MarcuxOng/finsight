from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from src.database import get_supabase, get_supabase_admin
from src.utils.schema import Token, UserRegister, UserLogin, ProfileUpdate, PasswordChange, GoogleAuthRequest
from src.utils.auth import get_current_user_id
from src.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

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
                    "username": user.username
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
                "username": user.username,
                "created_at": auth_response.user.created_at
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
                "username": auth_response.user.user_metadata.get("username", ""),
                "created_at": auth_response.user.created_at
            }
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")


@router.put("/profile")
async def update_profile(
    profile: ProfileUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    user_id: str = Depends(get_current_user_id)
):
    """Update user profile (username and email)."""
    try:
        # Get admin client for user updates
        supabase_admin = get_supabase_admin()
        
        # Build update data
        update_attrs = {}
        
        # Update email if provided
        if profile.email:
            update_attrs["email"] = profile.email
        
        # Update user_metadata with username
        update_attrs["user_metadata"] = {"username": profile.username}
        
        # Update user using admin client
        user_response = supabase_admin.auth.admin.update_user_by_id(
            user_id,
            update_attrs
        )
        
        if not user_response.user:
            raise HTTPException(status_code=400, detail="Profile update failed")
        
        return {
            "message": "Profile updated successfully",
            "user": {
                "id": user_response.user.id,
                "email": user_response.user.email,
                "username": profile.username,
                "created_at": user_response.user.created_at
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    user_id: str = Depends(get_current_user_id)
):
    """Change user password."""
    try:
        # Get admin client
        supabase_admin = get_supabase_admin()
        
        # Get user details using admin client
        user_response = supabase_admin.auth.admin.get_user_by_id(user_id)
        if not user_response.user:
            raise HTTPException(status_code=401, detail="User not found")
        
        # Verify current password by attempting to sign in
        try:
            verify_supabase = get_supabase()
            verify_supabase.auth.sign_in_with_password({
                "email": user_response.user.email,
                "password": password_data.current_password
            })
        except Exception:
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        
        # Update to new password using admin client
        update_response = supabase_admin.auth.admin.update_user_by_id(
            user_id,
            {"password": password_data.new_password}
        )
        
        if not update_response.user:
            raise HTTPException(status_code=400, detail="Password change failed")
        
        return {
            "message": "Password changed successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/google", response_model=Token)
async def google_auth(auth_request: GoogleAuthRequest):
    """Authenticate user with Google OAuth token."""
    try:
        # Verify the Google ID token
        idinfo = id_token.verify_oauth2_token(
            auth_request.token,
            google_requests.Request(),
            settings.google_client_id
        )
        
        # Extract user info from Google token
        email = idinfo.get('email')
        google_id = idinfo.get('sub')
        name = idinfo.get('name', '')
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not found in Google token")
        
        supabase = get_supabase()
        
        # Try to sign in with OAuth (if user exists)
        try:
            # Check if user exists by trying to get their info
            # Since Supabase doesn't have a direct "check user exists" endpoint,
            # we'll attempt to sign in with OAuth
            auth_response = supabase.auth.sign_in_with_id_token({
                "provider": "google",
                "token": auth_request.token
            })
            
            if auth_response.user:
                return Token(
                    access_token=auth_response.session.access_token,
                    user={
                        "id": auth_response.user.id,
                        "email": auth_response.user.email,
                        "username": auth_response.user.user_metadata.get("username", name),
                        "created_at": auth_response.user.created_at
                    }
                )
        except Exception:
            pass  # User doesn't exist, proceed to create
        
        # If user doesn't exist, create a new one using admin client
        supabase_admin = get_supabase_admin()
        
        # Create user with Google OAuth provider
        create_response = supabase_admin.auth.admin.create_user({
            "email": email,
            "email_confirm": True,  # Auto-confirm email for Google users
            "user_metadata": {
                "username": name,
                "google_id": google_id,
                "provider": "google"
            }
        })
        
        if not create_response.user:
            raise HTTPException(status_code=400, detail="Failed to create user")
        
        # Generate session for the new user
        auth_response = supabase.auth.sign_in_with_id_token({
            "provider": "google",
            "token": auth_request.token
        })
        
        return Token(
            access_token=auth_response.session.access_token,
            user={
                "id": create_response.user.id,
                "email": create_response.user.email,
                "username": name,
                "created_at": create_response.user.created_at
            }
        )
        
    except ValueError as e:
        # Invalid token
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
