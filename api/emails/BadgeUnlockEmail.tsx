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

interface BadgeUnlockEmailProps {
  username: string;
  badgeTitle: string;
  badgeDescription: string;
  badgeIcon: string;
}

export const BadgeUnlockEmail = ({
  username = 'Artist',
  badgeTitle = 'Creative Spark',
  badgeDescription = 'Joined the community',
  badgeIcon = '&#9889;',
}: BadgeUnlockEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>You unlocked a new badge!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={badgeContainer}>
            <Text style={badgeIconStyle}>{badgeIcon}</Text>
            <Heading style={h1}>Badge Unlocked!</Heading>
          </Section>

          <Text style={text}>Congratulations, {username}!</Text>

          <Section style={badgeBox}>
            <Text style={badgeName}>{badgeTitle}</Text>
            <Text style={badgeDesc}>{badgeDescription}</Text>
          </Section>

          <Text style={text}>
            You're building an impressive collection. Keep creating to unlock even more!
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href="https://dailydoodleprompt.com/profile">
              View All Your Badges
            </Button>
          </Section>

          <Text style={footer}>
            Keep up the amazing work!<br />
            The Daily Doodle Prompt Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default BadgeUnlockEmail;

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

const badgeContainer = {
  textAlign: 'center' as const,
  margin: '0 0 32px',
};

const badgeIconStyle = {
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

const badgeBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
  border: '2px solid #fbbf24',
};

const badgeName = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold' as const,
  margin: '0 0 8px',
};

const badgeDesc = {
  color: '#404040',
  fontSize: '16px',
  margin: '0',
};

const footer = {
  color: '#404040',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '32px 0 16px',
};
