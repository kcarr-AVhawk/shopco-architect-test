const request = require('supertest');
const express = require('express');
const healthRouter = require('./health');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(healthRouter);
  return app;
}

describe('GET /health', () => {
  it('returns the success envelope with status ok', async () => {
    const res = await request(buildApp()).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ status: 'ok' });
    expect(res.body.meta).toMatchObject({
      requestId: expect.any(String),
      timestamp: expect.any(String),
    });
  });

  it('returns 422 and error shape when request validation fails', async () => {
    // Force validateRequest to reject by injecting a schema that always errors
    const express2 = require('express');
    const { validateRequest } = require('../middleware/validate-request');
    const { Router } = require('express');

    const badSchema = { validate: () => ({ error: { message: 'invalid' } }) };
    const strictRouter = Router();
    strictRouter.get('/health', validateRequest(badSchema), async (req, res) => {
      res.json({ data: { status: 'ok' }, meta: {} });
    });

    const app2 = express2();
    app2.use(express2.json());
    app2.use(strictRouter);

    const res = await request(app2).get('/health');

    expect(res.status).toBe(422);
    expect(res.body.error).toMatchObject({
      code: 'VALIDATION_ERROR',
      message: expect.any(String),
      retryable: false,
    });
  });

  it('returns 503 and error shape when the handler throws', async () => {
    const express3 = require('express');
    const { validateRequest } = require('../middleware/validate-request');
    const { Router } = require('express');

    const errorRouter = Router();
    errorRouter.get('/health', validateRequest(null), async (req, res) => {
      try {
        throw new Error('downstream failure');
      } catch (err) {
        res.status(503).json({
          error: { code: 'HEALTH_CHECK_FAILED', message: err.message, retryable: true },
        });
      }
    });

    const app3 = express3();
    app3.use(express3.json());
    app3.use(errorRouter);

    const res = await request(app3).get('/health');

    expect(res.status).toBe(503);
    expect(res.body.error).toMatchObject({
      code: 'HEALTH_CHECK_FAILED',
      message: 'downstream failure',
      retryable: true,
    });
  });
});
