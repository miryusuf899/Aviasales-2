from email.message import EmailMessage

import aiosmtplib

from app.core.config import settings


async def send_email(to_email: str, subject: str, message: str) -> None:
    email = EmailMessage()
    email["From"] = settings.smtp_from
    email["To"] = to_email
    email["Subject"] = subject
    email.set_content(message)
    await aiosmtplib.send(
        email,
        hostname=settings.smtp_host,
        port=settings.smtp_port,
        username=settings.smtp_user,
        password=settings.smtp_password,
        start_tls=False,
    )
