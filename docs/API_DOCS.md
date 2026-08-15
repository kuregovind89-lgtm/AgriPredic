# AgriPredic API Reference

Base URL (local): `http://localhost:8000`
Interactive Swagger docs auto-generated at: `http://localhost:8000/docs`

All authenticated endpoints require header: `Authorization: Bearer <token>`

## Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a farmer account |
| POST | `/api/auth/login` | Login, returns JWT + user object |
| GET | `/api/auth/me` | Get current logged-in user |

## Prediction
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/predict/` | Upload leaf image (multipart `file`), returns diagnosis |
| GET | `/api/predict/{id}/report` | Download PDF report for a prediction |

## History
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/history/` | List current user's past predictions |
| GET | `/api/history/stats` | Severity/disease breakdown for current user |

## Weather
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/weather/risk?location=Pune` | Live weather + disease-risk score |

## Market
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/market/prices` | Current mandi prices (mock, swappable) |

## Admin (requires `role: admin`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/{id}/toggle` | Enable/disable a user |
| DELETE | `/api/admin/users/{id}` | Delete a user |
| GET | `/api/admin/diseases` | List disease knowledge-base entries |
| POST | `/api/admin/diseases` | Add a new disease entry |
| DELETE | `/api/admin/diseases/{id}` | Remove a disease entry |
| GET | `/api/admin/predictions` | List every prediction on the platform |
| GET | `/api/admin/analytics` | Aggregate stats for dashboard charts |

## Example: Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@agripredic.com","password":"Admin@123"}'
```

## Example: Upload + Predict
```bash
curl -X POST http://localhost:8000/api/predict/ \
  -H "Authorization: Bearer <token>" \
  -F "file=@leaf.jpg"
```
