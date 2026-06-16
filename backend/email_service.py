import smtplib
import os
import random
import string
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

GMAIL_USER     = os.getenv("GMAIL_USER")
GMAIL_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")


def generate_otp() -> str:
    """Generate a 6-digit OTP."""
    return ''.join(random.choices(string.digits, k=6))


def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """Send an email via Gmail SMTP."""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = f"PathGenie 🧞 <{GMAIL_USER}>"
        msg["To"]      = to_email

        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_USER, GMAIL_PASSWORD)
            server.sendmail(GMAIL_USER, to_email, msg.as_string())

        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False


def send_otp_email(to_email: str, name: str, otp: str) -> bool:
    """Send OTP verification email."""
    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#0f172a;font-family:Inter,sans-serif;">
      <div style="max-width:520px;margin:40px auto;background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#0284c7,#7c3aed);padding:32px;text-align:center;">
          <div style="font-size:48px;margin-bottom:8px;">🧞</div>
          <h1 style="color:white;margin:0;font-size:24px;font-weight:800;">PathGenie</h1>
          <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:14px;">AI-Powered Learning Assistant</p>
        </div>

        <!-- Body -->
        <div style="padding:32px;">
          <h2 style="color:white;font-size:20px;margin:0 0 8px;">Hi {name}! 👋</h2>
          <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Welcome to PathGenie! Please verify your email address using the OTP below.
            This code expires in <strong style="color:white;">10 minutes</strong>.
          </p>

          <!-- OTP Box -->
          <div style="background:#0f172a;border:2px solid #0284c7;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
            <p style="color:#94a3b8;font-size:13px;margin:0 0 12px;text-transform:uppercase;letter-spacing:2px;">Your Verification Code</p>
            <div style="font-size:42px;font-weight:900;letter-spacing:10px;color:#38bdf8;font-family:monospace;">
              {otp}
            </div>
          </div>

          <p style="color:#64748b;font-size:13px;margin:0;">
            ⚠️ Never share this OTP with anyone. PathGenie will never ask for your OTP.
          </p>
        </div>

        <!-- Footer -->
        <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="color:#475569;font-size:12px;margin:0;">
            © 2024 PathGenie. Made with ❤️ for students.
          </p>
        </div>
      </div>
    </body>
    </html>
    """
    return send_email(to_email, "🔐 Your PathGenie Verification Code", html)


def send_welcome_email(to_email: str, name: str) -> bool:
    """Send welcome email after successful verification."""
    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#0f172a;font-family:Inter,sans-serif;">
      <div style="max-width:520px;margin:40px auto;background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#0284c7,#7c3aed);padding:32px;text-align:center;">
          <div style="font-size:48px;margin-bottom:8px;">🎉</div>
          <h1 style="color:white;margin:0;font-size:24px;font-weight:800;">Welcome to PathGenie!</h1>
        </div>

        <!-- Body -->
        <div style="padding:32px;">
          <h2 style="color:white;font-size:20px;margin:0 0 8px;">You're all set, {name}! 🧞</h2>
          <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Your account has been verified successfully. Start your learning journey now!
          </p>

          <!-- Features -->
          <div style="space-y:12px;">
            <div style="background:#0f172a;border-radius:10px;padding:16px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.06);">
              <span style="font-size:20px;">📚</span>
              <strong style="color:white;margin-left:8px;">Find Courses</strong>
              <p style="color:#64748b;font-size:13px;margin:4px 0 0 28px;">Search from 10,000+ courses with AI</p>
            </div>
            <div style="background:#0f172a;border-radius:10px;padding:16px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.06);">
              <span style="font-size:20px;">🗺️</span>
              <strong style="color:white;margin-left:8px;">Career Roadmap</strong>
              <p style="color:#64748b;font-size:13px;margin:4px 0 0 28px;">Get a step-by-step career plan</p>
            </div>
            <div style="background:#0f172a;border-radius:10px;padding:16px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.06);">
              <span style="font-size:20px;">🧠</span>
              <strong style="color:white;margin-left:8px;">AI Quizzes</strong>
              <p style="color:#64748b;font-size:13px;margin:4px 0 0 28px;">Test your knowledge with instant quizzes</p>
            </div>
          </div>

          <!-- CTA -->
          <div style="text-align:center;margin-top:28px;">
            <a href="http://localhost" 
               style="background:linear-gradient(135deg,#0284c7,#7c3aed);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;display:inline-block;">
              Start Learning Now →
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="color:#475569;font-size:12px;margin:0;">
            © 2024 PathGenie. Made with ❤️ for students.
          </p>
        </div>
      </div>
    </body>
    </html>
    """
    return send_email(to_email, "🎉 Welcome to PathGenie — You're Verified!", html)
