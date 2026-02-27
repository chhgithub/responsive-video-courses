<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import * as echarts from 'echarts';

interface CourseStat {
  category: string;
  count: number;
  totalDuration: number;
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

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.componentType === 'series') {
          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${params.data[2]}</div>
              <div>课程数量: ${params.data[0]}</div>
              <div>总时长: ${Math.round(params.data[1] / 60)}小时</div>
            </div>
          `;
        }
        return '';
      },
    },
    grid: {
      left: '3%',
      right: '7%',
      bottom: '7%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: '课程数量',
      nameTextStyle: {
        color: '#606266',
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
        },
      },
    },
    yAxis: {
      type: 'value',
      name: '总时长(分钟)',
      nameTextStyle: {
        color: '#606266',
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
        },
      },
    },
    series: [
      {
        type: 'scatter',
        symbolSize: (data: number[]) => {
          return Math.sqrt(data[0]) * 15;
        },
        data: props.stats.map((stat) => [
          stat.count,
          stat.totalDuration,
          stat.category,
        ]),
        itemStyle: {
          color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
            { offset: 0, color: '#409eff' },
            { offset: 1, color: '#a0cfff' },
          ]),
          shadowBlur: 10,
          shadowColor: 'rgba(64, 158, 255, 0.5)',
        },
        label: {
          show: true,
          formatter: (params: any) => params.data[2],
          position: 'top',
          color: '#303133',
          fontSize: 12,
        },
      },
    ],
  };

  chartInstance.setOption(option);
}

function updateChart() {
  if (!chartInstance) return;

  const option: echarts.EChartsOption = {
    series: [
      {
        type: 'scatter',
        symbolSize: (data: number[]) => {
          return Math.sqrt(data[0]) * 15;
        },
        data: props.stats.map((stat) => [
          stat.count,
          stat.totalDuration,
          stat.category,
        ]),
      },
    ],
  };

  chartInstance.setOption(option);
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
  height: 400px;
}
</style>
