<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { Activity } from '#/utils/news-storage';

import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';

import { message, Popconfirm, Space, Switch, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import {
	getActivities,
	deleteActivity,
	toggleActivityStatus,
} from '#/utils/news-storage';

import ActivityDrawer from './components/activity-drawer.vue';

defineOptions({ name: 'HomeActivity' });

// 数据列表
const activityList = ref<Activity[]>([]);

// ========== 表格配置 ==========
const activityColumns = [
	{ type: 'checkbox', width: 50 },
	{ type: 'seq', width: 70, title: '序号' },
	{ field: 'title', title: '活动标题', minWidth: 200 },
	{ field: 'startDate', title: '开始时间', width: 120 },
	{ field: 'endDate', title: '结束时间', width: 120 },
	{ field: 'location', title: '地点', width: 150 },
	{
		field: 'status',
		title: '状态',
		width: 100,
		slots: { default: 'activity_status' },
	},
	{ field: 'orderNum', title: '排序', width: 80 },
	{
		field: 'action',
		title: '操作',
		width: 180,
		fixed: 'right',
		slots: { default: 'activity_action' },
	},
];

const activityGridOptions = ref<VxeGridProps>({
	checkboxConfig: {
		highlight: true,
		reserve: true,
	},
	columns: activityColumns,
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
	id: 'activity-index',
});

const [ActivityTable, activityTableApi] = useVbenVxeGrid({
	gridOptions: activityGridOptions,
});

// ========== 抽屉组件 ==========
const [ActivityDrawerComp, activityDrawerApi] = useVbenDrawer({
	connectedComponent: ActivityDrawer,
});

// ========== 数据加载 ==========
function loadData() {
	activityList.value = getActivities();
	// 重新加载表格数据
	activityTableApi?.grid?.reloadData(activityList.value);
}

// ========== 活动日历操作 ==========
function handleAddActivity() {
	activityDrawerApi.setData({});
	activityDrawerApi.open();
}

function handleEditActivity(row: Activity) {
	activityDrawerApi.setData({ id: row.id });
	activityDrawerApi.open();
}

async function handleDeleteActivity(row: Activity) {
	Popconfirm.confirm({
		title: '提示',
		okType: 'danger',
		content: `确认删除活动"${row.title}"吗？`,
		onOk: () => {
			deleteActivity(row.id);
			message.success('删除成功');
			loadData();
		},
	});
}

function handleMultiDeleteActivity() {
	const rows = activityTableApi?.grid?.getCheckboxRecords() || [];
	if (rows.length === 0) {
		message.warning('请选择要删除的记录');
		return;
	}
	Popconfirm.confirm({
		title: '提示',
		okType: 'danger',
		content: `确认删除选中的 ${rows.length} 条记录吗？`,
		onOk: () => {
			rows.forEach((row: Activity) => {
				deleteActivity(row.id);
			});
			message.success('删除成功');
			loadData();
		},
	});
}

function handleToggleActivityStatus(row: Activity) {
	toggleActivityStatus(row.id);
	loadData();
	message.success(`已${row.status === '1' ? '禁用' : '启用'}`);
}

onMounted(() => {
	loadData();
});
</script>

<template>
	<Page :auto-content-height="true">
		<ActivityTable table-title="活动日历">
			<template #toolbar-tools>
				<Space>
					<a-button
						danger
						type="primary"
						@click="handleMultiDeleteActivity"
					>
						批量删除
					</a-button>
					<a-button type="primary" @click="handleAddActivity">
						新增活动
					</a-button>
				</Space>
			</template>
			<template #activity_status="{ row }">
				<Tag :color="row.status === '1' ? 'green' : 'default'">
					{{ row.status === '1' ? '启用' : '禁用' }}
				</Tag>
			</template>
			<template #activity_action="{ row }">
				<Space>
					<Switch
						:checked="row.status === '1'"
						checked-children="启用"
						un-checked-children="禁用"
						size="small"
						@change="handleToggleActivityStatus(row)"
					/>
					<a-button
						type="link"
						size="small"
						@click="handleEditActivity(row)"
					>
						编辑
					</a-button>
					<Popconfirm
						:get-popup-container="getVxePopupContainer"
						placement="left"
						title="确认删除？"
						@confirm="handleDeleteActivity(row)"
					>
						<a-button type="link" size="small" danger>
							删除
						</a-button>
					</Popconfirm>
				</Space>
			</template>
		</ActivityTable>

		<!-- 抽屉组件 -->
		<ActivityDrawerComp @reload="loadData" />
	</Page>
</template>
