# backend/src/middleware/request_logger.py
import time
import uuid
from fastapi import Request
from fastapi.responses import Response

from backend.src.core.logging import logger


async def request_logger_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id

    start_time = time.time()

    try:
        response: Response = await call_next(request)
    except Exception:
        logger.exception(
            "Unhandled exception",
            extra={"request_id": request_id},
        )
        raise

    duration = time.time() - start_time

    response.headers["X-Request-ID"] = request_id

    logger.info(
        "%s %s %s %.3fs",
        request.method,
        request.url.path,
        response.status_code,
        duration,
        extra={"request_id": request_id},
    )

    return response
