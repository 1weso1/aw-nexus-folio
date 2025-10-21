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

interface PaymentConfirmationEmailProps {
  customer_name: string;
  amount: number;
  currency: string;
  transaction_id: string;
  payment_method: string;
  date: string;
  is_recurring: boolean;
  next_payment_date?: string;
}

export const PaymentConfirmationEmail = ({
  customer_name,
  amount,
  currency,
  transaction_id,
  payment_method,
  date,
  is_recurring,
  next_payment_date,
}: PaymentConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Payment Confirmed - Thank You!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>✅ Payment Successful!</Heading>
        
        <Text style={text}>Hi {customer_name},</Text>
        
        <Text style={text}>
          Your payment has been successfully processed.
        </Text>

        <Hr style={hr} />

        <Section style={infoBox}>
          <Text style={infoLabel}>Amount Paid:</Text>
          <Text style={infoValue}>{amount.toLocaleString()} {currency}</Text>
          
          <Text style={infoLabel}>Transaction ID:</Text>
          <Text style={infoValue}>{transaction_id}</Text>
          
          <Text style={infoLabel}>Date & Time:</Text>
          <Text style={infoValue}>{date}</Text>
          
          <Text style={infoLabel}>Payment Method:</Text>
          <Text style={infoValue}>{payment_method}</Text>
        </Section>

        <Hr style={hr} />

        {is_recurring && next_payment_date && (
          <>
            <Section style={recurringBox}>
              <Text style={recurringText}>
                Your next payment of {amount.toLocaleString()} {currency} will be processed on {next_payment_date}.
              </Text>
              <Text style={recurringText}>
                To cancel your subscription, please email contact@ahmedwesam.com
              </Text>
            </Section>
            <Hr style={hr} />
          </>
        )}

        <Text style={text}>Thank you for your payment!</Text>

        <Text style={footer}>
          Best regards,<br />
          <strong>Ahmed Wesam</strong><br />
          CRM & Automation Specialist<br />
          <Link href="mailto:contact@ahmedwesam.com" style={link}>
            contact@ahmedwesam.com
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

export default PaymentConfirmationEmail;

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
  color: '#00E5D4',
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

const recurringBox = {
  backgroundColor: '#1E3A5F',
  borderRadius: '6px',
  padding: '16px',
  margin: '16px 0',
};

const recurringText = {
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
