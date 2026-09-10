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
  ,materialEntries: [],
  materialExits: [],
  materialPlanning: {}
}

function sharedDataApi() {
  const dataFile = resolve(projectRoot, 'data', 'os-easy-sync.json')
  const legacyDatabaseFile = resolve(projectRoot, 'data', 'material-exits.sqlite')
  let writeQueue = Promise.resolve()

    const readLegacyMaterialExits = async () => {
    if (!(await import('node:fs')).existsSync(legacyDatabaseFile)) return []
    const database = new sqlite3.Database(legacyDatabaseFile)
    return new Promise(resolvePromise => database.all(
      'SELECT id AS _syncId, data, codigo, descricao, um, qtd, turno, destino, solicitante FROM material_exits ORDER BY rowid DESC',
      (error, rows) => {
        if (!error) { database.close(); resolvePromise(rows); return }
        database.all('SELECT id AS _syncId, data, codigo, descricao, um, qtd FROM material_exits ORDER BY rowid DESC', (fallbackError, fallbackRows) => {
          database.close()
          resolvePromise(fallbackError ? [] : (fallbackRows || []).map(row => ({ ...row, turno: '', destino: '', solicitante: '' })))
        })
      }
    ))
  }

  const sanitizeData = saved => ({
    orders: Array.isArray(saved?.orders) ? saved.orders : [],
    extraEntries: Array.isArray(saved?.extraEntries) ? saved.extraEntries : [],
    purchases: Array.isArray(saved?.purchases) ? saved.purchases : [],
    catalogItems: Array.isArray(saved?.catalogItems) ? saved.catalogItems : [],
    materialEntries: Array.isArray(saved?.materialEntries) ? saved.materialEntries : [],
    materialExits: Array.isArray(saved?.materialExits) ? saved.materialExits : [],
    materialPlanning: saved?.materialPlanning && typeof saved.materialPlanning === 'object' ? saved.materialPlanning : {}
  })

  const readData = async () => {
    let saved
    try {
      const content = await readFile(dataFile, 'utf8')
      try {
        saved = JSON.parse(content)
      } catch {
        const backupFile = `${dataFile}.corrompido.${Date.now()}.bak.json`
        try { await writeFile(backupFile, content, 'utf8') } catch {}
        saved = undefined
      }
    } catch (error) {
      if (error.code === 'ENOENT') return { initialized: false, data: emptyData }
      throw error
    }
    const data = sanitizeData(saved)
    if (!Array.isArray(saved?.materialExits)) {
      try { data.materialExits = await readLegacyMaterialExits() } catch { data.materialExits = [] }
    }
    return { initialized: true, data }
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
      try {
        const store = await readData()
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(store))
      } catch {
        response.statusCode = 500
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ initialized: true, data: emptyData, error: 'Base compartilhada indisponível. Usando dados locais.' }))
      }
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
              ,materialEntries: Array.isArray(payload.materialEntries) ? payload.materialEntries : [],
              materialExits: Array.isArray(payload.materialExits) ? payload.materialExits : [],
              materialPlanning: payload.materialPlanning && typeof payload.materialPlanning === 'object' ? payload.materialPlanning : {}
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
    if (database) {
      try {
        await new Promise((resolvePromise, reject) => database.all('SELECT turno, destino, solicitante FROM material_exits LIMIT 1', error => error ? reject(error) : resolvePromise()))
      } catch {
        try { await new Promise((resolvePromise, reject) => database.run('ALTER TABLE material_exits ADD COLUMN turno TEXT DEFAULT \'\'', error => error ? reject(error) : resolvePromise())) } catch {}
        try { await new Promise((resolvePromise, reject) => database.run('ALTER TABLE material_exits ADD COLUMN destino TEXT DEFAULT \'\'', error => error ? reject(error) : resolvePromise())) } catch {}
        try { await new Promise((resolvePromise, reject) => database.run('ALTER TABLE material_exits ADD COLUMN solicitante TEXT DEFAULT \'\'', error => error ? reject(error) : resolvePromise())) } catch {}
      }
      return database
    }
    await mkdir(dirname(databaseFile), { recursive: true })
    database = new sqlite3.Database(databaseFile)
    await new Promise((resolvePromise, reject) => database.run(`CREATE TABLE IF NOT EXISTS material_exits (
      id TEXT PRIMARY KEY, data TEXT NOT NULL, codigo TEXT, descricao TEXT NOT NULL, um TEXT, qtd REAL, turno TEXT DEFAULT '', destino TEXT DEFAULT '', solicitante TEXT DEFAULT ''
    )`, error => error ? reject(error) : resolvePromise()))
    await new Promise(resolvePromise => database.all('PRAGMA table_info(material_exits)', (error, columns) => {
      if (error) { resolvePromise(); return }
      const names = new Set((columns || []).map(col => col.name))
      const missing = ['turno', 'destino', 'solicitante'].filter(name => !names.has(name))
      if (!missing.length) { resolvePromise(); return }
      database.serialize(() => {
        let pending = missing.length
        let failed = false
        missing.forEach(name => database.run(`ALTER TABLE material_exits ADD COLUMN ${name} TEXT DEFAULT ''`, () => {
          pending -= 1
          if (pending === 0 && !failed) resolvePromise()
        }))
      })
    }))
    return database
  }

  const selectAllExits = db => new Promise((resolvePromise, reject) => {
    db.all('SELECT id AS _syncId, data, codigo, descricao, um, qtd, turno, destino, solicitante FROM material_exits ORDER BY rowid DESC', (error, rows) => {
      if (!error) { resolvePromise(rows); return }
      db.all('SELECT id AS _syncId, data, codigo, descricao, um, qtd FROM material_exits ORDER BY rowid DESC', (fallbackError, fallbackRows) => {
        if (fallbackError) { reject(fallbackError); return }
        resolvePromise((fallbackRows || []).map(row => ({ ...row, turno: '', destino: '', solicitante: '' })))
      })
    })
  })

  const listEntries = async () => selectAllExits(await getDatabase())

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
        const replaceAll = payload.replaceAll === true
        const db = await getDatabase()
        await new Promise((resolvePromise, reject) => db.serialize(() => {
          db.run('BEGIN TRANSACTION')
          const proceed = useNewColumns => {
            const statement = useNewColumns
              ? db.prepare('INSERT OR REPLACE INTO material_exits (id, data, codigo, descricao, um, qtd, turno, destino, solicitante) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
              : db.prepare('INSERT OR REPLACE INTO material_exits (id, data, codigo, descricao, um, qtd) VALUES (?, ?, ?, ?, ?, ?)')
            entries.forEach(entry => {
              if (useNewColumns) statement.run(entry._syncId || crypto.randomUUID(), entry.data, entry.codigo || 'SEM CÓDIGO', entry.descricao, entry.um || '', Number(entry.qtd) || 0, entry.turno || '', entry.destino || '', entry.solicitante || '')
              else statement.run(entry._syncId || crypto.randomUUID(), entry.data, entry.codigo || 'SEM CÓDIGO', entry.descricao, entry.um || '', Number(entry.qtd) || 0)
            })
            statement.finalize(error => {
              if (error) { db.run('ROLLBACK'); reject(error); return }
              db.run('COMMIT', commitError => commitError ? reject(commitError) : resolvePromise())
            })
          }
          if (replaceAll) {
            db.run('DELETE FROM material_exits', deleteError => {
              if (deleteError) { db.run('ROLLBACK'); reject(deleteError); return }
              db.all('SELECT turno, destino, solicitante FROM material_exits LIMIT 1', probeError => proceed(!probeError))
            })
          } else {
            db.all('SELECT turno, destino, solicitante FROM material_exits LIMIT 1', probeError => proceed(!probeError))
          }
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
