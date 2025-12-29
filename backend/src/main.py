import uvicorn
from fastapi import FastAPI

from starlette.middleware.cors import CORSMiddleware

from backend.src import api_router
from backend.src.middleware.request_logger import request_logger_middleware


def get_application() -> FastAPI:
    application = FastAPI(
        title="Chef Assistant API",
    )

    application.include_router(
        router=api_router
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    return application


app = get_application()
app.middleware("http")(request_logger_middleware)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", reload=True)
