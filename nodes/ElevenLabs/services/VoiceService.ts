import { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { elevenLabsApiRequest } from '../shared/GenericFunctions';

export const voiceOperations: INodeProperties[] = [
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
];

export const voiceFields: INodeProperties[] = [
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
];

export async function executeVoiceOperation(
  this: IExecuteFunctions,
  i: number,
  operation: string,
  itemIndex: number,
): Promise<INodeExecutionData> {
  let responseData;

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
      
      return {
        json: { voices: allVoices },
        pairedItem: { item: itemIndex },
      };
    } else {
      const limit = this.getNodeParameter('limit', i) as number;
      qs.page_size = limit;
      
      responseData = await elevenLabsApiRequest.call(
        this,
        'GET',
        '/voices',
        {},
        qs,
        'https://api.elevenlabs.io/v2/voices' // Use v2 endpoint for voices
      );
    }
  }
  
  // GET VOICE
  else if (operation === 'get') {
    const voiceId = this.getNodeParameter('voiceId', i) as string;
    
    responseData = await elevenLabsApiRequest.call(
      this,
      'GET',
      `/voices/${voiceId}`, // Use the v1 voices endpoint with voice ID
      {},
      {},
      undefined // Don't specify a full URI, let it use the default v1 endpoint
    );
  }

  return {
    json: responseData,
    pairedItem: { item: itemIndex },
  };
}
