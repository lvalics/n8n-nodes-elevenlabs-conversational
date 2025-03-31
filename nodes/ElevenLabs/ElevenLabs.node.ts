import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
} from 'n8n-workflow';
import { elevenLabsApiRequest, elevenLabsApiRequestAllItems } from './shared/GenericFunctions';
import { SUPPORTED_LANGUAGES, LLM_MODELS } from './shared/Constants';

// Utility functions for object operations
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

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
            name: 'Voice',
            value: 'voice',
          },
        ],
        default: 'agent',
      },
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

    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        if (resource === 'agent') {
          // CREATE AGENT
          if (operation === 'create') {
            // Get all the individual fields
            const agentName = this.getNodeParameter('agentName', i) as string;
            const systemPrompt = this.getNodeParameter('systemPrompt', i) as string;
            const agentLanguage = this.getNodeParameter('agentLanguage', i) as string;
            const firstMessage = this.getNodeParameter('firstMessage', i) as string;
            const llmModel = this.getNodeParameter('llmModel', i) as string;
            const voiceId = this.getNodeParameter('voiceId', i) as string;
            
            const additionalFields = this.getNodeParameter('additionalFields', i) as {
              additionalLanguages?: string[];
              advancedConfig?: string | object;
              platformSettings?: string | object;
              useToolIds?: boolean;
            };

            // Build the conversation_config object
            let conversation_config: any = {
              agent: {
                language: agentLanguage,
                prompt: {
                  prompt: systemPrompt,
                  llm: llmModel,
                }
              }
            };
            
            // Add optional fields if they exist
            if (firstMessage) {
              conversation_config.agent.first_message = firstMessage;
            }
            
            // Add voice settings if provided
            if (voiceId) {
              conversation_config.tts = {
                model_id: "eleven_turbo_v2",
                voice_id: voiceId
              };
            }
            
            // Add additional languages if specified
            if (additionalFields.additionalLanguages && additionalFields.additionalLanguages.length > 0) {
              conversation_config.language_presets = {};
              
              for (const lang of additionalFields.additionalLanguages) {
                conversation_config.language_presets[lang] = {
                  overrides: {
                    agent: {
                      language: lang
                    }
                  }
                };
              }
            }
            
            // Merge any advanced configuration
            if (additionalFields.advancedConfig) {
              let advancedConfig = additionalFields.advancedConfig;
              
              // Parse if it's a string
              if (typeof advancedConfig === 'string') {
                try {
                  advancedConfig = JSON.parse(advancedConfig);
                } catch (error) {
                  throw new Error(`Invalid JSON in advanced configuration: ${error.message}`);
                }
              }
              
              // Deep merge the advanced config with our base config
              conversation_config = deepMerge(conversation_config, advancedConfig);
            }

            // Create the request body
            const body: any = {
              name: agentName,
              conversation_config: conversation_config,
            };

            if (additionalFields.platformSettings) {
              let platformSettings = additionalFields.platformSettings;
              
              // Parse if it's a string
              if (typeof platformSettings === 'string') {
                try {
                  platformSettings = JSON.parse(platformSettings);
                  body.platform_settings = platformSettings;
                } catch (error) {
                  throw new Error(`Invalid JSON in platform settings: ${error.message}`);
                }
              } else {
                body.platform_settings = platformSettings;
              }
            }

            // Create query parameters
            const qs: any = {};
            if (additionalFields.useToolIds) {
              qs.use_tool_ids = true;
            }

            try {
              // Make the API request
              const responseData = await elevenLabsApiRequest.call(
                this,
                'POST',
                '/convai/agents/create',
                body,
                qs,
              );

              // Return the response
              returnData.push({
                json: responseData,
                pairedItem: { item: i },
              });
            } catch (error) {
              if (error.message.includes('422')) {
                throw new Error(`Request validation failed: ${error.message}. Please check your agent configuration.`);
              }
              throw error;
            }
          }

          // GET AGENT
          else if (operation === 'get') {
            const agentId = this.getNodeParameter('agentId', i) as string;

            const responseData = await elevenLabsApiRequest.call(
              this,
              'GET',
              `/convai/agents/${agentId}`,
            );

            returnData.push({
              json: responseData,
              pairedItem: { item: i },
            });
          }

          // GET AGENT LINK
          else if (operation === 'getLink') {
            const agentId = this.getNodeParameter('agentId', i) as string;
            const options = this.getNodeParameter('options', i, {}) as {
              generateToken?: boolean;
              tokenDuration?: number;
              maxUses?: number;
            };

            // Build query parameters
            const qs: any = {};
            
            if (options.generateToken) {
              qs.generate_token = true;
              
              if (options.tokenDuration) {
                qs.token_duration_days = options.tokenDuration;
              }
              
              if (options.maxUses !== undefined) {
                qs.token_max_uses = options.maxUses;
              }
            }

            const responseData = await elevenLabsApiRequest.call(
              this,
              'GET',
              `/convai/agents/${agentId}/link`,
              {},
              qs,
            );

            returnData.push({
              json: responseData,
              pairedItem: { item: i },
            });
          }

          // LIST AGENTS
          else if (operation === 'list') {
            const returnAll = this.getNodeParameter('returnAll', i) as boolean;
            const filters = this.getNodeParameter('filters', i) as {
              search?: string;
            };

            const qs: any = {};
            if (filters.search) {
              qs.search = filters.search;
            }

            let responseData;
            if (returnAll) {
              responseData = await elevenLabsApiRequestAllItems.call(
                this,
                'GET',
                '/convai/agents',
                {},
                qs,
              );
              
              returnData.push({
                json: { agents: responseData },
                pairedItem: { item: i },
              });
            } else {
              const limit = this.getNodeParameter('limit', i) as number;
              qs.page_size = limit;

              const response = await elevenLabsApiRequest.call(
                this,
                'GET',
                '/convai/agents',
                {},
                qs,
              );

              returnData.push({
                json: response,
                pairedItem: { item: i },
              });
            }
          }

        }
        else if (resource === 'voice') {
          // LIST VOICES
          if (operation === 'list') {
            const returnAll = this.getNodeParameter('returnAll', i) as boolean;
            const filters = this.getNodeParameter('filters', i) as {
              search?: string;
              category?: string;
              voiceType?: string;
              sort?: string;
              sortDirection?: string;
              includeTotalCount?: boolean;
            };

            const qs: any = {};
            
            // Add filters to query parameters
            if (filters.search) {
              qs.search = filters.search;
            }
            if (filters.category) {
              qs.category = filters.category;
            }
            if (filters.voiceType) {
              qs.voice_type = filters.voiceType;
            }
            if (filters.sort) {
              qs.sort = filters.sort;
            }
            if (filters.sortDirection) {
              qs.sort_direction = filters.sortDirection;
            }
            if (filters.includeTotalCount !== undefined) {
              qs.include_total_count = filters.includeTotalCount;
            }

            // Note that the voice API uses v2 endpoint
            if (returnAll) {
              // Use pagination to get all voices
              let allVoices: any[] = [];
              let hasMore = true;
              let nextPageToken = '';
              
              while (hasMore) {
                if (nextPageToken) {
                  qs.next_page_token = nextPageToken;
                }
                
                const response = await elevenLabsApiRequest.call(
                  this,
                  'GET',
                  '/voices',
                  {},
                  qs,
                  'https://api.elevenlabs.io/v2/voices' // Use v2 endpoint for voices
                );
                
                if (response.voices && Array.isArray(response.voices)) {
                  allVoices = allVoices.concat(response.voices);
                }
                
                hasMore = response.has_more || false;
                nextPageToken = response.next_page_token || '';
              }
              
              returnData.push({
                json: { voices: allVoices },
                pairedItem: { item: i },
              });
            } else {
              const limit = this.getNodeParameter('limit', i) as number;
              qs.page_size = limit;
              
              const response = await elevenLabsApiRequest.call(
                this,
                'GET',
                '/voices',
                {},
                qs,
                'https://api.elevenlabs.io/v2/voices' // Use v2 endpoint for voices
              );
              
              returnData.push({
                json: response,
                pairedItem: { item: i },
              });
            }
          }
          
          // GET VOICE
          else if (operation === 'get') {
            const voiceId = this.getNodeParameter('voiceId', i) as string;
            
            const response = await elevenLabsApiRequest.call(
              this,
              'GET',
              `/voices/${voiceId}`, // Use the v1 voices endpoint with voice ID
              {},
              {},
              undefined // Don't specify a full URI, let it use the default v1 endpoint
            );
            
            returnData.push({
              json: response,
              pairedItem: { item: i },
            });
          }
        }
        else if (resource === 'conversation') {
          // LIST CONVERSATIONS
          if (operation === 'list') {
            const returnAll = this.getNodeParameter('returnAll', i) as boolean;
            const filters = this.getNodeParameter('filters', i) as {
              agentId?: string;
              callSuccessful?: string;
            };

            const qs: any = {};
            
            if (filters.agentId) {
              qs.agent_id = filters.agentId;
            }
            
            if (filters.callSuccessful) {
              qs.call_successful = filters.callSuccessful;
            }

            if (returnAll) {
              const responseData = await elevenLabsApiRequestAllItems.call(
                this,
                'GET',
                '/convai/conversations',
                {},
                qs,
              );
              
              returnData.push({
                json: { conversations: responseData },
                pairedItem: { item: i },
              });
            } else {
              const limit = this.getNodeParameter('limit', i) as number;
              qs.page_size = limit;
              
              const response = await elevenLabsApiRequest.call(
                this,
                'GET',
                '/convai/conversations',
                {},
                qs,
              );
              
              returnData.push({
                json: response,
                pairedItem: { item: i },
              });
            }
          }
          
          // GET CONVERSATION
          else if (operation === 'get') {
            const conversationId = this.getNodeParameter('conversationId', i) as string;
            
            const response = await elevenLabsApiRequest.call(
              this,
              'GET',
              `/convai/conversations/${conversationId}`,
            );
            
            returnData.push({
              json: response,
              pairedItem: { item: i },
            });
          }
          
          // DELETE CONVERSATION
          else if (operation === 'delete') {
            const conversationId = this.getNodeParameter('conversationId', i) as string;
            
            const response = await elevenLabsApiRequest.call(
              this,
              'DELETE',
              `/convai/conversations/${conversationId}`,
            );
            
            returnData.push({
              json: response || { success: true },
              pairedItem: { item: i },
            });
          }
          
          // GET CONVERSATION AUDIO
          else if (operation === 'getAudio') {
            const conversationId = this.getNodeParameter('conversationId', i) as string;
            
            const response = await elevenLabsApiRequest.call(
              this,
              'GET',
              `/convai/conversations/${conversationId}/audio`,
            );
            
            returnData.push({
              json: response,
              pairedItem: { item: i },
            });
          }
          
          // GET SIGNED URL
          else if (operation === 'getSignedUrl') {
            const agentId = this.getNodeParameter('agentId', i) as string;
            
            const response = await elevenLabsApiRequest.call(
              this,
              'GET',
              '/convai/conversation/get_signed_url',
              {},
              { agent_id: agentId },
            );
            
            returnData.push({
              json: response,
              pairedItem: { item: i },
            });
          }
          
          // SEND FEEDBACK
          else if (operation === 'sendFeedback') {
            const conversationId = this.getNodeParameter('conversationId', i) as string;
            const feedback = this.getNodeParameter('feedback', i) as string;
            
            const response = await elevenLabsApiRequest.call(
              this,
              'POST',
              `/convai/conversations/${conversationId}/feedback`,
              { feedback },
            );
            
            returnData.push({
              json: response || { success: true },
              pairedItem: { item: i },
            });
          }
          
          // OUTBOUND CALL
          else if (operation === 'outboundCall') {
            const agentId = this.getNodeParameter('agentId', i) as string;
            const agentPhoneNumberId = this.getNodeParameter('agentPhoneNumberId', i) as string;
            const toNumber = this.getNodeParameter('toNumber', i) as string;
            const additionalOptions = this.getNodeParameter('additionalOptions', i) as {
              firstMessage?: string;
              dynamicVariables?: string | object;
            };
            
            const body: any = {
              agent_id: agentId,
              agent_phone_number_id: agentPhoneNumberId,
              to_number: toNumber,
            };
            
            // Add conversation initiation data if we have additional options
            if (Object.keys(additionalOptions).length > 0) {
              const conversationInitiationClientData: any = {};
              
              if (additionalOptions.firstMessage) {
                if (!conversationInitiationClientData.conversation_config_override) {
                  conversationInitiationClientData.conversation_config_override = {};
                }
                if (!conversationInitiationClientData.conversation_config_override.agent) {
                  conversationInitiationClientData.conversation_config_override.agent = {};
                }
                conversationInitiationClientData.conversation_config_override.agent.first_message = additionalOptions.firstMessage;
              }
              
              if (additionalOptions.dynamicVariables) {
                let dynamicVariables = additionalOptions.dynamicVariables;
                
                if (typeof dynamicVariables === 'string') {
                  try {
                    dynamicVariables = JSON.parse(dynamicVariables);
                  } catch (error) {
                    throw new Error(`Invalid JSON for dynamic variables: ${error.message}`);
                  }
                }
                
                conversationInitiationClientData.dynamic_variables = dynamicVariables;
              }
              
              if (Object.keys(conversationInitiationClientData).length > 0) {
                body.conversation_initiation_client_data = conversationInitiationClientData;
              }
            }
            
            const response = await elevenLabsApiRequest.call(
              this,
              'POST',
              '/convai/twilio/outbound_call',
              body,
            );
            
            returnData.push({
              json: response,
              pairedItem: { item: i },
            });
          }
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
