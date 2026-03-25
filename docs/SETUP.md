# Meu Gerente PJ — Setup e Deploy

## Pré-requisitos

- Node.js 18+
- npm 9+
- Conta no [Supabase](https://supabase.com)
- Chave de API da [Anthropic](https://console.anthropic.com)

---

## 1. Instalação local

```bash
# Clone o projeto
git clone <seu-repo>
cd meu-gerente-pj

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.local.example .env.local
# Edite o .env.local com suas chaves

# Rode em desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

---

## 2. Configurar Supabase

1. Crie um projeto em https://app.supabase.com
2. Vá em **SQL Editor** e execute o arquivo `supabase/migrations/001_schema_inicial.sql`
3. Copie a **URL** e a **anon key** do projeto (Settings → API)
4. Cole no `.env.local`

---

## 3. Deploy em VPS

### Opção A — Deploy simples com PM2

```bash
# No servidor (Ubuntu 22.04)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pm2

# Clone e instale
git clone <seu-repo> /var/www/meu-gerente-pj
cd /var/www/meu-gerente-pj
npm install
npm run build

# Configure o .env.local com as variáveis de produção

# Inicie com PM2
pm2 start npm --name "meu-gerente-pj" -- start
pm2 save
pm2 startup
```

### Opção B — Docker (recomendado para escalar)

```dockerfile
# Dockerfile incluído no projeto
docker build -t meu-gerente-pj .
docker run -p 3000:3000 --env-file .env.local meu-gerente-pj
```

### Nginx (proxy reverso)

```nginx
server {
    server_name seudominio.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Estrutura do Projeto

```
meu-gerente-pj/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Login e cadastro
│   │   ├── (dashboard)/        # Área logada
│   │   │   ├── calculadora/    # Calculadora Financeira IA
│   │   │   ├── taxas/          # Consultor de Taxas
│   │   │   ├── credito/        # Simulador de Crédito
│   │   │   ├── bancario/       # Especialista Bancário
│   │   │   └── investimentos/  # Investimentos PJ
│   │   └── api/                # API routes (chat, auth, calc)
│   ├── components/             # Componentes reutilizáveis
│   ├── lib/
│   │   ├── supabase/           # Cliente Supabase (client + server)
│   │   ├── anthropic/          # Cliente IA + system prompts
│   │   └── calculators/        # Engine de cálculos financeiros
│   ├── types/                  # Tipos TypeScript
│   └── hooks/                  # React Hooks customizados
├── supabase/
│   └── migrations/             # SQL para criar o banco
└── docs/                       # Documentação
```
