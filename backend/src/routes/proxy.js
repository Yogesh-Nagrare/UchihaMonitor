const express = require('express')
const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const { url, method = 'POST', headers = {}, body } = req.body

    if (!url) {
      return res.status(400).json({ success: false, message: 'url is required' })
    }

    // Build fetch options
    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        ...headers,
      },
    }

    // Body — req.body.body is already parsed JSON (express json middleware parsed it)
    // So we need to re-stringify it for the outgoing request
    if (body !== undefined && !['GET', 'HEAD'].includes(method.toUpperCase())) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body)
    }

    console.log(`🔀 Proxying ${method} → ${url}`)

    const response = await fetch(url, fetchOptions)

    const contentType = response.headers.get('content-type') || ''
    const rawText = await response.text()

    console.log(`✅ Proxy response: ${response.status} (${rawText.length} bytes)`)

    res.status(response.status)
    res.set('Content-Type', contentType || 'application/json')
    res.send(rawText)

  } catch (err) {
    console.error('❌ Proxy error:', err.message)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
})

module.exports = router