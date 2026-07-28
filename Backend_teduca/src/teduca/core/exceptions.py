"""Jerarquía de excepciones de dominio y handlers consistentes (RFC-7807)."""

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class AppException(Exception):
    """Excepción base de la aplicación. Se traduce a problem+json."""

    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    title: str = "Internal Server Error"
    detail: str = "Ha ocurrido un error inesperado."

    def __init__(self, detail: str | None = None) -> None:
        if detail:
            self.detail = detail
        super().__init__(self.detail)


class NotFoundError(AppException):
    status_code = status.HTTP_404_NOT_FOUND
    title = "Not Found"
    detail = "Recurso no encontrado."


class ConflictError(AppException):
    status_code = status.HTTP_409_CONFLICT
    title = "Conflict"
    detail = "El recurso ya existe o hay un conflicto de estado."


class UnauthorizedError(AppException):
    status_code = status.HTTP_401_UNAUTHORIZED
    title = "Unauthorized"
    detail = "Se requiere autenticación."


class ForbiddenError(AppException):
    status_code = status.HTTP_403_FORBIDDEN
    title = "Forbidden"
    detail = "No tienes permisos para esta acción."


class ValidationError(AppException):
    status_code = status.HTTP_422_UNPROCESSABLE_CONTENT
    title = "Validation Error"
    detail = "Datos inválidos."


def _problem(request: Request, status_code: int, title: str, detail: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "type": "about:blank",
            "title": title,
            "status": status_code,
            "detail": detail,
            "instance": str(request.url.path),
        },
        media_type="application/problem+json",
    )


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def _app_exc(request: Request, exc: AppException) -> JSONResponse:
        return _problem(request, exc.status_code, exc.title, exc.detail)

    @app.exception_handler(RequestValidationError)
    async def _validation_exc(request: Request, exc: RequestValidationError) -> JSONResponse:
        return _problem(
            request,
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            "Validation Error",
            "; ".join(f"{'.'.join(map(str, e['loc']))}: {e['msg']}" for e in exc.errors()),
        )
