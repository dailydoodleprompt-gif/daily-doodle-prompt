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

interface ReengagementEmailProps {
  username: string;
  daysSinceLastVisit: number;
  todayPrompt: string;
}

export const ReengagementEmail = ({
  username = 'Artist',
  daysSinceLastVisit = 7,
  todayPrompt = 'A robot discovering emotions for the first time',
}: ReengagementEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>We miss you! Come back for today's prompt</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>We Miss You, {username}!</Heading>

          <Text style={text}>
            It's been {daysSinceLastVisit} days since your last visit. Your creative spark is
            waiting!
          </Text>

          <Section style={promptBox}>
            <Text style={promptLabel}>TODAY'S PROMPT</Text>
            <Text style={promptText}>{todayPrompt}</Text>
          </Section>

          <Text style={text}>
            The community has been busy creating amazing artwork. Don't miss out on the
            inspiration!
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href="https://dailydoodleprompt.com">
              See Today's Prompt
            </Button>
          </Section>

          <Text style={text}>
            <strong>What's new:</strong>
          </Text>

          <Text style={list}>
            - {daysSinceLastVisit} new prompts added<br />
            - New badges to unlock<br />
            - New artists joined the community<br />
            - Fresh artwork in your feed
          </Text>

          <Text style={footer}>
            Can't wait to see what you create!<br />
            The Daily Doodle Prompt Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ReengagementEmail;

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

const promptBox = {
  backgroundColor: '#f5f3ff',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const promptLabel = {
  color: '#6366f1',
  fontSize: '12px',
  fontWeight: 'bold' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 8px',
};

const promptText = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: 'bold' as const,
  lineHeight: '28px',
  margin: '0',
};

const footer = {
  color: '#404040',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '32px 0 16px',
};
