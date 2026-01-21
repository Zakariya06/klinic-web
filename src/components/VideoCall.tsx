import React from 'react';
import VideoCallWeb from './VideoCall.web';

interface VideoCallProps {
  channelName: string;
  token: string;
  uid: number;
  onEndCall: () => void;
  userRole: 'doctor' | 'patient';
}

const VideoCall: React.FC<VideoCallProps> = (props) => {
  // Since we're converting to React for web, we'll always use the web implementation
  return <VideoCallWeb {...props} />;
};

export default VideoCall;