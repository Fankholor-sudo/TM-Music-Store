import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-retry-count, traceparent, tracestate, baggage",
};

interface ItemInput {
  product_id: string;
  quantity: number;
}

interface CreateOrderPayload {
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
  items: ItemInput[];
}

interface ProductRow {
  id: string;
  name: string;
  image_url: string;
  price: number;
  availability: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return json(
      { success: false, error: "Method not allowed" },
      405,
    );
  }

  try {
    const payload = await req.json() as CreateOrderPayload;

    if (
      !payload.first_name?.trim() ||
      !payload.last_name?.trim() ||
      !payload.phone?.trim()
    ) {
      return json(
        { success: false, error: "Customer details are incomplete" },
        400,
      );
    }

    if (!/^\S+@\S+\.\S+$/.test(payload.email ?? "")) {
      return json(
        { success: false, error: "A valid email address is required" },
        400,
      );
    }

    if (
      !Array.isArray(payload.items) ||
      payload.items.length === 0 ||
      payload.items.length > 99
    ) {
      return json(
        { success: false, error: "The order must contain at least one item" },
        400,
      );
    }

    if (!["pep_store", "door_delivery"].includes(payload.shipping_method)) {
      return json(
        { success: false, error: "Invalid shipping method" },
        400,
      );
    }

    if (
      payload.shipping_method === "pep_store" &&
      !payload.pep_store_location?.trim()
    ) {
      return json(
        { success: false, error: "A collection store is required" },
        400,
      );
    }

    if (
      payload.shipping_method === "door_delivery" &&
      (
        !payload.delivery_address?.trim() ||
        !payload.delivery_city?.trim() ||
        !payload.delivery_postal_code?.trim()
      )
    ) {
      return json(
        { success: false, error: "The delivery address is incomplete" },
        400,
      );
    }

    const quantities = new Map<string, number>();

    for (const item of payload.items) {
      if (
        !item.product_id ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 99
      ) {
        return json(
          { success: false, error: "Invalid product quantity" },
          400,
        );
      }

      quantities.set(
        item.product_id,
        (quantities.get(item.product_id) ?? 0) + item.quantity,
      );
    }

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    if (!supabaseUrl || !serviceRoleKey || !paystackSecretKey) {
      return json(
        { success: false, error: "Payment service is not configured" },
        500,
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const ids = [...quantities.keys()];

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, image_url, price, availability")
      .in("id", ids);

    if (productsError || !products || products.length !== ids.length) {
      return json(
        { success: false, error: "One or more products are unavailable" },
        400,
      );
    }

    const productById = new Map(
      (products as ProductRow[]).map((product) => [product.id, product]),
    );

    const orderItems = ids.map((id) => {
      const product = productById.get(id)!;
      const quantity = quantities.get(id)!;

      if (product.availability === "Out of Stock") {
        throw new Error("OUT_OF_STOCK");
      }

      return {
        product_id: product.id,
        product_name: product.name,
        product_image: product.image_url,
        unit_price: Number(product.price),
        quantity,
        line_total: Number(product.price) * quantity,
      };
    });

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.line_total,
      0,
    );

    const shippingCost = payload.shipping_method === "door_delivery" ? 80 : 0;

    const total = subtotal + shippingCost;

    const reference = `MH-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        reference,
        first_name: payload.first_name.trim(),
        last_name: payload.last_name.trim(),
        email: payload.email.trim().toLowerCase(),
        phone: payload.phone.trim(),
        shipping_method: payload.shipping_method,
        pep_store_location:
          payload.shipping_method === "pep_store"
            ? payload.pep_store_location?.trim()
            : null,
        delivery_address:
          payload.shipping_method === "door_delivery"
            ? payload.delivery_address?.trim()
            : null,
        delivery_city:
          payload.shipping_method === "door_delivery"
            ? payload.delivery_city?.trim()
            : null,
        delivery_postal_code:
          payload.shipping_method === "door_delivery"
            ? payload.delivery_postal_code?.trim()
            : null,
        delivery_latitude: payload.delivery_latitude,
        delivery_longitude: payload.delivery_longitude,
        subtotal,
        shipping_cost: shippingCost,
        total,
        payment_status: "pending",
        order_status: "pending",
        items_json: orderItems,
      })
      .select("id, reference, total")
      .maybeSingle();

    if (orderError || !order) {
      console.error("CREATE ORDER DATABASE INSERT FAILED:", orderError);
      return json(
        { success: false, error: "Could not create the order" },
        500,
      );
    }

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(
        orderItems.map((item) => ({
          ...item,
          order_id: order.id,
        })),
      );

    if (itemsError) {
      console.error("CREATE ORDER ITEMS INSERT FAILED:", itemsError);
      return json(
        { success: false, error: "Could not create the order" },
        500,
      );
    }

    console.log("Starting Paystack initialization:", {
      reference,
      amount: Math.round(total * 100),
      currency: "ZAR",
    });

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: payload.email.trim().toLowerCase(),
          amount: Math.round(total * 100),
          currency: "ZAR",
          reference,
          first_name: payload.first_name.trim(),
          last_name: payload.last_name.trim(),
          phone: payload.phone.trim(),
          metadata: {
            order_id: order.id,
          },
        }),
      },
    );

    const paystackResponseText = await paystackResponse.text();
    let payment: any;
    try {
      payment = JSON.parse(paystackResponseText);
    } catch {
      throw new Error("PAYSTACK_INVALID_RESPONSE");
    }

    if (
      !paystackResponse.ok ||
      !payment?.status ||
      !payment?.data?.access_code
    ) {
      await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          payment_failure_reason: "Payment initialization failed",
        })
        .eq("id", order.id);

      return json(
        { success: false, error: "Could not start payment" },
        502,
      );
    }

    await supabase
      .from("orders")
      .update({
        paystack_reference: payment.data.reference,
        paystack_access_code: payment.data.access_code,
        payment_initialized_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    return json({
      success: true,
      order_id: order.id,
      reference: payment.data.reference,
      access_code: payment.data.access_code,
      authorization_url: payment.data.authorization_url,
      total,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "OUT_OF_STOCK") {
      return json(
        { success: false, error: "One or more products are out of stock" },
        400,
      );
    }

    console.error("create-order error", error);

    return json(
      { success: false, error: "Could not start checkout" },
      500,
    );
  }
});
