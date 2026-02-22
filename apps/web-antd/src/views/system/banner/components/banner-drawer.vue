<script setup lang="ts">
import type { BannerFormState, Banner } from '../../types';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useVbenForm } from '#/adapter/form';
import { message, Upload } from 'ant-design-vue';

import {
	addBanner,
	getBannerById,
	updateBanner,
} from '#/utils/banner-storage';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const uploadedImageUrl = ref('');

const title = computed(() => {
	return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

// 自定义图片上传处理 - 转换为 base64
async function handleCustomUpload(file: File) {
	const isImage =
		file.type === 'image/jpeg' ||
		file.type === 'image/png' ||
		file.type === 'image/gif' ||
		file.type === 'image/jpg';
	if (!isImage) {
		message.error('只能上传 jpg/png/gif 格式的图片！');
		return false;
	}
	const isLt5M = file.size / 1024 / 1024 < 5;
	if (!isLt5M) {
		message.error('图片大小不能超过 5MB！');
		return false;
	}

	try {
		const base64 = await new Promise<string>((resolve) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
		});
		uploadedImageUrl.value = base64;
		message.success('图片上传成功');
		return false; // 阻止默认上传行为
	} catch {
		message.error('图片上传失败');
		return false;
	}
}

const [Form, formApi] = useVbenForm({
	commonConfig: {
		componentProps: {
			class: 'w-full',
		},
		labelWidth: 100,
	},
	layout: 'horizontal',
	schema: [
		{
			component: 'Input',
			componentProps: {
				placeholder: '请输入 Banner 标题',
				maxlength: 50,
			},
			fieldName: 'title',
			label: 'Banner 标题',
			rules: 'required',
		},
		{
			component: 'InputNumber',
			componentProps: {
				placeholder: '数字越小越靠前',
				min: 0,
				class: 'w-full',
			},
			fieldName: 'orderNum',
			label: '排序',
			rules: 'required',
			defaultValue: 0,
		},
		{
			component: 'RadioGroup',
			componentProps: {
				options: [
					{ label: '启用', value: '1' },
					{ label: '禁用', value: '0' },
				],
			},
			fieldName: 'status',
			label: '状态',
			defaultValue: '1',
		},
	],
	wrapperClass: 'grid-cols-1',
	submitButtonOptions: {
		text: '提交',
	},
	showDefaultActions: false,
});

const [BasicDrawer, drawerApi] = useVbenDrawer({
	onClosed: handleClosed,
	onConfirm: handleConfirm,
	async onOpenChange(isOpen) {
		if (!isOpen) {
			return null;
		}
		const { id } = drawerApi.getData() as { id?: string };
		isUpdate.value = !!id;

		// 如果是编辑模式，加载数据
		if (isUpdate.value && id) {
			const data = getBannerById(id);
			if (data) {
				uploadedImageUrl.value = data.imageUrl;
				await formApi.setValues(data);
			}
		} else {
			uploadedImageUrl.value = '';
		}
	},
});

async function handleConfirm() {
	try {
		drawerApi.lock(true);
		const { valid } = await formApi.validate();
		if (!valid) {
			return;
		}
		const data = (await formApi.getValues()) as BannerFormState;

		// 使用上传的图片地址
		if (uploadedImageUrl.value) {
			data.imageUrl = uploadedImageUrl.value;
		}

		if (isUpdate.value) {
			const { id } = drawerApi.getData() as { id: string };
			updateBanner(id, data);
			message.success('更新成功');
		} else {
			addBanner(data);
			message.success('新增成功');
		}

		emit('reload');
		drawerApi.close();
	} catch {
		message.error(isUpdate.value ? '更新失败' : '新增失败');
	} finally {
		drawerApi.lock(false);
	}
}

async function handleClosed() {
	await formApi.resetForm();
	uploadedImageUrl.value = '';
}
</script>

<template>
	<BasicDrawer :title="title" class="w-[600px]">
		<Form />
		<!-- 自定义图片上传区域 -->
		<div class="mb-6 px-6">
			<label class="mb-2 block required text-sm font-medium">
				Banner 图片
			</label>
			<div class="flex items-center gap-4">
				<Upload
					:before-upload="handleCustomUpload"
					:show-upload-list="false"
					accept="image/jpeg,image/jpg,image/png,image/gif"
				>
					<a-button>
						{{ uploadedImageUrl ? '重新上传' : '选择图片' }}
					</a-button>
				</Upload>
				<span class="text-xs text-gray-500">
					支持 jpg、png、gif 格式，大小不超过 5MB
				</span>
			</div>
			<div v-if="uploadedImageUrl" class="mt-3">
				<img
					:src="uploadedImageUrl"
					alt="Banner 预览"
					class="h-32 rounded border object-cover"
				/>
			</div>
		</div>
	</BasicDrawer>
</template>
