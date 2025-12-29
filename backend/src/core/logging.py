import logging

LOG_FORMAT = (
    "[%(asctime)s] "
    "[%(levelname)s] "
    "[request_id=%(request_id)s] "
    "%(message)s"
)

logging.basicConfig(
    level=logging.INFO,
    format=LOG_FORMAT,
)

logger = logging.getLogger("app")