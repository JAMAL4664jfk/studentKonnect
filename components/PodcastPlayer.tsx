import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { Audio } from "expo-av";
import { Image } from "expo-image";
import Slider from "@react-native-community/slider";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import * as ScreenOrientation from "expo-screen-orientation";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface PodcastPlayerProps {
  episodeId: string;
  title: string;
  hostName: string;
  mediaType: "audio" | "video";
  mediaUrl: string;
  thumbnailUrl?: string;
  onClose: () => void;
  onPlaybackUpdate?: (position: number, duration: number) => void;
}

export function PodcastPlayer({
  episodeId,
  title,
  hostName,
  mediaType,
  mediaUrl,
  thumbnailUrl,
  onClose,
  onPlaybackUpdate,
}: PodcastPlayerProps) {
  const colors = useColors();
  const videoRef = useRef<Video>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (mediaType === "audio") {
      loadAudio();
    }
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [mediaUrl]);

  const loadAudio = async () => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: mediaUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      setIsPlaying(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading audio:", error);
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      setIsLoading(false);

      if (onPlaybackUpdate && status.durationMillis) {
        onPlaybackUpdate(status.positionMillis, status.durationMillis);
      }

      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    }
  };

  const togglePlayPause = async () => {
    if (mediaType === "video" && videoRef.current) {
      const status = await videoRef.current.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await videoRef.current.pauseAsync();
        } else {
          await videoRef.current.playAsync();
        }
      }
    } else if (mediaType === "audio" && sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
      }
    }
  };

  const seekTo = async (value: number) => {
    if (mediaType === "video" && videoRef.current) {
      await videoRef.current.setPositionAsync(value);
    } else if (mediaType === "audio" && sound) {
      await sound.setPositionAsync(value);
    }
  };

  const skipForward = async () => {
    const newPosition = Math.min(position + 10000, duration);
    await seekTo(newPosition);
  };

  const skipBackward = async () => {
    const newPosition = Math.max(position - 10000, 0);
    await seekTo(newPosition);
  };

  const toggleFullscreen = async () => {
    if (mediaType === "video") {
      if (!isFullscreen) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="chevron.down" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
              {title}
            </Text>
            <Text style={[styles.host, { color: colors.mutedForeground }]}>
              {hostName}
            </Text>
          </View>
          {mediaType === "video" && (
            <TouchableOpacity onPress={toggleFullscreen} style={styles.fullscreenButton}>
              <IconSymbol
                name={isFullscreen ? "arrow.down.right.and.arrow.up.left" : "arrow.up.left.and.arrow.down.right"}
                size={20}
                color={colors.foreground}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Media Display */}
        <View style={styles.mediaContainer}>
          {mediaType === "video" ? (
            <Video
              ref={videoRef}
              source={{ uri: mediaUrl }}
              style={styles.video}
              useNativeControls={false}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            />
          ) : (
            <View style={styles.audioContainer}>
              {thumbnailUrl ? (
                <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} contentFit="cover" />
              ) : (
                <View style={[styles.placeholderThumbnail, { backgroundColor: colors.surface }]}>
                  <IconSymbol name="music.note" size={80} color={colors.mutedForeground} />
                </View>
              )}
            </View>
          )}

          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Text style={[styles.timeText, { color: colors.mutedForeground }]}>
              {formatTime(position)}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onSlidingComplete={seekTo}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <Text style={[styles.timeText, { color: colors.mutedForeground }]}>
              {formatTime(duration)}
            </Text>
          </View>

          {/* Playback Controls */}
          <View style={styles.playbackControls}>
            <TouchableOpacity onPress={skipBackward} style={styles.controlButton}>
              <IconSymbol name="gobackward.10" size={32} color={colors.foreground} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={togglePlayPause}
              style={[styles.playButton, { backgroundColor: colors.primary }]}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <IconSymbol
                  name={isPlaying ? "pause.fill" : "play.fill"}
                  size={36}
                  color={colors.primaryForeground}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={skipForward} style={styles.controlButton}>
              <IconSymbol name="goforward.10" size={32} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  host: {
    fontSize: 14,
    marginTop: 2,
  },
  fullscreenButton: {
    padding: 8,
  },
  mediaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  audioContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnail: {
    width: SCREEN_WIDTH - 64,
    height: SCREEN_WIDTH - 64,
    borderRadius: 16,
  },
  placeholderThumbnail: {
    width: SCREEN_WIDTH - 64,
    height: SCREEN_WIDTH - 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  controlsContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  timeText: {
    fontSize: 12,
    width: 45,
    textAlign: "center",
  },
  slider: {
    flex: 1,
    marginHorizontal: 8,
  },
  playbackControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
  },
  controlButton: {
    padding: 12,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});
