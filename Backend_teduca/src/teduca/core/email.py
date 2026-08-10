"""Envío de emails transaccionales vía Resend."""

import logging
import os

logger = logging.getLogger(__name__)


def send_password_reset_email(*, to: str, reset_url: str) -> None:
    """Envía el email de restablecimiento de contraseña.

    Si RESEND_API_KEY no está configurada, loguea el enlace en lugar de enviarlo
    (útil en desarrollo local).
    """
    api_key = os.getenv("RESEND_API_KEY", "")
    from_email = os.getenv("RESEND_FROM_EMAIL", "TEDUCA <noreply@teduca.app>")

    if not api_key:
        logger.warning("[email] RESEND_API_KEY no configurada — enlace de reset: %s", reset_url)
        return

    import resend

    resend.api_key = api_key

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

    try:
        resend.Emails.send({
            "from": from_email,
            "to": [to],
            "subject": "Restablecer contraseña — TEDUCA",
            "html": html,
        })
    except Exception:
        logger.exception("[email] Error al enviar email de reset a %s", to)
