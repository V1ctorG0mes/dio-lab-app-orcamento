# 📄 OrçaFácil — MVP de Propostas Comerciais & Fechamento via WhatsApp

<p align="center">
  <img src="https://img.shields.io/badge/Bootcamp-Santander%20%2F%20DIO-red?style=for-the-badge" alt="DIO Bootcamp" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Lovable-FF5722?style=for-the-badge" alt="Lovable" />
  <img src="https://img.shields.io/badge/Status-Online-success?style=for-the-badge" alt="Status" />
</p>

> Projeto desenvolvido para o desafio prático do **Bootcamp Santander: Construa seu Primeiro App com I.A.** na plataforma **DIO (Digital Innovation One)**, aplicando Inteligência Artificial como co-founder desde a concepção e validação da tese até a publicação do MVP.

---

## 🌐 Demonstração Online & Repositório

- **Aplicação no Ar (Deploy):** [https://orca-viva-preview.lovable.app/](https://orca-viva-preview.lovable.app/)
- **Repositório no GitHub:** [https://github.com/V1ctorG0mes/orca-viva-preview](https://github.com/V1ctorG0mes/orca-viva-preview)

---

## 🎯 1. A Dor Escolhida e Por Que Vale um Negócio

### O Problema
Freelancers, autônomos e microempreendedores individuais (MEIs) enfrentam uma dor recorrente na etapa comercial: **perda de negócios por demora e falta de profissionalismo no envio de orçamentos**. 

Muitos utilizam modelos desformatados em Word, planilhas complexas em Excel ou mandam apenas mensagens de texto soltas no WhatsApp. Esse formato:
- Transmite amadorismo ao cliente final;
- Não passa segurança contratual e clareza sobre o escopo;
- Atrasa a cobrança do sinal de entrada (pagamento inicial);
- Demora muito para ser montado, gerando atrito e perda de velocidade na negociação.

### A Oportunidade
Os softwares tradicionais de ERP e faturamento são caros (R$ 80 a R$ 200/mês), pesados e exigem cadastros longos. O autônomo precisa de uma solução **ágil, sem atrito e integrada ao canal onde a venda de fato se fecha: o WhatsApp**.

---

## 📊 2. Tamanho de Mercado e Business Model Canvas

### Estimativa de Mercado (TAM, SAM, SOM)
- **TAM (Total Addressable Market):** Mais de **15 milhões de MEIs e autônomos** ativos no Brasil (dados do Ministério do Desenvolvimento e IBGE).
- **SAM (Serviceable Addressable Market):** Cerca de **3,5 milhões de prestadores de serviços criativos e digitais** (designers, programadores, consultores, videomakers, redatores) que negociam via WhatsApp.
- **SOM (Serviceable Obtainable Market):** **150.000 freelancers** em estágio inicial e intermediário que buscam propostas rápidas e gratuitas sem depender de assinaturas caras de ERP.

### Business Model Canvas (Resumo Executivo)
| Bloco do Canvas | Descrição no Negócio |
| :--- | :--- |
| **Proposta de Valor** | Criação instantânea de orçamentos executivos A4 com QR Code Pix integrado e fechamento direto no WhatsApp em menos de 2 minutos. |
| **Segmento de Clientes** | Freelancers, profissionais liberais, prestadores de serviços e MEIs. |
| **Canais** | Aplicação Web responsiva (desktop e mobile) e fechamento pela API do WhatsApp (`wa.me`). |
| **Relacionamento com Clientes** | Ferramenta self-service, instantânea e sem necessidade de login obrigatório para o MVP. |
| **Fontes de Receita (Roadmap)** | Modelo *Freemium*: Gratuito para orçamentos locais ilimitados; plano Pro mensal com sincronização multi-dispositivo e relatórios fiscais. |
| **Recursos Chave** | Engine de renderização A4 reativa em React, gerador de BR Code Pix e persistência em LocalStorage. |
| **Atividades Chave** | Manutenção do gerador de propostas, otimização de templates de faturas e testes contínuos de usabilidade. |
| **Parcerias Chave** | Lovable (plataforma de prototipagem ágil e IA) e ecossistema de pagamentos instantâneos (Pix / Banco Central). |
| **Estrutura de Custos** | Custo operacional mínimo no MVP (hospedagem estática e armazenamento 100% no navegador via LocalStorage). |

---

## 🔬 3. A Tese do MVP e O Que Ficou Manual de Propósito

### A Tese Testada
> *"Prestadores de serviço autônomos aumentam sua taxa de conversão e velocidade de fechamento quando enviam uma proposta formal em PDF A4 com resumo formatado no WhatsApp e QR Code Pix de entrada imediata."*

### O Que Ficou Manual de Propósito (Abordagem Lean)
Seguindo os princípios ensinados no Bootcamp, a aplicação foca no essencial para validar a tese, deixando manual o que não precisa de automação no primeiro momento:
- **Negociação e Fechamento no WhatsApp:** O freelancer aciona o envio com um clique, mas a conversa final e esclarecimento de dúvidas é 100% humana;
- **Conferência de Comprovante:** O cliente envia o comprovante de pagamento no chat do WhatsApp, eliminando a necessidade de taxas de gateway bancário ou integração com Stripe/Mercado Pago no dia 1;
- **Armazenamento no Navegador (LocalStorage):** Evita custos com infraestrutura de banco de dados e servidores em nuvem durante a validação da hipótese.

---

## 🖥️ 4. O Fluxo da Aplicação

1. **Montagem da Proposta (Formulário):** Preenchimento de dados do cliente, itens, quantidades, valores unitários, condições e desconto;
2. **Pré-visualização em Tempo Real (Folha A4):** Renderização instantânea proporcional a uma folha de 210mm com design executivo e seletor de paletas de cor;
3. **Pagamento Instantâneo com QR Code Pix:** Geração do payload oficial EMV / BR Code com cálculo de CRC16 e botão de copiar chave Pix;
4. **Fechamento pelo WhatsApp:** Disparo de mensagem pré-formatada comercial contendo número da proposta, resumo de itens, valor total e dados de pagamento;
5. **Painel de Gestão ("Meus Orçamentos"):** Gaveta lateral retrátil que atua como mini-CRM com contagem na topbar, permitindo salvar, carregar, duplicar (com numeração sequencial automática `#AAAA-NNN`) e filtrar por status (*Pendente*, *Aprovado*, *Recusado*, *Pago*).

---

## 🤖 5. Engenharia de Prompts (ChatGPT & Lovable)

### 1º Prompt (Mega Prompt de Concepção do MVP):
```text
Crie um aplicativo web moderno de "Gerador de Orçamentos e Faturas Comerciais para Freelancers" (OrçaFácil) 100% client-side, utilizando React, Tailwind CSS, Lucide Icons e shadcn/ui. 
IMPORTANTE: Não utilize Supabase nem banco de dados. Toda a persistência deve ser feita em localStorage. O app deve vir inicialmente populado com dados de exemplo realistas.
Layout dividido em duas colunas:
- Esquerda: Formulário retrátil (Dados do emissor, cliente, itens dinâmicos com cálculo automático de subtotal e desconto, forma de pagamento).
- Direita: Pré-visualização em tempo real simulando folha A4 com estilos @media print perfeitos para exportação em PDF.
```

### 2º Prompt (Evolução: CRM, Pix & WhatsApp):
```text
Mantenha a estrutura atual e adicione:
1. Painel de Gestão ("Meus Orçamentos"): Drawer lateral com lista de orçamentos salvos, filtros por status (Pendente, Aprovado, Recusado, Pago), botão duplicar e contagem na topbar;
2. QR Code Pix Dinâmico na fatura se houver chave Pix informada;
3. Botão "Enviar WhatsApp" com mensagem comercial pré-formatada e link wa.me;
4. Seletor de cores da fatura com 5 presets visuais.
```

---

## 🛠️ Tecnologias Utilizadas

- **[React 19](https://react.dev/):** Interface reativa de alta performance.
- **[TypeScript](https://www.typescriptlang.org/):** Tipagem estática rigorosa para garantir estabilidade.
- **[Tailwind CSS v4](https://tailwindcss.com/):** Estilização moderna utilitária com variáveis de cor OKLCH.
- **[TanStack Router](https://tanstack.com/router):** Roteamento tipado.
- **[shadcn/ui](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/):** Componentes acessíveis de alta qualidade.
- **[qrcode.react](https://github.com/zpao/qrcode.react):** Renderização vetorial SVG do QR Code Pix.
- **[Lucide React](https://lucide.dev/):** Ícones modernos.
- **[Vitest](https://vitest.dev/):** Testes unitários para regras financeiras e payload Pix.

---

## 🚀 Como Executar Localmente

```bash
# 1. Clone o repositório
git clone https://github.com/V1ctorG0mes/orca-viva-preview.git

# 2. Acesse a pasta
cd orca-viva-preview

# 3. Instale as dependências
npm install

# 4. Inicie o servidor local
npm run dev

# 5. Rode a suíte de testes unitários
npm run test
```

---

## 👨‍💻 Autor

Desenvolvido por **Victor Gomes**  
Bootcamp Santander: Construa seu Primeiro App com I.A. — **DIO**  
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/V1ctorG0mes)
