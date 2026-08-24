-- Estrutura SQLite do banco de recebimento de materiais.
CREATE TABLE IF NOT EXISTS recebimento_materiais (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data_recebimento TEXT NOT NULL,
  codigo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  um TEXT,
  qtd REAL,
  fornecedor TEXT,
  numero_nota TEXT,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recebimento_codigo ON recebimento_materiais(codigo);
CREATE INDEX IF NOT EXISTS idx_recebimento_data ON recebimento_materiais(data_recebimento);
