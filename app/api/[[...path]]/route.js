import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import {
  hashPassword, comparePassword, signToken,
  setAuthCookie, clearAuthCookie, getAuthPayload, publicUser
} from '@/lib/auth'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'nobre_consultas'

let cachedClient = null
async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGO_URL)
    await cachedClient.connect()
  }
  return cachedClient.db(DB_NAME)
}

const json = (data, status = 200) => NextResponse.json(data, { status })

/* ---------- mocks (Sprint 3 substitui pelos providers reais) ---------- */
function mockResultFor(type, query) {
  const clean = (query || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  switch (type) {
    case 'PLACA':
      return {
        summary: 'Veículo localizado na base pública (dados simulados).',
        data: {
          Placa: clean, Marca: 'Volkswagen', Modelo: 'Nivus Highline',
          Ano: '2023/2024', Cor: 'Prata', Combustível: 'Flex', UF: 'SP', Situação: 'Regular',
        }
      }
    case 'CPF':
      return {
        summary: 'CPF ativo na base da Receita (dados simulados).',
        data: {
          CPF: clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
          Nome: 'FRANCISCO N. DA SILVA', Nascimento: '12/07/1988', Situação: 'Regular', UF: 'SP',
        }
      }
    case 'CNPJ':
      return {
        summary: 'Empresa ativa na Receita Federal (dados simulados).',
        data: {
          CNPJ: clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'),
          'Razão Social': 'NOBRE CONSULTAS LTDA', Fantasia: 'Nobre Consultas',
          Abertura: '03/2022', Situação: 'Ativa', UF: 'SP',
        }
      }
    case 'RENAVAM':
      return {
        summary: 'RENAVAM localizado no DETRAN (dados simulados).',
        data: { RENAVAM: clean, Placa: 'ABC1D23', Chassi: '9BW***********123', Situação: 'Sem restrições' }
      }
    default:
      return { summary: 'Consulta genérica.', data: { Termo: query } }
  }
}

function segments(request) {
  const url = new URL(request.url)
  const parts = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean)
  return { parts, url }
}

async function requireAuth(db) {
  const payload = await getAuthPayload()
  if (!payload?.uid) return { error: json({ error: 'Não autenticado' }, 401) }
  const user = await db.collection('users').findOne({ id: payload.uid })
  if (!user) return { error: json({ error: 'Usuário não encontrado' }, 401) }
  return { user }
}

/* ============================= GET ============================= */
export async function GET(request) {
  try {
    const { parts, url } = segments(request)
    const db = await getDb()

    if (parts.length === 0) return json({ name: 'Nobre Consultas API', version: '0.2.0' })

    /* ---------- AUTH ---------- */
    if (parts[0] === 'auth' && parts[1] === 'me') {
      const payload = await getAuthPayload()
      if (!payload?.uid) return json({ user: null })
      const user = await db.collection('users').findOne({ id: payload.uid })
      return json({ user: publicUser(user) })
    }

    /* ---------- protected ---------- */
    if (parts[0] === 'queries') {
      const { error, user } = await requireAuth(db)
      if (error) return error
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100)
      const items = await db.collection('queries')
        .find({ userId: user.id })
        .sort({ createdAt: -1 })
        .limit(limit).toArray()
      return json({ items: items.map(({ _id, ...rest }) => rest) })
    }

    if (parts[0] === 'stats') {
      const { error, user } = await requireAuth(db)
      if (error) return error
      const start = new Date(); start.setHours(0, 0, 0, 0)
      const [consultasHoje, totalClientes] = await Promise.all([
        db.collection('queries').countDocuments({ userId: user.id, createdAt: { $gte: start.toISOString() } }),
        db.collection('clients').countDocuments({ ownerId: user.id }),
      ])
      const wallet = await db.collection('wallet').findOne({ userId: user.id })
      return json({
        saldo: wallet?.saldo ?? 1284.50,
        consultasHoje,
        receita: wallet?.receita ?? 8420.00,
        clientes: totalClientes || 0,
      })
    }

    return json({ error: 'Not found' }, 404)
  } catch (e) {
    console.error(e)
    return json({ error: 'Server error', detail: String(e?.message || e) }, 500)
  }
}

/* ============================= POST ============================= */
export async function POST(request) {
  try {
    const { parts } = segments(request)
    const db = await getDb()

    /* ---------- REGISTER ---------- */
    if (parts[0] === 'auth' && parts[1] === 'register') {
      const body = await request.json()
      const name = (body?.name || '').trim()
      const email = (body?.email || '').trim().toLowerCase()
      const password = body?.password || ''

      if (!name || !email || !password) return json({ error: 'Preencha todos os campos' }, 400)
      if (password.length < 6) return json({ error: 'Senha precisa ter pelo menos 6 caracteres' }, 400)
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Email inválido' }, 400)

      const existing = await db.collection('users').findOne({ email })
      if (existing) return json({ error: 'Já existe uma conta com este email' }, 409)

      const usersCount = await db.collection('users').countDocuments({})
      const role = usersCount === 0 ? 'admin' : 'user' // primeiro usuário = admin

      const passwordHash = await hashPassword(password)
      const user = {
        id: uuidv4(),
        name,
        email,
        role,
        passwordHash,
        avatarInitials: name.split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase(),
        createdAt: new Date().toISOString(),
      }
      await db.collection('users').insertOne({ ...user })

      // Wallet inicial
      await db.collection('wallet').insertOne({
        id: uuidv4(), userId: user.id, saldo: 0, receita: 0, createdAt: new Date().toISOString()
      })

      const token = signToken({ uid: user.id, role: user.role })
      await setAuthCookie(token)
      return json({ user: publicUser(user) })
    }

    /* ---------- LOGIN ---------- */
    if (parts[0] === 'auth' && parts[1] === 'login') {
      const body = await request.json()
      const email = (body?.email || '').trim().toLowerCase()
      const password = body?.password || ''
      if (!email || !password) return json({ error: 'Preencha email e senha' }, 400)

      const user = await db.collection('users').findOne({ email })
      if (!user) return json({ error: 'Email ou senha incorretos' }, 401)
      const ok = await comparePassword(password, user.passwordHash)
      if (!ok) return json({ error: 'Email ou senha incorretos' }, 401)

      const token = signToken({ uid: user.id, role: user.role })
      await setAuthCookie(token)
      return json({ user: publicUser(user) })
    }

    /* ---------- LOGOUT ---------- */
    if (parts[0] === 'auth' && parts[1] === 'logout') {
      await clearAuthCookie()
      return json({ ok: true })
    }

    /* ---------- QUERIES (protegido) ---------- */
    if (parts[0] === 'queries') {
      const { error, user } = await requireAuth(db)
      if (error) return error

      const body = await request.json()
      const query = (body?.query || '').trim()
      const type = (body?.type || 'DESCONHECIDO').toUpperCase()
      if (!query) return json({ error: 'query is required' }, 400)

      const result = mockResultFor(type, query)
      const item = {
        id: uuidv4(),
        userId: user.id,
        query, type,
        summary: result.summary,
        data: result.data,
        createdAt: new Date().toISOString(),
      }
      await db.collection('queries').insertOne({ ...item })
      const { _id, userId, ...pub } = item
      return json({ item: { ...pub, userId } })
    }

    return json({ error: 'Not found' }, 404)
  } catch (e) {
    console.error(e)
    return json({ error: 'Server error', detail: String(e?.message || e) }, 500)
  }
}
