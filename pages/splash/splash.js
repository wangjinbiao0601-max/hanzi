Page({
  onStartGame() {
    // 跳转到关卡选择页，不保留启动页历史
    wx.redirectTo({
      url: '/pages/home/home',
    });
  },
});
