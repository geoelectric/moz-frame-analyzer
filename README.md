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

The analyzer is currently all in one HTML file as a proof of concept, driving a no-op requestAnimationFrame callback. 

It will be refactored out into a separate class and used to instrument various animation demos, primarily for use in verifying the accuracy of Eideticker measurements.
