<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getAllRedemptionCodes,
  generateRedemptionCodes,
  deleteRedemptionCode,
  batchUpdateCodesStatus,
  getAllOrganizations,
} from '@/utils/general-education-storage';
import { getPublishedCourses } from '@/utils/portal-course-adapter';
import { getAllPackages } from '@/utils/course-package-storage';
import type { RedemptionCode } from '@/types/general-education';

const loading = ref(false);
const codes = ref<RedemptionCode[]>([]);
const selectedStatus = ref('');
const searchKeyword = ref('');

// 批量选择
const selectedCodeIds = ref<string[]>([]);
const selectAll = ref(false);

// 生成对话框
const generateDialogVisible = ref(false);
const generateForm = ref({
  organizationId: '',
  targetType: 'course' as 'course' | 'package',
  targetIds: [] as string[],
  targetName: '',
  count: 1,
  codeExpireDays: 30,
  codeNeverExpire: false,
  accessValidDays: 30,
  accessNeverExpire: false,
  note: '',
});

// 课程列表和套餐列表
const courseList = ref<any[]>([]);
const packageList = ref<any[]>([]);

// 状态映射
const statusMap: Record<string, { text: string; type: any }> = {
  unused: { text: '未使用', type: 'success' },
  used: { text: '已使用', type: 'info' },
  expired: { text: '已失效', type: 'danger' },
  offline: { text: '已下架', type: 'warning' },
};

// 状态选项
const statusOptions = [
  { label: '全部', value: '' },
  { label: '未使用', value: 'unused' },
  { label: '已使用', value: 'used' },
  { label: '已失效', value: 'expired' },
  { label: '已下架', value: 'offline' },
];

// 加载兑换码列表
async function loadCodes() {
  loading.value = true;
  try {
    codes.value = getAllRedemptionCodes();
  } catch (error) {
    ElMessage.error('加载失败');
  } finally {
    loading.value = false;
  }
}

// 过滤的兑换码
const filteredCodes = computed(() => {
  let result = codes.value;

  if (selectedStatus.value) {
    result = result.filter(c => c.status === selectedStatus.value);
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(c =>
      c.code.toLowerCase().includes(keyword) ||
      c.targetName.toLowerCase().includes(keyword) ||
      c.organizationName.toLowerCase().includes(keyword)
    );
  }

  return result;
});

// 根据类型显示的选项列表
const targetOptions = computed(() => {
  return generateForm.value.targetType === 'course'
    ? courseList.value.map((c: any) => ({ id: c.id, name: c.title }))
    : packageList.value.map((p: any) => ({ id: p.packageId.toString(), name: p.packageName }));
});

// 动态获取兑换码的目标名称
function getTargetName(code: RedemptionCode): string {
  // 如果有 targetName（旧数据），直接返回
  if (code.targetName) {
    return code.targetName;
  }

  // 否则动态获取
  if (code.targetType === 'course') {
    if (code.targetIds.length === 1) {
      const course = courseList.value.find((c: any) => c.id === code.targetIds[0]);
      return course?.title || '未知课程';
    }
    return `${code.targetIds.length}个课程`;
  } else {
    if (code.targetIds.length === 1) {
      const pkg = packageList.value.find((p: any) => p.packageId.toString() === code.targetIds[0]);
      return pkg?.packageName || '未知套餐';
    }
    return `${code.targetIds.length}个套餐`;
  }
}

// 监听选择变化，自动填充兑换内容
watch(() => [generateForm.value.targetType, generateForm.value.targetIds], () => {
  if (generateForm.value.targetIds.length === 0) {
    generateForm.value.targetName = '';
    return;
  }
});

// 监听批量选择变化，更新全选状态
watch(selectedCodeIds, (newIds) => {
  selectAll.value = newIds.length === filteredCodes.value.filter(c => c.status === 'unused').length;
});

// 全选/取消全选
function handleSelectAll(checked: boolean) {
  if (checked) {
    const unusedCodes = filteredCodes.value.filter(c => c.status === 'unused');
    selectedCodeIds.value = unusedCodes.map(c => c.id);
  } else {
    selectedCodeIds.value = [];
  }
}

// 处理单个选择
function handleSelectionChange(selection: RedemptionCode[]) {
  selectedCodeIds.value = selection.map(c => c.id);
}

// 批量下架
async function handleBatchOffline() {
  if (selectedCodeIds.value.length === 0) {
    ElMessage.warning('请选择要下架的兑换码');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要将选中的 ${selectedCodeIds.value.length} 个兑换码下架吗？`,
      '批量下架',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    batchUpdateCodesStatus(selectedCodeIds.value, 'offline');
    ElMessage.success('批量下架成功');
    selectedCodeIds.value = [];
    selectAll.value = false;
    await loadCodes();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('下架失败');
    }
  }
}

// 重新上架（单个）
async function handleRelist(code: RedemptionCode) {
  try {
    await ElMessageBox.confirm(
      '确定要重新上架此兑换码吗？',
      '确认上架',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }
    );

    batchUpdateCodesStatus([code.id], 'unused');
    ElMessage.success('上架成功');
    await loadCodes();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('上架失败');
    }
  }
  if (generateForm.value.targetType === 'course') {
    if (generateForm.value.targetIds.length === 1) {
      const course = courseList.value.find((c: any) => c.id === generateForm.value.targetIds[0]);
      generateForm.value.targetName = course?.title || '';
    } else {
      generateForm.value.targetName = `${generateForm.value.targetIds.length}个课程`;
    }
  } else {
    if (generateForm.value.targetIds.length === 1) {
      const pkg = packageList.value.find((p: any) => p.packageId.toString() === generateForm.value.targetIds[0]);
      generateForm.value.targetName = pkg?.packageName || '';
    } else {
      generateForm.value.targetName = `${generateForm.value.targetIds.length}个套餐`;
    }
  }
}

// 打开生成对话框
function openGenerateDialog() {
  generateForm.value = {
    organizationId: '',
    targetType: 'course',
    targetIds: [],
    targetName: '',
    count: 1,
    codeExpireDays: 30,
    codeNeverExpire: false,
    accessValidDays: 30,
    accessNeverExpire: false,
    note: '',
  };
  generateDialogVisible.value = true;
}

// 初始化数据
function initData() {
  courseList.value = getPublishedCourses();
  packageList.value = getAllPackages();
}

// 生成兑换码
async function handleGenerate() {
  if (!generateForm.value.organizationId) {
    ElMessage.warning('请选择单位');
    return;
  }
  if (generateForm.value.targetIds.length === 0) {
    ElMessage.warning('请选择课程或套餐');
    return;
  }
  if (!generateForm.value.targetName) {
    ElMessage.warning('请输入兑换内容');
    return;
  }

  try {
    const org = getAllOrganizations().find(o => o.id === generateForm.value.organizationId);
    if (!org) {
      ElMessage.error('单位不存在');
      return;
    }

    const generatedCodes = generateRedemptionCodes({
      organizationId: org.id,
      organizationName: org.name,
      targetType: generateForm.value.targetType,
      targetIds: generateForm.value.targetIds,
      targetName: generateForm.value.targetName,
      codeExpireDays: generateForm.value.codeNeverExpire ? undefined : generateForm.value.codeExpireDays,
      accessValidDays: generateForm.value.accessNeverExpire ? undefined : generateForm.value.accessValidDays,
      count: generateForm.value.count,
      note: generateForm.value.note,
    });

    ElMessage.success(`成功生成 ${generatedCodes.length} 个兑换码`);
    generateDialogVisible.value = false;
    await loadCodes();
  } catch (error: any) {
    ElMessage.error(error.message || '生成失败');
  }
}

// 下架兑换码
async function handleDelete(code: RedemptionCode) {
  if (code.status === 'used') {
    ElMessage.warning('已使用的兑换码不能删除或下架');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要下架此兑换码吗？`,
      '确认下架',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    batchUpdateCodesStatus([code.id], 'offline');
    ElMessage.success('下架成功');
    await loadCodes();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('下架失败');
    }
  }
}

// 格式化时间
function formatTime(time?: string) {
  if (!time) return '-';
  return new Date(time).toLocaleString('zh-CN');
}

// 格式化过期时间
function formatExpireTime(expireTime?: string) {
  if (!expireTime) return '永不过期';

  const now = new Date();
  const expire = new Date(expireTime);
  const diffDays = Math.ceil((expire.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays <= 0) return '已过期';
  if (diffDays === 1) return '1天后过期';
  if (diffDays < 30) return `${diffDays}天后过期`;
  return `${Math.ceil(diffDays / 30)}个月后过期`;
}

// 复制兑换码
function copyCode(code: string) {
  navigator.clipboard.writeText(code);
  ElMessage.success('兑换码已复制');
}

onMounted(() => {
  initData();
  loadCodes();
});
</script>

<template>
  <div class="redemption-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>兑换码管理</h2>
      <el-button type="primary" @click="openGenerateDialog">
        <el-icon><Plus /></el-icon>
        生成兑换码
      </el-button>
    </div>

    <!-- 筛选栏 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true">
        <el-form-item label="状态">
          <el-select v-model="selectedStatus" placeholder="全部" clearable style="width: 120px">
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="关键词">
          <el-input
            v-model="searchKeyword"
            placeholder="兑换码/课程名/单位"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="loadCodes">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 批量操作栏（只对未使用的兑换码显示） -->
    <div v-if="filteredCodes.some(c => c.status === 'unused')" class="batch-actions-bar">
      <el-checkbox v-model="selectAll" @change="handleSelectAll">
        全选
      </el-checkbox>
      <el-button
        :disabled="selectedCodeIds.length === 0"
        type="warning"
        @click="handleBatchOffline"
      >
        <el-icon><CircleClose /></el-icon>
        批量下架（{{ selectedCodeIds.length }}）
      </el-button>
    </div>

    <!-- 兑换码列表 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="filteredCodes"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="兑换码" width="180">
          <template #default="{ row }">
            <el-tag style="font-family: monospace;">{{ row.code }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="targetType" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.targetType === 'package' ? 'warning' : 'primary'" size="small">
              {{ row.targetType === 'package' ? '套餐' : '课程' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="兑换内容" min-width="200">
          <template #default="{ row }">
            {{ getTargetName(row) }}
          </template>
        </el-table-column>

        <el-table-column prop="organizationName" label="单位" width="150" />

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status].type">
              {{ statusMap[row.status].text }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="有效期" width="120">
          <template #default="{ row }">
            {{ formatExpireTime(row.codeExpireTime) }}
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column label="使用时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.usedTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'unused'"
              link
              type="primary"
              size="small"
              @click="copyCode(row.code)"
            >
              复制
            </el-button>
            <el-button
              v-if="row.status === 'unused'"
              link
              type="warning"
              size="small"
              @click="handleDelete(row)"
            >
              下架
            </el-button>
            <el-button
              v-if="row.status === 'offline'"
              link
              type="success"
              size="small"
              @click="handleRelist(row)"
            >
              重新上架
            </el-button>
            <el-button
              v-else
              link
              size="small"
              disabled
            >
              --
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && filteredCodes.length === 0" description="暂无兑换码">
        <el-button type="primary" @click="openGenerateDialog">生成兑换码</el-button>
      </el-empty>
    </el-card>

    <!-- 生成对话框 -->
    <el-dialog v-model="generateDialogVisible" title="生成兑换码" width="600px">
      <el-form :model="generateForm" label-width="140px">
        <el-form-item label="选择单位" required>
          <el-select v-model="generateForm.organizationId" placeholder="请选择单位" style="width: 100%">
            <el-option
              v-for="org in getAllOrganizations()"
              :key="org.id"
              :label="org.name"
              :value="org.id"
            />
          </el-select>
          <div class="field-tip" v-if="getAllOrganizations().length === 0">
            请先在"单位管理"中添加单位
          </div>
        </el-form-item>

        <el-form-item label="类型" required>
          <el-radio-group v-model="generateForm.targetType">
            <el-radio value="course">课程</el-radio>
            <el-radio value="package">课程套餐</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="generateForm.targetType === 'course' ? '选择课程' : '选择套餐'" required>
          <el-select
            v-model="generateForm.targetIds"
            multiple
            filterable
            placeholder="可选择多个"
            style="width: 100%"
            @change="() => {}"
          >
            <el-option
              v-for="item in targetOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
          <div class="field-tip">选择后自动填充兑换内容</div>
        </el-form-item>

        <el-form-item label="兑换内容" required>
          <el-input
            v-model="generateForm.targetName"
            placeholder="自动填充，可修改"
            style="width: 100%"
          />
          <div class="field-tip">如："Vue3入门"、"2个课程"、"全栈开发套餐"</div>
        </el-form-item>

        <el-form-item label="生成数量" required>
          <el-input-number v-model="generateForm.count" :min="1" :max="100" />
        </el-form-item>

        <el-form-item label="兑换码有效期">
          <el-checkbox v-model="generateForm.codeNeverExpire">永不过期</el-checkbox>
          <el-input-number
            v-if="!generateForm.codeNeverExpire"
            v-model="generateForm.codeExpireDays"
            :min="1"
            :max="3650"
          />
          <div class="field-tip" v-if="!generateForm.codeNeverExpire">天</div>
        </el-form-item>

        <el-form-item label="兑换后有效期">
          <el-checkbox v-model="generateForm.accessNeverExpire">永不过期</el-checkbox>
          <el-input-number
            v-if="!generateForm.accessNeverExpire"
            v-model="generateForm.accessValidDays"
            :min="1"
            :max="3650"
          />
          <div class="field-tip" v-if="!generateForm.accessNeverExpire">天</div>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="generateForm.note" type="textarea" :rows="2" placeholder="可选" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleGenerate" style="width: 100%">
            生成兑换码
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.redemption-page {
  padding: $spacing-large;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-large;

    h2 {
      font-size: 24px;
      color: $text-color-primary;
      margin: 0;
    }
  }

  .filter-card {
    margin-bottom: $spacing-large;
  }

  .batch-actions-bar {
    margin-bottom: $spacing-base;
    padding: $spacing-base;
    background: #fff7e6;
    border-radius: $border-radius-base;
    display: flex;
    align-items: center;
    gap: $spacing-base;
  }

  .field-tip {
    margin-top: $spacing-small;
    font-size: $font-size-small;
    color: $text-color-secondary;
  }
}
</style>
