import type { VxeGridProps } from '#/adapter/vxe-table';

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 50 },
  {
    field: 'courseName',
    title: '课程名称',
    minWidth: 200,
  },
  {
    field: 'courseCover',
    title: '封面',
    width: 100,
    slots: { default: 'cover' },
  },
  {
    field: 'categoryName',
    title: '分类',
    width: 120,
  },
  {
    field: 'teacherName',
    title: '讲师',
    width: 120,
  },
  {
    field: 'price',
    title: '价格',
    width: 100,
    align: 'right',
    slots: { default: 'price' },
  },
  {
    field: 'isFree',
    title: '免费',
    width: 80,
    formatter: ({ row }) => {
      return row.isFree ? '是' : '否';
    },
  },
  {
    field: 'viewCount',
    title: '浏览量',
    width: 100,
    align: 'right',
  },
  {
    field: 'enrollCount',
    title: '报名人数',
    width: 100,
    align: 'right',
  },
  {
    field: 'status',
    title: '状态',
    width: 80,
    slots: { default: 'status' },
  },
  {
    field: 'sortOrder',
    title: '排序',
    width: 80,
    align: 'right',
  },
  {
    field: 'createTime',
    title: '创建时间',
    width: 160,
    formatter: 'formatDate',
  },
  {
    title: '操作',
    width: 200,
    fixed: 'right',
    slots: { default: 'action' },
  },
];

export const querySchema = () => {
  return [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入课程名称',
      },
      fieldName: 'courseName',
      label: '课程名称',
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: '请选择分类',
        options: [],
      },
      fieldName: 'categoryId',
      label: '课程分类',
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: '请选择讲师',
        options: [],
      },
      fieldName: 'teacherId',
      label: '讲师',
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: '请选择状态',
        options: [
          { label: '上架', value: 'published' },
          { label: '下架', value: 'draft' },
        ],
      },
      fieldName: 'status',
      label: '状态',
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '全部', value: '' },
          { label: '免费', value: true },
          { label: '付费', value: false },
        ],
      },
      fieldName: 'isFree',
      label: '收费类型',
    },
  ];
};
