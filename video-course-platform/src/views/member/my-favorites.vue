<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getUserFavorites, removeFavorite, isCourseFavorited } from '@/utils/favorite-storage';
import { getUserOrders } from '@/utils/order-storage';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);

// 收藏列表
interface FavoriteItem {
  courseId: string;
  courseName: string;
  courseCover: string;
  teacherName: string;
  price: number;
  isFree: boolean;
  favoriteTime: string;
  studentCount?: number;
  rating?: number;
  originalPrice?: number;
}

const favorites = ref<FavoriteItem[]>([]);

// 计算统计数据
const stats = computed(() => {
  const freeCount = favorites.value.filter((f) => f.isFree).length;
  const paidCount = favorites.value.filter((f) => !f.isFree).length;
  return { total: favorites.value.length, freeCount, paidCount };
});

// 加载收藏列表
async function loadFavorites() {
  if (!authStore.userInfo) return;

  loading.value = true;
  try {
    const userFavorites = getUserFavorites(authStore.userInfo.userId);

    // 获取已购课程列表
    const orders = getUserOrders(authStore.userInfo.userId);
    const purchasedCourseIds = orders.filter((o) => o.status === 'paid').map((o) => o.courseId);

    // 添加是否已购标记
    favorites.value = userFavorites.map((fav) => ({
      ...fav,
      isPurchased: purchasedCourseIds.includes(fav.courseId),
      studentCount: fav.studentCount || Math.floor(Math.random() * 10000),
      rating: fav.rating || (4 + Math.random()).toFixed(1),
      originalPrice: fav.price > 0 ? fav.price * 1.2 : 0,
    }));

    // 按收藏时间倒序
    favorites.value.sort((a, b) =>
      new Date(b.favoriteTime).getTime() - new Date(a.favoriteTime).getTime()
    );

    console.log('加载收藏列表:', favorites.value.length);
  } catch (error: any) {
    ElMessage.error(error.message || '加载收藏失败');
  } finally {
    loading.value = false;
  }
}

// 格式化价格
function formatPrice(price: number): string {
  return price === 0 ? '免费' : `¥${price.toFixed(2)}`;
}

// 格式化学员数
function formatStudentCount(count: number): string {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`;
  }
  return count.toString();
}

// 格式化收藏时间
function formatFavoriteTime(timeStr: string): string {
  if (!timeStr) return '-';
  const date = new Date(timeStr);
  return date.toLocaleDateString('zh-CN');
}

// 取消收藏
async function handleRemoveFavorite(courseId: string, courseName: string) {
  try {
    await ElMessageBox.confirm('确定要取消收藏该课程吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    removeFavorite(authStore.userInfo.userId, courseId);
    ElMessage.success('已取消收藏');

    // 重新加载收藏列表
    loadFavorites();
  } catch (error) {
    // 用户取消操作
  }
}

// 立即购买
function handleBuyNow(courseId: string) {
  router.push(`/portal/checkout/${courseId}`);
}

// 开始学习
function handleStartLearning(courseId: string) {
  router.push(`/portal/course-learn/${courseId}`);
}

// 查看详情
function handleViewDetail(courseId: string) {
  router.push(`/portal/course/${courseId}`);
}

onMounted(() => {
  loadFavorites();
});
</script>

<template>
  <div class="my-favorites">
    <div class="page-header">
      <h2>我的收藏</h2>
      <p>共收藏 {{ stats.total }} 门课程（免费 {{ stats.freeCount }} 门，付费 {{ stats.paidCount }} 门）</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 收藏列表 -->
    <div v-else-if="favorites.length > 0" class="favorites-list">
      <div v-for="item in favorites" :key="item.courseId" class="favorite-card">
        <!-- 课程封面 -->
        <div class="course-cover" @click="handleViewDetail(item.courseId)">
          <el-image :src="item.courseCover" fit="cover" />
          <div class="play-overlay">
            <el-icon class="play-icon"><VideoPlay /></el-icon>
          </div>
          <div v-if="item.isFree" class="free-badge">免费</div>
          <div v-else-if="item.originalPrice && item.price < item.originalPrice" class="discount-badge">
            折扣
          </div>
        </div>

        <!-- 课程信息 -->
        <div class="course-info">
          <h3 class="course-name" @click="handleViewDetail(item.courseId)">
            {{ item.courseName }}
          </h3>

          <div class="course-meta">
            <span class="teacher">
              <el-icon><User /></el-icon>
              {{ item.teacherName }}
            </span>
            <span class="rating">
              <el-icon><Star /></el-icon>
              {{ item.rating }} 分
            </span>
            <span class="students">
              <el-icon><Reading /></el-icon>
              {{ formatStudentCount(item.studentCount || 0) }} 人学过
            </span>
          </div>

          <!-- 价格 -->
          <div class="course-price">
            <span class="current-price">{{ formatPrice(item.price) }}</span>
            <span
              v-if="item.originalPrice && item.price < item.originalPrice && !item.isFree"
              class="original-price"
            >
              {{ formatPrice(item.originalPrice) }}
            </span>
          </div>

          <!-- 操作按钮 -->
          <div class="course-actions">
            <!-- 已购买的免费课程 -->
            <el-button
              v-if="item.isPurchased || item.isFree"
              type="success"
              :icon="VideoPlay"
              @click="handleStartLearning(item.courseId)"
            >
              开始学习
            </el-button>
            <!-- 未购买的付费课程 -->
            <el-button
              v-else-if="!item.isFree"
              type="primary"
              @click="handleBuyNow(item.courseId)"
            >
              立即购买
            </el-button>
            <el-button @click="handleViewDetail(item.courseId)">查看详情</el-button>
            <el-button
              type="danger"
              plain
              @click="handleRemoveFavorite(item.courseId, item.courseName)"
            >
              取消收藏
            </el-button>
          </div>

          <!-- 收藏时间 -->
          <div class="favorite-time">
            <el-icon><Clock /></el-icon>
            <span>收藏于 {{ formatFavoriteTime(item.favoriteTime) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <el-empty description="还没有收藏任何课程">
        <el-button type="primary" @click="router.push('/portal/courses')">
          去选课
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.my-favorites {
  padding: $spacing-large;

  .page-header {
    margin-bottom: $spacing-extra-large;

    h2 {
      font-size: $font-size-extra-large;
      font-weight: 600;
      color: $text-color-primary;
      margin-bottom: $spacing-small;
    }

    p {
      color: $text-color-secondary;
    }
  }

  .loading-container {
    padding: $spacing-extra-large 0;
  }

  .favorites-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: $spacing-large;
  }

  .favorite-card {
    background: #fff;
    border: 1px solid $border-color-lighter;
    border-radius: $border-radius-base;
    overflow: hidden;
    transition: $transition-base;

    &:hover {
      box-shadow: $box-shadow-base;
      transform: translateY(-2px);
    }
  }

  .course-cover {
    position: relative;
    width: 100%;
    height: 180px;
    cursor: pointer;
    overflow: hidden;

    :deep(.el-image) {
      width: 100%;
      height: 100%;
    }

    .play-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: $transition-base;

      .play-icon {
        font-size: 48px;
        color: #fff;
      }
    }

    &:hover .play-overlay {
      opacity: 1;
    }

    .free-badge {
      position: absolute;
      top: $spacing-base;
      left: $spacing-base;
      padding: $spacing-small $spacing-base;
      background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
      color: #fff;
      font-size: $font-size-small;
      font-weight: 600;
      border-radius: $border-radius-small;
    }

    .discount-badge {
      position: absolute;
      top: $spacing-base;
      left: $spacing-base;
      padding: $spacing-small $spacing-base;
      background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
      color: #fff;
      font-size: $font-size-small;
      font-weight: 600;
      border-radius: $border-radius-small;
    }
  }

  .course-info {
    padding: $spacing-large;
    display: flex;
    flex-direction: column;
    gap: $spacing-small;
  }

  .course-name {
    font-size: $font-size-medium;
    font-weight: 600;
    color: $text-color-primary;
    cursor: pointer;
    transition: $transition-base;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;

    &:hover {
      color: $--el-color-primary;
    }
  }

  .course-meta {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-base;
    padding: $spacing-small 0;
    border-top: 1px solid $border-color-lighter;
    border-bottom: 1px solid $border-color-lighter;

    span {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: $font-size-small;
      color: $text-color-secondary;
    }
  }

  .course-price {
    display: flex;
    align-items: baseline;
    gap: $spacing-small;

    .current-price {
      font-size: $font-size-large;
      font-weight: 600;
      color: #f56c6c;
    }

    .original-price {
      font-size: $font-size-small;
      color: $text-color-placeholder;
      text-decoration: line-through;
    }
  }

  .course-actions {
    display: flex;
    gap: $spacing-small;
    flex-wrap: wrap;
  }

  .favorite-time {
    display: flex;
    align-items: center;
    gap: $spacing-small;
    font-size: $font-size-small;
    color: $text-color-placeholder;
    padding-top: $spacing-small;
    border-top: 1px solid $border-color-lighter;
  }

  .empty-state {
    padding: $spacing-extra-extra-large 0;
  }
}
</style>
