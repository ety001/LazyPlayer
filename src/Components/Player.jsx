import { useState, useEffect } from 'react';
import { Slider, Button, Space, Popover } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StepBackwardOutlined, StepForwardOutlined, UnorderedListOutlined } from '@ant-design/icons';

const Player = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="player-container">
      <Space align="center" size="middle">
        <StepBackwardOutlined />
        {isPlaying ? 
          <PauseCircleOutlined onClick={() => setIsPlaying(false)} /> : 
          <PlayCircleOutlined onClick={() => setIsPlaying(true)} />
        }
        <StepForwardOutlined />
        
        <div style={{ width: 400 }}>
          <Slider 
            value={progress}
            tooltip={{ formatter: value => formatTime(value) }}
            onChange={value => setProgress(value)}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{currentTime}</span>
            <span>{duration}</span>
          </div>
        </div>

        <Popover content={(
          <div style={{ width: 300 }}>
            {/* 播放列表内容 */}
          </div>
        )}>
          <UnorderedListOutlined />
        </Popover>
      </Space>
    </div>
  );
};

export default Player;