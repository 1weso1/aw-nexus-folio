import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactNotification {
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: ContactNotification = await req.json();
    
    console.log('Sending contact notification for:', payload.name);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #00E5D4 0%, #00C8FF 100%);
              color: white;
              padding: 20px;
              border-radius: 8px 8px 0 0;
              margin-bottom: 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border: 1px solid #e0e0e0;
              border-top: none;
              border-radius: 0 0 8px 8px;
            }
            .field {
              margin-bottom: 20px;
            }
            .label {
              font-weight: 600;
              color: #555;
              margin-bottom: 5px;
            }
            .value {
              background: white;
              padding: 12px;
              border-radius: 4px;
              border: 1px solid #ddd;
            }
            .message-box {
              background: white;
              padding: 15px;
              border-radius: 4px;
              border-left: 4px solid #00E5D4;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            .footer {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #888;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin: 0;">🔔 New Contact Form Submission</h2>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">From:</div>
              <div class="value"><strong>${payload.name}</strong></div>
            </div>
            
            <div class="field">
              <div class="label">Email:</div>
              <div class="value">
                <a href="mailto:${payload.email}" style="color: #00C8FF; text-decoration: none;">
                  ${payload.email}
                </a>
              </div>
            </div>
            
            <div class="field">
              <div class="label">Subject:</div>
              <div class="value">${payload.subject}</div>
            </div>
            
            <div class="field">
              <div class="label">Message:</div>
              <div class="message-box">${payload.message}</div>
            </div>
            
            <div class="field">
              <div class="label">Received:</div>
              <div class="value">${new Date(payload.created_at).toLocaleString('en-US', {
                dateStyle: 'full',
                timeStyle: 'long'
              })}</div>
            </div>
            
            <div class="footer">
              This notification was sent from your portfolio contact form at ahmedwesam.com
            </div>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Ahmed Wesam Portfolio <noreply@ahmedwesam.com>',
      to: ['contact@ahmedwesam.com'],
      replyTo: payload.email,
      subject: `New Contact: ${payload.subject} - from ${payload.name}`,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in send-contact-notification:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send notification',
        details: error 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
