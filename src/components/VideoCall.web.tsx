import React, { useState, useEffect, useRef } from "react";
import {
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhone,
  FaUser,
  FaExclamationTriangle, 
  FaSync,
  FaCamera,
} from "react-icons/fa"; 

// AgoraRTC will be loaded dynamically in useEffect
let AgoraRTC: any = null;

interface VideoCallProps {
  channelName: string;
  token: string;
  uid: number;
  onEndCall: () => void;
  userRole: "doctor" | "patient";
}

const VideoCall: React.FC<VideoCallProps> = ({
  channelName,
  token,
  uid,
  onEndCall,
  userRole,
}) => {
  const [client, setClient] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [localVideoTrack, setLocalVideoTrack] = useState<any>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<any>(null);
  const [remoteUsers, setRemoteUsers] = useState<
    Map<any, { videoTrack?: any; audioTrack?: any }>
  >(new Map());
  const [isLocalVideoMuted, setIsLocalVideoMuted] = useState(false);
  const [isLocalAudioMuted, setIsLocalAudioMuted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "waiting" | "connected" | "disconnected"
  >("connecting");
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(
    null
  );
  const [isAgoraLoaded, setIsAgoraLoaded] = useState(false);

  const localVideoRef = useRef<HTMLDivElement>(null);

  // Agora App ID
  const appId =
    import.meta.env?.VITE_AGORA_APP_ID ||
    process.env.REACT_APP_AGORA_APP_ID ||
    "your_agora_app_id";

  useEffect(() => {
    console.log("VideoCall component mounted with props:", {
      channelName,
      token: token ? "Token provided" : "No token",
      uid,
      userRole,
      appId:
        appId !== "your_agora_app_id"
          ? "App ID configured"
          : "App ID not configured",
    });

    if (appId === "your_agora_app_id") {
      setInitializationError(
        "Agora App ID is not configured. Please set VITE_AGORA_APP_ID or REACT_APP_AGORA_APP_ID in your environment variables."
      );
      return;
    }

    if (!token) {
      setInitializationError("No token provided for video call");
      return;
    }

    // Load AgoraRTC dynamically
    const loadAgoraSDK = async () => {
      try {
        const module = await import("agora-rtc-sdk-ng");
        AgoraRTC = module.default;
        console.log("Agora SDK loaded successfully");
        initializeAgoraClient();
      } catch (error) {
        console.error("Failed to load Agora SDK:", error);
        setInitializationError(
          "Failed to load video call SDK. Please refresh the page and try again."
        );
      }
    };

    loadAgoraSDK();

    return () => {
      cleanup();
    };
  }, []);

  // Effect to handle remote video playback when remote users change
  useEffect(() => {
    if (remoteUsers.size > 0 && client && isJoined) {
      console.log("Remote users updated, attempting to play videos...");

      // Try to play all remote videos
      remoteUsers.forEach((userData, uid) => {
        if (
          userData.videoTrack &&
          typeof userData.videoTrack.play === "function"
        ) {
          setTimeout(() => {
            // Check if component is still mounted
            if (!client || !isJoined) return;

            const remoteVideoContainer = document.getElementById(
              `remote-video-${uid}`
            );
            if (remoteVideoContainer && userData.videoTrack) {
              console.log(`Attempting to play video for user ${uid}`);
              try {
                const playPromise =
                  userData.videoTrack.play(remoteVideoContainer);
                if (playPromise && typeof playPromise.then === "function") {
                  playPromise
                    .then(() => {
                      console.log(`Successfully playing video for user ${uid}`);
                    })
                    .catch((error: any) => {
                      console.error(
                        `Error playing video for user ${uid}:`,
                        error
                      );
                    });
                }
              } catch (error) {
                console.error(
                  `Exception playing video for user ${uid}:`,
                  error
                );
              }
            }
          }, 300);
        }
      });
    }
  }, [remoteUsers, client, isJoined]);

  // Effect to periodically check for missed subscriptions
  useEffect(() => {
    if (!client || !isJoined) return;

    const checkForMissedTracks = () => {
      if (client && client.remoteUsers) {
        console.log("Checking for missed tracks...");
        console.log(
          "Available remote users from client:",
          client.remoteUsers.map((u: any) => ({
            uid: u.uid,
            hasVideo: u.hasVideo,
            hasAudio: u.hasAudio,
            videoTrack: !!u.videoTrack,
            audioTrack: !!u.audioTrack,
          }))
        );

        client.remoteUsers.forEach(async (remoteUser: any) => {
          const currentUserData = remoteUsers.get(remoteUser.uid);

          // Check for video track
          if (
            remoteUser.hasVideo &&
            (!currentUserData || !currentUserData.videoTrack)
          ) {
            console.log(
              `Found missed video track for user ${remoteUser.uid}, attempting to subscribe...`
            );
            try {
              await client.subscribe(remoteUser, "video");
              await handleUserPublished(remoteUser, "video");
            } catch (error) {
              console.error(
                `Failed to subscribe to missed video track for user ${remoteUser.uid}:`,
                error
              );
            }
          }

          // Check for audio track
          if (
            remoteUser.hasAudio &&
            (!currentUserData || !currentUserData.audioTrack)
          ) {
            console.log(
              `Found missed audio track for user ${remoteUser.uid}, attempting to subscribe...`
            );
            try {
              await client.subscribe(remoteUser, "audio");
              await handleUserPublished(remoteUser, "audio");
            } catch (error) {
              console.error(
                `Failed to subscribe to missed audio track for user ${remoteUser.uid}:`,
                error
              );
            }
          }
        });
      }
    };

    // Check immediately and then every 3 seconds
    const interval = setInterval(checkForMissedTracks, 3000);
    checkForMissedTracks();

    return () => clearInterval(interval);
  }, [client, isJoined, remoteUsers]);

  const initializeAgoraClient = async () => {
    try {
      console.log("Initializing Agora Web SDK...");

      if (!AgoraRTC) {
        throw new Error("Agora SDK not available");
      }

      // Create Agora client with compatibility settings
      const agoraClient = AgoraRTC.createClient({
        mode: "rtc",
        codec: "h264", // Use h264 for better mobile compatibility
      });

      // Set up event handlers
      agoraClient.on("user-published", handleUserPublished);
      agoraClient.on("user-unpublished", handleUserUnpublished);
      agoraClient.on("user-left", handleUserLeft);
      agoraClient.on("connection-state-changed", handleConnectionStateChanged);
      agoraClient.on("user-joined", async (user: any) => {
        console.log("User joined:", user.uid);
        // Try to subscribe to both video and audio immediately
        setTimeout(async () => {
          try {
            console.log(
              "Attempting to subscribe to all tracks for user:",
              user.uid
            );
            const remoteUsers = agoraClient.remoteUsers;
            const remoteUser = remoteUsers.find((u: any) => u.uid === user.uid);
            if (remoteUser) {
              if (remoteUser.hasVideo && remoteUser.videoTrack) {
                console.log("Found existing video track for user:", user.uid);
                await handleUserPublished(remoteUser, "video");
              }
              if (remoteUser.hasAudio && remoteUser.audioTrack) {
                console.log("Found existing audio track for user:", user.uid);
                await handleUserPublished(remoteUser, "audio");
              }
            }
          } catch (error) {
            console.error("Error in delayed subscription:", error);
          }
        }, 1000);
      });

      // Additional event handlers for better debugging
      agoraClient.on("stream-type-changed", (uid: any, streamType: any) => {
        console.log("Stream type changed:", uid, streamType);
      });

      agoraClient.on("network-quality", (stats: any) => {
        console.log("Network quality:", stats);
      });

      setClient(agoraClient);
      setIsAgoraLoaded(true);

      // Request permissions and create tracks
      await requestPermissions(agoraClient);
    } catch (error) {
      console.error("Error initializing Agora client:", error);
      setInitializationError(`Failed to initialize video call: ${error}`);
    }
  };

  const requestPermissions = async (agoraClient: any) => {
    try {
      console.log("Requesting camera and microphone permissions...");
      setConnectionStatus("connecting");

      // Create local tracks
      const [videoTrack, audioTrack] = await Promise.all([
        AgoraRTC.createCameraVideoTrack({
          encoderConfig: {
            width: 640,
            height: 480,
            frameRate: 15,
            bitrateMax: 1000,
            bitrateMin: 300,
          },
        }),
        AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: {
            sampleRate: 48000,
            stereo: false,
            bitrate: 128,
          },
        }),
      ]);

      setLocalVideoTrack(videoTrack);
      setLocalAudioTrack(audioTrack);
      setPermissionsGranted(true);

      // Play local video
      setTimeout(() => {
        if (localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }
      }, 100);

      // Join channel
      await joinChannel(agoraClient, videoTrack, audioTrack);
    } catch (error) {
      console.error("Error requesting permissions:", error);
      setInitializationError(
        "Failed to access camera and microphone. Please ensure permissions are granted."
      );
    }
  };

  const joinChannel = async (
    agoraClient: any,
    videoTrack: any,
    audioTrack: any
  ) => {
    try {
      console.log("Joining channel:", channelName);

      // Join the channel
      await agoraClient.join(appId, channelName, token, uid);
      console.log("Successfully joined channel");

      // Publish local tracks
      await agoraClient.publish([videoTrack, audioTrack]);
      console.log("Published local tracks");

      setIsJoined(true);
      setConnectionStatus("waiting");
    } catch (error) {
      console.error("Error joining channel:", error);
      setInitializationError(`Failed to join video call: ${error}`);
    }
  };

  const handleUserPublished = async (
    user: any,
    mediaType: "video" | "audio"
  ) => {
    try {
      console.log("User published event received:", {
        uid: user.uid,
        mediaType: mediaType,
        hasVideoTrack: !!user.videoTrack,
        hasAudioTrack: !!user.audioTrack,
      });

      // Subscribe to the user with error handling
      try {
        await client?.subscribe(user, mediaType);
        console.log(
          `Successfully subscribed to ${mediaType} from user ${user.uid}`
        );
      } catch (subscribeError) {
        console.error(
          `Failed to subscribe to ${mediaType} from user ${user.uid}:`,
          subscribeError
        );
        return;
      }

      setRemoteUsers((prev) => {
        const newUsers = new Map(prev);
        const userData = newUsers.get(user.uid) || {};

        if (mediaType === "video") {
          userData.videoTrack = user.videoTrack;
          console.log("Remote video track assigned:", {
            uid: user.uid,
            track: user.videoTrack,
            trackReady: user.videoTrack ? user.videoTrack.isPlaying : false,
          });

          // Try multiple times to play the video with increasing delays
          const playRemoteVideo = (attempt = 1) => {
            // Check if component is still mounted and client is still active
            if (!client || !isJoined) {
              console.log(
                "Component unmounted or client disconnected, stopping video playback attempts"
              );
              return;
            }

            const remoteVideoContainer = document.getElementById(
              `remote-video-${user.uid}`
            );
            console.log(`Video playback attempt ${attempt}:`, {
              container: !!remoteVideoContainer,
              track: !!user.videoTrack,
              containerId: `remote-video-${user.uid}`,
            });

            if (
              remoteVideoContainer &&
              user.videoTrack &&
              typeof user.videoTrack.play === "function"
            ) {
              console.log(`Playing remote video track (attempt ${attempt})...`);
              try {
                const playPromise = user.videoTrack.play(remoteVideoContainer);
                if (playPromise && typeof playPromise.then === "function") {
                  playPromise
                    .then(() => {
                      console.log("✅ Remote video playing successfully");
                    })
                    .catch((error: any) => {
                      console.error(
                        `❌ Error playing remote video (attempt ${attempt}):`,
                        error
                      );
                      if (attempt < 5 && client && isJoined) {
                        setTimeout(
                          () => playRemoteVideo(attempt + 1),
                          500 * attempt
                        );
                      }
                    });
                } else {
                  console.log(
                    "✅ Remote video play method executed (no promise returned)"
                  );
                }
              } catch (error) {
                console.error(
                  `❌ Exception during video play (attempt ${attempt}):`,
                  error
                );
                if (attempt < 5 && client && isJoined) {
                  setTimeout(() => playRemoteVideo(attempt + 1), 500 * attempt);
                }
              }
            } else {
              console.error(
                `❌ Missing requirements for video playback (attempt ${attempt})`,
                {
                  hasContainer: !!remoteVideoContainer,
                  hasTrack: !!user.videoTrack,
                  hasPlayMethod:
                    user.videoTrack &&
                    typeof user.videoTrack.play === "function",
                  containerElement: remoteVideoContainer,
                }
              );
              if (attempt < 5 && client && isJoined) {
                setTimeout(() => playRemoteVideo(attempt + 1), 200 * attempt);
              }
            }
          };

          // Start playing video with initial delay
          setTimeout(() => playRemoteVideo(), 100);
        } else if (mediaType === "audio") {
          userData.audioTrack = user.audioTrack;
          console.log("Remote audio track assigned:", {
            uid: user.uid,
            track: user.audioTrack,
          });

          // Play remote audio
          if (user.audioTrack) {
            try {
              user.audioTrack.play();
              console.log("✅ Remote audio playing successfully");
            } catch (audioError) {
              console.error("❌ Error playing remote audio:", audioError);
            }
          }
        }

        newUsers.set(user.uid, userData);
        console.log("Updated remote users:", Array.from(newUsers.entries()));
        return newUsers;
      });

      if (mediaType === "video") {
        setConnectionStatus("connected");
      }
    } catch (error) {
      console.error("Error in handleUserPublished:", error);
    }
  };

  const handleUserUnpublished = (user: any, mediaType: "video" | "audio") => {
    console.log("User unpublished:", user.uid, mediaType);

    setRemoteUsers((prev) => {
      const newUsers = new Map(prev);
      const userData = newUsers.get(user.uid) || {};

      if (mediaType === "video") {
        userData.videoTrack = undefined;
      } else if (mediaType === "audio") {
        userData.audioTrack = undefined;
      }

      newUsers.set(user.uid, userData);
      return newUsers;
    });
  };

  const handleUserLeft = (user: any) => {
    console.log("User left:", user.uid);
    setRemoteUsers((prev) => {
      const newUsers = new Map(prev);
      newUsers.delete(user.uid);
      return newUsers;
    });

    if (remoteUsers.size === 0) {
      setConnectionStatus("waiting");
    }
  };

  const handleConnectionStateChanged = (curState: string, revState: string) => {
    console.log("Connection state changed:", curState, revState);
    if (curState === "DISCONNECTED" || curState === "FAILED") {
      setConnectionStatus("disconnected");
    }
  };

  const toggleLocalVideo = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!isLocalVideoMuted);
      setIsLocalVideoMuted(!isLocalVideoMuted);
    }
  };

  const toggleLocalAudio = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!isLocalAudioMuted);
      setIsLocalAudioMuted(!isLocalAudioMuted);
    }
  };

  const cleanup = async () => {
    try {
      console.log("Cleaning up video call...");

      // Clear remote users first to prevent further playback attempts
      setRemoteUsers(new Map());

      // Stop local tracks
      if (localVideoTrack) {
        try {
          localVideoTrack.stop();
          localVideoTrack.close();
        } catch (error) {
          console.error("Error stopping local video track:", error);
        }
      }
      if (localAudioTrack) {
        try {
          localAudioTrack.stop();
          localAudioTrack.close();
        } catch (error) {
          console.error("Error stopping local audio track:", error);
        }
      }

      // Set disconnected state first to prevent further operations
      setIsJoined(false);
      setConnectionStatus("disconnected");

      // Leave channel
      if (client && isJoined) {
        try {
          await client.leave();
        } catch (error) {
          console.error("Error leaving channel:", error);
        }
      }

      console.log("✅ Video call cleanup completed");
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  };

  const endCall = async () => {
    try {
      console.log("End call button pressed");
      await cleanup();
    } catch (error) {
      console.error("Error during end call cleanup:", error);
    } finally {
      // Always call onEndCall to ensure the modal closes
      onEndCall();
    }
  };

  const renderLocalVideo = () => (
    <div className="local-video-container">
      <div ref={localVideoRef} className="local-video" />
      {isLocalVideoMuted && (
        <div className="local-video-muted-overlay">
          <div className="muted-indicator">
            <FaVideoSlash size={24} color="#fff" />
            <div className="muted-text">Camera Off</div>
          </div>
        </div>
      )}
    </div>
  );

  const renderRemoteVideo = () => {
    const remoteUserArray = Array.from(remoteUsers.entries());

    console.log("Rendering remote video, users:", remoteUserArray.length);

    if (remoteUserArray.length === 0) {
      return (
        <div className="waiting-container">
          <div className="waiting-content">
            <FaUser size={60} color="#666" />
            <div className="waiting-text">
              Waiting for {userRole === "doctor" ? "patient" : "doctor"} to
              join...
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        {remoteUserArray.map(([uid, userData]) => {
          console.log(
            `Rendering remote video container for user ${uid}:`,
            userData
          );
          return (
            <div
              key={uid}
              id={`remote-video-${uid}`}
              className="remote-video-container"
            />
          );
        })}
        {/* Show connection indicator when someone is connected */}
        {remoteUserArray.length > 0 && (
          <div className="connected-indicator">
            {userRole === "doctor" ? "Patient" : "Doctor"} connected
          </div>
        )}
      </>
    );
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connecting":
        return "#ffa500";
      case "waiting":
        return "#ffff00";
      case "connected":
        return "#00ff00";
      case "disconnected":
        return "#ff0000";
      default:
        return "#666";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connecting":
        return "Connecting...";
      case "waiting":
        return "Waiting for other participant";
      case "connected":
        return "Connected";
      case "disconnected":
        return "Disconnected";
      default:
        return "Unknown";
    }
  };

  // Show error screen if there's an initialization error
  if (initializationError) {
    return (
      <div className="error-container">
        <FaExclamationTriangle size={60} color="#ff4444" />
        <div className="error-message">{initializationError}</div>
        <button
          className="retry-button"
          onClick={() => {
            window.location.reload();
          }}
        >
          <span className="button-text">Retry</span>
        </button>
        <button className="cancel-button" onClick={onEndCall}>
          <span className="button-text">Cancel</span>
        </button>
      </div>
    );
  }

  // Show loading screen while SDK is loading
  if (!isAgoraLoaded) {
    return (
      <div className="loading-container">
        <FaCamera size={60} color="#ccc" />
        <div className="loading-title">Loading video call...</div>
        <div className="loading-subtitle">
          Please wait while we initialize the video call system
        </div>
      </div>
    );
  }

  // Show permissions screen if permissions not granted
  if (!permissionsGranted) {
    return (
      <div className="permissions-container">
        <FaCamera size={60} color="#ccc" />
        <div className="permissions-title">Setting up video call...</div>
        <div className="permissions-subtitle">
          Please allow camera and microphone access when prompted
        </div>
      </div>
    );
  }

  return (
    <div className="video-call-container">
      {/* Remote video as full screen background */}
      <div className="remote-video-background">{renderRemoteVideo()}</div>

      {/* Local video overlay */}
      {renderLocalVideo()}

      {/* Control buttons */}
      <div className="control-buttons">
        <button
          className={`control-button ${isLocalAudioMuted ? "muted" : ""}`}
          onClick={toggleLocalAudio}
        >
          {isLocalAudioMuted ? (
            <FaMicrophoneSlash size={20} color="#fff" />
          ) : (
            <FaMicrophone size={20} color="#fff" />
          )}
        </button>

        <button className="control-button end-call-button" onClick={endCall}>
          <FaPhone size={20} color="#fff" />
        </button>

        <button
          className={`control-button ${isLocalVideoMuted ? "muted" : ""}`}
          onClick={toggleLocalVideo}
        >
          {isLocalVideoMuted ? (
            <FaVideoSlash size={20} color="#fff" />
          ) : (
            <FaVideo size={20} color="#fff" />
          )}
        </button>

        {/* Manual retry button for remote video */}
        {remoteUsers.size > 0 && (
          <button
            className="control-button retry-video-button"
            onClick={() => {
              console.log("Manual retry for remote video...");
              if (!client || !isJoined) return;

              remoteUsers.forEach((userData, uid) => {
                if (
                  userData.videoTrack &&
                  typeof userData.videoTrack.play === "function"
                ) {
                  const container = document.getElementById(
                    `remote-video-${uid}`
                  );
                  if (container) {
                    try {
                      const playPromise = userData.videoTrack.play(container);
                      if (
                        playPromise &&
                        typeof playPromise.then === "function"
                      ) {
                        playPromise.catch((error: any) => {
                          console.error("Manual retry failed:", error);
                        });
                      }
                    } catch (error) {
                      console.error("Manual retry exception:", error);
                    }
                  }
                }
              });
            }}
          >
            <FaSync size={20} color="#fff" />
          </button>
        )}
      </div>

      {/* Connection status */}
      <div className="connection-status">
        <div
          className="status-dot"
          style={{ backgroundColor: getStatusColor() }}
        />
        <span className="status-text">{getStatusText()}</span>
      </div>

      {/* User role indicator */}
      <div className="user-role-indicator">
        <span className="role-text">
          {userRole === "doctor" ? "Doctor" : "Patient"}
        </span>
      </div>
    </div>
  );
};

export default VideoCall;
