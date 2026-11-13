import { type SupabaseClient } from "npm:@supabase/supabase-js@2";

export interface OrderEmailData {
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

interface OrderItem {
  product_name?: string;
  product_image?: string | null;
  quantity: number;
  line_total: number | string;
}

export async function sendConfirmationEmail(
  supabase: SupabaseClient,
  orderId: string,
  order: OrderEmailData,
): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY");

  if (!apiKey) {
    console.error("Email not sent: RESEND_API_KEY is missing", {
      orderId,
    });
    return;
  }

  // Retrieve order items.
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (itemsError) {
    console.error("Could not retrieve order items:", {
      orderId,
      error: itemsError.message,
    });
    return;
  }

  if (!items || items.length === 0) {
    console.error("Email not sent: No order items found", {
      orderId,
    });
    return;
  }

  // Escape values before inserting them into HTML.
  const escapeHtml = (value: unknown): string =>
    String(value ?? "").replace(/[&<>"']/g, (character) => {
      const entities: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };

      return entities[character];
    });

  // Format amounts in South African Rand.
  const money = (amount: number | string | undefined): string => {
    const value = Number(amount ?? 0);

    return `R${(Number.isFinite(value) ? value : 0).toFixed(2)}`;
  };

  // Build the product rows.
  const itemRows = (items as OrderItem[])
    .map((item) => {
      const image = item.product_image
        ? `
          <img
            src="${escapeHtml(item.product_image)}"
            alt="${escapeHtml(item.product_name || "Product")}"
            width="65"
            style="display:block;width:65px;height:65px;object-fit:contain;border-radius:6px;background:#ffffff;"
          />
        `
        : "";

      return `
        <tr>
          <td style="padding:14px 8px;border-bottom:1px solid #e5e7eb;width:75px;">
            ${image}
          </td>

          <td style="padding:14px 8px;border-bottom:1px solid #e5e7eb;color:#333333;">
            <strong>${escapeHtml(item.product_name || "Product")}</strong>
          </td>

          <td style="padding:14px 8px;border-bottom:1px solid #e5e7eb;text-align:center;color:#555555;">
            ${escapeHtml(item.quantity)}
          </td>

          <td style="padding:14px 8px;border-bottom:1px solid #e5e7eb;text-align:right;color:#333333;font-weight:600;">
            ${money(item.line_total)}
          </td>
        </tr>
      `;
    })
    .join("");

  // Prepare delivery information.
  const isPepStore = order.shipping_method?.toLowerCase().includes("pep") ?? false;

  const deliveryDetails = isPepStore
    ? `
      <tr>
        <td width="45%" style="padding:12px 8px 12px 0;color:#d1e5df;font-size:17px;line-height:1.6;">
          <strong>Delivery method</strong>
        </td>

        <td width="55%" align="left" style="padding:12px 0 12px 15px;color:#ffffff;font-size:17px;line-height:1.6;text-align:left;">
          PEP Store collection
        </td>
      </tr>

      <tr>
        <td width="45%" style="padding:12px 8px 12px 0;color:#d1e5df;font-size:17px;line-height:1.6;">
          <strong>Collection location</strong>
        </td>

        <td width="55%" align="left" style="padding:12px 0 12px 15px;color:#ffffff;font-size:17px;line-height:1.6;text-align:left;word-break:break-word;">
          ${escapeHtml(order.pep_store_location || "Not provided")}
        </td>
      </tr>
    `
    : `
      <tr>
        <td width="45%" style="padding:12px 8px 12px 0;color:#d1e5df;font-size:17px;line-height:1.6;">
          <strong>Delivery method</strong>
        </td>

        <td width="55%" align="left" style="padding:12px 0 12px 15px;color:#ffffff;font-size:17px;line-height:1.6;text-align:left;">
          Home delivery
        </td>
      </tr>

      <tr>
        <td width="45%" style="padding:12px 8px 12px 0;color:#d1e5df;font-size:17px;line-height:1.6;">
          <strong>Delivery address</strong>
        </td>

        <td width="55%" align="left" style="padding:12px 0 12px 15px;color:#ffffff;font-size:17px;line-height:1.6;text-align:left;word-break:break-word;">
            <span style="color:#ffffff !important;text-decoration:none !important;">
              ${escapeHtml(order.delivery_address || "Not provided")}
            </span>
        </td>
      </tr>

      <tr>
        <td width="45%" style="padding:12px 8px 12px 0;color:#d1e5df;font-size:17px;line-height:1.6;">
          <strong>City</strong>
        </td>

        <td width="55%" align="left" style="padding:12px 0 12px 15px;color:#ffffff;font-size:17px;line-height:1.6;text-align:left;">
          ${escapeHtml(order.delivery_city || "Not provided")}
        </td>
      </tr>

      <tr>
        <td width="45%" style="padding:12px 8px 12px 0;color:#d1e5df;font-size:17px;line-height:1.6;">
          <strong>Postal code</strong>
        </td>

        <td width="55%" align="left" style="padding:12px 0 12px 15px;color:#ffffff;font-size:17px;line-height:1.6;text-align:left;">
          ${escapeHtml(order.delivery_postal_code || "Not provided")}
        </td>
      </tr>
    `;

  const customerName = [
    order.first_name,
    order.last_name,
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join(" ");

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          a[x-apple-data-detectors],
          #MessageViewBody a {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
          }
        </style>
        <title>MusoHive Order Confirmation</title>
      </head>

      <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;line-height: 1.6;">
        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="background-color:#f3f4f6;padding:30px 12px;"
        >
          <tr>
            <td align="center">

              <table
                role="presentation"
                width="600"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="width:100%;max-width:600px;background-color:#ffffff;border-radius:10px;overflow:hidden;"
              >

                <!-- Header -->
                <tr>
                  <td align="center" style="padding:28px 20px;background-color:#ffffff;">
                    <img
                      src="https://www.musohive.co.za/images/logo/logo-icon.png"
                      alt="MusoHive"
                      width="65"
                      style="display:block;width:65px;height:auto;margin:0 auto 10px;"
                    />

                    <h1 style="margin:0;color:#24594f;font-size:25px;">
                      MusoHive
                    </h1>

                    <p style="margin:6px 0 0;color:#777777;font-size:13px;">
                      Music &amp; Audio Accessories
                    </p>
                  </td>
                </tr>

                <!-- Main content -->
                <tr>
                  <td style="padding:30px 25px;background-color:#24594f;">

                    <h2 style="margin:0 0 15px;color:#ffffff;font-size:23px;">
                      Order Confirmation
                    </h2>

                    <p style="margin:0 0 12px;color:#ffffff;font-size:15px;line-height:1.6;">
                      Hi ${customerName || "there"},
                    </p>

                    <p style="margin:0 0 22px;color:#ffffff;font-size:15px;line-height:1.7;">
                      Thank you for shopping with MusoHive! Your payment has
                      been successfully received, and your order is being
                      processed.
                    </p>

                    <!-- Order reference -->
                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="background-color:#1c483f;border-radius:7px;margin-bottom:25px;"
                    >
                      <tr>
                        <td style="padding:16px;">
                          <p style="margin:0 0 5px;color:#d1e5df;font-size:12px;">
                            ORDER REFERENCE
                          </p>

                          <p style="margin:0;color:#ffffff;font-size:18px;font-weight:bold;">
                            ${escapeHtml(order.reference)}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Products -->
                    <h3 style="margin:0 0 12px;color:#ffffff;font-size:17px;">
                      Your Order
                    </h3>

                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="background-color:#ffffff;border-radius:7px;border-collapse:collapse;overflow:hidden;"
                    >
                      <thead>
                        <tr style="background-color:#f3f4f6;">
                          <th style="padding:12px 8px;text-align:left;font-size:12px;color:#555555;">
                            Image
                          </th>

                          <th style="padding:12px 8px;text-align:left;font-size:12px;color:#555555;">
                            Product
                          </th>

                          <th style="padding:12px 8px;text-align:center;font-size:12px;color:#555555;">
                            Qty
                          </th>

                          <th style="padding:12px 8px;text-align:right;font-size:12px;color:#555555;">
                            Total
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        ${itemRows}
                      </tbody>
                    </table>

                    <!-- Order totals -->
                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="margin-top:20px;"
                    >
                      <tr>
                        <td style="padding:7px 0;color:#d1e5df;font-size:14px;">
                          Subtotal
                        </td>

                        <td align="right" style="padding:7px 0;color:#ffffff;font-size:14px;">
                          ${money(order.subtotal)}
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:7px 0;color:#d1e5df;font-size:14px;">
                          Shipping
                        </td>
                        <td align="right" style="padding:7px 0;color:#ffffff;font-size:14px;">
                          ${money(order.shipping_cost)}
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:15px 0 5px;border-top:1px solid #6d938b;color:#ffffff;font-size:17px;font-weight:bold;">
                          Total Paid
                        </td>
                        <td align="right" style="padding:15px 0 5px;border-top:1px solid #6d938b;color:#ffffff;font-size:19px;font-weight:bold;">
                          ${money(order.total)}
                        </td>
                      </tr>
                    </table>

                    <!-- Payment details -->
                    <h3 style="margin:35px 0 18px;color:#ffffff;font-size:21px;">
                      Payment Details
                    </h3>

                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="background-color:#1c483f;border-radius:7px;"
                    >
                      <tr>
                        <td style="padding:25px 22px;">
                          <table
                            role="presentation"
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                          >
                            <tr>
                              <td
                                width="45%"
                                style="padding:12px 8px 12px 0;color:#d1e5df;font-size:17px;line-height:1.6;"
                              >
                                <strong>Payment method</strong>
                              </td>
                              <td
                                width="55%"
                                align="left"
                                style="padding:12px 0 12px 15px;color:#ffffff;font-size:17px;line-height:1.6;text-align:left;"
                              >
                                Paystack
                              </td>
                            </tr>

                            <tr>
                              <td
                                width="45%"
                                style="padding:12px 8px 12px 0;color:#d1e5df;font-size:17px;line-height:1.6;"
                              >
                                <strong>Payment status</strong>
                              </td>

                              <td
                                width="55%"
                                align="left"
                                style="padding:12px 0 12px 15px;color:#ffffff;font-size:17px;line-height:1.6;text-align:left;"
                              >
                                Paid
                              </td>
                            </tr>

                            <tr>
                              <td
                                width="45%"
                                style="padding:12px 8px 12px 0;color:#d1e5df;font-size:17px;line-height:1.6;"
                              >
                                <strong>Payment reference</strong>
                              </td>
                              <td
                                width="55%"
                                align="left"
                                style="padding:12px 0 12px 15px;color:#ffffff;font-size:17px;line-height:1.6;text-align:left;word-break:break-word;"
                              >
                                ${escapeHtml(order.paystack_reference || order.reference)}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Delivery details -->
                    <h3 style="margin:35px 0 18px;color:#ffffff;font-size:21px;">
                      Delivery Information
                    </h3>

                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="background-color:#1c483f;border-radius:7px;"
                    >
                      <tr>
                        <td style="padding:25px 22px;">
                          <table
                            role="presentation"
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                          > 
                            ${deliveryDetails}
                            <tr>
                              <td width="45%" style="padding:12px 8px 12px 0;color:#d1e5df;font-size:17px;line-height:1.6;">
                                <strong>Contact number</strong>
                              </td>

                              <td width="55%" align="left" style="padding:12px 0 12px 15px;color:#ffffff;font-size:17px;line-height:1.6;text-align:left;">
                                ${escapeHtml(order.phone || "Not provided")}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:25px 0 0;color:#ffffff;font-size:14px;line-height:1.7;">
                      We appreciate your support. Thank you for choosing
                      MusoHive!
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="padding:25px 20px;background-color:#ffffff;">
                    <img
                      src="https://www.musohive.co.za/images/logo/logo-gray.png"
                      alt="MusoHive"
                      width="125"
                      style="display:block;width:125px;height:auto;margin:0 auto 15px;"
                    />

                    <p style="margin:0 0 8px;color:#777777;font-size:12px;line-height:1.6;">
                      Quality music accessories at great prices.
                    </p>

                    <p style="margin:0 0 12px;color:#777777;font-size:12px;">
                      Need help with your order?
                    </p>

                    <p style="margin:0;">
                      <a
                        href="https://www.musohive.co.za/contact"
                        style="color:#24594f;font-size:13px;text-decoration:none;font-weight:bold;"
                      >
                        Contact MusoHive
                      </a>
                    </p>

                    <p style="margin:18px 0 0;color:#999999;font-size:11px;">
                      &copy; ${new Date().getFullYear()} MusoHive. All rights reserved.
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

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "MusoHive <orders@musohive.co.za>",
      to: [order.email],
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

  // Mark the confirmation email as sent.
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      confirmation_email_sent_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .is("confirmation_email_sent_at", null);

  if (updateError) {
    console.error("Could not update confirmation email timestamp:", {
      orderId,
      error: updateError.message,
    });
  }
}
