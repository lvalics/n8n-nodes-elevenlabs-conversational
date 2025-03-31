import {
  IExecuteFunctions,
  IHookFunctions,
  IHttpRequestOptions,
  IDataObject,
  IExecuteSingleFunctions,
  ILoadOptionsFunctions,
  IHttpRequestMethods,
} from 'n8n-workflow';

export async function elevenLabsApiRequest(
  this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
  method: IHttpRequestMethods,
  resource: string,
  body: IDataObject = {},
  qs: IDataObject = {},
  uri?: string,
  option: IDataObject = {},
) {
  const credentials = await this.getCredentials('elevenLabsApi');
  
  // Base options
  const options: IHttpRequestOptions = {
    method,
    url: uri || `https://api.elevenlabs.io/v1${resource}`,
    headers: {
      'xi-api-key': credentials.apiKey as string,
    },
    json: true,
  };
  
  // Custom headers if provided in options
  if (option.headers && typeof option.headers === 'object') {
    options.headers = { 
      ...options.headers, 
      ...(option.headers as Record<string, string>) 
    };
  }
  
  // Handle form data or JSON body
  if (option.formData) {
    // For multipart form-data, it's better to use the FormData approach directly
    // in the specific service implementation rather than here
    console.warn('Using formData option is deprecated. Use helpers.FormData directly instead.');
    
    options.body = option.formData;
    options.json = false;
    
    // Don't set Content-Type for multipart/form-data
    if (options.headers && options.headers['Content-Type']) {
      delete options.headers['Content-Type'];
    }
  } else if (Object.keys(body).length > 0) {
    // For regular JSON data
    options.body = body;
    if (options.headers) {
      options.headers['Content-Type'] = 'application/json';
    }
  }
  
  // Add query parameters if they exist
  if (Object.keys(qs).length > 0) {
    options.qs = qs;
  }

  try {
    return await this.helpers.httpRequest(options);
  } catch (error) {
    if (error.response && error.response.data) {
      // Include the API error details if available
      const errorMessage = `ElevenLabs API error: ${error.message}. Details: ${JSON.stringify(error.response.data)}`;
      error.message = errorMessage;
    }
    throw error;
  }
}

export async function elevenLabsApiRequestAllItems(
  this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject = {},
  query: IDataObject = {},
  dataKey: string = 'agents',
) {
  const returnData: IDataObject[] = [];
  let responseData;
  let nextCursor: string | undefined;

  if (!query.page_size) {
    query.page_size = 100;
  }

  do {
    if (nextCursor) {
      query.cursor = nextCursor;
    }
    
    responseData = await elevenLabsApiRequest.call(this, method, endpoint, body, query);
    
    if (responseData[dataKey] && Array.isArray(responseData[dataKey])) {
      returnData.push.apply(returnData, responseData[dataKey]);
    }
    
    nextCursor = responseData.next_cursor;
  } while (responseData.has_more === true && nextCursor);

  return returnData;
}
