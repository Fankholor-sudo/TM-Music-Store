import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-retry-count, traceparent, tracestate, baggage",
};

interface OrderItemInput {
  product_id: string;
  product_name: string;
  product_image: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

interface CheckoutPayload {
  reference: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  shipping_method: "pep_store" | "door_delivery";
  pep_store_location: string | null;
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_postal_code: string | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  subtotal: number;
  shipping_cost: number;
  total: number;
  items: OrderItemInput[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const payload: CheckoutPayload = await req.json();

    const required = [
      "reference", "first_name", "last_name", "email", "phone",
      "shipping_method", "subtotal", "total", "items",
    ] as const;
    for (const field of required) {
      if (!payload[field]) {
        return new Response(
          JSON.stringify({ success: false, error: `Missing field: ${field}` }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    if (!payload.items || payload.items.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Order has no items" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Payment service not configured",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(payload.reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!verifyResponse.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Payment verification request failed",
        }),
        {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const verifyData = await verifyResponse.json();
    const transaction = verifyData?.data;

    if (!transaction || transaction.status !== "success") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Payment was not successful",
        }),
        {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const expectedAmountKobo = Math.round(payload.total * 100);
    if (transaction.amount !== expectedAmountKobo) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Payment amount mismatch",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Database not configured",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: orderRow, error: orderError } = await supabase
      .from("orders")
      .insert({
        reference: payload.reference,
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        phone: payload.phone,
        shipping_method: payload.shipping_method,
        pep_store_location: payload.pep_store_location,
        delivery_address: payload.delivery_address,
        delivery_city: payload.delivery_city,
        delivery_postal_code: payload.delivery_postal_code,
        delivery_latitude: payload.delivery_latitude,
        delivery_longitude: payload.delivery_longitude,
        subtotal: payload.subtotal,
        shipping_cost: payload.shipping_cost,
        total: payload.total,
        payment_status: "paid",
        paystack_reference: transaction.reference,
        paystack_access_code: transaction.access_code || null,
        items_json: payload.items,
      })
      .select()
      .single();

    if (orderError || !orderRow) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to save order to database",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const orderItems = payload.items.map((item) => ({
      order_id: orderRow.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      unit_price: item.unit_price,
      quantity: item.quantity,
      line_total: item.line_total,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Failed to save order items:", itemsError);
    }

    await sendOrderEmail(payload, orderRow.id);

    return new Response(
      JSON.stringify({ success: true, order_id: orderRow.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("verify-order error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

async function sendOrderEmail(
  payload: CheckoutPayload,
  orderId: string,
): Promise<void> {
  try {
    const itemsHtml = payload.items
      .map(
        (item) => `
        <tr>
          <td style="padding:12px; border-bottom:1px solid #eee; text-align:center;">
            <img src="${item.product_image}" alt="${item.product_name}" style="width:80px; height:80px; object-fit:contain; border-radius:6px;" />
          </td>
          <td style="padding:12px; border-bottom:1px solid #eee;">
            <strong>${item.product_name}</strong><br/>
            <span style="color:#666; font-size:13px;">Qty: ${item.quantity}</span>
          </td>
          <td style="padding:12px; border-bottom:1px solid #eee; text-align:right;">
            R${item.unit_price.toFixed(2)}
          </td>
          <td style="padding:12px; border-bottom:1px solid #eee; text-align:right;">
            <strong>R${item.line_total.toFixed(2)}</strong>
          </td>
        </tr>
      `,
      )
      .join("");

    const shippingInfo =
      payload.shipping_method === "pep_store"
        ? `<p><strong>Shipping Method:</strong> Collect at Pep-Store</p>
           <p><strong>Collection Location:</strong> ${payload.pep_store_location || "N/A"}</p>`
        : `<p><strong>Shipping Method:</strong> Door Delivery</p>
           <p><strong>Delivery Address:</strong> ${payload.delivery_address || ""}, ${payload.delivery_city || ""}, ${payload.delivery_postal_code || ""}</p>` +
          (payload.delivery_latitude != null && payload.delivery_longitude != null
            ? `<p><strong>Map Location:</strong> ${payload.delivery_latitude.toFixed(5)}, ${payload.delivery_longitude.toFixed(5)}</p>`
            : "");

    const html = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f7f8f8; padding: 24px;">
        <div style="background: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #e4e8eb;">
          <div style="background: #00796b; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">MusoHive</h1>
            <p style="color: #b2dfdb; margin: 4px 0 0; font-size: 14px;">Order Confirmation</p>
          </div>
          <div style="padding: 24px;">
            <h2 style="color: #1a1f24; margin: 0 0 8px; font-size: 20px;">Thank you for your order!</h2>
            <p style="color: #5f6b76; font-size: 14px; line-height: 1.6;">
              Hi ${payload.first_name},<br/>
              Your order has been confirmed and payment has been received successfully.
            </p>
            <div style="background: #f7f8f8; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0 0 4px; font-size: 14px;"><strong>Order Reference:</strong> ${payload.reference}</p>
              <p style="margin: 0 0 4px; font-size: 14px;"><strong>Customer:</strong> ${payload.first_name} ${payload.last_name}</p>
              <p style="margin: 0 0 4px; font-size: 14px;"><strong>Email:</strong> ${payload.email}</p>
              <p style="margin: 0 0 4px; font-size: 14px;"><strong>Phone:</strong> ${payload.phone}</p>
              ${shippingInfo}
            </div>
            <h3 style="color: #1a1f24; font-size: 16px; margin: 24px 0 12px;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="background: #f7f8f8;">
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e4e8eb;">Image</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e4e8eb;">Product</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e4e8eb;">Unit Price</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e4e8eb;">Total</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <div style="margin-top: 20px; border-top: 2px solid #e4e8eb; padding-top: 16px;">
              <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px;">
                <span>Subtotal</span><span>R${payload.subtotal.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px;">
                <span>Shipping</span><span>R${payload.shipping_cost.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #d32f2f;">
                <span>Total</span><span>R${payload.total.toFixed(2)}</span>
              </div>
            </div>
            <div style="margin-top: 24px; padding: 16px; background: #e6f4ea; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #137333; font-size: 14px; font-weight: 600;">Payment Status: Paid</p>
            </div>
          </div>
          <div style="background: #1a1f24; padding: 16px; text-align: center;">
            <p style="color: #9ba7b2; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} MusoHive. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `;

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.log(
        `[email] RESEND_API_KEY not set — skipping email to ${payload.email} for order ${orderId}`,
      );
      return;
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "MusoHive <orders@musohive.co.za>",
        to: payload.email,
        subject: `MusoHive Order Confirmation - ${payload.reference}`,
        html,
      }),
    });

    if (!emailResponse.ok) {
      const errText = await emailResponse.text();
      console.error(`[email] Resend API error (${emailResponse.status}): ${errText}`);
    } else {
      console.log(`[email] Order confirmation sent to ${payload.email}`);
    }
  } catch (err) {
    console.error("Failed to send order email:", err);
  }
}