<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import {
  getAllRedemptionCodes,
  generateRedemptionCodes,
  deleteRedemptionCode,
  getAllOrganizations,
} from '@/utils/general-education-storage';
import type { RedemptionCode } from '@/types/general-education';

const loading = ref(false);
const codes = ref<RedemptionCode[]>([]);
const selectedStatus = ref('');
const searchKeyword = ref('');

// 生成对话框
const generateDialogVisible = ref(false);
const generateForm = ref({
  organizationId: '',
  courseId: '',
  courseName: '',
  count: 1,
  expireDays: 30,
  note: '',
});

// 状态映射
const statusMap: Record<string, { text: string; type: any }> = {
  unused: { text: '未使用', type: 'success' },
  used: { text: '已使用', type: 'info' },
  expired: { text: '已失效', type: 'danger' },
};

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
      c.courseName.toLowerCase().includes(keyword) ||
      c.organizationName.toLowerCase().includes(keyword)
    );
  }

  return result;
});

// 打开生成对话框
function openGenerateDialog() {
  generateForm.value = {
    organizationId: '',
    courseId: '',
    courseName: '',
    count: 1,
    expireDays: 30,
    note: '',
  };
  generateDialogVisible.value = true;
}

// 生成兑换码
async function handleGenerate() {
  if (!generateForm.value.organizationId) {
    ElMessage.warning('请选择单位');
    return;
  }
  if (!generateForm.value.courseId) {
    ElMessage.warning('请输入课程ID');
    return;
  }
  if (!generateForm.value.courseName) {
    ElMessage.warning('请输入课程名称');
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
      courseId: generateForm.value.courseId,
      courseName: generateForm.value.courseName,
      count: generateForm.value.count,
      expireDays: generateForm.value.expireDays,
      note: generateForm.value.note,
    });

    ElMessage.success(`成功生成 ${generatedCodes.length} 个兑换码`);
    generateDialogVisible.value = false;
    await loadCodes();
  } catch (error: any) {
    ElMessage.error(error.message || '生成失败');
  }
}

// 删除兑换码
async function handleDelete(code: RedemptionCode) {
  if (code.status === 'used') {
    ElMessage.warning('已使用的兑换码不能删除');
    return;
  }

  try {
    await ElMessageBox.confirm('确认删除此兑换码？', '确认删除', {
      type: 'warning',
    });

    const success = deleteRedemptionCode(code.id);
    if (success) {
      ElMessage.success('删除成功');
      await loadCodes();
    }
  } catch (error) {
    // 用户取消
  }
}

// 格式化时间
function formatTime(time?: string) {
  if (!time) return '-';
  return new Date(time).toLocaleString('zh-CN');
}

// 格式化过期时间
function formatExpireTime(expireTime: string) {
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
            <el-option label="全部" value="" />
            <el-option label="未使用" value="unused" />
            <el-option label="已使用" value="used" />
            <el-option label="已失效" value="expired" />
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

    <!-- 兑换码列表 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="filteredCodes"
        stripe
        style="width: 100%"
      >
        <el-table-column label="兑换码" width="180">
          <template #default="{ row }">
            <el-tag style="font-family: monospace;">{{ row.code }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="courseName" label="课程名称" min-width="200" />

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
            {{ formatExpireTime(row.expireTime) }}
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

        <el-table-column label="操作" width="180" fixed="right">
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
              type="danger"
              size="small"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && filteredCodes.length === 0" description="暂无兑换码">
        <el-button type="primary" @click="openGenerateDialog">生成兑换码</el-button>
      </el-empty>
    </el-card>

    <!-- 生成对话框 -->
    <el-dialog v-model="generateDialogVisible" title="生成兑换码" width="500px">
      <el-form :model="generateForm" label-width="120px">
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

        <el-form-item label="课程ID" required>
          <el-input v-model="generateForm.courseId" placeholder="请输入课程ID（如：1, 2, 3）" />
        </el-form-item>

        <el-form-item label="课程名称" required>
          <el-input v-model="generateForm.courseName" placeholder="请输入课程名称" />
        </el-form-item>

        <el-form-item label="生成数量" required>
          <el-input-number v-model="generateForm.count" :min="1" :max="100" />
        </el-form-item>

        <el-form-item label="有效期" required>
          <el-input-number v-model="generateForm.expireDays" :min="1" :max="365" />
          <div class="field-tip">天</div>
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

  .field-tip {
    margin-top: $spacing-small;
    font-size: $font-size-small;
    color: $text-color-secondary;
  }
}
</style>
