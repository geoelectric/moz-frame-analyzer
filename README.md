mozFrameAnalyzer will be a JS class you can call from any requestAnimationFrame driven animation to give you a number of statistics about the animation loop:

Frame Requested: sequence of the request
ms Elapsed since Animation Start
ms Interval since last frame request

Concurrent Frame: which frame is executing while the request is made?
Target Frame: which frame should this request be in time for?
Actual Frame: which frame will this request be in time for?

Concurrent Frame Deadline: at what ms does the current frame render?
Target Frame Deadline: at what ms will or did the target frame render?
Actual Frame Deadline: at what ms will the actual frame render?

Processing Window: how many ms is there between the request and the render?

Offset Change: tells when frames start being requested ahead of their window (e.g. frame 3 requested during frame 2's render window), when the sequence catches up to synced, and when frames are skipped due to missed render windows.

--- 

All stats are calculated by assuming the first request comes in at the beginning of a frame window (i.e. 1000/FPS ms left to render) and then tracking the timeline from there.

In practice this may or may not align with reality. In particular, any early messages that the sequence is rendering a frame ahead may indicate a different offset. 

However, the basic timeline of one frame every 1000/FPS still applies, and while a skipped frame 5 in instrumentation might mean a skipped frame 4 or 6 in the real animation, there should still be a correlation.

To recognize this possible offset discrepency, as well as to allow for the idea that a request for a new frame may be intentionally fired off shortly before the last frame renders, skipped frames are only called out when they don't offset a preceding "ahead" message. 

"Caught up" means that a previous frame surplus has adjusted back to sync and probably doesn't reflect a real issue. However, "Skipped," especially when the skipped amount is more than one frame, almost certainly indicates an actual stutter.

--- 

The analyzer is currently all in one HTML file as a proof of concept, driving a no-op requestAnimationFrame callback. 

It will be refactored out into a separate class and used to instrument various animation demos, primarily for use in verifying the accuracy of Eideticker measurements.
