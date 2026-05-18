import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'

const AuthContext = createContext(null)

const today = new Date().toISOString().slice(0, 10)

const statusLabels = {
  agendada: 'Agendada',
  realizada: 'Realizada',
  ausente: 'Ausente',
}

const statusTone = {
  agendada: 'info',
  realizada: 'success',
  ausente: 'warning',
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.erro || data?.message || 'Não foi possível concluir a operação.')
  }

  return data
}

function formatDate(value) {
  if (!value) return ''

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`))
}

function formatTime(value) {
  return value?.slice(11, 16) || '--:--'
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    request('/api/auth/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, senha) {
    const medico = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    })
    setUser(medico)
    return medico
  }

  async function logout() {
    await request('/api/auth/logout', { method: 'POST' }).catch(() => null)
    setUser(null)
  }

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth() {
  return useContext(AuthContext)
}

function ProtectedRoute({ children }) {
  const { loading, user } = useAuth()

  if (loading) {
    return (
      <main className="center-screen">
        <div className="loader" aria-label="Carregando" />
      </main>
    )
  }

  return user ? children : <Navigate to="/" replace />
}

function AppShell({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (!user) return children

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  const links = [
    { to: '/dashboard', label: 'Painel', icon: '⌂' },
    { to: '/agenda', label: 'Agenda', icon: '□' },
    { to: '/ausencia', label: 'Ausência', icon: '!' },
  ]

  return (
    <div className="app-frame">
      <aside className="sidebar" aria-label="Navegação principal">
        <Link className="brand" to="/dashboard">
          <span className="brand-mark">AM</span>
          <span>
            <strong>Ausência Médica</strong>
            <small>Comunicação automática</small>
          </span>
        </Link>

        <nav className="nav-list">
          {links.map((item) => (
            <Link
              className={location.pathname === item.to ? 'nav-item active' : 'nav-item'}
              key={item.to}
              to={item.to}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="doctor-card">
          <span className="avatar">{user.nome?.slice(0, 1) || 'M'}</span>
          <div>
            <strong>{user.nome}</strong>
            <small>{user.crm || 'Sessão ativa'}</small>
          </div>
        </div>

        <button className="ghost-button" type="button" onClick={handleLogout}>
          Sair
        </button>
      </aside>

      <div className="workspace">{children}</div>
    </div>
  )
}

function Login() {
  const { login, user, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) return <Navigate to="/dashboard" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !senha.trim()) {
      setError('Informe e-mail e senha para continuar.')
      return
    }

    setSubmitting(true)
    try {
      await login(email.trim(), senha)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-copy">
        <span className="eyebrow">PoC Grupo 31</span>
        <h1>Aplicativo de Comunicação para Ausência Médica</h1>
        <p>
          Registre ausências, identifique pacientes impactados e dispare a comunicação da clínica
          sem depender de controles manuais.
        </p>
        <div className="benefit-row" aria-label="Benefícios do sistema">
          <span>Agenda integrada</span>
          <span>Notificação rápida</span>
          <span>Menos falhas</span>
        </div>
      </section>

      <form className="login-panel" onSubmit={handleSubmit}>
        <div>
          <span className="eyebrow">Acesso médico</span>
          <h2>Entrar no sistema</h2>
        </div>

        <label>
          E-mail
          <input
            autoComplete="email"
            disabled={submitting}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </label>

        <label>
          Senha
          <input
            autoComplete="current-password"
            disabled={submitting}
            onChange={(event) => setSenha(event.target.value)}
            type="password"
            value={senha}
          />
        </label>

        {error && <p className="alert error">{error}</p>}

        <button className="primary-button" disabled={submitting} type="submit">
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}

function PageHeader({ eyebrow, title, description, action }) {
  return (
    <header className="page-header">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  )
}

function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  )
}

function AppointmentList({ appointments, selectable = false, selectedIds = [], onToggle }) {
  if (!appointments.length) {
    return <EmptyState title="Nenhuma consulta encontrada" text="Escolha outra data para consultar." />
  }

  return (
    <div className="appointment-list">
      {appointments.map((appointment) => {
        const checked = selectedIds.includes(appointment.id)
        const disabled = appointment.status !== 'agendada'

        return (
          <label
            className={checked ? 'appointment-row selected' : 'appointment-row'}
            key={appointment.id}
          >
            {selectable && (
              <input
                checked={checked}
                disabled={disabled}
                onChange={() => onToggle(appointment.id)}
                type="checkbox"
              />
            )}
            <span className="time-block">{formatTime(appointment.data_hora)}</span>
            <span className="patient-block">
              <strong>{appointment.paciente_nome}</strong>
              <small>{appointment.paciente_telefone || 'Telefone não informado'}</small>
            </span>
            <span className={`status-pill ${statusTone[appointment.status] || 'info'}`}>
              {statusLabels[appointment.status] || appointment.status}
            </span>
          </label>
        )
      })}
    </div>
  )
}

function useAppointments(date) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadAppointments = useCallback(async (targetDate = date) => {
    if (!targetDate) return

    setLoading(true)
    setError('')
    try {
      const data = await request(`/api/consultas?data=${targetDate}`)
      setAppointments(Array.isArray(data) ? data : [])
    } catch (err) {
      setAppointments([])
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => {
    loadAppointments(date)
  }, [date, loadAppointments])

  return { appointments, loading, error, reload: loadAppointments, setAppointments }
}

function Dashboard() {
  const { appointments, loading, error } = useAppointments(today)
  const totalScheduled = appointments.filter((item) => item.status === 'agendada').length
  const totalAbsent = appointments.filter((item) => item.status === 'ausente').length
  const nextAppointment = appointments.find((item) => item.status === 'agendada')

  return (
    <main className="content">
      <PageHeader
        description="Visão rápida das consultas do dia e dos pacientes que podem ser impactados por uma ausência."
        eyebrow={formatDate(today)}
        title="Painel do médico"
      />

      <section className="metric-grid" aria-label="Resumo da agenda">
        <article className="metric-card">
          <span>Consultas hoje</span>
          <strong>{appointments.length}</strong>
        </article>
        <article className="metric-card">
          <span>Agendadas</span>
          <strong>{totalScheduled}</strong>
        </article>
        <article className="metric-card">
          <span>Ausências registradas</span>
          <strong>{totalAbsent}</strong>
        </article>
      </section>

      <section className="split-grid">
        <article className="panel">
          <div className="panel-heading">
            <h2>Agenda de hoje</h2>
            {loading && <span className="muted">Atualizando...</span>}
          </div>
          {error ? <p className="alert error">{error}</p> : <AppointmentList appointments={appointments} />}
        </article>

        <article className="panel highlight-panel">
          <span className="eyebrow">Próxima consulta</span>
          {nextAppointment ? (
            <>
              <h2>{formatTime(nextAppointment.data_hora)}</h2>
              <p>{nextAppointment.paciente_nome}</p>
              <small>{nextAppointment.paciente_telefone || 'Telefone não informado'}</small>
            </>
          ) : (
            <>
              <h2>Agenda livre</h2>
              <p>Não há consultas agendadas pendentes para hoje.</p>
            </>
          )}
          <Link className="primary-button inline-action" to="/ausencia">
            Registrar ausência
          </Link>
        </article>
      </section>
    </main>
  )
}

function Agenda() {
  const [date, setDate] = useState(today)
  const { appointments, loading, error, reload } = useAppointments(date)

  function handleSubmit(event) {
    event.preventDefault()
    reload(date)
  }

  return (
    <main className="content">
      <PageHeader
        action={
          <form className="date-form" onSubmit={handleSubmit}>
            <input onChange={(event) => setDate(event.target.value)} type="date" value={date} />
            <button className="secondary-button" disabled={loading} type="submit">
              Buscar
            </button>
          </form>
        }
        description="Consulte os horários marcados e acompanhe o status das consultas por dia."
        eyebrow="Consulta de agenda"
        title="Agenda"
      />

      <section className="panel">
        <div className="panel-heading">
          <h2>{formatDate(date)}</h2>
          {loading && <span className="muted">Carregando...</span>}
        </div>
        {error ? <p className="alert error">{error}</p> : <AppointmentList appointments={appointments} />}
      </section>
    </main>
  )
}

function RegistrarAusencia() {
  const [date, setDate] = useState(today)
  const [selectedIds, setSelectedIds] = useState([])
  const [feedback, setFeedback] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { appointments, loading, error, reload } = useAppointments(date)

  const scheduledAppointments = appointments.filter((item) => item.status === 'agendada')

  useEffect(() => {
    setSelectedIds([])
    setFeedback(null)
  }, [date])

  function toggleAppointment(id) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  function selectAll() {
    setSelectedIds(scheduledAppointments.map((item) => item.id))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!selectedIds.length) {
      setFeedback({ type: 'error', text: 'Selecione pelo menos uma consulta agendada.' })
      return
    }

    setSubmitting(true)
    setFeedback(null)
    try {
      const data = await request('/api/ausencias', {
        method: 'POST',
        body: JSON.stringify({ consulta_ids: selectedIds }),
      })
      setFeedback({
        type: 'success',
        text: data.mensagem || 'Ausência registrada e pacientes notificados.',
      })
      setSelectedIds([])
      await reload(date)
    } catch (err) {
      setFeedback({ type: 'error', text: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="content">
      <PageHeader
        action={
          <form className="date-form" onSubmit={(event) => event.preventDefault()}>
            <input onChange={(event) => setDate(event.target.value)} type="date" value={date} />
          </form>
        }
        description="Escolha a data, selecione as consultas afetadas e registre a ausência para acionar a comunicação."
        eyebrow="Fluxo principal do MVP"
        title="Registrar ausência médica"
      />

      <section className="split-grid wide-left">
        <form className="panel" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <div>
              <h2>Consultas afetadas</h2>
              <p className="muted">{formatDate(date)}</p>
            </div>
            <button
              className="secondary-button"
              disabled={!scheduledAppointments.length}
              onClick={selectAll}
              type="button"
            >
              Selecionar agendadas
            </button>
          </div>

          {loading && <p className="muted">Carregando consultas...</p>}
          {error && <p className="alert error">{error}</p>}
          {!loading && !error && (
            <AppointmentList
              appointments={appointments}
              onToggle={toggleAppointment}
              selectable
              selectedIds={selectedIds}
            />
          )}

          {feedback && <p className={`alert ${feedback.type}`}>{feedback.text}</p>}

          <button className="primary-button" disabled={submitting || !selectedIds.length} type="submit">
            {submitting ? 'Registrando...' : `Registrar ${selectedIds.length} ausência(s)`}
          </button>
        </form>

        <aside className="panel process-panel">
          <span className="eyebrow">O que acontece depois</span>
          <ol className="process-list">
            <li>
              <strong>Agenda consultada</strong>
              <span>O sistema valida se as consultas pertencem ao médico logado.</span>
            </li>
            <li>
              <strong>Status atualizado</strong>
              <span>As consultas selecionadas passam de agendada para ausente.</span>
            </li>
            <li>
              <strong>Pacientes notificados</strong>
              <span>A PoC simula a mensagem automática no console da API.</span>
            </li>
          </ol>
        </aside>
      </section>
    </main>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agenda"
            element={
              <ProtectedRoute>
                <Agenda />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ausencia"
            element={
              <ProtectedRoute>
                <RegistrarAusencia />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </AuthProvider>
  )
}

export default App
