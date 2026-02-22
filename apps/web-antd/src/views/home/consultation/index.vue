<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { Consultation } from '#/utils/consultation-storage';

import { onMounted, ref, reactive } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';

import { Input, Select, Space, Tag, Popconfirm, message, Dropdown, Menu } from 'ant-design-vue';
import { DownOutlined } from '@ant-design/icons-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import {
	getConsultations,
	queryConsultations,
	deleteConsultation,
	batchDeleteConsultations,
	updateConsultationStatus,
} from '#/utils/consultation-storage';

import DetailDrawer from './components/detail-drawer.vue';

defineOptions({ name: 'HomeConsultation' });

// ========== 查询条件 ==========
const queryParams = reactive({
	name: '',
	phone: '',
	status: undefined as Consultation['status'] | undefined,
});

// ========== 表格配置 ==========
const consultationColumns = [
	{ type: 'checkbox', width: 50 },
	{ type: 'seq', width: 70, title: '序号' },
	{ field: 'name', title: '咨询人', minWidth: 100 },
	{ field: 'phone', title: '联系电话', width: 130 },
	{ field: 'subject', title: '咨询主题', minWidth: 150 },
	{
		field: 'status',
		title: '状态',
		width: 100,
		slots: { default: 'consultation_status' },
	},
	{ field: 'createdAt', title: '提交时间', width: 170 },
	{
		field: 'action',
		title: '操作',
		width: 200,
		fixed: 'right',
		slots: { default: 'consultation_action' },
	},
];

const consultationGridOptions = ref<VxeGridProps>({
	checkboxConfig: {
		highlight: true,
		reserve: true,
	},
	columns: consultationColumns,
	data: [],
	height: 'auto',
	keepSource: true,
	headerCellConfig: {
		height: 44,
	},
	cellConfig: {
		height: 48,
	},
	rowConfig: {
		keyField: 'id',
		isHover: true,
	},
	id: 'consultation-index',
});

const [ConsultationTable, consultationTableApi] = useVbenVxeGrid({
	gridOptions: consultationGridOptions,
});

// ========== 详情抽屉组件 ==========
const detailDrawerRef = ref<InstanceType<typeof DetailDrawer>>();

// ========== 状态配置 ==========
const statusConfig = {
	pending: { text: '待处理', color: 'orange' },
	replied: { text: '已回复', color: 'green' },
	closed: { text: '已关闭', color: 'default' },
} as const;

// ========== 数据加载 ==========
function loadData() {
	const result = queryConsultations({
		name: queryParams.name || undefined,
		phone: queryParams.phone || undefined,
		status: queryParams.status,
	});
	consultationTableApi?.grid?.reloadData(result);
}

// ========== 查询操作 ==========
function handleQuery() {
	loadData();
}

function handleReset() {
	queryParams.name = '';
	queryParams.phone = '';
	queryParams.status = undefined;
	loadData();
}

// ========== 咨询操作 ==========
function handleViewDetail(row: Consultation) {
	detailDrawerRef.value?.openDrawer(row.id);
}

function handleDelete(row: Consultation) {
	Popconfirm.confirm({
		title: '提示',
		okType: 'danger',
		content: `确认删除来自"${row.name}"的咨询记录吗？`,
		onOk: () => {
			deleteConsultation(row.id);
			message.success('删除成功');
			loadData();
		},
	});
}

function handleBatchDelete() {
	const rows = consultationTableApi?.grid?.getCheckboxRecords() || [];
	if (rows.length === 0) {
		message.warning('请选择要删除的记录');
		return;
	}
	Popconfirm.confirm({
		title: '提示',
		okType: 'danger',
		content: `确认删除选中的 ${rows.length} 条记录吗？`,
		onOk: () => {
			const ids = rows.map((r: Consultation) => r.id);
			batchDeleteConsultations(ids);
			message.success('删除成功');
			loadData();
		},
	});
}

function handleUpdateStatus(row: Consultation, status: Consultation['status']) {
	updateConsultationStatus(row.id, status);
	loadData();
	message.success('状态已更新');
}

onMounted(() => {
	loadData();
});
</script>

<template>
	<Page :auto-content-height="true">
		<ConsultationTable table-title="在线咨询列表">
			<template #toolbar-tools>
				<Space>
					<Input
						v-model:value="queryParams.name"
						placeholder="输入姓名查询"
						allow-clear
						style="width: 150px"
						@press-enter="handleQuery"
					/>
					<Input
						v-model:value="queryParams.phone"
						placeholder="输入电话查询"
						allow-clear
						style="width: 150px"
						@press-enter="handleQuery"
					/>
					<Select
						v-model:value="queryParams.status"
						placeholder="选择状态"
						allow-clear
						style="width: 120px"
					>
						<Select.Option value="pending">待处理</Select.Option>
						<Select.Option value="replied">已回复</Select.Option>
						<Select.Option value="closed">已关闭</Select.Option>
					</Select>
					<a-button type="primary" @click="handleQuery">
						查询
					</a-button>
					<a-button @click="handleReset">
						重置
					</a-button>
					<a-button danger type="primary" @click="handleBatchDelete">
						批量删除
					</a-button>
				</Space>
			</template>

			<template #consultation_status="{ row }">
				<Tag :color="statusConfig[row.status].color">
					{{ statusConfig[row.status].text }}
				</Tag>
			</template>

			<template #consultation_action="{ row }">
				<Space>
					<a-button type="link" size="small" @click="handleViewDetail(row)">
						详情
					</a-button>
					<Dropdown>
						<template #overlay>
							<Menu>
								<Menu.Item @click="handleUpdateStatus(row, 'pending')">
									<Tag color="orange">待处理</Tag>
								</Menu.Item>
								<Menu.Item @click="handleUpdateStatus(row, 'replied')">
									<Tag color="green">已回复</Tag>
								</Menu.Item>
								<Menu.Item @click="handleUpdateStatus(row, 'closed')">
									<Tag color="default">已关闭</Tag>
								</Menu.Item>
							</Menu>
						</template>
						<a-button type="link" size="small">
							状态 <DownOutlined />
						</a-button>
					</Dropdown>
					<Popconfirm
						:get-popup-container="getVxePopupContainer"
						placement="left"
						title="确认删除？"
						@confirm="handleDelete(row)"
					>
						<a-button type="link" size="small" danger>
							删除
						</a-button>
					</Popconfirm>
				</Space>
			</template>
		</ConsultationTable>

		<!-- 详情抽屉 -->
		<DetailDrawer ref="detailDrawerRef" />
	</Page>
</template>

<style scoped>
:deep(.ant-dropdown-menu) {
	min-width: 100px;
}

:deep(.ant-dropdown-menu-item) {
	padding: 8px 12px;
}
</style>
