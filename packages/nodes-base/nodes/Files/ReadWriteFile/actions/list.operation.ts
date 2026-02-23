import { NodeApiError } from 'n8n-workflow';
import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	JsonObject,
} from 'n8n-workflow';

import { updateDisplayOptions } from '@utils/utilities';

import { errorMapper } from '../helpers/utils';

export const properties: INodeProperties[] = [
	{
		displayName: 'Path to List Files From',
		name: 'path',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. /home/user/Pictures/',
		hint: '',
		description: 'Specify the path to directory',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		options: [
			{
				displayName: 'Recursive Depth',
				name: 'recursive',
				type: 'number',
				default: 0,
				placeholder: 'e.g. zip',
				description: 'Whether to recursively list files of subdirectory and to which depth',
			},
		],
	},
];

const displayOptions = {
	show: {
		operation: ['list'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, items: INodeExecutionData[]) {
	const returnData: INodeExecutionData[] = [];

	for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
		const path = this.getNodeParameter('path', itemIndex, {}) as string;
		const { recursive = 0 } = this.getNodeParameter('options', itemIndex, {}) ?? {};

		try {
			const files = await this.helpers.listFiles(await this.helpers.resolvePath(path), {
				recursive: Number(recursive),
			});

			for (const file of files) {
				returnData.push({
					json: {
						file,
					},
				});
			}
		} catch (error) {
			const nodeOperationError = errorMapper.call(this, error, itemIndex, {
				filePath: path,
				operation: 'read',
			});
			if (this.continueOnFail()) {
				returnData.push({
					json: {
						error: nodeOperationError.message,
					},
					pairedItem: {
						item: itemIndex,
					},
				});
				continue;
			}
			throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex });
		}
	}

	return returnData;
}
