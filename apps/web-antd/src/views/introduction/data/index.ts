import type { VxeGridProps } from '#/adapter/vxe-table';

import { IntroductionTypeMap } from '#/api/introduction/model';

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 50 },
  {
    field: 'type',
    title: '类型',
    width: 150,
    formatter: ({ row }) => {
      return (
        IntroductionTypeMap[row.type as keyof typeof IntroductionTypeMap] ||
        row.type
      );
    },
  },
  {
    field: 'title',
    title: '标题',
    minWidth: 200,
  },
  {
    field: 'coverImage',
    title: '封面图',
    width: 120,
    slots: { default: 'coverImage' },
  },
  {
    field: 'updateTime',
    title: '更新时间',
    width: 180,
    formatter: 'formatDate',
  },
  {
    title: '操作',
    width: 150,
    fixed: 'right',
    slots: { default: 'action' },
  },
];

export const querySchema = () => {
  return [
    {
      component: 'Select',
      componentProps: {
        placeholder: '请选择类型',
        options: Object.entries(IntroductionTypeMap).map(([value, label]) => ({
          label,
          value,
        })),
      },
      fieldName: 'type',
      label: '类型',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入标题',
      },
      fieldName: 'title',
      label: '标题',
    },
  ];
};
