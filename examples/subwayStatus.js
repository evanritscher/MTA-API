function subwayStatus(systemStatus, line) {
  if (line) {
    return systemStatus.data.data.service.subway[0].line
      .filter(l => l.name[0] === line);
  }
  return systemStatus.data.data.service.subway[0].line;
}

module.exports = subwayStatus;