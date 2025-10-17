README.md – Run Project (English)**




This project consists of:

- **Frontend:** Next.js (React + TypeScript)  
- **Backend:** Golang + Gin  
- **Docker & Docker Compose** to run both FE and BE together

---

1. Clone Repository**
```bash
git clone <REPO_URL>
cd web-DU
````

---

2. Verify Folder Structure

Ensure the following structure in the root folder:

```
web-DU/
├── frontend/           # Next.js frontend
├── backend/            # Golang backend
└── docker-compose.yml  # Docker Compose config
```

---

## **3. Run the Project**

```bash
docker-compose up --build
```

* **Frontend:** [http://localhost:3000](http://localhost:3000)
* **Backend:** [http://localhost:8080/hello](http://localhost:8080/hello)

> Frontend hot reload works automatically thanks to volume mount (`./frontend:/app`)

---

## **4. Stop the Project**

```bash
docker-compose down
```

---

## **5. Important Notes**

* Frontend Next.js must run in **development mode** (`npm run dev` in the container) for hot reload
* Backend Golang **does not have hot reload** by default; you can use tools like [`air`](https://github.com/cosmtrek/air) or [`fresh`](https://github.com/pilu/fresh)
* If Dockerfile or dependencies change, rebuild containers:

```bash
docker-compose up --build
```

---

## **6. Environment Variables**

Frontend Next.js:

```env
NEXT_PUBLIC_API_URL=http://backend:8080
```

Backend Golang:

* Configure as needed (e.g., database URL, port, etc.)

---


```

---

Jika mau, aku bisa buatkan **ultra-short version** dalam bahasa Inggris: tinggal clone repo → `docker-compose up` → ready, cocok untuk **new developer onboarding**.  

Apakah mau aku buatkan versi itu juga?
```
