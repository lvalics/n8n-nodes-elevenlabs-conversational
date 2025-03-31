import { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { elevenLabsApiRequest, elevenLabsApiRequestAllItems } from '../shared/GenericFunctions';
import { SUPPORTED_LANGUAGES, LLM_MODELS } from '../shared/Constants';
import { deepMerge } from '../shared/Utils';

export const agentOperations: INodeProperties[] = [
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
];

export const agentFields: INodeProperties[] = [
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

  // GET, GET LINK OPERATIONS
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
];

export async function executeAgentOperation(
  this: IExecuteFunctions,
  i: number,
  operation: string,
  itemIndex: number,
): Promise<INodeExecutionData> {
  let responseData;

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
      responseData = await elevenLabsApiRequest.call(
        this,
        'POST',
        '/convai/agents/create',
        body,
        qs,
      );
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

    responseData = await elevenLabsApiRequest.call(
      this,
      'GET',
      `/convai/agents/${agentId}`,
    );
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

    responseData = await elevenLabsApiRequest.call(
      this,
      'GET',
      `/convai/agents/${agentId}/link`,
      {},
      qs,
    );
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

    if (returnAll) {
      responseData = await elevenLabsApiRequestAllItems.call(
        this,
        'GET',
        '/convai/agents',
        {},
        qs,
      );
      
      return {
        json: { agents: responseData },
        pairedItem: { item: itemIndex },
      };
    } else {
      const limit = this.getNodeParameter('limit', i) as number;
      qs.page_size = limit;

      responseData = await elevenLabsApiRequest.call(
        this,
        'GET',
        '/convai/agents',
        {},
        qs,
      );
    }
  }

  return {
    json: responseData,
    pairedItem: { item: itemIndex },
  };
}
