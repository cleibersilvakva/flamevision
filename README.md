
# FlameVision 🔥
**Industrial Furnace Flame Monitoring Platform**

FlameVision é uma plataforma de monitoramento em tempo real de chamas em fornalhas industriais, baseada em visão computacional e análise de sinais, projetada para operar **on-premise**, com alta confiabilidade, baixo acoplamento e fácil instalação via containers.

O sistema fornece:
- Visualização ao vivo da chama
- Classificação automática do estado operacional
- Série temporal da intensidade da chama
- Registro de eventos e evidências
- Base sólida para expansão com IA embarcada

---

## 📌 Objetivos do Produto
- Aumentar a **segurança operacional**
- Reduzir riscos de apagamento de chama
- Apoiar operadores com **diagnóstico visual + analítico**
- Fornecer base técnica para auditoria e melhoria contínua
- Ser simples de instalar, atualizar e operar em ambiente industrial

---

## 🧠 Visão Geral da Arquitetura
Backend FastAPI + Frontend React, comunicação REST/WebSocket, tudo containerizado com Docker.

---

## 📂 Estrutura do Projeto
```
backend/
frontend/
docker-compose.yml
.env.example
README.md
```

---

## 🚀 Execução Rápida
```bash
cp .env.example .env
docker compose up -d --build
```

UI: http://localhost:8080  
API: http://localhost:8081/health

---

## 📦 Modelo de Produto Instalável
Entrega via imagens Docker versionadas + docker-compose + arquivo .env configurável.

---

## 🔄 Versionamento
Versionamento Semântico (SemVer):
- v1.0.0 – primeira versão produtiva
- v1.1.0 – novas funcionalidades
- v1.0.1 – correções

---

## 📄 Licença
Uso restrito conforme contrato comercial.
Distribuição não autorizada sem consentimento do fornecedor.
