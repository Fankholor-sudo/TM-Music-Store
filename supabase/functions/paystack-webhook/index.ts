import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

interface OrderEmailData {
  first_name: string;
  last_name?: string;
  reference: string;
  total: number | string;
  subtotal?: number | string;
  shipping_cost?: number | string;
  email: string;
  phone?: string;
  paystack_reference?: string;
  shipping_method?: string;
  pep_store_location?: string | null;
  delivery_address?: string | null;
  delivery_city?: string | null;
  delivery_postal_code?: string | null;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-retry-count, traceparent, tracestate, baggage",
};

const json = (body: unknown, status = 200) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return json(
      {
        received: false,
      },
      405,
    );
  }

  try {
    const body = await req.text();

    const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
    const signature = req.headers.get("x-paystack-signature");

    if (!secret) {
      return json({ received: false }, 500);
    }
    if (!signature) {
      return json({ received: false }, 401);
    }

    const signatureIsValid = await validSignature(
      body,
      signature,
      secret,
    );

    if (!signatureIsValid) {
      return json({ received: false }, 401);
    }

    const event = JSON.parse(body) as {
      event?: string;
      data?: {
        reference?: string;
        status?: string;
      };
    };

    const reference = event.data?.reference;

    if (!reference) {
      return json({
        received: true,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return json(
        {
          received: false,
        },
        500,
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("reference", reference)
      .maybeSingle();

    if (orderError) {
      console.error("Paystack webhook: Order lookup failed:", {
        reference,
        error: orderError.message,
      });
      return json({ received: false }, 500);
    }

    if (!order) {
      console.warn("Paystack webhook: No matching order found:", {
        reference,
      });
      return json({ received: true });
    }

    if (event.event === "charge.success") {
      const verifyResponse = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          headers: {
            Authorization: `Bearer ${secret}`,
          },
        },
      );

      const verified = await verifyResponse.json();
      const transaction = verified?.data;

      if (
        !verifyResponse.ok ||
        transaction?.status !== "success" ||
        transaction.currency !== "ZAR" ||
        transaction.amount !== Math.round(Number(order.total) * 100)
      ) {
        return json(
          {
            received: false,
          },
          400,
        );
      }

      const { data: updated } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          paystack_reference: transaction.reference,
          paid_at: new Date().toISOString(),
          payment_failure_reason: null,
        })
        .eq("id", order.id)
        .neq("payment_status", "paid")
        .select("id")
        .maybeSingle();

      if (updated) {
        await sendConfirmationEmail(supabase, order.id, {
          ...order,
          payment_status: "paid",
          paystack_reference: transaction.reference,
        });
      }
    } else if (
      event.event === "charge.failed" ||
      event.data?.status === "failed" ||
      event.data?.status === "abandoned"
    ) {
      const status = event.data?.status === "abandoned" ? "cancelled" : "failed";

      await supabase
        .from("orders")
        .update({
          payment_status: status,
          payment_failure_reason: event.data?.status,
        })
        .eq("id", order.id)
        .neq("payment_status", "paid");
    } else if (
      event.event === "refund.processed" ||
      event.event === "charge.reversed"
    ) {
      await supabase
        .from("orders")
        .update({
          payment_status: "refunded",
          refunded_at: new Date().toISOString(),
        })
        .eq("id", order.id);
    }

    return json({
      received: true,
    });
  } catch (error) {
    console.error("paystack-webhook error", error);
    return json({ received: false }, 500 );
  }
});

async function validSignature(
  body: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-512",
    },
    false,
    ["sign"],
  );

  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(body),
  );

  const expected = Array.from(
    new Uint8Array(digest),
    (byte) => byte.toString(16).padStart(2, "0"),
  ).join("");

  if (expected.length !== signature.length) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < expected.length; index += 1) {
    difference |=
      expected.charCodeAt(index) ^ signature.charCodeAt(index);
  }

  return difference === 0;
}

async function sendConfirmationEmail(
  supabase: SupabaseClient,
  orderId: string,
  order: OrderEmailData,
): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("Email not sent: RESEND_API_KEY is missing", { orderId });
    return;
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  const escape = (value: unknown) =>
    String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char] ?? char));

  const money = (value: unknown) => `R${Number(value ?? 0).toFixed(2)}`;

  const rows = (items ?? [])
    .map(
      (item) => `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #ffffff;vertical-align:top;width:92px;">
            <img
              src="${escape(item.product_image)}"
              alt="${escape(item.product_name)}"
              width="80"
              height="80"
              style="display:block;width:80px;height:80px;object-fit:contain;border-radius:16px;background:#ffffff;"
            />
          </td>

          <td style="padding:16px 12px;border-bottom:1px solid #ffffff;vertical-align:top;">
            <div style="font-size:18px;font-weight:700;color:#ffffff;line-height:1.35;">
              ${escape(item.product_name)}
            </div>

            <div style="font-size:14px;color:#d8e5e1;margin-top:6px;">
              Quantity: ${Number(item.quantity)}
            </div>
          </td>

          <td style="padding:16px 0;border-bottom:1px solid #ffffff;text-align:right;vertical-align:top;white-space:nowrap;font-size:18px;font-weight:700;color:#ffffff;">
            ${money(item.line_total)}
          </td>
        </tr>
      `,
    )
    .join("");

  const delivery =
    order.shipping_method === "pep_store"
      ? `
        <div style="font-size:19px;font-weight:700;color:#ffffff;">
          Pep-Store collection
        </div>

        <div style="font-size:16px;color:#d8e5e1;margin-top:10px;">
          ${escape(order.pep_store_location)}
        </div>
      `
      : `
        <div style="font-size:19px;font-weight:700;color:#ffffff;">
          Home delivery
        </div>

        <div style="font-size:16px;color:#d8e5e1;line-height:1.6;margin-top:10px;">
          ${escape(order.delivery_address)},
          ${escape(order.delivery_city)},
          ${escape(order.delivery_postal_code)}
        </div>
      `;

  const html = `
    <!doctype html>
    <html>
      <body
        style="margin:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#ffffff;"
      >
        <div
          style="max-width:680px;margin:0 auto;background:#24594f;border:12px solid #ffffff;border-radius:20px;overflow:hidden;"
        >
          <!-- Header -->
          <div style="padding:32px 28px 28px;text-align:center;">
            <img
              src="https://www.musohive.co.za/images/logo/logo-icon.png"
              alt="MusoHive"
              width="76"
              height="76"
              style="display:inline-block;width:76px;height:76px;object-fit:contain;background:#ffffff;border-radius:18px;margin-bottom:18px;"
            />

            <h1 style="font-size:28px;line-height:1.2;margin:0;color:#ffffff;">
              Thank you for your order!
            </h1>

            <div
              style="display:inline-block;margin:16px 0 14px;padding:7px 14px;border-radius:20px;background:#087f4f;color:#42f58a;font-size:14px;font-weight:700;"
            >
              Payment confirmed
            </div>

            <p style="font-size:17px;line-height:1.5;color:#d8e5e1;margin:0;">
              Hi ${escape(order.first_name)} ${escape(order.last_name)},
              your order has been confirmed.
            </p>
          </div>

          <!-- Order Details -->
          <div style="padding:0 28px 28px;">
            <div style="border-top:1px solid #ffffff;padding-top:26px;">
              <h2 style="font-size:20px;margin:0 0 12px;color:#ffffff;">
                YOUR ORDER
              </h2>

              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                style="border-collapse:collapse;"
              >
                ${rows}
              </table>

              <!-- Order Totals -->
              <div
                style="padding-top:18px;border-bottom:1px solid #ffffff;padding-bottom:16px;"
              >
                <div
                  style="display:flex;justify-content:space-between;font-size:16px;color:#d8e5e1;margin-bottom:12px;"
                >
                  <span>Subtotal</span>
                  <strong style="color:#ffffff;">
                    ${money(order.subtotal)}
                  </strong>
                </div>

                <div
                  style="display:flex;justify-content:space-between;font-size:16px;color:#d8e5e1;"
                >
                  <span>Shipping</span>
                  <strong style="color:#ffffff;">
                    ${money(order.shipping_cost)}
                  </strong>
                </div>
              </div>

              <div
                style="display:flex;justify-content:space-between;padding:22px 0 4px;font-size:20px;font-weight:700;"
              >
                <span>Total paid</span>
                <span>${money(order.total)}</span>
              </div>
            </div>

            <!-- Payment Details -->
            <div
              style="border-top:1px solid #ffffff;margin-top:26px;padding-top:26px;"
            >
              <h2 style="font-size:20px;margin:0 0 18px;color:#ffffff;">
                Payment details
              </h2>

              <div
                style="display:flex;justify-content:space-between;padding:8px 0;font-size:16px;color:#d8e5e1;"
              >
                <span>Payment method</span>
                <strong style="color:#ffffff;">Paystack</strong>
              </div>

              <div
                style="display:flex;justify-content:space-between;padding:8px 0;font-size:16px;color:#d8e5e1;"
              >
                <span>Status</span>
                <strong style="color:#42f58a;">Paid</strong>
              </div>

              <div style="padding-top:8px;font-size:16px;color:#d8e5e1;">
                Payment reference
              </div>

              <div
                style="padding-top:8px;font-size:18px;font-weight:700;color:#ffffff;"
              >
                ${escape(order.paystack_reference || order.reference)}
              </div>
            </div>

            <!-- Delivery Information -->
            <div
              style="border-top:1px solid #ffffff;margin-top:26px;padding-top:26px;"
            >
              <h2 style="font-size:20px;margin:0 0 18px;color:#ffffff;">
                Delivery information
              </h2>

              ${delivery}

              <div style="font-size:16px;color:#d8e5e1;margin-top:12px;">
                Contact: ${escape(order.phone)}
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            style="border-top:1px solid #ffffff;padding:28px;text-align:center;"
          >
            <img
              src="https://www.musohive.co.za/images/logo/logo-light.png"
              alt="MusoHive"
              width="170"
              style="display:inline-block;width:170px;height:auto;max-height:52px;object-fit:contain;"
            />

            <p style="font-size:16px;color:#d8e5e1;margin:18px 0 8px;">
              Quality music accessories at great prices.
            </p>

            <p style="font-size:14px;color:#d8e5e1;margin:0 0 8px;">
              www.musohive.co.za
            </p>

            <p style="font-size:14px;color:#d8e5e1;margin:0;">
              © MusoHive. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "MusoHive <orders@musohive.co.za>",
      to: order.email,
      subject: `MusoHive Order Confirmation - ${order.reference}`,
      html,
    }),
  });

  const responseBody = await response.text();

  if (!response.ok) {
    console.error("Confirmation email failed:", {
      orderId,
      status: response.status,
      error: responseBody,
    });
    return;
  }

  if (response.ok) {
    await supabase
      .from("orders")
      .update({
        confirmation_email_sent_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .is("confirmation_email_sent_at", null);
  }
}