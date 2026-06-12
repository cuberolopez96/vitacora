import React, { useEffect, useState } from 'react'
import { api } from './api'

export default function App() {
  const [habits, setHabits] = useState([])
  const [title, setTitle] = useState('')

  useEffect(() => { fetchHabits() }, [])

  async function fetchHabits() {
    const res = await api('/habits')
    setHabits(await res.json())
  }

  async function createHabit(e) {
    e.preventDefault()
    if (!title) return
    await api('/habits', { method: 'POST', body: JSON.stringify({ title }) })
    setTitle('')
    fetchHabits()
  }

  async function markToday(habitId) {
    await api(`/habits/${habitId}/entries`, { method: 'POST', body: JSON.stringify({}) })
    fetchHabits()
  }

  return (
    <div className="app">
      <h1>Vitacora (Sprint 1)</h1>
      <form onSubmit={createHabit}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Nuevo hábito" />
        <button>Crear</button>
      </form>
      <ul>
        {habits.map(h=> (
          <li key={h.id}>{h.title} <button onClick={()=>markToday(h.id)}>Marcar hoy</button></li>
        ))}
      </ul>
      <p className="note">Nota: interfaz mínima. Mejoras en Sprint 2.</p>
    </div>
  )
}
