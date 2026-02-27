<script setup lang="ts">
import { ref } from 'vue';
import WangEditor from '@/components/WangEditor.vue';
import { adminFacultyApi } from '@/api/admin/introduction';
import type { TeacherInfo, TeacherForm } from '@/types/introduction';

interface Props {
  teachers: TeacherInfo[];
}

interface Emits {
  (e: 'refresh'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const drawerVisible = ref(false);
const drawerMode = ref<'add' | 'edit'>('add');
const formRef = ref();
const currentTeacher = ref<TeacherInfo | null>(null);

const formData = ref<TeacherForm>({
  name: '',
  avatar: '',
  title: '',
  specialties: [],
  intro: '',
  achievements: [],
  isPublished: false,
  sortOrder: 1,
});

const formRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  avatar: [{ required: true, message: '请输入头像URL', trigger: 'blur' }],
  title: [{ required: true, message: '请输入头衔', trigger: 'blur' }],
  intro: [{ required: true, message: '请输入简介', trigger: 'blur' }],
};

// 打开新增抽屉
function handleAdd() {
  drawerMode.value = 'add';
  currentTeacher.value = null;
  formData.value = {
    name: '',
    avatar: '',
    title: '',
    specialties: [],
    intro: '',
    achievements: [],
    isPublished: false,
    sortOrder: props.teachers.length + 1,
  };
  drawerVisible.value = true;
}

// 打开编辑抽屉
function handleEdit(teacher: TeacherInfo) {
  drawerMode.value = 'edit';
  currentTeacher.value = teacher;
  formData.value = { ...teacher };
  drawerVisible.value = true;
}

// 保存
async function handleSave() {
  try {
    await formRef.value?.validate();

    if (drawerMode.value === 'add') {
      await adminFacultyApi.addTeacher(formData.value);
    } else {
      await adminFacultyApi.updateTeacher(formData.value as TeacherInfo);
    }

    drawerVisible.value = false;
    emit('refresh');
  } catch (error) {
    console.error('保存失败:', error);
  }
}

// 删除讲师
async function handleDelete(teacher: TeacherInfo) {
  try {
    await adminFacultyApi.removeTeacher(teacher.id);
    emit('refresh');
  } catch (error) {
    console.error('删除失败:', error);
  }
}

// 切换展示状态
async function handleToggleDisplay(teacher: TeacherInfo) {
  try {
    await adminFacultyApi.toggleDisplay(teacher.id);
    emit('refresh');
  } catch (error) {
    console.error('操作失败:', error);
  }
}

// 处理专业领域输入（逗号分隔）
function handleSpecialtiesInput(value: string) {
  formData.value.specialties = value.split(/[,，]/).map(s => s.trim()).filter(s => s);
}

// 处理成就输入（逗号分隔）
function handleAchievementsInput(value: string) {
  formData.value.achievements = value.split(/[,，]/).map(s => s.trim()).filter(s => s);
}
</script>

<template>
  <div class="faculty-display">
    <!-- 操作栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加讲师
      </el-button>
    </div>

    <!-- 讲师列表 -->
    <el-table :data="teachers" stripe>
      <el-table-column label="头像" width="100">
        <template #default="{ row }">
          <el-avatar :size="60" :src="row.avatar" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="title" label="头衔" width="150" />
      <el-table-column label="专业领域" width="250">
        <template #default="{ row }">
          <el-tag v-for="spec in row.specialties" :key="spec" size="small" class="tag">
            {{ spec }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="intro" label="简介" min-width="200" show-overflow-tooltip />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.isPublished ? 'success' : 'info'">
            {{ row.isPublished ? '已展示' : '隐藏' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button
            link
            :type="row.isPublished ? 'warning' : 'success'"
            size="small"
            @click="handleToggleDisplay(row)"
          >
            {{ row.isPublished ? '隐藏' : '展示' }}
          </el-button>
          <el-button link type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-popconfirm
            title="确定要删除该讲师吗？"
            confirm-button-text="确定"
            cancel-button-text="取消"
            @confirm="handleDelete(row)"
          >
            <template #reference>
              <el-button link type="danger" size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="drawerMode === 'add' ? '添加讲师' : '编辑讲师'"
      direction="rtl"
      size="600px"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="头衔" prop="title">
          <el-input v-model="formData.title" placeholder="请输入头衔，如：高级前端架构师" />
        </el-form-item>

        <el-form-item label="头像" prop="avatar">
          <div class="avatar-uploader">
            <el-avatar v-if="formData.avatar" :size="100" :src="formData.avatar" />
            <div v-else class="upload-placeholder">
              <el-icon><Plus /></el-icon>
            </div>
          </div>
          <el-input
            v-model="formData.avatar"
            placeholder="请输入头像URL"
            style="margin-top: 10px"
          />
        </el-form-item>

        <el-form-item label="专业领域">
          <el-input
            :model-value="formData.specialties.join(', ')"
            placeholder="多个领域用逗号分隔"
            @input="handleSpecialtiesInput"
          />
          <div class="preview-tags">
            <el-tag v-for="spec in formData.specialties" :key="spec" size="small" closable @close="formData.specialties = formData.specialties.filter(s => s !== spec)">
              {{ spec }}
            </el-tag>
          </div>
        </el-form-item>

        <el-form-item label="个人简介" prop="intro">
          <WangEditor
            v-model="formData.intro"
            placeholder="请输入个人简介"
            :height="300"
          />
        </el-form-item>

        <el-form-item label="成就荣誉">
          <el-input
            :model-value="formData.achievements?.join(', ')"
            placeholder="多项成就用逗号分隔"
            @input="handleAchievementsInput"
          />
        </el-form-item>

        <el-form-item label="是否展示">
          <el-switch v-model="formData.isPublished" />
          <span class="field-tip">{{ formData.isPublished ? '是（将在前台展示）' : '否（隐藏）' }}</span>
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="formData.sortOrder" :min="1" :max="999" />
          <span class="field-tip">数字越小排序越靠前</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.faculty-display {
  padding: $spacing-large;

  .toolbar {
    margin-bottom: $spacing-base;
  }

  .tag {
    margin-right: $spacing-small;
    margin-bottom: $spacing-small;
  }

  .avatar-uploader {
    display: flex;
    flex-direction: column;
    align-items: center;

    .upload-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100px;
      height: 100px;
      border: 2px dashed $border-color-base;
      border-radius: 50%;
      background-color: $background-color-base;

      .el-icon {
        font-size: 32px;
        color: $text-color-secondary;
      }
    }
  }

  .preview-tags {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-small;
    margin-top: $spacing-small;
  }

  .field-tip {
    margin-left: $spacing-small;
    color: $text-color-secondary;
    font-size: $font-size-small;
  }

  .drawer-footer {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-base;
  }
}
</style>
