import { useState } from 'react'
import './Login.css'

// Cargar usuarios desde variables de entorno
const loadUsersFromEnv = () => {
    const users = []

    // Cargar usuario 1
    const user1 = import.meta.env.VITE_AUTH_USER1
    if (user1) {
        const [username, password] = user1.split(':')
        if (username && password) {
            users.push({ username, password })
        }
    }

    // Cargar usuario 2
    const user2 = import.meta.env.VITE_AUTH_USER2
    if (user2) {
        const [username, password] = user2.split(':')
        if (username && password) {
            users.push({ username, password })
        }
    }

    // Si no hay usuarios en .env, usar valores por defecto (fallback)
    if (users.length === 0) {
        users.push({ username: 'admin', password: 'admin123' })
    }

    return users
}

const VALID_USERS = loadUsersFromEnv()

function Login({ onLogin }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')

        // Validar credenciales
        const user = VALID_USERS.find(
            u => u.username === username && u.password === password
        )

        if (user) {
            // Guardar sesión en localStorage
            localStorage.setItem('myFilmsUser', username)
            onLogin(username)
        } else {
            setError('Usuario o contraseña incorrectos')
        }
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <span className="material-symbols-rounded login-icon">movie</span>
                    <h1>MyFilms</h1>
                    <p>Inicia sesión para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Usuario</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Ingresa tu usuario"
                            autoFocus
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ingresa tu contraseña"
                            required
                        />
                    </div>

                    {error && (
                        <div className="login-error">
                            <span className="material-symbols-rounded">error</span>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="login-button">
                        <span className="material-symbols-rounded">login</span>
                        Iniciar Sesión
                    </button>
                </form>

                <div className="login-footer">
                    <p>Solo usuarios autorizados pueden acceder</p>
                </div>
            </div>
        </div>
    )
}

export default Login
