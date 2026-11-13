import { createClient } from "npm:@supabase/supabase-js@2";
import { sendConfirmationEmail } from "../_shared/order-email.ts";

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
    const { reference } = (await req.json()) as {
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
      const status = transaction.status === "abandoned" ? "cancelled" : "failed";

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
