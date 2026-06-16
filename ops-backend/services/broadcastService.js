// ops-backend/services/broadcastService.js
let clients = [];
let liveMetrics = { cpu: 0, memory: 0, disk: 0 };

exports.addClient = (res) => {
  clients.push(res);
  res.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
};

exports.broadcast = (payload) => {
  const frame = `data: ${JSON.stringify(payload)}\n\n`;
  clients.forEach(c => c.write(frame));
};

exports.getLiveMetrics = () => liveMetrics;
exports.setLiveMetrics = (metrics) => { liveMetrics = metrics; };