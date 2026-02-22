<script setup lang="ts">
import { ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Descriptions, Divider, Tag } from 'ant-design-vue';

import type { Consultation } from '#/utils/consultation-storage';

import { getConsultationById } from '#/utils/consultation-storage';

defineOptions({ name: 'ConsultationDetailDrawer' });

const [Drawer, drawerApi] = useVbenDrawer({
	onClose: () => {
		drawerApi.setState({ visible: false });
	},
	title: '咨询详情',
});

const consultation = ref<Consultation | null>(null);

// 状态标签配置
const statusConfig = {
	pending: { text: '待处理', color: 'orange' },
	replied: { text: '已回复', color: 'green' },
	closed: { text: '已关闭', color: 'default' },
} as const;

// 监听抽屉打开
watch(
	() => drawerApi.state.data,
	(data) => {
		if (data?.id) {
			consultation.value = getConsultationById(data.id) || null;
		} else {
			consultation.value = null;
		}
	}
);

// 打开抽屉
function openDrawer(id: string) {
	drawerApi.setData({ id });
	drawerApi.open();
}

// 暴露方法给父组件
defineExpose({
	openDrawer,
});
</script>

<template>
	<Drawer>
		<div v-if="consultation" class="p-4">
			<!-- 基本信息 -->
			<Descriptions bordered :column="2" size="middle">
				<Descriptions.Item label="咨询人">
					{{ consultation.name }}
				</Descriptions.Item>
				<Descriptions.Item label="联系电话">
					{{ consultation.phone }}
				</Descriptions.Item>
				<Descriptions.Item label="电子邮箱" :span="2">
					{{ consultation.email }}
				</Descriptions.Item>
				<Descriptions.Item label="咨询主题" :span="2">
					{{ consultation.subject || '-' }}
				</Descriptions.Item>
				<Descriptions.Item label="处理状态">
					<Tag :color="statusConfig[consultation.status].color">
						{{ statusConfig[consultation.status].text }}
					</Tag>
				</Descriptions.Item>
				<Descriptions.Item label="提交时间">
					{{ consultation.createdAt }}
				</Descriptions.Item>
				<Descriptions.Item
					v-if="consultation.repliedAt"
					label="回复时间"
					:span="2"
				>
					{{ consultation.repliedAt }}
				</Descriptions.Item>
			</Descriptions>

			<Divider />

			<!-- 留言内容 -->
			<div class="mb-4">
				<div class="mb-2 text-sm font-semibold text-gray-700">留言内容</div>
				<div class="rounded-lg bg-gray-50 p-4 text-gray-700">
					{{ consultation.message }}
				</div>
			</div>

			<!-- 操作提示 -->
			<div class="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
				<div class="mb-1 font-semibold">💡 温馨提示</div>
				<ul class="ml-4 list-disc space-y-1">
					<li>此为用户在前台提交的咨询留言</li>
					<li>如需回复，可通过电话或邮件联系用户</li>
					<li>回复后请及时更新咨询状态</li>
				</ul>
			</div>
		</div>
		<div v-else class="flex items-center justify-center p-8 text-gray-500">
			暂无数据
		</div>
	</Drawer>
</template>

<style scoped>
:deep(.ant-descriptions-item-label) {
	background-color: #fafafa;
	font-weight: 500;
}
</style>
