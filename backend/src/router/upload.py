from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import Response

from src.utils.auth import get_current_user_id
from src.services.upload import parse_csv_file, get_csv_template
from src.utils.schema import CSVUploadResponse

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/csv", response_model=CSVUploadResponse)
async def upload_csv(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id)
):
    """Upload and parse CSV or Excel file with transactions."""
    # Validate file type
    if not (file.filename.endswith('.csv') or file.filename.endswith('.xlsx')):
        raise HTTPException(status_code=400, detail="Only CSV and Excel (.xlsx) files are allowed")
    
    # Get file extension
    file_extension = '.xlsx' if file.filename.endswith('.xlsx') else '.csv'
    
    # Read file content
    content = await file.read()
    
    # Decode for CSV, keep bytes for Excel
    if file_extension == '.csv':
        file_content = content.decode('utf-8')
    else:
        file_content = content
    
    # Parse and import
    result = await parse_csv_file(file_content, user_id, file_extension)
    return result


@router.get("/template")
async def download_template():
    """Download Excel template."""
    template_content = await get_csv_template()
    return Response(
        content=template_content,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=transactions_template.xlsx"}
    )
