// Entry point for the Azure Functions app

import { app } from '@azure/functions';
import * as df from 'durable-functions';

import { orchestratorStart } from './api/orchestrator';
import { gatherData, getActivities, getUserSettings } from './app/gatherData';

// Register http triggers
app.http('orchestratorStart', {
  route: 'orchestrator/start',
  extraInputs: [df.input.durableClient()],
  handler: orchestratorStart,
  methods: ['POST'],
});

// Register orchestrations
df.app.orchestration('gatherData', gatherData);

// Register activities
df.app.activity('getUserSettings', { handler: getUserSettings });
df.app.activity('getActivities', { handler: getActivities });
