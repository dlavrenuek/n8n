import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import * as list from './actions/list.operation';
import * as read from './actions/read.operation';
import * as write from './actions/write.operation';

export class ReadWriteFile implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Read/Write Files from Disk',
		name: 'readWriteFile',
		icon: 'file:readWriteFile.svg',
		group: ['input'],
		version: [1, 1.1, 1.2],
		description: 'Read or write files from the computer that runs n8n',
		defaults: {
			name: 'Read/Write Files from Disk',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		properties: [
			{
				displayName:
					'Use this node to read and write files on the same computer running n8n. To handle files between different computers please use other nodes (e.g. FTP, HTTP Request, AWS).',
				name: 'info',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Read File(s) From Disk',
						value: 'read',
						description: 'Retrieve one or more files from the computer that runs n8n',
						action: 'Read File(s) From Disk',
					},
					{
						name: 'Write File to Disk',
						value: 'write',
						description: 'Create a binary file on the computer that runs n8n',
						action: 'Write File to Disk',
					},
					{
						name: 'List Files in a Directly',
						value: 'list',
						description: 'Lists files in a given directory',
						action: 'List Files in a Directly',
					},
				],
				default: 'read',
			},
			...read.description,
			...write.description,
			...list.description,
		],
	};

	async execute(this: IExecuteFunctions) {
		const operation = this.getNodeParameter('operation', 0, 'read');
		const items = this.getInputData();
		let returnData: INodeExecutionData[] = [];

		if (operation === 'read') {
			returnData = await read.execute.call(this, items);
		}

		if (operation === 'write') {
			returnData = await write.execute.call(this, items);
		}

		if (operation === 'list') {
			returnData = await list.execute.call(this, items);
		}

		return [returnData];
	}
}
