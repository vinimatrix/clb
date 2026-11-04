/**
 * Lógica pura del estado global CLB (sin React).
 * createStoreLogic(initialState, persist=true) expone los mismos métodos
 * que consumen los componentes; AppContext solo lo envuelve en Context
 * y ejecuta la hidratación desde localStorage.
 */
import { simpleHash } from '../lib/hash.js'
import { save } from '../lib/storage.js'
import { buildSeed } from '../data/seed.js'

const SLICE_KEYS = {
  session: 'clb.session',
  registro: 'clb.registro',
  otp: 'clb.otp',
  users: 'clb.users',
  electores: 'clb.electores',
  comites: 'clb.comites',
  metricas: 'clb.metricas',
  tareas: 'clb.tareas',
  llamadas: 'clb.llamadas',
  incidencias: 'clb.incidencias',
  recinto: 'clb.recinto',
  permisos: 'clb.permisos',
}

const passwordOk = (pw) =>
  String(pw ?? '').length >= 8 && /[A-Z]/.test(pw)

function generarOtp5() {
  return String(Math.floor(10000 + Math.random() * 90000))
}

/** Generador JCE simulado, determinista por cédula. */
const NOMBRES_JCE = ['Rosa Esther', 'Juan', 'Altagracia', 'Pedro Luis', 'Yudelka', 'Francisco', 'Eridania', 'Víctor', 'Claritza', 'Ramón Antonio']
const APELLIDOS_JCE = ['Gómez Rosario', 'Pérez', 'Ferreiras Guzmán', 'De la Cruz', 'Polanco', 'Reyes Castillo', 'Encarnación', 'Núñez', 'Báez', 'Valdez']
const RECINTOS_JCE = ['Liceo Bernardo Pichardo', 'Escuela Juan Jiménez', 'Escuela Andrés Bello', 'Escuela Faustina Silva']
const MESAS_JCE = ['0012A', '0012B', '0012C', '0012D', '0012E', '0012F', '0018', '0005', '0014', '0011']

function hashNum(s) {
  let h = 0
  const str = String(s)
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export function createStoreLogic(initialState, persist = true) {
  let state = structuredClone(initialState)

  const commit = (next) => {
    state = next
    if (persist) {
      for (const [k, key] of Object.entries(SLICE_KEYS)) save(key, state[k])
    }
    return state
  }

  const api = {
    getState: () => state,

    // ——— Registro (borrador) ———
    iniciarRegistro(draft) {
      commit({ ...state, registro: { ...draft } })
    },
    actualizarRegistro(patch) {
      commit({ ...state, registro: { ...state.registro, ...patch } })
    },
    limpiarRegistro() {
      commit({ ...state, registro: null })
    },

    // ——— OTP ———
    generarOtp() {
      const code = generarOtp5()
      commit({ ...state, otp: { code, expiraEn: Date.now() + 120000 } })
      return code
    },
    validarOtp(code) {
      return !!state.otp && String(code) === state.otp.code
    },

    // ——— Cuentas y sesión ———
    registrarCuenta({ cedula, username, password, nombres, apellidos, telefono }) {
      const cedNorm = String(cedula ?? '').replace(/\D/g, '')
      const dup = state.users.some((u) => u.cedula.replace(/\D/g, '') === cedNorm)
      if (dup) return { ok: false, error: 'Esta cédula ya está registrada. Inicia sesión.' }
      const user = String(username ?? '').trim()
      if (user.length < 6) return { ok: false, error: 'Mínimo 6 caracteres' }
      if (state.users.some((u) => u.username.toLowerCase() === user.toLowerCase()))
        return { ok: false, error: 'Usuario no disponible' }
      if (!passwordOk(password)) return { ok: false, error: 'La contraseña no cumple las reglas' }
      const nueva = {
        cedula: cedNorm ? `${cedNorm.slice(0, 3)}-${cedNorm.slice(3, 10)}-${cedNorm.slice(10)}` : cedula,
        username: user,
        passwordHash: simpleHash(password),
        nombres: String(nombres ?? '').trim(),
        apellidos: String(apellidos ?? '').trim(),
        telefono: String(telefono ?? ''),
        role: 'Miembro',
        createdAt: new Date().toISOString(),
      }
      commit({ ...state, users: [...state.users, nueva] })
      return { ok: true }
    },

    login(cedula, password) {
      const cedNorm = String(cedula ?? '').replace(/\D/g, '')
      const user = state.users.find((u) => u.cedula.replace(/\D/g, '') === cedNorm)
      if (!user || user.passwordHash !== simpleHash(password ?? '')) {
        return { ok: false, error: 'Credenciales incorrectas' }
      }
      commit({
        ...state,
        session: { cedula: user.cedula, username: user.username, role: user.role, nombres: user.nombres, apellidos: user.apellidos },
      })
      return { ok: true }
    },

    logout() {
      commit({ ...state, session: null })
    },

    // ——— JCE simulado ———
    verificarCedula(cedula) {
      const digits = String(cedula ?? '').replace(/\D/g, '')
      const formateada = digits.length === 11 ? `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}` : cedula
      const known = state.electores.find((e) => e.cedula === formateada)
      if (known) {
        return {
          habilitado: true,
          datos: {
            nombres: known.nombres,
            apellidos: known.apellidos,
            edad: known.edad,
            recinto: known.recinto,
            mesa: known.mesa,
            orden: known.orden,
            circunscripcion: '01',
          },
        }
      }
      const h = hashNum(digits || formateada)
      return {
        habilitado: true,
        datos: {
          nombres: NOMBRES_JCE[h % NOMBRES_JCE.length],
          apellidos: APELLIDOS_JCE[(h >> 3) % APELLIDOS_JCE.length],
          edad: 18 + (h % 50),
          recinto: RECINTOS_JCE[(h >> 5) % RECINTOS_JCE.length],
          mesa: MESAS_JCE[(h >> 7) % MESAS_JCE.length],
          orden: 100 + (h % 700),
          circunscripcion: '01',
        },
      }
    },

    // ——— Electores ———
    addElector(data) {
      const username = state.session?.username ?? 'demo'
      const asignar = data.asignarA_mi !== false
      const elector = {
        id: crypto.randomUUID(),
        cedula: data.cedula,
        nombres: data.nombres,
        apellidos: data.apellidos,
        edad: data.edad ?? null,
        telefono: data.telefono ?? '',
        whatsapp: data.whatsapp ?? true,
        telefonoAlt: data.telefonoAlt ?? '',
        sector: data.sector ?? '',
        direccion: data.direccion ?? '',
        recinto: data.recinto ?? '',
        mesa: data.mesa ?? '',
        colegio: data.mesa ?? '',
        orden: data.orden ?? null,
        estado: data.estado ?? 'indeciso',
        cba: data.cba ?? '',
        celula: data.celula ?? '',
        movilizacionDiaD: data.movilizacionDiaD ?? false,
        nota: data.nota ?? '',
        asignadoA: asignar ? username : null,
        registradoPor: username,
        createdAt: new Date().toISOString(),
        intento: null,
        reconfirmadoAt: null,
      }
      const tareas = [...state.tareas]
      if (asignar && elector.estado !== 'fidelizado') {
        tareas.push({
          id: crypto.randomUUID(),
          electorId: elector.id,
          tipo: data.requiereVisita ? 'visita' : 'llamada',
          vencimiento: 'hoy',
          estado: 'pendiente',
        })
      }
      const metricas = {
        ...state.metricas,
        inscritos: state.metricas.inscritos + 1,
        fidelizados: state.metricas.fidelizados + (elector.estado === 'fidelizado' ? 1 : 0),
        fidelizadosCirc: state.metricas.fidelizadosCirc + (elector.estado === 'fidelizado' ? 1 : 0),
      }
      commit({ ...state, electores: [elector, ...state.electores], tareas, metricas })
      return elector
    },

    tipificarElector(electorId, intento) {
      const electores = state.electores.map((e) => {
        if (e.id !== electorId) return e
        const subeAFidelizado = intento.intencion === 'voto-seguro' && e.estado !== 'fidelizado'
        return {
          ...e,
          estado: subeAFidelizado ? 'fidelizado' : e.estado,
          intento: { ...intento, tipificadoAt: new Date().toISOString() },
        }
      })
      const objetivo = state.electores.find((e) => e.id === electorId)
      const sube = objetivo && intento.intencion === 'voto-seguro' && objetivo.estado !== 'fidelizado'
      const metricas = {
        ...state.metricas,
        fidelizados: state.metricas.fidelizados + (sube ? 1 : 0),
        fidelizadosCirc: state.metricas.fidelizadosCirc + (sube ? 1 : 0),
        votoSeguroCirc: state.metricas.votoSeguroCirc + (sube ? 1 : 0),
      }
      const llamadas = {
        ...state.llamadas,
        completadasHoy: state.llamadas.completadasHoy + 1,
        historial: [...state.llamadas.historial, { electorId, at: new Date().toISOString(), ...intento }],
      }
      commit({ ...state, electores, metricas, llamadas })
    },

    reconfirmarFidelizado(electorId) {
      commit({
        ...state,
        electores: state.electores.map((e) =>
          e.id === electorId ? { ...e, reconfirmadoAt: new Date().toISOString() } : e,
        ),
      })
    },

    // ——— Tareas / incidencias / comités ———
    completarTarea(tareaId) {
      commit({
        ...state,
        tareas: state.tareas.map((t) => (t.id === tareaId ? { ...t, estado: 'completada' } : t)),
      })
    },

    reportarIncidencia({ colegio, texto }) {
      commit({
        ...state,
        incidencias: [{ id: crypto.randomUUID(), colegio, texto, fecha: new Date().toISOString() }, ...state.incidencias],
      })
    },

    addComite(tipo, data) {
      const existentes = state.comites.filter((c) => c.tipo === tipo)
      const maxNum = existentes.reduce((m, c) => {
        const n = parseInt(String(c.codigo).replace(/\D/g, ''), 10)
        return Number.isFinite(n) ? Math.max(m, n) : m
      }, 0)
      const codigo = `${tipo}-${String(maxNum + 1).padStart(3, '0')}`
      const comite = {
        id: crypto.randomUUID(),
        tipo,
        codigo,
        nombre: data.nombre,
        lider: data.lider,
        cedulaLider: data.cedulaLider ?? '',
        sector: data.sector ?? '',
        recinto: data.recinto ?? '',
        mesa: data.mesa ?? '',
        estado: 'proceso',
        votos: '0 de 0 Votos Seguros',
        integrantes: 1,
        telefono: data.telefono ?? '',
        delegados: tipo === 'CBE' ? { titular: data.delegadoTitular ?? '', suplente: data.delegadoSuplente ?? 'Sin Designar' } : null,
        votoComprometido: tipo === 'CBE' ? { actual: 0, meta: 0 } : null,
      }
      commit({ ...state, comites: [comite, ...state.comites] })
      return comite
    },

    asignarSuplente(comiteId, nombre) {
      commit({
        ...state,
        comites: state.comites.map((c) =>
          c.id === comiteId && c.tipo === 'CBE'
            ? { ...c, delegados: { ...c.delegados, suplente: nombre }, estado: 'blindado' }
            : c,
        ),
      })
    },

    resetDemo() {
      const seed = buildSeed()
      commit({ ...seed, users: state.users, session: null, registro: null, otp: null })
    },

    // ——— Permisos y Roles ———
    actualizarPermiso(rol, modulo, valor) {
      const permisos = {
        ...state.permisos,
        [rol]: { ...state.permisos[rol], [modulo]: valor },
      }
      commit({ ...state, permisos })
    },

    tienePermiso(modulo, roleOverride) {
      const role = roleOverride ?? state.session?.role ?? 'dirigente'
      const mappedRole = role === 'Miembro' ? 'dirigente' : role
      return state.permisos?.[mappedRole]?.[modulo] ?? false
    },
  }

  return api
}
