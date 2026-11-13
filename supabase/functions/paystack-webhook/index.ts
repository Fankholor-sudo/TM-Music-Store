import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

interface OrderEmailData {
  first_name: string;
  reference: string;
  total: number | string;
  email: string;
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

    if (
      !secret ||
      !signature ||
      !(await validSignature(body, signature, secret))
    ) {
      return json(
        {
          received: false,
        },
        401,
      );
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

    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("reference", reference)
      .maybeSingle();

    if (!order) {
      return json({
        received: true,
      });
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
      const status = event.data?.status === "abandoned"
        ? "cancelled"
        : "failed";

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

    return json(
      {
        received: false,
      },
      500,
    );
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
    return;
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  const escape = (value: unknown) => {
    return String(value ?? "").replace(/[&<>"']/g, (char) => {
      return (
        {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;",
          "'": "&#39;",
        }[char] ?? char
      );
    });
  };

  const rows = (items ?? [])
    .map((item) => {
      return `
        <tr>
          <td>${escape(item.product_name)}</td>
          <td>${item.quantity}</td>
          <td>R${Number(item.line_total).toFixed(2)}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif">
      <h1>MusoHive order confirmation</h1>

      <p>Hi ${escape(order.first_name)}, your payment was received.</p>

      <p>
        Reference:
        <strong>${escape(order.reference)}</strong>
      </p>

      <table>
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Total</th>
        </tr>
        ${rows}
      </table>

      <p>
        <strong>
          Total: R${Number(order.total).toFixed(2)}
        </strong>
      </p>
    </div>
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
