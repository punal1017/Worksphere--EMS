
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  TextField,
  Typography,
} from '@mui/material';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import axios from 'axios';

type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post<LoginResponse>(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`,
        {
          email: email.trim(),
          password,
        }
      );

      const { token, user } = response.data;

      localStorage.setItem('accessToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));

      router.push('/dashboard');
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      setError(
        message ||
          'Login failed. Please check your credentials or backend server.'
      );
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
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid #e2e8f0',
          py: 2,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <GroupsRoundedIcon
                sx={{ fontSize: 34, color: '#2563eb' }}
              />
              <Typography
                variant="h5"
                fontWeight={800}
                color="#0f172a"
              >
                WorkSphere
              </Typography>
            </Stack>

            <Button
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => router.push('/')}
              sx={{ textTransform: 'none' }}
            >
              Back to Home
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Login Form */}
      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 5,
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            p: { xs: 3, sm: 5 },
            border: '1px solid #e2e8f0',
            borderRadius: 4,
            bgcolor: 'white',
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
              <GroupsRoundedIcon
                sx={{ fontSize: 36, color: '#2563eb' }}
              />
            </Box>

            <Typography
              variant="h4"
              fontWeight={800}
              color="#0f172a"
              gutterBottom
            >
              Welcome back!
            </Typography>

            <Typography color="text.secondary">
              Sign in to access your WorkSphere account.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={(event) => {
              event.preventDefault();
              handleLogin();
            }}
          >
            <Stack spacing={2.5}>
              <TextField
                label="Email address"
                type="email"
                autoComplete="username"
                fullWidth
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                fullWidth
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showPassword ? 'Hide password' : 'Show password'
                          }
                          onClick={() =>
                            setShowPassword((previous) => !previous)
                          }
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
                  'Sign In'
                )}
              </Button>
            </Stack>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ mt: 3, lineHeight: 1.8 }}
          >
            Your account is provided by your organization.
            Contact your administrator if you need access.
          </Typography>
        </Card>
      </Container>

      {/* Footer */}
      <Box sx={{ py: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © 2026 WorkSphere
        </Typography>
      </Box>
    </Box>
  );
}
