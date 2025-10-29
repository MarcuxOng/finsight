"""
Logging utilities for the application.
"""
import logging
import sys
from datetime import datetime
from typing import Optional


# Configure logging format
LOG_FORMAT = "[%(levelname)s] %(asctime)s - %(name)s - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

# Create logger
logger = logging.getLogger("finsight")
logger.setLevel(logging.DEBUG)

# Create console handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.DEBUG)

# Create formatter and add to handler
formatter = logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT)
console_handler.setFormatter(formatter)

# Add handler to logger
if not logger.handlers:
    logger.addHandler(console_handler)


def log_info(message: str, context: Optional[dict] = None):
    """
    Log an INFO level message.
    
    Args:
        message: The message to log
        context: Optional context dictionary to include
    """
    if context:
        logger.info(f"{message} | Context: {context}")
    else:
        logger.info(message)


def log_error(message: str, error: Optional[Exception] = None, context: Optional[dict] = None):
    """
    Log an ERROR level message.
    
    Args:
        message: The message to log
        error: Optional exception object
        context: Optional context dictionary to include
    """
    error_msg = message
    if error:
        error_msg += f" | Error: {str(error)} | Type: {type(error).__name__}"
    if context:
        error_msg += f" | Context: {context}"
    
    logger.error(error_msg)
    
    if error:
        logger.debug("Stack trace:", exc_info=True)


def log_warning(message: str, context: Optional[dict] = None):
    """
    Log a WARNING level message.
    
    Args:
        message: The message to log
        context: Optional context dictionary to include
    """
    if context:
        logger.warning(f"{message} | Context: {context}")
    else:
        logger.warning(message)


def log_debug(message: str, context: Optional[dict] = None):
    """
    Log a DEBUG level message.
    
    Args:
        message: The message to log
        context: Optional context dictionary to include
    """
    if context:
        logger.debug(f"{message} | Context: {context}")
    else:
        logger.debug(message)


# Export all logging functions as a list
__all__ = ["log_info", "log_error", "log_warning", "log_debug"]
