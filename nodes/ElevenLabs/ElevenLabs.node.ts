import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
} from 'n8n-workflow';

import { SUPPORTED_LANGUAGES, LLM_MODELS } from './shared/Constants';

// Import services
import { 
  agentOperations, 
  agentFields, 
  executeAgentOperation 
} from './services/AgentService';
import { 
  voiceOperations, 
  voiceFields, 
  executeVoiceOperation 
} from './services/VoiceService';
import { 
  conversationOperations, 
  conversationFields, 
  executeConversationOperation 
} from './services/ConversationService';
import { 
  knowledgeBaseOperations, 
  knowledgeBaseFields, 
  executeKnowledgeBaseOperation 
} from './services/KnowledgeBaseService';
import { 
  phoneOperations, 
  phoneFields, 
  executePhoneOperation 
} from './services/PhoneService';

export class ElevenLabs implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Eleven Labs Conversational',
    name: 'elevenLabsConversational',
    group: ['transform'],
    icon: 'file:elevenlabs.svg',
    version: 1,
    subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
    description: 'Interact with ElevenLabs Conversational AI API',
    defaults: {
      name: 'Eleven Labs Conversational',
    },
    inputs: ['main' as NodeConnectionType],
    outputs: ['main' as NodeConnectionType],
    credentials: [
      {
        name: 'elevenLabsApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Agent',
            value: 'agent',
          },
          {
            name: 'Conversation',
            value: 'conversation',
          },
          {
            name: 'Knowledge Base',
            value: 'knowledgeBase',
          },
          {
            name: 'Phone',
            value: 'phone',
          },
          {
            name: 'Voice',
            value: 'voice',
          },
        ],
        default: 'agent',
      },
      
      // Import all service operations and fields
      ...agentOperations,
      ...agentFields,
      ...voiceOperations,
      ...voiceFields,
      ...conversationOperations,
      ...conversationFields,
      ...knowledgeBaseOperations,
      ...knowledgeBaseFields,
      ...phoneOperations,
      ...phoneFields,
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: [
              'agent',
            ],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create an agent',
            action: 'Create an agent',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get an agent by ID',
            action: 'Get an agent',
          },
          {
            name: 'Get Link',
            value: 'getLink',
            description: 'Get the link for an agent',
            action: 'Get the link for an agent',
          },
          {
            name: 'List',
            value: 'list',
            description: 'List all agents',
            action: 'List all agents',
          },
        ],
        default: 'create',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: [
              'voice',
            ],
          },
        },
        options: [
          {
            name: 'List',
            value: 'list',
            description: 'Get a list of all available voices',
            action: 'List all voices',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get a specific voice by ID',
            action: 'Get a voice',
          },
        ],
        default: 'list',
      },

      // CREATE OPERATION
      {
        displayName: 'Agent Name',
        name: 'agentName',
        type: 'string',
        default: '',
        description: 'The name of the agent',
        required: true,
        displayOptions: {
          show: {
            resource: ['agent'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'System Prompt',
        name: 'systemPrompt',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: 'You are a helpful assistant that answers questions professionally.',
        description: 'The system prompt is used to determine the persona of the agent and the context of the conversation. You can use system variables like: system__agent_id, system__caller_id, system__called_number, system__time_utc, system__conversation_id, etc.',
        hint: 'Supports variables: system__agent_id, system__caller_id, system__called_number, system__call_duration_secs, system__time_utc, system__conversation_id, system__call_sid',
        required: true,
        displayOptions: {
          show: {
            resource: ['agent'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Agent Language',
        name: 'agentLanguage',
        type: 'options',
        options: SUPPORTED_LANGUAGES,
        default: 'en',
        description: 'Choose the default language the agent will communicate in',
        required: true,
        displayOptions: {
          show: {
            resource: ['agent'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'First Message',
        name: 'firstMessage',
        type: 'string',
        typeOptions: {
          rows: 2,
        },
        default: 'Hello, how can I help you?',
        description: 'The first message the agent will say. If empty, the agent will wait for the user to start the conversation. You can use system variables like: system__agent_id, system__caller_id, system__called_number, system__time_utc, system__conversation_id, etc.',
        hint: 'Supports variables: system__agent_id, system__caller_id, system__called_number, system__call_duration_secs, system__time_utc, system__conversation_id, system__call_sid',
        displayOptions: {
          show: {
            resource: ['agent'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'LLM Model',
        name: 'llmModel',
        type: 'options',
        options: LLM_MODELS,
        default: 'gemini-2.0-flash-001',
        description: 'The LLM model to use for the agent',
        required: true,
        displayOptions: {
          show: {
            resource: ['agent'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Voice ID',
        name: 'voiceId',
        type: 'string',
        default: 'cjVigY5qzO86Huf0OWal', // Default to ElevenLabs "Rachel" voice
        description: 'The voice ID to use for the agent. Find voice IDs in the ElevenLabs dashboard',
        displayOptions: {
          show: {
            resource: ['agent'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['agent'],
            operation: ['create'],
          },
        },
        options: [
          {
            displayName: 'Additional Languages',
            name: 'additionalLanguages',
            type: 'multiOptions',
            options: SUPPORTED_LANGUAGES,
            default: [],
            description: 'Specify additional languages which callers can choose from',
          },
          {
            displayName: 'Advanced Configuration',
            name: 'advancedConfig',
            type: 'json',
            default: '{}',
            description: 'Advanced configuration for the agent in JSON format',
          },
          {
            displayName: 'Platform Settings',
            name: 'platformSettings',
            type: 'json',
            default: '{}',
            description: 'Platform settings for the agent',
          },
          {
            displayName: 'Use Tool IDs',
            name: 'useToolIds',
            type: 'boolean',
            default: false,
            description: 'Whether to use tool IDs instead of tool specs',
          },
        ],
      },

      // GET, UPDATE, DELETE, GET LINK OPERATIONS
      {
        displayName: 'Agent ID',
        name: 'agentId',
        type: 'string',
        required: true,
        default: '',
        description: 'The ID of the agent',
        displayOptions: {
          show: {
            resource: ['agent'],
            operation: ['get', 'getLink'],
          },
        },
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: {
          show: {
            resource: ['agent'],
            operation: ['getLink'],
          },
        },
        options: [
          {
            displayName: 'Generate Shareable Token',
            name: 'generateToken',
            type: 'boolean',
            default: false,
            description: 'Whether to generate a shareable token for the agent',
          },
          {
            displayName: 'Token Duration (Days)',
            name: 'tokenDuration',
            type: 'number',
            default: 7,
            description: 'Duration in days for which the token is valid',
            displayOptions: {
              show: {
                generateToken: [true],
              },
            },
          },
          {
            displayName: 'Max Uses',
            name: 'maxUses',
            type: 'number',
            default: 0,
            description: 'Maximum number of times the token can be used (0 for unlimited)',
            displayOptions: {
              show: {
                generateToken: [true],
              },
            },
          },
        ],
      },

      // LIST OPERATION
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        default: false,
        description: 'Whether to return all results or only up to a given limit',
        displayOptions: {
          show: {
            resource: ['agent'],
            operation: ['list'],
          },
        },
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 30,
        description: 'Max number of results to return',
        typeOptions: {
          minValue: 1,
          maxValue: 100,
        },
        displayOptions: {
          show: {
            resource: ['agent'],
            operation: ['list'],
            returnAll: [false],
          },
        },
      },
      {
        displayName: 'Filters',
        name: 'filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: {
          show: {
            resource: ['agent'],
            operation: ['list'],
          },
        },
        options: [
          {
            displayName: 'Search',
            name: 'search',
            type: 'string',
            default: '',
            description: 'Search by agent name',
          },
        ],
      },

      // VOICE: LIST OPERATION
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        default: false,
        description: 'Whether to return all results or only up to a given limit',
        displayOptions: {
          show: {
            resource: ['voice'],
            operation: ['list'],
          },
        },
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 10,
        description: 'Max number of results to return',
        typeOptions: {
          minValue: 1,
          maxValue: 100,
        },
        displayOptions: {
          show: {
            resource: ['voice'],
            operation: ['list'],
            returnAll: [false],
          },
        },
      },
      {
        displayName: 'Filters',
        name: 'filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: {
          show: {
            resource: ['voice'],
            operation: ['list'],
          },
        },
        options: [
          {
            displayName: 'Search',
            name: 'search',
            type: 'string',
            default: '',
            description: 'Search term to filter voices by name, description, labels, or category',
          },
          {
            displayName: 'Category',
            name: 'category',
            type: 'options',
            options: [
              { name: 'Premade', value: 'premade' },
              { name: 'Cloned', value: 'cloned' },
              { name: 'Generated', value: 'generated' },
              { name: 'Professional', value: 'professional' },
            ],
            default: '',
            description: 'Filter voices by category',
          },
          {
            displayName: 'Voice Type',
            name: 'voiceType',
            type: 'options',
            options: [
              { name: 'Personal', value: 'personal' },
              { name: 'Community', value: 'community' },
              { name: 'Default', value: 'default' },
              { name: 'Workspace', value: 'workspace' },
            ],
            default: '',
            description: 'Filter voices by type',
          },
          {
            displayName: 'Sort',
            name: 'sort',
            type: 'options',
            options: [
              { name: 'Created At', value: 'created_at_unix' },
              { name: 'Name', value: 'name' },
            ],
            default: '',
            description: 'Field to sort by',
          },
          {
            displayName: 'Sort Direction',
            name: 'sortDirection',
            type: 'options',
            options: [
              { name: 'Ascending', value: 'asc' },
              { name: 'Descending', value: 'desc' },
            ],
            default: '',
            description: 'Sort direction',
          },
          {
            displayName: 'Include Total Count',
            name: 'includeTotalCount',
            type: 'boolean',
            default: true,
            description: 'Whether to include the total count of voices in the response. Incurs a performance cost.',
          },
        ],
      },

      // VOICE: GET OPERATION
      {
        displayName: 'Voice ID',
        name: 'voiceId',
        type: 'string',
        required: true,
        default: '',
        description: 'The ID of the voice to retrieve',
        displayOptions: {
          show: {
            resource: ['voice'],
            operation: ['get'],
          },
        },
      },

      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: [
              'conversation',
            ],
          },
        },
        options: [
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete a conversation',
            action: 'Delete a conversation',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get conversation details',
            action: 'Get conversation details',
          },
          {
            name: 'Get Audio',
            value: 'getAudio',
            description: 'Get conversation audio',
            action: 'Get conversation audio',
          },
          {
            name: 'Get Signed URL',
            value: 'getSignedUrl',
            description: 'Get a signed URL for a conversation',
            action: 'Get a signed URL',
          },
          {
            name: 'List',
            value: 'list',
            description: 'Get all conversations',
            action: 'List all conversations',
          },
          {
            name: 'Send Feedback',
            value: 'sendFeedback',
            description: 'Send feedback for a conversation',
            action: 'Send feedback for a conversation',
          },
          {
            name: 'Outbound Call',
            value: 'outboundCall',
            description: 'Make an outbound call via Twilio',
            action: 'Make an outbound call',
          },
        ],
        default: 'list',
      },

      // CONVERSATION: LIST OPERATION
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        default: false,
        description: 'Whether to return all results or only up to a given limit',
        displayOptions: {
          show: {
            resource: ['conversation'],
            operation: ['list'],
          },
        },
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 30,
        description: 'Max number of results to return',
        typeOptions: {
          minValue: 1,
          maxValue: 100,
        },
        displayOptions: {
          show: {
            resource: ['conversation'],
            operation: ['list'],
            returnAll: [false],
          },
        },
      },
      {
        displayName: 'Filters',
        name: 'filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: {
          show: {
            resource: ['conversation'],
            operation: ['list'],
          },
        },
        options: [
          {
            displayName: 'Agent ID',
            name: 'agentId',
            type: 'string',
            default: '',
            description: 'Filter conversations by agent ID',
          },
          {
            displayName: 'Call Successful',
            name: 'callSuccessful',
            type: 'options',
            options: [
              {
                name: 'Success',
                value: 'success',
              },
              {
                name: 'Failure',
                value: 'failure',
              },
              {
                name: 'Unknown',
                value: 'unknown',
              },
            ],
            default: '',
            description: 'Filter by the success status of the call',
          },
        ],
      },

      // CONVERSATION: GET, DELETE, GET AUDIO, SEND FEEDBACK OPERATIONS
      {
        displayName: 'Conversation ID',
        name: 'conversationId',
        type: 'string',
        required: true,
        default: '',
        description: 'The ID of the conversation',
        displayOptions: {
          show: {
            resource: ['conversation'],
            operation: ['get', 'delete', 'getAudio', 'sendFeedback'],
          },
        },
      },

      // CONVERSATION: GET SIGNED URL OPERATION
      {
        displayName: 'Agent ID',
        name: 'agentId',
        type: 'string',
        required: true,
        default: '',
        description: 'The ID of the agent to get a signed URL for',
        displayOptions: {
          show: {
            resource: ['conversation'],
            operation: ['getSignedUrl'],
          },
        },
      },

      // CONVERSATION: SEND FEEDBACK OPERATION
      {
        displayName: 'Feedback',
        name: 'feedback',
        type: 'options',
        options: [
          {
            name: 'Like',
            value: 'like',
          },
          {
            name: 'Dislike',
            value: 'dislike',
          },
        ],
        required: true,
        default: 'like',
        description: 'The feedback for the conversation',
        displayOptions: {
          show: {
            resource: ['conversation'],
            operation: ['sendFeedback'],
          },
        },
      },

      // CONVERSATION: OUTBOUND CALL OPERATION
      {
        displayName: 'Agent ID',
        name: 'agentId',
        type: 'string',
        required: true,
        default: '',
        description: 'The ID of the agent that will make the call',
        displayOptions: {
          show: {
            resource: ['conversation'],
            operation: ['outboundCall'],
          },
        },
      },
      {
        displayName: 'Agent Phone Number ID',
        name: 'agentPhoneNumberId',
        type: 'string',
        required: true,
        default: '',
        description: 'The ID of the phone number to use for the agent',
        displayOptions: {
          show: {
            resource: ['conversation'],
            operation: ['outboundCall'],
          },
        },
      },
      {
        displayName: 'To Number',
        name: 'toNumber',
        type: 'string',
        required: true,
        default: '',
        description: 'The phone number to call in E.164 format (e.g., +15551234567)',
        displayOptions: {
          show: {
            resource: ['conversation'],
            operation: ['outboundCall'],
          },
        },
      },
      {
        displayName: 'Additional Options',
        name: 'additionalOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: {
          show: {
            resource: ['conversation'],
            operation: ['outboundCall'],
          },
        },
        options: [
          {
            displayName: 'First Message',
            name: 'firstMessage',
            type: 'string',
            default: '',
            description: 'The first message the agent will say when the call is answered',
          },
          {
            displayName: 'Dynamic Variables',
            name: 'dynamicVariables',
            type: 'json',
            default: '{}',
            description: 'Custom variables to use in the conversation',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter('resource', i) as string;
        const operation = this.getNodeParameter('operation', i) as string;
        
        let responseItem;
        
        // Route execution to the appropriate service based on the resource
        if (resource === 'agent') {
          responseItem = await executeAgentOperation.call(this, i, operation, i);
        } 
        else if (resource === 'voice') {
          responseItem = await executeVoiceOperation.call(this, i, operation, i);
        }
        else if (resource === 'conversation') {
          responseItem = await executeConversationOperation.call(this, i, operation, i);
        }
        else if (resource === 'knowledgeBase') {
          responseItem = await executeKnowledgeBaseOperation.call(this, i, operation, i);
        }
        else if (resource === 'phone') {
          responseItem = await executePhoneOperation.call(this, i, operation, i);
        }
        
        // Add the response to the return data
        if (responseItem) {
          returnData.push(responseItem);
        }
        
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: error.message },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
