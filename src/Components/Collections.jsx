import { useState, useEffect } from 'react';
import { Layout, List, Button, Modal, Form, Input, message } from 'antd';
import { FolderAddOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import axios from 'axios';
import FilePicker from './FilePicker';

const { Content, Sider } = Layout;

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const { data } = await axios.get('/api/collections');
      setCollections(data);
    } catch (err) {
      message.error('加载合集失败');
    }
  };

  const handleAdd = async (values) => {
    try {
      await axios.post('/api/collections', values);
      message.success('添加成功，开始扫描');
      loadCollections();
    } catch (err) {
      message.error(err.response?.data?.error || '操作失败');
    }
  };

  return (
    <Layout hasSider>
      <Sider width={300} style={{ background: '#fff', height: 'calc(100vh - 64px)' }}>
        <div style={{ padding: 16 }}>
          <Button
            type="primary"
            icon={<FolderAddOutlined />}
            onClick={() => {
              Modal.confirm({
                title: '新建音频合集',
                content: (
                  <Form form={form} layout="vertical">
                    <Form.Item name="name" label="合集名称" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item name="path" label="存储路径" rules={[{ required: true }]}>
                      <FilePicker defaultPath="/music" />
                    </Form.Item>
                  </Form>
                ),
                onOk: () => form.validateFields().then(handleAdd)
              });
            }}
          >
            新建合集
          </Button>
        </div>
        <List
          dataSource={collections}
          renderItem={(item) => (
            <List.Item
              actions={[
                <EditOutlined onClick={() => {/* 编辑逻辑 */}} />,
                <DeleteOutlined onClick={() => {/* 删除逻辑 */}} />
              ]}
            >
              {item.name}
            </List.Item>
          )}
        />
      </Sider>
      <Content>{/* 音乐列表区域 */}</Content>
    </Layout>
  );
}