/**
 * 汉字消消乐 - 游戏核心逻辑模块
 * 每个汉字配对消除，每对2张，不跨关卡复用
 */

// ── 关卡配置 ──
// 每个关卡的 characters 数量 = gridCols × gridRows / 2（每字一对）
const LEVEL_CONFIG = {
  // ── 入门（2×2 = 4格，2对） ──
  1: { gridCols: 2, gridRows: 2, characters: ['大', '小'], label: '第一关 · 大小入门' },

  // ── 初级（2×3 = 6格，3对） ──
  2: { gridCols: 2, gridRows: 3, characters: ['上', '下', '左'], label: '第二关 · 方位初识' },

  // ── 中级（4×4 = 16格，8对） ──
  3: { gridCols: 4, gridRows: 4, characters: ['日', '月', '山', '水', '花', '鸟', '虫', '鱼'],
       label: '第三关 · 自然之美' },
  4: { gridCols: 4, gridRows: 4, characters: ['春', '夏', '秋', '冬', '风', '云', '雨', '雪'],
       label: '第四关 · 四季气象' },
  5: { gridCols: 4, gridRows: 4, characters: ['人', '口', '手', '足', '耳', '目', '心', '力'],
       label: '第五关 · 身体认知' },

  // ── 进阶（4×5 = 20格，10对） ──
  6: { gridCols: 4, gridRows: 5, characters: ['金', '木', '火', '土', '石', '田', '林', '川', '天', '地'],
       label: '第六关 · 大地万物' },
  7: { gridCols: 4, gridRows: 5, characters: ['红', '黄', '蓝', '绿', '白', '黑', '银', '粉', '紫', '灰'],
       label: '第七关 · 色彩缤纷' },
  8: { gridCols: 4, gridRows: 5, characters: ['东', '南', '西', '北', '前', '后', '右', '中', '外', '里'],
       label: '第八关 · 方位空间' },
  9: { gridCols: 4, gridRows: 5, characters: ['牛', '羊', '马', '龙', '虎', '鹿', '龟', '凤', '鹤', '象'],
       label: '第九关 · 灵兽世界' },
  10: { gridCols: 4, gridRows: 5, characters: ['星', '光', '明', '年', '岁', '节', '庆', '圆', '安', '和'],
        label: '第十关 · 美好祝愿' },
};

/**
 * 获取关卡配置
 */
function getLevelConfig(level) {
  const config = LEVEL_CONFIG[level];
  if (!config) {
    return getLevelConfig(1); // 默认返回第1关
  }
  return config;
}

/**
 * 生成关卡的网格数据
 * 每个汉字出现2次（一对），配对消除
 */
function generateGrid(level) {
  const config = getLevelConfig(level);
  const { gridCols, gridRows, characters } = config;
  const total = gridCols * gridRows;
  const eachCount = total / characters.length; // 每个字出现次数（应为2）

  // 1. 构建原始数组 [char1×eachCount, char2×eachCount, ...]
  let tiles = [];
  let id = 0;
  characters.forEach(char => {
    for (let i = 0; i < eachCount; i++) {
      tiles.push({
        id: id++,
        char: char,
        selected: false,
        matched: false,
      });
    }
  });

  // 2. Fisher-Yates 洗牌
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }

  // 3. 重新分配 id（按洗牌后的顺序）
  tiles.forEach((tile, index) => {
    tile.id = index;
  });

  return tiles;
}

/**
 * 将一维数组转换为二维网格（方便UI渲染）
 */
function toGridMatrix(tiles, cols) {
  const matrix = [];
  for (let i = 0; i < tiles.length; i += cols) {
    matrix.push(tiles.slice(i, i + cols));
  }
  return matrix;
}

/**
 * 判断两个格子是否匹配
 */
function isMatch(a, b) {
  if (a.id === b.id) return false; // 同一个格子
  if (a.matched || b.matched) return false; // 已消除
  return a.char === b.char;
}

/**
 * 判断关卡是否完成
 */
function isLevelComplete(tiles) {
  return tiles.every(tile => tile.matched);
}

/**
 * 获取未消除的格子数
 */
function getRemainingCount(tiles) {
  return tiles.filter(t => !t.matched).length;
}

/**
 * 获取所有支持的关卡数量
 */
function getTotalLevels() {
  return Object.keys(LEVEL_CONFIG).length;
}

module.exports = {
  getLevelConfig,
  generateGrid,
  toGridMatrix,
  isMatch,
  isLevelComplete,
  getRemainingCount,
  getTotalLevels,
};
