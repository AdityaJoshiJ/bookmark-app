import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, handle } = body;

    // 1. Validate email
    if (!email || typeof email !== "string" || !email.includes('@')) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // 2. Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'BookmarkApp <onboarding@resend.dev>', // Replace with your verified domain in production
      to: [email],
      subject: 'Welcome to BookmarkApp!',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
          <h1 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 16px 0; letter-spacing: -0.025em;">Welcome to BookmarkApp!</h1>
          <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin: 0 0 24px 0;">
            Hi ${handle ? `@${handle}` : 'there'},
          </p>
          <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin: 0 0 24px 0;">
            We're excited to have you on board. BookmarkApp is designed to help you organize your digital life, one link at a time.
          </p>
          <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin: 0 0 32px 0;">
            Start by adding your favorite bookmarks or setting up your public profile to share your finds with the world.
          </p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard" 
             style="display: inline-block; background-color: #000000; color: #ffffff; font-size: 16px; font-weight: 600; padding: 12px 32px; border-radius: 8px; text-decoration: none;">
            Go to Dashboard
          </a>
          <div style="margin-top: 48px; padding-top: 32px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 14px; line-height: 20px; color: #9ca3af; margin: 0;">
              Best regards,<br />
              The BookmarkApp Team
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error("Internal Server Error in welcome-email route:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
