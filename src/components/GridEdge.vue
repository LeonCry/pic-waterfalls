<template>
  <main ref="container" class="relative z-10 h-full w-full overflow-auto">
    <section
      class="edge-grid"
      :style="{
        gridTemplateAreas,
        width: baseWH * sum(wTList) + 'px',
        height: gridAreaList.length * baseWH + 'px',
        opacity: arrivedState.bottom && isScrolling && y !== 0 ? 0 : 1,
      }"
    >
      <div v-for="n in allGridAreaNames" :key="n" :style="{ gridArea: n }" class="edge-block">
        {{ n }}
      </div>
    </section>
  </main>
</template>
<script setup lang="ts">
import { random, sum, debounce } from 'radash';
interface blockType {
  width: number;
  height: number;
}
const container = ref<HTMLDivElement | null>(null);
const { arrivedState, y, isScrolling } = useScroll(container);
// base-w-h
const baseWH = 90;
// 单次请求数
const count = 10;
// block宽长比
const ratio = 2 / 3;
// gap
const gap = 3;
// block类型数
const bt = 3;
const continueRow = ref(0);
const wTList = Array.from({ length: bt }, (_, i) => gap * (i + 1));
const hTList = wTList.map((w) => w * ratio);
const totalWidth = sum(wTList);
const allGridAreaNames = ref<string[]>([]);
const gridAreaList = [Array.from({ length: totalWidth }, () => '.')];
//获取一行中的连续空白长度 [startColumn, endColumn][];
const getEmptyWidth = (row: number) => {
  if (row >= gridAreaList.length) {
    gridAreaList.push(Array.from({ length: totalWidth }, () => '.'));
    return [[0, totalWidth - 1]] as [number, number][];
  }
  const ew: [number, number][] = [];
  let ring = false;
  gridAreaList[row].forEach((item, index) => {
    if (!ring && item !== '.') {
      ring = false;
    } else if (!ring && item === '.') {
      ew.push([index, 0]);
      ring = true;
    } else if (ring && item !== '.') {
      ew[ew.length - 1][1] = index - 1;
      ring = false;
    } else if (ring && index === totalWidth - 1) {
      ew[ew.length - 1][1] = index;
    }
  });
  return ew;
};
//根据空白长度生成块类型
const fillingByEmptyWidth = (emptyWidth: [number, number]) => {
  let width = emptyWidth[1] - emptyWidth[0] + 1;
  const blocks: blockType[] = [];
  while (width) {
    const maxR = wTList.findLastIndex((w) => w <= width);
    const r = random(0, maxR);
    width -= wTList[r];
    blocks.push({ width: wTList[r], height: hTList[r] });
  }
  return blocks;
};
//根据块类型生成grid模板区域
const generateGridTemplateArea = (
  row: number,
  startCol: number,
  blocks: blockType[],
  names: string[],
) => {
  blocks.forEach((bk) => {
    const name = names.shift();
    if (!name) return;
    for (let r = row; r < row + bk.height; r++) {
      for (let c = startCol; c < startCol + bk.width; c++) {
        if (!gridAreaList[r]) {
          gridAreaList.push(Array.from({ length: totalWidth }, () => '.'));
        }
        gridAreaList[r][c] = name;
      }
    }
    startCol += bk.width;
  });
};
//生成函数
const handleGenerating = (gridAreaNames: string[]) => {
  let row = continueRow.value;
  while (gridAreaNames.length) {
    const emptyWidth = getEmptyWidth(row);
    if (!emptyWidth.length) {
      row++;
      continue;
    }
    emptyWidth.forEach((col) => {
      const blocks = fillingByEmptyWidth(col);
      generateGridTemplateArea(row, col[0], blocks, gridAreaNames);
    });
  }
  continueRow.value = row;
  return gridAreaList
    .map((row) => row.join(' '))
    .map((r) => "'" + r + "'")
    .join(' ');
};
const getGridTemplateAreaStyle = debounce({ delay: 300 }, () => {
  t++;
  const gridAreaNames = Array.from({ length: count }, (_, i) => `_${t}_${i}`);
  allGridAreaNames.value.push(...gridAreaNames);
  gridTemplateAreas.value = handleGenerating(gridAreaNames);
});
const gridTemplateAreas = ref();
//附加参数
let t = 0;
whenever(() => arrivedState.bottom, getGridTemplateAreaStyle);
</script>
<style scoped lang="scss">
.edge-grid {
  display: grid;
  gap: 4px;
  padding: 40px;
  grid-template-rows: repeat(auto-fill, 1fr);
  grid-auto-flow: row dense;
  transition: opacity 400ms ease-in-out;
}
.edge-block {
  transition: background-color 0.55s;
  border-radius: 6px;
  background-color: lightgray;
  &:hover {
    background-color: #cfdaf3;
  }
}
</style>
