from __future__ import annotations

from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/")
def root() -> dict[str, str]:
    return {
        "name": "SignAction Backend",
        "health": "/health",
        "docs": "/docs",
    }


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/__routes")
def list_routes(request: Request) -> dict[str, list[dict[str, object]]]:
    routes: list[dict[str, object]] = []
    for r in request.app.routes:
        methods = sorted([m for m in getattr(r, "methods", []) if m])
        routes.append(
            {
                "path": getattr(r, "path", None),
                "name": getattr(r, "name", None),
                "methods": methods,
            }
        )

    routes.sort(key=lambda x: (str(x.get("path")), ",".join(x.get("methods") or [])))
    return {"routes": routes}
