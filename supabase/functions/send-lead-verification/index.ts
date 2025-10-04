import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  email: string;
  full_name: string;
  workflow_id?: string;
  workflow_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, full_name, workflow_id, workflow_name }: VerificationRequest = await req.json();

    console.log("Sending verification email to:", email);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate verification token
    const verificationToken = crypto.randomUUID();

    // Update lead with verification token
    const { error: updateError } = await supabase
      .from("leads")
      .update({
        verification_token: verificationToken,
        verification_sent_at: new Date().toISOString(),
      })
      .eq("email", email);

    if (updateError) {
      console.error("Error updating lead:", updateError);
      throw updateError;
    }

    // Create verification URL - use referer header to get the actual site URL
    const referer = req.headers.get("referer") || req.headers.get("origin") || "";
    let baseUrl = "https://ahmedwesam.com"; // Production fallback
    
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        baseUrl = `${refererUrl.protocol}//${refererUrl.host}`;
      } catch (e) {
        console.log("Could not parse referer, using default:", e);
      }
    }
    
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}${workflow_id ? `&workflow=${workflow_id}` : ""}`;
    
    console.log("Generated verification URL:", verificationUrl);

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Ahmed Wesam <contact@ahmedwesam.com>",
      to: [email],
      subject: "Verify your email to continue downloading workflows",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #0E1116 0%, #1a1f2e 100%);">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background: rgba(18, 21, 28, 0.95); border-radius: 16px; border: 1px solid rgba(0, 229, 212, 0.1); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 0; text-align: center;">
                        <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: #E6F2F2; letter-spacing: -0.5px;">
                          Verify Your Email
                        </h1>
                        <p style="margin: 0; font-size: 16px; color: #AEB7C2; line-height: 1.5;">
                          Hi ${full_name}, thanks for your interest in automation workflows!
                        </p>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 32px 40px;">
                        <p style="margin: 0 0 24px; font-size: 15px; color: #AEB7C2; line-height: 1.6;">
                          You're just one step away from accessing ${workflow_name ? `<strong style="color: #E6F2F2;">${workflow_name}</strong> and` : ""} 9 more free workflow downloads.
                        </p>
                        
                        <!-- CTA Button -->
                        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 32px 0;">
                          <tr>
                            <td align="center">
                              <a href="${verificationUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #00E5D4 0%, #00C8FF 100%); color: #0E1116; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 8px 24px -8px rgba(0, 229, 212, 0.5);">
                                Verify Email & Continue
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 24px 0 0; font-size: 14px; color: #7A8491; line-height: 1.6;">
                          Or copy and paste this link into your browser:<br>
                          <a href="${verificationUrl}" style="color: #00E5D4; word-break: break-all; text-decoration: underline;">${verificationUrl}</a>
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 32px 40px; border-top: 1px solid rgba(174, 183, 194, 0.1);">
                        <p style="margin: 0 0 8px; font-size: 13px; color: #7A8491; line-height: 1.5;">
                          This link will expire in 7 days. If you didn't request this email, you can safely ignore it.
                        </p>
                        <p style="margin: 8px 0 0; font-size: 13px; color: #7A8491;">
                          Best regards,<br>
                          <strong style="color: #AEB7C2;">Ahmed Wesam</strong>
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- Footer Note -->
                  <p style="margin: 24px 0 0; font-size: 12px; color: #7A8491; text-align: center;">
                    © 2025 Ahmed Wesam. CRM & Automation Specialist.
                  </p>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification email sent successfully" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-lead-verification function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
