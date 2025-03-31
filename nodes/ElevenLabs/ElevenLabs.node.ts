import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
} from 'n8n-workflow';
import { elevenLabsApiRequest, elevenLabsApiRequestAllItems } from './shared/GenericFunctions';

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
          {
            name: 'Update',
            value: 'update',
            description: 'Update an agent',
            action: 'Update an agent',
          },
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete an agent',
            action: 'Delete an agent',
          },
        ],
        default: 'create',
      },

      // CREATE OPERATION
      {
        displayName: 'Conversation Config',
        name: 'conversationConfig',
        type: 'json',
        default: '{"agent":{"first_message":"Hello, how can I help you?","language":"en","prompt":{"prompt":"You are a helpful assistant.","llm":"gemini-2.0-flash-001"}}}',
        description: 'Conversation configuration for the agent (required)',
        displayOptions: {
          show: {
            resource: ['agent'],
            operation: ['create'],
          },
        },
        placeholder: `{
  "agent": {
    "first_message": "Hello, how can I help you?",
    "language": "en",
    "prompt": {
      "prompt": "You are a helpful assistant that answers questions professionally.",
      "llm": "gemini-2.0-flash-001",
      "temperature": 0.7,
      "tools": [
        {
          "type": "client",
          "description": "Search for information",
          "name": "search"
        }
      ]
    }
  },
  "tts": {
    "model_id": "eleven_turbo_v2",
    "voice_id": "cjVigY5qzO86Huf0OWal"
  }
}`,
        required: true,
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
            displayName: 'Name',
            name: 'name',
            type: 'string',
            default: '',
            description: 'A name to make the agent easier to find',
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
            operation: ['get', 'update', 'delete', 'getLink'],
          },
        },
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

      // UPDATE OPERATION
      {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['agent'],
            operation: ['update'],
          },
        },
        options: [
          {
            displayName: 'Name',
            name: 'name',
            type: 'string',
            default: '',
            description: 'A name to make the agent easier to find',
          },
          {
            displayName: 'Conversation Config',
            name: 'conversationConfig',
            type: 'json',
            default: '{}',
            description: 'Conversation configuration for the agent',
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
            let conversationConfig = this.getNodeParameter('conversationConfig', i);
            
            // If conversationConfig is a string, try to parse it
            if (typeof conversationConfig === 'string') {
              try {
                conversationConfig = JSON.parse(conversationConfig);
              } catch (error) {
                throw new Error(`Invalid JSON in conversation config: ${error.message}`);
              }
            }
            
            const additionalFields = this.getNodeParameter('additionalFields', i) as {
              name?: string;
              platformSettings?: object;
              useToolIds?: boolean;
            };

            // Create the request body
            const body: any = {
              conversation_config: conversationConfig,
            };

            if (additionalFields.name) {
              body.name = additionalFields.name;
            }

            if (additionalFields.platformSettings) {
              let platformSettings = additionalFields.platformSettings;
              
              // If platformSettings is a string, try to parse it
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
                throw new Error(`Request validation failed: ${error.message}. Please check your conversation configuration format.`);
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

            const responseData = await elevenLabsApiRequest.call(
              this,
              'GET',
              `/convai/agents/${agentId}/link`,
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

          // UPDATE AGENT
          else if (operation === 'update') {
            const agentId = this.getNodeParameter('agentId', i) as string;
            const updateFields = this.getNodeParameter('updateFields', i) as {
              name?: string;
              conversationConfig?: object;
              platformSettings?: object;
              useToolIds?: boolean;
            };

            const body: any = {};
            const qs: any = {};

            if (updateFields.name) {
              body.name = updateFields.name;
            }

            if (updateFields.conversationConfig) {
              body.conversation_config = updateFields.conversationConfig;
            }

            if (updateFields.platformSettings) {
              body.platform_settings = updateFields.platformSettings;
            }

            if (updateFields.useToolIds) {
              qs.use_tool_ids = updateFields.useToolIds;
            }

            const responseData = await elevenLabsApiRequest.call(
              this,
              'PATCH',
              `/convai/agents/${agentId}`,
              body,
              qs,
            );

            returnData.push({
              json: responseData,
              pairedItem: { item: i },
            });
          }

          // DELETE AGENT
          else if (operation === 'delete') {
            const agentId = this.getNodeParameter('agentId', i) as string;

            await elevenLabsApiRequest.call(
              this,
              'DELETE',
              `/convai/agents/${agentId}`,
            );

            returnData.push({
              json: { 
                success: true,
                message: `Agent with ID ${agentId} successfully deleted` 
              },
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
