import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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
        success: false,
        error: "Method not allowed",
      },
      405,
    );
  }

  try {
    const { reference } = await req.json() as {
      reference?: string;
    };

    if (!reference?.trim()) {
      return json(
        {
          success: false,
          error: "Payment reference is required",
        },
        400,
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const secret = Deno.env.get("PAYSTACK_SECRET_KEY");

    if (!supabaseUrl || !serviceRoleKey || !secret) {
      return json(
        {
          success: false,
          error: "Payment service is not configured",
        },
        500,
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("reference", reference.trim())
      .maybeSingle();

    if (!order) {
      return json(
        {
          success: false,
          error: "Order not found",
        },
        404,
      );
    }

    if (order.payment_status === "paid") {
      return json({
        success: true,
        order_id: order.id,
        reference: order.reference,
      });
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference.trim())}`,
      {
        headers: {
          Authorization: `Bearer ${secret}`,
        },
      },
    );

    const result = await response.json();
    const transaction = result?.data;

    if (!response.ok || !transaction) {
      return json(
        {
          success: false,
          error: "Payment verification failed",
        },
        502,
      );
    }

    if (transaction.status !== "success") {
      const status = transaction.status === "abandoned"
        ? "cancelled"
        : "failed";

      await supabase
        .from("orders")
        .update({
          payment_status: status,
          payment_failure_reason:
            transaction.gateway_response || transaction.status,
        })
        .eq("id", order.id)
        .neq("payment_status", "paid");

      return json(
        {
          success: false,
          error: "Payment was not completed",
          payment_status: status,
        },
        402,
      );
    }

    if (
      transaction.currency !== "ZAR" ||
      transaction.amount !== Math.round(Number(order.total) * 100)
    ) {
      return json(
        {
          success: false,
          error: "Payment amount mismatch",
        },
        400,
      );
    }

    const { data: updated } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        paystack_reference: transaction.reference,
        paystack_access_code:
          transaction.access_code || order.paystack_access_code,
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

    return json({
      success: true,
      order_id: order.id,
      reference: order.reference,
    });
  } catch (error) {
    console.error("verify-payment error", error);

    return json(
      {
        success: false,
        error: "Could not verify payment",
      },
      500,
    );
  }
});

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

