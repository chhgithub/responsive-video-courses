<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { Banner } from '../types';

import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';

import { Image, message, Popconfirm, Space, Switch, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import {
	deleteBanner,
	getBanners,
	toggleStatus,
} from '#/utils/banner-storage';

import type { BannerFormState } from '../types';
import BannerDrawer from './components/banner-drawer.vue';

// Banner 列表数据
const banners = ref<Banner[]>([]);

// 表格列配置
const columns = [
	{ type: 'checkbox', width: 50 },
	{
		field: 'orderNum',
		title: '排序',
		width: 80,
		slots: { default: 'orderNum' },
		sortable: true,
	},
	{
		field: 'imageUrl',
		title: '图片',
		width: 120,
		slots: { default: 'image' },
	},
	{ field: 'title', title: '标题', minWidth: 200 },
	{
		field: 'status',
		title: '状态',
		width: 100,
		slots: { default: 'status' },
	},
	{ field: 'createTime', title: '创建时间', width: 170 },
	{
		field: 'action',
		title: '操作',
		width: 180,
		fixed: 'right',
		slots: { default: 'action' },
	},
];

// 表格配置
const gridOptions = ref<VxeGridProps>({
	checkboxConfig: {
		highlight: true,
		reserve: true,
	},
	columns,
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
	id: 'banner-index',
});

const [BasicTable, tableApi] = useVbenVxeGrid({
	gridOptions: gridOptions.value,
});

// 抽屉组件
const [BannerDrawerComp, drawerApi] = useVbenDrawer({
	connectedComponent: BannerDrawer,
});

// 加载数据
function loadBanners() {
	banners.value = getBanners();
	// 重新加载表格数据
	tableApi?.grid?.reloadData(banners.value);
}

function handleAdd() {
	drawerApi.setData({});
	drawerApi.open();
}

function handleEdit(row: Banner) {
	drawerApi.setData({ id: row.id });
	drawerApi.open();
}

async function handleDelete(row: Banner) {
	Popconfirm.confirm({
		title: '提示',
		okType: 'danger',
		content: `确认删除 Banner "${row.title}" 吗？`,
		onOk: () => {
			deleteBanner(row.id);
			message.success('删除成功');
			loadBanners();
		},
	});
}

function handleMultiDelete() {
	const rows = tableApi?.grid?.getCheckboxRecords() || [];
	if (rows.length === 0) {
		message.warning('请选择要删除的记录');
		return;
	}
	Popconfirm.confirm({
		title: '提示',
		okType: 'danger',
		content: `确认删除选中的 ${rows.length} 条记录吗？`,
		onOk: () => {
			rows.forEach((row: Banner) => {
				deleteBanner(row.id);
			});
			message.success('删除成功');
			loadBanners();
		},
	});
}

function handleToggleStatus(row: Banner) {
	toggleStatus(row.id);
	loadBanners();
	message.success(`已${row.status === '1' ? '禁用' : '启用'}`);
}

// 暴露刷新方法给子组件调用
defineExpose({
	reload: loadBanners,
});

onMounted(() => {
	loadBanners();
});
</script>

<template>
	<Page :auto-content-height="true">
		<BasicTable table-title="Banner 配置">
			<template #toolbar-tools>
				<Space>
					<a-button danger type="primary" @click="handleMultiDelete">
						批量删除
					</a-button>
					<a-button type="primary" @click="handleAdd"> 新增 Banner </a-button>
				</Space>
			</template>
			<template #image="{ row }">
				<Image
					:src="row.imageUrl"
					:width="100"
					:height="60"
					fit="cover"
					class="rounded"
				/>
			</template>
			<template #status="{ row }">
				<Tag :color="row.status === '1' ? 'green' : 'default'">
					{{ row.status === '1' ? '启用' : '禁用' }}
				</Tag>
			</template>
			<template #action="{ row }">
				<Space>
					<Switch
						:checked="row.status === '1'"
						checked-children="启用"
						un-checked-children="禁用"
						size="small"
						@change="handleToggleStatus(row)"
					/>
					<a-button type="link" size="small" @click="handleEdit(row)">
						编辑
					</a-button>
					<Popconfirm
						:get-popup-container="getVxePopupContainer"
						placement="left"
						title="确认删除？"
						@confirm="handleDelete(row)"
					>
						<a-button type="link" size="small" danger> 删除 </a-button>
					</Popconfirm>
				</Space>
			</template>
		</BasicTable>
		<BannerDrawerComp @reload="loadBanners" />
	</Page>
</template>
