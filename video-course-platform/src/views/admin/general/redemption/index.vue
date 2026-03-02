<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import {
  getAllRedemptionCodes,
  generateRedemptionCodes,
  deleteRedemptionCode,
  getAllOrganizations,
} from '@/utils/general-education-storage';
import { getPublishedCourses } from '@/utils/portal-course-adapter';
import { getAllPackages } from '@/utils/course-package-storage';
import type { RedemptionCode } from '@/types/general-education';

const loading = ref(false);
const codes = ref<RedemptionCode[]>([]);
const selectedStatus = ref('');
const searchKeyword = ref('');

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
});

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

  .field-tip {
    margin-top: $spacing-small;
    font-size: $font-size-small;
    color: $text-color-secondary;
  }
}
</style>
