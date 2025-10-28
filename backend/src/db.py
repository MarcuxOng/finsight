"""
Database module - deprecated, use database/ package instead.
This file is kept for backward compatibility.
"""
from src.database import get_supabase, get_supabase_admin

__all__ = ['get_supabase', 'get_supabase_admin']
