<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { HotTopic } from '#/utils/news-storage';

import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';

import { message, Popconfirm, Space, Switch, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import {
	getHotTopics,
	deleteHotTopic,
	toggleHotTopicStatus,
} from '#/utils/news-storage';

import HotDrawer from './components/hot-drawer.vue';

defineOptions({ name: 'HomeHot' });

// 数据列表
const hotList = ref<HotTopic[]>([]);

// ========== 表格配置 ==========
const hotColumns = [
	{ type: 'checkbox', width: 50 },
	{ type: 'seq', width: 70, title: '序号' },
	{ field: 'title', title: '热点标题', minWidth: 200 },
	{ field: 'link', title: '链接', minWidth: 200 },
	{
		field: 'status',
		title: '状态',
		width: 100,
		slots: { default: 'hot_status' },
	},
	{ field: 'orderNum', title: '排序', width: 80 },
	{
		field: 'action',
		title: '操作',
		width: 180,
		fixed: 'right',
		slots: { default: 'hot_action' },
	},
];

const hotGridOptions = ref<VxeGridProps>({
	checkboxConfig: {
		highlight: true,
		reserve: true,
	},
	columns: hotColumns,
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
	id: 'hot-index',
});

const [HotTable, hotTableApi] = useVbenVxeGrid({
	gridOptions: hotGridOptions,
});

// ========== 抽屉组件 ==========
const [HotDrawerComp, hotDrawerApi] = useVbenDrawer({
	connectedComponent: HotDrawer,
});

// ========== 数据加载 ==========
function loadData() {
	hotList.value = getHotTopics();
	// 重新加载表格数据
	hotTableApi?.grid?.reloadData(hotList.value);
}

// ========== 热点操作 ==========
function handleAddHot() {
	hotDrawerApi.setData({});
	hotDrawerApi.open();
}

function handleEditHot(row: HotTopic) {
	hotDrawerApi.setData({ id: row.id });
	hotDrawerApi.open();
}

async function handleDeleteHot(row: HotTopic) {
	Popconfirm.confirm({
		title: '提示',
		okType: 'danger',
		content: `确认删除热点"${row.title}"吗？`,
		onOk: () => {
			deleteHotTopic(row.id);
			message.success('删除成功');
			loadData();
		},
	});
}

function handleMultiDeleteHot() {
	const rows = hotTableApi?.grid?.getCheckboxRecords() || [];
	if (rows.length === 0) {
		message.warning('请选择要删除的记录');
		return;
	}
	Popconfirm.confirm({
		title: '提示',
		okType: 'danger',
		content: `确认删除选中的 ${rows.length} 条记录吗？`,
		onOk: () => {
			rows.forEach((row: HotTopic) => {
				deleteHotTopic(row.id);
			});
			message.success('删除成功');
			loadData();
		},
	});
}

function handleToggleHotStatus(row: HotTopic) {
	toggleHotTopicStatus(row.id);
	loadData();
	message.success(`已${row.status === '1' ? '禁用' : '启用'}`);
}

onMounted(() => {
	loadData();
});
</script>

<template>
	<Page :auto-content-height="true">
		<HotTable table-title="热点">
			<template #toolbar-tools>
				<Space>
					<a-button
						danger
						type="primary"
						@click="handleMultiDeleteHot"
					>
						批量删除
					</a-button>
					<a-button type="primary" @click="handleAddHot">
						新增热点
					</a-button>
				</Space>
			</template>
			<template #hot_status="{ row }">
				<Tag :color="row.status === '1' ? 'green' : 'default'">
					{{ row.status === '1' ? '启用' : '禁用' }}
				</Tag>
			</template>
			<template #hot_action="{ row }">
				<Space>
					<Switch
						:checked="row.status === '1'"
						checked-children="启用"
						un-checked-children="禁用"
						size="small"
						@change="handleToggleHotStatus(row)"
					/>
					<a-button
						type="link"
						size="small"
						@click="handleEditHot(row)"
					>
						编辑
					</a-button>
					<Popconfirm
						:get-popup-container="getVxePopupContainer"
						placement="left"
						title="确认删除？"
						@confirm="handleDeleteHot(row)"
					>
						<a-button type="link" size="small" danger>
							删除
						</a-button>
					</Popconfirm>
				</Space>
			</template>
		</HotTable>

		<!-- 抽屉组件 -->
		<HotDrawerComp @reload="loadData" />
	</Page>
</template>
