import pandas as pd
from io import StringIO
from pathlib import Path
from typing import Dict

from src.database import get_supabase_admin
from src.services.categorization import categorize_transaction


async def parse_csv_file(file_content: str, user_id: str, file_extension: str = '.csv') -> Dict:
    """
    Parse CSV or Excel file and import transactions.
    
    Expected format:
    date, description, amount, type (optional)
    
    Args:
        file_content: File content as string (for CSV) or bytes (for Excel)
        user_id: User ID
        file_extension: File extension (.csv or .xlsx)
        
    Returns:
        Dictionary with import results
    """
    errors = []
    successful_imports = 0
    failed_imports = 0
    
    try:
        # Read file based on extension
        if file_extension == '.xlsx':
            from io import BytesIO
            df = pd.read_excel(BytesIO(file_content))
        else:
            df = pd.read_csv(StringIO(file_content))
        
        # Validate required columns
        required_columns = ['date', 'description', 'amount']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            return {
                "message": "Invalid CSV format",
                "total_rows": 0,
                "successful_imports": 0,
                "failed_imports": 0,
                "errors": [f"Missing required columns: {', '.join(missing_columns)}"]
            }
        
        supabase = get_supabase_admin()
        
        # Process each row
        for index, row in df.iterrows():
            try:
                # Parse date
                transaction_date = pd.to_datetime(row['date']).date()
                
                # Determine transaction type
                amount = float(row['amount'])
                transaction_type = row.get('type', 'expense' if amount < 0 else 'income').lower()
                
                # Make amount positive if it's negative
                amount = abs(amount)
                
                # Categorize transaction
                category = await categorize_transaction(row['description'], amount)
                
                # Insert into database
                transaction_data = {
                    "user_id": user_id,
                    "date": transaction_date.isoformat(),
                    "description": str(row['description']),
                    "amount": amount,
                    "category": category,
                    "type": transaction_type,
                    "source": "csv_upload"
                }
                
                supabase.table("transactions").insert(transaction_data).execute()
                successful_imports += 1
                
            except Exception as e:
                failed_imports += 1
                errors.append(f"Row {index + 2}: {str(e)}")
        
        return {
            "message": "CSV import completed",
            "total_rows": len(df),
            "successful_imports": successful_imports,
            "failed_imports": failed_imports,
            "errors": errors[:10]  # Return first 10 errors
        }
        
    except Exception as e:
        return {
            "message": "Failed to parse CSV",
            "total_rows": 0,
            "successful_imports": 0,
            "failed_imports": 0,
            "errors": [str(e)]
        }


async def get_csv_template():
    """
    Get Excel template for users.
    
    Returns:
        Excel file content as bytes
    """
    
    # Get the path to the template file (go up from services/ to src/ then to dumps/)
    template_path = Path(__file__).parent.parent / 'dumps' / 'transactions_template.xlsx'
    
    # Read and return the file content
    with open(template_path, 'rb') as f:
        return f.read()
