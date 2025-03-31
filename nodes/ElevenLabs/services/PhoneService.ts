import { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { elevenLabsApiRequest, elevenLabsApiRequestAllItems } from '../shared/GenericFunctions';

export const phoneOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: [
          'phone',
        ],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a phone number',
        action: 'Create a phone number',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a phone number',
        action: 'Delete a phone number',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a phone number',
        action: 'Get a phone number',
      },
      {
        name: 'List',
        value: 'list',
        description: 'List all phone numbers',
        action: 'List all phone numbers',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a phone number',
        action: 'Update a phone number',
      },
    ],
    default: 'list',
  },
];

export const phoneFields: INodeProperties[] = [
  // CREATE OPERATION
  {
    displayName: 'Provider',
    name: 'provider',
    type: 'options',
    options: [
      {
        name: 'Twilio',
        value: 'twilio',
      },
      {
        name: 'SIP Trunk',
        value: 'sip_trunk',
      },
    ],
    default: 'twilio',
    description: 'The phone provider to use',
    displayOptions: {
      show: {
        resource: ['phone'],
        operation: ['create'],
      },
    },
  },
  
  // TWILIO PROVIDER FIELDS
  {
    displayName: 'Phone Number',
    name: 'phoneNumber',
    type: 'string',
    required: true,
    default: '',
    description: 'The phone number in E.164 format (e.g., +15551234567)',
    displayOptions: {
      show: {
        resource: ['phone'],
        operation: ['create'],
        provider: ['twilio'],
      },
    },
  },
  {
    displayName: 'Label',
    name: 'label',
    type: 'string',
    required: true,
    default: '',
    description: 'A label for the phone number',
    displayOptions: {
      show: {
        resource: ['phone'],
        operation: ['create'],
        provider: ['twilio'],
      },
    },
  },
  {
    displayName: 'Twilio Account SID',
    name: 'sid',
    type: 'string',
    required: true,
    default: '',
    description: 'Your Twilio Account SID',
    displayOptions: {
      show: {
        resource: ['phone'],
        operation: ['create'],
        provider: ['twilio'],
      },
    },
  },
  {
    displayName: 'Twilio Auth Token',
    name: 'token',
    type: 'string',
    typeOptions: {
      password: true,
    },
    required: true,
    default: '',
    description: 'Your Twilio Auth Token',
    displayOptions: {
      show: {
        resource: ['phone'],
        operation: ['create'],
        provider: ['twilio'],
      },
    },
  },
  
  // SIP TRUNK PROVIDER FIELDS
  {
    displayName: 'Phone Number',
    name: 'phoneNumber',
    type: 'string',
    required: true,
    default: '',
    description: 'The phone number in E.164 format (e.g., +15551234567)',
    displayOptions: {
      show: {
        resource: ['phone'],
        operation: ['create'],
        provider: ['sip_trunk'],
      },
    },
  },
  {
    displayName: 'Label',
    name: 'label',
    type: 'string',
    required: true,
    default: '',
    description: 'A label for the phone number',
    displayOptions: {
      show: {
        resource: ['phone'],
        operation: ['create'],
        provider: ['sip_trunk'],
      },
    },
  },
  {
    displayName: 'Termination URI',
    name: 'terminationUri',
    type: 'string',
    required: true,
    default: '',
    description: 'SIP trunk termination URI',
    displayOptions: {
      show: {
        resource: ['phone'],
        operation: ['create'],
        provider: ['sip_trunk'],
      },
    },
  },
  {
    displayName: 'Authentication',
    name: 'authentication',
    type: 'options',
    options: [
      {
        name: 'ACL Authentication',
        value: 'acl',
      },
      {
        name: 'Digest Authentication',
        value: 'digest',
      },
    ],
    default: 'acl',
    description: 'The authentication method for SIP trunk',
    displayOptions: {
      show: {
        resource: ['phone'],
        operation: ['create'],
        provider: ['sip_trunk'],
      },
    },
  },
  {
    displayName: 'Username',
    name: 'username',
    type: 'string',
    required: true,
    default: '',
    description: 'SIP trunk username for digest authentication',
    displayOptions: {
      show: {
        resource: ['phone'],
        operation: ['create'],
        provider: ['sip_trunk'],
        authentication: ['digest'],
      },
    },
  },
  {
    displayName: 'Password',
    name: 'password',
    type: 'string',
    typeOptions: {
      password: true,
    },
    required: true,
    default: '',
    description: 'SIP trunk password for digest authentication',
    displayOptions: {
      show: {
        resource: ['phone'],
        operation: ['create'],
        provider: ['sip_trunk'],
        authentication: ['digest'],
      },
    },
  },
  
  // GET, UPDATE, DELETE OPERATIONS
  {
    displayName: 'Phone Number ID',
    name: 'phoneNumberId',
    type: 'string',
    required: true,
    default: '',
    description: 'The ID of the phone number',
    displayOptions: {
      show: {
        resource: ['phone'],
        operation: ['get', 'update', 'delete'],
      },
    },
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
        resource: ['phone'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Agent ID',
        name: 'agentId',
        type: 'string',
        default: '',
        description: 'The ID of the agent to assign to this phone number',
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
        resource: ['phone'],
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
        resource: ['phone'],
        operation: ['list'],
        returnAll: [false],
      },
    },
  },
];

export async function executePhoneOperation(
  this: IExecuteFunctions,
  i: number,
  operation: string,
  itemIndex: number,
): Promise<INodeExecutionData> {
  let responseData;

  // CREATING PHONE NUMBER
  if (operation === 'create') {
    const provider = this.getNodeParameter('provider', i) as string;
    
    if (provider === 'twilio') {
      // Twilio provider
      const phoneNumber = this.getNodeParameter('phoneNumber', i) as string;
      const label = this.getNodeParameter('label', i) as string;
      const sid = this.getNodeParameter('sid', i) as string;
      const token = this.getNodeParameter('token', i) as string;
      
      const body = {
        phone_number: phoneNumber,
        label,
        sid,
        token,
        provider: 'twilio',
      };
      
      responseData = await elevenLabsApiRequest.call(
        this,
        'POST',
        '/convai/phone-numbers/create',
        body,
      );
    } else {
      // SIP trunk provider
      const phoneNumber = this.getNodeParameter('phoneNumber', i) as string;
      const label = this.getNodeParameter('label', i) as string;
      const terminationUri = this.getNodeParameter('terminationUri', i) as string;
      const authentication = this.getNodeParameter('authentication', i) as string;
      
      const body: any = {
        phone_number: phoneNumber,
        label,
        termination_uri: terminationUri,
        provider: 'sip_trunk',
      };
      
      // Add credentials for digest authentication
      if (authentication === 'digest') {
        const username = this.getNodeParameter('username', i) as string;
        const password = this.getNodeParameter('password', i) as string;
        
        body.credentials = {
          username,
          password,
        };
      }
      
      responseData = await elevenLabsApiRequest.call(
        this,
        'POST',
        '/convai/phone-numbers/create',
        body,
      );
    }
  }
  
  // LIST PHONE NUMBERS
  else if (operation === 'list') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    
    if (returnAll) {
      const phoneNumbers = await elevenLabsApiRequestAllItems.call(
        this,
        'GET',
        '/convai/phone-numbers/',
        {},
        {}
      );
      
      return {
        json: { phoneNumbers }, // Wrap in an object with a key
        pairedItem: { item: itemIndex },
      };
    } else {
      const limit = this.getNodeParameter('limit', i) as number;
      
      const response = await elevenLabsApiRequest.call(
        this,
        'GET',
        '/convai/phone-numbers/',
      );
      
      // Limit the results if needed
      if (Array.isArray(response) && limit) {
        responseData = { phoneNumbers: response.slice(0, limit) }; // Wrap in an object
      } else {
        responseData = { phoneNumbers: response }; // Wrap in an object
      }
    }
  }
  
  // GET PHONE NUMBER
  else if (operation === 'get') {
    const phoneNumberId = this.getNodeParameter('phoneNumberId', i) as string;
    
    responseData = await elevenLabsApiRequest.call(
      this,
      'GET',
      `/convai/phone-numbers/${phoneNumberId}`,
    );
  }
  
  // UPDATE PHONE NUMBER
  else if (operation === 'update') {
    const phoneNumberId = this.getNodeParameter('phoneNumberId', i) as string;
    const updateFields = this.getNodeParameter('updateFields', i) as {
      agentId?: string;
    };
    
    const body: any = {};
    
    if (updateFields.agentId) {
      body.agent_id = updateFields.agentId;
    }
    
    responseData = await elevenLabsApiRequest.call(
      this,
      'PATCH',
      `/convai/phone-numbers/${phoneNumberId}`,
      body,
    );
  }
  
  // DELETE PHONE NUMBER
  else if (operation === 'delete') {
    const phoneNumberId = this.getNodeParameter('phoneNumberId', i) as string;
    
    responseData = await elevenLabsApiRequest.call(
      this,
      'DELETE',
      `/convai/phone-numbers/${phoneNumberId}`,
    );
    
    if (!responseData) {
      responseData = { success: true };
    }
  }

  return {
    json: responseData || {}, // Ensure we always return an object, even if responseData is null or undefined
    pairedItem: { item: itemIndex },
  };
}
