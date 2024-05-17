### Chapter 7 - Debugging, real-time notifications, nodemailer

#### 1. Clone repository
```bash
git clone https://github.com/mirzahm14/km6-bejs-challenge7.git
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Copy .env.example to .env and fill in the values

```bash
cp .env.example .env
```

#### 4. Migrating and seeding data to the database

```bash
npx prisma migrate dev
```

#### 5. Run the server

```bash
npm run dev
```