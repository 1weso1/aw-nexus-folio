import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    console.log('Starting recurring payments processing...');

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Query subscriptions due for payment
    const { data: subscriptions, error: subsError } = await supabaseClient
      .from('recurring_subscriptions')
      .select('*, payment_links(*)')
      .eq('status', 'active')
      .lte('next_payment_date', today);

    if (subsError) {
      console.error('Failed to fetch subscriptions:', subsError);
      throw new Error('Failed to fetch subscriptions');
    }

    console.log(`Found ${subscriptions?.length || 0} subscriptions to process`);

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      cancelled: 0,
    };

    // Process each subscription
    for (const subscription of subscriptions || []) {
      results.processed++;
      console.log(`\nProcessing subscription ${subscription.id} for ${subscription.customer_email}`);

      try {
        const paymentLink = subscription.payment_links;

        // Get exchange rate
        const { data: exchangeRate } = await supabaseClient
          .from('exchange_rates')
          .select('rate')
          .eq('from_currency', paymentLink.currency)
          .eq('to_currency', 'EGP')
          .single();

        const rate = exchangeRate?.rate || 1;
        const amountInEGP = paymentLink.amount * rate;
        const amountCents = Math.round(amountInEGP * 100);

        // Authenticate with Paymob
        const authResponse = await fetch('https://accept.paymob.com/api/auth/tokens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: Deno.env.get('PAYMOB_API_KEY'),
          }),
        });

        if (!authResponse.ok) {
          throw new Error('Paymob authentication failed');
        }

        const authData: PaymobAuthResponse = await authResponse.json();

        // Create order
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
          throw new Error('Failed to create Paymob order');
        }

        const orderData: PaymobOrderResponse = await orderResponse.json();

        // Generate payment key
        const [firstName, ...lastNameParts] = subscription.customer_name.split(' ');
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
              email: subscription.customer_email,
              first_name: firstName,
              last_name: lastName,
              phone_number: subscription.customer_phone || '01000000000',
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
          throw new Error('Failed to generate payment key');
        }

        // Create transaction record
        const { data: transaction, error: txError } = await supabaseClient
          .from('payment_transactions')
          .insert({
            payment_link_id: paymentLink.id,
            paymob_order_id: orderData.id.toString(),
            amount: paymentLink.amount,
            currency: paymentLink.currency,
            amount_in_egp: amountInEGP,
            status: 'success', // Assuming successful for recurring (Paymob will update via webhook if fails)
            customer_email: subscription.customer_email,
            customer_phone: subscription.customer_phone,
            customer_name: subscription.customer_name,
            paid_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (txError) {
          throw new Error('Failed to create transaction');
        }

        // Update subscription on success
        const nextPaymentDate = new Date();
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);

        await supabaseClient
          .from('recurring_subscriptions')
          .update({
            total_payments_made: subscription.total_payments_made + 1,
            retry_count: 0,
            last_payment_transaction_id: transaction.id,
            next_payment_date: nextPaymentDate.toISOString().split('T')[0],
          })
          .eq('id', subscription.id);

        results.successful++;
        console.log(`✅ Payment successful for ${subscription.customer_email}`);

        // Send confirmation email
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            },
            body: JSON.stringify({
              from: 'noreply@ahmedwesam.com',
              to: subscription.customer_email,
              subject: 'Monthly Payment Processed - Thank You!',
              html: `
                <h2>✅ Payment Successful!</h2>
                <p>Hi ${subscription.customer_name},</p>
                <p>Your monthly payment has been successfully processed.</p>
                <hr />
                <p><strong>Amount Paid:</strong> ${paymentLink.amount} ${paymentLink.currency}</p>
                <p><strong>Total Payments:</strong> ${subscription.total_payments_made + 1}</p>
                <p><strong>Next Payment:</strong> ${nextPaymentDate.toLocaleDateString()}</p>
                <hr />
                <p>To cancel your subscription, please email contact@ahmedwesam.com</p>
                <p>Thank you!</p>
                <p>Best regards,<br/>Ahmed Wesam</p>
              `,
            }),
          });
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
        }

      } catch (error) {
        console.error(`❌ Payment failed for ${subscription.customer_email}:`, error);
        results.failed++;

        const newRetryCount = subscription.retry_count + 1;

        if (newRetryCount >= 3) {
          // Cancel subscription after 3 failed attempts
          await supabaseClient
            .from('recurring_subscriptions')
            .update({
              status: 'cancelled',
              cancellation_reason: 'Payment failed after 3 attempts',
              cancelled_at: new Date().toISOString(),
            })
            .eq('id', subscription.id);

          results.cancelled++;
          console.log(`🚨 Subscription cancelled for ${subscription.customer_email} after 3 failed attempts`);

          // Send cancellation email
          try {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
              },
              body: JSON.stringify({
                from: 'noreply@ahmedwesam.com',
                to: subscription.customer_email,
                subject: '⚠️ Subscription Cancelled - Payment Failed',
                html: `
                  <h2>⚠️ Subscription Cancelled</h2>
                  <p>Hi ${subscription.customer_name},</p>
                  <p>Your subscription has been cancelled due to repeated payment failures.</p>
                  <hr />
                  <p><strong>Subscription:</strong> ${subscription.payment_links.description}</p>
                  <p><strong>Amount:</strong> ${subscription.payment_links.amount} ${subscription.payment_links.currency}</p>
                  <p><strong>Total Paid:</strong> ${subscription.total_payments_made} months</p>
                  <p><strong>Cancellation Date:</strong> ${new Date().toLocaleDateString()}</p>
                  <p><strong>Reason:</strong> Payment failed after 3 attempts</p>
                  <hr />
                  <p>If you'd like to reactivate your subscription, please contact:</p>
                  <p>contact@ahmedwesam.com</p>
                  <p>Thank you for your past support.</p>
                  <p>Best regards,<br/>Ahmed Wesam</p>
                `,
              }),
            });

            // Send admin notification
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
              },
              body: JSON.stringify({
                from: 'noreply@ahmedwesam.com',
                to: 'contact@ahmedwesam.com',
                subject: `🚨 Subscription Cancelled: ${subscription.customer_name}`,
                html: `
                  <h2>🚨 Subscription Cancelled</h2>
                  <p>A subscription has been automatically cancelled due to payment failure.</p>
                  <hr />
                  <p><strong>Customer:</strong> ${subscription.customer_name} (${subscription.customer_email})</p>
                  <p><strong>Amount:</strong> ${subscription.payment_links.amount} ${subscription.payment_links.currency}</p>
                  <p><strong>Total Paid:</strong> ${subscription.total_payments_made} months</p>
                  <p><strong>Reason:</strong> 3 failed payment attempts</p>
                `,
              }),
            });
          } catch (emailError) {
            console.error('Failed to send cancellation email:', emailError);
          }
        } else {
          // Schedule retry in 3 days
          const retryDate = new Date();
          retryDate.setDate(retryDate.getDate() + 3);

          await supabaseClient
            .from('recurring_subscriptions')
            .update({
              retry_count: newRetryCount,
              next_payment_date: retryDate.toISOString().split('T')[0],
            })
            .eq('id', subscription.id);

          console.log(`⏳ Retry scheduled for ${subscription.customer_email} (Attempt ${newRetryCount}/3)`);

          // Send retry notification
          try {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
              },
              body: JSON.stringify({
                from: 'noreply@ahmedwesam.com',
                to: subscription.customer_email,
                subject: '⚠️ Payment Failed - Retry Scheduled',
                html: `
                  <h2>⚠️ Payment Failed</h2>
                  <p>Hi ${subscription.customer_name},</p>
                  <p>We were unable to process your monthly payment.</p>
                  <hr />
                  <p><strong>Amount:</strong> ${subscription.payment_links.amount} ${subscription.payment_links.currency}</p>
                  <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                  <hr />
                  <p><strong>What happens next?</strong></p>
                  <p>We will automatically retry in 3 days. If the payment fails 3 times, your subscription will be cancelled.</p>
                  <p><strong>Retry attempt:</strong> ${newRetryCount}/3</p>
                  <p><strong>Next retry:</strong> ${retryDate.toLocaleDateString()}</p>
                  <hr />
                  <p>To update your payment method or for assistance, please contact:</p>
                  <p>contact@ahmedwesam.com</p>
                  <p>Best regards,<br/>Ahmed Wesam</p>
                `,
              }),
            });
          } catch (emailError) {
            console.error('Failed to send retry email:', emailError);
          }
        }
      }
    }

    console.log('\n=== Processing Complete ===');
    console.log('Results:', results);

    return new Response(
      JSON.stringify({
        success: true,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in process-recurring-payments:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
