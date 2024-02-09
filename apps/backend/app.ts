// Entry point for the Azure Functions app

import * as df from 'durable-functions';
import { app } from '@azure/functions';
import { orchestratorStart } from './api/orchestrator';
import { gatherData } from './app/gatherData';

// Register http triggers
app.http('orchestratorStart', {
  route: 'orchestrator/start',
  extraInputs: [df.input.durableClient()],
  handler: orchestratorStart,
  methods: ['POST'],
});

// Register orchestrations
df.app.orchestration('gatherData', gatherData);
