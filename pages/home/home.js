const game = require('../../utils/game');

Page({
  data: {
    levels: [],
  },

  onShow() {
    this.loadLevels();
  },

  loadLevels() {
    const total = game.getTotalLevels();
    const done = this._getDoneLevels();
    const levels = [];
    for (let i = 1; i <= total; i++) {
      const config = game.getLevelConfig(i);
      levels.push({
        label: config.label,
        cols: config.gridCols,
        rows: config.gridRows,
        pairs: (config.gridCols * config.gridRows) / 2,
        done: done.includes(i),
      });
    }
    this.setData({ levels });
  },

  _getDoneLevels() {
    try {
      return wx.getStorageSync('hanziDone') || [];
    } catch (e) {
      return [];
    }
  },

  onSelectLevel(e) {
    const index = e.currentTarget.dataset.index;
    const level = index + 1;
    wx.navigateTo({
      url: `/pages/index/index?level=${level}`,
    });
  },
});
