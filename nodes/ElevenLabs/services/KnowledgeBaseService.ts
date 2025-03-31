import { INodeProperties, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { elevenLabsApiRequest, elevenLabsApiRequestAllItems } from '../shared/GenericFunctions';

export const knowledgeBaseOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: [
          'knowledgeBase',
        ],
      },
    },
    options: [
      {
        name: 'Create Document',
        value: 'createDocument',
        description: 'Create a knowledge base document',
        action: 'Create a knowledge base document',
      },
      {
        name: 'Delete Document',
        value: 'deleteDocument',
        description: 'Delete a knowledge base document',
        action: 'Delete a knowledge base document',
      },
      {
        name: 'Get Document',
        value: 'getDocument',
        description: 'Get knowledge base document details',
        action: 'Get knowledge base document details',
      },
      {
        name: 'Get Document Content',
        value: 'getDocumentContent',
        description: 'Get the content of a knowledge base document',
        action: 'Get document content',
      },
      {
        name: 'Get Document Chunk',
        value: 'getDocumentChunk',
        description: 'Get a specific chunk of a knowledge base document',
        action: 'Get document chunk',
      },
      {
        name: 'Get Dependent Agents',
        value: 'getDependentAgents',
        description: 'Get agents that depend on a knowledge base document',
        action: 'Get dependent agents',
      },
      {
        name: 'List Documents',
        value: 'listDocuments',
        description: 'List knowledge base documents',
        action: 'List knowledge base documents',
      },
      {
        name: 'Compute RAG Index',
        value: 'computeRagIndex',
        description: 'Compute RAG index for a knowledge base document',
        action: 'Compute RAG index',
      },
    ],
    default: 'listDocuments',
  },
];

export const knowledgeBaseFields: INodeProperties[] = [
  // LIST DOCUMENTS OPERATION
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
    displayOptions: {
      show: {
        resource: ['knowledgeBase'],
        operation: ['listDocuments'],
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
        resource: ['knowledgeBase'],
        operation: ['listDocuments'],
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
        resource: ['knowledgeBase'],
        operation: ['listDocuments'],
      },
    },
    options: [
      {
        displayName: 'Search',
        name: 'search',
        type: 'string',
        default: '',
        description: 'Search for documents whose names start with this string',
      },
      {
        displayName: 'Show Only Owned Documents',
        name: 'showOnlyOwnedDocuments',
        type: 'boolean',
        default: false,
        description: 'If set to true, the endpoint will return only documents owned by you (and not shared from somebody else)',
      },
      {
        displayName: 'Use Typesense',
        name: 'useTypesense',
        type: 'boolean',
        default: false,
        description: 'If set to true, the endpoint will use typesense DB to search for the documents',
      },
    ],
  },

  // DOCUMENT OPERATIONS (DELETE, GET, GET CONTENT, GET DEPENDENT AGENTS, COMPUTE RAG)
  {
    displayName: 'Document ID',
    name: 'documentId',
    type: 'string',
    required: true,
    default: '',
    description: 'The ID of the knowledge base document',
    displayOptions: {
      show: {
        resource: ['knowledgeBase'],
        operation: ['deleteDocument', 'getDocument', 'getDocumentContent', 'getDependentAgents', 'computeRagIndex'],
      },
    },
  },

  // GET DOCUMENT CHUNK
  {
    displayName: 'Document ID',
    name: 'documentId',
    type: 'string',
    required: true,
    default: '',
    description: 'The ID of the knowledge base document',
    displayOptions: {
      show: {
        resource: ['knowledgeBase'],
        operation: ['getDocumentChunk'],
      },
    },
  },
  {
    displayName: 'Chunk ID',
    name: 'chunkId',
    type: 'string',
    required: true,
    default: '',
    description: 'The ID of the document chunk to retrieve',
    displayOptions: {
      show: {
        resource: ['knowledgeBase'],
        operation: ['getDocumentChunk'],
      },
    },
  },

  // CREATE DOCUMENT
  {
    displayName: 'Document Type',
    name: 'documentType',
    type: 'options',
    options: [
      {
        name: 'Upload File',
        value: 'file',
      },
      {
        name: 'Specify URL',
        value: 'url',
      },
    ],
    default: 'file',
    description: 'The type of document to create',
    displayOptions: {
      show: {
        resource: ['knowledgeBase'],
        operation: ['createDocument'],
      },
    },
  },
  {
    displayName: 'File',
    name: 'binaryData',
    type: 'boolean',
    default: true,
    required: true,
    description: 'File upload requires binary data from a previous node',
    displayOptions: {
      show: {
        resource: ['knowledgeBase'],
        operation: ['createDocument'],
        documentType: ['file'],
      },
    },
  },
  {
    displayName: 'Binary Property',
    name: 'binaryPropertyName',
    type: 'string',
    default: 'data',
    required: true,
    displayOptions: {
      show: {
        resource: ['knowledgeBase'],
        operation: ['createDocument'],
        documentType: ['file'],
        binaryData: [true],
      },
    },
    description: 'Object property name which holds binary data',
  },
  {
    displayName: 'URL',
    name: 'url',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['knowledgeBase'],
        operation: ['createDocument'],
        documentType: ['url'],
      },
    },
    description: 'URL to a page of documentation that the agent will have access to',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['knowledgeBase'],
        operation: ['createDocument'],
      },
    },
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'A custom, human-readable name for the document',
      },
    ],
  },

  // GET DEPENDENT AGENTS
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
    displayOptions: {
      show: {
        resource: ['knowledgeBase'],
        operation: ['getDependentAgents'],
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
        resource: ['knowledgeBase'],
        operation: ['getDependentAgents'],
        returnAll: [false],
      },
    },
  },

  // COMPUTE RAG INDEX
  {
    displayName: 'Model',
    name: 'model',
    type: 'options',
    options: [
      {
        name: 'E5 Mistral 7B Instruct',
        value: 'e5_mistral_7b_instruct',
      },
      {
        name: 'Multilingual E5 Large Instruct',
        value: 'multilingual_e5_large_instruct',
      },
    ],
    default: 'e5_mistral_7b_instruct',
    required: true,
    description: 'The model to use for computing the RAG index',
    displayOptions: {
      show: {
        resource: ['knowledgeBase'],
        operation: ['computeRagIndex'],
      },
    },
  },
];

export async function executeKnowledgeBaseOperation(
  this: IExecuteFunctions,
  i: number,
  operation: string,
  itemIndex: number,
): Promise<INodeExecutionData> {
  let responseData;
  const items = this.getInputData();

  // LIST DOCUMENTS
  if (operation === 'listDocuments') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    const filters = this.getNodeParameter('filters', i) as {
      search?: string;
      showOnlyOwnedDocuments?: boolean;
      useTypesense?: boolean;
    };

    const qs: any = {};
    
    if (filters.search) {
      qs.search = filters.search;
    }
    
    if (filters.showOnlyOwnedDocuments !== undefined) {
      qs.show_only_owned_documents = filters.showOnlyOwnedDocuments;
    }
    
    if (filters.useTypesense !== undefined) {
      qs.use_typesense = filters.useTypesense;
    }

    if (returnAll) {
      responseData = await elevenLabsApiRequestAllItems.call(
        this,
        'GET',
        '/convai/knowledge-base',
        {},
        qs,
        'documents'
      );
      
      return {
        json: { documents: responseData },
        pairedItem: { item: itemIndex },
      };
    } else {
      const limit = this.getNodeParameter('limit', i) as number;
      qs.page_size = limit;
      
      responseData = await elevenLabsApiRequest.call(
        this,
        'GET',
        '/convai/knowledge-base',
        {},
        qs,
      );
    }
  }
  
  // GET DOCUMENT
  else if (operation === 'getDocument') {
    const documentId = this.getNodeParameter('documentId', i) as string;
    
    responseData = await elevenLabsApiRequest.call(
      this,
      'GET',
      `/convai/knowledge-base/${documentId}`,
    );
  }
  
  // DELETE DOCUMENT
  else if (operation === 'deleteDocument') {
    const documentId = this.getNodeParameter('documentId', i) as string;
    
    responseData = await elevenLabsApiRequest.call(
      this,
      'DELETE',
      `/convai/knowledge-base/${documentId}`,
    );
    
    if (!responseData) {
      responseData = { success: true };
    }
  }
  
  // GET DOCUMENT CONTENT
  else if (operation === 'getDocumentContent') {
    const documentId = this.getNodeParameter('documentId', i) as string;
    
    responseData = await elevenLabsApiRequest.call(
      this,
      'GET',
      `/convai/knowledge-base/${documentId}/content`,
    );
  }
  
  // GET DOCUMENT CHUNK
  else if (operation === 'getDocumentChunk') {
    const documentId = this.getNodeParameter('documentId', i) as string;
    const chunkId = this.getNodeParameter('chunkId', i) as string;
    
    responseData = await elevenLabsApiRequest.call(
      this,
      'GET',
      `/convai/knowledge-base/${documentId}/chunk/${chunkId}`,
    );
  }
  
  // GET DEPENDENT AGENTS
  else if (operation === 'getDependentAgents') {
    const documentId = this.getNodeParameter('documentId', i) as string;
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    
    const qs: any = {};
    
    if (returnAll) {
      responseData = await elevenLabsApiRequestAllItems.call(
        this,
        'GET',
        `/convai/knowledge-base/${documentId}/dependent-agents`,
        {},
        qs,
        'agents'
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
        `/convai/knowledge-base/${documentId}/dependent-agents`,
        {},
        qs,
      );
    }
  }
  
  // CREATE DOCUMENT
  else if (operation === 'createDocument') {
    const documentType = this.getNodeParameter('documentType', i) as string;
    const additionalFields = this.getNodeParameter('additionalFields', i) as {
      name?: string;
    };
    
    if (documentType === 'url') {
      const url = this.getNodeParameter('url', i) as string;
      
      // Make sure the URL is being properly passed
      const body: any = {
        url: url,  // Ensure this value is set correctly
      };
      
      if (additionalFields.name) {
        body.name = additionalFields.name;
      }
      
      responseData = await elevenLabsApiRequest.call(
        this,
        'POST',
        '/convai/knowledge-base',
        body,
        {},  // Empty query parameters
      );
    } else {
      // Handle file upload using multipart/form-data
      const binaryData = this.getNodeParameter('binaryData', i) as boolean;
      
      if (binaryData) {
        const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
        
        if (items[i].binary === undefined) {
          throw new Error('No binary data exists on item!');
        }
        
        const item = items[i].binary as any;
        
        if (item[binaryPropertyName] === undefined) {
          throw new Error(`Binary data property "${binaryPropertyName}" does not exist!`);
        }
        
        const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
        
        // Create a proper multipart form-data structure
        const formData: any = {};
        
        // Add the file with correct parameters
        formData.file = {
          value: binaryDataBuffer,
          options: {
            filename: item[binaryPropertyName].fileName || 'file',
            contentType: item[binaryPropertyName].mimeType,
          },
        };
        
        // Add the name if specified
        if (additionalFields.name) {
          formData.name = additionalFields.name;
        }
        
        // Make sure we're properly sending the form data
        responseData = await elevenLabsApiRequest.call(
          this,
          'POST',
          '/convai/knowledge-base',
          {},   // Empty body since we're using formData
          {},   // Empty query parameters
          undefined,
          { 
            formData,
            headers: {
              // Remove the Content-Type header to let the form data set its own
              'Content-Type': null,
            },
          },
        );
      } else {
        throw new Error('Binary data is required for file upload');
      }
    }
  }
  
  // COMPUTE RAG INDEX
  else if (operation === 'computeRagIndex') {
    const documentId = this.getNodeParameter('documentId', i) as string;
    const model = this.getNodeParameter('model', i) as string;
    
    responseData = await elevenLabsApiRequest.call(
      this,
      'POST',
      `/convai/knowledge-base/${documentId}/rag-index`,
      { model },
    );
  }

  return {
    json: responseData,
    pairedItem: { item: itemIndex },
  };
}
