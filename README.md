MozFrameAnalyzer is a JS class you can call from any requestAnimationFrame driven animation to give you a number of statistics about the animation loop:

Frame Requested: sequence of the request
ms Elapsed since Animation Start
ms Interval since last frame request

Concurrent Refresh: which refresh is executing while the request is made?
Target Refresh: which refresh should this request be in time for?
Delivered Refresh: which refresh was this request be in time for?

Concurrent Refresh Deadline: at what ms did the concurrent refresh render?
Target Refresh Deadline: at what ms did the target refresh render?
Delivered Frame Deadline: at what ms did the delivered refresh render?

Processing Window: how many ms was there between the request and the render?

Offset Change: tells when frames start being requested ahead of their refresh (e.g. frame 3 requested during refresh 2's render window), when the sequence catches up to synced, and when refreshes are skipped due to missed render windows.

---

All stats are calculated by assuming the first request comes in at the beginning of a refresh window (i.e. 1000/FPS ms left to render) and then tracking the timeline from there.

In practice this may or may not align with reality. In particular, any early messages that the sequence is rendering a frame ahead may indicate a different offset.

However, the basic timeline of one frame every 1000/FPS still applies, and while a skipped refresh 5 in instrumentation might mean a skipped refresh 4 or 6 in the real animation, there should still be a correlation.

To recognize this possible offset discrepency, as well as to allow for the idea that a request for a new frame may be intentionally fired off shortly before the last refresh renders, skipped refreshes are only called out when they don't offset a preceding "ahead" message.

"Caught up" means that a previous refresh surplus has adjusted back to sync and probably doesn't reflect a real issue. However, "Skipped," especially when the skipped amount is more than one refresh, almost certainly indicates an actual stutter.

---

The analyzer will used to instrument various animation demos, primarily for use in verifying the accuracy of Eideticker measurements.
