import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Home = (props) => {
  const { loggedIn, email, setEmail, setLoggedIn } = props
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const onButtonClick = () => {
    if (loggedIn) {
      setLoggedIn(false)
      setEmail('')
      setPassword('')
    } else {
      setLoggedIn(true)
      navigate('/dashboard') // o cualquier ruta protegida
    }
  }

  return (
    <div className="mainContainer">
      <div className="titleContainer">
        <h2>Welcome back!</h2>
      </div>
      <div>Sign in to continue using .....</div>

      {!loggedIn && (
        <div className="inputContainer">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      )}

      <div className="buttonContainer">
        <input
          className="inputButton"
          type="button"
          onClick={onButtonClick}
          value={loggedIn ? 'Log out' : 'Log in'}
        />
        {loggedIn && <div>Your email address is {email}</div>}
      </div>
    </div>
  )
}

export default Home
