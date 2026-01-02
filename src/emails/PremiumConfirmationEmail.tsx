import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface PremiumConfirmationEmailProps {
  username: string;
  purchaseDate: string;
  amount: string;
}

export const PremiumConfirmationEmail = ({
  username = 'Artist',
  purchaseDate = new Date().toLocaleDateString(),
  amount = '$4.99',
}: PremiumConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Premium!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={crownContainer}>
            <Text style={crownIcon}>&#128081;</Text>
            <Heading style={h1}>Welcome to Premium!</Heading>
          </Section>

          <Text style={text}>Hi {username},</Text>

          <Text style={text}>
            Thank you for supporting Daily Doodle Prompt! Your premium access is now active.
          </Text>

          <Section style={receiptBox}>
            <Text style={receiptTitle}>Purchase Details</Text>
            <Text style={receiptLine}>
              <strong>Product:</strong> Lifetime Premium Access
            </Text>
            <Text style={receiptLine}>
              <strong>Amount:</strong> {amount}
            </Text>
            <Text style={receiptLine}>
              <strong>Date:</strong> {purchaseDate}
            </Text>
            <Text style={receiptLine}>
              <strong>Status:</strong> Active
            </Text>
          </Section>

          <Text style={text}>
            <strong>Your Premium Features:</strong>
          </Text>

          <Text style={list}>
            - Unlimited doodle uploads<br />
            - Unlock all 23 badges<br />
            - Ad-free experience<br />
            - Support indie development<br />
            - Lifetime access - yours forever!
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href="https://dailydoodleprompt.com">
              Start Creating
            </Button>
          </Section>

          <Text style={text}>
            A Stripe receipt has been sent separately to your email.
          </Text>

          <Text style={footer}>
            Thank you for your support!<br />
            The Daily Doodle Prompt Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PremiumConfirmationEmail;

// Styles
const main = {
  backgroundColor: '#fdf8ee',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginTop: '40px',
  marginBottom: '40px',
  borderRadius: '8px',
  maxWidth: '600px',
};

const crownContainer = {
  textAlign: 'center' as const,
  margin: '0 0 32px',
};

const crownIcon = {
  fontSize: '64px',
  margin: '0 0 16px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold' as const,
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const text = {
  color: '#404040',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const list = {
  color: '#404040',
  fontSize: '16px',
  lineHeight: '28px',
  margin: '16px 0',
  paddingLeft: '20px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#6366f1',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const receiptBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #e5e7eb',
};

const receiptTitle = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: 'bold' as const,
  margin: '0 0 16px',
};

const receiptLine = {
  color: '#404040',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
};

const footer = {
  color: '#404040',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '32px 0 16px',
};
