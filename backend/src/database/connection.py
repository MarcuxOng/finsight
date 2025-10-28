"""
Database connection and utilities for Supabase.
"""
from supabase import create_client, Client
from src.config import settings

# Initialize Supabase client
supabase: Client = create_client(settings.supabase_url, settings.supabase_key)

# Service role client for admin operations
supabase_admin: Client = create_client(settings.supabase_url, settings.supabase_service_key)


def get_supabase() -> Client:
    """Get the Supabase client instance."""
    return supabase


def get_supabase_admin() -> Client:
    """Get the Supabase admin client instance."""
    return supabase_admin
