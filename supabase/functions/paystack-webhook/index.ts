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