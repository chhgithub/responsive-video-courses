<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import * as echarts from 'echarts';

interface CourseStat {
  category: string;
  count: number;
  totalDuration: number;
  purchaseCount: number; // 新增：购买人数
}

interface Props {
  stats: CourseStat[];
}

const props = defineProps<Props>();
const chartRef = ref<HTMLDivElement>();
let chartInstance: echarts.ECharts | null = null;

function initChart() {
  if (!chartRef.value) return;

  chartInstance = echarts.init(chartRef.value);

  // 为每个气泡分配不同的渐变色
  const colors = [
    new echarts.graphic.RadialGradient(0.3, 0.3, 1, [
      { offset: 0, color: 'rgba(255, 99, 132, 0.9)' },
      { offset: 0.5, color: 'rgba(255, 99, 132, 0.6)' },
      { offset: 1, color: 'rgba(255, 99, 132, 0.2)' },
    ]),
    new echarts.graphic.RadialGradient(0.3, 0.3, 1, [
      { offset: 0, color: 'rgba(54, 162, 235, 0.9)' },
      { offset: 0.5, color: 'rgba(54, 162, 235, 0.6)' },
      { offset: 1, color: 'rgba(54, 162, 235, 0.2)' },
    ]),
    new echarts.graphic.RadialGradient(0.3, 0.3, 1, [
      { offset: 0, color: 'rgba(255, 206, 86, 0.9)' },
      { offset: 0.5, color: 'rgba(255, 206, 86, 0.6)' },
      { offset: 1, color: 'rgba(255, 206, 86, 0.2)' },
    ]),
    new echarts.graphic.RadialGradient(0.3, 0.3, 1, [
      { offset: 0, color: 'rgba(75, 192, 192, 0.9)' },
      { offset: 0.5, color: 'rgba(75, 192, 192, 0.6)' },
      { offset: 1, color: 'rgba(75, 192, 192, 0.2)' },
    ]),
    new echarts.graphic.RadialGradient(0.3, 0.3, 1, [
      { offset: 0, color: 'rgba(153, 102, 255, 0.9)' },
      { offset: 0.5, color: 'rgba(153, 102, 255, 0.6)' },
      { offset: 1, color: 'rgba(153, 102, 255, 0.2)' },
    ]),
  ];

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.componentType === 'series') {
          return `
            <div style="padding: 8px; min-width: 150px;">
              <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">${params.data[2]}</div>
              <div style="margin: 4px 0;">📚 课程数量: <strong>${params.data[3]}</strong></div>
              <div style="margin: 4px 0;">⏱️ 总时长: <strong>${Math.round(params.data[4] / 60)}小时</strong></div>
              <div style="margin: 4px 0;">👥 购买人数: <strong>${params.data[5]}</strong></div>
            </div>
          `;
        }
        return '';
      },
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '5%',
      top: '5%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      show: false,
      min: 0,
      max: 150,
    },
    yAxis: {
      type: 'value',
      show: false,
      min: 0,
      max: 150,
    },
    series: [
      {
        type: 'scatter',
        symbolSize: (data: number[]) => {
          // 根据购买人数决定气泡大小
          const purchaseCount = data[5];
          const baseSize = 60;
          const size = baseSize + Math.sqrt(purchaseCount) * 3;
          return Math.min(size, 120); // 最大120px
        },
        data: props.stats.map((stat, index) => [
          (index % 3) * 30 + 50 + Math.random() * 20,
          (index % 2) * 30 + 50 + Math.random() * 20,
          stat.category,
          stat.count,
          stat.totalDuration,
          stat.purchaseCount, // 新增：购买人数
        ]),
        itemStyle: {
          color: (params: any) => {
            return colors[params.dataIndex % colors.length];
          },
          shadowBlur: 20,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowOffsetX: 0,
          shadowOffsetY: 4,
        },
        label: {
          show: true,
          formatter: (params: any) => {
            // 显示分类和购买人数
            return `${params.data[2]}\n${params.data[5]}人`;
          },
          position: 'inside',
          color: '#fff',
          fontSize: 13,
          fontWeight: 'bold',
          textShadowColor: 'rgba(0, 0, 0, 0.5)',
          textShadowBlur: 4,
          lineHeight: 16,
        },
        emphasis: {
          scale: 1.2,
          itemStyle: {
            shadowBlur: 30,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
          label: {
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        animationDuration: 2500,
        animationEasing: 'elasticOut',
        animationDelay: (idx: number) => idx * 200,
      },
    ],
  };

  chartInstance.setOption(option, true);
}

function updateChart() {
  if (!chartInstance) return;

  // 为每个气泡分配不同的渐变色
  const colors = [
    new echarts.graphic.RadialGradient(0.3, 0.3, 1, [
      { offset: 0, color: 'rgba(255, 99, 132, 0.9)' },
      { offset: 0.5, color: 'rgba(255, 99, 132, 0.6)' },
      { offset: 1, color: 'rgba(255, 99, 132, 0.2)' },
    ]),
    new echarts.graphic.RadialGradient(0.3, 0.3, 1, [
      { offset: 0, color: 'rgba(54, 162, 235, 0.9)' },
      { offset: 0.5, color: 'rgba(54, 162, 235, 0.6)' },
      { offset: 1, color: 'rgba(54, 162, 235, 0.2)' },
    ]),
    new echarts.graphic.RadialGradient(0.3, 0.3, 1, [
      { offset: 0, color: 'rgba(255, 206, 86, 0.9)' },
      { offset: 0.5, color: 'rgba(255, 206, 86, 0.6)' },
      { offset: 1, color: 'rgba(255, 206, 86, 0.2)' },
    ]),
    new echarts.graphic.RadialGradient(0.3, 0.3, 1, [
      { offset: 0, color: 'rgba(75, 192, 192, 0.9)' },
      { offset: 0.5, color: 'rgba(75, 192, 192, 0.6)' },
      { offset: 1, color: 'rgba(75, 192, 192, 0.2)' },
    ]),
    new echarts.graphic.RadialGradient(0.3, 0.3, 1, [
      { offset: 0, color: 'rgba(153, 102, 255, 0.9)' },
      { offset: 0.5, color: 'rgba(153, 102, 255, 0.6)' },
      { offset: 1, color: 'rgba(153, 102, 255, 0.2)' },
    ]),
  ];

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.componentType === 'series') {
          return `
            <div style="padding: 8px; min-width: 150px;">
              <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">${params.data[2]}</div>
              <div style="margin: 4px 0;">📚 课程数量: <strong>${params.data[3]}</strong></div>
              <div style="margin: 4px 0;">⏱️ 总时长: <strong>${Math.round(params.data[4] / 60)}小时</strong></div>
              <div style="margin: 4px 0;">👥 购买人数: <strong>${params.data[5]}</strong></div>
            </div>
          `;
        }
        return '';
      },
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '5%',
      top: '5%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      show: false,
      min: 0,
      max: 150,
    },
    yAxis: {
      type: 'value',
      show: false,
      min: 0,
      max: 150,
    },
    series: [
      {
        type: 'scatter',
        symbolSize: (data: number[]) => {
          // 根据购买人数决定气泡大小
          const purchaseCount = data[5];
          const baseSize = 60;
          const size = baseSize + Math.sqrt(purchaseCount) * 3;
          return Math.min(size, 120); // 最大120px
        },
        data: props.stats.map((stat, index) => [
          (index % 3) * 30 + 50 + Math.random() * 20,
          (index % 2) * 30 + 50 + Math.random() * 20,
          stat.category,
          stat.count,
          stat.totalDuration,
          stat.purchaseCount, // 新增：购买人数
        ]),
        itemStyle: {
          color: (params: any) => {
            return colors[params.dataIndex % colors.length];
          },
          shadowBlur: 20,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowOffsetX: 0,
          shadowOffsetY: 4,
        },
        label: {
          show: true,
          formatter: (params: any) => {
            // 显示分类和购买人数
            return `${params.data[2]}\n${params.data[5]}人`;
          },
          position: 'inside',
          color: '#fff',
          fontSize: 13,
          fontWeight: 'bold',
          textShadowColor: 'rgba(0, 0, 0, 0.5)',
          textShadowBlur: 4,
          lineHeight: 16,
        },
        emphasis: {
          scale: 1.2,
          itemStyle: {
            shadowBlur: 30,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
          label: {
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        animationDuration: 2500,
        animationEasing: 'elasticOut',
        animationDelay: (idx: number) => idx * 200,
      },
    ],
  };

  chartInstance.setOption(option, true);
}

function handleResize() {
  chartInstance?.resize();
}

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chartInstance?.dispose();
});

watch(() => props.stats, updateChart, { deep: true });
</script>

<template>
  <div ref="chartRef" class="course-stats-chart"></div>
</template>

<style scoped lang="scss">
.course-stats-chart {
  width: 100%;
  height: 500px;
}
</style>
