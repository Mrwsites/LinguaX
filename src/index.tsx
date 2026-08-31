import { Hono } from 'hono'

const app = new Hono()

// Serve the landing page at root
app.get('/', (c) => {
  return c.html(landingHTML())
})

// Serve the app at /app and all sub-routes
app.get('/app', (c) => {
  return c.html(appHTML())
})
app.get('/app/*', (c) => {
  return c.html(appHTML())
})

// API health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', app: 'LinguaX', version: '1.0.0' })
})

function landingHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LinguaX — English for the moments that matter</title>
  <link rel="icon" href="/static/favicon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/static/css/landing.css" />
</head>
<body>
  <div id="landing-root"></div>
  <script src="/static/js/landing.js"></script>
</body>
</html>`
}

function appHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LinguaX — Learn English</title>
  <link rel="icon" href="/static/favicon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/static/css/app.css" />
</head>
<body>
  <div id="app-root"></div>
  <script src="/static/js/data.js"></script>
  <script src="/static/js/state.js"></script>
  <script src="/static/js/app.js"></script>
</body>
</html>`
}

export default app
