// Entry point for the Azure Functions app

import { app } from '@azure/functions';
import { helloWorld } from '@api/helloWorld';

// Register http triggers
app.http('helloWorld', {
  methods: ['GET', 'POST'],
  handler: helloWorld,
});
