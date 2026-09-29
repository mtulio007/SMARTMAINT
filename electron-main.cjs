const { app, BrowserWindow } = require('electron')
const http = require('node:http')
const fs = require('node:fs/promises')
const path = require('node:path')

const emptyData = {
  orders: [], extraEntries: [], purchases: [], catalogItems: [],
  materialEntries: [], materialExits: [], materialPlanning: {}
}

let server

function normalizeData(saved) {
  return {
    orders: Array.isArray(saved?.orders) ? saved.orders : [],
    extraEntries: Array.isArray(saved?.extraEntries) ? saved.extraEntries : [],
    purchases: Array.isArray(saved?.purchases) ? saved.purchases : [],
    catalogItems: Array.isArray(saved?.catalogItems) ? saved.catalogItems : [],
    materialEntries: Array.isArray(saved?.materialEntries) ? saved.materialEntries : [],
    materialExits: Array.isArray(saved?.materialExits) ? saved.materialExits : [],
    materialPlanning: saved?.materialPlanning && typeof saved.materialPlanning === 'object' ? saved.materialPlanning : {}
  }
}

function recordId(collection, item) {
  if (collection === 'orders') return item.reg
  if (collection === 'purchases') return item.numero
  return item._syncId
}

async function createServer() {
  const dataDirectory = path.join(app.getPath('userData'), 'data')
  const dataFile = path.join(dataDirectory, 'os-easy-sync.json')
  const appFiles = app.getAppPath()
  const webDirectory = path.join(appFiles, 'dist')
  const seedFile = app.isPackaged
    ? path.join(process.resourcesPath, 'data', 'os-easy-sync.json')
    : path.join(__dirname, 'data', 'os-easy-sync.json')

  async function readStore() {
    try { return { initialized: true, data: normalizeData(JSON.parse(await fs.readFile(dataFile, 'utf8'))) } }
    catch (error) {
      if (error.code !== 'ENOENT') return { initialized: false, data: emptyData }
      try {
        const seed = normalizeData(JSON.parse(await fs.readFile(seedFile, 'utf8')))
        await saveStore(seed)
        return { initialized: true, data: seed }
      } catch { return { initialized: false, data: emptyData } }
    }
  }

  async function saveStore(data) {
    await fs.mkdir(dataDirectory, { recursive: true })
    await fs.writeFile(dataFile, JSON.stringify(normalizeData(data), null, 2), 'utf8')
    return normalizeData(data)
  }

  async function api(request, response) {
    if (request.method === 'GET') {
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify(await readStore()))
      return
    }
    let body = ''
    for await (const part of request) body += part
    try {
      const input = JSON.parse(body)
      let data
      if (request.method === 'POST') {
        const store = await readStore()
        const collection = input.collection
        if (!Object.hasOwn(store.data, collection)) throw new Error('Invalid collection')
        const existing = store.data[collection]
        const removals = new Set(Array.isArray(input.deletes) ? input.deletes : [])
        const updates = new Map((input.upserts || []).map(item => [recordId(collection, item), item]).filter(([id]) => id))
        data = { ...store.data, [collection]: [
          ...(input.upserts || []).filter(item => !existing.some(current => recordId(collection, current) === recordId(collection, item))),
          ...existing.filter(item => !removals.has(recordId(collection, item))).map(item => updates.get(recordId(collection, item)) || item)
        ] }
      } else if (request.method === 'PUT') data = input
      else throw new Error('Invalid method')
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify({ initialized: true, data: await saveStore(data) }))
    } catch {
      response.statusCode = 400
      response.end(JSON.stringify({ error: 'Não foi possível salvar os dados.' }))
    }
  }

  server = http.createServer(async (request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1')
    if (url.pathname === '/api/data') return api(request, response)
    const relative = url.pathname === '/' ? 'index.html' : url.pathname.replace(/^\/+/, '')
    const file = path.resolve(webDirectory, relative)
    if (!file.startsWith(webDirectory)) { response.statusCode = 403; return response.end() }
    try {
      const content = await fs.readFile(file)
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' }
      response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream')
      response.end(content)
    } catch {
      response.statusCode = 404
      response.end('Arquivo não encontrado')
    }
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  return server.address().port
}

app.whenReady().then(async () => {
  const port = await createServer()
  const window = new BrowserWindow({ width: 1440, height: 900, minWidth: 1024, minHeight: 700, autoHideMenuBar: true, webPreferences: { contextIsolation: true, nodeIntegration: false } })
  await window.loadURL(`http://127.0.0.1:${port}`)
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) window.show() })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('before-quit', () => server?.close())
