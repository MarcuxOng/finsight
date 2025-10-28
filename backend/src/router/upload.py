from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import PlainTextResponse

from src.utils.auth import get_current_user_id
from src.services.upload import parse_csv_file, get_csv_template
from src.utils.schema import CSVUploadResponse

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/csv", response_model=CSVUploadResponse)
async def upload_csv(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id)
):
    """Upload and parse CSV file with transactions."""
    # Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    # Read file content
    content = await file.read()
    file_content = content.decode('utf-8')
    
    # Parse and import
    result = await parse_csv_file(file_content, user_id)
    return result


@router.get("/template", response_class=PlainTextResponse)
async def download_template():
    """Download CSV template."""
    return await get_csv_template()
