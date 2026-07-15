import type { ChallengeMeta } from './types';
import {
  Level1PreciseClick,
  Level2Pinball,
  Level3ColorMatch,
  Level4TargetClick,
  Level5NumberMemory,
} from './Challenges1to5';
import {
  Level6MemorySequence,
  Level7DragExact,
  Level8Reaction,
  Level9MathRace,
  Level10Trail,
} from './Challenges6to10';
import {
  Level11TypeExact,
  Level12OddOneOut,
  Level13Countdown,
  Level14Maze,
  Level15HoldDuration,
} from './Challenges11to15';
import {
  Level16Catch,
  Level17SliderMath,
  Level18VisualSearch,
  Level19PatternLock,
  Level20FinalMemory,
} from './Challenges16to20';

export const CHALLENGES: ChallengeMeta[] = [
  { id: 1, title: '精准点击', subtitle: '精确命中', instruction: '连续 5 次点击红点中心', Component: Level1PreciseClick },
  { id: 2, title: '弹球蓄力', subtitle: '力度控制', instruction: '按住蓄力，落入靶心', Component: Level2Pinball },
  { id: 3, title: '色彩还原', subtitle: '色觉辨识', instruction: 'RGB 滑块还原目标颜色', Component: Level3ColorMatch },
  { id: 4, title: '快速瞄准', subtitle: '手眼协调', instruction: '8 秒内点击移动目标 8 次', Component: Level4TargetClick },
  { id: 5, title: '数字记忆', subtitle: '工作记忆', instruction: '记住显示的数字并输入', Component: Level5NumberMemory },
  { id: 6, title: '记忆序列', subtitle: '工作记忆', instruction: '复现 8 位闪烁顺序', Component: Level6MemorySequence },
  { id: 7, title: '盲拖对齐', subtitle: '空间估计', instruction: '拖到隐藏目标位置', Component: Level7DragExact },
  { id: 8, title: '反应速度', subtitle: '反应时', instruction: '4 轮平均反应 ≤ 280ms', Component: Level8Reaction },
  { id: 9, title: '心算竞速', subtitle: '快速运算', instruction: '20 秒 8 道两位数运算', Component: Level9MathRace },
  { id: 10, title: '轨迹追踪', subtitle: '精细运动', instruction: '沿圆点路径滑动到终点', Component: Level10Trail },
  { id: 11, title: '精确输入', subtitle: '字符校验', instruction: '12 秒内一字不差输入中文', Component: Level11TypeExact },
  { id: 12, title: '找不同', subtitle: '色觉微差', instruction: '5 轮找色相不同的方块', Component: Level12OddOneOut },
  { id: 13, title: '倒计时', subtitle: '时间感知', instruction: '使经过时间接近目标', Component: Level13Countdown },
  { id: 14, title: '迷宫', subtitle: '路径规划', instruction: '7 秒内方向键穿越迷宫', Component: Level14Maze },
  { id: 15, title: '持续按压', subtitle: '时长估计', instruction: '按住使时长接近目标', Component: Level15HoldDuration },
  { id: 16, title: '接球', subtitle: '手眼协调', instruction: '接住 5 个下落球', Component: Level16Catch },
  { id: 17, title: '数值微调', subtitle: '精细调节', instruction: '8秒内滑块精确等于目标值', Component: Level17SliderMath },
  { id: 18, title: '视觉搜索', subtitle: '视觉辨识', instruction: '6x6网格中找到唯一方块，5轮全对', Component: Level18VisualSearch },
  { id: 19, title: '图案锁', subtitle: '空间记忆', instruction: '复现 6 点闪烁顺序', Component: Level19PatternLock },
  { id: 20, title: '终极记忆', subtitle: '终极挑战', instruction: '记住显示的数字并输入（仅显示2秒）', Component: Level20FinalMemory },
];
