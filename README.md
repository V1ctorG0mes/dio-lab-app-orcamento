# 📄 OrçaFácil — Gerador de Orçamentos e Propostas para Freelancers

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="shadcn/ui" />
  <img src="https://img.shields.io/badge/TanStack_Router-FF4154?style=for-the-badge&logo=tanstack&logoColor=white" alt="TanStack Router" />
  <img src="https://img.shields.io/badge/Status-Conclu%C3%ADdo-success?style=for-the-badge" alt="Status" />
</p>

> Aplicação web executiva desenvolvida para profissionais autônomos, agências e freelancers criarem, gerenciarem e exportarem propostas comerciais e orçamentos em PDF com acabamento corporativo em segundos.

---

## 📌 Sobre o Projeto

O **OrçaFácil** resolve uma das principais dores no cotidiano de freelancers e prestadores de serviços: a criação rápida de propostas visuais elegantes sem depender de softwares pesados ou editores manuais.

Com uma interface moderna de duas colunas, o usuário preenche os dados do prestador, cliente, serviços e condições de pagamento enquanto acompanha a renderização em tempo real de uma folha A4 proporcional. A aplicação opera **100% no cliente (client-side)** com persistência local em `localStorage`, garantindo total privacidade e velocidade instantânea.

Projeto desenvolvido com apoio de Inteligência Artificial ([Lovable.dev](https://lovable.dev)) no âmbito do **Bootcamp Santander / DIO**.

---

## ✨ Funcionalidades Principais

- ⚡ **Pré-visualização em Tempo Real (Folha A4):** Cada dígito alterado no formulário atualiza instantaneamente a folha de orçamento na proporção real A4 (210mm).
- 🖨️ **Exportação em PDF Impecável:** Folha de estilos `@media print` calibrada para gerar um PDF limpo em folha A4 com `break-inside: avoid` nas seções e ocultação de menus/botões.
- 📱 **QR Code Pix Dinâmico:** Geração de QR Code Pix escaneável em conformidade com o padrão EMV/BR Code do Banco Central com cálculo de checksum CRC16-CCITT e botão "Copiar Chave Pix".
- 💬 **Compartilhamento Rápido via WhatsApp:** Gera uma mensagem pré-formatada profissional com resumo dos itens, valores e link direto para o `wa.me`.
- 📁 **Gestão de Múltiplos Orçamentos:** Salve, consulte, edite, duplique (com numeração sequencial automática `#AAAA-NNN`) e exclua orçamentos anteriores em uma gaveta lateral (*Drawer*).
- 🎨 **Personalização de Cores e Estilo:** Seletor com 5 paletas de destaque (Grafite, Azul Marinho, Verde Esmeralda, Vinho e Roxo) construídas sobre variáveis OKLCH.
- 🔢 **Cálculos Automáticos e Formatação:** Cálculo em tempo real de subtotais, descontos (percentuais ou fixos em R$) e valor total em moeda brasileira (BRL).
- 🧪 **Testes Unitários:** Suíte de testes automatizados com Vitest cobrindo cálculos matemáticos, formatação de moeda, payload Pix e manipulação de orçamentos.

---

## 🛠️ Tecnologias Utilizadas

- **[React 19](https://react.dev/):** Biblioteca para interfaces reativas.
- **[TypeScript](https://www.typescriptlang.org/):** Tipagem estática rigorosa para previsibilidade do código.
- **[Tailwind CSS v4](https://tailwindcss.com/):** Nova geração do Tailwind com tema inline e variáveis OKLCH.
- **[TanStack Router](https://tanstack.com/router):** Roteamento tipado de alta performance.
- **[shadcn/ui](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/):** Componentes acessíveis, responsivos e personalizáveis.
- **[qrcode.react](https://github.com/zpao/qrcode.react):** Renderização vetorial SVG do QR Code Pix.
- **[Lucide React](https://lucide.dev/):** Conjunto moderno de ícones de interface.
- **[Vitest](https://vitest.dev/):** Testes unitários rápidos e integrados ao Vite.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Gerenciador de pacotes: `npm`, `pnpm` ou `yarn`

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/V1ctorG0mes/orca-viva-preview.git
   ```

2. **Acesse a pasta do projeto:**
   ```bash
   cd orca-viva-preview
   ```

3. **Instale as dependências:**
   ```bash
   npm install
   # ou
   pnpm install
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse no navegador:**
   Abra a URL indicada no terminal (geralmente [http://localhost:5173](http://localhost:5173)).

---

## 🧪 Rodando os Testes Unitários

Para executar os testes de cálculo de orçamento e payload do Pix:

```bash
npm run test
```

---

## 📦 Build para Produção

Para gerar os arquivos otimizados prontos para deploy:

```bash
npm run build
```

---

## 👨‍💻 Autor

Desenvolvido por **Victor Gomes**  
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/V1ctorG0mes)
