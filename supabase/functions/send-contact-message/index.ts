const allowedOrigins = [
  'https://www.musohive.co.za',
  'https://musohive.co.za',
  'http://localhost:4200',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin =
    origin && allowedOrigins.includes(origin)
      ? origin
      : 'https://www.musohive.co.za';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return entities[character];
  });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  if (origin && !allowedOrigins.includes(origin)) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Origin not allowed.',
      }),
      {
        status: 403,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Method not allowed.',
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  try {
    const body = await req.json();

    const name = String(body.name ?? '').trim();
    const email = String(body.email ?? '').trim();
    const subject = String(body.subject ?? '').trim();
    const message = String(body.message ?? '').trim();
    const website = String(body.website ?? '').trim();

    // Honeypot: silently accept automated spam submissions.
    if (website) {
      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Validate submitted information.
    if (
      !name ||
      !email ||
      !subject ||
      !message ||
      name.length > 120 ||
      email.length > 254 ||
      subject.length > 160 ||
      message.length < 10 ||
      message.length > 5000
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Please check your information and try again.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(email) ||
      /[\r\n]/.test(email) ||
      /[\r\n]/.test(subject)
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Please provide a valid email address and subject.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const apiKey = Deno.env.get('RESEND_API_KEY');

    if (!apiKey) {
      console.error('RESEND_API_KEY is missing.');

      return new Response(
        JSON.stringify({
          success: false,
          message: 'Email service is temporarily unavailable.',
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>New MusoHive Contact Enquiry</title>
        </head>

        <body style="margin:0;padding:30px 12px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center">
                <table
                  role="presentation"
                  width="600"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="width:100%;max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;"
                >
                  <tr>
                    <td align="center" style="padding:25px;background:#ffffff;">
                      <img
                        src="https://www.musohive.co.za/images/logo/logo-icon.png"
                        alt="MusoHive"
                        width="60"
                        style="display:block;width:60px;height:auto;margin-bottom:10px;"
                      />

                      <h1 style="margin:0;color:#24594f;font-size:24px;">
                        MusoHive
                      </h1>

                      <p style="margin:6px 0 0;color:#777;font-size:13px;">
                        New Website Enquiry
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:30px;background:#24594f;color:#ffffff;">
                      <h2 style="margin:0 0 22px;font-size:21px;">
                        New Contact Form Message
                      </h2>

                      <table
                        role="presentation"
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="background:#1c483f;border-radius:8px;"
                      >
                        <tr>
                          <td style="padding:18px;">
                            <p style="margin:0 0 5px;color:#d1e5df;font-size:12px;">
                              CUSTOMER NAME
                            </p>
                            <p style="margin:0 0 18px;color:#ffffff;font-size:16px;">
                              <strong>${safeName}</strong>
                            </p>

                            <p style="margin:0 0 5px;color:#d1e5df;font-size:12px;">
                              EMAIL ADDRESS
                            </p>
                            <p style="margin:0 0 18px;color:#ffffff;font-size:16px;">
                              ${safeEmail}
                            </p>

                            <p style="margin:0 0 5px;color:#d1e5df;font-size:12px;">
                              SUBJECT
                            </p>
                            <p style="margin:0;color:#ffffff;font-size:16px;">
                              ${safeSubject}
                            </p>
                          </td>
                        </tr>
                      </table>

                      <h3 style="margin:28px 0 12px;color:#ffffff;font-size:17px;">
                        Message
                      </h3>

                      <div style="padding:18px;background:#ffffff;color:#333333;border-radius:8px;font-size:15px;line-height:1.8;overflow-wrap:anywhere;">
                        ${safeMessage}
                      </div>

                      <p style="margin:24px 0 0;color:#d1e5df;font-size:13px;">
                        Reply directly to this email to respond to the customer.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="padding:22px;background:#ffffff;">
                      <p style="margin:0;color:#777777;font-size:12px;">
                        MusoHive | Music &amp; Audio Accessories
                      </p>
                      <p style="margin:8px 0 0;color:#999999;font-size:11px;">
                        © ${new Date().getFullYear()} MusoHive. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const plainText = `
New MusoHive Contact Enquiry

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
    `.trim();

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MusoHive Website <orders@musohive.co.za>',
        to: ['info@musohive.co.za'],
        reply_to: email,
        subject: `Website Enquiry: ${subject}`,
        html,
        text: plainText,
      }),
    });

    const responseBody = await response.text();

    if (!response.ok) {
      console.error('Resend contact email failed:', {
        status: response.status,
        error: responseBody,
      });

      return new Response(
        JSON.stringify({
          success: false,
          message: 'We could not send your message. Please try again later.',
        }),
        {
          status: 502,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Your message has been sent successfully.',
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Contact function error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Something went wrong. Please try again later.',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
