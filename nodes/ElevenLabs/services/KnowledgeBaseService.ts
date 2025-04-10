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
      // For URL uploads
      const url = this.getNodeParameter('url', i) as string;

      // Create the body with the format matching the Python client
      const body: Record<string, any> = {
        url: {
          type: "json",
          value: url
        }
      };

      // Add name only if specified
      if (additionalFields.name) {
        body.name = additionalFields.name;
      }

      try {
        // Use the elevenLabsApiRequest function with the properly structured body
        responseData = await elevenLabsApiRequest.call(
          this,
          'POST',
          '/convai/knowledge-base',
          body,
        );

      } catch (error) {
        // Rethrow a more helpful error message
        throw new Error(`URL document creation failed: ${error.message}. Make sure the URL is valid and accessible.`);
      }
    } else {
      // For file uploads - get binary data
      const binaryData = this.getNodeParameter('binaryData', i) as boolean;

      if (binaryData) {
        const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;

        if (!items[i].binary) {
          throw new Error('No binary data exists on item!');
        }

        const item = items[i].binary as any;

        if (!item[binaryPropertyName]) {
          throw new Error(`Binary data property "${binaryPropertyName}" does not exist!`);
        }

        // Get credentials directly
        const credentials = await this.getCredentials('elevenLabsApi');

        // Create a direct request to the ElevenLabs API
        try {
          // Get the binary data as a buffer
          const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
          const fileName = item[binaryPropertyName].fileName || 'file';
          const mimeType = item[binaryPropertyName].mimeType || 'application/octet-stream';

          // Let's try a simpler approach with curl-like direct multipart form data
          // This is more similar to the curl example in the documentation
          const boundary = `----WebKitFormBoundary${Math.random().toString(16).substr(2)}`;

          const formDataContent = Buffer.concat([
            // File part
            Buffer.from(`--${boundary}\r\n`),
            Buffer.from(`Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`),
            Buffer.from(`Content-Type: ${mimeType}\r\n\r\n`),
            binaryDataBuffer,
            Buffer.from('\r\n'),

            // Name part (if provided)
            ...(additionalFields.name ? [
              Buffer.from(`--${boundary}\r\n`),
              Buffer.from(`Content-Disposition: form-data; name="name"\r\n\r\n`),
              Buffer.from(additionalFields.name),
              Buffer.from('\r\n'),
            ] : []),

            // End boundary
            Buffer.from(`--${boundary}--\r\n`),
          ]);

          // Make direct request with raw form data
          const response = await this.helpers.httpRequest({
            method: 'POST',
            url: 'https://api.elevenlabs.io/v1/convai/knowledge-base',
            headers: {
              'xi-api-key': credentials.apiKey as string,
              'Content-Type': `multipart/form-data; boundary=${boundary}`,
              'Content-Length': formDataContent.length.toString(),
            },
            body: formDataContent,
            json: false,
            returnFullResponse: true,
          });

          // Parse response
          try {
            // Check if response.body is already an object or a JSON string
            if (typeof response.body === 'string') {
              responseData = JSON.parse(response.body);
            } else {
              // If it's already an object, use it directly
              responseData = response.body;
            }
          } catch (parseError) {
            throw new Error(`Failed to parse response: ${parseError.message}. Response: ${response.body}`);
          }
        } catch (error) {
          throw new Error(`Failed to upload file: ${error.message}`);
        }
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
