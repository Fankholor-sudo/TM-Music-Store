
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
    'Content-Type': 'application/json',
  };
}

function jsonResponse(
  body: unknown,
  status: number,
  headers: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), { status, headers });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (origin && !allowedOrigins.includes(origin)) {
    return jsonResponse(
      { success: false, error: 'Origin not allowed.' },
      403,
      corsHeaders,
    );
  }

  if (req.method !== 'POST') {
    return jsonResponse(
      { success: false, error: 'Method not allowed.' },
      405,
      corsHeaders,
    );
  }

  try {
    const apiKey = Deno.env.get('GEOAPIFY_API_KEY');

    if (!apiKey) {
      console.error('GEOAPIFY_API_KEY is missing.');

      return jsonResponse(
        { success: false, error: 'Geocoding service unavailable.' },
        500,
        corsHeaders,
      );
    }

    const body = await req.json();
    const action = body.action;

    const params = new URLSearchParams({
      format: 'json',
      apiKey,
    });

    if (action === 'autocomplete') {
      const query = String(body.query ?? '').trim();

      if (query.length < 3 || query.length > 200) {
        return jsonResponse(
          { success: false, error: 'Invalid search query.' },
          400,
          corsHeaders,
        );
      }

      const limit = Math.min(
        10,
        Math.max(1, Number(body.limit) || 5),
      );

      params.set('text', query);
      params.set('limit', String(limit));

      const url =
        `https://api.geoapify.com/v1/geocode/autocomplete?${params}`;

      const response = await fetch(url);

      if (!response.ok) {
        console.error('Geoapify autocomplete failed:', response.status);

        return jsonResponse(
          { success: false, error: 'Address search failed.' },
          502,
          corsHeaders,
        );
      }

      const data = await response.json();

      return jsonResponse(
        { success: true, results: data.results ?? [] },
        200,
        corsHeaders,
      );
    }

    if (action === 'reverse') {
      const lat = Number(body.lat);
      const lon = Number(body.lon);

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lon) ||
        lat < -90 || lat > 90 ||
        lon < -180 || lon > 180
      ) {
        return jsonResponse(
          { success: false, error: 'Invalid coordinates.' },
          400,
          corsHeaders,
        );
      }

      params.set('lat', String(lat));
      params.set('lon', String(lon));

      const url =
        `https://api.geoapify.com/v1/geocode/reverse?${params}`;

      const response = await fetch(url);

      if (!response.ok) {
        console.error('Geoapify reverse geocoding failed:', response.status);

        return jsonResponse(
          { success: false, error: 'Reverse geocoding failed.' },
          502,
          corsHeaders,
        );
      }

      const data = await response.json();

      return jsonResponse(
        {
          success: true,
          result: data.results?.[0] ?? null,
        },
        200,
        corsHeaders,
      );
    }

    return jsonResponse(
      { success: false, error: 'Invalid action.' },
      400,
      corsHeaders,
    );

  } catch (error) {
    console.error('Geoapify function error:', error);

    return jsonResponse(
      { success: false, error: 'Internal server error.' },
      500,
      corsHeaders,
    );
  }
});
