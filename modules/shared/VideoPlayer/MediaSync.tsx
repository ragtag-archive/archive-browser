import React, { forwardRef, Ref, useImperativeHandle } from 'react';
import { useAnimationFrame } from '../hooks/useAnimationFrame';

export type MediaSyncState = {
  duration: number;
  timeSeconds: number;
  isPlaying: boolean;
  isSynced: boolean;
  isStalled: boolean;
};

export type MediaSyncProps = {
  children?: React.ReactNode;

  // Events
  onStateUpdate?: (state: MediaSyncState) => any;
  onPlay?: () => any;
  onPause?: () => any;
};

export type MediaSyncRef = {
  play: () => void;
  pause: () => void;
  seek: (timeSeconds: number) => void;
};

const MediaSync = forwardRef<MediaSyncRef, MediaSyncProps>((props, ref) => {
  // Create refs for all media elements
  const childCount = React.Children.count(props.children);
  const childRefs = Array(childCount)
    .fill(null)
    .map(() => React.useRef<HTMLMediaElement>(null));

  // Playback state
  const isPlaying = React.useRef(false);
  const syncStates = React.useRef(Array(childCount).fill(false));
  const lastVisibilityState = React.useRef<'visible' | 'hidden'>('visible');
  const lastTime = React.useRef(0);
  const lastTimeUpdate = React.useRef(Date.now());

  // Settings
  // Trigger sync at 15fps
  // i.e. media is considered out of sync if time difference > 1/15 second
  const syncThreshold = React.useRef(1 / 15);
  // Release sync at 60fps
  // i.e. media is considered in sync if time difference < 1/60 second
  const syncedThreshold = React.useRef(1 / 60);
  // If time difference is > jumpThreshold, seek instead of wait to sync
  const jumpThreshold = React.useRef(1);
  // If media isn't playing after stallThreshold milliseconds,
  // consider the playback to be stalled (e.g. from buffering)
  const stallThreshold = React.useRef(1000);

  // Media event handlers
  const handlePlayState = (event: 'play' | 'pause', index: number) => {
    // Ignore event if no state change
    // e.g. isPlaying is true, and event is play
    if (isPlaying.current === (event === 'play')) return;

    // Ignore event if media is syncing
    if (syncStates.current[index]) return;

    // Ignore event if visibilityState is hidden
    // and event comes from a video element. This is
    // because browsers like Chrome will pause a video
    // when the current tab is not visible.
    lastVisibilityState.current = document.visibilityState;
    if (
      // lastVisibilityState.current === "hidden" &&
      childRefs[index].current instanceof HTMLVideoElement
    )
      return;

    // Otherwise, update playback state
    isPlaying.current = event === 'play';
    console.log('[MediaSync]', event, 'from', index);

    // Also notify parent
    if (event === 'play') props.onPlay?.();
    else props.onPause?.();
  };

  // Supply functions for this component's refs
  useImperativeHandle(ref, () => ({
    play: () => {
      isPlaying.current = true;
      props.onPlay?.();
    },
    pause: () => {
      isPlaying.current = false;
      props.onPause?.();
    },
    seek: (timeSeconds: number) => {
      childRefs.forEach(({ current }) => (current.currentTime = timeSeconds));
    },
  }));

  useAnimationFrame(() => {
    // Skip if refs aren't ready yet
    if (childRefs.findIndex((ref) => !ref.current) > -1) return;

    // Get timestamps for each media element
    const timestamps = childRefs.map(
      ({ current }) => current?.currentTime || 0
    );

    // Assume the earliest time is the actual time
    // e.g. video buffers and audio is playing, take the video time
    // Except when the last visibility state is 'hidden', in which case
    // take the latest time (usually comes from the audio)
    const actualTime =
      lastVisibilityState.current === 'visible'
        ? Math.min(...timestamps)
        : Math.max(...timestamps);

    // Check if media is stalled
    const now = Date.now();
    if (actualTime !== lastTime.current) lastTimeUpdate.current = now;
    lastTime.current = actualTime;
    const isStalled =
      now - lastTimeUpdate.current > stallThreshold.current &&
      isPlaying.current;

    // Update sync states
    //   true -> out of sync, need to be paused if ahead or seeked if behind
    //   false -> in sync
    // Flip to true when media is ahead by syncThreshold
    // Only flip back to false when the timestamp === actualTime
    syncStates.current = timestamps.map(
      (ts, i) =>
        Math.abs(ts - actualTime) > syncedThreshold.current &&
        (syncStates[i] || Math.abs(ts - actualTime) > syncThreshold.current)
    );

    // Update media playback state
    childRefs.forEach(({ current }, index) => {
      if (isPlaying.current && syncStates.current[index]) {
        // Media is ahead, pause if not yet paused
        if (current.currentTime > actualTime && !current.paused)
          current.pause();

        // Seek media if time difference is greater than the jump threshold,
        // or if the media is behind actualTime
        if (
          current.currentTime - actualTime > jumpThreshold.current ||
          current.currentTime < actualTime
        ) {
          current.currentTime = actualTime;
          syncStates.current[index] = false;
        }
      } else {
        // Media is in sync, update playback state to reflect isPlaying
        if (isPlaying.current && current.paused) current.play();
        else if (!isPlaying.current && !current.paused) current.pause();

        // Update visibility state
        lastVisibilityState.current = document.visibilityState;
      }
    });

    // Update parent with new state
    props.onStateUpdate?.({
      duration: childRefs[0].current?.duration,
      timeSeconds: actualTime,
      isPlaying: isPlaying.current,
      isSynced: !syncStates.current.includes(true),
      isStalled,
    });
  }, [childRefs]);

  return (
    <>
      {React.Children.map(
        props.children,
        (child: React.ReactElement, idx: number) => {
          // If child element has an existing ref, link it
          // with the one from this component.
          // @ts-ignore
          if (child.ref) {
            // @ts-ignore
            child.ref.current = childRefs[idx].current;
          }
          return React.cloneElement(child, {
            ref: childRefs[idx],
            onPlay: () => handlePlayState('play', idx),
            onPause: () => handlePlayState('pause', idx),
          });
        }
      )}
    </>
  );
});

export default MediaSync;
