import { useState } from 'react';
import { Layout } from 'antd';
import Collections from './Components/Collections';
import Player from './Components/Player';
import './App.css';

const { Header, Sider, Content, Footer } = Layout;

function App() {
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [playing, setPlaying] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} theme="light">
        <Collections 
          onSelect={setSelectedCollection}
          selectedKey={selectedCollection}
        />
      </Sider>

      <Layout>
        <Content style={{ padding: '24px' }}>
          {/* 这里后续显示选中合集的音乐列表 */}
          <div style={{ background: '#fff', padding: 24, minHeight: 360 }}>
            当前选中合集：{selectedCollection || '请选择合集'}
          </div>
        </Content>

        <Footer style={{ 
          position: 'sticky',
          bottom: 0,
          backgroundColor: '#f0f2f5',
          padding: '16px',
          borderTop: '1px solid #e8e8e8'
        }}>
          <Player 
            isPlaying={playing}
            onPlayPause={setPlaying}
          />
        </Footer>
      </Layout>
    </Layout>
  );
}

export default App
