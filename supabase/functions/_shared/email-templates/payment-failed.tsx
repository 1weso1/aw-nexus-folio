import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface PaymentFailedEmailProps {
  customer_name: string;
  amount: number;
  currency: string;
  retry_count?: number;
  next_retry_date?: string;
  is_cancelled?: boolean;
}

export const PaymentFailedEmail = ({
  customer_name,
  amount,
  currency,
  retry_count = 0,
  next_retry_date,
  is_cancelled = false,
}: PaymentFailedEmailProps) => (
  <Html>
    <Head />
    <Preview>{is_cancelled ? 'Subscription Cancelled - Payment Failed' : 'Payment Failed - Action Required'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {is_cancelled ? '⚠️ Subscription Cancelled' : '⚠️ Payment Failed'}
        </Heading>
        
        <Text style={text}>Hi {customer_name},</Text>
        
        {is_cancelled ? (
          <>
            <Text style={text}>
              Your subscription has been cancelled due to repeated payment failures.
            </Text>

            <Hr style={hr} />

            <Section style={infoBox}>
              <Text style={infoLabel}>Amount:</Text>
              <Text style={infoValue}>{amount.toLocaleString()} {currency}</Text>
              
              <Text style={infoLabel}>Reason:</Text>
              <Text style={infoValue}>Payment failed after 3 attempts</Text>
            </Section>

            <Hr style={hr} />

            <Text style={text}>
              If you'd like to reactivate your subscription, please contact us at{' '}
              <Link href="mailto:contact@ahmedwesam.com" style={link}>
                contact@ahmedwesam.com
              </Link>
            </Text>
          </>
        ) : (
          <>
            <Text style={text}>
              We were unable to process your monthly payment.
            </Text>

            <Hr style={hr} />

            <Section style={infoBox}>
              <Text style={infoLabel}>Amount:</Text>
              <Text style={infoValue}>{amount.toLocaleString()} {currency}</Text>
            </Section>

            <Hr style={hr} />

            <Section style={warningBox}>
              <Text style={warningTitle}>What happens next?</Text>
              <Text style={warningText}>
                We will automatically retry in 3 days. If the payment fails 3 times, your subscription will be cancelled.
              </Text>
              <Text style={warningText}>
                <strong>Retry attempt:</strong> {retry_count}/3
              </Text>
              {next_retry_date && (
                <Text style={warningText}>
                  <strong>Next retry:</strong> {next_retry_date}
                </Text>
              )}
            </Section>

            <Hr style={hr} />

            <Text style={text}>
              To update your payment method or for assistance, please contact us at{' '}
              <Link href="mailto:contact@ahmedwesam.com" style={link}>
                contact@ahmedwesam.com
              </Link>
            </Text>
          </>
        )}

        <Text style={footer}>
          Best regards,<br />
          <strong>Ahmed Wesam</strong>
        </Text>
      </Container>
    </Body>
  </Html>
);

export default PaymentFailedEmail;

const main = {
  backgroundColor: '#0E1116',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
  backgroundColor: '#1A1D24',
  borderRadius: '8px',
};

const h1 = {
  color: '#EF4444',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const text = {
  color: '#E6F2F2',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const hr = {
  borderColor: '#2A2D35',
  margin: '24px 0',
};

const infoBox = {
  backgroundColor: '#12151C',
  borderRadius: '6px',
  padding: '20px',
  margin: '16px 0',
};

const infoLabel = {
  color: '#AEB7C2',
  fontSize: '14px',
  margin: '8px 0 4px',
};

const infoValue = {
  color: '#E6F2F2',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px',
};

const warningBox = {
  backgroundColor: '#3F1F1F',
  borderRadius: '6px',
  padding: '16px',
  margin: '16px 0',
  border: '1px solid #EF4444',
};

const warningTitle = {
  color: '#EF4444',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const warningText = {
  color: '#E6F2F2',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};

const footer = {
  color: '#AEB7C2',
  fontSize: '14px',
  lineHeight: '20px',
  marginTop: '32px',
};

const link = {
  color: '#00E5D4',
  textDecoration: 'underline',
};
