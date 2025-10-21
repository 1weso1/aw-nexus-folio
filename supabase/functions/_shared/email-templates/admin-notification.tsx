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

interface AdminNotificationEmailProps {
  customer_name: string;
  customer_email: string;
  amount: number;
  currency: string;
  payment_type: string;
  transaction_id: string;
  status: string;
  payment_method?: string;
  date: string;
}

export const AdminNotificationEmail = ({
  customer_name,
  customer_email,
  amount,
  currency,
  payment_type,
  transaction_id,
  status,
  payment_method,
  date,
}: AdminNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>
      {status === 'success' ? '💰' : '❌'} New Payment: {amount} {currency} from {customer_name}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {status === 'success' ? '💰 New Payment Received!' : '❌ Payment Failed'}
        </Heading>

        <Hr style={hr} />

        <Section style={infoBox}>
          <Text style={infoLabel}>Client:</Text>
          <Text style={infoValue}>{customer_name}</Text>
          
          <Text style={infoLabel}>Email:</Text>
          <Text style={infoValue}>
            <Link href={`mailto:${customer_email}`} style={link}>
              {customer_email}
            </Link>
          </Text>
          
          <Text style={infoLabel}>Amount:</Text>
          <Text style={infoValue}>{amount.toLocaleString()} {currency}</Text>
          
          <Text style={infoLabel}>Type:</Text>
          <Text style={infoValue}>
            {payment_type === 'monthly' ? 'Monthly Subscription' : 'One-time Payment'}
          </Text>
          
          <Text style={infoLabel}>Status:</Text>
          <Text style={status === 'success' ? successValue : errorValue}>
            {status === 'success' ? '✅ Success' : '❌ Failed'}
          </Text>
          
          <Text style={infoLabel}>Transaction ID:</Text>
          <Text style={infoValue}>{transaction_id}</Text>
          
          {payment_method && (
            <>
              <Text style={infoLabel}>Payment Method:</Text>
              <Text style={infoValue}>{payment_method}</Text>
            </>
          )}
          
          <Text style={infoLabel}>Date & Time:</Text>
          <Text style={infoValue}>{date}</Text>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          Sent by ahmedwesam.com Payment System
        </Text>
      </Container>
    </Body>
  </Html>
);

export default AdminNotificationEmail;

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

const successValue = {
  color: '#10B981',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px',
};

const errorValue = {
  color: '#EF4444',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px',
};

const footer = {
  color: '#AEB7C2',
  fontSize: '12px',
  textAlign: 'center' as const,
  marginTop: '32px',
};

const link = {
  color: '#00E5D4',
  textDecoration: 'underline',
};
