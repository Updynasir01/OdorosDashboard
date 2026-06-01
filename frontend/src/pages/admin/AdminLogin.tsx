import { FormEvent, useState, useEffect, type CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdmin } from '../../contexts/AdminContext'
import { adminApi } from '../../services/adminApi'

const theme = {
  bg: '#f3f4f6',
  surface: '#ffffff',
  border: '#e5e7eb',
  brand: '#05556c',
  accent: '#05556c',
  text: '#111827',
  muted: '#6b7280',
  error: '#dc2626',
  inputBg: '#ffffff',
}

export default function AdminLogin() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAdmin()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await adminApi.login(username.trim(), password)
      login(data.token, data.username)
      navigate('/admin', { replace: true })
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, system-ui, sans-serif',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: theme.surface,
          borderRadius: 12,
          padding: 32,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: `1px solid ${theme.border}`,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              display: 'inline-block',
              background: '#fff',
              borderRadius: 8,
              padding: '8px 12px',
              border: `1px solid ${theme.border}`,
            }}
          >
            <img src="/odoros-logo.png" alt="Odoros" style={{ height: 40, objectFit: 'contain' }} />
          </div>
          <h1 style={{ color: theme.brand, fontSize: 22, marginTop: 16, marginBottom: 4, fontWeight: 700 }}>
            Admin Panel
          </h1>
          <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>Somalia Drought Intelligence</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', color: theme.text, fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            style={inputStyle}
          />

          <label
            style={{
              display: 'block',
              color: theme.text,
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 6,
              marginTop: 16,
            }}
          >
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{ ...inputStyle, paddingRight: 72 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: theme.brand,
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {error && (
            <p style={{ color: theme.error, fontSize: 13, marginTop: 12, marginBottom: 0, lineHeight: 1.4 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: 24,
              padding: '12px 16px',
              background: theme.brand,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13 }}>
          <Link to="/" style={{ color: theme.brand, textDecoration: 'none', fontWeight: 500 }}>
            ← Back to public dashboard
          </Link>
        </p>
      </div>
    </div>
  )
}

const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  background: theme.inputBg,
  border: `1px solid ${theme.border}`,
  borderRadius: 8,
  color: theme.text,
  fontSize: 14,
}

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const res = (err as { response?: { data?: { error?: string } } }).response
    if (res?.data?.error) return res.data.error
  }
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = (err as { code?: string }).code
    if (code === 'ERR_NETWORK' || code === 'ECONNREFUSED') {
      return 'Cannot reach the backend. Start it with: cd backend && npm run dev (port 5000).'
    }
  }
  return 'Login failed. Use username admin and check the backend is running.'
}
