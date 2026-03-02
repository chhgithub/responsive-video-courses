<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getAllPackages, type CoursePackage, calculatePackageSavings, formatPackagePrice } from '@/utils/course-package-storage';

const router = useRouter();
const loading = ref(false);
const packages = ref<CoursePackage[]>([]);

// 筛选状态
const selectedStatus = ref<'all' | 'published'>('published');
const sortBy = ref<'price' | 'discount' | 'enroll'>('price');
const searchKeyword = ref('');

// 过滤后的套餐
const filteredPackages = computed(() => {
  let result = packages.value;

  // 状态筛选
  if (selectedStatus.value === 'published') {
    result = result.filter(pkg => pkg.status === 'published');
  }

  // 搜索筛选（根据套餐名称）
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase();
    result = result.filter(pkg => pkg.packageName.toLowerCase().includes(keyword));
  }

  // 排序
  result = [...result].sort((a, b) => {
    switch (sortBy.value) {
      case 'price':
        return a.price - b.price;
      case 'discount':
        return b.discount - a.discount;
      case 'enroll':
        return b.enrollCount - a.enrollCount;
      default:
        return 0;
    }
  });

  return result;
});

// 加载套餐列表
async function loadPackages() {
  loading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    packages.value = getAllPackages();
  } finally {
    loading.value = false;
  }
}

// 跳转套餐详情
function goToPackageDetail(packageId: number) {
  router.push(`/portal/package/${packageId}`);
}

// 获取节省金额
function getSavings(pkg: CoursePackage): string {
  const savings = calculatePackageSavings(pkg);
  return `省¥${(savings / 100).toFixed(0)}`;
}

// 获取套餐类型标签
function getPackageType(pkg: CoursePackage): string {
  return pkg.isTrial ? '支持试学' : '立即购买';
}

onMounted(() => {
  loadPackages();
});
</script>

<template>
  <div class="packages-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-overlay">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">课程套餐</h1>
            <p class="hero-subtitle">组合学习，超值优惠</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 筛选栏 -->
    <section class="filter-section">
      <div class="container">
        <el-card shadow="never">
          <el-form :inline="true">
            <el-form-item>
              <el-input
                v-model="searchKeyword"
                placeholder="搜索套餐名称..."
                clearable
                style="width: 200px"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <!-- <el-form-item label="状态">
              <el-radio-group v-model="selectedStatus">
                <el-radio-button label="all">全部</el-radio-button>
                <el-radio-button label="published">已发布</el-radio-button>
              </el-radio-group>
            </el-form-item> -->
            <!-- <el-form-item label="排序">
              <el-select v-model="sortBy" style="width: 150px">
                <el-option label="价格从低到高" value="price" />
                <el-option label="折扣从高到低" value="discount" />
                <el-option label="购买人数" value="enroll" />
              </el-select>
            </el-form-item> -->
            <el-form-item>
              <el-button @click="loadPackages" :icon="Refresh">搜索</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </section>

    <!-- 套餐列表 -->
    <section class="packages-section">
      <div class="container">
        <div v-loading="loading" class="packages-list">
          <el-card
            v-for="pkg in filteredPackages"
            :key="pkg.packageId"
            class="package-card"
            shadow="hover"
          >
            <div class="package-detail">
              <!-- 套餐封面 -->
              <div class="package-cover">
                <el-image
                  :src="pkg.packageCover"
                  fit="cover"
                  class="cover-image"
                />
                <div v-if="pkg.status !== 'published'" class="status-badge">
                  <el-tag>{{ pkg.status === 'draft' ? '草稿' : '已下架' }}</el-tag>
                </div>
              </div>

              <!-- 套餐信息 -->
              <div class="package-info">
                <h3 class="package-name">{{ pkg.packageName }}</h3>
                <p class="package-desc">{{ pkg.packageDesc }}</p>

                <!-- 套餐属性 -->
                <div class="package-meta">
                  <span class="meta-item">
                    <el-icon><Document /></el-icon>
                    {{ pkg.courses.length }}门课程
                  </span>
                  <span class="meta-item">
                    <el-icon><User /></el-icon>
                    {{ pkg.enrollCount }}人购买
                  </span>
                  <span class="meta-item">
                    <el-icon><Star /></el-icon>
                    {{ pkg.rating }}分
                  </span>
                </div>

                <!-- 价格信息 -->
                <div class="price-section">
                  <div class="current-price">
                    <span class="price">{{ formatPackagePrice(pkg.price) }}</span>
                    <span class="discount">{{ pkg.discount.toFixed(0) }}折</span>
                  </div>
                  <div class="original-price">
                    原价：{{ formatPackagePrice(pkg.originalPrice) }}
                    <span class="savings">{{ getSavings(pkg) }}</span>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="action-buttons">
                  <el-button
                    type="primary"
                    :disabled="pkg.status !== 'published'"
                    @click="goToPackageDetail(pkg.packageId)"
                  >
                    查看详情
                  </el-button>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 空状态 -->
        <el-empty v-if="!loading && filteredPackages.length === 0" description="暂无套餐" />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.packages-page {
  min-height: calc(100vh - $navbar-height - $footer-height);
  background: $background-color-base;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 $spacing-large;
}

// Hero Section
.hero-section {
  background-size: cover;
  background-position: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin-bottom: $spacing-extra-large;

  .hero-overlay {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
    padding: $spacing-extra-extra-large 0;

    .hero-content {
      text-align: center;
      color: #fff;

      .hero-title {
        font-size: 48px;
        font-weight: bold;
        margin: 0 0 $spacing-base 0;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      .hero-subtitle {
        font-size: $font-size-large;
        opacity: 0.95;
        margin: 0;
      }
    }
  }
}

// Filter Section
.filter-section {
  margin-bottom: $spacing-large;
}

// Packages Section
.packages-section {
  padding-bottom: $spacing-extra-extra-large;
}

.packages-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: $spacing-large;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.package-card {
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $box-shadow-base;
  }
}

.package-detail {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.package-cover {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: $border-radius-base;
  overflow: hidden;

  .cover-image {
    width: 100%;
    height: 100%;
  }

  .status-badge {
    position: absolute;
    top: $spacing-small;
    right: $spacing-small;
  }
}

.package-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.package-name {
  font-size: $font-size-extra-large;
  font-weight: 600;
  color: $text-color-primary;
  margin: 0;
}

.package-desc {
  font-size: $font-size-small;
  color: $text-color-secondary;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.package-meta {
  display: flex;
  gap: $spacing-large;
  flex-wrap: wrap;

  .meta-item {
    display: flex;
    align-items: center;
    gap: $spacing-small;
    font-size: $font-size-small;
    color: $text-color-secondary;
  }
}

.price-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-small;
  padding: $spacing-base;
  background: $background-color-base;
  border-radius: $border-radius-base;

  .current-price {
    display: flex;
    align-items: baseline;
    gap: $spacing-base;

    .price {
      font-size: $font-size-extra-large;
      font-weight: bold;
      color: #f56c6c;
    }

    .discount {
      font-size: $font-size-base;
      font-weight: 500;
      color: #e6a23c;
      padding: 2px 8px;
      background: #fff7e6;
      border-radius: 4px;
    }
  }

  .original-price {
    font-size: $font-size-small;
    color: $text-color-placeholder;
    text-decoration: line-through;

    .savings {
      margin-left: $spacing-small;
      color: #f56c6c;
      text-decoration: none;
      font-weight: 500;
    }
  }
}

.action-buttons {
  margin-top: auto;
}
</style>
