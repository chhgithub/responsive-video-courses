export interface Banner {
	id: string;
	title: string;
	imageUrl: string;
	orderNum: number;
	status: '0' | '1';
	createTime: string;
}

export interface BannerFormState {
	title: string;
	imageUrl: string;
	orderNum: number;
	status: '0' | '1';
}
