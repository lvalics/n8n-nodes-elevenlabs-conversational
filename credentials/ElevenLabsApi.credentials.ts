import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
} from 'n8n-workflow';

export class ElevenLabsApi implements ICredentialType {
	name = 'elevenLabsApi';
	displayName = 'ElevenLabs API';
	documentationUrl = 'https://docs.elevenlabs.io/api-reference/authentication';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'The ElevenLabs API key. You can find this in your ElevenLabs account dashboard.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'xi-api-key': '={{$credentials.apiKey}}',
			},
		},
	};

	test?: ICredentialTestRequest | undefined = {
		request: {
			baseURL: 'https://api.elevenlabs.io/v1',
			url: '/voices',
		},
	};
}
