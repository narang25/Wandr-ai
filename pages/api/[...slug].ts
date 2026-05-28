import app from '../../backend/server';

// Next.js API route configuration
// This tells Next.js to not parse the body natively so Express can handle it
export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};

export const maxDuration = 60; // Allow AI generation up to 60 seconds

export default app;
