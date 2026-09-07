# Deploying to Your Domain: araknet.tech

This guide provides the exact configuration and DNS records required to deploy the **Araknet Business Lead Discovery Agent** to your live domain: **`araknet.tech`**.

---

## 1. Domain Architecture Overview

```mermaid
flowchart LR
    User["Your Browser (https://araknet.tech)"] --> DNS["Namecheap DNS"]
    DNS -->|A Record @ -> 76.76.21.21| Vercel["Vercel Edge Network"]
    Vercel --> Proxy["Next.js 16 Proxy (Basic Auth Security)"]
    Proxy --> App["Araknet Lead Discovery SaaS Dashboard"]
    App --> MongoDB[("MongoDB Atlas (araknet database)")]
```

---

## 2. DNS Settings (Configured in Namecheap Advanced DNS)

| Type | Host | Value / Target | TTL |
| :--- | :---: | :--- | :---: |
| **A Record** | `@` | `76.76.21.21` | Automatic / 30 min |
| **CNAME Record** | `www` | `cname.vercel-dns.com.` | Automatic / 30 min |

---

## 3. Environment Variables (Configured in Vercel)

| Variable | Required | Description |
| :--- | :---: | :--- |
| `MONGODB_URI` | **YES** | MongoDB connection string: `mongodb+srv://syedali6160_db_user:...@araknet.hpjatav.mongodb.net/?appName=araknet` |
| `DASHBOARD_PASSWORD` | **YES** | Secret password used to log in at `araknet.tech` (username: `owner`) |
| `CRON_SECRET` | Optional | Bearer secret for automated scheduled daily runs |

---

## 4. Accessing Your Dashboard

* **Live URL:** `https://araknet.tech`
* **Username:** `owner`
* **Password:** Value set in `DASHBOARD_PASSWORD`
