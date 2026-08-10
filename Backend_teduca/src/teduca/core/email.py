"""Envío de emails transaccionales vía Resend."""

import logging
import os

logger = logging.getLogger(__name__)

_FROM = lambda: os.getenv("RESEND_FROM_EMAIL", "TEDUCA <noreply@teduca.app>")  # noqa: E731
_KEY  = lambda: os.getenv("RESEND_API_KEY", "")                                  # noqa: E731


def _send(*, to: str, subject: str, html: str) -> None:
    api_key = _KEY()
    if not api_key:
        logger.warning("[email] RESEND_API_KEY no configurada — email no enviado a %s | %s", to, subject)
        return
    import resend
    resend.api_key = api_key
    try:
        resend.Emails.send({"from": _FROM(), "to": [to], "subject": subject, "html": html})
    except Exception:
        logger.exception("[email] Error al enviar email a %s", to)


def send_password_reset_email(*, to: str, reset_url: str) -> None:
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
      <h2 style="margin-bottom:8px">Restablecer contraseña</h2>
      <p style="color:#555;margin-bottom:24px">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta TEDUCA.
        El enlace es válido por <strong>30 minutos</strong>.
      </p>
      <a href="{reset_url}" style="
        display:inline-block;padding:12px 28px;background:#000;color:#fff;
        text-decoration:none;border-radius:8px;font-weight:600
      ">Restablecer contraseña</a>
      <p style="color:#999;font-size:0.8rem;margin-top:24px">
        Si no solicitaste esto, podés ignorar este email.
      </p>
    </div>
    """
    _send(to=to, subject="Restablecer contraseña — TEDUCA", html=html)


def send_verification_email(*, to: str, name: str, verify_url: str) -> None:
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
      <h2 style="margin-bottom:8px">Hola {name}, verifica tu correo</h2>
      <p style="color:#555;margin-bottom:24px">
        Gracias por registrarte en TEDUCA. Haz clic en el botón para confirmar
        tu dirección de correo. El enlace es válido por <strong>24 horas</strong>.
      </p>
      <a href="{verify_url}" style="
        display:inline-block;padding:12px 28px;background:#000;color:#fff;
        text-decoration:none;border-radius:8px;font-weight:600
      ">Verificar mi correo</a>
      <p style="color:#999;font-size:0.8rem;margin-top:24px">
        Si no creaste una cuenta en TEDUCA, puedes ignorar este email.
      </p>
    </div>
    """
    _send(to=to, subject="Verifica tu correo — TEDUCA", html=html)


def send_teacher_approved_email(*, to: str, name: str, dashboard_url: str) -> None:
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
      <h2 style="margin-bottom:8px">¡Felicitaciones, {name}!</h2>
      <p style="color:#555;margin-bottom:24px">
        Tu solicitud para ser Profesor en TEDUCA fue <strong>aprobada</strong>.
        Ya puedes acceder a tu panel de profesor y empezar a conectar con estudiantes.
      </p>
      <a href="{dashboard_url}" style="
        display:inline-block;padding:12px 28px;background:#000;color:#fff;
        text-decoration:none;border-radius:8px;font-weight:600
      ">Ir a mi panel de Profesor</a>
    </div>
    """
    _send(to=to, subject="¡Tu cuenta de Profesor fue aprobada! — TEDUCA", html=html)
