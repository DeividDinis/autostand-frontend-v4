# AutoStand Frontend

Frontend web do AutoStand em React + Vite + TypeScript, com React Router, React Hook Form, Zod, Tailwind CSS, Lucide React e Fetch API.

## API real

O frontend consome a API AutoStand em `/api/v1`.

`.env`:

```env
VITE_API_URL=http://localhost:3500/api/v1
```

Não existe modo offline nem credenciais de teste neste projeto.

## Arranque

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Perfis

- `ADMIN_GLOBAL`: acesso total; gere stands/substands, utilizadores, veículos, operações, transferências, relatórios e auditoria.
- `MINI_ADMIN`: acesso apenas aos stands atribuídos; gere a substand, viaturas e operações do seu âmbito; pode solicitar transferências, mas não aprova.
- `GESTOR`: executa a operação comercial (consultar viaturas, registar clientes, processos, vendas, alugueres, contratos, pagamentos e devoluções); sem transferências e sem gestão administrativa de stands.
- `CLIENTE`: usa o portal para consultar viaturas disponíveis.

## Rotas reais usadas

- `/auth/login`, `/auth/me`
- `/users`, `/users/:id`, `/users/:id/stands`, `/users/:id/stands/:standId`
- `/stands`, `/stands/:id`
- `/cars`, `/cars/:id`
- `/clients`, `/clients/:id`
- `/processes`, `/processes/:id`, `/processes/:id/cancel`
- `/contracts`, `/contracts/:id`, `/contracts/sale`, `/contracts/rental`, `/contracts/rental/:id/return`
- `/payments`
- `/transfers` e operações de aprovação/rejeição/conclusão/cancelamento
- `/dashboard`
- `/reports/vehicles`, `/reports/sales`, `/reports/rentals`, `/reports/receivables`, `/reports/transfers`
- `/audit-logs`

## Decisões de integração

O backend não fornece GET para `/rental-returns`; a página de devoluções consulta os contratos de aluguer e regista a devolução através de `POST /contracts/rental/:id/return`.

O backend não fornece endpoints de prestações independentes nesta referência; o plano de pagamento é criado pelos campos do contrato de venda (`installments`, `firstDueDate`, `intervalMonths`) e as prestações/pagamentos devolvidos pelo contrato são apresentados no detalhe.

O backend não documenta endpoints públicos para catálogo. Por isso, `/catalog` é uma entrada pública que encaminha o cliente para autenticação; o catálogo real funciona em `/portal` com JWT e consulta `GET /cars?status=AVAILABLE`.

O backend não documenta upload de fotografias. O frontend mostra até oito imagens caso o detalhe da viatura as devolva, usando placeholders para posições sem imagem, mas não inventa um endpoint de upload.
