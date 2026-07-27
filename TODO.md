# TODO - Solicitação de Compras (menu lateral)

- [x] Ler e entender `src/App.jsx` (já concluído)

- [ ] Definir modelo/estado e `localStorage` para novas solicitações de compras
- [ ] Adicionar menu lateral: item `Solicitação de Compras`
- [ ] Criar tela/form `selectedSection === 'compras'`
- [ ] Implementar campos solicitados:
  - [ ] Numero solicitação automática: formato `M###` (M001, M002...)
  - [ ] Dropdown Setor solicitante: Manutenção, Almoxarifado, Produção, ADM
  - [ ] Data solicitação
  - [ ] código do produto, descrição, referência
  - [ ] unidade de medida, quantidade, preço
  - [ ] fornecedor, justificativa
  - [ ] tipo solicitação (ressuprimento, preventivo, serviço, emergencial)
  - [ ] tipo componente (peças, insumo, expediente, matéria prima)
- [ ] Persistir/salvar/deletar registros no `localStorage`
- [ ] Botão “IA”/buscar figura: renderizar iframe básico com base na descrição do produto
- [x] Ajustar subtítulo para: **“Formulário De Compras”** quando em Solicitação de compras

- [ ] Rodar `npm run dev` e verificar UI

