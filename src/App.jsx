import { useEffect, useMemo, useRef, useState } from 'react'

const emptyOrder = {
  reg: '',
  setor: '',
  equipamento: '',
  solicitante: '',
  horaParada: '',
  motivoAbertura: '',
  tipoServico: '',
  prioridade: '',
  especialidade: '',
  descricao: '',
  tecnico: '',
  status: 'Pendente',
  turno: '',
  horaInicio: '',
  horaFinal: ''
}

const extraEmpty = {
  ord: '',
  colaborador: '',
  funcao: '',
  turnoHE: '',
  dataHE: '',
  dataInicio: '',
  dataTermino: ''
}

const colaboradorDetails = {
  'CLEBER ROGER COLARES DA SILVA': { turnoHE: 'A', funcao: 'ENC. MANUTENÇÃO' },
  'GABRIEL GOMES DE SOUSA': { turnoHE: 'A', funcao: 'MECÂNICO PL' },
  'AMAURY SILVA DE AQUINO': { turnoHE: 'A', funcao: 'MECÂNICO JR' },
  'RAIMUNDO ALFAIA FERREIRA': { turnoHE: 'ESPECIAL', funcao: 'SERRALHEIRO' },
  'FRANCINEI DOS REIS OLIVEIRA': { turnoHE: 'ESPECIAL', funcao: 'ARTÍFICE' },
  'FRANCISCO CASTRO RODRIGUES': { turnoHE: 'A', funcao: 'SERRALHEIRO' },
  'JOVERLEY BATALHA VASQUES': { turnoHE: 'B', funcao: 'ELETROTÉCNICO PL' },
  'ANDRÉ RICARDO DE CARVALHO AMORIM': { turnoHE: 'B', funcao: 'MECÂNICO SR' },
  'RONÉLIO DA SILVA MARINHO': { turnoHE: 'B', funcao: 'ENC. MANUTENÇÃO' },
  'PAULO ANDRÉ CORREA VALE': { turnoHE: 'C', funcao: 'MECÂNICO SR' },
  'JOÃO VICTOR CARDOSO LIMA': { turnoHE: 'C', funcao: 'MECÂNICO PL' },
  'MARLISSON ALVES DA SILVA': { turnoHE: 'C', funcao: 'MECÂNICO ESPECIALISTA' },
  'VICTOR FARIAS DA CONCEIÇÃO': { turnoHE: 'ESPECIAL', funcao: 'ANALISTA DE PCM' }
}

const colaboradorOptions = Object.keys(colaboradorDetails)

const statusOptions = ['Pendente', 'Iniciada', 'Finalizada']

const equipamentoOptions = [
  { code: 'PREDIAL', label: 'PERIÓDICOS' },
  { code: 'MANUTENÇÕES', label: 'TEMPORÁRIOS' },
  { code: 'CA001', label: 'COMPRESSOR 100HP' },
  { code: 'CB001', label: 'CABLEADORA' },
  { code: 'CC001', label: 'C.COSTURA' },
  { code: 'CC002', label: 'C.COSTURA' },
  { code: 'CC003', label: 'C.COSTURA' },
  { code: 'CC004', label: 'C.COSTURA' },
  { code: 'CH001', label: 'CHILLER' },
  { code: 'CL001', label: 'C.LONA' },
  { code: 'CL002', label: 'C.LONA' },
  { code: 'CL003', label: 'C.LONA' },
  { code: 'CL004', label: 'C.LONA' },
  { code: 'EC001', label: 'EXT.COMPOSTO' },
  { code: 'EL001', label: 'EXT.COATING' },
  { code: 'EL002', label: 'EXT.COATING' },
  { code: 'EM001', label: 'EXT.MULTIFILAMENTO' },
  { code: 'ER001', label: 'EXT.RÁFIA' },
  { code: 'Iluminação', label: 'REDE ELÉTRICA' },
  { code: 'Instron', label: 'QUALIDADE' },
  { code: 'MC001', label: 'M.COSTURA PANO' },
  { code: 'MC002', label: 'M.COSTURA PANO' },
  { code: 'MC003', label: 'M.COSTURA PANO' },
  { code: 'MC004', label: 'M.COSTURA PANO' },
  { code: 'PR001', label: 'PRENSA' },
  { code: 'PR002', label: 'PRENSA' },
  { code: 'PR003', label: 'PRENSA' },
  { code: 'SA001', label: 'SECADOR DE AR 100HP' },
  { code: 'TA001', label: 'TEC.ALÇA' },
  { code: 'TA002', label: 'TEC.ALÇA' },
  { code: 'TA003', label: 'TEC.ALÇA' },
  { code: 'TA004', label: 'TEC.ALÇA' },
  { code: 'TA005', label: 'TEC.ALÇA' },
  { code: 'TC001', label: 'TEC.CADARÇO' },
  { code: 'TC002', label: 'TEC.CADARÇO' },
  { code: 'TL001', label: 'TEC.LEVE' },
  { code: 'TL002', label: 'TEC.LEVE' },
  { code: 'TL003', label: 'TEC.LEVE' },
  { code: 'TL004', label: 'TEC.LEVE' },
  { code: 'TL005', label: 'TEC.LEVE' },
  { code: 'TL006', label: 'TEC.LEVE' },
  { code: 'TL007', label: 'TEC.LEVE' },
  { code: 'TL008', label: 'TEC.LEVE' },
  { code: 'TL009', label: 'TEC.LEVE' },
  { code: 'TL010', label: 'TEC.LEVE' },
  { code: 'TL011', label: 'TEC.LEVE' },
  { code: 'TL012', label: 'TEC.LEVE' },
  { code: 'TL013', label: 'TEC.LEVE' },
  { code: 'TL014', label: 'TEC.LEVE' },
  { code: 'TL015', label: 'TEC.LEVE' },
  { code: 'TP001', label: 'TEC.PESADA' },
  { code: 'TP002', label: 'TEC.PESADA' },
  { code: 'TP003', label: 'TEC.PESADA' },
  { code: 'TP004', label: 'TEC.PESADA' },
  { code: 'TP005', label: 'TEC.PESADA' },
  { code: 'TT001', label: 'TEC.TRAVA' },
  { code: 'TT002', label: 'TEC.TRAVA' },
  { code: 'TT003', label: 'TEC.TRAVA' },
  { code: 'TT004', label: 'TEC.TRAVA' },
  { code: 'PR004', label: 'PRENSA DE TUBETES E RESÍDUOS' },
  { code: 'Compressor', label: 'REDE DE AR COMPRIMIDO' }
]

const solicitanteOptions = [
  'AIRA', 'ALENCAR', 'ALESSANDRA', , 'ALISSON LIMA', 'ALESSANDRO', 'ALOISE', 'ANA', 'ANABELE',  'ANEISIA', 'ANTONIA', 'ANTÔNIO', 'ARIA', 'CLARICE', 'CLEBER ROGER', 'CRISTIANE', 'DANIEL', 'DIANA', 'DIEGO', 'DIVA', 'EDVALDO','ELDENIR',
  'EFFERSON', 'ELAIN', 'ELCENIR', 'ELIANA', 'ELIANE', 'ELISSON', 'ELTON', 'ELIZENE', 'EMERSON', 'ERIC MORAIS', 'ESTEFANY','EZILENE',
  'FABIANA CARVALHO', 'FELADO', 'FRANCISCO', 'FRANCISCO FARIAS', 'FRANCIVALDO', 'IRANA',
  'IRLAND', 'ISMAEL', 'ISRAEL', 'JACIANE', 'JACKSON', 'JANE', 'JHON', 'JOANA', 'JOAB', 'JOÃO V. CARDOSO', 'JOCIANE', 'JOHN',
  'JOHNY', 'JOSIANE', 'JOYCILAURA', 'JUCIANA', 'JUCILAURA', 'JUCYLAURA', 'KARINA DIAS', 'KEITI',
  'KETI', 'KELLY', 'KELY', 'LAURA', 'LEANDRO', 'LEIDIVANIA', 'LENDRO', 'LENE', 'LISIANE', 'LUCAS', 'LUCAS SOUZA',
  'LUCIANA', 'LUZIANA', 'MARCILENE', 'MAER', 'MAIK', 'MAIR', 'MARIELA', 'MARCELO', 'MARCIA', 'MARICLENE', 'MARCIO', 'MARCOS', 'MARCOS VINÍCIUS',
  'MARIA', 'MARIA GUIOMAR', 'MARILENE', 'MARILENE', 'MARINA', 'MARINES', 'MARINES', 'MARINEZ', 'MARIO', 'MARLISON', 'MARTA', 'MARTHA', 'MAYK',
  'MELO', 'MIRIAN', 'MONIQUE', 'MIGUEL', 'NICE', 'NIEL', 'NILCÉLIA', 'NILCINHO', 'NILCINHO', 'NILSON', 'NILTON', 'NORMA', 'OZAMIR', 'OZAMIR',
  'RAFAEL', 'RAIMUNDO', 'RAIMUNDO', 'RAIMUNDO CASTRO', 'RENA', 'RENE', 'RENEY', 'RICK', 'RICKINNER', 'ROLANDO', 'RONALDO', 'RONELDO MARINHO',
  'ROSANGELA','ROSE', 'ROSEANE', 'ROSELY', 'ROSICLEIA', 'ROZIANE', 'RUTH', 'SANDRA', 'SHEILA', 'SNEYLA', 'SONY', 'TAHISSA', 'TALISSA', 'TALISSA',
  'TÂNIA', 'THIAGO', 'TIAGO', 'TIAGO DANTAS', 'WESLEY'
]

const tecnicoOptions = [
  'GABRIEL GOMES', 'JOVERLEY BATALHA', 'ANDRÉ RICARDO', 'RONÉLIO MARINHO', 'PAULO A. CORREA', 'JOÃO V. CARDOSO',
  'CLEBER ROGER', 'AMAURY SILVA', 'WILLIAN BRAZ', 'ERIC MORAIS', 'MARLISSON ALVES', 'OZAMIR'
]

const menuItems = [
  { label: 'Status OS', icon: '🔎', key: 'pesquisa' },
  { label: 'Registro OS', icon: '🖥️', key: 'cadastro' },
  { label: 'Hora Extra', icon: '⏱️', key: 'horaextra' },
  { label: 'Pedidos', icon: '🛒', key: 'compras' },
  { label: 'Catálogo Manutenção', icon: '🗂️', key: 'catalogo' }
]

const emptyPurchase = {
  numero: '',
  setor: '',
  tipoSolicitacao: '',
  tipoComponente: '',
  descricao: '',
  quantidade: '',
  unidade: 'UN',
  items: [{ tipoComponente: '', descricao: '', quantidade: '', unidade: 'UN' }],
  prioridade: 'Média',
  solicitante: '',
  dataSolicitacao: '',
  observacoes: '',
  status: 'Pendente'
}

const purchaseSetorOptions = ['Manutenção', 'Almoxarifado', 'Produção', 'ADM']
const purchaseSolicitacaoOptions = ['Compra', 'Reposição', 'Emergencial', 'Ordem de serviço']
const purchaseTipoComponenteOptions = ['Eletrônico', 'Mecânico', 'Hidráulico', 'Elétrico', 'Consumível', 'Outro']
const purchaseStatusOptions = ['Pendente', 'Aprovada', 'Comprada', 'Cancelada']
const emptyPurchaseItem = { tipoComponente: '', descricao: '', quantidade: '', unidade: 'UN' }
const getPurchaseItems = purchase => {
  if (Array.isArray(purchase?.items) && purchase.items.length > 0) return purchase.items
  return [{
    tipoComponente: purchase?.tipoComponente || '',
    descricao: purchase?.descricao || '',
    quantidade: purchase?.quantidade ?? '',
    unidade: purchase?.unidade || 'UN'
  }]
}
const syncEndpoint = '/api/data'
const emptySharedData = { orders: [], extraEntries: [], purchases: [], catalogItems: [] }
const createSyncId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
const padDatePart = value => String(value).padStart(2, '0')

const formatDateTime = value => {
  if (!value) return ''
  const brazilianMatch = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/)
  if (brazilianMatch) {
    const [, day, month, year, hour = '00', minute = '00'] = brazilianMatch
    return `${day}/${month}/${year} ${hour}:${minute}`
  }

  const isoMatch = String(value).match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?$/)
  if (isoMatch) {
    const [, year, month, day, hour = '00', minute = '00'] = isoMatch
    return `${day}/${month}/${year} ${hour}:${minute}`
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return String(value)
  return `${padDatePart(parsed.getDate())}/${padDatePart(parsed.getMonth() + 1)}/${parsed.getFullYear()} ${padDatePart(parsed.getHours())}:${padDatePart(parsed.getMinutes())}`
}

const toDateTimeLocal = value => {
  if (!value) return ''
  const brazilianMatch = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::\d{2})?)?$/)
  if (brazilianMatch) {
    const [, day, month, year, hour = '00', minute = '00'] = brazilianMatch
    return `${year}-${month}-${day}T${hour}:${minute}`
  }
  const isoMatch = String(value).match(/^(\d{4}-\d{2}-\d{2})(?:[T\s](\d{2}):(\d{2}))?/) 
  if (!isoMatch) return ''
  return `${isoMatch[1]}T${isoMatch[2] || '00'}:${isoMatch[3] || '00'}`
}

const toDateInput = value => toDateTimeLocal(value).slice(0, 10)
const getCurrentDate = () => new Date().toISOString().slice(0, 10)

const getDateTimestamp = value => {
  const formatted = formatDateTime(value)
  const match = formatted.match(/^(\d{2})\/(\d{2})\/(\d{4})\s(\d{2}):(\d{2})$/)
  if (!match) return Number.NaN
  const [, day, month, year, hour, minute] = match
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)).getTime()
}

function App() {
  const [orders, setOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('os_easy_orders') || '[]')
    } catch {
      return []
    }
  })
  const [extraEntries, setExtraEntries] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('os_easy_hour_extras') || '[]').map(entry => ({
        ...entry,
        _syncId: entry._syncId || createSyncId()
      }))
    } catch {
      return []
    }
  })
  const [purchases, setPurchases] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('os_easy_purchases') || '[]')
    } catch {
      return []
    }
  })
  const [catalogItems, setCatalogItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('os_easy_catalog_items') || '[]')
    } catch {
      return []
    }
  })
  const [selectedSection, setSelectedSection] = useState('pesquisa')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchStatus, setSearchStatus] = useState('')
  const [form, setForm] = useState(emptyOrder)
  const [extraForm, setExtraForm] = useState(extraEmpty)
  const [editingExtraEntryId, setEditingExtraEntryId] = useState('')
  const [purchaseForm, setPurchaseForm] = useState(emptyPurchase)
  const [purchaseSearchTerm, setPurchaseSearchTerm] = useState('')
  const [catalogDescription, setCatalogDescription] = useState('')
  const [catalogImage, setCatalogImage] = useState('')
  const [catalogError, setCatalogError] = useState('')
  const [editingCatalogItemId, setEditingCatalogItemId] = useState('')
  const [editingCatalogDescription, setEditingCatalogDescription] = useState('')
  const [currentOrderIndex, setCurrentOrderIndex] = useState(-1)
  const [currentPurchaseIndex, setCurrentPurchaseIndex] = useState(-1)
  const [invalidFields, setInvalidFields] = useState([])
  const [purchaseInvalidFields, setPurchaseInvalidFields] = useState([])
  const [syncStatus, setSyncStatus] = useState('Conectando base compartilhada...')
  const formRefs = useRef({})
  const purchaseFormRefs = useRef({})
  const sharedDataRef = useRef({
    orders,
    extraEntries: extraEntries.map(entry => ({ ...entry, _syncId: entry._syncId || createSyncId() })),
    purchases,
    catalogItems: catalogItems.map(item => ({ ...item, _syncId: item._syncId || createSyncId() }))
  })

  const requiredFields = [
    { name: 'equipamento', label: 'Equipamento' },
    { name: 'solicitante', label: 'Solicitante' },
    { name: 'horaParada', label: 'Hora Parada' },
    { name: 'motivoAbertura', label: 'Descrição do problema' }
  ]

  const filteredOrders = useMemo(() => {
    const term = searchTerm.toLowerCase()
    const seenRegs = new Set()
    return orders.filter(order => {
      if (searchStatus && order.status !== searchStatus) return false
      if (seenRegs.has(order.reg)) return false
      seenRegs.add(order.reg)
      return Object.values(order).some(value =>
        String(value).toLowerCase().includes(term)
      )
    })
  }, [orders, searchTerm, searchStatus])

  const isOrderSaved = useMemo(() => orders.some(order => order.reg === form.reg), [orders, form.reg])

  const nextPurchaseNumber = useMemo(() => {
    if (purchases.length === 0) return 'M001'

    const numbers = purchases
      .map(purchase => Number(String(purchase.numero || '').replace(/\D/g, '')))
      .filter(number => Number.isFinite(number))

    const highest = numbers.length > 0 ? Math.max(...numbers) : 0
    return `M${String(highest + 1).padStart(3, '0')}`
  }, [purchases])

  const filteredPurchases = useMemo(() => {
    const term = purchaseSearchTerm.toLowerCase()
    return purchases.filter(purchase => {
      if (!term) return true
      const itemText = getPurchaseItems(purchase).flatMap(item => Object.values(item)).join(' ')
      return `${Object.values(purchase).join(' ')} ${itemText}`.toLowerCase().includes(term)
    })
  }, [purchases, purchaseSearchTerm])

  const filteredPurchaseItems = useMemo(() => {
    return filteredPurchases.flatMap(purchase =>
      getPurchaseItems(purchase).map((item, itemIndex) => ({ purchase, item, itemIndex }))
    )
  }, [filteredPurchases])

  const equipamentoMap = useMemo(() => {
    return Object.fromEntries(equipamentoOptions.map(item => [item.code, item.label]))
  }, [])

  const getOrderTimestamp = order => {
    const value = order?.horaParada
    if (!value) return Number.NEGATIVE_INFINITY
    const parsed = getDateTimestamp(value)
    return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed
  }

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const aTime = getOrderTimestamp(a)
      const bTime = getOrderTimestamp(b)

      if (aTime === bTime) return 0
      return bTime - aTime
    })
  }, [orders])

  const getOrderIndexInOrders = order => {
    if (!order) return -1
    return orders.findIndex(item => item.reg === order.reg)
  }

  const newestOrderIndex = sortedOrders[0] ? getOrderIndexInOrders(sortedOrders[0]) : -1
  const oldestOrderIndex = sortedOrders[sortedOrders.length - 1] ? getOrderIndexInOrders(sortedOrders[sortedOrders.length - 1]) : -1

  const navigateToOrder = direction => {
    if (orders.length === 0) return

    const targetOrder = direction > 0 ? sortedOrders[0] : sortedOrders[sortedOrders.length - 1]
    if (!targetOrder) return

    setCurrentOrderIndex(getOrderIndexInOrders(targetOrder))
  }

  const nextReg = useMemo(() => {
    if (orders.length === 0) return '001'

    const parsedRegs = orders
      .map(order => String(order.reg || ''))
      .map(reg => {
        const suffix = reg.match(/\d+$/)
        if (!suffix) return null
        return {
          reg,
          prefix: reg.slice(0, suffix.index),
          number: Number(suffix[0]),
          width: suffix[0].length
        }
      })
      .filter(Boolean)

    if (parsedRegs.length === 0) return '001'

    const highestReg = parsedRegs.reduce((max, current) => (current.number > max.number ? current : max))
    const nextNumber = highestReg.number + 1

    return `${highestReg.prefix}${String(nextNumber).padStart(highestReg.width, '0')}`
  }, [orders])

  const nextExtraOrd = useMemo(() => {
    const highestOrd = extraEntries
      .map(entry => Number(String(entry.ord || '').replace(/\D/g, '')))
      .filter(Number.isFinite)
      .reduce((highest, ord) => Math.max(highest, ord), 0)

    return String(highestOrd + 1).padStart(3, '0')
  }, [extraEntries])

  useEffect(() => {
    if (orders.length === 0) {
      setCurrentOrderIndex(-1)
      return
    }
    if (currentOrderIndex >= orders.length) {
      setCurrentOrderIndex(orders.length - 1)
    }
  }, [orders, currentOrderIndex])

  useEffect(() => {
    if (currentOrderIndex >= 0 && orders[currentOrderIndex]) {
      setForm(orders[currentOrderIndex])
    } else {
      setForm({ ...emptyOrder, reg: nextReg })
    }
  }, [currentOrderIndex, orders, nextReg])

  useEffect(() => {
    if (selectedSection !== 'horaextra' || editingExtraEntryId || extraForm.ord) return
    setExtraForm(prev => ({ ...prev, ord: nextExtraOrd }))
  }, [selectedSection, editingExtraEntryId, extraForm.ord, nextExtraOrd])

  useEffect(() => {
    if (selectedSection !== 'compras') return

    if (currentPurchaseIndex >= 0 && purchases[currentPurchaseIndex]) {
      const purchase = purchases[currentPurchaseIndex]
      setPurchaseForm({ ...emptyPurchase, ...purchase, items: getPurchaseItems(purchase) })
      return
    }

    setPurchaseForm(prev => ({
      ...prev,
      numero: prev.numero || nextPurchaseNumber,
      dataSolicitacao: prev.dataSolicitacao || getCurrentDate()
    }))
  }, [selectedSection, currentPurchaseIndex, purchases, nextPurchaseNumber])

  const saveLocalData = data => {
    localStorage.setItem('os_easy_orders', JSON.stringify(data.orders))
    localStorage.setItem('os_easy_hour_extras', JSON.stringify(data.extraEntries))
    localStorage.setItem('os_easy_purchases', JSON.stringify(data.purchases))
    localStorage.setItem('os_easy_catalog_items', JSON.stringify(data.catalogItems))
  }

  const applySharedData = data => {
    const normalized = {
      orders: Array.isArray(data.orders) ? data.orders : [],
      extraEntries: Array.isArray(data.extraEntries) ? data.extraEntries : [],
      purchases: Array.isArray(data.purchases) ? data.purchases : [],
      catalogItems: Array.isArray(data.catalogItems) ? data.catalogItems : []
    }

    sharedDataRef.current = normalized
    setOrders(normalized.orders)
    setExtraEntries(normalized.extraEntries)
    setPurchases(normalized.purchases)
    setCatalogItems(normalized.catalogItems)
    saveLocalData(normalized)
  }

  const getRecordId = (collection, record) => {
    if (collection === 'orders') return record.reg
    if (collection === 'purchases') return record.numero
    return record._syncId
  }

  const getChanges = (collection, previousItems, nextItems) => {
    const previousById = new Map(previousItems.map(item => [getRecordId(collection, item), item]))
    const nextById = new Map(nextItems.map(item => [getRecordId(collection, item), item]))
    const upserts = nextItems.filter(item => {
      const id = getRecordId(collection, item)
      return id && JSON.stringify(previousById.get(id)) !== JSON.stringify(item)
    })
    const deletes = previousItems
      .map(item => getRecordId(collection, item))
      .filter(id => id && !nextById.has(id))

    return { collection, upserts, deletes }
  }

  const sendSharedData = async (data, changes) => {
    setSyncStatus('Sincronizando dados...')
    try {
      const response = await fetch(syncEndpoint, {
        method: changes ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes || data)
      })

      if (!response.ok) throw new Error('Falha ao salvar')
      const store = await response.json()
      if (store.data) applySharedData(store.data)
      setSyncStatus('Dados sincronizados')
    } catch {
      setSyncStatus('Sem conexão com a base compartilhada')
    }
  }

  useEffect(() => {
    let active = true

    const synchronize = async (initial = false) => {
      try {
        const response = await fetch(syncEndpoint)
        if (!response.ok) throw new Error('Falha ao carregar')
        const store = await response.json()
        if (!active) return

        if (initial && !store.initialized) {
          await sendSharedData(sharedDataRef.current)
          return
        }

        const remoteData = store.data || emptySharedData
        if (JSON.stringify(remoteData) !== JSON.stringify(sharedDataRef.current)) {
          applySharedData(remoteData)
        }
        setSyncStatus('Dados sincronizados')
      } catch {
        if (active) setSyncStatus('Sem conexão com a base compartilhada')
      }
    }

    synchronize(true)
    const interval = window.setInterval(() => synchronize(), 5000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [])

  const saveOrders = nextOrders => {
    const previousData = sharedDataRef.current
    const data = { ...previousData, orders: nextOrders }
    sharedDataRef.current = data
    setOrders(nextOrders)
    saveLocalData(data)
    void sendSharedData(data, getChanges('orders', previousData.orders, nextOrders))
  }

  const saveExtraEntries = nextEntries => {
    const entriesWithIds = nextEntries.map(entry => ({ ...entry, _syncId: entry._syncId || createSyncId() }))
    const previousData = sharedDataRef.current
    const data = { ...previousData, extraEntries: entriesWithIds }
    sharedDataRef.current = data
    setExtraEntries(entriesWithIds)
    saveLocalData(data)
    void sendSharedData(data, getChanges('extraEntries', previousData.extraEntries, entriesWithIds))
  }

  const savePurchases = nextPurchases => {
    const previousData = sharedDataRef.current
    const data = { ...previousData, purchases: nextPurchases }
    sharedDataRef.current = data
    setPurchases(nextPurchases)
    saveLocalData(data)
    void sendSharedData(data, getChanges('purchases', previousData.purchases, nextPurchases))
  }

  const saveCatalogItems = nextCatalogItems => {
    const itemsWithIds = nextCatalogItems.map(item => ({ ...item, _syncId: item._syncId || createSyncId() }))
    const previousData = sharedDataRef.current
    const data = { ...previousData, catalogItems: itemsWithIds }
    sharedDataRef.current = data
    setCatalogItems(itemsWithIds)
    saveLocalData(data)
    void sendSharedData(data, getChanges('catalogItems', previousData.catalogItems, itemsWithIds))
  }

  const handleChange = event => {
    const { name, value } = event.target

    if (name === 'equipamento') {
      const setor = equipamentoMap[value] || ''
      setForm(prev => ({ ...prev, equipamento: value, setor }))
      if (value) {
        setInvalidFields(prev => prev.filter(fieldName => fieldName !== 'equipamento'))
      }
      return
    }

    setForm(prev => ({ ...prev, [name]: value }))
    if (value && invalidFields.includes(name)) {
      setInvalidFields(prev => prev.filter(fieldName => fieldName !== name))
    }
  }

  const getFirstMissingField = formData => requiredFields.find(field => {
    const value = formData[field.name]
    return value === '' || value === null || value === undefined
  })

  const getMissingFields = formData => requiredFields.filter(field => {
    const value = formData[field.name]
    return value === '' || value === null || value === undefined
  }).map(field => field.name)

  const handleFinalizeOS = () => {
    const missingFieldNames = getMissingFields(form)
    if (missingFieldNames.length > 0) {
      setInvalidFields(missingFieldNames)
      const element = formRefs.current[missingFieldNames[0]]
      if (element?.focus) {
        element.focus()
        if (element.scrollIntoView) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
      return
    }

    setForm(prev => ({ ...prev, status: 'Finalizada' }))
  }

  const handleExtraChange = event => {
    const { name, value } = event.target

    if (name === 'colaborador') {
      const details = colaboradorDetails[value] || { turnoHE: '', funcao: '' }
      setExtraForm(prev => ({ ...prev, colaborador: value, ...details }))
      return
    }

    setExtraForm(prev => ({ ...prev, [name]: value }))
  }

  const handlePurchaseChange = event => {
    const { name, value } = event.target
    setPurchaseForm(prev => ({ ...prev, [name]: value }))

    if (value && purchaseInvalidFields.includes(name)) {
      setPurchaseInvalidFields(prev => prev.filter(fieldName => fieldName !== name))
    }
  }

  const handlePurchaseItemChange = (index, event) => {
    const { name, value } = event.target
    const fieldName = `item-${index}-${name}`
    setPurchaseForm(prev => ({
      ...prev,
      items: prev.items.map((item, itemIndex) => itemIndex === index ? { ...item, [name]: value } : item)
    }))
    if (value && purchaseInvalidFields.includes(fieldName)) {
      setPurchaseInvalidFields(prev => prev.filter(invalidField => invalidField !== fieldName))
    }
  }

  const handleAddPurchaseItem = () => {
    setPurchaseForm(prev => ({ ...prev, items: [...prev.items, { ...emptyPurchaseItem }] }))
  }

  const handleRemovePurchaseItem = index => {
    setPurchaseForm(prev => ({ ...prev, items: prev.items.filter((_, itemIndex) => itemIndex !== index) }))
  }

  const getPurchaseMissingFields = formData => {
    const requestMissing = [
      { name: 'setor', label: 'Setor' },
      { name: 'tipoSolicitacao', label: 'Tipo de solicitação' },
      { name: 'solicitante', label: 'Solicitante' },
      { name: 'dataSolicitacao', label: 'Data da solicitação' }
    ].filter(field => {
    const value = formData[field.name]
    return value === '' || value === null || value === undefined
    }).map(field => field.name)
    const itemMissing = getPurchaseItems(formData).flatMap((item, index) => [
      'tipoComponente', 'descricao', 'quantidade'
    ].filter(field => item[field] === '' || item[field] === null || item[field] === undefined)
      .map(field => `item-${index}-${field}`))
    return [...requestMissing, ...itemMissing]
  }

  const handlePurchaseSubmit = event => {
    event.preventDefault()

    const missingFieldNames = getPurchaseMissingFields(purchaseForm)
    if (missingFieldNames.length > 0) {
      setPurchaseInvalidFields(missingFieldNames)
      const element = purchaseFormRefs.current[missingFieldNames[0]]
      if (element?.focus) {
        element.focus()
        if (element.scrollIntoView) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
      return
    }

    const items = getPurchaseItems(purchaseForm).map(item => ({ ...item, quantidade: Number(item.quantidade) }))
    const payload = {
      ...purchaseForm,
      numero: purchaseForm.numero || nextPurchaseNumber,
      items,
      tipoComponente: items[0].tipoComponente,
      descricao: items[0].descricao,
      quantidade: items[0].quantidade,
      unidade: items[0].unidade,
      dataSolicitacao: purchaseForm.dataSolicitacao || getCurrentDate(),
      status: purchaseForm.status || 'Pendente'
    }

    if (currentPurchaseIndex >= 0) {
      const nextPurchases = purchases.map((item, index) => index === currentPurchaseIndex ? payload : item)
      savePurchases(nextPurchases)
    } else {
      savePurchases([payload, ...purchases])
    }

    setPurchaseInvalidFields([])
    setCurrentPurchaseIndex(-1)
    setPurchaseForm({
      ...emptyPurchase,
      dataSolicitacao: getCurrentDate()
    })
    setPurchaseSearchTerm('')
  }

  const handlePurchaseClear = () => {
    setPurchaseForm({
      ...emptyPurchase,
      numero: nextPurchaseNumber,
      dataSolicitacao: getCurrentDate()
    })
    setCurrentPurchaseIndex(-1)
    setPurchaseInvalidFields([])
    setPurchaseSearchTerm('')
  }

  const handlePurchaseDelete = () => {
    if (currentPurchaseIndex < 0) return
    const nextPurchases = purchases.filter((_, index) => index !== currentPurchaseIndex)
    savePurchases(nextPurchases)
    setCurrentPurchaseIndex(-1)
    handlePurchaseClear()
  }

  const handleCatalogImageChange = event => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setCatalogError('Selecione um arquivo de imagem válido.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setCatalogError('A imagem deve ter no máximo 5 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setCatalogImage(String(reader.result))
      setCatalogError('')
    }
    reader.onerror = () => setCatalogError('Não foi possível carregar a imagem.')
    reader.readAsDataURL(file)
  }

  const handleCatalogSubmit = event => {
    event.preventDefault()
    if (!catalogImage || !catalogDescription.trim()) {
      setCatalogError('Inclua uma figura e sua descrição antes de adicionar ao catálogo.')
      return
    }

    saveCatalogItems([...catalogItems, {
      _syncId: createSyncId(),
      image: catalogImage,
      description: catalogDescription.trim(),
      createdAt: new Date().toISOString()
    }])
    setCatalogImage('')
    setCatalogDescription('')
    setCatalogError('')
    event.currentTarget.reset()
  }

  const handleCatalogDelete = itemId => {
    saveCatalogItems(catalogItems.filter(item => item._syncId !== itemId))
  }

  const handleCatalogEditStart = item => {
    setEditingCatalogItemId(item._syncId)
    setEditingCatalogDescription(item.description)
  }

  const handleCatalogEditSave = itemId => {
    const description = editingCatalogDescription.trim()
    if (!description) return
    saveCatalogItems(catalogItems.map(item => item._syncId === itemId ? { ...item, description } : item))
    setEditingCatalogItemId('')
    setEditingCatalogDescription('')
  }

  const handleCatalogEditCancel = () => {
    setEditingCatalogItemId('')
    setEditingCatalogDescription('')
  }

  const handleSubmit = event => {
    event.preventDefault()

    const missingFieldNames = getMissingFields(form)

    if (missingFieldNames.length > 0) {
      setInvalidFields(missingFieldNames)
      const element = formRefs.current[missingFieldNames[0]]
      if (element?.focus) {
        element.focus()
        if (element.scrollIntoView) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
      return
    }

    setInvalidFields([])
    const duplicateIndex = orders.findIndex(order => order.reg === form.reg)

    if (currentOrderIndex >= 0) {
      const nextOrders = orders.map((order, index) => index === currentOrderIndex ? form : order)
      saveOrders(nextOrders)
      setSelectedSection('cadastro')
      return
    }

    if (duplicateIndex !== -1) {
      const element = formRefs.current.reg
      if (element?.focus) element.focus()
      return
    }

    const nextOrders = [form, ...orders]
    saveOrders(nextOrders)
    setCurrentOrderIndex(-1)
    setSelectedSection('cadastro')
  }

  const handleDeleteOrder = () => {
    if (currentOrderIndex < 0) return
    const nextOrders = orders.filter((_, index) => index !== currentOrderIndex)
    saveOrders(nextOrders)
    setCurrentOrderIndex(-1)
    setSelectedSection('cadastro')
  }

  const handleExtraSubmit = event => {
    event.preventDefault()
    const entry = { ...extraForm, ord: extraForm.ord || nextExtraOrd, _syncId: editingExtraEntryId || createSyncId() }
    const nextEntries = editingExtraEntryId
      ? extraEntries.map(item => item._syncId === editingExtraEntryId ? entry : item)
      : [entry, ...extraEntries]
    saveExtraEntries(nextEntries)
    setExtraForm(extraEmpty)
    setEditingExtraEntryId('')
    setSelectedSection('horaextra')
  }

  const handleExtraEdit = entry => {
    setExtraForm({ ...extraEmpty, ...entry })
    setEditingExtraEntryId(entry._syncId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleExtraDelete = entryId => {
    saveExtraEntries(extraEntries.filter(entry => entry._syncId !== entryId))
    if (editingExtraEntryId === entryId) {
      setExtraForm(extraEmpty)
      setEditingExtraEntryId('')
    }
  }

  const handleExtraClear = () => {
    setExtraForm({ ...extraEmpty, ord: nextExtraOrd })
    setEditingExtraEntryId('')
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col gap-4 px-3 py-3 sm:px-6 sm:py-6 lg:flex-row lg:gap-6 lg:px-8">
        <aside className="flex w-full flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-950 p-4 text-white shadow-soft lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-xl text-white">PC</div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-300">Sistema</p>
                <h1 className="text-base font-semibold text-white">SmartMaint - PCM</h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {menuItems.map(item => (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelectedSection(item.key)}
                className={`rounded-2xl px-2 py-2 text-center text-[0.72rem] font-medium transition ${
                  selectedSection === item.key
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/15'
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <aside className="hidden w-72 flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white shadow-soft lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-800 text-2xl text-white">
              PC
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Sistema</p>
              <h1 className="text-xl font-semibold text-white">SmartMaint - PCM</h1>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Menu</p>
            {menuItems.map(item => (

              <button
                key={item.key}
                type="button"
                onClick={() => setSelectedSection(item.key)}
                className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm font-medium transition ${
                  selectedSection === item.key
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/15'
                    : 'text-white hover:bg-slate-800'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-auto rounded-3xl bg-slate-800 p-4 text-sm text-white shadow-inner">
            <p className="font-semibold text-white">Cadastro rápido</p>
            <p className="mt-2 text-xs leading-5 text-slate-200">Use o formulário para incluir PC com todos os campos essenciais e depois pesquise.</p>
          </div>
        </aside>

        <main className="flex-1 rounded-3xl border border-slate-200 bg-white p-3 shadow-soft sm:p-4">
          <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">
                {selectedSection === 'horaextra'
                  ? 'Formulário de HE Manut.'
                  : selectedSection === 'pesquisa'
                    ? 'Status OS'
                    : selectedSection === 'compras'
                      ? 'Formulário de Pedidos'
                      : selectedSection === 'catalogo'
                        ? 'Catálogo Manutenção'
                      : 'Registro de OS - Manutenção'}


            </h2>
            <p className="mt-1 text-xs text-slate-500" aria-live="polite">{syncStatus}</p>
            </div>
          </div>


          <div className="grid gap-6 lg:grid-cols-1">
            <section className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 ${selectedSection === 'cadastro' ? 'lg:min-h-[700px] lg:p-3' : selectedSection === 'horaextra' ? 'lg:min-h-[700px] lg:p-8' : ''}`}>
              {selectedSection !== 'cadastro' ? (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-950">
                      {selectedSection === 'horaextra' ? 'Formulário de HE Manut.' : ''}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {selectedSection === 'horaextra' ? 'Registre a hora extra do colaborador.' : ''}
                    </p>
                  </div>
                </div>
              ) : null}

              {selectedSection === 'cadastro' ? (
                <form className="mt-0 grid gap-4" onSubmit={handleSubmit}>
                  <div className="rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-slate-500">Status da OS</p>
                      <div className="flex flex-wrap gap-2 text-[0.65rem]">
                        {statusOptions.map(option => {
                          const statusStyle =
                            option === 'Pendente'
                              ? { active: 'bg-red-600 text-white hover:bg-red-700', inactive: 'border border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:text-red-700' }
                              : option === 'Iniciada'
                                ? { active: 'bg-yellow-400 text-black hover:bg-yellow-500', inactive: 'border border-slate-200 bg-white text-slate-600 hover:border-yellow-300 hover:text-yellow-700' }
                                : { active: 'bg-blue-600 text-white hover:bg-blue-700', inactive: 'border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700' }

                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => setForm(prev => ({ ...prev, status: option }))}
                              className={`rounded-full px-2.5 py-1 font-medium transition ${form.status === option ? statusStyle.active : statusStyle.inactive}`}
                            >
                              {option}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-3xl border-t border-slate-200 pt-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Dados da solicitação</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-700">
                      <span>Setor</span>
                      <input name="setor" value={form.setor} disabled className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-600 outline-none" />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm">
                      <span className={`block font-medium ${invalidFields.includes('equipamento') ? 'text-red-600' : 'text-slate-700'}`}>Equipamento*</span>
                      <select ref={el => (formRefs.current.equipamento = el)} name="equipamento" value={form.equipamento} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500">
                        <option value="">Selecione o equipamento</option>
                        {equipamentoOptions.map(item => (
                          <option key={item.code} value={item.code}>{item.code} - {item.label}</option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className={`block font-medium ${invalidFields.includes('solicitante') ? 'text-red-600' : 'text-slate-700'}`}>Solicitante*</span>
                      <select ref={el => (formRefs.current.solicitante = el)} name="solicitante" value={form.solicitante} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500">
                        <option value="">Selecione o solicitante</option>
                        {solicitanteOptions.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm">
                      <span className={`block font-medium ${invalidFields.includes('horaParada') ? 'text-red-600' : 'text-slate-700'}`}>Hora Parada*</span>
                      <input ref={el => (formRefs.current.horaParada = el)} type="datetime-local" name="horaParada" value={toDateTimeLocal(form.horaParada)} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500" />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className={`block font-medium ${invalidFields.includes('motivoAbertura') ? 'text-red-600' : 'text-slate-700'}`}>Breve descrição do problema*</span>
                      <input ref={el => (formRefs.current.motivoAbertura = el)} type="text" name="motivoAbertura" value={form.motivoAbertura} onChange={handleChange} placeholder="Informe o motivo da abertura" className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500" />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="space-y-2 text-sm text-slate-700">
                      <span>Tipo Serviço</span>
                      <select name="tipoServico" value={form.tipoServico} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500">
                        <option value="">Selecione o tipo</option>
                        <option>CORRETIVA</option>
                        <option>PREVENTIVA</option>
                        <option>URGENTE</option>
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-slate-700">
                      <span>Prioridade</span>
                      <select name="prioridade" value={form.prioridade} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500">
                        <option value="">Selecione a prioridade</option>
                        <option>URGENTE</option>
                        <option>ALTA</option>
                        <option>MÉDIA</option>
                        <option>BAIXA</option>
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-slate-700">
                      <span>Especialidade</span>
                      <select name="especialidade" value={form.especialidade} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500">
                        <option value="">Selecione a especialidade</option>
                        <option>MECÂNICA</option>
                        <option>ELÉTRICA</option>
                        <option>PROGRAMAÇÃO</option>
                        <option>INSPEÇÃO</option>
                      </select>
                    </label>
                  </div>

                  <div className="space-y-2 rounded-3xl border-t border-slate-200 pt-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Dados do Especialista</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm">
                      <span className="block font-medium text-slate-700">Técnico</span>
                      <select ref={el => (formRefs.current.tecnico = el)} name="tecnico" value={form.tecnico} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500">
                        <option value="">Selecione o técnico</option>
                        {tecnicoOptions.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-slate-700">
                      <span>Turno</span>
                      <select name="turno" value={form.turno} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500">
                        <option value="">Selecione o turno</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                      </select>
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm">
                      <span className="block font-medium text-slate-700">Hora Inicial</span>
                      <input ref={el => (formRefs.current.horaInicio = el)} type="datetime-local" name="horaInicio" value={toDateTimeLocal(form.horaInicio)} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500" />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="block font-medium text-slate-700">Hora Final</span>
                      <input ref={el => (formRefs.current.horaFinal = el)} type="datetime-local" name="horaFinal" value={toDateTimeLocal(form.horaFinal)} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500" />
                    </label>
                  </div>

                  <label className="space-y-2 text-sm">
                    <span className="block font-medium text-slate-700">Descrição do Serviço</span>
                    <textarea name="descricao" value={form.descricao} onChange={handleChange} rows="4" className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500"></textarea>
                  </label>

                  <div className="order-first mt-0 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-center">
                    <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                      <button
                        type="button"
                        onClick={() => navigateToOrder(-1)}
                        disabled={orders.length === 0 || currentOrderIndex === oldestOrderIndex}
                        className={`rounded-full px-3 py-2 text-sm font-medium transition ${orders.length === 0 || currentOrderIndex === oldestOrderIndex ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-brand-500 text-white hover:bg-brand-600'}`}
                      >
                        Anterior
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateToOrder(1)}
                        disabled={orders.length === 0 || currentOrderIndex === newestOrderIndex}
                        className={`rounded-full px-3 py-2 text-sm font-medium transition ${orders.length === 0 || currentOrderIndex === newestOrderIndex ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-brand-500 text-white hover:bg-brand-600'}`}
                      >
                        Próximo
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentOrderIndex(-1)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Nova OS
                      </button>
                    </div>
                    <div className="text-center text-sm text-slate-500">
                      {currentOrderIndex === -1
                        ? `OS Nº ${nextReg}`
                        : `Registro ${orders[currentOrderIndex]?.reg || '-'} (${currentOrderIndex + 1}/${orders.length})`}
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
                    <div className="flex flex-wrap justify-center gap-3">
                      <button type="submit" className="rounded-3xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700">Salvar</button>
                      <button type="button" onClick={() => setForm(emptyOrder)} className="rounded-3xl border border-slate-300 bg-white px-5 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100">Limpar</button>
                      <button type="button" onClick={handleDeleteOrder} disabled={currentOrderIndex < 0} className={`rounded-3xl border px-5 py-2.5 text-sm font-semibold transition ${currentOrderIndex < 0 ? 'border-red-200 bg-red-50 text-red-200 cursor-not-allowed' : 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'}`}>Excluir</button>
                    </div>
                    <button
                      type="button"
                      onClick={handleFinalizeOS}
                      disabled={!isOrderSaved}
                      className={`rounded-3xl border px-5 py-2.5 text-sm font-semibold transition ${isOrderSaved ? 'border-brand-500 bg-brand-50 text-brand-600 hover:bg-brand-100' : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                    >
                      Finalizar OS
                    </button>
                  </div>
                </form>
              ) : selectedSection === 'horaextra' ? (
                <>
                <form className="mt-6 grid gap-4" onSubmit={handleExtraSubmit}>
                  <div className="space-y-2 rounded-3xl border-t border-slate-200 pt-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Hora Extra</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-700">
                      <span>ORD</span>
                      <input name="ord" value={extraForm.ord} readOnly aria-label="ORD gerada automaticamente" className="w-full cursor-not-allowed rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600 outline-none" />
                    </label>
                    <label className="space-y-2 text-sm text-slate-700">
                      <span>Nome do Colaborador</span>
                      <select name="colaborador" value={extraForm.colaborador} onChange={handleExtraChange} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500">
                        <option value="">Selecione o colaborador</option>
                        {colaboradorOptions.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-700">
                      <span>Função</span>
                      <input name="funcao" value={extraForm.funcao} readOnly placeholder="Selecione o colaborador" className="w-full cursor-not-allowed rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600 outline-none" />
                    </label>
                    <label className="space-y-2 text-sm text-slate-700">
                      <span>Turno</span>
                      <select name="turnoHE" value={extraForm.turnoHE} disabled className="w-full cursor-not-allowed rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600 outline-none disabled:opacity-100">
                        <option value="">Selecione ou autocompletar</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="ESPECIAL">ESPECIAL</option>
                        <option value="COMERCIAL">COMERCIAL</option>
                      </select>
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-700">
                      <span>Data HE</span>
                      <input type="datetime-local" name="dataHE" value={toDateTimeLocal(extraForm.dataHE)} onChange={handleExtraChange} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500" />
                    </label>
                    <label className="space-y-2 text-sm text-slate-700">
                      <span>Data Início</span>
                      <input type="datetime-local" name="dataInicio" value={toDateTimeLocal(extraForm.dataInicio)} onChange={handleExtraChange} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500" />
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-700">
                      <span>Data Término</span>
                      <input type="datetime-local" name="dataTermino" value={toDateTimeLocal(extraForm.dataTermino)} onChange={handleExtraChange} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500" />
                    </label>
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="submit" className="rounded-3xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">{editingExtraEntryId ? 'Atualizar' : 'Salvar'}</button>
                    <button type="button" onClick={handleExtraClear} className="rounded-3xl border border-slate-300 bg-white px-6 py-3 text-sm text-slate-700 transition hover:bg-slate-100">Limpar</button>
                  </div>
                </form>
                <div className="mt-8 border-t border-slate-200 pt-6">
                  <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-slate-950">Funcionários registrados em HE</h4>
                      <p className="mt-1 text-sm text-slate-500">Edite ou remova um lançamento diretamente pelo painel.</p>
                    </div>
                    <span className="text-sm font-medium text-slate-500">{extraEntries.length} registro{extraEntries.length === 1 ? '' : 's'}</span>
                  </div>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-[920px] w-full border-collapse text-left text-xs">
                      <thead className="bg-slate-100 text-slate-500">
                        <tr>
                          <th className="px-3 py-2.5 font-medium">ORD</th>
                          <th className="px-3 py-2.5 font-medium">Colaborador</th>
                          <th className="px-3 py-2.5 font-medium">Função</th>
                          <th className="px-3 py-2.5 font-medium">Turno</th>
                          <th className="px-3 py-2.5 font-medium">Data HE</th>
                          <th className="px-3 py-2.5 font-medium">Início</th>
                          <th className="px-3 py-2.5 font-medium">Término</th>
                          <th className="px-3 py-2.5 text-center font-medium">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {extraEntries.length === 0 ? (
                          <tr><td colSpan="8" className="px-3 py-5 text-center text-sm text-slate-500">Nenhum funcionário registrado em hora extra.</td></tr>
                        ) : (
                          extraEntries.map(entry => (
                            <tr key={entry._syncId} className={`border-t border-slate-200/70 ${editingExtraEntryId === entry._syncId ? 'bg-brand-50/60' : 'hover:bg-slate-50'}`}>
                              <td className="px-3 py-2.5 whitespace-nowrap text-slate-700">{entry.ord || '—'}</td>
                              <td className="px-3 py-2.5 font-medium text-slate-800">{entry.colaborador || '—'}</td>
                              <td className="px-3 py-2.5 whitespace-nowrap text-slate-700">{entry.funcao || '—'}</td>
                              <td className="px-3 py-2.5 whitespace-nowrap text-slate-700">{entry.turnoHE || '—'}</td>
                              <td className="px-3 py-2.5 whitespace-nowrap text-slate-700">{formatDateTime(entry.dataHE) || '—'}</td>
                              <td className="px-3 py-2.5 whitespace-nowrap text-slate-700">{formatDateTime(entry.dataInicio) || '—'}</td>
                              <td className="px-3 py-2.5 whitespace-nowrap text-slate-700">{formatDateTime(entry.dataTermino) || '—'}</td>
                              <td className="px-3 py-2.5">
                                <div className="flex justify-center gap-1.5">
                                  <button type="button" onClick={() => handleExtraEdit(entry)} className="rounded-lg px-2.5 py-1.5 font-medium text-brand-700 transition hover:bg-brand-50" aria-label={`Editar ${entry.colaborador || 'funcionário'}`} title="Editar funcionário">Editar</button>
                                  <button type="button" onClick={() => handleExtraDelete(entry._syncId)} className="rounded-lg px-2.5 py-1.5 font-medium text-red-700 transition hover:bg-red-50" aria-label={`Remover ${entry.colaborador || 'funcionário'}`} title="Remover funcionário">Remover</button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                </>
              ) : selectedSection === 'catalogo' ? (
                <div className="mt-2 grid gap-5">
                  <form onSubmit={handleCatalogSubmit} className="grid gap-3 border-b border-slate-200 pb-5">
                    <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)]">
                      <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white p-3 text-center transition hover:border-brand-500 hover:bg-brand-50/40">
                        {catalogImage ? <img src={catalogImage} alt="Prévia do item do catálogo" className="max-h-32 w-full rounded-xl object-contain" /> : <span className="text-sm text-slate-500">Selecionar figura</span>}
                        <input type="file" accept="image/*" onChange={handleCatalogImageChange} className="sr-only" />
                      </label>
                      <label className="flex min-h-32 flex-col gap-2 text-sm text-slate-700">
                        <span className="font-medium">Descrição*</span>
                        <textarea value={catalogDescription} onChange={event => { setCatalogDescription(event.target.value); setCatalogError('') }} rows="3" placeholder="Descreva o componente, aplicação ou orientação de manutenção" className="min-h-24 w-full flex-1 resize-y rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500" />
                      </label>
                    </div>
                    {catalogError ? <p className="text-sm text-red-600">{catalogError}</p> : null}
                    <div className="flex justify-end"><button type="submit" className="rounded-2xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700">Adicionar ao catálogo</button></div>
                  </form>

                  <div className="flex flex-wrap justify-end gap-3">
                    {catalogItems.length === 0 ? (
                      <p className="text-sm text-slate-500">Nenhum item cadastrado no catálogo.</p>
                    ) : (
                      [...catalogItems].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)).map(item => {
                        const isEditing = editingCatalogItemId === item._syncId
                        return (
                          <article key={item._syncId} className="w-[calc((100%-0.75rem)/2)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:w-[calc((100%-1.5rem)/3)] lg:w-[calc((100%-2.25rem)/4)] xl:w-[calc((100%-3rem)/5)]">
                            <img src={item.image} alt={item.description} className="aspect-[4/3] w-full bg-slate-100 object-contain" />
                            <div className="p-2.5">
                              {isEditing ? (
                                <div className="grid gap-2">
                                  <textarea value={editingCatalogDescription} onChange={event => setEditingCatalogDescription(event.target.value)} rows="3" className="w-full resize-y rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-brand-500" />
                                  <div className="flex justify-end gap-1">
                                    <button type="button" onClick={handleCatalogEditCancel} className="rounded-lg px-2 py-1 text-xs text-slate-600 hover:bg-slate-100">Cancelar</button>
                                    <button type="button" onClick={() => handleCatalogEditSave(item._syncId)} disabled={!editingCatalogDescription.trim()} className="rounded-lg bg-brand-500 px-2 py-1 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">Salvar</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-start justify-between gap-2">
                                  <p className="line-clamp-3 whitespace-pre-wrap text-xs leading-5 text-slate-700">{item.description}</p>
                                  <div className="flex shrink-0 gap-1">
                                    <button type="button" onClick={() => handleCatalogEditStart(item)} className="h-7 w-7 rounded-lg text-base text-brand-600 transition hover:bg-brand-50" aria-label="Editar descrição" title="Editar descrição">✎</button>
                                    <button type="button" onClick={() => handleCatalogDelete(item._syncId)} className="h-7 w-7 rounded-lg text-base text-red-600 transition hover:bg-red-50" aria-label="Remover item do catálogo" title="Remover item">×</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </article>
                        )
                      })
                    )}
                  </div>
                </div>
              ) : selectedSection === 'compras' ? (
                <form className="mt-6 grid gap-4" onSubmit={handlePurchaseSubmit}>
                  <div className="space-y-2 rounded-3xl border-t border-slate-200 pt-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Pedidos</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-700">
                      <span>Número</span>
                      <input name="numero" value={purchaseForm.numero} disabled className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-600 outline-none" />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className={`block font-medium ${purchaseInvalidFields.includes('dataSolicitacao') ? 'text-red-600' : 'text-slate-700'}`}>Data da solicitação*</span>
                      <input ref={el => (purchaseFormRefs.current.dataSolicitacao = el)} type="date" name="dataSolicitacao" value={toDateInput(purchaseForm.dataSolicitacao)} onChange={handlePurchaseChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500" />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm">
                      <span className={`block font-medium ${purchaseInvalidFields.includes('setor') ? 'text-red-600' : 'text-slate-700'}`}>Setor*</span>
                      <select ref={el => (purchaseFormRefs.current.setor = el)} name="setor" value={purchaseForm.setor} onChange={handlePurchaseChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500">
                        <option value="">Selecione o setor</option>
                        {purchaseSetorOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className={`block font-medium ${purchaseInvalidFields.includes('tipoSolicitacao') ? 'text-red-600' : 'text-slate-700'}`}>Tipo de solicitação*</span>
                      <select ref={el => (purchaseFormRefs.current.tipoSolicitacao = el)} name="tipoSolicitacao" value={purchaseForm.tipoSolicitacao} onChange={handlePurchaseChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500">
                        <option value="">Selecione</option>
                        {purchaseSolicitacaoOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Itens do pedido</p>
                      <button type="button" onClick={handleAddPurchaseItem} className="rounded-xl border border-brand-500 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100">Adicionar item</button>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                      <table className="min-w-[700px] w-full border-collapse text-left text-sm">
                        <thead className="bg-slate-100 text-slate-500">
                          <tr>
                            <th className="px-3 py-2 font-medium">Componente</th>
                            <th className="px-3 py-2 font-medium">Descrição</th>
                            <th className="w-28 px-3 py-2 font-medium">Qtd.</th>
                            <th className="w-28 px-3 py-2 font-medium">Unidade</th>
                            <th className="w-20 px-3 py-2 font-medium"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {purchaseForm.items.map((item, index) => (
                            <tr key={index} className="border-t border-slate-200">
                              <td className="p-2">
                                <select ref={el => (purchaseFormRefs.current[`item-${index}-tipoComponente`] = el)} name="tipoComponente" value={item.tipoComponente} onChange={event => handlePurchaseItemChange(index, event)} className={`w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 ${purchaseInvalidFields.includes(`item-${index}-tipoComponente`) ? 'border-red-400' : 'border-slate-200'}`}>
                                  <option value="">Selecione</option>
                                  {purchaseTipoComponenteOptions.map(option => <option key={option} value={option}>{option}</option>)}
                                </select>
                              </td>
                              <td className="p-2">
                                <input ref={el => (purchaseFormRefs.current[`item-${index}-descricao`] = el)} type="text" name="descricao" value={item.descricao} onChange={event => handlePurchaseItemChange(index, event)} placeholder="Descreva o produto" className={`w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 ${purchaseInvalidFields.includes(`item-${index}-descricao`) ? 'border-red-400' : 'border-slate-200'}`} />
                              </td>
                              <td className="p-2">
                                <input ref={el => (purchaseFormRefs.current[`item-${index}-quantidade`] = el)} type="number" min="1" name="quantidade" value={item.quantidade} onChange={event => handlePurchaseItemChange(index, event)} className={`w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 ${purchaseInvalidFields.includes(`item-${index}-quantidade`) ? 'border-red-400' : 'border-slate-200'}`} />
                              </td>
                              <td className="p-2">
                                <select name="unidade" value={item.unidade} onChange={event => handlePurchaseItemChange(index, event)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500">
                                  <option value="UN">UN</option><option value="CX">CX</option><option value="KG">KG</option><option value="M">M</option><option value="L">L</option>
                                </select>
                              </td>
                              <td className="p-2 text-center">
                                <button type="button" onClick={() => handleRemovePurchaseItem(index)} disabled={purchaseForm.items.length === 1} className={`h-9 w-9 rounded-xl text-lg transition ${purchaseForm.items.length === 1 ? 'cursor-not-allowed text-slate-300' : 'text-red-600 hover:bg-red-50'}`} aria-label="Remover item">×</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-700">
                      <span>Prioridade</span>
                      <select name="prioridade" value={purchaseForm.prioridade} onChange={handlePurchaseChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500">
                        <option value="Baixa">Baixa</option>
                        <option value="Média">Média</option>
                        <option value="Alta">Alta</option>
                        <option value="Urgente">Urgente</option>
                      </select>
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm">
                      <span className={`block font-medium ${purchaseInvalidFields.includes('solicitante') ? 'text-red-600' : 'text-slate-700'}`}>Solicitante*</span>
                      <input ref={el => (purchaseFormRefs.current.solicitante = el)} type="text" name="solicitante" value={purchaseForm.solicitante} onChange={handlePurchaseChange} placeholder="Informe o solicitante" className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500" />
                    </label>
                    <label className="space-y-2 text-sm text-slate-700">
                      <span>Status</span>
                      <select name="status" value={purchaseForm.status} onChange={handlePurchaseChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500">
                        {purchaseStatusOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="space-y-2 text-sm text-slate-700">
                    <span>Justificativas</span>
                    <textarea name="observacoes" value={purchaseForm.observacoes} onChange={handlePurchaseChange} rows="3" placeholder="Informe as justificativas" className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500"></textarea>
                  </label>

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
                    <div className="flex flex-wrap gap-3">
                      <button type="submit" className="rounded-3xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700">Salvar solicitação</button>
                      <button type="button" onClick={handlePurchaseClear} className="rounded-3xl border border-slate-300 bg-white px-5 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100">Limpar</button>
                      <button type="button" onClick={handlePurchaseDelete} disabled={currentPurchaseIndex < 0} className={`rounded-3xl border px-5 py-2.5 text-sm font-semibold transition ${currentPurchaseIndex < 0 ? 'border-red-200 bg-red-50 text-red-200 cursor-not-allowed' : 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'}`}>Excluir</button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mt-2 space-y-3">
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 shadow-sm sm:flex-row sm:justify-center sm:gap-4">
                    <p className="text-sm font-medium text-slate-500">Filtrar por status:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSearchStatus('')}
                        className={`rounded-full px-3 py-1 text-sm font-medium transition ${searchStatus === '' ? 'bg-slate-700 text-white hover:bg-slate-800' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800'}`}
                      >
                        Todos
                      </button>
                      {statusOptions.map(option => {
                        const statusStyle =
                          option === 'Pendente'
                            ? { active: 'bg-red-600 text-white hover:bg-red-700', inactive: 'border border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:text-red-700' }
                            : option === 'Iniciada'
                              ? { active: 'bg-yellow-400 text-black hover:bg-yellow-500', inactive: 'border border-slate-200 bg-white text-slate-600 hover:border-yellow-300 hover:text-yellow-700' }
                              : { active: 'bg-blue-600 text-white hover:bg-blue-700', inactive: 'border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700' }

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setSearchStatus(option)}
                            className={`rounded-full px-3 py-1 text-sm font-medium transition ${searchStatus === option ? statusStyle.active : statusStyle.inactive}`}
                          >
                            {option}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <label className="space-y-1 text-sm text-slate-700">
                      <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500" placeholder="Reg, setor, solicitante, técnico..." />
                    </label>
                  </div>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-max border-collapse text-left text-[0.65rem] sm:text-xs">
                      <thead className="bg-slate-100 text-slate-500">
                        <tr>
                          <th className="px-2.5 py-2 font-medium">Reg.</th>
                          <th className="px-2.5 py-2 font-medium">Setor</th>
                          <th className="px-2.5 py-2 font-medium">Equipamento</th>
                          <th className="px-2.5 py-2 font-medium">Solicitante</th>
                          <th className="px-2.5 py-2 font-medium">Hora Parada</th>
                          <th className="px-2.5 py-2 font-medium">Motivo</th>
                          <th className="px-2.5 py-2 font-medium">Tipo</th>
                          <th className="px-2.5 py-2 font-medium">Prior.</th>
                          <th className="px-2.5 py-2 font-medium">Esp.</th>
                          <th className="px-2.5 py-2 font-medium">Técnico</th>
                          <th className="px-2.5 py-2 font-medium">Status</th>
                          <th className="px-2.5 py-2 font-medium">Turno</th>
                          <th className="px-2.5 py-2 font-medium">Início</th>
                          <th className="px-2.5 py-2 font-medium">Final</th>
                          <th className="px-2.5 py-2 font-medium">Descrição</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan="15" className="px-2.5 py-4 text-center text-xs text-slate-500">Nenhum registro encontrado.</td>
                          </tr>
                        ) : (
                          filteredOrders.map((order, index) => (
                            <tr
                              key={`${order.reg}-${index}`}
                              className="cursor-pointer border-t border-slate-200/70 hover:bg-slate-50"
                              onDoubleClick={() => {
                                const orderIndex = orders.findIndex(item => item.reg === order.reg)
                                if (orderIndex >= 0) {
                                  setCurrentOrderIndex(orderIndex)
                                  setSelectedSection('cadastro')
                                }
                              }}
                            >
                              <td className="px-2.5 py-2 text-slate-700 whitespace-nowrap">{order.reg}</td>
                              <td className="px-2.5 py-2 text-slate-700 whitespace-nowrap">{order.setor}</td>
                              <td className="px-2.5 py-2 text-slate-700 whitespace-nowrap">{order.equipamento}</td>
                              <td className="px-2.5 py-2 text-slate-700 whitespace-nowrap">{order.solicitante}</td>
                              <td className="px-2.5 py-2 text-slate-700 whitespace-nowrap">{formatDateTime(order.horaParada)}</td>
                              <td className="px-2.5 py-2 text-slate-700 max-w-[180px] truncate">{order.motivoAbertura}</td>
                              <td className="px-2.5 py-2 text-slate-700 whitespace-nowrap">{order.tipoServico}</td>
                              <td className="px-2.5 py-2 text-slate-700 whitespace-nowrap">{order.prioridade}</td>
                              <td className="px-2.5 py-2 text-slate-700 whitespace-nowrap">{order.especialidade}</td>
                              <td className="px-2.5 py-2 text-slate-700 whitespace-nowrap">{order.tecnico}</td>
                              <td className="px-2.5 py-2 text-slate-700 whitespace-nowrap">{order.status}</td>
                              <td className="px-2.5 py-2 text-slate-700 whitespace-nowrap">{order.turno}</td>
                              <td className="px-2.5 py-2 text-slate-700 whitespace-nowrap">{formatDateTime(order.horaInicio)}</td>
                              <td className="px-2.5 py-2 text-slate-700 whitespace-nowrap">{formatDateTime(order.horaFinal)}</td>
                              <td className="px-2.5 py-2 text-slate-700 max-w-[220px] truncate">{order.descricao}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </section>

            {selectedSection === 'compras' ? (
              <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-950">Solicitações cadastradas</h3>
                    <p className="mt-2 text-sm text-slate-500">Edite ou consulte as compras já registradas.</p>
                  </div>
                  <label className="w-full max-w-sm text-sm text-slate-700 sm:w-auto">
                    <input value={purchaseSearchTerm} onChange={e => setPurchaseSearchTerm(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500" placeholder="Buscar por número, setor, descrição..." />
                  </label>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <table className="min-w-full border-collapse text-left text-xs">
                    <thead className="bg-slate-100 text-slate-500">
                      <tr>
                        <th className="px-2.5 py-2 font-medium">Nº</th>
                        <th className="px-2.5 py-2 font-medium">Setor</th>
                        <th className="px-2.5 py-2 font-medium">Tipo</th>
                        <th className="px-2.5 py-2 font-medium">Componente</th>
                        <th className="px-2.5 py-2 font-medium">Descrição</th>
                        <th className="px-2.5 py-2 font-medium">Qtd.</th>
                        <th className="px-2.5 py-2 font-medium">Solicitante</th>
                        <th className="px-2.5 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPurchaseItems.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="px-2.5 py-4 text-center text-sm text-slate-500">Nenhuma solicitação cadastrada.</td>
                        </tr>
                      ) : (
                        filteredPurchaseItems.map(({ purchase, item, itemIndex }) => (
                          <tr
                            key={`${purchase.numero}-${itemIndex}`}
                            className="cursor-pointer border-t border-slate-200/70 hover:bg-slate-50"
                            onDoubleClick={() => {
                              const purchaseIndex = purchases.findIndex(item => item.numero === purchase.numero)
                              if (purchaseIndex >= 0) {
                                setCurrentPurchaseIndex(purchaseIndex)
                                setSelectedSection('compras')
                              }
                            }}
                          >
                            <td className="px-2.5 py-2 whitespace-nowrap text-slate-700">{purchase.numero}</td>
                            <td className="px-2.5 py-2 whitespace-nowrap text-slate-700">{purchase.setor}</td>
                            <td className="px-2.5 py-2 whitespace-nowrap text-slate-700">{purchase.tipoSolicitacao}</td>
                            <td className="px-2.5 py-2 whitespace-nowrap text-slate-700">{item.tipoComponente}</td>
                            <td className="px-2.5 py-2 max-w-[220px] truncate text-slate-700">{item.descricao}</td>
                            <td className="px-2.5 py-2 whitespace-nowrap text-slate-700">{item.quantidade}</td>
                            <td className="px-2.5 py-2 whitespace-nowrap text-slate-700">{purchase.solicitante}</td>
                            <td className="px-2.5 py-2 whitespace-nowrap text-slate-700">{purchase.status}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}

            {/* Resumo removido conforme solicitado */}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
