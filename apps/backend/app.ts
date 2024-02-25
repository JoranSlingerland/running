// Entry point for the Azure Functions app

import { app } from '@azure/functions';
import * as df from 'durable-functions';

import { orchestratorStart } from './api/orchestrator';
import { gatherData, getActivities, getUserSettings } from './app/gatherData';
import {
  outputToCosmosDb,
  subOrchOutputToCosmosDb,
} from './app/outputToCosmosDb';

// Register http triggers
app.http('orchestratorStart', {
  route: 'orchestrator/start',
  extraInputs: [df.input.durableClient()],
  handler: orchestratorStart,
  methods: ['POST'],
});

// Register orchestrations
df.app.orchestration('gatherData', gatherData);
df.app.orchestration('subOrchOutputToCosmosDb', subOrchOutputToCosmosDb);

// Register activities
df.app.activity('getUserSettings', { handler: getUserSettings });
df.app.activity('getActivities', { handler: getActivities });
df.app.activity('outputToCosmosDb', { handler: outputToCosmosDb });
