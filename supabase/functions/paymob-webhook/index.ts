import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymobWebhookPayload {
  obj: {
    id: number;
    amount_cents: number;
    currency: string;
    success: boolean;
    is_refunded: boolean;
    is_voided: boolean;
    pending: boolean;
    error_occured: boolean;
    has_parent_transaction: boolean;
    is_3d_secure: boolean;
    is_auth: boolean;
    is_capture: boolean;
    is_standalone_payment: boolean;
    owner: number;
    created_at: string;
    order: {
      id: number;
    };
    source_data: {
      type: string;
      sub_type: string;
      pan: string;
    };
    integration_id: number;
  };
  type: string;
  hmac: string;
}

function verifyHMAC(obj: any, receivedHmac: string, hmacSecret: string): boolean {
  try {
    // Concatenate fields in the exact order Paymob expects
    const fields = [
      obj.amount_cents?.toString() || '',
      obj.created_at || '',
      obj.currency || '',
      obj.error_occured?.toString() || 'false',
      obj.has_parent_transaction?.toString() || 'false',
      obj.id?.toString() || '',
      obj.integration_id?.toString() || '',
      obj.is_3d_secure?.toString() || 'false',
      obj.is_auth?.toString() || 'false',
      obj.is_capture?.toString() || 'false',
      obj.is_refunded?.toString() || 'false',
      obj.is_standalone_payment?.toString() || 'false',
      obj.is_voided?.toString() || 'false',
      obj.order?.id?.toString() || '',
      obj.owner?.toString() || '',
      obj.pending?.toString() || 'false',
      obj.source_data?.pan || '',
      obj.source_data?.sub_type || '',
      obj.source_data?.type || '',
      obj.success?.toString() || 'false',
    ];

    const concatenatedString = fields.join('');
    console.log('HMAC concatenated string length:', concatenatedString.length);

    const hmac = createHmac('sha512', hmacSecret);
    hmac.update(concatenatedString);
    const calculatedHmac = hmac.digest('hex');

    console.log('Calculated HMAC:', calculatedHmac.substring(0, 20) + '...');
    console.log('Received HMAC:', receivedHmac.substring(0, 20) + '...');

    return calculatedHmac === receivedHmac;
  } catch (error) {
    console.error('HMAC verification error:', error);
    return false;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: PaymobWebhookPayload = await req.json();
    console.log('Received Paymob webhook:', JSON.stringify(payload, null, 2));

    // Verify HMAC signature
    const hmacSecret = Deno.env.get('PAYMOB_HMAC_SECRET') || '';
    const isValid = verifyHMAC(payload.obj, payload.hmac, hmacSecret);

    if (!isValid) {
      console.error('HMAC verification failed');
      return new Response('Invalid HMAC signature', { 
        status: 403,
        headers: corsHeaders 
      });
    }

    console.log('HMAC verification successful');

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find transaction by Paymob order ID
    const { data: transaction, error: txError } = await supabaseClient
      .from('payment_transactions')
      .select('*, payment_links(*)')
      .eq('paymob_order_id', payload.obj.order.id.toString())
      .single();

    if (txError || !transaction) {
      console.error('Transaction not found:', payload.obj.order.id);
      return new Response('Transaction not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    console.log('Found transaction:', transaction.id);

    // Determine transaction status
    let status: 'success' | 'failed' | 'pending' = 'pending';
    if (payload.obj.success && !payload.obj.pending) {
      status = 'success';
    } else if (!payload.obj.success && !payload.obj.pending) {
      status = 'failed';
    }

    // Update transaction
    const { error: updateError } = await supabaseClient
      .from('payment_transactions')
      .update({
        status,
        paymob_transaction_id: payload.obj.id.toString(),
        payment_method: payload.obj.source_data?.type || 'unknown',
        paymob_response: payload.obj,
        paid_at: status === 'success' ? new Date().toISOString() : null,
        error_message: !payload.obj.success && payload.obj.error_occured 
          ? 'Payment failed' 
          : null,
      })
      .eq('id', transaction.id);

    if (updateError) {
      console.error('Failed to update transaction:', updateError);
      throw new Error('Failed to update transaction');
    }

    console.log('Transaction updated to status:', status);

    // If payment successful
    if (status === 'success') {
      // Increment payment link usage
      const { error: linkError } = await supabaseClient
        .from('payment_links')
        .update({
          current_uses: (transaction.payment_links.current_uses || 0) + 1,
        })
        .eq('id', transaction.payment_link_id);

      if (linkError) {
        console.error('Failed to increment payment link usage:', linkError);
      }

      // If monthly subscription, create or update subscription record
      if (transaction.payment_links.payment_type === 'monthly') {
        const nextPaymentDate = new Date();
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);

        const { data: existingSubscription } = await supabaseClient
          .from('recurring_subscriptions')
          .select('*')
          .eq('payment_link_id', transaction.payment_link_id)
          .eq('customer_email', transaction.customer_email)
          .single();

        if (existingSubscription) {
          // Update existing subscription
          await supabaseClient
            .from('recurring_subscriptions')
            .update({
              total_payments_made: existingSubscription.total_payments_made + 1,
              retry_count: 0,
              last_payment_transaction_id: transaction.id,
              next_payment_date: nextPaymentDate.toISOString().split('T')[0],
              status: 'active',
            })
            .eq('id', existingSubscription.id);

          console.log('Subscription updated:', existingSubscription.id);
        } else {
          // Create new subscription
          await supabaseClient
            .from('recurring_subscriptions')
            .insert({
              payment_link_id: transaction.payment_link_id,
              customer_email: transaction.customer_email,
              customer_phone: transaction.customer_phone,
              customer_name: transaction.customer_name,
              status: 'active',
              next_payment_date: nextPaymentDate.toISOString().split('T')[0],
              total_payments_made: 1,
              last_payment_transaction_id: transaction.id,
            });

          console.log('New subscription created');
        }
      }

      // Send confirmation email (using Resend)
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          },
          body: JSON.stringify({
            from: 'noreply@ahmedwesam.com',
            to: transaction.customer_email,
            subject: 'Payment Confirmed - Thank You!',
            html: `
              <h2>✅ Payment Successful!</h2>
              <p>Hi ${transaction.customer_name},</p>
              <p>Your payment has been successfully processed.</p>
              <hr />
              <p><strong>Amount Paid:</strong> ${transaction.amount} ${transaction.currency}</p>
              <p><strong>Transaction ID:</strong> ${payload.obj.id}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Payment Method:</strong> ${payload.obj.source_data?.type || 'Card'}</p>
              <hr />
              ${transaction.payment_links.payment_type === 'monthly' ? `
                <p>Your next payment of ${transaction.amount} ${transaction.currency} will be processed on ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}.</p>
                <p>To cancel your subscription, please email contact@ahmedwesam.com</p>
              ` : ''}
              <p>Thank you for your payment!</p>
              <p>Best regards,<br/>Ahmed Wesam</p>
            `,
          }),
        });
        console.log('Confirmation email sent to customer');
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      // Send admin notification
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          },
          body: JSON.stringify({
            from: 'noreply@ahmedwesam.com',
            to: 'contact@ahmedwesam.com',
            subject: `💰 New Payment: ${transaction.amount} ${transaction.currency} from ${transaction.customer_name}`,
            html: `
              <h2>💰 New Payment Received!</h2>
              <hr />
              <p><strong>Client:</strong> ${transaction.customer_name}</p>
              <p><strong>Email:</strong> ${transaction.customer_email}</p>
              <p><strong>Amount:</strong> ${transaction.amount} ${transaction.currency}</p>
              <p><strong>Type:</strong> ${transaction.payment_links.payment_type === 'monthly' ? 'Monthly Subscription' : 'One-time Payment'}</p>
              <p><strong>Transaction ID:</strong> ${payload.obj.id}</p>
              <p><strong>Status:</strong> ✅ Success</p>
              <p><strong>Payment Method:</strong> ${payload.obj.source_data?.type || 'Card'}</p>
              <hr />
              <p>View details in your admin dashboard.</p>
            `,
          }),
        });
        console.log('Admin notification sent');
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError);
      }
    } else if (status === 'failed') {
      // Send failure notification to customer
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          },
          body: JSON.stringify({
            from: 'noreply@ahmedwesam.com',
            to: transaction.customer_email,
            subject: '❌ Payment Failed',
            html: `
              <h2>❌ Payment Failed</h2>
              <p>Hi ${transaction.customer_name},</p>
              <p>Unfortunately, we were unable to process your payment.</p>
              <p>Please try again or contact support at contact@ahmedwesam.com</p>
              <p>Best regards,<br/>Ahmed Wesam</p>
            `,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send failure email:', emailError);
      }
    }

    return new Response('Webhook processed successfully', { 
      status: 200,
      headers: corsHeaders 
    });
  } catch (error) {
    console.error('Error in paymob-webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
