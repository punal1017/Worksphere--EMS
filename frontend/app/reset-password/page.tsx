'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<{
    type: 'error' | 'success';
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setStatus({ type: 'error', message: 'This reset link is missing its token.' });
      return;
    }

    if (!passwordPattern.test(password)) {
      setStatus({
        type: 'error',
        message:
          'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.',
      });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        password,
      });
      setStatus({ type: 'success', message: response.data.message });
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => router.replace('/sign-in'), 1500);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      setStatus({
        type: 'error',
        message: message || 'Unable to reset password.',
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
              Set a new password
            </Typography>
            <Typography color="text.secondary">
              Create a strong password for your WorkSphere account.
            </Typography>
          </Box>

          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ bgcolor: '#ffffff' }}
          >
            <Stack spacing={2.5}>
              <TextField
                label="New password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                fullWidth
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                helperText="Use 8+ characters with uppercase, lowercase, a number, and a special character."
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowPassword((previous) => !previous)}
                          edge="end"
                        >
                          {showPassword ? (
                            <VisibilityOffRoundedIcon />
                          ) : (
                            <VisibilityRoundedIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                  inputLabel: { shrink: true },
                }}
              />

              <TextField
                label="Confirm new password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                fullWidth
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showConfirmPassword
                              ? 'Hide confirmed password'
                              : 'Show confirmed password'
                          }
                          onClick={() =>
                            setShowConfirmPassword((previous) => !previous)
                          }
                          edge="end"
                        >
                          {showConfirmPassword ? (
                            <VisibilityOffRoundedIcon />
                          ) : (
                            <VisibilityRoundedIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                  inputLabel: { shrink: true },
                }}
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
                  'Reset password'
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
