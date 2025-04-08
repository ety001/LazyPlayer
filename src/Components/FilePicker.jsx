import { useState, useEffect } from 'react';
import { Tree, Input } from 'antd';
import axios from 'axios';

const { DirectoryTree } = Tree;

export default function FilePicker({ value, onChange, defaultPath }) {
  const [treeData, setTreeData] = useState([]);
  const [currentPath, setCurrentPath] = useState(defaultPath || '/music');

  useEffect(() => {
    const loadDirectory = async (path) => {
      try {
        const { data } = await axios.get('/api/directories', { params: { path } });
        return data.entries.map(item => ({
          title: item.name,
          key: item.path,
          isLeaf: !item.isDirectory,
          children: item.isDirectory ? [] : null
        }));
      } catch (err) {
        console.error('加载目录失败:', err);
        return [];
      }
    };

    const buildTree = async (path) => {
      const nodes = await loadDirectory(path);
      setTreeData([{ 
        title: path,
        key: path,
        children: nodes,
        isLeaf: false
      }]);
      onChange(path);
    };

    buildTree(currentPath);
  }, []);

  const onExpand = async (keys, { node }) => {
    if (node.children?.length === 0) {
      const children = await loadDirectory(node.key);
      node.children = children;
      setTreeData([...treeData]);
    }
  };

  return (
    <div className="file-picker">
      <Input value={value} readOnly />
      <DirectoryTree
        treeData={treeData}
        onExpand={onExpand}
        onSelect={(keys, { node }) => {
          if (!node.isLeaf) {
            setCurrentPath(node.key);
            onChange(node.key);
          }
        }}
      />
    </div>
  );
}