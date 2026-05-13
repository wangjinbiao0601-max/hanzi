const game = require('../../utils/game');

Page({
  data: {
    grid: [],
    currentLevel: 1,
    totalLevels: 1,
    levelLabel: '',
    levelNum: '',
    levelName: '',
    gridCols: 4,
    gridRows: 4,
    remaining: 0,
    showModal: false,
    hasNextLevel: false,
    animating: false,
  },

  _firstId: null,
  _canTap: true,

  onLoad(options) {
    const level = options.level ? parseInt(options.level) : 1;
    this.initLevel(level);
  },

  _cloneGrid() {
    return this.data.grid.map(row => row.map(tile => ({ ...tile })));
  },

  _findTile(grid, id) {
    return grid.flat()[id];
  },

  /**
   * 保存通关记录
   */
  _saveDoneLevel(level) {
    try {
      const done = wx.getStorageSync('hanziDone') || [];
      if (!done.includes(level)) {
        done.push(level);
        wx.setStorageSync('hanziDone', done);
      }
    } catch (e) {}
  },

  initLevel(level) {
    const config = game.getLevelConfig(level);
    const tiles = game.generateGrid(level);
    const matrix = game.toGridMatrix(tiles, config.gridCols);

    // 提取关卡名称（"大小入门" 从 "第一关 · 大小入门"）
    const nameParts = config.label.split('·');
    const levelName = nameParts.length > 1 ? nameParts[1].trim() : config.label;

    this._firstId = null;
    this._canTap = true;

    this.setData({
      grid: matrix,
      currentLevel: level,
      totalLevels: game.getTotalLevels(),
      levelLabel: config.label,
      levelNum: `第${level}关`,
      levelName: levelName,
      gridCols: config.gridCols,
      gridRows: config.gridRows,
      remaining: game.getRemainingCount(tiles),
      showModal: false,
      hasNextLevel: !!game.getLevelConfig(level + 1),
      animating: false,
    });
  },

  onTileTap(e) {
    if (!this._canTap) return;

    const tapId = e.currentTarget.dataset.id;
    const grid = this._cloneGrid();
    const tile = this._findTile(grid, tapId);

    if (tile.matched) return;

    if (this._firstId === null) {
      tile.selected = true;
      this._firstId = tapId;
      this.setData({ grid, animating: true });
      setTimeout(() => { this.setData({ animating: false }); }, 300);
      return;
    }

    const first = this._findTile(grid, this._firstId);

    if (first.id === tile.id) {
      tile.selected = false;
      this._firstId = null;
      this.setData({ grid });
      return;
    }

    if (game.isMatch(first, tile)) {
      this._onMatch(first, tile, grid);
    } else {
      this._onNoMatch(first, tile, grid);
    }
  },

  _onMatch(a, b, grid) {
    this._canTap = false;
    a.matched = true;
    b.matched = true;
    a.selected = false;
    b.selected = false;
    this._firstId = null;
    this.setData({ grid });

    const flat = grid.flat();
    const remaining = game.getRemainingCount(flat);
    this.setData({ remaining });

    wx.vibrateShort({ type: 'light' }).catch(() => {});

    setTimeout(() => { this._canTap = true; }, 400);

    if (game.isLevelComplete(flat)) {
      setTimeout(() => { this._onLevelComplete(); }, 500);
    }
  },

  _onNoMatch(a, b, grid) {
    this._canTap = false;
    a.selected = true;
    b.selected = true;
    this.setData({ grid });

    setTimeout(() => {
      a.selected = false;
      b.selected = false;
      this._firstId = null;
      this.setData({ grid });
      this._canTap = true;
    }, 500);
  },

  _onLevelComplete() {
    // 保存通关记录
    this._saveDoneLevel(this.data.currentLevel);

    wx.vibrateLong().catch(() => {});
    this.setData({ showModal: true });
  },

  onModalTap() {},

  onNextLevel() {
    const nextLevel = this.data.currentLevel + 1;
    if (game.getLevelConfig(nextLevel)) {
      this.initLevel(nextLevel);
    } else {
      wx.navigateBack();
    }
  },

  onRestartLevel() {
    this.initLevel(this.data.currentLevel);
  },

  /**
   * 返回选关主页
   */
  onGoToLevel1() {
    wx.navigateBack();
  },
});
