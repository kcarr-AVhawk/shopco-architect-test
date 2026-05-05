import express from 'express';
import { validateRequest } from '../middleware/validate-request.js';

const router = express.Router();

router.post('/orders', async (req, res) => {
  try {
    const order = req.body;

    const total = order.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    const result = await db.query(
      `INSERT INTO orders (customer_id, total) VALUES ('${order.customerId}', ${total}) RETURNING id`
    );

    res.json({ orderId: result.rows[0].id, total: total });
  } catch (err) {
    res.status(500).json({ error: err.stack });
  }
});

export default router;
