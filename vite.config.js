import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sqlite3 from 'sqlite3'

const projectRoot = dirname(fileURLToPath(import.meta.url))

const emptyData = {
  orders: [],
  extraEntries: [],
  purchases: [],
  catalogItems: []
  ,materialEntries: []
}

function sharedDataApi() {
  const dataFile = resolve(projectRoot, 'data', 'os-easy-sync.json')
  let writeQueue = Promise.resolve()

  const readData = async () => {
    try {
      const content = await readFile(dataFile, 'utf8')
      const saved = JSON.parse(content)
      return {
        initialized: true,
        data: {
          orders: Array.isArray(saved.orders) ? saved.orders : [],
          extraEntries: Array.isArray(saved.extraEntries) ? saved.extraEntries : [],
          purchases: Array.isArray(saved.purchases) ? saved.purchases : [],
          catalogItems: Array.isArray(saved.catalogItems) ? saved.catalogItems : []
          ,materialEntries: Array.isArray(saved.materialEntries) ? saved.materialEntries : []
        }
      }
    } catch (error) {
      if (error.code === 'ENOENT') return { initialized: false, data: emptyData }
      throw error
    }
  }

  const saveData = async data => {
    await mkdir(dirname(dataFile), { recursive: true })
    await writeFile(dataFile, JSON.stringify(data, null, 2), 'utf8')
    return data
  }

  const getRecordId = (collection, record) => {
    if (collection === 'orders') return record.reg
    if (collection === 'purchases') return record.numero
    return record._syncId
  }

  const applyOperations = async operation => {
    const store = await readData()
    const collection = operation.collection
    if (!Object.hasOwn(store.data, collection)) throw new Error('Coleção inválida')

    const currentItems = store.data[collection]
    const upserts = Array.isArray(operation.upserts) ? operation.upserts : []
    const deletions = new Set(Array.isArray(operation.deletes) ? operation.deletes : [])
    const upsertsById = new Map(upserts.map(item => [getRecordId(collection, item), item]).filter(([id]) => id))
    const merged = currentItems
      .filter(item => !deletions.has(getRecordId(collection, item)))
      .map(item => upsertsById.get(getRecordId(collection, item)) || item)
    const newItems = upserts.filter(item => {
      const id = getRecordId(collection, item)
      return id && !currentItems.some(current => getRecordId(collection, current) === id)
    })

    const data = { ...store.data, [collection]: [...newItems, ...merged] }
    return saveData(data)
  }

  const enqueueWrite = task => {
    const next = writeQueue.then(task)
    writeQueue = next.catch(() => {})
    return next
  }

  const handler = async (request, response, next) => {
    if (request.method === 'GET') {
      const store = await readData()
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify(store))
      return
    }

    if (request.method !== 'PUT' && request.method !== 'POST') {
      next()
      return
    }

    let body = ''
    request.on('data', chunk => { body += chunk })
    request.on('end', async () => {
      try {
        const payload = JSON.parse(body)
        const data = request.method === 'POST'
          ? await enqueueWrite(() => applyOperations(payload))
          : await enqueueWrite(() => saveData({
              orders: Array.isArray(payload.orders) ? payload.orders : [],
              extraEntries: Array.isArray(payload.extraEntries) ? payload.extraEntries : [],
              purchases: Array.isArray(payload.purchases) ? payload.purchases : [],
              catalogItems: Array.isArray(payload.catalogItems) ? payload.catalogItems : []
              ,materialEntries: Array.isArray(payload.materialEntries) ? payload.materialEntries : []
            }))
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ initialized: true, data }))
      } catch {
        response.statusCode = 400
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ error: 'Não foi possível salvar os dados compartilhados.' }))
      }
    })
  }

  return {
    name: 'os-easy-shared-data',
    configureServer(server) {
      server.middlewares.use('/api/data', handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/data', handler)
    }
  }
}

function materialExitSqliteApi() {
  const databaseFile = resolve(projectRoot, 'data', 'material-exits.sqlite')
  let database

  const getDatabase = async () => {
    if (database) return database
    await mkdir(dirname(databaseFile), { recursive: true })
    database = new sqlite3.Database(databaseFile)
    await new Promise((resolvePromise, reject) => database.run(`CREATE TABLE IF NOT EXISTS material_exits (
      id TEXT PRIMARY KEY, data TEXT NOT NULL, codigo TEXT, descricao TEXT NOT NULL, um TEXT, qtd REAL
    )`, error => error ? reject(error) : resolvePromise()))
    return database
  }

  const listEntries = async () => {
    const db = await getDatabase()
    return new Promise((resolvePromise, reject) => db.all('SELECT id AS _syncId, data, codigo, descricao, um, qtd FROM material_exits ORDER BY rowid DESC', (error, rows) => error ? reject(error) : resolvePromise(rows)))
  }

  const handler = async (request, response, next) => {
    if (request.method === 'GET') {
      try {
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(await listEntries()))
      } catch {
        response.statusCode = 500
        response.end(JSON.stringify({ error: 'Não foi possível ler o banco SQLite.' }))
      }
      return
    }
    if (request.method !== 'POST') return next()
    let body = ''
    request.on('data', chunk => { body += chunk })
    request.on('end', async () => {
      try {
        const payload = JSON.parse(body)
        const entries = Array.isArray(payload.entries) ? payload.entries : []
        const db = await getDatabase()
        await new Promise((resolvePromise, reject) => db.serialize(() => {
          db.run('BEGIN TRANSACTION')
          const statement = db.prepare('INSERT OR REPLACE INTO material_exits (id, data, codigo, descricao, um, qtd) VALUES (?, ?, ?, ?, ?, ?)')
          entries.forEach(entry => statement.run(entry._syncId || crypto.randomUUID(), entry.data, entry.codigo || 'SEM CÓDIGO', entry.descricao, entry.um || '', Number(entry.qtd) || 0))
          statement.finalize(error => {
            if (error) { db.run('ROLLBACK'); reject(error); return }
            db.run('COMMIT', commitError => commitError ? reject(commitError) : resolvePromise())
          })
        }))
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(await listEntries()))
      } catch {
        response.statusCode = 400
        response.end(JSON.stringify({ error: 'Não foi possível gravar os registros no SQLite.' }))
      }
    })
  }
  return { name: 'material-exit-sqlite', configureServer(server) { server.middlewares.use('/api/material-exits', handler) }, configurePreviewServer(server) { server.middlewares.use('/api/material-exits', handler) } }
}

export default defineConfig({
  root: projectRoot,
  plugins: [react(), sharedDataApi(), materialExitSqliteApi()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    hmr: {
      host: '0.0.0.0'
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true
  }
})
