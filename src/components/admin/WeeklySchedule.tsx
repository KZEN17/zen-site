'use client'
import { useState } from 'react'
import type { Employee, Shift, EmployeeRole } from '@/types/admin'
import { EMPLOYEE_ROLE_LABELS as ROLE_LABELS } from '@/types/admin'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

interface Props {
  employees: Employee[]
  shifts: Shift[]
  weekStart: string // ISO date of the Monday
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function fmtDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric',
  })
}

interface Modal {
  mode: 'add' | 'edit'
  employeeId: string
  employeeName: string
  date: string
  shift?: Shift
}

export default function WeeklySchedule({ employees: initEmployees, shifts: initShifts, weekStart: initWeekStart }: Props) {
  const [weekStart, setWeekStart] = useState(initWeekStart)
  const [shifts, setShifts] = useState<Shift[]>(initShifts)
  const [employees, setEmployees] = useState<Employee[]>(initEmployees)
  const [modal, setModal] = useState<Modal | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Employee form state
  const [showAddEmp, setShowAddEmp] = useState(false)
  const [deleteEmpId, setDeleteEmpId] = useState<string | null>(null)
  const [newEmpName, setNewEmpName] = useState('')
  const [newEmpRole, setNewEmpRole] = useState<EmployeeRole>('cleaner')

  // Shift modal state
  const [shiftStart, setShiftStart] = useState('08:00')
  const [shiftEnd, setShiftEnd] = useState('17:00')
  const [shiftNotes, setShiftNotes] = useState('')

  const weekDates = DAY_LABELS.map((_, i) => addDays(weekStart, i))

  async function loadWeek(newStart: string) {
    setLoading(true)
    try {
      const end = addDays(newStart, 6)
      const res = await fetch(`/api/admin/shifts?from=${newStart}&to=${end}`)
      const data = await res.json() as Shift[]
      setShifts(data)
      setWeekStart(newStart)
    } catch {
      setError('Failed to load shifts')
    } finally {
      setLoading(false)
    }
  }

  function prevWeek() { loadWeek(addDays(weekStart, -7)) }
  function nextWeek() { loadWeek(addDays(weekStart, 7)) }

  function getShift(employeeId: string, date: string) {
    return shifts.find(s => s.employee_id === employeeId && s.shift_date === date)
  }

  function openAdd(emp: Employee, date: string) {
    setShiftStart('08:00')
    setShiftEnd('17:00')
    setShiftNotes('')
    setModal({ mode: 'add', employeeId: emp.$id, employeeName: emp.name, date })
  }

  function openEdit(shift: Shift) {
    setShiftStart(shift.start_time)
    setShiftEnd(shift.end_time)
    setShiftNotes(shift.notes ?? '')
    setModal({ mode: 'edit', employeeId: shift.employee_id, employeeName: shift.employee_name, date: shift.shift_date, shift })
  }

  async function saveShift() {
    if (!modal) return
    setLoading(true)
    setError('')
    try {
      if (modal.mode === 'add') {
        const res = await fetch('/api/admin/shifts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employee_id: modal.employeeId,
            employee_name: modal.employeeName,
            shift_date: modal.date,
            start_time: shiftStart,
            end_time: shiftEnd,
            notes: shiftNotes || null,
          }),
        })
        const shift = await res.json() as Shift
        setShifts(prev => [...prev, shift])
      } else if (modal.shift) {
        const res = await fetch(`/api/admin/shifts/${modal.shift.$id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ start_time: shiftStart, end_time: shiftEnd, notes: shiftNotes || null }),
        })
        const updated = await res.json() as Shift
        setShifts(prev => prev.map(s => s.$id === updated.$id ? updated : s))
      }
      setModal(null)
    } catch {
      setError('Failed to save shift')
    } finally {
      setLoading(false)
    }
  }

  async function removeShift() {
    if (!modal?.shift) return
    setLoading(true)
    setError('')
    try {
      await fetch(`/api/admin/shifts/${modal.shift.$id}`, { method: 'DELETE' })
      setShifts(prev => prev.filter(s => s.$id !== modal.shift!.$id))
      setModal(null)
    } catch {
      setError('Failed to delete shift')
    } finally {
      setLoading(false)
    }
  }

  async function addEmployee() {
    if (!newEmpName.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newEmpName.trim(), role: newEmpRole }),
      })
      const emp = await res.json() as Employee
      setEmployees(prev => [...prev, emp])
      setNewEmpName('')
      setShowAddEmp(false)
    } catch {
      setError('Failed to add employee')
    } finally {
      setLoading(false)
    }
  }

  async function deleteEmployee(id: string) {
    setLoading(true)
    setError('')
    try {
      await fetch(`/api/admin/employees/${id}`, { method: 'DELETE' })
      setEmployees(prev => prev.filter(e => e.$id !== id))
      setShifts(prev => prev.filter(s => s.employee_id !== id))
      setDeleteEmpId(null)
    } catch {
      setError('Failed to delete employee')
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(emp: Employee) {
    try {
      const res = await fetch(`/api/admin/employees/${emp.$id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !emp.is_active }),
      })
      const updated = await res.json() as Employee
      setEmployees(prev => prev.map(e => e.$id === updated.$id ? updated : e))
    } catch {
      setError('Failed to update employee')
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Week navigation */}
      <div className="flex items-center gap-4">
        <button onClick={prevWeek} disabled={loading}
          className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm transition-colors disabled:opacity-50">
          ← Prev
        </button>
        <span className="font-semibold text-gray-900 min-w-[220px] text-center text-sm">
          {fmtDate(weekDates[0])} – {fmtDate(weekDates[6])}
        </span>
        <button onClick={nextWeek} disabled={loading}
          className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm transition-colors disabled:opacity-50">
          Next →
        </button>
      </div>

      {/* Schedule grid */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-36">Employee</th>
              {weekDates.map((date, i) => (
                <th key={date} className="text-center px-2 py-3 font-medium text-gray-600 min-w-[90px]">
                  <div>{DAY_LABELS[i]}</div>
                  <div className="text-xs font-normal text-gray-400">{fmtDate(date)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {employees.filter(e => e.is_active).map(emp => (
              <tr key={emp.$id} className="hover:bg-gray-50/50">
                <td className="px-4 py-2">
                  <div className="font-medium text-gray-900 truncate">{emp.name}</div>
                  <div className="text-xs text-gray-400">{ROLE_LABELS[emp.role]}</div>
                </td>
                {weekDates.map(date => {
                  const shift = getShift(emp.$id, date)
                  return (
                    <td key={date} className="px-2 py-2 text-center">
                      {shift ? (
                        <button
                          onClick={() => openEdit(shift)}
                          className="w-full bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs rounded-lg px-1.5 py-1.5 transition-colors"
                        >
                          {shift.start_time}–{shift.end_time}
                        </button>
                      ) : (
                        <button
                          onClick={() => openAdd(emp, date)}
                          className="w-full text-gray-300 hover:text-gray-500 hover:bg-gray-100 text-xs rounded-lg px-1.5 py-1.5 transition-colors"
                        >
                          +
                        </button>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
            {employees.filter(e => e.is_active).length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">
                  No active employees. Add one below.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Employees management */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Employees</h2>
          <button
            onClick={() => setShowAddEmp(v => !v)}
            className="text-sm text-amber-600 hover:text-amber-800 font-medium"
          >
            {showAddEmp ? 'Cancel' : '+ Add Employee'}
          </button>
        </div>

        {showAddEmp && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newEmpName}
              onChange={e => setNewEmpName(e.target.value)}
              placeholder="Employee name"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <select
              value={newEmpRole}
              onChange={e => setNewEmpRole(e.target.value as EmployeeRole)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {(Object.entries(ROLE_LABELS) as [EmployeeRole, string][]).map(([v, label]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
            <button
              onClick={addEmployee}
              disabled={loading}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              Save
            </button>
          </div>
        )}

        <div className="divide-y divide-gray-100">
          {employees.map(emp => (
            <div key={emp.$id} className="flex items-center justify-between py-2">
              <div>
                <span className={`text-sm font-medium ${emp.is_active ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                  {emp.name}
                </span>
                <span className="ml-2 text-xs text-gray-400">{ROLE_LABELS[emp.role]}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleActive(emp)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  {emp.is_active ? 'Deactivate' : 'Reactivate'}
                </button>
                <button
                  onClick={() => setDeleteEmpId(emp.$id)}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {employees.length === 0 && (
            <p className="py-3 text-sm text-gray-400">No employees yet.</p>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteEmpId}
        title="Delete Employee"
        message="This will permanently delete this employee and all their scheduled shifts. This cannot be undone."
        confirmLabel="Delete Permanently"
        danger
        onConfirm={() => deleteEmpId && deleteEmployee(deleteEmpId)}
        onCancel={() => setDeleteEmpId(null)}
      />

      {/* Shift modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">
              {modal.mode === 'add' ? 'Add Shift' : 'Edit Shift'}
            </h3>
            <p className="text-sm text-gray-500">
              {modal.employeeName} · {fmtDate(modal.date)}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start</label>
                <input type="time" value={shiftStart} onChange={e => setShiftStart(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End</label>
                <input type="time" value={shiftEnd} onChange={e => setShiftEnd(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
              <input type="text" value={shiftNotes} onChange={e => setShiftNotes(e.target.value)}
                placeholder="e.g. Half day"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={saveShift} disabled={loading}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50">
                {loading ? 'Saving…' : 'Save'}
              </button>
              {modal.mode === 'edit' && (
                <button onClick={removeShift} disabled={loading}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm rounded-lg transition-colors disabled:opacity-50">
                  Delete
                </button>
              )}
              <button onClick={() => setModal(null)}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
