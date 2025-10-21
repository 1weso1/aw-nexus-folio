import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  slug: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
}

interface PaymobAuthResponse {
  token: string;
}

interface PaymobOrderResponse {
  id: number;
}

interface PaymobPaymentKeyResponse {
  token: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { slug, customer }: PaymentRequest = await req.json();

    console.log('Processing payment for slug:', slug);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate payment link
    const { data: paymentLink, error: linkError } = await supabaseClient
      .from('payment_links')
      .select('*')
      .eq('link_slug', slug)
      .single();

    if (linkError || !paymentLink) {
      console.error('Payment link not found:', linkError);
      return new Response(
        JSON.stringify({ error: 'Payment link not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if link is active
    if (paymentLink.status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Payment link is not active' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check expiration
    if (paymentLink.expires_at && new Date(paymentLink.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Payment link has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check max uses
    if (paymentLink.max_uses && paymentLink.current_uses >= paymentLink.max_uses) {
      return new Response(
        JSON.stringify({ error: 'Payment link has reached maximum uses' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get exchange rate for currency conversion
    const { data: exchangeRate } = await supabaseClient
      .from('exchange_rates')
      .select('rate')
      .eq('from_currency', paymentLink.currency)
      .eq('to_currency', 'EGP')
      .single();

    const rate = exchangeRate?.rate || 1;
    const amountInEGP = paymentLink.amount * rate;
    const amountCents = Math.round(amountInEGP * 100); // Convert to cents

    console.log(`Amount: ${paymentLink.amount} ${paymentLink.currency} = ${amountInEGP} EGP (${amountCents} cents)`);

    // Step 1: Authenticate with Paymob
    const authResponse = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: Deno.env.get('PAYMOB_API_KEY'),
      }),
    });

    if (!authResponse.ok) {
      console.error('Paymob auth failed:', await authResponse.text());
      throw new Error('Failed to authenticate with Paymob');
    }

    const authData: PaymobAuthResponse = await authResponse.json();
    console.log('Paymob authentication successful');

    // Step 2: Create order
    const orderResponse = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authData.token,
        delivery_needed: 'false',
        amount_cents: amountCents.toString(),
        currency: 'EGP',
        items: [],
      }),
    });

    if (!orderResponse.ok) {
      console.error('Paymob order creation failed:', await orderResponse.text());
      throw new Error('Failed to create Paymob order');
    }

    const orderData: PaymobOrderResponse = await orderResponse.json();
    console.log('Paymob order created:', orderData.id);

    // Step 3: Generate payment key
    const [firstName, ...lastNameParts] = customer.name.split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    const paymentKeyResponse = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authData.token,
        amount_cents: amountCents.toString(),
        expiration: 3600,
        order_id: orderData.id.toString(),
        billing_data: {
          email: customer.email,
          first_name: firstName,
          last_name: lastName,
          phone_number: customer.phone,
          apartment: 'NA',
          floor: 'NA',
          street: 'NA',
          building: 'NA',
          shipping_method: 'NA',
          postal_code: 'NA',
          city: 'NA',
          country: 'EG',
          state: 'NA',
        },
        currency: 'EGP',
        integration_id: parseInt(Deno.env.get('PAYMOB_INTEGRATION_ID') || '0'),
      }),
    });

    if (!paymentKeyResponse.ok) {
      const errorText = await paymentKeyResponse.text();
      console.error('Paymob payment key generation failed:', errorText);
      return new Response(
        JSON.stringify({ 
          error: `Paymob payment key failed: ${errorText}. Please verify PAYMOB_INTEGRATION_ID is correct.` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const paymentKeyData: PaymobPaymentKeyResponse = await paymentKeyResponse.json();
    console.log('Payment key generated successfully');

    // Step 4: Create transaction record
    const { data: transaction, error: txError } = await supabaseClient
      .from('payment_transactions')
      .insert({
        payment_link_id: paymentLink.id,
        paymob_order_id: orderData.id.toString(),
        amount: paymentLink.amount,
        currency: paymentLink.currency,
        amount_in_egp: amountInEGP,
        status: 'pending',
        customer_email: customer.email,
        customer_phone: customer.phone,
        customer_name: customer.name,
      })
      .select()
      .single();

    if (txError) {
      console.error('Failed to create transaction record:', txError);
      throw new Error('Failed to create transaction record');
    }

    console.log('Transaction record created:', transaction.id);

    // Use Paymob's redirect URL instead of iframe (modern approach)
    const paymentUrl = `https://accept.paymob.com/api/acceptance/payment_key?token=${paymentKeyData.token}`;

    return new Response(
      JSON.stringify({
        payment_url: paymentUrl,
        transaction_id: transaction.id,
        order_id: orderData.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-paymob-payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
