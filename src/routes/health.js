const { Router } = require('express');
const { validateRequest } = require('../middleware/validate-request');

const router = Router();

router.get('/health', validateRequest(null), async (req, res) => {
  try {
    const timestamp = new Date().toISOString();
    res.json({
      data: { status: 'ok' },
      meta: { requestId: req.requestId, timestamp },
    });
  } catch (err) {
    res.status(503).json({
      error: { code: 'HEALTH_CHECK_FAILED', message: err.message, retryable: true },
    });
  }
});

module.exports = router;
