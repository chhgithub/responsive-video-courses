<template>
  <el-dialog
    v-model="visible"
    title="精选课程设置"
    width="750px"
    :before-close="handleClose"
  >
    <div class="featured-modal-content">
      <!-- 1. 课程基础信息 -->
      <div class="section">
        <h4>课程基础信息</h4>
        <el-card shadow="never" class="info-card">
          <div class="info-details">
            <h3>{{ courseData.courseName }}</h3>
            <div class="info-meta">
              <p><span class="label">分类：</span>{{ courseData.categoryName }}</p>
              <p><span class="label">讲师：</span>{{ courseData.teacherNames?.join(', ') }}</p>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 2. 关键指标统计 -->
      <div class="section">
        <h4>关键指标统计</h4>
        <div class="stats-list">
          <div class="stat-item">
            <div class="stat-value large">{{ courseData.enrollCount }}</div>
            <div class="stat-label">报名人数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ courseData.rating || 0 }}</div>
            <div class="stat-label">评分</div>
            <!-- <el-rate
              v-model="courseData.rating"
              disabled
              text-color="#ff9900"
              size="small"
            /> -->
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ calculateCompletionRate().toFixed(2) }}%</div>
            <div class="stat-label">完课率</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ courseData.reviewCount || 0 }}</div>
            <div class="stat-label">评价数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ calculateGrowthRate() }}%</div>
            <div class="stat-label">月增长率</div>
          </div>
        </div>
      </div>

      <!-- 3. 精选设置 -->
      <div class="section">
        <h4>精选设置</h4>
        <div class="settings">
          <!-- 精选开关 -->
          <div class="setting-item">
            <el-switch
              v-model="formData.isFeatured"
              active-text="设为精选课程"
            />
            <div class="setting-tip">
              精选课程将在首页优先展示
            </div>
          </div>

          <!-- 排序设置 -->
          <div v-if="formData.isFeatured" class="setting-item">
            <label>排序数值：</label>
            <el-input-number
              v-model="formData.featuredOrder"
              :min="0"
              size="default"
              placeholder="请输入排序值"
            />
            <div class="setting-tip">
              数值越大，排序越靠前（无上限）
            </div>
          </div>

          <!-- 精选理由 -->
          <div v-if="formData.isFeatured" class="setting-item">
            <label>精选理由：</label>
            <el-input
              v-model="formData.featuredReason"
              type="textarea"
              :rows="3"
              placeholder="请说明该课程为何适合精选..."
              maxlength="200"
              show-word-limit
            />
          </div>

          <!-- 达标评估 -->
          <!-- <div v-if="formData.isFeatured" class="setting-item">
            <label>达标评估：</label>
            <div class="assessment">
              <el-alert
                :title="getAssessmentTitle()"
                :type="getAssessmentType()"
                :closable="false"
                show-icon
              />
              <div class="assessment-details">
                <p>评分标准：</p>
                <ul>
                  <li>报名人数（权重30%）</li>
                  <li>用户评分（权重25%）</li>
                  <li>完课率（权重25%）</li>
                  <li>活跃度（权重20%）</li>
                </ul>
              </div>
            </div>
          </div> -->
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :disabled="!formData.isFeatured"
        @click="handleSave"
      >
        保存设置
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  course: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update', 'close']);

const visible = ref(true);
const formData = reactive({
  isFeatured: props.course.isFeatured,
  featuredOrder: props.course.featuredOrder || 0,
  featuredReason: props.course.featuredReason || ''
});

// 复制课程数据
const courseData = reactive({ ...props.course });

// 计算相关指标
const calculateCompletionRate = () => {
  // 模拟计算，实际从后端获取
  const base = courseData.enrollCount > 50 ? 65 : 60;
  return Math.min(95, base + Math.random() * 10);
};

const calculateGrowthRate = () => {
  return Math.round((Math.random() * 40) - 10);
};

const handleSave = () => {
  const updatedData = {
    ...courseData,
    isFeatured: formData.isFeatured,
    featuredOrder: formData.featuredOrder,
    featuredReason: formData.featuredReason
  };

  emit('update', updatedData);
  visible.value = false;
};

const handleClose = () => {
  emit('close');
};
</script>

<style scoped lang="scss">
.featured-modal-content {
  padding: 20px 0;
}

.section {
  margin-bottom: 30px;

  h4 {
    margin: 0 0 15px 0;
    font-size: 16px;
    color: #303133;
  }
}

.info-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.info-details {
  padding: 15px;

  h3 {
    margin: 0 0 15px 0;
    font-size: 18px;
    color: #303133;
    font-weight: 600;
  }

  .info-meta {
    margin: 0;

    p {
      margin: 8px 0;
      font-size: 14px;
      display: flex;
      align-items: center;

      &:first-child {
        margin-top: 0;
      }
    }
  }
}

.label {
  color: #909399;
  margin-right: 5px;
}

.free-price {
  color: #67c23a;
  font-weight: bold;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.stats-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-item {
  flex: 1;
  min-width: 150px;
  text-align: center;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:not(:last-child) {
    margin-right: 10px;
  }
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-value.large {
  font-size: 32px;
  color: #409eff;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.stat-trend {
  font-size: 12px;
}

.trend-up {
  color: #67c23a;
}

.trend-down {
  color: #f56c6c;
}

.stat-rate {
  font-size: 12px;
  color: #909399;
}

.settings {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.setting-item {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.setting-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.assessment {
  margin-top: 10px;
}

.assessment-details {
  margin-top: 10px;
  font-size: 12px;
  color: #606266;

  p {
    margin: 0 0 5px 0;
  }

  ul {
    margin: 0;
    padding-left: 20px;
  }
}
</style>
