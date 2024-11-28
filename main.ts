import {  Plugin, TFile, Notice } from 'obsidian';

export default class DeleteUntitledEmptyFilesPlugin extends Plugin {

	async onload() {
		this.addCommand({
			id: 'delete-untitled-empty-files',
			name: 'Delete Untitled and Empty Files',
			callback: () => this.deleteUntitledEmptyFiles(),
		});
	}

	/**
	 * 删除所有标题为"Untitled"或"Untitled *"且内容为空的文件
	 */
	async deleteUntitledEmptyFiles() {
		const filesToDelete: TFile[] = [];
		const allFiles = this.app.vault.getFiles();  // 获取所有文件

		for (const file of allFiles) {
			// 获取文件的标题
			const fileName = file.name;
			const fileContent = await this.readFileContent(file);

			// 判断文件是否是"Untitled" 或 "Untitled *"格式的文件，且内容为空
			if (this.isUntitledPattern(fileName) && this.isEmptyContent(fileContent)) {
				filesToDelete.push(file);
			}
		}

		if (filesToDelete.length > 0) {
			for (const file of filesToDelete) {
				await this.deleteFile(file);
			}
			new Notice(`Deleted ${filesToDelete.length} file(s).`);
		} else {
			new Notice('No files to delete.');
		}
	}

	/**
	 * 判断文件名是否符合"Untitled" 或 "Untitled *"格式
	 * @param fileName 文件名
	 * @returns true: 如果符合 "Untitled" 或 "Untitled *" 格式, false: 否则
	 */
	private isUntitledPattern(fileName: string): boolean {
		const regex = /^(Untitled|未命名)(\s\d+)?\.md$/;
		return regex.test(fileName);
	}

	/**
	 * 判断文件内容是否为空
	 * @param content 文件内容
	 * @returns true: 如果内容为空, false: 否则
	 */
	private isEmptyContent(content: string): boolean {
		return content.trim() === ''; // 空内容
	}

	/**
	 * 读取文件内容并判断文件是否为空
	 * @param file 文件对象
	 * @returns 文件的部分内容
	 */
	private async readFileContent(file: TFile): Promise<string> {
		try {
			const fileData = await this.app.vault.read(file);
			// 只检查文件的开头部分是否为空，避免读取大文件
			return fileData.substring(0, 1000).trim();  // 读取前1000个字符
		} catch (err) {
			console.error('Failed to read file', file.path, err);
			return '';
		}
	}

	/**
	 * 删除文件
	 * @param file 文件对象
	 */
	private async deleteFile(file: TFile) {
		try {
			await this.app.vault.delete(file);
		} catch (err) {
			console.error('Failed to delete file', file.path, err);
		}
	}
}
