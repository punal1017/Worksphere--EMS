'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Stack,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{
    type: 'error' | 'success';
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email: normalizedEmail,
      });
      setStatus({ type: 'success', message: response.data.message });
      setTimeout(() => router.replace('/sign-in'), 1500);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      setStatus({
        type: 'error',
        message: message || 'Unable to send reset link.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Snackbar
        open={Boolean(status)}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={() => setStatus(null)}
        sx={{ mt: 8 }}
      >
        <Alert
          severity={status?.type || 'error'}
          variant="filled"
          onClose={() => setStatus(null)}
        >
          {status?.message}
        </Alert>
      </Snackbar>

      <Box sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <Container
          maxWidth="lg"
          sx={{
            minHeight: 76,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
            }}
            onClick={() => router.push('/')}
            role="button"
            tabIndex={0}
            aria-label="Go to home"
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                router.push('/');
              }
            }}
          >
            <GroupsRoundedIcon sx={{ fontSize: 36, color: '#2563eb' }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
              WorkSphere
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 5,
          bgcolor: '#f8fafc',
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            p: { xs: 3, sm: 5 },
            border: '1px solid #e2e8f0',
            borderRadius: 4,
            bgcolor: '#ffffff',
            color: '#0f172a',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: 3,
                bgcolor: '#dbeafe',
                mb: 2,
              }}
            >
              <GroupsRoundedIcon sx={{ fontSize: 36, color: '#2563eb' }} />
            </Box>
            <Typography
              variant="h4"
              color="#0f172a"
              gutterBottom
              sx={{ fontWeight: 800 }}
            >
              Forgot password?
            </Typography>
            <Typography color="text.secondary">
              Enter your work email and we will send you a reset link.
            </Typography>
          </Box>

          <Box component="form" noValidate onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Email address"
                type="email"
                autoComplete="email"
                fullWidth
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Send reset link'
                )}
              </Button>

              <Typography
                component={Link}
                href="/sign-in"
                variant="body2"
                color="primary"
                sx={{
                  textAlign: 'center',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Back to sign in
              </Typography>
            </Stack>
          </Box>
        </Card>
      </Container>

      <Box sx={{ py: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © 2026 WorkSphere
        </Typography>
      </Box>
    </Box>
  );
}
