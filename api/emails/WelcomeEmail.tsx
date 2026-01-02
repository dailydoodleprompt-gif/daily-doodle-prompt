import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  username: string;
}

export const WelcomeEmail = ({ username = 'Artist' }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Daily Doodle Prompt!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to Daily Doodle Prompt!</Heading>

          <Text style={text}>Hi {username},</Text>

          <Text style={text}>
            Thanks for joining our creative community! We're thrilled to have you here.
          </Text>

          <Text style={text}>
            Every day, you'll get a fresh creative prompt to spark your imagination.
            Whether you're a seasoned artist or just starting out, there's something for everyone.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href="https://dailydoodleprompt.com">
              Get Today's Prompt
            </Button>
          </Section>

          <Text style={text}>
            <strong>What you can do:</strong>
          </Text>

          <Text style={list}>
            - Get a new creative prompt every day<br />
            - Upload your doodles (Premium)<br />
            - Earn badges and build streaks<br />
            - Follow other artists and see their work<br />
            - Save your favorite prompts
          </Text>

          <Text style={text}>
            Ready to unlock all features?{' '}
            <Link href="https://dailydoodleprompt.com/pricing" style={link}>
              Get Lifetime Premium for just $4.99
            </Link>
          </Text>

          <Text style={footer}>
            Happy creating!<br />
            The Daily Doodle Prompt Team
          </Text>

          <Text style={footerText}>
            Not interested in these emails?{' '}
            <Link href="https://dailydoodleprompt.com/settings" style={link}>
              Update your preferences
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

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

const link = {
  color: '#6366f1',
  textDecoration: 'underline',
};

const footer = {
  color: '#404040',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '32px 0 16px',
};

const footerText = {
  color: '#737373',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
  textAlign: 'center' as const,
};
