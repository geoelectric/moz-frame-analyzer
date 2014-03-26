function MozFrameAnalyzer(framesExpected, refreshRate) {
  this.reset(framesExpected);
  this._refreshRate = refreshRate || 60;
}

MozFrameAnalyzer.prototype = {
  get framesCaptured() {
    return this._framesCaptured;
  },

  get framesExpected() {
    return this._framesExpected;
  },

  get refreshRate() {
    return this._refreshRate;
  },

  captureTimestamp: function mozFrameAnalyzer_captureTimestamp(timestamp) {
    this._timestamps[this._framesCaptured++] = timestamp;
  },

  getFrameData: function mozFrameAnalyzer_getFrameData() {
    const START_OFFSET = this._timestamps[0];
    const REFRESH_INTERVAL = 1000 / this._refreshRate;

    var data = [];
    var lastElapsed = 0;
    var targetRefresh = 1;

    for (var i = 0; i < this.framesCaptured; i++) {
      var frame = {};

      frame.frameRequested = i + 1;
      frame.elapsed = this._timestamps[i] - START_OFFSET;
      frame.interval = (frame.elapsed - lastElapsed);

      frame.concurrentRefresh = Math.floor(frame.elapsed /
                                           REFRESH_INTERVAL) + 1;
      frame.concurrentRefreshDeadline = frame.concurrentRefresh *
                                        REFRESH_INTERVAL;

      frame.targetRefresh = targetRefresh;
      frame.targetRefreshDeadline = frame.targetRefresh * REFRESH_INTERVAL;

      if (frame.elapsed < frame.targetRefreshDeadline) {
        frame.deliveredRefresh = frame.targetRefresh;
        frame.refreshesOffset = frame.deliveredRefresh -
                                frame.concurrentRefresh;
      } else {
        frame.deliveredRefresh = frame.concurrentRefresh;
        frame.refreshesOffset = frame.targetRefresh - frame.deliveredRefresh;
      }
      frame.deliveredRefreshDeadline = frame.deliveredRefresh *
                                       REFRESH_INTERVAL;

      frame.processingWindow = frame.deliveredRefreshDeadline - frame.elapsed;

      lastElapsed = frame.elapsed;
      targetRefresh = frame.deliveredRefresh + 1;

      data.push(frame);
    }

    data.toHtmlTable = _mozFrameAnalyzer_data_toHtmlTable;

    return data;
  },

  reset: function mozFrameAnalyzer_reset(framesExpected) {
    this._framesExpected = framesExpected;
    this._framesCaptured = 0;
    this._timestamps = [];

    if (this.framesExpected) {
      for(var i = 0; i < this.framesExpected; i++) {
        this._timestamps[i] = -1;
      }
    }
  }
}

MozFrameAnalyzer.prototype.constructor = MozFrameAnalyzer;

function _mozFrameAnalyzer_data_toHtmlTable(verbose) {
  var table = ''
  table += ('<table border="1" cellpadding="4"');
  table += ('<tr>');
  table += ('<th>Frame Requested</th>');
  table += ('<th>Concurrent Refresh</th>');
  table += ('<th>Target Refresh</th>');
  table += ('<th>Delivered Refresh</th>');
  table += ('<th>ms Elapsed</th>')
  table += ('<th>ms Interval</th>');
  table += ('<th>Concurrent Refresh Deadline</th>');
  table += ('<th>Target Refresh Deadline</th>');
  table += ('<th>Delivered Refresh Deadline</th>');
  table += ('<th>Processing Window</th>');
  table += ('<th>Offset Change</th>');
  table += ('</tr>');

  var lastOffset = 0;
  var offsetChangeStr = '';

  var len = this.length;
  for (var i = 0; i < len; i++) {
    if (this[i].refreshesOffset > 0 &&
        lastOffset !== this[i].refreshesOffset && verbose) {
      offsetChangeStr = 'Ahead +' + this[i].refreshesOffset;
    }
    else if (this[i].refreshesOffset === 0 && lastOffset > 0 && verbose) {
      offsetChangeStr = 'Caught up';
    }
    else if (this[i].refreshesOffset < 0) {
      offsetChangeStr = '<b>Skipped ' + -(this[i].refreshesOffset) + '!</b>';
    }
    else {
      offsetChangeStr = '';
    }

    table += ('<tr>');
    table += ('<td>' + this[i].frameRequested + '</td>');
    table += ('<td>' + this[i].concurrentRefresh + '</td>');
    table += ('<td>' + this[i].targetRefresh + '</td>');
    table += ('<td>' + this[i].deliveredRefresh + '</td>');
    table += ('<td>' + this[i].elapsed.toFixed(2) + '</td>');
    table += ('<td>' + this[i].interval.toFixed(2) + '</td>');
    table += ('<td>' + this[i].concurrentRefreshDeadline.toFixed(2) +
                       '</td>');
    table += ('<td>' + this[i].targetRefreshDeadline.toFixed(2) +'</td>');
    table += ('<td>' + this[i].deliveredRefreshDeadline.toFixed(2) +
                       '</td>');
    table += ('<td>' + this[i].processingWindow.toFixed(2) + '</td>');
    table += ('<td>' + offsetChangeStr + '</td>');
    table += ('</tr>');

    lastOffset = this[i].refreshesOffset;
  }

  table += ('</table>');

  return table;
};
