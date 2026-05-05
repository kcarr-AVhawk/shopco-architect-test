import express from 'express';
import { validateRequest } from '../middleware/validate-request.js';

const router = express.Router();

router.get('/products/:id', validateRequest(null), async (req, res) => {
  try {
    const productId = req.params.id;

    const product = {
      id: productId,
      name: 'Sample Product',
      price: 1999,
    };

    res.json({
      data: product,
      meta: {
        requestId: req.id || 'unknown',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        retryable: true,
      },
    });
  }
});

export default router;
