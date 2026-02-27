<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getReviewsByCourseId, deleteReview, replyReview, type CourseReview } from '@/utils/course-storage';

interface Props {
  courseId: number;
  courseName: string;
  visible: boolean;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

const loading = ref(false);
const reviews = ref<CourseReview[]>([]);

// 统计信息
const statistics = computed(() => {
  if (reviews.value.length === 0) {
    return { average: 0, count: 0, rating5: 0, rating4: 0, rating3: 0, rating2: 0, rating1: 0 };
  }
  const total = reviews.value.reduce((sum, r) => sum + r.rating, 0);
  const average = (total / reviews.value.length).toFixed(1);
  const ratingCounts = {
    rating5: reviews.value.filter((r) => r.rating === 5).length,
    rating4: reviews.value.filter((r) => r.rating === 4).length,
    rating3: reviews.value.filter((r) => r.rating === 3).length,
    rating2: reviews.value.filter((r) => r.rating === 2).length,
    rating1: reviews.value.filter((r) => r.rating === 1).length,
  };
  return { average, count: reviews.value.length, ...ratingCounts };
});

// 加载评价数据
async function loadReviews() {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));
    reviews.value = getReviewsByCourseId(props.courseId);
  } finally {
    loading.value = false;
  }
}

// 删除评价
function handleDeleteReview(review: CourseReview) {
  ElMessageBox.confirm('确认删除该评价吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      deleteReview(review.reviewId);
      ElMessage.success('删除成功');
      loadReviews();
    })
    .catch(() => {});
}

// 回复评价
function handleReplyReview(review: CourseReview) {
  ElMessageBox.prompt('请输入回复内容', '回复评价', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '回复内容不能为空',
  })
    .then(({ value }) => {
      replyReview(review.reviewId, value);
      ElMessage.success('回复成功');
      loadReviews();
    })
    .catch(() => {});
}

// 评分显示
function renderRating(rating: number) {
  return '⭐'.repeat(rating);
}

onMounted(() => {
  if (props.visible) {
    loadReviews();
  }
});

watch(
  () => props.visible,
  (val) => {
    if (val) {
      loadReviews();
    }
  }
);
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="课程评价"
    width="800px"
  >
    <div class="review-list">
      <!-- 统计概览 -->
      <div class="statistics-card">
        <div class="average-rating">
          <div class="rating-number">{{ statistics.average }}</div>
          <div class="rating-stars">
            {{ renderRating(Math.round(statistics.average)) }}
          </div>
          <div class="rating-count">{{ statistics.count }} 条评价</div>
        </div>
        <div class="rating-distribution">
          <div v-for="i in 5" :key="i" class="rating-bar">
            <span class="rating-label">{{ 6 - i }} 星</span>
            <el-progress
              :percentage="statistics.count > 0 ? (statistics[`rating${6 - i}`] / statistics.count) * 100 : 0"
              :show-text="false"
              :stroke-width="8"
            />
            <span class="rating-count">{{ statistics[`rating${6 - i}`] }}</span>
          </div>
        </div>
      </div>

      <!-- 评价列表 -->
      <div v-loading="loading" class="review-items">
        <div v-for="review in reviews" :key="review.reviewId" class="review-item">
          <div class="review-header">
            <el-avatar :src="review.userAvatar" :size="40" />
            <div class="user-info">
              <div class="user-name">{{ review.userName }}</div>
              <div class="review-rating">{{ renderRating(review.rating) }}</div>
            </div>
            <div class="review-date">{{ review.reviewTime }}</div>
          </div>

          <div class="review-content">
            {{ review.content }}
          </div>

          <!-- 回复内容 -->
          <div v-if="review.replyContent" class="review-reply">
            <div class="reply-header">
              <el-icon><ChatDotRound /></el-icon>
              <span>讲师回复 - {{ review.replyTime }}</span>
            </div>
            <div class="reply-content">{{ review.replyContent }}</div>
          </div>

          <!-- 操作按钮 -->
          <div class="review-actions">
            <span class="like-count">
              <el-icon><Thumb /></el-icon>
              {{ review.likes }}
            </span>
            <div class="action-buttons">
              <el-button
                v-if="!review.replyContent"
                link
                type="primary"
                size="small"
                @click="handleReplyReview(review)"
              >
                回复
              </el-button>
              <el-button
                link
                type="danger"
                size="small"
                @click="handleDeleteReview(review)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="reviews.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无评价数据" />
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.review-list {
  .statistics-card {
    display: flex;
    gap: $spacing-extra-large;
    padding: $spacing-large;
    background: $background-color-base;
    border-radius: $border-radius-base;
    margin-bottom: $spacing-large;
  }

  .average-rating {
    text-align: center;
    min-width: 150px;

    .rating-number {
      font-size: 48px;
      font-weight: bold;
      color: $text-color-primary;
      line-height: 1;
    }

    .rating-stars {
      font-size: $font-size-large;
      margin: $spacing-small 0;
    }

    .rating-count {
      font-size: $font-size-small;
      color: $text-color-secondary;
    }
  }

  .rating-distribution {
    flex: 1;

    .rating-bar {
      display: flex;
      align-items: center;
      gap: $spacing-base;
      margin-bottom: $spacing-small;

      &:last-child {
        margin-bottom: 0;
      }

      .rating-label {
        min-width: 40px;
        font-size: $font-size-small;
        color: $text-color-secondary;
      }

      .el-progress {
        flex: 1;
      }

      .rating-count {
        min-width: 30px;
        text-align: right;
        font-size: $font-size-small;
        color: $text-color-secondary;
      }
    }
  }

  .review-items {
    max-height: 500px;
    overflow-y: auto;
  }

  .review-item {
    padding: $spacing-large;
    background: #fff;
    border: 1px solid $border-color-lighter;
    border-radius: $border-radius-base;
    margin-bottom: $spacing-base;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .review-header {
    display: flex;
    align-items: center;
    gap: $spacing-base;
    margin-bottom: $spacing-base;

    .user-info {
      flex: 1;

      .user-name {
        font-size: $font-size-medium;
        font-weight: 500;
        color: $text-color-primary;
      }

      .review-rating {
        font-size: $font-size-small;
        margin-top: 4px;
      }
    }

    .review-date {
      font-size: $font-size-small;
      color: $text-color-secondary;
    }
  }

  .review-content {
    font-size: $font-size-base;
    color: $text-color-primary;
    line-height: 1.6;
    margin-bottom: $spacing-base;
  }

  .review-reply {
    padding: $spacing-base;
    background: $background-color-base;
    border-radius: $border-radius-small;
    margin-bottom: $spacing-base;

    .reply-header {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: $font-size-small;
      color: $text-color-secondary;
      margin-bottom: $spacing-small;
    }

    .reply-content {
      font-size: $font-size-base;
      color: $text-color-primary;
      line-height: 1.6;
    }
  }

  .review-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .like-count {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: $font-size-small;
      color: $text-color-secondary;
    }

    .action-buttons {
      display: flex;
      gap: $spacing-small;
    }
  }

  .empty-state {
    padding: $spacing-extra-extra-large 0;
  }
}
</style>
