# FlameVision — pacote local

## Subir (Docker)
1) Ajuste `.env` se necessário (portas e API base)
2) Rode:
```bash
docker compose up -d --build
```

- UI: http://localhost:8080
- API: http://localhost:8081/health

## Logs
```bash
docker compose logs -f api
docker compose logs -f frontend
```

## Parar
```bash
docker compose down
```
