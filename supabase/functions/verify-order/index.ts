import { createClient } from "npm:@supabase/supabase-js@2";

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

    return new Response(
      JSON.stringify({ success: true, order_id: orderRow.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } 
  catch (err) {
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