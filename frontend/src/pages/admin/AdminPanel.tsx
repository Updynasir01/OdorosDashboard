import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../../contexts/AdminContext'
import {
  adminApi,
  type AdminAlert,
  type AdminFile,
  type AdminStats,
  type EnvStatus,
} from '../../services/adminApi'

type Tab = 'overview' | 'upload' | 'alerts' | 'files' | 'settings'

const theme = {
  bg: '#f3f4f6',
  surface: '#ffffff',
  card: '#ffffff',
  border: '#e5e7eb',
  brand: '#05556c',
  accent: '#05556c',
  text: '#111827',
  muted: '#6b7280',
  critical: '#dc2626',
  high: '#f97316',
  medium: '#fbb03b',
  low: '#10b981',
  activeNav: '#eef7f9',
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'upload', label: 'Upload Data' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'files', label: 'Files' },
  { id: 'settings', label: 'Settings' },
]

export default function AdminPanel() {
  const navigate = useNavigate()
  const { logout, username } = useAdmin()
  const [tab, setTab] = useState<Tab>('overview')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [files, setFiles] = useState<AdminFile[]>([])
  const [alerts, setAlerts] = useState<AdminAlert[]>([])
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadMsg, setUploadMsg] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [alertForm, setAlertForm] = useState({
    region: '',
    type: 'rainfall',
    severity: 'medium',
    message: '',
  })

  const showToast = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [s, f, a, e] = await Promise.all([
        adminApi.getStats(),
        adminApi.getFiles(),
        adminApi.getAlerts(),
        adminApi.getEnvStatus(),
      ])
      setStats(s)
      setFiles(f)
      setAlerts(a)
      setEnvStatus(e)
    } catch (err: unknown) {
      if (isUnauthorized(err)) {
        logout()
        navigate('/admin/login', { replace: true })
        return
      }
      showToast('Failed to load admin data', 'err')
    } finally {
      setLoading(false)
    }
  }, [logout, navigate, showToast])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const handleRefresh = async () => {
    try {
      await adminApi.triggerRefresh()
      showToast('API refresh triggered')
      await loadAll()
    } catch {
      showToast('Refresh failed', 'err')
    }
  }

  const handleUpload = async (file: File) => {
    setUploadMsg(null)
    setUploadProgress(0)
    try {
      await adminApi.uploadFile(file, setUploadProgress)
      setUploadMsg(`Uploaded ${file.name} successfully`)
      showToast('File uploaded')
      const f = await adminApi.getFiles()
      setFiles(f)
      const s = await adminApi.getStats()
      setStats(s)
    } catch (err: unknown) {
      const msg = apiError(err) || 'Upload failed'
      setUploadMsg(msg)
      showToast(msg, 'err')
    } finally {
      setUploadProgress(null)
    }
  }

  const handleCreateAlert = async () => {
    if (!alertForm.region.trim() || !alertForm.message.trim()) {
      showToast('Region and message are required', 'err')
      return
    }
    try {
      await adminApi.createAlert(alertForm)
      showToast('Alert published')
      setAlertForm({ region: '', type: 'rainfall', severity: 'medium', message: '' })
      const a = await adminApi.getAlerts()
      setAlerts(a)
      const s = await adminApi.getStats()
      setStats(s)
    } catch {
      showToast('Failed to create alert', 'err')
    }
  }

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.bg,
        color: theme.text,
        fontFamily: 'Arial, system-ui, sans-serif',
        display: 'flex',
      }}
    >
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          background: theme.surface,
          borderRight: `1px solid ${theme.border}`,
          padding: '20px 0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '0 20px 20px', borderBottom: `1px solid ${theme.border}` }}>
          <div
            style={{
              display: 'inline-block',
              padding: '6px 10px',
              borderRadius: 8,
              border: `1px solid ${theme.border}`,
              background: theme.surface,
            }}
          >
            <img src="/odoros-logo.png" alt="Odoros" style={{ height: 32, objectFit: 'contain' }} />
          </div>
          <p style={{ fontSize: 11, color: theme.muted, margin: '8px 0 0' }}>Admin Panel</p>
        </div>
        <nav style={{ flex: 1, paddingTop: 12 }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '12px 20px',
                border: 'none',
                background: tab === t.id ? theme.activeNav : 'transparent',
                color: tab === t.id ? theme.brand : theme.muted,
                fontSize: 14,
                cursor: 'pointer',
                borderLeft: tab === t.id ? `3px solid ${theme.brand}` : '3px solid transparent',
                fontWeight: tab === t.id ? 600 : 400,
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: `1px solid ${theme.border}` }}>
          <p style={{ fontSize: 12, color: theme.muted, margin: '0 0 8px' }}>{username}</p>
          <button
            type="button"
            onClick={() => {
              logout()
              navigate('/admin/login')
            }}
            style={{
              width: '100%',
              padding: '8px',
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              color: theme.muted,
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Log out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header
          style={{
            padding: '16px 28px',
            background: theme.surface,
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: theme.brand }}>
              {tabs.find((t) => t.id === tab)?.label}
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: theme.muted }}>{today}</p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            style={{
              padding: '10px 18px',
              background: theme.brand,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Refresh APIs
          </button>
        </header>

        <div style={{ padding: 28, flex: 1, overflow: 'auto' }}>
          {loading && tab === 'overview' ? (
            <p style={{ color: theme.muted }}>Loading…</p>
          ) : (
            <>
              {tab === 'overview' && stats && <OverviewTab stats={stats} alerts={alerts.slice(0, 5)} />}
              {tab === 'upload' && (
                <UploadTab
                  dragOver={dragOver}
                  setDragOver={setDragOver}
                  fileInputRef={fileInputRef}
                  uploadProgress={uploadProgress}
                  uploadMsg={uploadMsg}
                  onFile={handleUpload}
                />
              )}
              {tab === 'alerts' && (
                <AlertsTab
                  alerts={alerts}
                  form={alertForm}
                  setForm={setAlertForm}
                  onCreate={handleCreateAlert}
                  onDelete={async (id) => {
                    try {
                      await adminApi.deleteAlert(id)
                      showToast('Alert deleted')
                      setAlerts(await adminApi.getAlerts())
                    } catch {
                      showToast('Delete failed', 'err')
                    }
                  }}
                />
              )}
              {tab === 'files' && (
                <FilesTab
                  files={files}
                  onDelete={async (name) => {
                    try {
                      await adminApi.deleteFile(name)
                      showToast('File deleted')
                      setFiles(await adminApi.getFiles())
                    } catch {
                      showToast('Delete failed', 'err')
                    }
                  }}
                  goUpload={() => setTab('upload')}
                />
              )}
              {tab === 'settings' && envStatus && <SettingsTab env={envStatus} />}
            </>
          )}
        </div>
      </main>

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            padding: '12px 20px',
            borderRadius: 8,
            background: toast.type === 'ok' ? theme.brand : theme.critical,
            color: '#fff',
            fontSize: 14,
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            zIndex: 9999,
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  )
}

function OverviewTab({ stats, alerts }: { stats: AdminStats; alerts: AdminAlert[] }) {
  const cards = [
    { label: 'Total Regions', value: stats.totalRegions },
    { label: 'Active Alerts', value: stats.totalAlerts },
    { label: 'Critical Alerts', value: stats.criticalAlerts },
    { label: 'Files Uploaded', value: stats.filesUploaded },
  ]

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        {cards.map((c) => (
          <div key={c.label} style={cardStyle}>
            <p style={{ margin: 0, fontSize: 12, color: theme.muted }}>{c.label}</p>
            <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 700 }}>{c.value}</p>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 16, marginBottom: 12 }}>API Health Monitor</h2>
      <div style={{ display: 'grid', gap: 10, marginBottom: 28 }}>
        {stats.apiHealth.map((api) => (
          <div
            key={api.name}
            style={{
              ...cardStyle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
            }}
          >
            <span style={{ fontWeight: 600 }}>{api.name}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
              {api.online ? (
                <>
                  <span style={{ color: theme.low }}>● Online</span>
                  <span style={{ color: theme.muted }}>{api.latencyMs} ms</span>
                </>
              ) : (
                <span style={{ color: theme.critical }}>● Offline</span>
              )}
            </span>
          </div>
        ))}
      </div>

      {stats.lastUpdated && (
        <p style={{ fontSize: 12, color: theme.muted, marginBottom: 20 }}>
          Last data update: {new Date(stats.lastUpdated).toLocaleString()}
        </p>
      )}

      <h2 style={{ fontSize: 16, marginBottom: 12 }}>Recent Alerts</h2>
      {alerts.length === 0 ? (
        <p style={{ color: theme.muted }}>No alerts yet.</p>
      ) : (
        alerts.map((a) => <AlertRow key={a.id} alert={a} compact />)
      )}
    </div>
  )
}

function UploadTab({
  dragOver,
  setDragOver,
  fileInputRef,
  uploadProgress,
  uploadMsg,
  onFile,
}: {
  dragOver: boolean
  setDragOver: (v: boolean) => void
  fileInputRef: RefObject<HTMLInputElement>
  uploadProgress: number | null
  uploadMsg: string | null
  onFile: (f: File) => void
}) {
  const guide = [
    { type: 'CSV / Excel', use: 'Market prices, population data' },
    { type: 'GeoJSON', use: 'Flood polygons, admin boundaries' },
    { type: 'PDF', use: 'Situation reports' },
    { type: 'JSON', use: 'IPC food security data' },
    { type: 'Images', use: 'Maps and field photos' },
  ]

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          const f = e.dataTransfer.files[0]
          if (f) onFile(f)
        }}
        style={{
          border: `2px dashed ${dragOver ? theme.brand : theme.border}`,
          borderRadius: 12,
          padding: 48,
          textAlign: 'center',
          background: theme.bg,
          cursor: 'pointer',
          marginBottom: 20,
        }}
      >
        <p style={{ margin: 0, fontSize: 16 }}>Drag & drop a file here</p>
        <p style={{ margin: '8px 0 0', color: theme.muted, fontSize: 13 }}>or click to browse (max 50 MB)</p>
        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onFile(f)
            e.target.value = ''
          }}
        />
      </div>

      {uploadProgress !== null && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ height: 8, background: theme.border, borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${uploadProgress}%`,
                background: theme.brand,
                transition: 'width 0.2s',
              }}
            />
          </div>
          <p style={{ fontSize: 12, color: theme.muted, marginTop: 6 }}>{uploadProgress}%</p>
        </div>
      )}

      {uploadMsg && (
        <p style={{ color: uploadMsg.includes('success') ? theme.low : theme.critical, marginBottom: 20 }}>{uploadMsg}</p>
      )}

      <h2 style={{ fontSize: 16, marginBottom: 12 }}>Upload guide</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: theme.bg }}>
            <th style={thStyle}>File type</th>
            <th style={thStyle}>Use for</th>
          </tr>
        </thead>
        <tbody>
          {guide.map((row) => (
            <tr key={row.type}>
              <td style={tdStyle}>{row.type}</td>
              <td style={tdStyle}>{row.use}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AlertsTab({
  alerts,
  form,
  setForm,
  onCreate,
  onDelete,
}: {
  alerts: AdminAlert[]
  form: { region: string; type: string; severity: string; message: string }
  setForm: Dispatch<SetStateAction<{ region: string; type: string; severity: string; message: string }>>
  onCreate: () => void
  onDelete: (id: string) => void
}) {
  return (
    <div>
      <div style={{ ...cardStyle, marginBottom: 28, maxWidth: 560 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Create manual alert</h2>
        <Field label="Region">
          <input
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
            placeholder="e.g. Bay"
            style={fieldInput}
          />
        </Field>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <Field label="Type">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={fieldInput}>
              <option value="rainfall">Rainfall</option>
              <option value="vegetation">Vegetation</option>
              <option value="heat">Heat</option>
              <option value="water">Water</option>
            </select>
          </Field>
          <Field label="Severity">
            <select
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
              style={fieldInput}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </Field>
        </div>
        <Field label="Message">
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={3}
            style={{ ...fieldInput, resize: 'vertical' }}
          />
        </Field>
        <button type="button" onClick={onCreate} style={primaryBtn}>
          Publish alert
        </button>
      </div>

      <h2 style={{ fontSize: 16 }}>All alerts ({alerts.length})</h2>
      {alerts.map((a) => (
        <AlertRow key={a.id} alert={a} onDelete={() => onDelete(a.id)} />
      ))}
    </div>
  )
}

function FilesTab({
  files,
  onDelete,
  goUpload,
}: {
  files: AdminFile[]
  onDelete: (name: string) => void
  goUpload: () => void
}) {
  if (files.length === 0) {
    return (
      <div style={cardStyle}>
        <p style={{ color: theme.muted }}>No files uploaded yet.</p>
        <button type="button" onClick={goUpload} style={{ ...primaryBtn, marginTop: 12 }}>
          Go to Upload Data
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {files.map((f) => (
        <div key={f.filename} style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>{f.filename}</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: theme.muted }}>
              {(f.size / 1024).toFixed(1)} KB · {new Date(f.uploadedAt).toLocaleString()}
            </p>
          </div>
          <button type="button" onClick={() => onDelete(f.filename)} style={dangerBtn}>
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}

function SettingsTab({ env }: { env: EnvStatus }) {
  const rows = [
    { label: 'Harvest Portal API key', ok: env.harvestPortalKey },
    { label: 'NASA Bearer token', ok: env.nasaBearerToken },
    { label: 'MongoDB URI', ok: env.mongodbUri },
    { label: 'Admin username', ok: env.adminUsername },
    { label: 'Admin password', ok: env.adminPassword },
    { label: 'JWT secret', ok: env.adminJwtSecret },
  ]

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Environment status</h2>
        {rows.map((r) => (
          <div
            key={r.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: `1px solid ${theme.border}`,
              fontSize: 14,
            }}
          >
            <span>{r.label}</span>
            <span style={{ color: r.ok ? theme.low : theme.critical }}>{r.ok ? 'Configured' : 'Missing'}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          ...cardStyle,
          marginBottom: 16,
          borderLeft: `4px solid ${theme.high}`,
        }}
      >
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>NASA token expiry</p>
        <p style={{ margin: '8px 0 0', fontSize: 13, color: theme.muted }}>{env.nasaTokenExpiryWarning}</p>
      </div>

      <div style={{ ...cardStyle, borderLeft: `4px solid ${theme.brand}` }}>
        <p style={{ margin: 0, fontSize: 13, color: theme.muted }}>
          Store all credentials as environment variables on Render.com. Never commit secrets to Git.
        </p>
      </div>
    </div>
  )
}

function AlertRow({
  alert,
  compact,
  onDelete,
}: {
  alert: AdminAlert
  compact?: boolean
  onDelete?: () => void
}) {
  const color = severityColor(alert.severity)
  return (
    <div
      style={{
        ...cardStyle,
        display: 'flex',
        marginBottom: compact ? 8 : 12,
        padding: compact ? '10px 14px' : '14px 18px',
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 600 }}>
          {alert.region}{' '}
          <span style={{ fontSize: 11, color, textTransform: 'uppercase' }}>{alert.severity}</span>
        </p>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: theme.muted }}>{alert.message}</p>
        {!compact && (
          <p style={{ margin: '6px 0 0', fontSize: 11, color: theme.muted }}>
            {new Date(alert.date).toLocaleString()} · {alert.type}
          </p>
        )}
      </div>
      {onDelete && (
        <button type="button" onClick={onDelete} style={dangerBtn}>
          Delete
        </button>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: 12 }}>
      <label style={{ display: 'block', fontSize: 12, color: theme.muted, marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  )
}

function severityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return theme.critical
    case 'high':
      return theme.high
    case 'medium':
      return theme.medium
    default:
      return theme.low
  }
}

const cardStyle: CSSProperties = {
  background: theme.card,
  borderRadius: 10,
  padding: 20,
  border: `1px solid ${theme.border}`,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
}

const fieldInput: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  background: theme.surface,
  border: `1px solid ${theme.border}`,
  borderRadius: 8,
  color: theme.text,
  fontSize: 14,
}

const primaryBtn: CSSProperties = {
  marginTop: 16,
  padding: '10px 20px',
  background: theme.brand,
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 14,
}

const dangerBtn: CSSProperties = {
  padding: '6px 12px',
  background: 'transparent',
  border: `1px solid ${theme.critical}`,
  color: theme.critical,
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 12,
}

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  borderBottom: `1px solid ${theme.border}`,
}

const tdStyle: CSSProperties = {
  padding: '10px 12px',
  borderBottom: `1px solid ${theme.border}`,
}

function isUnauthorized(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'response' in err &&
    (err as { response?: { status?: number } }).response?.status === 401
  )
}

function apiError(err: unknown): string | null {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    return (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? null
  }
  return null
}
