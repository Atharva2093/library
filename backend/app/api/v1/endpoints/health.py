from fastapi import APIRouter

router = APIRouter()


@router.get("/", summary="API Health Check")
def health_status():
    return {"status": "ok", "message": "API online"}
