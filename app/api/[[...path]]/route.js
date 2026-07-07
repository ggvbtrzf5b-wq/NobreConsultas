import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

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

/* ---------- mock generators for Sprint 1.1 (real integrations = Sprint 3) ---------- */
function mockResultFor(type, query) {
  const clean = (query || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  switch (type) {
    case 'PLACA':
      return {
        summary: 'Veículo localizado na base pública (dados simulados).',
        data: {
          Placa: clean,
          Marca: 'Volkswagen',
          Modelo: 'Nivus Highline',
          Ano: '2023/2024',
          Cor: 'Prata',
          Combustível: 'Flex',
          UF: 'SP',
          Situação: 'Regular',
        }
      }
    case 'CPF':
      return {
        summary: 'CPF ativo na base da Receita (dados simulados).',
        data: {
          CPF: clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
          Nome: 'FRANCISCO N. DA SILVA',
          Nascimento: '12/07/1988',
          Situação: 'Regular',
          UF: 'SP',
        }
      }
    case 'CNPJ':
      return {
        summary: 'Empresa ativa na Receita Federal (dados simulados).',
        data: {
          CNPJ: clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'),
          'Razão Social': 'NOBRE CONSULTAS LTDA',
          Fantasia: 'Nobre Consultas',
          Abertura: '03/2022',
          Situação: 'Ativa',
          UF: 'SP',
        }
      }
    case 'RENAVAM':
      return {
        summary: 'RENAVAM localizado no DETRAN (dados simulados).',
        data: {
          RENAVAM: clean,
          Placa: 'ABC1D23',
          Chassi: '9BW***********123',
          Situação: 'Sem restrições',
        }
      }
    default:
      return { summary: 'Consulta genérica.', data: { Termo: query } }
  }
}

/* ---------- route helpers ---------- */
function segments(request) {
  const url = new URL(request.url)
  const parts = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean)
  return { parts, url }
}

export async function GET(request) {
  try {
    const { parts, url } = segments(request)
    const db = await getDb()

    if (parts.length === 0) return json({ name: 'Nobre Consultas API', version: '0.1.0' })

    if (parts[0] === 'queries') {
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100)
      const items = await db.collection('queries').find({}).sort({ createdAt: -1 }).limit(limit).toArray()
      return json({ items: items.map(({ _id, ...rest }) => rest) })
    }

    if (parts[0] === 'stats') {
      const start = new Date(); start.setHours(0, 0, 0, 0)
      const [consultasHoje, totalClientes] = await Promise.all([
        db.collection('queries').countDocuments({ createdAt: { $gte: start.toISOString() } }),
        db.collection('clients').countDocuments({}),
      ])
      const wallet = await db.collection('wallet').findOne({ id: 'main' })
      const saldo = wallet?.saldo ?? 1284.50
      const receita = wallet?.receita ?? 8420.00
      return json({
        saldo,
        consultasHoje,
        receita,
        clientes: totalClientes || 12,
      })
    }

    return json({ error: 'Not found' }, 404)
  } catch (e) {
    console.error(e)
    return json({ error: 'Server error', detail: String(e?.message || e) }, 500)
  }
}

export async function POST(request) {
  try {
    const { parts } = segments(request)
    const db = await getDb()

    if (parts[0] === 'queries') {
      const body = await request.json()
      const query = (body?.query || '').trim()
      const type = (body?.type || 'DESCONHECIDO').toUpperCase()
      if (!query) return json({ error: 'query is required' }, 400)

      const result = mockResultFor(type, query)
      const item = {
        id: uuidv4(),
        query,
        type,
        summary: result.summary,
        data: result.data,
        createdAt: new Date().toISOString(),
      }
      await db.collection('queries').insertOne({ ...item })
      return json({ item })
    }

    return json({ error: 'Not found' }, 404)
  } catch (e) {
    console.error(e)
    return json({ error: 'Server error', detail: String(e?.message || e) }, 500)
  }
}
