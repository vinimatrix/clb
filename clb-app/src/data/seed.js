/**
 * Semilla de datos demo de CLB App, fiel a los mocks de Stitch.
 * Ids estables para el seed; crypto.randomUUID() solo para entidades
 * creadas en runtime (ver store/AppContext).
 */
import { simpleHash } from '../lib/hash.js'

const RECINTOS = {
  pichardo: 'Liceo Bernardo Pichardo',
  jimenez: 'Escuela Juan Jiménez',
  bello: 'Escuela Andrés Bello',
  faustina: 'Escuela Faustina Silva',
  rosaduarte: 'Escuela Rosa Duarte',
  laschinas: 'Recinto Las Chinas',
}

const MESAS = ['0012A', '0012B', '0012C', '0012D', '0012E', '0012F', '0018', '0005', '0014', '0011']
const CBAS = ['CBA-04 Ondina Sur', 'CBA-05 Las Malvinas', 'CBA-08 Bella Vista']
const SECTORES = ['Barrio Ondina', 'Las Malvinas', 'Bella Vista', 'Los Jardines', 'Sabana de la Mar', 'El Prado']

const NOMBRES = [
  'Rosa Esther', 'Manuel', 'Yocasta', 'Darío', 'Marcos Aurelio', 'Dania Mercedes',
  'José Ramón', 'Ramona Altagracia', 'Mercedes Altagracia', 'Carlos Manuel',
  'Yessica Altagracia', 'Carmen Rosa', 'Francisco', 'Altagracia', 'Pedro Luis',
  'Ana Mercedes', 'Rafael', 'Elena', 'Julio César', 'Miguelina', 'Antonio',
  'Wanda', 'Víctor', 'Félix', 'Noel', 'Eridania', 'Pedro', 'Sonia', 'Wilkin',
  'Yudelka', 'Elpidio', 'Claritza', 'Ramón', 'Juana', 'Diógenes', 'Nelson',
  'Isidra', 'Leandro', 'Perpetua', 'Sixto', 'Bienvenido', 'Waleska', 'Radhamés', 'Iris',
]
const APELLIDOS = [
  'Gómez Rosario', 'Ramírez Santana', 'Lorenzo Peña', 'Castillo Mercedes',
  'Peguero', 'Rosario Díaz', 'Castillo', 'Santana', 'Peña', 'Mota Peña',
  'Altagracia Silvestre', 'Ferreiras', 'De la Cruz', 'Polanco', 'Guzmán',
  'Reyes', 'Encarnación', 'Mateo', 'Núñez', 'Báez', 'Suárez', 'Then',
  'Valdez', 'Contreras', 'Abreu', 'Ureña', 'Pujols', 'Soriano', 'Kelly',
  'Bonilla', 'Lora', 'Minaya', 'Farrullo', 'Cordero', 'Alejo', 'Cuello',
  'Reyes Castillo', 'Morillo', 'Peralta', 'Nivar', 'Escoto', 'Caba', 'Vólquez', 'Lachapelle',
]

function telefono(i) {
  const pref = ['829', '809', '849'][i % 3]
  const mid = String(100 + ((i * 37) % 900))
  const fin = String(1000 + ((i * 173) % 9000))
  return `${pref}-${mid}-${fin}`
}

function cedulaUnica(i) {
  const pref = ['001', '026', '027', '031', '047', '054', '402'][i % 7]
  const mid = String(1000000 + i * 137).slice(0, 7)
  const fin = (i * 3 + 1) % 10
  return `${pref}-${mid}-${fin}`
}

function fechaHoy(i) {
  const d = new Date()
  d.setHours(7, 15 + (i % 45), 0, 0)
  return d.toISOString()
}

function elector(i, overrides = {}) {
  const nombres = NOMBRES[i % NOMBRES.length]
  const apellidos = APELLIDOS[i % APELLIDOS.length]
  return {
    id: `e${i + 1}`,
    cedula: cedulaUnica(i + 10),
    nombres,
    apellidos,
    edad: 18 + ((i * 7) % 52),
    telefono: telefono(i + 3),
    whatsapp: i % 9 !== 4,
    sector: SECTORES[i % SECTORES.length],
    direccion: `Calle ${['Duarte', 'Mella', 'Sánchez', 'Luperón'][i % 4]} #${10 + ((i * 13) % 90)}`,
    recinto: Object.values(RECINTOS)[i % 6],
    mesa: MESAS[i % MESAS.length],
    orden: 40 + ((i * 29) % 800),
    estado: 'fidelizado',
    cba: CBAS[i % CBAS.length],
    celula: `Manzana ${['A', 'B', 'C', 'F'][i % 4]}`,
    movilizacionDiaD: i % 4 === 0,
    asignadoA: 'demo',
    registradoPor: 'demo',
    createdAt: fechaHoy(i),
    intento: null,
    reconfirmadoAt: null,
    ...overrides,
  }
}

export function buildSeed() {
  // 12 electores destacados de los mocks (cédulas únicas).
  const destacados = [
    elector(0, {
      nombres: 'Carmen Rosa', apellidos: 'Altagracia Silvestre', cedula: '027-0056192-0',
      edad: 42, sector: 'Las Malvinas', recinto: RECINTOS.pichardo, mesa: '0012B', orden: 140,
      cba: 'CBA-05 Las Malvinas', movilizacionDiaD: true,
    }),
    elector(1, {
      nombres: 'Rosa Esther', apellidos: 'Gómez Rosario', cedula: '001-0982341-2',
      edad: 35, sector: 'Barrio Ondina', recinto: RECINTOS.pichardo, mesa: '0012A', orden: 184,
      cba: 'CBA-04 Ondina Sur',
    }),
    elector(2, {
      nombres: 'Manuel', apellidos: 'Ramírez Santana', cedula: '026-0045129-8',
      recinto: RECINTOS.pichardo, mesa: '0012A', orden: 88, cba: 'CBA-04 Ondina Sur',
    }),
    elector(3, {
      nombres: 'Yocasta', apellidos: 'Lorenzo Peña', cedula: '001-1478523-9',
      estado: 'simpatizante', recinto: RECINTOS.rosaduarte, mesa: '0018', orden: 104,
      cba: 'CBA-08 Bella Vista',
    }),
    elector(4, {
      nombres: 'Darío', apellidos: 'Castillo Mercedes', cedula: '026-0091823-1',
      recinto: RECINTOS.laschinas, mesa: '0014', orden: 210,
    }),
    elector(5, {
      nombres: 'Marcos Aurelio', apellidos: 'Peguero', cedula: '027-0038912-4',
      recinto: RECINTOS.pichardo, mesa: '0012A', orden: 88, cba: 'CBA-04 Ondina Sur',
    }),
    elector(6, {
      nombres: 'Dania Mercedes', apellidos: 'Rosario', cedula: '001-0982341-3',
      edad: 24, recinto: RECINTOS.jimenez, mesa: '0018', orden: 104,
      nota: 'Confirmó transporte para las 9:00 AM el Día D',
    }),
    elector(7, {
      nombres: 'José Ramón', apellidos: 'Castillo', cedula: '027-0045129-8',
      estado: 'simpatizante', sector: 'Las Malvinas', recinto: RECINTOS.pichardo,
      mesa: '0012C', orden: 77, direccion: 'Calle Duarte #42',
    }),
    elector(8, {
      nombres: 'Ramona Altagracia', apellidos: 'Santana', cedula: '027-0019284-3',
      estado: 'indeciso', nota: 'Interés clave: becas técnicas y emprendimiento femenino',
    }),
    elector(9, {
      nombres: 'Mercedes Altagracia', apellidos: 'Peña', cedula: '027-0019284-5',
      edad: 34, recinto: RECINTOS.pichardo, mesa: '0012A', orden: 42, cba: 'CBA-04 Ondina Sur',
      movilizacionDiaD: false,
    }),
    elector(10, {
      nombres: 'Carlos Manuel', apellidos: 'Rosario Díaz', cedula: '027-0045129-9',
      edad: 48, recinto: RECINTOS.jimenez, mesa: '0018', orden: 115, movilizacionDiaD: true,
    }),
    elector(11, {
      nombres: 'Yessica Altagracia', apellidos: 'Mota Peña', cedula: '027-0028491-3',
      edad: 33, recinto: RECINTOS.pichardo, mesa: '0012B', orden: 66,
      nota: 'Líder de manzana: 5 familiares asignados',
    }),
  ]
  // Estados de los destacados: 9 fidelizado + 2 simpatizante + 1 indeciso (ya fijados arriba).

  // 24 generados asignados a demo: 19 fidelizado + 4 indeciso + 1 simpatizante.
  const generadosAsignados = []
  for (let i = 0; i < 24; i++) {
    const estado = i < 19 ? 'fidelizado' : i < 23 ? 'indeciso' : 'simpatizante'
    generadosAsignados.push(elector(12 + i, { estado }))
  }

  // 8 no asignados: 2 inscritos hoy por demo (sin asignar) + 6 históricos del sistema.
  const noAsignados = []
  for (let i = 0; i < 8; i++) {
    const reciente = i < 2
    const e = elector(36 + i, {
      asignadoA: null,
      registradoPor: reciente ? 'demo' : 'sistema',
    })
    if (!reciente) e.createdAt = new Date(Date.now() - (i + 3) * 86400000).toISOString()
    noAsignados.push(e)
  }

  const electores = [...destacados, ...generadosAsignados, ...noAsignados]

  const porId = Object.fromEntries(electores.map((e) => [e.id, e]))
  const tarea = (n, tipo, elector) => ({
    id: `t${n}`,
    electorId: elector.id,
    tipo,
    vencimiento: 'hoy',
    estado: 'pendiente',
  })
  const tareas = [
    tarea(1, 'llamada', porId['e6']), // Marcos Aurelio — compromiso familiar
    tarea(2, 'llamada', porId['e4']), // Yocasta
    tarea(3, 'llamada', porId['e13']),
    tarea(4, 'llamada', porId['e14']),
    tarea(5, 'llamada', porId['e15']),
    tarea(6, 'visita', porId['e8']), // José Ramón — comercio local
    tarea(7, 'visita', porId['e9']), // Ramona — indecisa a visitar
    tarea(8, 'visita', porId['e16']),
  ]

  const cba = (n, codigo, nombre, lider, cedulaLider, sector, recinto, estado, votos, integrantes, extra = {}) => ({
    id: `cba-${n}`, tipo: 'CBA', codigo: `CBA-${codigo}`, nombre, lider, cedulaLider,
    sector, recinto, estado, votos, integrantes, telefono: telefono(codigo.length + 4),
    delegados: null, votoComprometido: null, ...extra,
  })
  const cbe = (n, codigo, nombre, presidente, cedulaLider, recinto, mesa, padron, titular, suplente, estado, voto, extra = {}) => ({
    id: `cbe-${n}`, tipo: 'CBE', codigo: `CBE-${codigo}`, nombre, lider: presidente, cedulaLider,
    sector: 'Hato Mayor', recinto, mesa, padron, estado,
    delegados: { titular, suplente }, votoComprometido: voto,
    integrantes: 6, telefono: telefono(codigo.length + 7), ...extra,
  })

  const comites = [
    cba(1, '048', 'Familia Peña Mota', 'Yessica A. Mota Peña', '027-0028491-3', 'Las Malvinas',
      `${RECINTOS.pichardo} (Mesa 0041)`, 'blindado', '8 de 8 Votos Seguros', 8),
    cba(2, '012', 'Familia Barceló HM', 'Ramón Antonio Castillo', '027-0019284-8', 'Barrio Ondina',
      `${RECINTOS.jimenez} (Mesa 0018)`, 'proceso', '5 Votos Seguros • 1 Simpatizante', 6),
    cba(3, '091', 'Núcleo Sabana Sur', 'Deyanira M. Silvestre', '027-0056192-0', 'Sabana de la Mar',
      RECINTOS.bello, 'prioridad', '4 Seguros • 3 Seguimiento', 7,
      { alerta: 'Pendiente reconfirmar ruta de transporte para el Día D antes del viernes.' }),
    cba(4, '020', 'Familia Núñez', 'Altagracia Núñez', cedulaUnica(61), 'Bella Vista',
      RECINTOS.bello, 'blindado', '6 de 6 Votos Seguros', 6),
    cba(5, '033', 'Célula Los Jardines', 'Francisco Polanco', cedulaUnica(62), 'Los Jardines',
      RECINTOS.faustina, 'blindado', '7 de 7 Votos Seguros', 7),
    cba(6, '077', 'Familia Reyes', 'Elena Reyes', cedulaUnica(63), 'El Prado',
      RECINTOS.jimenez, 'blindado', '6 de 6 Votos Seguros', 6),
    cbe(1, '014', 'Comité Pedro Santana', 'Dr. Franklin Mercedes', '027-0019284-3',
      RECINTOS.pichardo, '0012A', 450, 'Marcos Peña', 'Rosa Gómez', 'blindado',
      { actual: 58, meta: 60 }),
    cbe(2, '028', 'Comité Gregorio Luperón', 'Lic. Mariana Sosa', '027-0044512-4',
      RECINTOS.jimenez, '0018', 512, 'Yomaly Santana', 'Sin Designar', 'falta-suplente',
      { actual: 44, meta: 55 }),
    cbe(3, '042', 'Comité Duarte Centro', 'Edwin Rodríguez Peña', '027-0056192-0',
      RECINTOS.bello, '0005', 390, 'Carlos Rijo', 'Elena Peguero', 'blindado',
      { actual: 52, meta: 50 }),
  ]
  const codigosCbe = ['003', '007', '015', '021', '026', '030', '034', '041', '051']
  codigosCbe.forEach((cod, i) => {
    // Distribución del mock: 9 blindados / 2 falta-suplente / 1 por validar (12 en total).
    const estado = i === 1 ? 'falta-suplente' : i === 2 ? 'por-validar' : 'blindado'
    comites.push(
      cbe(4 + i, cod, `Comité ${SECTORES[(i + 2) % SECTORES.length]}`, `Pres. ${NOMBRES[(i + 13) % NOMBRES.length]} ${APELLIDOS[(i + 5) % APELLIDOS.length]}`,
        cedulaUnica(70 + i), Object.values(RECINTOS)[i % 6], MESAS[(i + 3) % MESAS.length],
        380 + i * 15, `Del. ${APELLIDOS[(i + 2) % APELLIDOS.length]}`, i === 1 ? 'Sin Designar' : `Sup. ${NOMBRES[(i + 8) % NOMBRES.length]}`,
        estado, { actual: 40 + i, meta: 45 + i }),
    )
  })

  return {
    users: [
      {
        cedula: '402-1234567-8',
        username: 'clbarcelo2026',
        passwordHash: simpleHash('ClbSegura2026@'),
        nombres: 'Juan',
        apellidos: 'Pérez',
        telefono: '829-450-8912',
        role: 'Dirigente',
        createdAt: new Date().toISOString(),
      },
      {
        cedula: '402-1234567-9',
        username: 'coord2026',
        passwordHash: simpleHash('ClbSegura2026@'),
        nombres: 'Ana',
        apellidos: 'García',
        telefono: '829-555-0123',
        role: 'Coordinador',
        createdAt: new Date().toISOString(),
      },
      {
        cedula: '402-1234567-0',
        username: 'admin2026',
        passwordHash: simpleHash('ClbSegura2026@'),
        nombres: 'Admin',
        apellidos: 'Sistema',
        telefono: '829-555-0000',
        role: 'Admin',
        createdAt: new Date().toISOString(),
      },
    ],
    electores,
    tareas,
    comites,
    incidencias: [],
    recinto: {
      nombre: 'Liceo Secundario Bernardo Pichardo',
      codigo: 'JCE-HM-0012',
      direccion: 'Calle Duarte esq. San Antonio, Hato Mayor del Rey',
      coordinador: 'Lic. Roberto Santana',
      coordinadorTel: '829-555-0142',
      meta: 1850,
      fidelizados: 1420,
      padronTotal: 2980,
      delegados: '6 titulares / 6 suplentes',
      colegios: [
        { letra: 'A', codigo: '0012A', electores: 512, fidelizados: 260, delegado: 'Ramón Mercedes', estado: 'completa' },
        { letra: 'B', codigo: '0012B', electores: 495, fidelizados: 245, delegado: 'Carmen Díaz', estado: 'completa' },
        { letra: 'C', codigo: '0012C', electores: 480, fidelizados: 210, delegado: 'José Almonte', estado: 'falta-suplente' },
        { letra: 'D', codigo: '0012D', electores: 505, fidelizados: 275, delegado: 'Laura Peña', estado: 'completa' },
        { letra: 'E', codigo: '0012E', electores: 498, fidelizados: 230, delegado: 'Miguel Vargas', estado: 'completa' },
        { letra: 'F', codigo: '0012F', electores: 490, fidelizados: 200, delegado: 'Patricia Morales', estado: 'completa' },
      ],
    },
    metricas: {
      inscritos: 245678,
      inscritosDelta: '+12%',
      cba: 18430,
      cbaDelta: '+5%',
      cbe: 12650,
      cbeDelta: '+0%',
      fidelizados: 98320,
      fidelizadosDelta: '+16%',
      mercadoTotal: 8873889,
      mercadoPrm: 1273350,
      mercadoOtros: 7600539,
      cobertura: { inscritos: 27.7, cba: 1.4, cbe: 1.4, fidelizados: 11.1 },
      metaSemanal: 50,
      inscritosPorMiBase: 0,
      fidelizadosCirc: 1420,
      votoSeguroCirc: 1150,
      porRevalidarCirc: 270,
      metaFidelizadosCirc: 1800,
      cbaResumen: { asegurado: 82, electores: 48, votoSeguro: 39, porVisitar: 9 },
      cbeResumen: {
        mesasCubiertas: '11/12',
        delegados: { listos: 22, total: 24, pct: 91.6 },
        votoDuro: 640,
        pct: 85.3,
      },
    },
    llamadas: {
      metaDiaria: 60,
      completadasHoy: 42,
      ritmo: '+6/hora',
      votosSeguros: 34,
      transporte: 8,
      reintentos: 18,
      historial: [],
      cola: [
        { id: 'c1', nombre: 'Manuel Antonio Castillo', motivo: 'reintento', detalle: 'No contestó 9:15 AM', recinto: 'Escuela Faustina Silva' },
        { id: 'c2', nombre: 'Clara Luz Berroa', motivo: 'agendada', detalle: '11:30 AM', recinto: 'Liceo Bernardo Pichardo (Mesa 0011)' },
        { id: 'c3', nombre: 'José David Mercedes', motivo: 'confirmar', detalle: 'Simpatizante • Sector Las Malvinas', recinto: 'Mesa 0014' },
      ],
    },
    roles: [
      { id: 'coordinador', nombre: 'Coordinador', descripcion: 'Usuario registrado - Inscripción' },
      { id: 'dirigente', nombre: 'Dirigente', descripcion: 'Líder territorial - Inscripción, Recinto, Carpeta' },
      { id: 'admin', nombre: 'Admin', descripcion: 'Administrador - Acceso total' },
    ],
    permisos: {
      coordinador: { inscripcion: true, miRecinto: false, miCarpeta: false, fidelizados: false, cba: false, cbe: false, callcenter: false, admin: false },
      dirigente: { inscripcion: true, miRecinto: true, miCarpeta: true, fidelizados: false, cba: false, cbe: false, callcenter: false, admin: false },
      admin: { inscripcion: true, miRecinto: true, miCarpeta: true, fidelizados: true, cba: true, cbe: true, callcenter: true, admin: true },
    },
  }
}
