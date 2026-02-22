<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { News } from '#/utils/news-storage';

import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';

import { message, Popconfirm, Space, Switch, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import {
	getNews,
	deleteNews,
	toggleNewsStatus,
} from '#/utils/news-storage';

import NewsDrawer from './components/news-drawer.vue';

defineOptions({ name: 'HomeNews' });

// 数据列表
const newsList = ref<News[]>([]);

// ========== 表格配置 ==========
const newsColumns = [
	{ type: 'checkbox', width: 50 },
	{ type: 'seq', width: 70, title: '序号' },
	{ field: 'title', title: '标题', minWidth: 200 },
	{ field: 'publishTime', title: '发布时间', width: 120 },
	{
		field: 'status',
		title: '状态',
		width: 100,
		slots: { default: 'news_status' },
	},
	{ field: 'orderNum', title: '排序', width: 80 },
	{
		field: 'action',
		title: '操作',
		width: 180,
		fixed: 'right',
		slots: { default: 'news_action' },
	},
];

const newsGridOptions = ref<VxeGridProps>({
	checkboxConfig: {
		highlight: true,
		reserve: true,
	},
	columns: newsColumns,
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
	id: 'news-index',
});

const [NewsTable, newsTableApi] = useVbenVxeGrid({
	gridOptions: newsGridOptions,
});

// ========== 抽屉组件 ==========
const [NewsDrawerComp, newsDrawerApi] = useVbenDrawer({
	connectedComponent: NewsDrawer,
});

// ========== 数据加载 ==========
function loadData() {
	newsList.value = getNews();
	// 重新加载表格数据
	newsTableApi?.grid?.reloadData(newsList.value);
}

// ========== 资讯公告操作 ==========
function handleAddNews() {
	newsDrawerApi.setData({});
	newsDrawerApi.open();
}

function handleEditNews(row: News) {
	newsDrawerApi.setData({ id: row.id });
	newsDrawerApi.open();
}

async function handleDeleteNews(row: News) {
	Popconfirm.confirm({
		title: '提示',
		okType: 'danger',
		content: `确认删除资讯"${row.title}"吗？`,
		onOk: () => {
			deleteNews(row.id);
			message.success('删除成功');
			loadData();
		},
	});
}

function handleMultiDeleteNews() {
	const rows = newsTableApi?.grid?.getCheckboxRecords() || [];
	if (rows.length === 0) {
		message.warning('请选择要删除的记录');
		return;
	}
	Popconfirm.confirm({
		title: '提示',
		okType: 'danger',
		content: `确认删除选中的 ${rows.length} 条记录吗？`,
		onOk: () => {
			rows.forEach((row: News) => {
				deleteNews(row.id);
			});
			message.success('删除成功');
			loadData();
		},
	});
}

function handleToggleNewsStatus(row: News) {
	toggleNewsStatus(row.id);
	loadData();
	message.success(`已${row.status === '1' ? '禁用' : '启用'}`);
}

onMounted(() => {
	loadData();
});
</script>

<template>
	<Page :auto-content-height="true">
		<NewsTable table-title="资讯公告">
			<template #toolbar-tools>
				<Space>
					<a-button
						danger
						type="primary"
						@click="handleMultiDeleteNews"
					>
						批量删除
					</a-button>
					<a-button type="primary" @click="handleAddNews">
						新增资讯
					</a-button>
				</Space>
			</template>
			<template #news_status="{ row }">
				<Tag :color="row.status === '1' ? 'green' : 'default'">
					{{ row.status === '1' ? '启用' : '禁用' }}
				</Tag>
			</template>
			<template #news_action="{ row }">
				<Space>
					<Switch
						:checked="row.status === '1'"
						checked-children="启用"
						un-checked-children="禁用"
						size="small"
						@change="handleToggleNewsStatus(row)"
					/>
					<a-button
						type="link"
						size="small"
						@click="handleEditNews(row)"
					>
						编辑
					</a-button>
					<Popconfirm
						:get-popup-container="getVxePopupContainer"
						placement="left"
						title="确认删除？"
						@confirm="handleDeleteNews(row)"
					>
						<a-button type="link" size="small" danger>
							删除
						</a-button>
					</Popconfirm>
				</Space>
			</template>
		</NewsTable>

		<!-- 抽屉组件 -->
		<NewsDrawerComp @reload="loadData" />
	</Page>
</template>
