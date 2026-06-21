const { Worker } = require('bullmq');
const axios = require('axios');
const { redisConfig } = require('../config/redis');
const db = require('../config/db');
const env = require('../config/env');

console.log('Starting Embedding Generation Worker...');

const embeddingWorker = new Worker('embedding_generation', async (job) => {
  const { referenceProductId, imagePath } = job.data;
  console.log(`[Embedding Worker] Processing job ${job.id} for reference product ${referenceProductId}`);

  try {
    // 1. Update status to processing in DB
    await db.query(
      "UPDATE reference_products SET embedding_status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [referenceProductId]
    );

    // 2. HTTP call to CV service
    const cvUrl = `${env.CV_SERVICE_URL}/process/embedding`;
    console.log(`[Embedding Worker] Requesting CV Service embedding generation: ${cvUrl}`);
    const response = await axios.post(cvUrl, {
      referenceProductId,
      imagePath
    });

    if (response.status !== 200) {
      throw new Error(`CV Service responded with HTTP status ${response.status}`);
    }

    if (!response.data || typeof response.data !== 'object') {
      throw new Error('CV Service responded with malformed JSON body');
    }

    const { status, embedding } = response.data;

    if (status !== 'complete') {
      throw new Error(`CV Service process status is not complete: ${status}`);
    }

    if (!Array.isArray(embedding) || embedding.length !== 2048) {
      throw new Error(`Invalid embedding length: expected 2048 floats, got ${Array.isArray(embedding) ? embedding.length : typeof embedding}`);
    }

    // 3. Convert array to PostgreSQL vector string format: "[val1, val2, ...]"
    const vectorString = `[${embedding.join(',')}]`;

    // 4. Update product embedding and status to complete
    await db.query(
      "UPDATE reference_products SET embedding = $1, embedding_status = 'complete', updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [vectorString, referenceProductId]
    );

    console.log(`[Embedding Worker] Product ${referenceProductId} embedding generated successfully`);
    return { status: 'complete', referenceProductId };
  } catch (err) {
    console.error(`[Embedding Worker] Error processing product ${referenceProductId}:`, err.message);

    // Update status to failed in database
    try {
      await db.query(
        "UPDATE reference_products SET embedding_status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [referenceProductId]
      );
    } catch (dbErr) {
      console.error(`[Embedding Worker] Failed to mark product ${referenceProductId} as failed in DB:`, dbErr.message);
    }

    // Rethrow to let BullMQ handle retry/fail logic
    throw err;
  }
}, {
  connection: redisConfig,
  concurrency: 5
});

embeddingWorker.on('completed', (job, result) => {
  console.log(`[Embedding Worker] Job ${job.id} completed successfully. Result:`, result);
});

embeddingWorker.on('failed', (job, err) => {
  console.error(`[Embedding Worker] Job ${job?.id} failed after attempts:`, err.message);
});

module.exports = embeddingWorker;
