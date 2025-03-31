import { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { elevenLabsApiRequest, elevenLabsApiRequestAllItems } from '../shared/GenericFunctions';

export const conversationOperations: INodeProperties[] = [
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
];

export const conversationFields: INodeProperties[] = [
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
];

export async function executeConversationOperation(
  this: IExecuteFunctions,
  i: number,
  operation: string,
  itemIndex: number,
): Promise<INodeExecutionData> {
  let responseData;

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
      responseData = await elevenLabsApiRequestAllItems.call(
        this,
        'GET',
        '/convai/conversations',
        {},
        qs,
      );
      
      return {
        json: { conversations: responseData },
        pairedItem: { item: itemIndex },
      };
    } else {
      const limit = this.getNodeParameter('limit', i) as number;
      qs.page_size = limit;
      
      responseData = await elevenLabsApiRequest.call(
        this,
        'GET',
        '/convai/conversations',
        {},
        qs,
      );
    }
  }
  
  // GET CONVERSATION
  else if (operation === 'get') {
    const conversationId = this.getNodeParameter('conversationId', i) as string;
    
    responseData = await elevenLabsApiRequest.call(
      this,
      'GET',
      `/convai/conversations/${conversationId}`,
    );
  }
  
  // DELETE CONVERSATION
  else if (operation === 'delete') {
    const conversationId = this.getNodeParameter('conversationId', i) as string;
    
    responseData = await elevenLabsApiRequest.call(
      this,
      'DELETE',
      `/convai/conversations/${conversationId}`,
    );
    
    if (!responseData) {
      responseData = { success: true };
    }
  }
  
  // GET CONVERSATION AUDIO
  else if (operation === 'getAudio') {
    const conversationId = this.getNodeParameter('conversationId', i) as string;
    
    responseData = await elevenLabsApiRequest.call(
      this,
      'GET',
      `/convai/conversations/${conversationId}/audio`,
    );
  }
  
  // GET SIGNED URL
  else if (operation === 'getSignedUrl') {
    const agentId = this.getNodeParameter('agentId', i) as string;
    
    responseData = await elevenLabsApiRequest.call(
      this,
      'GET',
      '/convai/conversation/get_signed_url',
      {},
      { agent_id: agentId },
    );
  }
  
  // SEND FEEDBACK
  else if (operation === 'sendFeedback') {
    const conversationId = this.getNodeParameter('conversationId', i) as string;
    const feedback = this.getNodeParameter('feedback', i) as string;
    
    responseData = await elevenLabsApiRequest.call(
      this,
      'POST',
      `/convai/conversations/${conversationId}/feedback`,
      { feedback },
    );
    
    if (!responseData) {
      responseData = { success: true };
    }
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
    
    responseData = await elevenLabsApiRequest.call(
      this,
      'POST',
      '/convai/twilio/outbound_call',
      body,
    );
  }

  return {
    json: responseData,
    pairedItem: { item: itemIndex },
  };
}
