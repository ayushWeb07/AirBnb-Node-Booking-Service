export interface AddEmailDto {
	toMailAddress: string;
	subject: string;
	templateId: string;
	params: Record<string, any>;
}
